import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassesRepository } from './classes.repository';

@Injectable()
export class ClassesService {
  constructor(private readonly classesRepository: ClassesRepository) {}

  async getAllClasses(academicYearId?: string) {
    return this.classesRepository.findAll(academicYearId);
  }

  async getClassById(id: string) {
    const cls = await this.classesRepository.findById(id);
    if (!cls) {
      throw new NotFoundException("Sinf topilmadi");
    }
    return cls;
  }

  async getClassesByTeacher(teacherId: string) {
    return this.classesRepository.findByTeacher(teacherId);
  }

  async createClass(data: {
    grade: number;
    letter: string;
    academicYearId: string;
    homeroomTeacherId?: string | null;
  }) {
    return this.classesRepository.create(data);
  }
}
