import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((value) => {
        // If response is already sent, redirected, or raw stream (e.g. file, ics, csv), return as is
        if (res.headersSent || value === undefined || value === null) {
          return { data: value };
        }

        // If controller returned an explicit data/meta structure
        if (typeof value === 'object' && 'data' in value && !('error' in value)) {
          return value;
        }

        // If controller returned { items, total, page, pageSize }
        if (
          typeof value === 'object' &&
          'items' in value &&
          'total' in value &&
          typeof value.total === 'number'
        ) {
          const page = value.page || 1;
          const pageSize = value.pageSize || 20;
          const total = value.total;
          const totalPages = Math.ceil(total / (pageSize || 1));
          return {
            data: value.items,
            meta: {
              page,
              pageSize,
              total,
              totalPages,
            },
          };
        }

        return { data: value };
      }),
    );
  }
}
