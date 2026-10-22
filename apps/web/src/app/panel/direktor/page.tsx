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
  const [directorName, setDirectorName] = useState('Direktor');
  const [stats, setStats] = useState({
    todayRate: 0,
    monthlyRate: 0,
    classesCount: 0,
    teachersCount: 0,
  });

  const [classProgress, setClassProgress] = useState<ClassProgressItem[]>([]);

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
            todayRate: data.todayRate || 0,
            monthlyRate: data.monthlyRate || 0,
            classesCount: data.classesCount || 0,
            teachersCount: data.teachersCount || 0,
          });
          if (Array.isArray(data.classProgress)) {
            setClassProgress(data.classProgress);
          }
        }
      } catch {
        // Fallback
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
          value={`${stats.todayRate}%`}
          valueColor="text-[#0d4a22]"
          subtext={stats.classesCount > 0 ? `${stats.classesCount} ta sinf bo‘yicha` : "Davomat kutilmoqda"}
        />
        <StatCard
          label="Oylik davomat"
          value={`${stats.monthlyRate}%`}
          valueColor="text-[#0c3b7c] dark:text-[#d5e3ff]"
          subtext={stats.classesCount > 0 ? "Oylik o‘rtacha qatnashuv" : "Hisobot shakllanmoqda"}
        />
        <StatCard
          label="Sinflar soni"
          value={`${stats.classesCount} ta`}
          valueColor="text-[#0c3b7c] dark:text-[#d5e3ff]"
          subtext="Ro‘yxatdan o‘tgan sinflar"
        />
        <StatCard
          label="O'qituvchilar"
          value={`${stats.teachersCount} nafar`}
          valueColor="text-[#8a3d00]"
          subtext="Faol xodimlar soni"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Class level breakdown */}
        <Card className="lg:col-span-2 gap-2">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
              Davomat monitoringi (foizda)
            </h3>
            <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
              Har bir sinfning joriy kundagi qatnashuv ko‘rsatkichi va foizi
            </p>
          </div>

          <div className="divide-y divide-[#e8eef7] dark:divide-[#24324d]">
            {classProgress.length > 0 ? (
              classProgress.map((item) => (
                <div key={item.name} className="py-2.5 flex items-center gap-4 text-xs">
                  <span className="w-16 font-bold text-[#0b2a5b] dark:text-white">
                    {item.name} sinf
                  </span>
                  <ProgressBar value={item.percent} className="flex-1" />
                  <span className="text-right font-semibold text-[#0c3b7c] dark:text-[#5a95e5] whitespace-nowrap">
                    {item.percent}%
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[#4a5f82] dark:text-[#9db4dd]">
                Hozircha birorta ham sinf ro‘yxatga olinmagan. Zavuch panelidan sinf yaratilgach, bu yerda real vaqtda monitoring boshlanadi.
              </div>
            )}
          </div>
        </Card>

        {/* Staff accounts action card */}
        <Card className="gap-2">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
              Boshqaruv va xodimlar
            </h3>
            <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
              Xodimlar tarkibi va tezkor harakatlar
            </p>
          </div>

          <div className="space-y-3 text-xs text-[#4a5f82] dark:text-[#9db4dd]">
            <div className="p-3 rounded-lg bg-[#f0f4fa] dark:bg-[#15233e] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#0b2a5b] dark:text-white">Faol xodimlar</p>
                <p className="text-[11px] text-[#7185a6]">Maktab shtatidagi xodimlar</p>
              </div>
              <span className="text-sm font-bold text-[#0c3b7c] dark:text-[#5a95e5]">
                {stats.teachersCount} nafar
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#f0f4fa] dark:bg-[#15233e] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#0b2a5b] dark:text-white">Jami sinflar</p>
                <p className="text-[11px] text-[#7185a6]">O‘quv jarayonidagi guruhlar</p>
              </div>
              <span className="text-sm font-bold text-[#0c3b7c] dark:text-[#5a95e5]">
                {stats.classesCount} ta
              </span>
            </div>

            <div className="pt-2">
              <a
                href="/panel/direktor/xodimlar"
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#0c3b7c] hover:bg-[#0a2f64] text-white font-semibold text-xs transition-colors"
              >
                Xodimlar ro‘yxatini ko‘rish
              </a>
            </div>
          </div>
        </Card>
      </div>
    </PanelShell>
  );
}
