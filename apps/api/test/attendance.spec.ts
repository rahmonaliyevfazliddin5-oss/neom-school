import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from '../src/modules/attendance/attendance.service';
import { AttendanceRepository } from '../src/modules/attendance/attendance.repository';
import { AttendanceStatus, SubmissionStatus } from '@prisma/client';

describe('Attendance Module (Unit & Logic Tests)', () => {
  let service: AttendanceService;
  let repo: AttendanceRepository;

  const mockAttendanceRepo = {
    findMyClass: jest.fn().mockImplementation((teacherId: string) => {
      if (teacherId === 'teacher-1') {
        return Promise.resolve({
          id: 'class-9a',
          grade: 9,
          letter: 'A',
          students: [
            { id: 'st-1', fullName: 'Aliyev Anvar' },
            { id: 'st-2', fullName: 'Karimova Malika' },
            { id: 'st-3', fullName: 'Rahimov Jasur' },
          ],
        });
      }
      return Promise.resolve(null);
    }),
    findByClassAndDate: jest.fn().mockResolvedValue([
      { studentId: 'st-1', status: AttendanceStatus.KELDI, note: null },
      { studentId: 'st-2', status: AttendanceStatus.KELMADI, note: 'Kasallik' },
    ]),
    getSubmissionStatus: jest.fn().mockResolvedValue({
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
    }),
    upsertAttendance: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    bulkUpsertAttendance: jest.fn().mockResolvedValue([]),
    submitAttendance: jest.fn().mockResolvedValue({
      classId: 'class-9a',
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
    }),
    countByStatus: jest.fn().mockResolvedValue({
      [AttendanceStatus.KELDI]: 25,
      [AttendanceStatus.KELMADI]: 2,
      [AttendanceStatus.SABABLI]: 1,
      [AttendanceStatus.KECHIKDI]: 1,
    }),
    findAbsentees: jest.fn().mockResolvedValue([
      {
        id: 'rec-1',
        name: 'Karimova Malika',
        class: '9-A',
        teacher: 'Qodirov J.',
        status: 'Kelmadi',
        statusType: 'r',
        note: 'Kasallik',
      },
    ]),
    findClassSubmissions: jest.fn().mockResolvedValue([
      {
        classId: 'class-9a',
        name: '9-A',
        teacher: 'Qodirov J.',
        totalStudents: 30,
        isSubmitted: true,
        statusText: 'Topshirdi',
        attendanceRate: 97,
        submittedAt: new Date(),
      },
    ]),
    getDirectorOverview: jest.fn().mockResolvedValue({
      todayRate: 96,
      monthlyRate: 94,
      classesCount: 9,
      teachersCount: 50,
      classProgress: [{ name: '9-A', percent: 96 }],
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: AttendanceRepository,
          useValue: mockAttendanceRepo,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    repo = module.get<AttendanceRepository>(AttendanceRepository);
  });

  it('1. should return homeroom teacher class, student roster, and submission status', async () => {
    const res = await service.getMyClassAttendance('teacher-1', '2026-10-20');

    expect(res).toBeDefined();
    expect(res.className).toBe('9-A');
    expect(res.classId).toBe('class-9a');
    expect(res.isSubmitted).toBe(true);
    expect(res.students.length).toBe(3);

    // Verified statuses
    const st1 = res.students.find((s) => s.id === 'st-1');
    const st2 = res.students.find((s) => s.id === 'st-2');
    const st3 = res.students.find((s) => s.id === 'st-3');

    expect(st1?.status).toBe(AttendanceStatus.KELDI);
    expect(st2?.status).toBe(AttendanceStatus.KELMADI);
    expect(st3?.status).toBe(AttendanceStatus.KELDI); // Default fallback
  });

  it('2. should throw NotFoundException if teacher has no homeroom class', async () => {
    await expect(
      service.getMyClassAttendance('unassigned-teacher', '2026-10-20'),
    ).rejects.toThrow();
  });

  it('3. should bulk mark attendance items in a single request', async () => {
    const res = await service.bulkMarkAttendance({
      classId: 'class-9a',
      dateStr: '2026-10-20',
      records: [
        { studentId: 'st-1', status: AttendanceStatus.KELDI },
        { studentId: 'st-2', status: AttendanceStatus.KELMADI },
      ],
      markedById: 'teacher-1',
    });

    expect(res.success).toBe(true);
    expect(repo.bulkUpsertAttendance).toHaveBeenCalled();
  });

  it('4. should submit class attendance to zavuch', async () => {
    const res = await service.submitClassAttendance('class-9a', '2026-10-20');

    expect(res.status).toBe(SubmissionStatus.SUBMITTED);
    expect(repo.submitAttendance).toHaveBeenCalled();
  });

  it('5. should calculate daily attendance summary counts', async () => {
    const res = await service.getDailySummary('2026-10-20');

    expect(res.totalMarked).toBe(29);
    expect(res.keldi).toBe(25);
    expect(res.kelmadi).toBe(2);
    expect(res.sababli).toBe(1);
    expect(res.kechikdi).toBe(1);
  });

  it('6. should return comprehensive Zavuch dashboard data (summary + absentees + submissions)', async () => {
    const res = await service.getZavuchDashboard('2026-10-20');

    expect(res).toHaveProperty('summary');
    expect(res).toHaveProperty('absentees');
    expect(res).toHaveProperty('submissions');
    expect(res.absentees.length).toBeGreaterThan(0);
    expect(res.submissions[0].name).toBe('9-A');
  });

  it('7. should return Director strategic overview data', async () => {
    const res = await service.getDirectorOverview('2026-10-20');

    expect(res.todayRate).toBe(96);
    expect(res.monthlyRate).toBe(94);
    expect(res.classesCount).toBe(9);
    expect(res.teachersCount).toBe(50);
  });
});
