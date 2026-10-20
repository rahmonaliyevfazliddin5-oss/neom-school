import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  private parseDate(dateStr: string): Date {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      throw new BadRequestException("Noto'g'ri sana formati (YYYY-MM-DD talab qilinadi)");
    }
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  async getMyClassAttendance(teacherId: string, dateStr: string) {
    const date = this.parseDate(dateStr);
    const myClass = await this.attendanceRepository.findMyClass(teacherId);

    if (!myClass) {
      throw new NotFoundException("Sizga joriy o'quv yilida biriktirilgan rahbarlik sinfi topilmadi");
    }

    const records = await this.attendanceRepository.findByClassAndDate(myClass.id, date);
    const submission = await this.attendanceRepository.getSubmissionStatus(myClass.id, date);

    // Map each student in the class to their existing attendance status (or default to KELDI)
    const recordsMap = new Map<string, { status: AttendanceStatus; note?: string | null }>();
    for (const r of records) {
      recordsMap.set(r.studentId, { status: r.status, note: r.note });
    }

    const studentRoster = myClass.students.map((st) => {
      const existing = recordsMap.get(st.id);
      return {
        id: st.id,
        name: st.fullName,
        status: existing?.status || AttendanceStatus.KELDI,
        note: existing?.note || null,
      };
    });

    const isSubmitted = submission?.status === 'SUBMITTED';

    return {
      classId: myClass.id,
      className: `${myClass.grade}-${myClass.letter}`,
      date: dateStr,
      isSubmitted,
      submissionStatus: submission?.status || 'DRAFT',
      submittedAt: submission?.submittedAt || null,
      students: studentRoster,
    };
  }

  async getClassAttendance(classId: string, dateStr: string) {
    const date = this.parseDate(dateStr);
    const records = await this.attendanceRepository.findByClassAndDate(classId, date);
    const submission = await this.attendanceRepository.getSubmissionStatus(classId, date);

    return {
      date: dateStr,
      classId,
      submissionStatus: submission?.status || 'DRAFT',
      submittedAt: submission?.submittedAt || null,
      records,
    };
  }

  async markAttendanceItem(data: {
    studentId: string;
    classId: string;
    dateStr: string;
    status: AttendanceStatus;
    note?: string;
    markedById: string;
  }) {
    const date = this.parseDate(data.dateStr);
    return this.attendanceRepository.upsertAttendance({
      studentId: data.studentId,
      classId: data.classId,
      date,
      status: data.status,
      note: data.note,
      markedById: data.markedById,
    });
  }

  async bulkMarkAttendance(data: {
    classId: string;
    dateStr: string;
    records: Array<{ studentId: string; status: AttendanceStatus; note?: string }>;
    markedById: string;
  }) {
    const date = this.parseDate(data.dateStr);
    const items = data.records.map((r) => ({
      studentId: r.studentId,
      classId: data.classId,
      date,
      status: r.status,
      note: r.note,
      markedById: data.markedById,
    }));

    await this.attendanceRepository.bulkUpsertAttendance(items);
    return {
      success: true,
      message: `${items.length} ta o'quvchi davomati saqlandi`,
      classId: data.classId,
      date: data.dateStr,
    };
  }

  async submitClassAttendance(classId: string, dateStr: string) {
    const date = this.parseDate(dateStr);
    return this.attendanceRepository.submitAttendance(classId, date);
  }

  async getDailySummary(dateStr: string, classId?: string) {
    const date = this.parseDate(dateStr);
    const counts = await this.attendanceRepository.countByStatus(date, classId);
    const total =
      counts[AttendanceStatus.KELDI] +
      counts[AttendanceStatus.KELMADI] +
      counts[AttendanceStatus.SABABLI] +
      counts[AttendanceStatus.KECHIKDI];

    return {
      date: dateStr,
      classId: classId || 'ALL',
      totalMarked: total,
      keldi: counts[AttendanceStatus.KELDI],
      kelmadi: counts[AttendanceStatus.KELMADI],
      sababli: counts[AttendanceStatus.SABABLI],
      kechikdi: counts[AttendanceStatus.KECHIKDI],
    };
  }

  async getZavuchDashboard(dateStr: string) {
    const date = this.parseDate(dateStr);
    const [summary, absentees, submissions] = await Promise.all([
      this.getDailySummary(dateStr),
      this.attendanceRepository.findAbsentees(date),
      this.attendanceRepository.findClassSubmissions(date),
    ]);

    return {
      date: dateStr,
      summary,
      absentees,
      submissions,
    };
  }

  async getDirectorOverview(dateStr: string) {
    const date = this.parseDate(dateStr);
    return this.attendanceRepository.getDirectorOverview(date);
  }
}
