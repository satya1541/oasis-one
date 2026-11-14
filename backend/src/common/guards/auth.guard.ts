import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { hashToken } from '../utils/crypto.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken = request.cookies?.['oasis_sid'];

    if (!sessionToken) {
      if (isPublic) {
        return true;
      }
      throw new HttpException(
        {
          code: 'UNAUTHENTICATED',
          message: 'Authentication session required',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokenHash = hashToken(sessionToken);
    const now = new Date();

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

    if (!session || session.expiresAt <= now) {
      if (isPublic) {
        return true;
      }
      throw new HttpException(
        {
          code: 'UNAUTHENTICATED',
          message: 'Session expired or invalid',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Rolling 30-day session update on user activity (throttled to every 15 minutes to reduce DB writes)
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    if (!session.lastActiveAt || session.lastActiveAt < fifteenMinutesAgo) {
      const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days rolling
      this.prisma.session.update({
        where: { id: session.id },
        data: {
          lastActiveAt: now,
          expiresAt: newExpiry,
        },
      }).catch(() => {});
    }

    const user = session.user;
    (request as any).user = user;
    (request as any).session = session;

    // Check blocked states: suspended / revoked / blacklisted / deactivated
    const blockedStatuses = ['suspended', 'revoked', 'blacklisted', 'deactivated'];
    if (blockedStatuses.includes(user.accountStatus)) {
      const allowedPaths = [
        '/me/restrictions',
        '/support/contact',
        '/auth/logout',
        '/auth/me',
        '/analytics/events',
      ];
      const currentPath = request.path.replace(/^\/api\/v1/, '');
      if (!allowedPaths.some(p => currentPath.startsWith(p))) {
        throw new HttpException(
          {
            code: 'ACCOUNT_STATE',
            message: `Account is ${user.accountStatus}. Access to this resource is blocked.`,
            details: { status: user.accountStatus },
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return true;
  }
}
