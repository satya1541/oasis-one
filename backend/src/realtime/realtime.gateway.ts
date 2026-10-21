import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from './realtime.service';
import { hashToken } from '../common/utils/crypto.util';

@WebSocketGateway({
  namespace: '/ws',
  path: '/socket.io',
  cors: {
    origin: (origin, callback) => {
      // In dev allow frontend or no origin (same server / test harness)
      callback(null, true);
    },
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly userSocketMap = new Map<string, Set<string>>();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.setServer(server);
    this.logger.log('Socket.IO Gateway initialized on namespace /ws');
  }

  async handleConnection(client: Socket) {
    try {
      // 1. Origin verification
      const origin = client.handshake.headers.origin;
      const allowedOrigins = this.configService.get<string[]>('wsAllowedOrigins') || [
        'https://oasisodisha.in',
        'https://www.oasisodisha.in',
        'http://localhost:7200',
        'http://localhost:3000',
      ];
      
      const isAllowedOrigin = !origin ||
        allowedOrigins.some(a => origin.startsWith(a)) ||
        origin.includes('oasisodisha.in') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (!isAllowedOrigin) {
        this.logger.warn(`WS connection rejected: unauthorized origin ${origin}`);
        client.disconnect(true);
        return;
      }

      // 2. Cookie or token extraction
      let sessionToken: string | null = null;
      const rawCookie = client.handshake.headers.cookie;
      if (rawCookie) {
        const match = rawCookie.match(/(?:^|;\s*)oasis_sid=([^;]+)/);
        if (match && match[1]) {
          sessionToken = decodeURIComponent(match[1]);
        }
      }
      if (!sessionToken && client.handshake.auth?.token) {
        sessionToken = client.handshake.auth.token;
      }
      if (!sessionToken && typeof client.handshake.query?.token === 'string') {
        sessionToken = client.handshake.query.token;
      }

      if (!sessionToken) {
        this.logger.debug('WS connection rejected: session token missing');
        client.disconnect(true);
        return;
      }

      const tokenHash = hashToken(sessionToken);

      const session = await this.prisma.session.findUnique({
        where: { tokenHash },
        include: {
          user: {
            include: {
              applications: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!session || session.expiresAt <= new Date()) {
        this.logger.debug('WS connection rejected: invalid/expired session');
        client.disconnect(true);
        return;
      }

      const user = session.user;

      // Check max 5 sockets per user
      const userSockets = this.userSocketMap.get(user.id) || new Set<string>();
      if (userSockets.size >= 5) {
        // Disconnect oldest socket
        const oldestSocketId = userSockets.values().next().value;
        if (oldestSocketId) {
          const oldSocket = this.server.sockets.sockets.get(oldestSocketId);
          oldSocket?.disconnect(true);
          userSockets.delete(oldestSocketId);
        }
      }
      userSockets.add(client.id);
      this.userSocketMap.set(user.id, userSockets);

      client.data.userId = user.id;
      client.data.user = user;
      client.data.mfaVerified = session.mfaVerified;

      // Join auto rooms
      client.join(`user:${user.id}`);
      if (user.primaryRole) {
        client.join(`role:${user.primaryRole}`);
      }

      // Locked applicant also joins their own application room if exists
      const latestApp = user.applications?.[0];
      if (latestApp) {
        client.join(`application:${latestApp.id}`);
      }

      // Active members join 'members'
      if (user.accountStatus === 'active') {
        client.join('members');
      }

      // MFA-verified admins join 'admins'
      if (user.adminLevel && session.mfaVerified) {
        client.join('admins');
      }

      this.logger.log(`WS Client connected: ${client.id} (user: ${user.email}, role: ${user.primaryRole || 'none'}, status: ${user.accountStatus})`);
    } catch (err: any) {
      this.logger.error(`WS handshake error: ${err.message}`, err.stack);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      const userSockets = this.userSocketMap.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSocketMap.delete(userId);
        }
      }
    }
    this.logger.log(`WS Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room.join')
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room?: string },
  ) {
    if (!data?.room || typeof data.room !== 'string') {
      return { ok: false, error: 'Invalid room' };
    }

    const room = data.room;
    const user = client.data?.user;
    if (!user) {
      return { ok: false, error: 'Unauthenticated' };
    }

    // Authorization checks per room type
    if (room.startsWith('post:') || room.startsWith('event:')) {
      if (user.accountStatus !== 'active') {
        return { ok: false, error: 'Active member status required' };
      }
      client.join(room);
      return { ok: true };
    }

    if (room.startsWith('application:')) {
      const appId = room.split(':')[1];
      const isOwner = user.applications?.some((a: any) => a.id === appId);
      const isAdmin = !!user.adminLevel && client.data?.mfaVerified;

      if (!isOwner && !isAdmin) {
        return { ok: false, error: 'Unauthorized to view application room' };
      }
      client.join(room);
      return { ok: true };
    }

    return { ok: false, error: 'Unauthorized room' };
  }

  @SubscribeMessage('room.leave')
  handleRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room?: string },
  ) {
    if (data?.room && typeof data.room === 'string') {
      client.leave(data.room);
    }
    return { ok: true };
  }
}
