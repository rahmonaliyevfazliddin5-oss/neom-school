import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CryptoService } from '../../common/security/crypto.service';
import { PasswordPolicyService } from '../../common/security/password-policy.service';
import { Role, SafeUser } from '@neom/shared';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private readonly passwordPolicyService: PasswordPolicyService,
  ) {}

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }
    return user;
  }

  async findByLogin(login: string): Promise<SafeUser | null> {
    const loginHash = this.cryptoService.computeLoginHash(login);
    return this.usersRepository.findByLoginHash(loginHash);
  }

  async getAllUsers(role?: Role): Promise<SafeUser[]> {
    return this.usersRepository.findAll(role ? { role } : undefined);
  }

  async createUser(data: {
    login: string;
    fullName: string;
    password: string;
    role: Role;
    mustChangePassword?: boolean;
  }): Promise<SafeUser> {
    const loginHash = this.cryptoService.computeLoginHash(data.login);
    const existing = await this.usersRepository.findByLoginHash(loginHash);
    if (existing) {
      throw new ConflictException("Ushbu login band yoki yaroqsiz");
    }

    // Validate password policy
    this.passwordPolicyService.assertValid(data.password, data.login);

    const passwordHash = await this.cryptoService.hashPassword(data.password);

    return this.usersRepository.create({
      login: data.login,
      fullName: data.fullName,
      passwordHash,
      role: data.role,
      mustChangePassword: data.mustChangePassword ?? true,
    });
  }

  async changeCredentials(
    userId: string,
    currentPass: string,
    newPass?: string,
    newLogin?: string,
    fullName?: string,
  ): Promise<{ message: string; user: SafeUser }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }

    const currentLoginHash = this.cryptoService.computeLoginHash(user.login);
    const userWithPass = await this.usersRepository.findByLoginHashWithPassword(currentLoginHash);
    if (!userWithPass) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }

    // 1. Verify current password
    const isMatch = await this.cryptoService.verifyPassword(userWithPass.passwordHash, currentPass);
    if (!isMatch) {
      throw new BadRequestException("Joriy parol noto'g'ri");
    }

    // 2. Validate new login if provided
    let verifiedNewLogin: string | undefined = undefined;
    if (newLogin && newLogin.trim()) {
      const cleanNew = newLogin.trim();
      const newHash = this.cryptoService.computeLoginHash(cleanNew);

      if (newHash !== currentLoginHash) {
        const existing = await this.usersRepository.findByLoginHash(newHash);
        if (existing) {
          throw new ConflictException("Ushbu login band yoki yaroqsiz");
        }
        verifiedNewLogin = cleanNew;
      }
    }

    // 3. Validate new password policy if provided
    let newPasswordHash: string = userWithPass.passwordHash;
    if (newPass && newPass.trim()) {
      const effectiveLogin = verifiedNewLogin || user.login;
      this.passwordPolicyService.assertValid(newPass, effectiveLogin);
      newPasswordHash = await this.cryptoService.hashPassword(newPass);
    }

    // 4. Update credentials
    const updated = await this.usersRepository.updateCredentials(userId, {
      passwordHash: newPasswordHash,
      newLogin: verifiedNewLogin,
      fullName: fullName?.trim() || undefined,
    });

    return {
      message: "Ma'lumotlar muvaffaqiyatli yangilandi",
      user: updated,
    };
  }
}
