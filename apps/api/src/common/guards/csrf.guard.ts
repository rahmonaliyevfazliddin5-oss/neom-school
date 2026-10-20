import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  private webOrigin: string;

  constructor(private readonly configService: ConfigService) {
    this.webOrigin = this.configService.get<string>('WEB_ORIGIN', 'http://localhost:3000');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // Safe methods do not mutate state
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Exclude public login / refresh (which generate new tokens)
    const url = request.url;
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/health')) {
      return true;
    }

    // 1. Origin / Referer validation
    const origin = request.headers['origin'];
    const referer = request.headers['referer'];

    if (origin && !origin.startsWith(this.webOrigin)) {
      throw new ForbiddenException('CSRF tekshiruvi xatosi: Origin mos kelmadi');
    }

    if (!origin && referer && !referer.startsWith(this.webOrigin)) {
      throw new ForbiddenException('CSRF tekshiruvi xatosi: Referer mos kelmadi');
    }

    // 2. Double-submit token check
    const headerToken = request.headers['x-csrf-token'] as string;
    const cookieToken = request.cookies?.['neom_csrf_token'];

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      throw new ForbiddenException('CSRF tekshiruvi xatosi: Token topilmadi yoki mos kelmadi');
    }

    return true;
  }
}
