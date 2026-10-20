import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  private sanitize(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.sanitize(item));

    const sensitiveKeys = [
      'password',
      'passwordhash',
      'currentpassword',
      'newpassword',
      'confirmpassword',
      'token',
      'authorization',
      'refreshtoken',
      'cookie',
      'cookies',
      'loginenc',
      'secret',
      'pepper',
    ];

    const copy: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        copy[key] = '[FILTERED]';
      } else if (typeof val === 'object' && val !== null) {
        copy[key] = this.sanitize(val);
      } else {
        copy[key] = val;
      }
    }
    return copy;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const requestId =
      (req.headers['x-request-id'] as string) || randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    const startTime = Date.now();
    const { method, url, ip } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          this.logger.log(
            `[${requestId}] ${method} ${url} ${statusCode} - ${duration}ms - IP: ${ip}`,
          );
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            `[${requestId}] ${method} ${url} failed after ${duration}ms: ${err.message}`,
          );
        },
      }),
    );
  }
}
