import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MemberGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
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
