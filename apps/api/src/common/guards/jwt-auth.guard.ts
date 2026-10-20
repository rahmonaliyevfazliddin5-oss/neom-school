import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersRepository } from '../../modules/users/users.repository';
import { SessionService } from '../security/session.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // 1. Extract token from httpOnly cookie or Authorization Bearer header
    let token = request.cookies?.['neom_access_token'];

    if (!token && request.headers['authorization']) {
      const parts = request.headers['authorization'].split(' ');
      if (parts[0] === 'Bearer' && parts[1]) {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException("Avtorizatsiya talab qilinadi");
    }

    // 2. Verify JWT token
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException("Yaroqsiz yoki eskirgan sessiya");
    }

    // 3. Verify user exists and is active
    const user = await this.usersRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Foydalanuvchi hisobi faol emas");
    }

    // 4. Attach user to request
    request.user = user;
    request.sessionId = payload.sessionId;

    // 5. If mustChangePassword=true, block any action except credentials change or me/logout
    if (user.mustChangePassword) {
      const url = request.url;
      const allowedPaths = [
        '/auth/change-credentials',
        '/auth/me',
        '/auth/logout',
        '/auth/refresh',
      ];
      const isAllowed = allowedPaths.some((p) => url.includes(p));
      if (!isAllowed) {
        throw new ForbiddenException(
          "Xavfsizlik talabi: Tizimdan foydalanishdan oldin parolingizni yangilashingiz shart",
        );
      }
    }

    // 6. Touch session if refresh token cookie is present
    const refreshToken = request.cookies?.['neom_refresh_token'];
    if (refreshToken) {
      this.sessionService.touchSession(refreshToken).catch(() => {});
    }

    return true;
  }
}
