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
    keldi: 0,
    kelmadi: 0,
    sababli: 0,
    kechikdi: 0,
  });

  const [absentStudents, setAbsentStudents] = useState<AbsenteeItem[]>([]);
  const [classesProgress, setClassesProgress] = useState<ClassSubmissionItem[]>([]);

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
          if (Array.isArray(data.absentees)) {
            setAbsentStudents(data.absentees);
          }
          if (Array.isArray(data.submissions)) {
            setClassesProgress(data.submissions);
          }
        }
      } catch {
        // Fallback
      }
    }

    loadZavuchDashboard();
  }, [selectedDate]);

  const totalMarked = counts.keldi + counts.kelmadi + counts.sababli + counts.kechikdi;
  const attendancePercent =
    totalMarked > 0 ? ((counts.keldi / totalMarked) * 100).toFixed(1) : '100.0';

  return (
    <PanelShell role={Role.ZAVUCH} roleLabel="Zavuch">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0b2a5b] dark:text-white">
            Bugungi davomat
          </h1>
          <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd]">
            Umumiy o&apos;quvchilar qatnashuvi va sinflar monitoringi
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#121c2e] border border-[#d6e0ea] dark:border-[#24324d] rounded-xl px-3 py-2 shadow-xs">
          <Calendar className="w-4 h-4 text-[#4a5f82] dark:text-[#9db4dd]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold text-[#0b2a5b] dark:text-white bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Keldi"
          value={`${counts.keldi} nafar (${attendancePercent}%)`}
          valueColor="text-[#0d4a22]"
          subtext={totalMarked > 0 ? `${counts.keldi} / ${totalMarked} nafar o‘quvchi` : "Darsga qatnashganlar"}
        />
        <StatCard
          label="Kelmadi"
          value={`${counts.kelmadi} nafar (${totalMarked > 0 ? ((counts.kelmadi / totalMarked) * 100).toFixed(1) : 0}%)`}
          valueColor="text-[#7a1410]"
          subtext="Sababsiz qoldirganlar"
        />
        <StatCard
          label="Sababli"
          value={`${counts.sababli} nafar (${totalMarked > 0 ? ((counts.sababli / totalMarked) * 100).toFixed(1) : 0}%)`}
          valueColor="text-[#0c3b7c] dark:text-[#d5e3ff]"
          subtext="Arizali o‘quvchilar"
        />
        <StatCard
          label="Kechikdi"
          value={`${counts.kechikdi} nafar (${totalMarked > 0 ? ((counts.kechikdi / totalMarked) * 100).toFixed(1) : 0}%)`}
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
            {absentStudents.length > 0 ? (
              absentStudents.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0b2a5b] dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e8eef7] dark:bg-[#1b273d] text-[#0c3b7c] dark:text-[#5a95e5]">
                      {item.class} sinf
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
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[#4a5f82] dark:text-[#9db4dd]">
                Bugun dars qoldirgan yoki kechikkan o‘quvchilar yo‘q (barcha o‘quvchilar to‘liq qatnashmoqda yoki davomat hali kiritilmagan).
              </div>
            )}
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
            {classesProgress.length > 0 ? (
              classesProgress.map((cls, idx) => (
                <div key={idx} className="py-2.5 flex items-center gap-3 text-xs">
                  <span className="w-14 font-bold text-[#0b2a5b] dark:text-white">
                    {cls.name} sinf
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
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[#4a5f82] dark:text-[#9db4dd]">
                Hozircha birorta ham sinf ro‘yxatda yo‘q. Sinflar bo‘limidan yangi sinf yaratishingiz mumkin.
              </div>
            )}
          </div>
        </Card>
      </div>
    </PanelShell>
  );
}
