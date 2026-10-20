import { Injectable, HttpException, HttpStatus, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class BruteForceService implements OnModuleInit {
  private readonly logger = new Logger(BruteForceService.name);
  private redisClient: Redis | null = null;

  // In-memory fallback
  private ipAttempts = new Map<string, { count: number; resetAt: number }>();
  private loginFailures = new Map<string, { count: number; blockedUntil: number }>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          lazyConnect: true,
          retryStrategy: () => null,
          connectTimeout: 2000,
        });
        this.redisClient.connect().catch(() => {});
      } catch (err) {
        this.logger.warn(`Redis init error in BruteForceService: ${(err as Error).message}`);
      }
    }
  }

  private isRedisReady(): boolean {
    return this.redisClient !== null && this.redisClient.status === 'ready';
  }

  /**
   * Check before login attempt:
   * 1. IP rate limit: max 10/min
   * 2. Login lock: after 5 consecutive failures, blocked for 15 minutes
   */
  async checkAttempt(ip: string, loginHash: string): Promise<void> {
    const now = Date.now();

    // 1. Check IP limit (10 per minute)
    if (this.isRedisReady() && this.redisClient) {
      const ipKey = `rate:login:ip:${ip}`;
      const count = await this.redisClient.incr(ipKey);
      if (count === 1) {
        await this.redisClient.expire(ipKey, 60);
      }
      if (count > 10) {
        throw new HttpException(
          'Juda ko‘p urinish. 1 daqiqadan keyin qayta urining',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Check login lock
      const lockKey = `lock:login:${loginHash}`;
      const isLocked = await this.redisClient.get(lockKey);
      if (isLocked) {
        throw new HttpException(
          'Juda ko‘p xato urinish. 15 daqiqadan keyin qayta urining',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } else {
      // Memory fallback
      const ipEntry = this.ipAttempts.get(ip);
      if (ipEntry && ipEntry.resetAt > now) {
        if (ipEntry.count >= 10) {
          throw new HttpException(
            'Juda ko‘p urinish. 1 daqiqadan keyin qayta urining',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        ipEntry.count++;
      } else {
        this.ipAttempts.set(ip, { count: 1, resetAt: now + 60000 });
      }

      const loginEntry = this.loginFailures.get(loginHash);
      if (loginEntry && loginEntry.blockedUntil > now) {
        throw new HttpException(
          'Juda ko‘p xato urinish. 15 daqiqadan keyin qayta urining',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
  }

  /**
   * Record failed login attempt on loginHash.
   * If reaches 5 consecutive failures, lock for 15 minutes (900s).
   */
  async recordFailure(loginHash: string): Promise<void> {
    const now = Date.now();

    if (this.isRedisReady() && this.redisClient) {
      const failKey = `fail:login:${loginHash}`;
      const lockKey = `lock:login:${loginHash}`;

      const fails = await this.redisClient.incr(failKey);
      if (fails === 1) {
        await this.redisClient.expire(failKey, 900);
      }

      if (fails >= 5) {
        await this.redisClient.set(lockKey, '1', 'EX', 900); // 15 mins
        await this.redisClient.del(failKey);
        this.logger.warn(`Login hash ${loginHash} locked for 15 minutes due to 5 consecutive failures`);
      }
    } else {
      const entry = this.loginFailures.get(loginHash) || { count: 0, blockedUntil: 0 };
      entry.count++;
      if (entry.count >= 5) {
        entry.blockedUntil = now + 900 * 1000;
        entry.count = 0;
        this.logger.warn(`Login hash ${loginHash} locked in memory for 15 minutes`);
      }
      this.loginFailures.set(loginHash, entry);
    }
  }

  /**
   * Reset failed attempts on successful login
   */
  async recordSuccess(loginHash: string): Promise<void> {
    if (this.isRedisReady() && this.redisClient) {
      await this.redisClient.del(`fail:login:${loginHash}`);
      await this.redisClient.del(`lock:login:${loginHash}`);
    } else {
      this.loginFailures.delete(loginHash);
    }
  }
}
