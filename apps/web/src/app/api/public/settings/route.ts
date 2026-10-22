import { NextResponse } from 'next/server';
import { readJsonSafe } from '@/lib/safe-store';

export async function GET() {
  const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
  const customUsers = readJsonSafe<any[]>('custom-users.json', []);
  const staff = readJsonSafe<any[]>('staff.json', []);

  // Compute live stats
  const totalClasses = 18 + customClasses.length;
  const totalStudents = 480 + customClasses.reduce((acc, c) => acc + (c.studentsCount || 25), 0);
  const totalTeachers = staff.filter((s) => s.roleType === 'TEACHER').length + customUsers.length + 35;

  return NextResponse.json({
    stats: {
      teachers: totalTeachers,
      students: totalStudents,
      classrooms: totalClasses,
      graduatesRate: 98,
    },
    address: 'Toshkent sh., Yunusobod tumani',
    phone: '+998 50 006 79 69',
    workHours: '08:00 - 18:00 (Dush - Shan)',
  });
}
