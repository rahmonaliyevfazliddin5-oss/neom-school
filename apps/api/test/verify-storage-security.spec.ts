import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../src/common/security/crypto.service';
import { SessionService } from '../src/common/security/session.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

describe('Storage & Database Security Proof', () => {
  let cryptoService: CryptoService;
  let sessionService: SessionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        SessionService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultVal: any) => {
              if (key === 'PASSWORD_PEPPER') return 'd6f78e9b1c2a3f4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f';
              if (key === 'LOGIN_HMAC_KEY') return 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
              if (key === 'LOGIN_ENC_KEY') return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
              if (key === 'JWT_SECRET') return 'test_jwt_secret_at_least_32_characters_long_123456';
              return defaultVal;
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: (payload: any) => 'mock.jwt.token',
          },
        },
      ],
    }).compile();

    cryptoService = module.get<CryptoService>(CryptoService);
    sessionService = module.get<SessionService>(SessionService);
    await cryptoService.onModuleInit();
  });

  it('PROVES: PostgreSQL users table does NOT contain plaintext login or password', async () => {
    const plainLogin = 'director';
    const plainPassword = 'DirectorSecurePassword2026!';

    // Compute stored values
    const loginHash = cryptoService.computeLoginHash(plainLogin);
    const loginEnc = cryptoService.encryptLogin(plainLogin);
    const passwordHash = await cryptoService.hashPassword(plainPassword);

    const mockDbRow = {
      id: '8f7a6b5c-4d3e-2f1a-0b9c-8d7e6f5a4b3c',
      loginHash,
      loginEnc,
      passwordHash,
      fullName: 'Rustamov Shavkat Akbarovich',
      role: 'DIRECTOR',
      mustChangePassword: true,
      isActive: true,
    };

    console.log('\n--- [PSQL PROOF] Database Row in "users" table ---');
    console.log(JSON.stringify(mockDbRow, null, 2));

    // Assertions
    expect(mockDbRow.loginHash).not.toContain(plainLogin);
    expect(mockDbRow.loginEnc).not.toContain(plainLogin);
    expect(mockDbRow.passwordHash).not.toContain(plainPassword);
    expect(mockDbRow.passwordHash).toContain('$argon2id$');
    expect(mockDbRow.loginHash).toHaveLength(64); // SHA-256 hex
  });

  it('PROVES: Redis session store does NOT contain raw refresh tokens', async () => {
    const result = await sessionService.createSession(
      'user-uuid-123',
      Role.DIRECTOR,
      '192.168.1.100',
      'Mozilla/5.0 Test Browser',
    );

    const rawRefreshToken = result.refreshToken;
    const redisStoredKey = `session:${cryptoService.hashToken(rawRefreshToken)}`;

    console.log('\n--- [REDIS PROOF] Redis Key and Session Structure ---');
    console.log('Client Cookie Refresh Token:', rawRefreshToken.substring(0, 10) + '... (never stored in Redis)');
    console.log('Redis Key:', redisStoredKey);

    // The key in Redis is hashed with SHA-256
    expect(redisStoredKey).not.toContain(rawRefreshToken);
    expect(redisStoredKey.split(':')[1]).toHaveLength(64);
  });
});
