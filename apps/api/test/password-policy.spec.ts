import { Test, TestingModule } from '@nestjs/testing';
import { PasswordPolicyService } from '../src/common/security/password-policy.service';

describe('PasswordPolicyService', () => {
  let service: PasswordPolicyService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordPolicyService],
    }).compile();

    service = module.get<PasswordPolicyService>(PasswordPolicyService);
    service.onModuleInit();
  });

  it('should reject passwords shorter than 10 characters', () => {
    const res = service.validatePassword('Short123!');
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Parol kamida 10 ta belgidan iborat bo'lishi kerak");
  });

  it('should reject passwords missing uppercase letters', () => {
    const res = service.validatePassword('alllowercase123!');
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Parolda kamida bitta katta harf (A-Z) bo'lishi kerak");
  });

  it('should reject passwords missing lowercase letters', () => {
    const res = service.validatePassword('ALLLOWERCASE123!');
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Parolda kamida bitta kichik harf (a-z) bo'lishi kerak");
  });

  it('should reject passwords missing numbers', () => {
    const res = service.validatePassword('NoNumbersHereAtAll!');
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Parolda kamida bitta raqam (0-9) bo'lishi kerak");
  });

  it('should reject common weak passwords', () => {
    const res = service.validatePassword('password123');
    expect(res.valid).toBe(false);
    expect(res.errors).toContain('Bu parol juda oddiy va keng tarqalgan. Xavfsizroq parol tanlang');
  });

  it('should reject passwords similar to the login', () => {
    const res = service.validatePassword('Teacher1_Secure123', 'teacher1');
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Parol login bilan bir xil yoki loginga o'xshash bo'lmasligi kerak");
  });

  it('should accept strong unique passwords meeting all requirements', () => {
    const res = service.validatePassword('Qodirov_Jamshid_2026_Xavfsiz!', 'teacher1');
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });
});
