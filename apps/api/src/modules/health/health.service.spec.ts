import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../../common/database/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('HealthService', () => {
  let service: HealthService;
  let mockPrisma: Partial<PrismaService>;
  let mockConfig: Partial<ConfigService>;

  beforeEach(async () => {
    mockPrisma = {
      ping: jest.fn().mockResolvedValue(true),
    };
    mockConfig = {
      get: jest.fn().mockReturnValue(''),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return health check result structure', async () => {
    const result = await service.checkHealth();
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('services');
    expect(result.services).toHaveProperty('database');
    expect(result.services).toHaveProperty('redis');
  });
});
