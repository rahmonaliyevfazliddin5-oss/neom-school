import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async record(data: {
    userId?: string;
    action: string;
    ip?: string;
    userAgent?: string;
    meta?: Prisma.InputJsonValue;
  }) {
    return this.auditRepository.createLog(data);
  }

  async getLogs(limit?: number) {
    return this.auditRepository.getRecentLogs(limit);
  }
}
