'use client';

import React, { useState, useEffect } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Role } from '@neom/shared';
import { Calendar } from 'lucide-react';

interface AbsenteeItem {
  id?: string;
  name: string;
  class: string;
  teacher: string;
  status: string;
  statusType: 'r' | 'y' | 'b' | string;
}

interface ClassSubmissionItem {
  classId?: string;
  name: string;
  teacher?: string;
  totalStudents?: number;
  isSubmitted: boolean;
  statusText: string;
  attendanceRate: number;
}

export default function ZavuchDashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [counts, setCounts] = useState({
    keldi: 684,
    kelmadi: 18,
    sababli: 8,
    kechikdi: 6,
  });

  const [absentStudents, setAbsentStudents] = useState<AbsenteeItem[]>([
    { name: 'Karimova Malika', class: '9-A', teacher: 'Nodira A.', status: 'Kelmadi', statusType: 'r' },
    { name: 'Hasanov Ali', class: '5-B', teacher: 'Dilshod R.', status: 'Kelmadi', statusType: 'r' },
    { name: 'Ergashev Bobur', class: '11-A', teacher: 'Otabek U.', status: 'Kechikdi', statusType: 'y' },
    { name: 'Xoliqova Ziyoda', class: '2-A', teacher: 'Nilufar A.', status: 'Sababli', statusType: 'b' },
  ]);

  const [classesProgress, setClassesProgress] = useState<ClassSubmissionItem[]>([
    { name: '1-A', isSubmitted: true, statusText: 'Topshirdi', attendanceRate: 100 },
    { name: '5-B', isSubmitted: true, statusText: 'Topshirdi', attendanceRate: 100 },
    { name: '9-A', isSubmitted: true, statusText: 'Topshirdi', attendanceRate: 100 },
    { name: '11-B', isSubmitted: false, statusText: 'Kutilmoqda', attendanceRate: 40 },
  ]);

  useEffect(() => {
    async function loadZavuchDashboard() {
      try {
        const res = await fetch(`/api/attendance/zavuch/dashboard?date=${selectedDate}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.summary) {
            setCounts({
              keldi: data.summary.keldi || 0,
              kelmadi: data.summary.kelmadi || 0,
              sababli: data.summary.sababli || 0,
              kechikdi: data.summary.kechikdi || 0,
            });
          }
          if (Array.isArray(data.absentees) && data.absentees.length > 0) {
            setAbsentStudents(data.absentees);
          }
          if (Array.isArray(data.submissions) && data.submissions.length > 0) {
            setClassesProgress(data.submissions);
          }
        }
      } catch {
        // Fallback to sample data
      }
    }

    loadZavuchDashboard();
  }, [selectedDate]);

  const totalMarked = counts.keldi + counts.kelmadi + counts.sababli + counts.kechikdi;
  const attendancePercent = totalMarked > 0 ? Math.round((counts.keldi / totalMarked) * 100) : 96;

  return (
    <PanelShell
      role={Role.ZAVUCH}
      roleLabel="Zavuch · o'quv ishlari"
      userName="Nodirova Dilnoza"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#e6f0ff] dark:bg-[#1c2c47] text-[#0066cc] dark:text-[#4d9fff] text-xs font-bold mb-1.5">
            2026–2027 o‘quv yili
          </div>
          <h1 className="text-[28px] font-bold text-[#0b2a5b] dark:text-white">
            Bugungi davomat monitoringi
          </h1>
          <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd]">
            Maktab bo‘yicha sinflar davomati va o‘quvchilar nazorati
          </p>
        </div>

        {/* Sana tanlash */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#141d2e] px-3.5 py-2 rounded-xl border border-[#ccd8e8] dark:border-[#24324d] shadow-xs">
          <Calendar className="w-4 h-4 text-[#0066cc] dark:text-[#4d9fff]" />
          <span className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">Sana:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-[#0b2a5b] dark:text-white bg-transparent focus:outline-hidden cursor-pointer"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Keldi"
          value={`${counts.keldi} nafar (${attendancePercent}%)`}
          valueColor="text-[#0d4a22]"
          subtext={`${counts.keldi} / ${totalMarked || 716} nafar o‘quvchi`}
        />
        <StatCard
          label="Kelmadi"
          value={`${counts.kelmadi} nafar (${totalMarked > 0 ? ((counts.kelmadi / totalMarked) * 100).toFixed(1) : 2.5}%)`}
          valueColor="text-[#7a1410]"
          subtext="Sababsiz qoldirganlar"
        />
        <StatCard
          label="Sababli"
          value={`${counts.sababli} nafar (${totalMarked > 0 ? ((counts.sababli / totalMarked) * 100).toFixed(1) : 1.1}%)`}
          valueColor="text-[#0c3b7c] dark:text-[#d5e3ff]"
          subtext="Arizali o‘quvchilar"
        />
        <StatCard
          label="Kechikdi"
          value={`${counts.kechikdi} nafar (${totalMarked > 0 ? ((counts.kechikdi / totalMarked) * 100).toFixed(1) : 0.8}%)`}
          valueColor="text-[#5c4400]"
          subtext="Kechikkan o‘quvchilar"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Absent and late students list */}
        <Card className="lg:col-span-2 gap-2">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
              Kelmagan va kechikkan o&apos;quvchilar
            </h3>
            <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
              Kun davomida sinf rahbarlari kiritgan ma&apos;lumotlar
            </p>
          </div>

          <div className="divide-y divide-[#e8eef7] dark:divide-[#24324d]">
            {absentStudents.map((item, idx) => (
              <div
                key={idx}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#0b2a5b] dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e8eef7] dark:bg-[#1b273d] text-[#0c3b7c] dark:text-[#5a95e5]">
                    {item.class}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#4a5f82] dark:text-[#9db4dd]">
                  <span>Rahbar: {item.teacher}</span>
                  <span
                    className={`font-semibold px-2.5 py-1 rounded text-xs ${
                      item.statusType === 'r'
                        ? 'bg-[#fde0e0] text-[#7a1410]'
                        : item.statusType === 'y'
                        ? 'bg-[#fff3c2] text-[#5c4400]'
                        : 'bg-[#dbe9ff] text-[#0c3b7c]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Classes submission card */}
        <Card className="gap-2">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
              Sinflar topshirishi
            </h3>
            <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
              Davomat hisoboti topshirish holati
            </p>
          </div>

          <div className="divide-y divide-[#e8eef7] dark:divide-[#24324d]">
            {classesProgress.map((cls, idx) => (
              <div key={idx} className="py-2.5 flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-[#0b2a5b] dark:text-white">
                  {cls.name}
                </span>
                <ProgressBar value={cls.attendanceRate} className="flex-1" />
                <span
                  className={`w-20 text-right font-medium ${
                    cls.isSubmitted
                      ? 'text-[#0d4a22] font-semibold'
                      : 'text-[#8a3d00]'
                  }`}
                >
                  {cls.statusText}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PanelShell>
  );
}
