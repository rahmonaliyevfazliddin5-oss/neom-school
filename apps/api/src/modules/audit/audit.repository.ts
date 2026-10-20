import { Injectable } from '@nestjs/common';
import { PrismaService, safeUserSelect } from '../../common/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: {
    userId?: string;
    action: string;
    ip?: string;
    userAgent?: string;
    meta?: Prisma.InputJsonValue;
  }) {
    if (!this.prisma.isConnected) {
      return null;
    }
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          ip: data.ip,
          userAgent: data.userAgent,
          meta: data.meta ?? Prisma.JsonNull,
        },
      });
    } catch {
      // In-memory fallback if database is offline
      return null;
    }
  }

  async getRecentLogs(limit = 50) {
    if (!this.prisma.isConnected) {
      return [];
    }
    try {
      return await this.prisma.auditLog.findMany({
        include: {
          user: { select: safeUserSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch {
      return [];
    }
  }
}
