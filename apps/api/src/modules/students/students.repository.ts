import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClass(classId: string) {
    return this.prisma.student.findMany({
      where: { classId, isActive: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: { class: true },
    });
  }

  async create(data: { fullName: string; classId: string }) {
    return this.prisma.student.create({
      data: {
        fullName: data.fullName,
        classId: data.classId,
      },
    });
  }

  async countActive(): Promise<number> {
    return this.prisma.student.count({
      where: { isActive: true },
    });
  }
}
