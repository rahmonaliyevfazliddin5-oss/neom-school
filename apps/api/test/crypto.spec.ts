import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../src/common/security/crypto.service';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'PASSWORD_PEPPER') return 'test_pepper_value_strictly_32_chars_long!';
              if (key === 'LOGIN_HMAC_KEY') return 'test_hmac_key_value_strictly_32_chars_long!';
              if (key === 'LOGIN_ENC_KEY') return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
              return null;
            },
          },
        },
      ],
    }).compile();

    cryptoService = module.get<CryptoService>(CryptoService);
    await cryptoService.onModuleInit();
  });

  describe('Login Normalization and Blind Indexing', () => {
    it('should normalize login using NFKC, trim, and lowercase', () => {
      const input = '  Admin_User_2026\u00A0 ';
      const normalized = cryptoService.normalizeLogin(input);
      expect(normalized).toBe('admin_user_2026');
    });

    it('should compute deterministic HMAC-SHA256 loginHash', () => {
      const hash1 = cryptoService.computeLoginHash('teacher1');
      const hash2 = cryptoService.computeLoginHash('  TEACHER1 ');
      const hashDifferent = cryptoService.computeLoginHash('teacher2');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hashDifferent);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should encrypt and decrypt login using AES-256-GCM reversibly', () => {
      const login = 'director_rustamov';
      const encrypted = cryptoService.encryptLogin(login);

      expect(encrypted).not.toContain(login);
      expect(encrypted.split(':').length).toBe(3); // iv:tag:ciphertext

      const decrypted = cryptoService.decryptLogin(encrypted);
      expect(decrypted).toBe(login);
    });

    it('should use random IVs so encrypting same login twice produces different ciphertexts', () => {
      const login = 'zavuch';
      const enc1 = cryptoService.encryptLogin(login);
      const enc2 = cryptoService.encryptLogin(login);

      expect(enc1).not.toBe(enc2);
      expect(cryptoService.decryptLogin(enc1)).toBe(login);
      expect(cryptoService.decryptLogin(enc2)).toBe(login);
    });
  });

  describe('Password Hashing with Argon2id and Pepper', () => {
    it('should hash password with Argon2id and verify correctly', async () => {
      const password = 'SuperSecretPassword2026!';
      const hash = await cryptoService.hashPassword(password);

      expect(hash).toContain('$argon2id$');
      expect(hash).not.toContain(password);

      const isValid = await cryptoService.verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await cryptoService.verifyPassword(hash, 'WrongPassword2026!');
      expect(isInvalid).toBe(false);
    });

    it('should perform dummy verification on unknown user without throwing', async () => {
      const isDummyValid = await cryptoService.verifyDummyPassword('SomePassword123!');
      expect(isDummyValid).toBe(false);
    });
  });

  describe('Session Token Generation', () => {
    it('should generate 256-bit random session tokens', () => {
      const token1 = cryptoService.generateRandomToken();
      const token2 = cryptoService.generateRandomToken();

      expect(token1).toHaveLength(64); // 32 bytes in hex = 64 chars
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });

    it('should hash tokens with SHA-256 for Redis storage', () => {
      const token = cryptoService.generateRandomToken();
      const hash = cryptoService.hashToken(token);

      expect(hash).toHaveLength(64);
      expect(hash).toBe(cryptoService.hashToken(token));
    });
  });
});
