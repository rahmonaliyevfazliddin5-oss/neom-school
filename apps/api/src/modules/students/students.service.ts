import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async getStudentsByClass(classId: string) {
    return this.studentsRepository.findByClass(classId);
  }

  async getStudentById(id: string) {
    const student = await this.studentsRepository.findById(id);
    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }
    return student;
  }

  async createStudent(data: { fullName: string; classId: string }) {
    return this.studentsRepository.create(data);
  }

  async countActiveStudents(): Promise<number> {
    return this.studentsRepository.countActive();
  }
}
