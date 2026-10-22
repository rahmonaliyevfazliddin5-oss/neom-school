import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Role } from '@prisma/client';
import { UsersRepository } from '../src/modules/users/users.repository';
import { CryptoService } from '../src/common/security/crypto.service';
import { PrismaService } from '../src/common/database/prisma.service';

function getCookiesArray(res: request.Response): string[] {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

describe('Auth & Security Layer (E2E)', () => {
  let app: INestApplication;
  let usersRepository: UsersRepository;
  let cryptoService: CryptoService;

  const testUser = {
    login: 'test_teacher_2026',
    password: 'InitialPassword2026!',
    fullName: 'Test Ustoz Alisher',
    role: Role.TEACHER,
  };

  const usersStore = new Map<string, any>();
  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    user: {
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        if (where.id) {
          for (const u of usersStore.values()) {
            if (u.id === where.id) return Promise.resolve(u);
          }
        }
        if (where.loginHash) {
          return Promise.resolve(usersStore.get(where.loginHash) || null);
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation(({ data }: any) => {
        const record = {
          id: 'test-user-uuid-' + Math.random().toString(36).substring(7),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        usersStore.set(data.loginHash, record);
        return Promise.resolve(record);
      }),
      update: jest.fn().mockImplementation(({ where, data }: any) => {
        const u = Array.from(usersStore.values()).find((x) => x.id === where.id);
        if (u) {
          Object.assign(u, data);
          return Promise.resolve(u);
        }
        return Promise.resolve(null);
      }),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'mock-audit-id' }),
    },
    siteSetting: {
      findFirst: jest.fn().mockResolvedValue(null),
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
    app.use(cookieParser('test_cookie_secret_key_12345678901234567890'));
    app.setGlobalPrefix('api', { exclude: ['health'] });
    await app.init();

    usersRepository = moduleFixture.get<UsersRepository>(UsersRepository);
    cryptoService = moduleFixture.get<CryptoService>(CryptoService);

    // Seed/Ensure test user exists
    const loginHash = cryptoService.computeLoginHash(testUser.login);
    const existing = await usersRepository.findByLoginHash(loginHash);
    if (!existing) {
      const hash = await cryptoService.hashPassword(testUser.password);
      await usersRepository.create({
        login: testUser.login,
        fullName: testUser.fullName,
        passwordHash: hash,
        role: testUser.role as any,
        mustChangePassword: true,
      });
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/auth/login', () => {
    it('should successfully log in, set httpOnly session cookies without max-age, and return role without leaking tokens or hashes', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          login: testUser.login,
          password: testUser.password,
        })
        .expect(200);

      // Verify Response Body
      expect(res.body).toHaveProperty('role', Role.TEACHER);
      expect(res.body).toHaveProperty('redirectUrl', '/panel/ustoz');
      expect(res.body).toHaveProperty('mustChangePassword', true);

      // Crucial: No credentials, tokens, or hashes leaked in JSON response body
      expect(res.body).not.toHaveProperty('accessToken');
      expect(res.body).not.toHaveProperty('refreshToken');
      expect(res.body).not.toHaveProperty('passwordHash');
      expect(res.body).not.toHaveProperty('loginHash');

      // Verify Cookies: httpOnly, SameSite=Strict, Secure (or set), NO Max-Age (Session Cookie)
      const cookies = getCookiesArray(res);
      const accessCookie = cookies.find((c) => c.startsWith('neom_access_token='));
      const refreshCookie = cookies.find((c) => c.startsWith('neom_refresh_token='));

      expect(accessCookie).toBeDefined();
      expect(refreshCookie).toBeDefined();

      expect(accessCookie).toContain('HttpOnly');
      expect(accessCookie).toContain('SameSite=Strict');
      expect(accessCookie).not.toContain('Max-Age=');
      expect(accessCookie).not.toContain('Expires=');
    });

    it('should fail with 401 and generic message when password is wrong', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          login: testUser.login,
          password: 'CompletelyWrongPassword123!',
        })
        .expect(401);

      expect(res.body.message).toBe("Login yoki parol noto'g'ri");
    });

    it('should fail with identical 401 when user does not exist (Timing Attack Mitigation)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          login: 'non_existent_user_99999',
          password: 'SomePassword123!',
        })
        .expect(401);

      expect(res.body.message).toBe("Login yoki parol noto'g'ri");
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return only fullName, role, and mustChangePassword with valid session cookie', async () => {
      // 1. Log in
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          login: testUser.login,
          password: testUser.password,
        })
        .expect(200);

      const cookies = getCookiesArray(loginRes);

      // 2. Fetch /auth/me with cookies
      const meRes = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', cookies)
        .expect(200);

      expect(meRes.body).toHaveProperty('fullName', testUser.fullName);
      expect(meRes.body).toHaveProperty('role', Role.TEACHER);
      expect(meRes.body).toHaveProperty('mustChangePassword', true);

      // Verify no extra sensitive fields
      expect(meRes.body).not.toHaveProperty('passwordHash');
      expect(meRes.body).not.toHaveProperty('loginHash');
      expect(meRes.body).not.toHaveProperty('loginEnc');
    });

    it('should reject unauthenticated request with 401', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });
  });

  describe('Session Token Rotation & Invalidation', () => {
    it('should rotate refresh token and invalidate previous token', async () => {
      // 1. Initial Login
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ login: testUser.login, password: testUser.password })
        .expect(200);

      const initialCookies = getCookiesArray(loginRes);
      const initialRefresh = initialCookies.find((c) => c.startsWith('neom_refresh_token='));

      // 2. Call /auth/refresh
      const refreshRes = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', initialCookies)
        .expect(200);

      const rotatedCookies = getCookiesArray(refreshRes);
      const rotatedRefresh = rotatedCookies.find((c) => c.startsWith('neom_refresh_token='));

      // New token must be different from initial token
      expect(rotatedRefresh).toBeDefined();
      expect(rotatedRefresh).not.toEqual(initialRefresh);

      // 3. Attempting to reuse old refresh token MUST fail and trigger token theft revocation
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', initialCookies)
        .expect(401);
    });

    it('should clear cookies on logout and prevent subsequent requests', async () => {
      // 1. Log in
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ login: testUser.login, password: testUser.password })
        .expect(200);

      const cookies = getCookiesArray(loginRes);

      // 2. Log out
      const logoutRes = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      // Check cookies cleared (Max-Age=0 or empty value)
      const clearedCookies = getCookiesArray(logoutRes);
      const clearedAccess = clearedCookies.find((c) => c.startsWith('neom_access_token='));
      expect(clearedAccess).toBeDefined();
      expect(clearedAccess).toContain('neom_access_token=;');

      // 3. Trying to access protected route with cleared cookies must fail with 401
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', clearedCookies)
        .expect(401);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should deny TEACHER from accessing DIRECTOR-only endpoints (403 Forbidden)', async () => {
      // 1. Log in as TEACHER
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ login: testUser.login, password: testUser.password })
        .expect(200);

      const cookies = getCookiesArray(loginRes);

      // 2. Attempt to hit a DIRECTOR/ZAVUCH endpoint
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Cookie', cookies)
        .expect(403);
    });
  });
});
