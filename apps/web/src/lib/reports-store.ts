import fs from 'fs';
import path from 'path';

export interface StudentReportRow {
  id: string;
  name: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  attendedDays: number;
  missedDays: number;
  excusedDays: number;
  lateDays: number;
  rate: number;
}

export interface ClassPeriodReport {
  year: string;
  period: 'MONTH' | 'QUARTER' | 'YEAR';
  monthId: string;
  monthName: string;
  className: string;
  teacher: string;
  totalStudents: number;
  totalDays: number;
  attendanceRate: number;
  keldi: number;
  kelmadi: number;
  sababli: number;
  kechikdi: number;
  students: StudentReportRow[];
}

import { readJsonSafe, writeJsonSafe } from '@/lib/safe-store';

export function readJson<T>(filename: string, fallback: T): T {
  return readJsonSafe<T>(filename, fallback);
}

export function writeJson(filename: string, data: any) {
  writeJsonSafe(filename, data).catch((err) => {
    console.error('Failed to write JSON in reports-store:', err);
  });
}

export const ACADEMIC_MONTHS = [
  { id: '2026-09', name: 'Sentabr 2026', quarter: '1-chorak', days: 24, baseRate: 97.4 },
  { id: '2026-10', name: 'Oktabr 2026', quarter: '1-chorak', days: 22, baseRate: 98.1 },
  { id: '2026-11', name: 'Noyabr 2026', quarter: '2-chorak', days: 24, baseRate: 96.5 },
  { id: '2026-12', name: 'Dekabr 2026', quarter: '2-chorak', days: 22, baseRate: 95.8 },
  { id: '2027-01', name: 'Yanvar 2027', quarter: '3-chorak', days: 20, baseRate: 96.2 },
  { id: '2027-02', name: 'Fevral 2027', quarter: '3-chorak', days: 22, baseRate: 97.0 },
  { id: '2027-03', name: 'Mart 2027', quarter: '3-chorak', days: 20, baseRate: 97.5 },
  { id: '2027-04', name: 'Aprel 2027', quarter: '4-chorak', days: 24, baseRate: 98.2 },
  { id: '2027-05', name: 'May 2027', quarter: '4-chorak', days: 22, baseRate: 98.6 },
];

export function getOrCreateClassReport(
  className: string,
  periodId: string = '2026-10'
): ClassPeriodReport {
  const reportsStore = readJson<Record<string, ClassPeriodReport>>('monthly-reports.json', {});
  const storeKey = `${className}_${periodId}`;

  // If already exists, return it
  if (reportsStore[storeKey]) {
    return reportsStore[storeKey];
  }

  // Otherwise generate and persist
  const classStudentsMap = readJson<Record<string, any[]>>('class-students.json', {});
  const studentsList = classStudentsMap[className] || [];

  const matchedMonth = ACADEMIC_MONTHS.find((m) => m.id === periodId);
  const isQuarter = periodId.startsWith('QUARTER');
  const isYear = periodId === 'YEAR' || periodId === '2026-2027';

  let monthName = matchedMonth?.name || 'Oktabr 2026';
  let totalDays = matchedMonth?.days || 22;
  let baseRate = matchedMonth?.baseRate || 97.5;

  if (isQuarter) {
    monthName = periodId === 'QUARTER-1' ? '1-chorak (Sentabr–Oktabr 2026)' : `${periodId} (2026–2027)`;
    totalDays = 46;
    baseRate = 97.8;
  } else if (isYear) {
    monthName = '2026–2027 o‘quv yili (Yillik)';
    totalDays = 200;
    baseRate = 97.2;
  }

  // Load custom classes to find teacher name
  const customClasses = readJson<any[]>('custom-classes.json', []);
  const classObj = customClasses.find((c) => c.name.toLowerCase() === className.toLowerCase());
  const teacherName = classObj?.teacher || 'Ustoz';

  // Seed deterministic rows based on student index and month
  const monthNum = parseInt(periodId.replace(/[^0-9]/g, ''), 10) || 10;

  const rows: StudentReportRow[] = studentsList.map((s, idx) => {
    // Deterministic variety: 85% to 100% attendance
    const hasMissed = (idx + monthNum) % 7 === 1;
    const hasExcused = (idx + monthNum) % 9 === 2;
    const hasLate = (idx + monthNum) % 11 === 3;

    const missedCount = hasMissed ? 1 : 0;
    const excusedCount = hasExcused ? 1 : 0;
    const lateCount = hasLate ? 1 : 0;
    const attendedCount = totalDays - missedCount - excusedCount;
    const rate = Math.round(((attendedCount + lateCount * 0.5) / totalDays) * 100);

    return {
      id: s.id,
      name: s.name,
      mon: 'Keldi',
      tue: hasMissed ? 'Kelmadi' : 'Keldi',
      wed: hasExcused ? 'Sababli' : hasLate ? 'Kechikdi' : 'Keldi',
      thu: 'Keldi',
      fri: 'Keldi',
      sat: 'Keldi',
      attendedDays: attendedCount,
      missedDays: missedCount,
      excusedDays: excusedCount,
      lateDays: lateCount,
      rate: Math.min(100, Math.max(75, rate)),
    };
  });

  const totalAttended = rows.reduce((acc, r) => acc + r.attendedDays, 0);
  const totalMissed = rows.reduce((acc, r) => acc + r.missedDays, 0);
  const totalExcused = rows.reduce((acc, r) => acc + r.excusedDays, 0);
  const totalLate = rows.reduce((acc, r) => acc + r.lateDays, 0);
  const overallRate = rows.length > 0
    ? Math.round((rows.reduce((acc, r) => acc + r.rate, 0) / rows.length) * 10) / 10
    : baseRate;

  const newReport: ClassPeriodReport = {
    year: '2026-2027',
    period: isQuarter ? 'QUARTER' : isYear ? 'YEAR' : 'MONTH',
    monthId: periodId,
    monthName,
    className,
    teacher: teacherName,
    totalStudents: rows.length,
    totalDays,
    attendanceRate: overallRate,
    keldi: totalAttended,
    kelmadi: totalMissed,
    sababli: totalExcused,
    kechikdi: totalLate,
    students: rows,
  };

  reportsStore[storeKey] = newReport;
  writeJson('monthly-reports.json', reportsStore);

  return newReport;
}
