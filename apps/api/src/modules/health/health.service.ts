import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/database/prisma.service';
import Redis from 'ioredis';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'up' | 'down';
      message?: string;
    };
    redis: {
      status: 'up' | 'down';
      message?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private redisClient: Redis | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          lazyConnect: true,
          retryStrategy: () => null, // don't spam reconnection attempts in background
          connectTimeout: 2000,
        });
      } catch (err) {
        this.logger.warn(`Failed to initialize Redis client: ${(err as Error).message}`);
      }
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    // 1. Database check
    let dbStatus: 'up' | 'down' = 'down';
    let dbMessage: string | undefined;

    try {
      const isDbOk = await this.prisma.ping();
      if (isDbOk) {
        dbStatus = 'up';
      } else {
        dbMessage = 'Database ping failed';
      }
    } catch (err) {
      dbStatus = 'down';
      dbMessage = (err as Error).message;
    }

    // 2. Redis check
    let redisStatus: 'up' | 'down' = 'down';
    let redisMessage: string | undefined;

    if (this.redisClient) {
      try {
        if (this.redisClient.status !== 'ready') {
          await this.redisClient.connect();
        }
        const pong = await this.redisClient.ping();
        if (pong === 'PONG') {
          redisStatus = 'up';
        }
      } catch (err) {
        redisStatus = 'down';
        redisMessage = (err as Error).message;
      }
    } else {
      redisMessage = 'Redis client not configured';
    }

    const isAllOk = dbStatus === 'up' && redisStatus === 'up';

    return {
      status: isAllOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: dbStatus,
          message: dbMessage,
        },
        redis: {
          status: redisStatus,
          message: redisMessage,
        },
      },
    };
  }
}
