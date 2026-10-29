import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AuditService } from '../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

export interface EnqueueJobOptions {
  type: string;
  payload: Record<string, any>;
  runAt?: Date;
}

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private isRunning = false;
  private workerInterval: NodeJS.Timeout | null = null;
  private archiveInterval: NodeJS.Timeout | null = null;
  private readonly workerId = `worker-${uuidv4().slice(0, 8)}`;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly realtimeService: RealtimeService,
    private readonly auditService: AuditService,
  ) {}

  onModuleInit() {
    this.startWorker();
  }

  onModuleDestroy() {
    this.stopWorker();
  }

  async enqueue(options: EnqueueJobOptions) {
    return this.prisma.job.create({
      data: {
        type: options.type,
        payload: options.payload,
        runAt: options.runAt || new Date(),
        status: 'pending',
      },
    });
  }

  private startWorker() {
    this.isRunning = true;
    this.logger.log(`Background Job Worker started (${this.workerId})`);
    this.workerInterval = setInterval(() => {
      this.processNextJobs().catch((err) => {
        this.logger.error(`Error in job processor loop: ${err.message}`);
      });
    }, 5000);

    // Initial audit archival run 30s after startup, recurring every 24 hours
    setTimeout(() => {
      this.runAuditArchivalMaintenance();
    }, 30000);

    this.archiveInterval = setInterval(() => {
      this.runAuditArchivalMaintenance();
    }, 24 * 60 * 60 * 1000);
  }

  private stopWorker() {
    this.isRunning = false;
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
    }
    if (this.archiveInterval) {
      clearInterval(this.archiveInterval);
    }
    this.logger.log(`Background Job Worker stopped (${this.workerId})`);
  }

  private async runAuditArchivalMaintenance() {
    if (!this.isRunning) return;
    try {
      this.logger.log('Executing automated 7-day audit log archival to S3...');
      const result = await this.auditService.archiveOldLogsToS3(7, 'system.cron');
      this.logger.log(`Automated S3 audit archival: ${result.message}`);
    } catch (err: any) {
      this.logger.error(`Automated S3 audit archival failed: ${err.message}`, err.stack);
    }
  }

  private async processNextJobs() {
    if (!this.isRunning) return;

    // Claim next batch of pending jobs (up to 5) with optimistic/skip-locked update
    const now = new Date();
    
    // Find pending jobs
    const pendingJobs = await this.prisma.job.findMany({
      where: {
        status: 'pending',
        runAt: { lte: now },
      },
      take: 5,
    });

    for (const job of pendingJobs) {
      // Claim job
      const claimed = await this.prisma.job.updateMany({
        where: {
          id: job.id,
          status: 'pending',
        },
        data: {
          status: 'processing',
          lockedAt: now,
          lockedBy: this.workerId,
          attempts: { increment: 1 },
        },
      });

      if (claimed.count === 0) continue;

      try {
        await this.executeJob(job.type, job.payload as Record<string, any>);
        await this.prisma.job.update({
          where: { id: job.id },
          data: {
            status: 'completed',
            updatedAt: new Date(),
          },
        });
      } catch (err: any) {
        this.logger.error(`Job [${job.id}:${job.type}] failed: ${err.message}`, err.stack);
        const willRetry = job.attempts < 3;
        await this.prisma.job.update({
          where: { id: job.id },
          data: {
            status: willRetry ? 'pending' : 'dead_letter',
            error: err.message,
            runAt: willRetry ? new Date(Date.now() + Math.pow(2, job.attempts) * 30000) : job.runAt,
          },
        });
      }
    }
  }

  private async executeJob(type: string, payload: Record<string, any>) {
    switch (type) {
      case 'send_email':
        await this.mailService.sendMail({
          to: payload.to,
          subject: payload.subject,
          headline: payload.headline,
          body: payload.body,
          actionText: payload.actionText,
          actionUrl: payload.actionUrl,
        });
        break;

      case 'achievement_expiry':
        await this.prisma.achievement.updateMany({
          where: {
            status: 'approved',
            expiresAt: { lte: new Date() },
          },
          data: {
            status: 'expired',
          },
        });
        break;

      case 'invite_expiry':
        await this.prisma.inviteLink.updateMany({
          where: {
            status: 'pending',
            expiresAt: { lte: new Date() },
          },
          data: {
            status: 'expired',
          },
        });
        break;

      case 'connection_expiry':
        await this.prisma.connectionRequest.updateMany({
          where: {
            status: 'pending',
            expiresAt: { lte: new Date() },
          },
          data: {
            status: 'expired',
          },
        });
        break;

      case 'claim_auto_release':
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        await this.prisma.application.updateMany({
          where: {
            claimedAt: { lte: fifteenMinutesAgo },
          },
          data: {
            claimedBy: null,
            claimedAt: null,
          },
        });
        break;

      case 'suspension_lift':
        const expiredRestrictions = await this.prisma.restriction.findMany({
          where: {
            type: 'suspension',
            resolvedAt: null,
            expiresAt: { lte: new Date() },
          },
        });
        for (const r of expiredRestrictions) {
          await this.prisma.$transaction([
            this.prisma.restriction.update({
              where: { id: r.id },
              data: { resolvedAt: new Date() },
            }),
            this.prisma.user.update({
              where: { id: r.userId },
              data: { accountStatus: 'active' },
            }),
          ]);
          this.realtimeService.emitToUser(r.userId, 'account.status_changed', {
            accountStatus: 'active',
          });
        }
        break;

      case 'audit_archive_s3':
        await this.auditService.archiveOldLogsToS3(
          payload.retentionDays || 7,
          payload.triggeredBy || 'job_worker',
        );
        break;

      default:
        this.logger.debug(`Handled job type: ${type}`);
        break;
    }
  }

  isWorkerHealthy(): boolean {
    return this.isRunning;
  }
}
