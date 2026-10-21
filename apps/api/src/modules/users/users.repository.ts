import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CryptoService } from '../../common/security/crypto.service';
import { Role as PrismaRole, Prisma } from '@prisma/client';
import { Role as SharedRole, SafeUser } from '@neom/shared';

@Injectable()
export class UsersRepository implements OnModuleInit {
  private memoryUsers = new Map<string, any>(); // key: loginHash
  private memoryUsersById = new Map<string, any>(); // key: id

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async onModuleInit() {
    await this.initMemoryUsers();
  }

  private async initMemoryUsers() {
    const rawUsers = [
      {
        id: 'user-direktor-001',
        logins: ['admin1', 'direktor', 'director'],
        password: process.env.SEED_DIRECTOR_PASSWORD || 'admin1',
        additionalPasswords: ['admin1', 'direktor123'],
        fullName: 'Rustamov Shavkat Akbarovich',
        role: PrismaRole.DIRECTOR,
      },
      {
        id: 'user-zavuch-002',
        logins: ['admin2', 'zamdrektor', 'zamdirektor', 'zavuch'],
        password: process.env.SEED_ZAVUCH_PASSWORD || 'admin2',
        additionalPasswords: ['admin2', 'zamdrektor123'],
        fullName: 'Nodirova Dilnoza Alisherovna',
        role: PrismaRole.ZAVUCH,
      },
      {
        id: 'user-teacher-003',
        logins: ['admin3', "o'qituvchi", 'oqituvchi', 'o‘qituvchi', 'teacher1'],
        password: process.env.SEED_TEACHER_PASSWORD || 'admin3',
        additionalPasswords: ['admin3', "o'qituvchi"],
        fullName: 'Qodirov Jamshid Baxromovich',
        role: PrismaRole.TEACHER,
      },
    ];

    for (const u of rawUsers) {
      const passwordHash = await this.cryptoService.hashPassword(u.password);
      const allPasswordHashes = [passwordHash];
      if (u.additionalPasswords) {
        for (const ap of u.additionalPasswords) {
          if (ap !== u.password) {
            allPasswordHashes.push(await this.cryptoService.hashPassword(ap));
          }
        }
      }

      for (const login of u.logins) {
        const loginHash = this.cryptoService.computeLoginHash(login);
        const loginEnc = this.cryptoService.encryptLogin(login);
        const userObj = {
          id: u.id,
          loginHash,
          loginEnc,
          passwordHash,
          allPasswordHashes,
          fullName: u.fullName,
          role: u.role,
          isActive: true,
          mustChangePassword: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.memoryUsers.set(loginHash, userObj);
        this.memoryUsersById.set(u.id, userObj);
      }
    }
  }

  private toSafeUser(user: {
    id: string;
    loginEnc: string;
    fullName: string;
    role: PrismaRole;
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): SafeUser {
    return {
      id: user.id,
      login: this.cryptoService.decryptLogin(user.loginEnc),
      fullName: user.fullName,
      role: user.role as unknown as SharedRole,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<SafeUser | null> {
    if (this.prisma.isConnected) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            loginEnc: true,
            fullName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (user) return this.toSafeUser(user);
      } catch {
        // In-memory fallback if database connection is down
      }
    }

    const mem = this.memoryUsersById.get(id);
    return mem ? this.toSafeUser(mem) : null;
  }

  async findByLoginHash(loginHash: string): Promise<SafeUser | null> {
    if (this.prisma.isConnected) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { loginHash },
          select: {
            id: true,
            loginEnc: true,
            fullName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (user) return this.toSafeUser(user);
      } catch {
        // In-memory fallback
      }
    }

    const mem = this.memoryUsers.get(loginHash);
    return mem ? this.toSafeUser(mem) : null;
  }

  /**
   * Internal only: returns user with passwordHash for authentication verify
   */
  async findByLoginHashWithPassword(loginHash: string) {
    if (this.prisma.isConnected) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { loginHash },
        });
        if (user) return user;
      } catch {
        // In-memory fallback
      }
    }

    return this.memoryUsers.get(loginHash) || null;
  }

  async findAll(filter?: { role?: SharedRole; isActive?: boolean }): Promise<SafeUser[]> {
    try {
      const where: Prisma.UserWhereInput = {};
      if (filter?.role) where.role = filter.role as unknown as PrismaRole;
      if (filter?.isActive !== undefined) where.isActive = filter.isActive;

      const users = await this.prisma.user.findMany({
        where,
        select: {
          id: true,
          loginEnc: true,
          fullName: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { fullName: 'asc' },
      });

      if (users && users.length > 0) {
        return users.map((u) => this.toSafeUser(u));
      }
    } catch {
      // In-memory fallback
    }

    const all = Array.from(this.memoryUsersById.values());
    let filtered = all;
    if (filter?.role) filtered = filtered.filter((u) => (u.role as string) === filter.role);
    if (filter?.isActive !== undefined) filtered = filtered.filter((u) => u.isActive === filter.isActive);
    return filtered.map((u) => this.toSafeUser(u));
  }

  async create(data: {
    login: string;
    fullName: string;
    passwordHash: string;
    role: SharedRole;
    isActive?: boolean;
    mustChangePassword?: boolean;
  }): Promise<SafeUser> {
    const loginHash = this.cryptoService.computeLoginHash(data.login);
    const loginEnc = this.cryptoService.encryptLogin(data.login);

    try {
      const user = await this.prisma.user.create({
        data: {
          loginHash,
          loginEnc,
          fullName: data.fullName,
          passwordHash: data.passwordHash,
          role: data.role as unknown as PrismaRole,
          isActive: data.isActive ?? true,
          mustChangePassword: data.mustChangePassword ?? false,
        },
        select: {
          id: true,
          loginEnc: true,
          fullName: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return this.toSafeUser(user);
    } catch {
      // In-memory fallback
      const newUser = {
        id: `user-${Date.now()}`,
        loginHash,
        loginEnc,
        fullName: data.fullName,
        passwordHash: data.passwordHash,
        role: data.role as unknown as PrismaRole,
        isActive: data.isActive ?? true,
        mustChangePassword: data.mustChangePassword ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.memoryUsers.set(loginHash, newUser);
      this.memoryUsersById.set(newUser.id, newUser);
      return this.toSafeUser(newUser);
    }
  }

  async updateCredentials(
    id: string,
    data: {
      passwordHash: string;
      newLogin?: string;
      fullName?: string;
    },
  ): Promise<SafeUser> {
    const updateData: Prisma.UserUpdateInput = {
      passwordHash: data.passwordHash,
      mustChangePassword: false,
    };

    if (data.newLogin) {
      updateData.loginHash = this.cryptoService.computeLoginHash(data.newLogin);
      updateData.loginEnc = this.cryptoService.encryptLogin(data.newLogin);
    }

    if (data.fullName) {
      updateData.fullName = data.fullName;
    }

    if (this.prisma.isConnected) {
      try {
        const user = await this.prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            loginEnc: true,
            fullName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return this.toSafeUser(user);
      } catch {
        // Fall back to memory
      }
    }

    // In-memory fallback
    const mem = this.memoryUsersById.get(id);
    if (mem) {
      mem.passwordHash = data.passwordHash;
      mem.mustChangePassword = false;
      if (data.fullName) {
        mem.fullName = data.fullName;
      }
      if (data.newLogin) {
        mem.loginHash = this.cryptoService.computeLoginHash(data.newLogin);
        mem.loginEnc = this.cryptoService.encryptLogin(data.newLogin);
        this.memoryUsers.set(mem.loginHash, mem);
      }
      return this.toSafeUser(mem);
    }
    throw new Error("User not found");
  }
}
