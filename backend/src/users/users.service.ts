import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { JobsService } from '../jobs/jobs.service';
import { hashToken, generateNumericOtp } from '../common/utils/crypto.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly jobs: JobsService,
  ) {}

  async getRestrictions(userId: string) {
    const restrictions = await this.prisma.restriction.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      select: {
        id: true,
        type: true,
        reason: true,
        issuedAt: true,
        expiresAt: true,
        resolvedAt: true,
      },
    });

    return {
      restrictions,
      hasActiveSuspension: restrictions.some(
        (r) => r.type === 'suspension' && !r.resolvedAt && (!r.expiresAt || r.expiresAt > new Date()),
      ),
      appealContact: 'support@oasis.community',
    };
  }

  async getSessions(userId: string, currentSessionId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Session not found' }, HttpStatus.NOT_FOUND);
    }

    await this.prisma.session.delete({ where: { id: session.id } });
    return { ok: true, message: 'Session terminated' };
  }

  async clearUnlockSeen(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { unlockAnimationPending: false },
    });
    return { ok: true };
  }

  async sendPhoneOtp(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.phone) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'No phone number on file to verify' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const rawOtp = generateNumericOtp();
    const otpHash = hashToken(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.phoneVerification.create({
      data: {
        userId,
        phone: user.phone,
        otpHash,
        expiresAt,
      },
    });

    // In dev, log OTP to console
    console.log(`[SMS OTP SIMULATION] Code for ${user.phone}: ${rawOtp}`);

    return { message: 'Verification code sent via SMS' };
  }

  async verifyPhoneOtp(userId: string, code: string) {
    const otpHash = hashToken(code.trim());
    const verification = await this.prisma.phoneVerification.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'No active verification code found' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (verification.attempts >= 5) {
      throw new HttpException(
        { code: 'RATE_LIMITED', message: 'Too many incorrect attempts. Please request a new code.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (verification.otpHash !== otpHash) {
      await this.prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Incorrect verification code' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { phoneVerifiedAt: new Date() },
    });

    return { ok: true, message: 'Phone number verified' };
  }

  async acceptConsents(userId: string, consents: { type: any; version: string }[], ipAddress?: string) {
    for (const c of consents) {
      await this.prisma.consentRecord.create({
        data: {
          userId,
          documentType: c.type,
          documentVersion: c.version,
          ipAddress,
        },
      });
    }
    return { ok: true, message: 'Updated consents accepted' };
  }

  async requestDataExport(userId: string) {
    const existing = await this.prisma.dataExportRequest.findFirst({
      where: { userId, status: { in: ['pending', 'processing'] } },
    });
    if (existing) {
      return { id: existing.id, status: existing.status };
    }

    const req = await this.prisma.dataExportRequest.create({
      data: {
        userId,
        status: 'pending',
      },
    });

    await this.jobs.enqueue({
      type: 'data_export_build',
      payload: { requestId: req.id, userId },
    });

    return { id: req.id, status: 'pending', message: 'Export requested. Ready within 48 hours.' };
  }

  async getDataExport(userId: string, exportId: string) {
    const exportReq = await this.prisma.dataExportRequest.findFirst({
      where: { id: exportId, userId },
    });
    if (!exportReq) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Export request not found' }, HttpStatus.NOT_FOUND);
    }
    return exportReq;
  }

  async requestAccountDeletion(userId: string) {
    const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { accountStatus: 'deactivated' },
      }),
      this.prisma.deletionRequest.create({
        data: {
          userId,
          scheduledFor,
        },
      }),
    ]);

    await this.realtime.revokeUserSessions(userId, 'account_deactivation');
    return { message: 'Account deactivated. All personal data will be purged within 30 days.' };
  }
}
