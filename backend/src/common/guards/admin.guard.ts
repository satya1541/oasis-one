import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    const session = (request as any).session;

    if (!user) {
      throw new HttpException(
        {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.adminLevel) {
      throw new HttpException(
        {
          code: 'FORBIDDEN',
          message: 'Administrator privileges required',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!session || !session.mfaVerified) {
      throw new HttpException(
        {
          code: 'MFA_REQUIRED',
          message: 'MFA verification required for administrative operations',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
