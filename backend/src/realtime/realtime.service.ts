import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  public server: Server | null = null;
  private adminCountsTimeout: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  setServer(server: Server) {
    this.server = server;
  }

  emit(room: string, event: string, payload: any) {
    if (!this.server) {
      this.logger.debug(`Socket server not initialized. Dropping event ${event} to ${room}`);
      return;
    }
    this.server.to(room).emit(event, payload);
    this.logger.debug(`Emitted ${event} to room ${room}`);
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.emit(`user:${userId}`, event, payload);
  }

  emitToRole(role: string, event: string, payload: any) {
    this.emit(`role:${role}`, event, payload);
  }

  emitToMembers(event: string, payload: any) {
    this.emit('members', event, payload);
  }

  emitToAdmins(event: string, payload: any) {
    this.emit('admins', event, payload);
  }

  /**
   * Disconnects all connected sockets for a given user upon logout, suspension, or credential change.
   */
  async revokeUserSessions(userId: string, reason = 'session_revoked') {
    if (!this.server) return;
    const userRoom = `user:${userId}`;
    this.server.to(userRoom).emit('session.revoked', { reason });
    
    const sockets = await this.server.in(userRoom).fetchSockets();
    for (const socket of sockets) {
      socket.disconnect(true);
    }
    this.logger.log(`Disconnected all sockets for user ${userId} (${reason})`);
  }

  /**
   * Recalculates and emits debounced admin queue counts to 'admins' room.
   */
  debounceEmitAdminCounts() {
    if (this.adminCountsTimeout) {
      clearTimeout(this.adminCountsTimeout);
    }
    this.adminCountsTimeout = setTimeout(async () => {
      try {
        const [pendingApplications, openReports, pendingAchievements] = await Promise.all([
          this.prisma.application.count({ where: { status: 'pending' } }),
          this.prisma.contentReport.count({ where: { status: 'pending' } }),
          this.prisma.achievement.count({ where: { status: 'pending_review' } }),
        ]);

        this.emitToAdmins('admin.counts', {
          pendingApplications,
          openReports,
          pendingAchievements,
        });
      } catch (err: any) {
        this.logger.error(`Failed to compute admin counts: ${err.message}`);
      }
    }, 2000);
  }
}
