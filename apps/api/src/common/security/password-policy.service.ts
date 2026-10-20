import { Injectable, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class PasswordPolicyService implements OnModuleInit {
  private readonly logger = new Logger(PasswordPolicyService.name);
  private commonPasswords = new Set<string>();

  onModuleInit() {
    this.loadCommonPasswords();
  }

  private loadCommonPasswords() {
    try {
      const filePath = path.join(__dirname, 'common-passwords.txt');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/).map((l) => l.trim().toLowerCase()).filter(Boolean);
        this.commonPasswords = new Set(lines);
        this.logger.log(`🛡️ Loaded ${this.commonPasswords.size} common passwords for rejection list`);
      } else {
        this.logger.warn('common-passwords.txt not found, using built-in common list');
      }
    } catch (err) {
      this.logger.warn(`Failed to read common-passwords.txt: ${(err as Error).message}`);
    }
  }

  validatePassword(password: string, login?: string): PasswordValidationResult {
    const errors: string[] = [];

    // 1. Kamida 10 belgi
    if (!password || password.length < 10) {
      errors.push("Parol kamida 10 ta belgidan iborat bo'lishi kerak");
    }

    // 2. Katta harf
    if (!/[A-Z]/.test(password)) {
      errors.push("Parolda kamida bitta katta harf (A-Z) bo'lishi kerak");
    }

    // 3. Kichik harf
    if (!/[a-z]/.test(password)) {
      errors.push("Parolda kamida bitta kichik harf (a-z) bo'lishi kerak");
    }

    // 4. Raqam
    if (!/[0-9]/.test(password)) {
      errors.push("Parolda kamida bitta raqam (0-9) bo'lishi kerak");
    }

    // 5. Eng ko'p uchraydigan parollar ro'yxatidan tekshirish
    if (this.commonPasswords.has(password.toLowerCase())) {
      errors.push("Bu parol juda oddiy va keng tarqalgan. Xavfsizroq parol tanlang");
    }

    // 6. Loginga o'xshash bo'lmasligi kerak
    if (login && login.length >= 3) {
      const normLogin = login.toLowerCase();
      const normPass = password.toLowerCase();

      if (normPass.includes(normLogin) || normLogin.includes(normPass)) {
        errors.push("Parol login bilan bir xil yoki loginga o'xshash bo'lmasligi kerak");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  assertValid(password: string, login?: string) {
    const result = this.validatePassword(password, login);
    if (!result.valid) {
      throw new BadRequestException(result.errors[0]);
    }
  }
}
