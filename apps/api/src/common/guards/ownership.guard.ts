import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

/**
 * IDOR (Insecure Direct Object Reference) Ownership Guard
 * Ensures teachers can only access and modify their own assigned class/students.
 * Director and Zavuch have school-wide supervision access.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Let authentication guard handle missing user
    }

    // Director and Zavuch have school-wide access
    if (user.role === Role.DIRECTOR || user.role === Role.ZAVUCH) {
      return true;
    }

    if (user.role === Role.TEACHER) {
      const classId =
        request.params?.classId ||
        request.body?.classId ||
        request.query?.classId;

      if (!classId) {
        return true;
      }

      // Check if teacher is assigned homeroom teacher of this class
      const cls = await this.prisma.class.findFirst({
        where: {
          id: classId,
          homeroomTeacherId: user.id,
        },
      });

      if (!cls) {
        throw new ForbiddenException(
          "Sizda faqat o'zingiz biriktirilgan sinf ma'lumotlariga kirish huquqi mavjud",
        );
      }
    }

    return true;
  }
}
