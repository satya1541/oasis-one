import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(@Optional() private readonly reflector?: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.reflector) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        return true;
      }
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user) {
      throw new HttpException(
        {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.accountStatus !== 'active') {
      const app = user.applications?.[0];
      throw new HttpException(
        {
          code: 'ACCOUNT_STATE',
          message: 'Active community membership required to access this feature',
          details: {
            status: user.accountStatus,
            applicationStatus: app?.status || 'not_started',
          },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
