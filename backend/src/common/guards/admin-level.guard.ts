import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AdminLevel } from '@prisma/client';
import { ADMIN_LEVEL_KEY } from '../decorators/admin-level.decorator';

@Injectable()
export class AdminLevelGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.getAllAndOverride<AdminLevel>(
      ADMIN_LEVEL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredLevel) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user || user.adminLevel !== requiredLevel) {
      throw new HttpException(
        {
          code: 'FORBIDDEN',
          message: `${requiredLevel} role required for this action`,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
