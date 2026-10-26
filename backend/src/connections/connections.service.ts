import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ConnectionStatus, UserRole } from '@prisma/client';

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async getMentors(params: {
    expertise?: string;
    sector?: string;
    location?: string;
    page?: number;
    pageSize?: number;
    viewerId: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    // Check blocks
    const blocks = await this.prisma.memberBlock.findMany({
      where: {
        OR: [{ blockerId: params.viewerId }, { blockedId: params.viewerId }],
      },
    });
    const excluded = new Set(blocks.map((b) => (b.blockerId === params.viewerId ? b.blockedId : b.blockerId)));
    if (params.viewerId) {
      excluded.add(params.viewerId);
    }

    const where: any = {
      mentorAvailability: 'active',
      user: {
        primaryRole: UserRole.mentor,
        accountStatus: 'active',
        adminLevel: null,
        id: { notIn: Array.from(excluded) },
      },
    };

    if (params.location) {
      where.OR = [
        { city: { contains: params.location } },
        { state: { contains: params.location } },
      ];
    }

    if (params.expertise || params.sector) {
      where.tags = {
        some: {
          tag: {
            name: params.expertise || params.sector,
            status: 'active',
          },
        },
      };
    }

    const [total, profiles] = await Promise.all([
      this.prisma.profile.count({ where }),
      this.prisma.profile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { mentorVerified: 'desc' },
        include: {
          user: { select: { id: true, primaryRole: true } },
          tags: { include: { tag: true } },
        },
      }),
    ]);

    const items = profiles.map((p) => ({
      id: p.userId,
      name: p.name,
      headline: p.headline,
      bio: p.bio,
      city: p.city,
      state: p.state,
      profilePhotoUrl: p.profilePhotoUrl,
      mentorVerified: p.mentorVerified,
      mentorAvailability: p.mentorAvailability,
      preferredContactMethod: p.preferredContactMethod,
      tags: p.tags.map((t) => t.tag.name),
    }));

    return { items, total, page, pageSize };
  }

  async sendRequest(senderId: string, recipientId: string, message?: string) {
    if (senderId === recipientId) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'You cannot connect with yourself' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // 1. Check rolling 24h quota: max 10 requests per sender
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequestsCount = await this.prisma.connectionRequest.count({
      where: {
        senderId,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (recentRequestsCount >= 10) {
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message: 'Connection request limit reached (max 10 requests per 24 hours)',
          retryAfterSeconds: 3600,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check blocks
    const blocked = await this.prisma.memberBlock.findFirst({
      where: {
        OR: [
          { blockerId: senderId, blockedId: recipientId },
          { blockerId: recipientId, blockedId: senderId },
        ],
      },
    });
    if (blocked) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Unable to send request to this member' }, HttpStatus.FORBIDDEN);
    }

    // 3. Verify recipient is an active member
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
      include: { profile: true },
    });

    if (!recipient || recipient.accountStatus !== 'active') {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Recipient is not active' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (recipient.primaryRole === 'mentor' && recipient.profile?.mentorAvailability === 'paused') {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'This mentor has temporarily paused accepting new connections' },
        HttpStatus.FORBIDDEN,
      );
    }

    // 4. Check duplicate pending or existing accepted request
    const existing = await this.prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId, recipientId, status: { in: ['pending', 'accepted'] } },
          { senderId: recipientId, recipientId: senderId, status: { in: ['pending', 'accepted'] } },
        ],
      },
    });
    if (existing) {
      if (existing.status === 'accepted') {
        throw new HttpException(
          { code: 'CONFLICT', message: 'You are already connected with this member' },
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        { code: 'CONFLICT', message: 'A pending connection request already exists between you and this member' },
        HttpStatus.CONFLICT,
      );
    }

    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const connection = await this.prisma.connectionRequest.create({
      data: {
        senderId,
        recipientId,
        message: message?.trim() || null,
        status: ConnectionStatus.pending,
        expiresAt,
      },
    });

    // In-app notification to recipient
    const notifTitle =
      recipient.primaryRole === 'mentor'
        ? 'New Mentorship Connection Request'
        : 'New Connection Request';

    const notif = await this.prisma.notification.create({
      data: {
        type: 'connection_request',
        title: notifTitle,
        body: `You received a new connection request.`,
        metadata: { connectionId: connection.id, senderId },
      },
    });

    await this.prisma.notificationDelivery.create({
      data: {
        notificationId: notif.id,
        recipientId,
      },
    });

    this.realtime.emitToUser(recipientId, 'connection.updated', {
      connectionId: connection.id,
      status: 'pending',
    });
    this.realtime.emitToUser(recipientId, 'notification.new', {
      id: notif.id,
      type: 'connection_request',
    });

    return connection;
  }

  async getConnections(userId: string, box = 'active') {
    let where: any = {};
    if (box === 'incoming') {
      where = { recipientId: userId, status: 'pending', expiresAt: { gt: new Date() } };
    } else if (box === 'outgoing') {
      where = { senderId: userId, status: 'pending', expiresAt: { gt: new Date() } };
    } else {
      // active
      where = {
        OR: [{ senderId: userId }, { recipientId: userId }],
        status: 'accepted',
      };
    }

    const connections = await this.prisma.connectionRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phone: true,
            primaryRole: true,
            profile: {
              select: {
                name: true,
                headline: true,
                profilePhotoUrl: true,
                city: true,
                contactPreferences: true,
              },
            },
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            phone: true,
            primaryRole: true,
            profile: {
              select: {
                name: true,
                headline: true,
                profilePhotoUrl: true,
                city: true,
                contactPreferences: true,
              },
            },
          },
        },
      },
    });

    return connections.map((c) => {
      const otherUser = c.senderId === userId ? c.recipient : c.sender;
      const isAccepted = c.status === 'accepted';
      const prefs = (otherUser.profile?.contactPreferences as any) || {};
      const shareEmail = isAccepted && prefs.shareEmailOnConnect !== false;
      const sharePhone = isAccepted && !!prefs.sharePhoneOnConnect;

      return {
        id: c.id,
        status: c.status,
        message: c.message,
        createdAt: c.createdAt,
        expiresAt: c.expiresAt,
        senderId: c.senderId,
        recipientId: c.recipientId,
        otherUser: {
          id: otherUser.id,
          name: otherUser.profile?.name || 'Member',
          headline: otherUser.profile?.headline,
          avatarUrl: otherUser.profile?.profilePhotoUrl,
          city: otherUser.profile?.city,
          role: otherUser.primaryRole,
          email: shareEmail ? otherUser.email : undefined,
          phone: sharePhone ? otherUser.phone : undefined,
        },
      };
    });
  }

  async respond(connectionId: string, userId: string, action: 'accept' | 'decline' | 'cancel') {
    const conn = await this.prisma.connectionRequest.findUnique({
      where: { id: connectionId },
    });

    if (!conn) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Connection request not found' }, HttpStatus.NOT_FOUND);
    }

    if (conn.status !== 'pending') {
      throw new HttpException(
        { code: 'CONFLICT', message: `Connection request is already ${conn.status}` },
        HttpStatus.CONFLICT,
      );
    }

    if (action === 'cancel') {
      if (conn.senderId !== userId) {
        throw new HttpException({ code: 'FORBIDDEN', message: 'Only sender can cancel request' }, HttpStatus.FORBIDDEN);
      }
      return this.prisma.connectionRequest.update({
        where: { id: connectionId },
        data: { status: ConnectionStatus.cancelled, respondedAt: new Date() },
      });
    }

    // accept or decline
    if (conn.recipientId !== userId) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Only recipient can accept or decline' }, HttpStatus.FORBIDDEN);
    }

    const newStatus = action === 'accept' ? ConnectionStatus.accepted : ConnectionStatus.declined;

    const updated = await this.prisma.connectionRequest.update({
      where: { id: connectionId },
      data: { status: newStatus, respondedAt: new Date() },
    });

    this.realtime.emitToUser(conn.senderId, 'connection.updated', {
      connectionId: conn.id,
      status: newStatus,
    });

    if (newStatus === 'accepted') {
      const notif = await this.prisma.notification.create({
        data: {
          type: 'connection_accepted',
          title: 'Connection Accepted',
          body: `Your connection request was accepted!`,
          metadata: { connectionId: conn.id },
        },
      });

      await this.prisma.notificationDelivery.create({
        data: {
          notificationId: notif.id,
          recipientId: conn.senderId,
        },
      });

      this.realtime.emitToUser(conn.senderId, 'notification.new', {
        id: notif.id,
        type: 'connection_accepted',
      });
    }

    return updated;
  }

  // Blocks
  async getBlocks(userId: string) {
    const blocks = await this.prisma.memberBlock.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            profile: { select: { name: true } },
          },
        },
      },
    });

    return blocks.map((b) => ({
      userId: b.blockedId,
      name: b.blocked.profile?.name || 'User',
      blockedAt: b.createdAt,
    }));
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Cannot block yourself' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    await this.prisma.$transaction([
      this.prisma.memberBlock.upsert({
        where: { blockerId_blockedId: { blockerId, blockedId } },
        update: {},
        create: { blockerId, blockedId },
      }),
      // Cancel any active/pending connections
      this.prisma.connectionRequest.updateMany({
        where: {
          OR: [
            { senderId: blockerId, recipientId: blockedId },
            { senderId: blockedId, recipientId: blockerId },
          ],
          status: { in: ['pending', 'accepted'] },
        },
        data: { status: ConnectionStatus.cancelled, respondedAt: new Date() },
      }),
    ]);

    return { ok: true, message: 'Member blocked' };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.memberBlock.deleteMany({
      where: { blockerId, blockedId },
    });
    return { ok: true, message: 'Member unblocked' };
  }
}
