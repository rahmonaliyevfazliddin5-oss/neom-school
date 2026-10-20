'use client';

import React, { useState, useEffect } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Role } from '@neom/shared';

interface ClassProgressItem {
  name: string;
  percent: number;
}

export default function DirectorSupervisionPage() {
  const [directorName, setDirectorName] = useState('Rustamov Shavkat');
  const [stats, setStats] = useState({
    todayRate: 96,
    monthlyRate: 94,
    classesCount: 9,
    teachersCount: 50,
  });

  const [classProgress, setClassProgress] = useState<ClassProgressItem[]>([
    { name: '1-A', percent: 96 },
    { name: '1-D', percent: 92 },
    { name: '2-A', percent: 95 },
    { name: '2-B', percent: 89 },
    { name: '3-A', percent: 93 },
    { name: '3-D', percent: 90 },
    { name: '11-A', percent: 94 },
    { name: '11-B', percent: 87 },
    { name: '11-D', percent: 91 },
  ]);

  useEffect(() => {
    // Load director user profile info
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const user = data?.data || data;
        if (user?.fullName) setDirectorName(user.fullName);
      })
      .catch(() => {});

    async function loadDirectorOverview() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/attendance/director/overview?date=${todayStr}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setStats({
            todayRate: data.todayRate || 96,
            monthlyRate: data.monthlyRate || 94,
            classesCount: data.classesCount || 9,
            teachersCount: data.teachersCount || 50,
          });
          if (Array.isArray(data.classProgress) && data.classProgress.length > 0) {
            setClassProgress(data.classProgress);
          }
        }
      } catch {
        // Fallback to sample data
      }
    }

    loadDirectorOverview();
  }, []);

  return (
    <PanelShell
      role={Role.DIRECTOR}
      roleLabel="Direktor"
      userName={directorName}
    >
      <div>
        <h1 className="text-[28px] font-bold text-[#0b2a5b] dark:text-white">
          Maktab nazorati
        </h1>
        <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd]">
          Maktab boshqaruv monitoringi va strategik ko&apos;rsatkichlar
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bugungi davomat"
          value={`461 nafar (${stats.todayRate}%)`}
          valueColor="text-[#0d4a22]"
          subtext="461 / 480 o‘quvchi qatnashdi"
        />
        <StatCard
          label="Oylik davomat"
          value={`451 nafar (${stats.monthlyRate}%)`}
          valueColor="text-[#0c3b7c] dark:text-[#d5e3ff]"
          subtext="Oylik o‘rtacha: 451 / 480 o‘quvchi"
        />
        <StatCard
          label="Sinflar soni"
          value={stats.classesCount}
          valueColor="text-[#0c3b7c] dark:text-[#d5e3ff]"
          subtext="1-11 parallel sinflar"
        />
        <StatCard
          label="O'qituvchilar"
          value={stats.teachersCount}
          valueColor="text-[#8a3d00]"
          subtext="Faol xodimlar soni"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Class level breakdown */}
        <Card className="lg:col-span-2 gap-2">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
              Davomat monitoringi (son va foizda)
            </h3>
            <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
              Har bir sinfning joriy oydagi qatnashuv ko‘rsatkichi va foizi
            </p>
          </div>

          <div className="divide-y divide-[#e8eef7] dark:divide-[#24324d]">
            {classProgress.map((item) => (
              <div key={item.name} className="py-2.5 flex items-center gap-4 text-xs">
                <span className="w-12 font-bold text-[#0b2a5b] dark:text-white">
                  {item.name}
                </span>
                <ProgressBar value={item.percent} className="flex-1" />
                <span className="text-right font-semibold text-[#0c3b7c] dark:text-[#5a95e5] whitespace-nowrap">
                  {Math.round(26 * (item.percent / 100))} / 26 nafar · {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Staff accounts action card */}
        <Card className="gap-2">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
              Xodimlar hisoblari
            </h3>
            <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
              Tezkor ma&apos;muriy boshqaruv
            </p>
          </div>

          <div className="divide-y divide-[#e8eef7] dark:divide-[#24324d]">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#0b2a5b] dark:text-white">Zavuch</p>
                <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">Nodirova D.</p>
              </div>
              <button
                onClick={() => alert("Parolni tiklash xabari yuborildi")}
                className="bg-white dark:bg-[#141d2e] border border-[#b9c8e2] dark:border-[#24324d] text-[#0c2f66] dark:text-[#d5e3ff] hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Parolni tiklash
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#0b2a5b] dark:text-white">O&apos;qituvchi</p>
                <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">Qodirov J.</p>
              </div>
              <button
                onClick={() => alert("Parolni tiklash xabari yuborildi")}
                className="bg-white dark:bg-[#141d2e] border border-[#b9c8e2] dark:border-[#24324d] text-[#0c2f66] dark:text-[#d5e3ff] hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Parolni tiklash
              </button>
            </div>
          </div>
        </Card>
      </div>
    </PanelShell>
  );
}
