import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ApplicationStatus, AuthorType } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async getMyApplication(userId: string) {
    const app = await this.prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            accountStatus: true,
            emailVerified: true,
            primaryRole: true,
          },
        },
      },
    });

    if (!app) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'No application found' }, HttpStatus.NOT_FOUND);
    }

    const latestMessage = await this.prisma.applicationMessage.findFirst({
      where: {
        applicationId: app.id,
        isInternalNote: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      id: app.id,
      referenceId: app.id,
      status: app.status,
      submittedAt: app.submittedAt,
      canReapplyAt: app.canReapplyAt,
      decisionReason: (app.status === 'rejected' || app.status === 'info_requested') ? app.decisionReason : undefined,
      latestMessage: latestMessage ? {
        id: latestMessage.id,
        authorId: latestMessage.authorId,
        authorType: latestMessage.authorType,
        body: latestMessage.body,
        createdAt: latestMessage.createdAt,
      } : null,
      expedited: app.expedited,
      snapshot: app.submittedProfileSnapshot,
      accountStatus: app.user.accountStatus,
      emailVerified: app.user.emailVerified,
    };
  }

  async updateMyApplication(userId: string, updates: Record<string, any>) {
    const app = await this.prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!app) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Application not found' }, HttpStatus.NOT_FOUND);
    }

    if (app.status !== ApplicationStatus.info_requested) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Application can only be edited when information has been requested by an administrator' },
        HttpStatus.FORBIDDEN,
      );
    }

    const currentSnapshot = (app.submittedProfileSnapshot as Record<string, any>) || {};
    const updatedSnapshot = { ...currentSnapshot, ...updates };

    const updated = await this.prisma.application.update({
      where: { id: app.id },
      data: {
        submittedProfileSnapshot: updatedSnapshot,
        status: ApplicationStatus.pending, // Reset to pending for admin review
      },
    });

    // Notify reviewer and admin queue
    this.realtime.emitToAdmins('admin.application.new', { applicationId: updated.id });
    this.realtime.debounceEmitAdminCounts();

    return { ok: true, status: updated.status };
  }

  async getMyMessages(userId: string) {
    const app = await this.prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!app) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Application not found' }, HttpStatus.NOT_FOUND);
    }

    const messages = await this.prisma.applicationMessage.findMany({
      where: {
        applicationId: app.id,
        isInternalNote: false, // Internal notes NEVER leak to applicant
      },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            primaryRole: true,
            adminLevel: true,
          },
        },
      },
    });

    return messages.map((m) => ({
      id: m.id,
      authorId: m.authorId,
      authorType: m.authorType,
      body: m.body,
      attachments: m.attachments,
      createdAt: m.createdAt,
    }));
  }

  async sendMyMessage(userId: string, body: string, attachments?: any) {
    if (!body || !body.trim()) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Message body cannot be empty' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const app = await this.prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!app) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Application not found' }, HttpStatus.NOT_FOUND);
    }

    const message = await this.prisma.applicationMessage.create({
      data: {
        applicationId: app.id,
        authorId: userId,
        authorType: AuthorType.applicant,
        body: body.trim(),
        attachments: attachments || undefined,
        isInternalNote: false,
      },
    });

    // If information was requested, applicant's response returns application to pending review
    if (app.status === ApplicationStatus.info_requested) {
      await this.prisma.application.update({
        where: { id: app.id },
        data: {
          status: ApplicationStatus.pending,
        },
      });
      this.realtime.emitToAdmins('admin.application.new', { applicationId: app.id });
      this.realtime.debounceEmitAdminCounts();
    }

    // Realtime notification
    this.realtime.emit(`application:${app.id}`, 'application.message', { applicationId: app.id });
    this.realtime.emitToAdmins('application.message', { applicationId: app.id });

    return message;
  }

  async attachDocument(userId: string, fileId: string) {
    const app = await this.prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!app) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Application not found' }, HttpStatus.NOT_FOUND);
    }

    const snapshot = (app.submittedProfileSnapshot as Record<string, any>) || {};
    const existing = Array.isArray(snapshot.evidenceFileIds) ? [...snapshot.evidenceFileIds] : [];
    if (!existing.includes(fileId)) {
      existing.push(fileId);
    }

    await this.prisma.application.update({
      where: { id: app.id },
      data: {
        submittedProfileSnapshot: {
          ...snapshot,
          evidenceFileIds: existing,
        },
      },
    });

    await this.prisma.uploadedFile.updateMany({
      where: { id: fileId },
      data: { ownerId: userId, status: 'attached' },
    });

    this.realtime.emitToAdmins('admin.application.update', { applicationId: app.id });

    return { ok: true, evidenceFileIds: existing };
  }

  async withdrawMyApplication(userId: string) {
    const app = await this.prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!app) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Application not found' }, HttpStatus.NOT_FOUND);
    }

    if (app.status === ApplicationStatus.approved) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Approved applications cannot be withdrawn' }, HttpStatus.FORBIDDEN);
    }

    await this.prisma.application.update({
      where: { id: app.id },
      data: { status: ApplicationStatus.withdrawn },
    });

    this.realtime.emitToUser(userId, 'account.status_changed', { applicationStatus: 'withdrawn' });
    this.realtime.debounceEmitAdminCounts();

    return { ok: true, message: 'Application withdrawn' };
  }

  async reapply(userId: string) {
    const app = await this.prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!app || app.status !== ApplicationStatus.rejected) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Only rejected applications can reapply' }, HttpStatus.FORBIDDEN);
    }

    if (app.canReapplyAt && app.canReapplyAt > new Date()) {
      throw new HttpException(
        {
          code: 'FORBIDDEN',
          message: `Cooling-off period active. You may reapply after ${app.canReapplyAt.toISOString()}`,
          details: { canReapplyAt: app.canReapplyAt },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const newApp = await this.prisma.application.create({
      data: {
        userId,
        submittedProfileSnapshot: app.submittedProfileSnapshot as any,
        status: ApplicationStatus.pending,
      },
    });

    this.realtime.emitToUser(userId, 'account.status_changed', { applicationStatus: 'pending' });
    this.realtime.emitToAdmins('admin.application.new', { applicationId: newApp.id });
    this.realtime.debounceEmitAdminCounts();

    return { ok: true, applicationId: newApp.id };
  }
}
