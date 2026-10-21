import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly allowedOrigins: string[];

  constructor(private readonly configService: ConfigService) {
    this.allowedOrigins = this.configService.get<string[]>('wsAllowedOrigins') || [
      'https://oasisodisha.in',
      'https://www.oasisodisha.in',
      'http://localhost:7200',
      'http://localhost:3000',
    ];
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // Safe read-only methods are exempt
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Google OAuth callback and Admin bootstrap are exempt from browser CSRF tokens
    if (request.path.includes('/auth/google/callback') || request.path.includes('/admin/setup')) {
      return true;
    }

    // 1. Origin / Referer validation (Defense in depth)
    const origin = request.headers['origin'];
    const referer = request.headers['referer'];
    const requestSource = origin || (referer ? new URL(referer).origin : null);

    if (requestSource) {
      const isOriginAllowed =
        this.allowedOrigins.some((allowed) => {
          try {
            return new URL(allowed).origin === requestSource;
          } catch {
            return allowed === requestSource;
          }
        }) ||
        requestSource.includes('oasisodisha.in') ||
        requestSource.includes('localhost') ||
        requestSource.includes('127.0.0.1');

      if (!isOriginAllowed) {
        throw new HttpException(
          {
            code: 'FORBIDDEN',
            message: 'Cross-origin request blocked',
            details: { reason: 'origin_not_allowed' },
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // 2. Double-Submit CSRF Cookie / Header comparison
    // If oasis_csrf cookie is present on the client, the matching X-CSRF-Token header is required
    const csrfCookie = request.cookies?.['oasis_csrf'];
    const csrfHeader = request.headers['x-csrf-token'];

    if (csrfCookie) {
      if (!csrfHeader || csrfCookie !== csrfHeader) {
        throw new HttpException(
          {
            code: 'FORBIDDEN',
            message: 'Invalid or missing CSRF token',
            details: { reason: 'csrf' },
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return true;
  }
}
