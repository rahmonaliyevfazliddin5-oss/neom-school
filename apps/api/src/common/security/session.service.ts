import {
  Injectable,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import Redis from 'ioredis';
import { CryptoService } from './crypto.service';

export interface SessionData {
  userId: string;
  role: Role;
  sessionId: string;
  familyId: string;
  ip: string;
  userAgent: string;
  createdAt: number;
  lastSeenAt: number;
}

@Injectable()
export class SessionService implements OnModuleInit {
  private readonly logger = new Logger(SessionService.name);
  private redisClient: Redis | null = null;
  // In-memory fallback if Redis is offline during local test/dev without docker
  private memorySessions = new Map<string, { data: SessionData; expiresAt: number }>();
  private memoryUserSessions = new Map<string, Set<string>>();

  private idleTimeout: number;
  private absoluteTimeout: number;
  private maxSessions: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {
    this.idleTimeout = this.configService.get<number>('SESSION_IDLE_TIMEOUT_SECONDS', 1800);
    this.absoluteTimeout = this.configService.get<number>('SESSION_ABSOLUTE_TIMEOUT_SECONDS', 43200);
    this.maxSessions = this.configService.get<number>('MAX_SESSIONS_PER_USER', 3);
  }

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          lazyConnect: true,
          retryStrategy: () => null,
          connectTimeout: 2000,
        });
        this.redisClient.connect().catch((err) => {
          this.logger.warn(`Redis not reachable on startup (${err.message}). Using memory session fallback.`);
        });
      } catch (err) {
        this.logger.warn(`Redis init error: ${(err as Error).message}`);
      }
    }
  }

  private isRedisReady(): boolean {
    return this.redisClient !== null && this.redisClient.status === 'ready';
  }

  /**
   * Create a new session with JWT access token (15m) and random refresh token (stored as SHA-256 in Redis)
   */
  async createSession(
    userId: string,
    role: Role,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string; role: Role }> {
    const sessionId = this.cryptoService.generateRandomToken();
    const familyId = this.cryptoService.generateRandomToken();
    const refreshToken = this.cryptoService.generateRandomToken();
    const tokenHash = this.cryptoService.hashToken(refreshToken);

    const now = Date.now();
    const sessionData: SessionData = {
      userId,
      role,
      sessionId,
      familyId,
      ip,
      userAgent,
      createdAt: now,
      lastSeenAt: now,
    };

    // 1. Limit concurrent sessions to maxSessions (3)
    await this.enforceMaxSessions(userId);

    // 2. Save in Redis (or memory fallback)
    const sessionKey = `session:${tokenHash}`;
    const userSessionsKey = `user_sessions:${userId}`;

    if (this.isRedisReady() && this.redisClient) {
      await this.redisClient.set(sessionKey, JSON.stringify(sessionData), 'EX', this.idleTimeout);
      await this.redisClient.sadd(userSessionsKey, sessionKey);
    } else {
      this.memorySessions.set(sessionKey, {
        data: sessionData,
        expiresAt: now + this.idleTimeout * 1000,
      });
      if (!this.memoryUserSessions.has(userId)) {
        this.memoryUserSessions.set(userId, new Set());
      }
      this.memoryUserSessions.get(userId)!.add(sessionKey);
    }

    // 3. Issue 15-minute access token
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        role,
        sessionId,
      },
      {
        expiresIn: '15m',
      },
    );

    return {
      accessToken,
      refreshToken,
      sessionId,
      role,
    };
  }

  /**
   * Enforce max concurrent sessions per user (evict oldest)
   */
  private async enforceMaxSessions(userId: string) {
    if (this.isRedisReady() && this.redisClient) {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessions = await this.redisClient.smembers(userSessionsKey);
      if (sessions.length >= this.maxSessions) {
        // Find oldest session
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const key of sessions) {
          const raw = await this.redisClient.get(key);
          if (!raw) {
            await this.redisClient.srem(userSessionsKey, key);
            continue;
          }
          const parsed = JSON.parse(raw) as SessionData;
          if (parsed.createdAt < oldestTime) {
            oldestTime = parsed.createdAt;
            oldestKey = key;
          }
        }

        if (oldestKey) {
          await this.redisClient.del(oldestKey);
          await this.redisClient.srem(userSessionsKey, oldestKey);
          this.logger.log(`Evicted oldest session for user ${userId} to enforce limit of ${this.maxSessions}`);
        }
      }
    } else {
      const userSet = this.memoryUserSessions.get(userId);
      if (userSet && userSet.size >= this.maxSessions) {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;
        for (const key of userSet) {
          const item = this.memorySessions.get(key);
          if (item && item.data.createdAt < oldestTime) {
            oldestTime = item.data.createdAt;
            oldestKey = key;
          }
        }
        if (oldestKey) {
          this.memorySessions.delete(oldestKey);
          userSet.delete(oldestKey);
        }
      }
    }
  }

  /**
   * Refresh session with token rotation & token theft detection
   */
  async refreshSession(
    oldRefreshToken: string,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string; role: Role }> {
    const oldHash = this.cryptoService.hashToken(oldRefreshToken);
    const sessionKey = `session:${oldHash}`;

    let session: SessionData | null = null;

    if (this.isRedisReady() && this.redisClient) {
      const raw = await this.redisClient.get(sessionKey);
      if (raw) {
        session = JSON.parse(raw);
      }
    } else {
      const item = this.memorySessions.get(sessionKey);
      if (item && item.expiresAt > Date.now()) {
        session = item.data;
      }
    }

    if (!session) {
      // Token theft detection / already rotated token reused!
      this.logger.warn(`Potential token theft detected or session expired for IP ${ip}`);
      throw new UnauthorizedException("Sessiya muddati tugagan yoki xavfsizlik sababli bekor qilingan");
    }

    // Check absolute timeout (12 hours)
    const now = Date.now();
    if (now - session.createdAt > this.absoluteTimeout * 1000) {
      await this.revokeSession(oldRefreshToken);
      throw new UnauthorizedException("Sessiyaning mutlaq muddati tugadi (12 soat). Qayta kiring");
    }

    // Rotation: Delete old token hash immediately
    if (this.isRedisReady() && this.redisClient) {
      await this.redisClient.del(sessionKey);
      await this.redisClient.srem(`user_sessions:${session.userId}`, sessionKey);
    } else {
      this.memorySessions.delete(sessionKey);
      this.memoryUserSessions.get(session.userId)?.delete(sessionKey);
    }

    // Issue new 256-bit refresh token
    const newRefreshToken = this.cryptoService.generateRandomToken();
    const newHash = this.cryptoService.hashToken(newRefreshToken);
    const newSessionKey = `session:${newHash}`;

    session.lastSeenAt = now;
    session.ip = ip;
    session.userAgent = userAgent;

    if (this.isRedisReady() && this.redisClient) {
      await this.redisClient.set(newSessionKey, JSON.stringify(session), 'EX', this.idleTimeout);
      await this.redisClient.sadd(`user_sessions:${session.userId}`, newSessionKey);
    } else {
      this.memorySessions.set(newSessionKey, {
        data: session,
        expiresAt: now + this.idleTimeout * 1000,
      });
      this.memoryUserSessions.get(session.userId)?.add(newSessionKey);
    }

    // Issue new 15-minute access token
    const accessToken = this.jwtService.sign(
      {
        sub: session.userId,
        role: session.role,
        sessionId: session.sessionId,
      },
      {
        expiresIn: '15m',
      },
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      role: session.role,
    };
  }

  /**
   * Touch session to reset idle timeout on active requests
   */
  async touchSession(refreshToken: string): Promise<void> {
    const hash = this.cryptoService.hashToken(refreshToken);
    const sessionKey = `session:${hash}`;

    if (this.isRedisReady() && this.redisClient) {
      await this.redisClient.expire(sessionKey, this.idleTimeout);
    } else {
      const item = this.memorySessions.get(sessionKey);
      if (item) {
        item.expiresAt = Date.now() + this.idleTimeout * 1000;
        item.data.lastSeenAt = Date.now();
      }
    }
  }

  /**
   * Revoke single session
   */
  async revokeSession(refreshToken: string): Promise<void> {
    const hash = this.cryptoService.hashToken(refreshToken);
    const sessionKey = `session:${hash}`;

    if (this.isRedisReady() && this.redisClient) {
      const raw = await this.redisClient.get(sessionKey);
      if (raw) {
        const session = JSON.parse(raw) as SessionData;
        await this.redisClient.srem(`user_sessions:${session.userId}`, sessionKey);
      }
      await this.redisClient.del(sessionKey);
    } else {
      const item = this.memorySessions.get(sessionKey);
      if (item) {
        this.memoryUserSessions.get(item.data.userId)?.delete(sessionKey);
      }
      this.memorySessions.delete(sessionKey);
    }
  }

  /**
   * Revoke all sessions for a user (used on credential change or security alert)
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    if (this.isRedisReady() && this.redisClient) {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessions = await this.redisClient.smembers(userSessionsKey);
      for (const key of sessions) {
        await this.redisClient.del(key);
      }
      await this.redisClient.del(userSessionsKey);
    } else {
      const keys = this.memoryUserSessions.get(userId);
      if (keys) {
        for (const key of keys) {
          this.memorySessions.delete(key);
        }
        this.memoryUserSessions.delete(userId);
      }
    }
    this.logger.log(`Revoked all sessions for user ${userId}`);
  }
}
