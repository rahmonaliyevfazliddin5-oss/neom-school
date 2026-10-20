import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly logger = new Logger(CryptoService.name);
  private pepper!: string;
  private loginHmacKey!: string;
  private loginEncKey!: Buffer;
  private dummyPasswordHash!: string;

  constructor(private readonly configService: ConfigService) {
    this.initKeys();
  }

  private initKeys() {
    this.pepper = this.configService.get<string>('PASSWORD_PEPPER') || 'fallback_pepper_32_characters_minimum_secure';
    this.loginHmacKey = this.configService.get<string>('LOGIN_HMAC_KEY') || 'fallback_hmac_key_32_characters_minimum_secure';

    const encKeyRaw = this.configService.get<string>('LOGIN_ENC_KEY') || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    // Ensure 32 bytes for AES-256-GCM
    if (encKeyRaw.length === 64) {
      this.loginEncKey = Buffer.from(encKeyRaw, 'hex');
    } else {
      this.loginEncKey = crypto.createHash('sha256').update(encKeyRaw).digest();
    }
  }

  async onModuleInit() {
    // Generate pre-computed dummy hash for constant-time dummy verification
    try {
      const dummyPeppered = this.pepperPassword('__dummy_timing_attack_prevention_password__');
      this.dummyPasswordHash = await argon2.hash(dummyPeppered, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MiB
        timeCost: 3,
        parallelism: 1,
      });
      this.logger.log('🔐 Cryptography service initialized with Argon2id + AES-256-GCM + HMAC-SHA256');
    } catch (err) {
      this.logger.error('Failed to pre-compute dummy hash', err);
    }
  }

  /**
   * Normalize login: Unicode NFKC, trim, lowercase
   */
  normalizeLogin(login: string): string {
    return login.trim().toLowerCase().normalize('NFKC');
  }

  /**
   * Deterministic HMAC-SHA256 hash for database unique index search
   */
  computeLoginHash(login: string): string {
    const normalized = this.normalizeLogin(login);
    return crypto
      .createHmac('sha256', this.loginHmacKey)
      .update(normalized)
      .digest('hex');
  }

  /**
   * AES-256-GCM reversible encryption for display
   * Format: iv:authTag:ciphertext (all in hex)
   */
  encryptLogin(login: string): string {
    const normalized = this.normalizeLogin(login);
    const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', this.loginEncKey, iv);

    let encrypted = cipher.update(normalized, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * AES-256-GCM decryption
   */
  decryptLogin(loginEnc: string): string {
    try {
      const parts = loginEnc.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted format');
      }
      const [ivHex, tagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(tagHex, 'hex');

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.loginEncKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return '[encrypted]';
    }
  }

  /**
   * Apply server-side pepper via HMAC-SHA256
   */
  pepperPassword(password: string): string {
    return crypto
      .createHmac('sha256', this.pepper)
      .update(password)
      .digest('hex');
  }

  /**
   * Hash password using Argon2id (memory: 64 MiB, time: 3, parallelism: 1) + Pepper
   */
  async hashPassword(password: string): Promise<string> {
    const peppered = this.pepperPassword(password);
    return argon2.hash(peppered, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MiB
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Verify password against Argon2id hash + Pepper
   */
  async verifyPassword(hash: string, password: string): Promise<boolean> {
    const peppered = this.pepperPassword(password);
    try {
      return await argon2.verify(hash, peppered);
    } catch {
      return false;
    }
  }

  /**
   * Execute dummy verify to protect against timing attacks when user is not found
   */
  async verifyDummyPassword(password: string): Promise<boolean> {
    const peppered = this.pepperPassword(password);
    if (!this.dummyPasswordHash) {
      // In case dummy was not ready on startup
      return false;
    }
    try {
      await argon2.verify(this.dummyPasswordHash, peppered);
    } catch {
      // Intentionally ignore result
    }
    return false;
  }

  /**
   * Generate 256-bit random cryptographic session token
   */
  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * SHA-256 hash of token (stored in Redis, token itself sent only in cookie)
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
