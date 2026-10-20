import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../../common/security/crypto.service';
import { SessionService } from '../../common/security/session.service';
import { BruteForceService } from '../../common/security/brute-force.service';
import { AuditService } from '../audit/audit.service';
import { Role } from '@prisma/client';

export interface LoginResult {
  role: Role;
  redirectUrl: string;
  mustChangePassword: boolean;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
    private readonly sessionService: SessionService,
    private readonly bruteForceService: BruteForceService,
    private readonly auditService: AuditService,
  ) {}

  async login(
    loginRaw: string,
    passwordRaw: string,
    ip: string,
    userAgent: string,
  ): Promise<LoginResult> {
    const loginHash = this.cryptoService.computeLoginHash(loginRaw);

    // 1. Check brute force rate limits
    await this.bruteForceService.checkAttempt(ip, loginHash);

    // 2. Lookup user
    const user = await this.usersRepository.findByLoginHashWithPassword(loginHash);

    // 3. Timing-attack prevention if user does not exist
    if (!user) {
      await this.cryptoService.verifyDummyPassword(passwordRaw);
      await this.bruteForceService.recordFailure(loginHash);
      await this.auditService.record({
        action: 'LOGIN_FAIL',
        ip,
        userAgent,
      });
      throw new UnauthorizedException("Login yoki parol noto'g'ri");
    }

    // 4. Verify password with Argon2id + pepper
    const isMatch = await this.cryptoService.verifyPassword(
      user.passwordHash,
      passwordRaw,
    );

    if (!isMatch || !user.isActive) {
      await this.bruteForceService.recordFailure(loginHash);
      await this.auditService.record({
        userId: user.id,
        action: 'LOGIN_FAIL',
        ip,
        userAgent,
      });
      throw new UnauthorizedException("Login yoki parol noto'g'ri");
    }

    // 5. Successful login
    await this.bruteForceService.recordSuccess(loginHash);
    await this.auditService.record({
      userId: user.id,
      action: 'LOGIN_OK',
      ip,
      userAgent,
    });

    // 6. Create session (JWT access token + random 256-bit refresh token in Redis)
    const session = await this.sessionService.createSession(
      user.id,
      user.role,
      ip,
      userAgent,
    );

    const csrfToken = this.cryptoService.generateRandomToken();

    // Determine target panel based on role
    let redirectUrl = '/panel/ustoz';
    if (user.mustChangePassword) {
      redirectUrl = '/panel/parol-login';
    } else if (user.role === Role.ZAVUCH) {
      redirectUrl = '/panel/zavuch';
    } else if (user.role === Role.DIRECTOR) {
      redirectUrl = '/panel/direktor';
    }

    return {
      role: user.role,
      redirectUrl,
      mustChangePassword: user.mustChangePassword,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      csrfToken,
    };
  }

  async logout(refreshToken: string | undefined, userId?: string, ip?: string, userAgent?: string) {
    if (refreshToken) {
      await this.sessionService.revokeSession(refreshToken);
    }
    if (userId) {
      await this.auditService.record({
        userId,
        action: 'LOGOUT',
        ip,
        userAgent,
      });
    }
  }

  async refresh(oldRefreshToken: string, ip: string, userAgent: string) {
    const refreshed = await this.sessionService.refreshSession(oldRefreshToken, ip, userAgent);
    const csrfToken = this.cryptoService.generateRandomToken();

    return {
      ...refreshed,
      csrfToken,
    };
  }

  async changeCredentials(
    userId: string,
    data: {
      currentPassword: string;
      fullName?: string;
      newLogin?: string;
      newPassword?: string;
      confirmPassword?: string;
    },
    ip: string,
    userAgent: string,
  ) {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      throw new BadRequestException("Yangi parollar bir-biriga mos kelmadi");
    }

    // 1. Change credentials in users service
    const result = await this.usersService.changeCredentials(
      userId,
      data.currentPassword,
      data.newPassword,
      data.newLogin,
      data.fullName,
    );

    // 2. Revoke all existing sessions for this user (security revocation)
    await this.sessionService.revokeAllUserSessions(userId);

    // 3. Issue fresh session for current client
    const session = await this.sessionService.createSession(
      userId,
      result.user.role,
      ip,
      userAgent,
    );

    const csrfToken = this.cryptoService.generateRandomToken();

    await this.auditService.record({
      userId,
      action: 'CREDENTIALS_CHANGED',
      ip,
      userAgent,
    });

    return {
      message: result.message,
      role: result.user.role,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      csrfToken,
    };
  }
}
