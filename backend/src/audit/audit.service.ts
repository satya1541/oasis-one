import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogOptions {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  reason?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, any> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(options: AuditLogOptions): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: options.actorId || null,
          action: options.action,
          targetType: options.targetType,
          targetId: options.targetId || null,
          reason: options.reason || null,
          ipAddress: options.ipAddress || null,
          metadata: options.metadata || undefined,
        },
      });
    } catch (err: any) {
      // Never crash critical user transactions if audit log insert encounters trigger or db issues, but log error
      this.logger.error(`Failed to write audit log [${options.action}]: ${err.message}`, err.stack);
    }
  }
}
