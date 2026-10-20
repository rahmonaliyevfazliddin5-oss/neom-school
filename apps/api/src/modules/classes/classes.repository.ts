import { Injectable } from '@nestjs/common';
import { PrismaService, safeUserSelect } from '../../common/database/prisma.service';

@Injectable()
export class ClassesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(academicYearId?: string) {
    return this.prisma.class.findMany({
      where: academicYearId ? { academicYearId } : undefined,
      include: {
        homeroomTeacher: {
          select: safeUserSelect,
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: [{ grade: 'asc' }, { letter: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.class.findUnique({
      where: { id },
      include: {
        homeroomTeacher: { select: safeUserSelect },
        students: {
          where: { isActive: true },
          orderBy: { fullName: 'asc' },
        },
      },
    });
  }

  async findByTeacher(teacherId: string, academicYearId?: string) {
    return this.prisma.class.findMany({
      where: {
        homeroomTeacherId: teacherId,
        ...(academicYearId ? { academicYearId } : {}),
      },
      include: {
        _count: { select: { students: true } },
      },
    });
  }

  async create(data: {
    grade: number;
    letter: string;
    academicYearId: string;
    homeroomTeacherId?: string | null;
  }) {
    return this.prisma.class.create({
      data: {
        grade: data.grade,
        letter: data.letter.toUpperCase(),
        academicYearId: data.academicYearId,
        homeroomTeacherId: data.homeroomTeacherId || null,
      },
      include: {
        homeroomTeacher: { select: safeUserSelect },
      },
    });
  }
}
