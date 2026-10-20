import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class PublicCacheService implements OnModuleInit {
  private readonly logger = new Logger(PublicCacheService.name);
  private redisClient: Redis | null = null;
  // In-memory cache fallback for testing/offline redis
  private readonly memoryCache = new Map<string, { value: string; expiresAt: number }>();

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
        this.redisClient.connect().catch((err) => {
          this.logger.warn(`Redis not reachable for PublicCache (${err.message}). Using memory fallback.`);
        });
      } catch (err) {
        this.logger.warn(`Redis init error in PublicCache: ${(err as Error).message}`);
      }
    }
  }

  private isRedisReady(): boolean {
    return this.redisClient !== null && this.redisClient.status === 'ready';
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisReady() && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
      } catch (err) {
        this.logger.warn(`Redis get error for ${key}: ${(err as Error).message}`);
      }
    }

    // Memory fallback
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return JSON.parse(item.value) as T;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (this.isRedisReady() && this.redisClient) {
      try {
        await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
        return;
      } catch (err) {
        this.logger.warn(`Redis set error for ${key}: ${(err as Error).message}`);
      }
    }

    // Memory fallback
    this.memoryCache.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisReady() && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        this.logger.warn(`Redis del error for ${key}: ${(err as Error).message}`);
      }
    }
    this.memoryCache.delete(key);
  }

  /**
   * Invalidate all public post cache entries (both lists and single details)
   */
  async invalidatePostsCache(): Promise<void> {
    if (this.isRedisReady() && this.redisClient) {
      try {
        const stream = this.redisClient.scanStream({
          match: 'public:post*',
          count: 50,
        });
        const keysToDelete: string[] = [];
        for await (const resultKeys of stream) {
          if (resultKeys.length > 0) {
            keysToDelete.push(...resultKeys);
          }
        }
        if (keysToDelete.length > 0) {
          await this.redisClient.del(...keysToDelete);
        }
      } catch (err) {
        this.logger.warn(`Redis invalidatePostsCache error: ${(err as Error).message}`);
      }
    }

    // Memory fallback
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith('public:post')) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Invalidate public settings cache
   */
  async invalidateSettingsCache(): Promise<void> {
    await this.del('public:settings');
  }
}
