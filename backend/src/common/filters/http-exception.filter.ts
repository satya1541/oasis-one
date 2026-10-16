import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    details?: Record<string, any>;
    retryAfterSeconds?: number;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred. Please try again.';
    let fields: Record<string, string> | undefined = undefined;
    let details: Record<string, any> | undefined = undefined;
    let retryAfterSeconds: number | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as any;
        message = obj.message || obj.error || message;
        code = obj.code || this.defaultCodeForStatus(status);
        fields = obj.fields;
        details = obj.details;
        retryAfterSeconds = obj.retryAfterSeconds;

        // NestJS validation pipe format
        if (Array.isArray(obj.message) && status === HttpStatus.UNPROCESSABLE_ENTITY) {
          code = 'VALIDATION_FAILED';
          fields = {};
          for (const item of obj.message) {
            if (typeof item === 'string') {
              const parts = item.split(' ');
              const fieldName = parts[0] || 'field';
              fields[fieldName] = item;
            }
          }
          message = 'Validation failed for one or more fields';
        } else if (Array.isArray(obj.message)) {
          message = obj.message.join('; ');
        }
      } else {
        code = this.defaultCodeForStatus(status);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error on ${request.method} ${request.url}: ${exception.message}`, exception.stack);
    }

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      code = 'RATE_LIMITED';
      if (!retryAfterSeconds) {
        retryAfterSeconds = 60;
      }
      response.setHeader('Retry-After', retryAfterSeconds.toString());
    }

    const errorPayload: ApiErrorResponse = {
      error: {
        code,
        message,
        ...(fields && { fields }),
        ...(details && { details }),
        ...(retryAfterSeconds && { retryAfterSeconds }),
      },
    };

    response.status(status).json(errorPayload);
  }

  private defaultCodeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHENTICATED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_FAILED';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
