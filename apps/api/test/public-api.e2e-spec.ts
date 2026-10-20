import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { PublicCacheService } from '../src/modules/public/public-cache.service';
import { MediaService } from '../src/modules/media/media.service';
import { PostType } from '@prisma/client';

describe('Public API & Media Layer (E2E / Integration)', () => {
  let app: INestApplication;
  let cache: PublicCacheService;
  let mediaService: MediaService;

  const publishedNewsId = 'pub-news-123';
  const draftPostId = 'draft-post-456';

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    siteSetting: {
      findFirst: jest.fn().mockResolvedValue({
        key: 'site_settings',
        value: {
          stats: {
            teachers: null,
            students: null,
            classrooms: null,
            graduatesRate: null,
          },
          address: null,
          phone: null,
          workHours: null,
        },
      }),
    },
    post: {
      findMany: jest.fn().mockImplementation((args?: any) => {
        // Only return published posts whose publishedAt <= now
        if (args?.where?.isPublished === true) {
          return Promise.resolve([
            {
              id: publishedNewsId,
              type: PostType.NEWS,
              title: 'E2E Sinov Yangiligi',
              body: 'Bu birinchi e2e sinov yangiligi bo‘lib, juda ham uzun matnga ega. '.repeat(10),
              eventDate: null,
              thumbUrl: null,
              publishedAt: new Date(Date.now() - 3600000),
              updatedAt: new Date(Date.now() - 3600000),
            },
          ]);
        }
        return Promise.resolve([]);
      }),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn().mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === publishedNewsId) {
          return Promise.resolve({
            id: publishedNewsId,
            type: PostType.NEWS,
            title: 'E2E Sinov Yangiligi',
            body: 'Bu to‘liq eʼlon matni bo‘lib, ommaga eʼlon qilingan.',
            eventDate: null,
            imageUrl: null,
            thumbUrl: null,
            isPublished: true,
            publishedAt: new Date(Date.now() - 3600000),
            updatedAt: new Date(Date.now() - 3600000),
          });
        }
        if (where.id === draftPostId) {
          return Promise.resolve({
            id: draftPostId,
            type: PostType.NEWS,
            title: 'Qoralama Post',
            body: 'Maxfiy qoralama matn',
            eventDate: null,
            imageUrl: null,
            thumbUrl: null,
            isPublished: false, // DRAFT!
            publishedAt: null,
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      }),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api', { exclude: ['health'] });
    await app.init();

    cache = moduleFixture.get<PublicCacheService>(PublicCacheService);
    mediaService = moduleFixture.get<MediaService>(MediaService);

    // Create a dummy media file in uploads
    const uploadsDir = mediaService.getUploadsDir();
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadsDir, 'test-logo.png'), 'fake-image-content-bytes');
  });

  afterAll(async () => {
    if (mediaService) {
      const testFile = path.join(mediaService.getUploadsDir(), 'test-logo.png');
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/public/settings', () => {
    it('should return site settings with stats and contact info', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/public/settings')
        .expect(200);

      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats).toHaveProperty('teachers', null);
      expect(res.body.stats).toHaveProperty('students', null);
      expect(res.body.stats).toHaveProperty('classrooms', null);
      expect(res.body.stats).toHaveProperty('graduatesRate', null);
      expect(res.body).toHaveProperty('address', null);
      expect(res.body).toHaveProperty('phone', null);
      expect(res.body).toHaveProperty('workHours', null);

      // Verify Cache-Control header
      expect(res.headers['cache-control']).toContain('public');
      expect(res.headers['cache-control']).toContain('max-age=60');
    });
  });

  describe('GET /api/public/posts', () => {
    it('should return only published posts and exclude drafts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/public/posts')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);

      const ids = res.body.data.map((p: any) => p.id);
      expect(ids).toContain(publishedNewsId);
      expect(ids).not.toContain(draftPostId);

      // Verify fields on item
      const item = res.body.data.find((p: any) => p.id === publishedNewsId);
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('type', 'NEWS');
      expect(item).toHaveProperty('title', 'E2E Sinov Yangiligi');
      expect(item).toHaveProperty('excerpt');
      expect(item.excerpt.length).toBeLessThanOrEqual(163); // 160 + '...'
      expect(item).not.toHaveProperty('createdById');
      expect(item).not.toHaveProperty('password');
    });

    it('should support pagination (limit & page)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/public/posts?page=1&limit=1')
        .expect(200);

      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(1);
    });

    it('should reject invalid post type with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .get('/api/public/posts?type=INVALID_TYPE')
        .expect(400);
    });
  });

  describe('GET /api/public/posts/:id', () => {
    it('should return full details for a published post with 300s cache headers', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/public/posts/${publishedNewsId}`)
        .expect(200);

      expect(res.body.id).toBe(publishedNewsId);
      expect(res.body.title).toBe('E2E Sinov Yangiligi');
      expect(res.body).toHaveProperty('body');
      expect(res.headers['cache-control']).toContain('public');
      expect(res.headers['cache-control']).toContain('max-age=300');
    });

    it('should return 404 for a draft post', async () => {
      await request(app.getHttpServer())
        .get(`/api/public/posts/${draftPostId}`)
        .expect(404);
    });

    it('should return 404 for a non-existent post id', async () => {
      await request(app.getHttpServer())
        .get('/api/public/posts/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('Cache & Cache Invalidation', () => {
    it('should correctly set cache and allow invalidation', async () => {
      // 1. Fetch to populate cache
      await request(app.getHttpServer()).get('/api/public/posts').expect(200);
      const cached = await cache.get(`public:posts:ALL:1:6`);
      expect(cached).toBeDefined();

      // 2. Invalidate cache
      await cache.invalidatePostsCache();
      const afterInvalidation = await cache.get(`public:posts:ALL:1:6`);
      expect(afterInvalidation).toBeNull();
    });
  });

  describe('Static Media & Path Traversal Protection (GET /api/media/:file)', () => {
    it('should serve an existing static image with nosniff and immutable cache headers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/media/test-logo.png')
        .expect(200);

      expect(res.headers['cache-control']).toContain('public');
      expect(res.headers['cache-control']).toContain('immutable');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.body.toString()).toBe('fake-image-content-bytes');
    });

    it('should return 404 for non-existent file', async () => {
      await request(app.getHttpServer())
        .get('/api/media/definitely-not-here.png')
        .expect(404);
    });

    it('should block path traversal attempts with 400 Bad Request', async () => {
      // Direct path traversal with ..
      await request(app.getHttpServer())
        .get('/api/media/..%2f..%2fpackage.json')
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/media/..%5c..%5cpackage.json')
        .expect(400);
    });
  });
});
