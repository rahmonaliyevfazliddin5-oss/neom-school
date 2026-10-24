'use client';

import React, { useState } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@neom/shared';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  Clock,
  UserCheck,
  UserX,
  FileSpreadsheet,
} from 'lucide-react';

interface ReportRow {
  className: string;
  teacher: string;
  totalStudents: number;
  rate: number;
  keldi: number;
  kelmadi: number;
  sababli: number;
  kechikdi: number;
  statusText: 'A’lo' | 'Yaxshi' | 'Qoniqarli';
}

export default function DirectorReportsPage() {
  const { toast } = useToast();
  const [directorName, setDirectorName] = useState('Direktor');
  const [selectedPeriod, setSelectedPeriod] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('MONTH');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [selectedMonthName, setSelectedMonthName] = useState('Oktabr 2026');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'PRIMARY' | 'MIDDLE' | 'HIGH'>('ALL');
  const [customClassesList, setCustomClassesList] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const user = data?.data || data;
        if (user?.fullName) setDirectorName(user.fullName);
      })
      .catch(() => {});

    fetch('/api/classes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.classes)) {
          setCustomClassesList(data.classes);
        }
      })
      .catch(() => {});
  }, []);

  const mergedReportData: ReportRow[] = React.useMemo(() => {
    return customClassesList.map((c) => {
      const total = c.studentsCount || 0;
      const rate = c.attendanceRate ?? 100;
      const keldi = Math.round(total * (rate / 100));
      const kelmadi = Math.max(0, total - keldi);
      const status: 'A’lo' | 'Yaxshi' | 'Qoniqarli' = rate >= 95 ? 'A’lo' : rate >= 85 ? 'Yaxshi' : 'Qoniqarli';

      return {
        className: c.name,
        teacher: c.teacher || 'Ustoz',
        totalStudents: total,
        rate,
        keldi,
        kelmadi,
        sababli: 0,
        kechikdi: 0,
        statusText: status,
      };
    });
  }, [customClassesList]);

  const filteredRows = mergedReportData.filter((row) => {
    const gradeNum = parseInt(row.className.split('-')[0], 10);
    if (gradeFilter === 'PRIMARY') return gradeNum <= 4;
    if (gradeFilter === 'MIDDLE') return gradeNum >= 5 && gradeNum <= 9;
    if (gradeFilter === 'HIGH') return gradeNum >= 10;
    return true;
  });

  const handleExportCSV = () => {
    const headers = 'Sinf,Sinf rahbari,O\'quvchilar soni,Davomat foizi,Keldi,Kelmadi,Sababli,Kechikdi\n';
    const rows = filteredRows
      .map(
        (r) =>
          `"${r.className}","${r.teacher}",${r.totalStudents},"${r.rate}%",${r.keldi},${r.kelmadi},${r.sababli},${r.kechikdi}`,
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Neom_School_Davomat_Hisoboti_${selectedMonthName.replace(/\s+/g, '_')}_2026-2027.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(`${selectedMonthName} umumiy maktab hisoboti Excel (CSV) formatida yuklab olindi!`, 'success');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <PanelShell
      role={Role.DIRECTOR}
      roleLabel="Direktor"
      userName={directorName}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[26px] md:text-[28px] font-bold text-[#0b2a5b] dark:text-white">
              Davomat va ta’lim hisobotlari
            </h1>
            <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd]">
              Maktab bo‘yicha davomat dinamikasi, sinflar tahlili va tahliliy hisobotlar
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleExportCSV}
              className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel yuklab olish</span>
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-white dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] text-[#0b2a5b] dark:text-white hover:bg-gray-50 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish</span>
            </Button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#141d2e] p-5 rounded-2xl border border-[#e1e8f3] dark:border-[#24324d] flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              O‘rtacha davomat
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0c3b7c] dark:text-[#5a95e5]">
              95.4% <span className="text-sm font-medium text-[#4a5f82] dark:text-[#9db4dd]">· 458/480 nafar</span>
            </div>
            <span className="text-xs text-emerald-600 font-medium">
              +1.2% o‘tgan oyga nisbatan
            </span>
          </div>

          <div className="bg-white dark:bg-[#141d2e] p-5 rounded-2xl border border-[#e1e8f3] dark:border-[#24324d] flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Qatnashgan o‘quvchilar
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0b2a5b] dark:text-white">
              458 nafar <span className="text-base font-semibold text-emerald-600">(95.4%)</span>
            </div>
            <span className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
              Jami 18 ta sinf bo‘yicha
            </span>
          </div>

          <div className="bg-white dark:bg-[#141d2e] p-5 rounded-2xl border border-[#e1e8f3] dark:border-[#24324d] flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-red-600" />
              Sababsiz qoldirilgan
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-600">
              7 nafar
            </div>
            <span className="text-xs text-red-500 font-medium">
              1.4% qatnashmaslik darajasi
            </span>
          </div>

          <div className="bg-white dark:bg-[#141d2e] p-5 rounded-2xl border border-[#e1e8f3] dark:border-[#24324d] flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-yellow-600" />
              Kechikish holatlari
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-yellow-600">
              3 nafar
            </div>
            <span className="text-xs text-yellow-600 font-medium">
              Ertalabki nazorat bo‘yicha
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">
                2026–2027 o‘quv yili:
              </span>

              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  const optText = e.target.options[e.target.selectedIndex].text;
                  setSelectedMonthName(optText.split(' (')[0]);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#e6f0ff] dark:bg-[#1c2c47] text-[#0066cc] dark:text-[#4d9fff] border border-[#ccd8e8] dark:border-[#2f4063] focus:outline-hidden cursor-pointer"
              >
                <option value="2026-10">Oktabr 2026 (Joriy oy)</option>
                <option value="2026-09">Sentabr 2026 (O‘tgan oy)</option>
                <option value="QUARTER-1">1-chorak (Sentabr–Oktabr)</option>
                <option value="QUARTER-2">2-chorak (Noyabr–Dekabr)</option>
                <option value="YEAR">2026–2027 o‘quv yili (Yillik)</option>
              </select>

              <button
                onClick={() => setSelectedPeriod('WEEK')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedPeriod === 'WEEK'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                Haftalik
              </button>
              <button
                onClick={() => setSelectedPeriod('MONTH')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedPeriod === 'MONTH'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                Oylik
              </button>
              <button
                onClick={() => setSelectedPeriod('QUARTER')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedPeriod === 'QUARTER'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                Choraklik
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">
                Sinflar:
              </span>
              <button
                onClick={() => setGradeFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  gradeFilter === 'ALL'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setGradeFilter('PRIMARY')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  gradeFilter === 'PRIMARY'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                Boshlang‘ich (1–4)
              </button>
              <button
                onClick={() => setGradeFilter('HIGH')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  gradeFilter === 'HIGH'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                Yuqori (10–11)
              </button>
            </div>
          </div>
        </Card>

        {/* Breakdown Table */}
        <Card className="p-0 overflow-hidden bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d]">
          <div className="p-4 border-b border-[#e1e8f3] dark:border-[#24324d] flex items-center justify-between">
            <h2 className="font-bold text-base text-[#0b2a5b] dark:text-white">
              Sinflar bo‘yicha davomat hisoboti
            </h2>
            <span className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
              {filteredRows.length} ta sinf ko‘rsatilmoqda
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f4f7fc] dark:bg-[#0e1726] border-b border-[#e1e8f3] dark:border-[#24324d] text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">
                  <th className="py-3 px-4">Sinf</th>
                  <th className="py-3 px-4">Sinf rahbari</th>
                  <th className="py-3 px-4 text-center">Jami</th>
                  <th className="py-3 px-4 text-center">Davomat foizi</th>
                  <th className="py-3 px-4 text-center">Keldi</th>
                  <th className="py-3 px-4 text-center">Kelmadi</th>
                  <th className="py-3 px-4 text-center">Sababli</th>
                  <th className="py-3 px-4 text-center">Kechikdi</th>
                  <th className="py-3 px-4 text-right">Baho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e8f3] dark:divide-[#24324d]">
                {filteredRows.map((row) => (
                  <tr
                    key={row.className}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#0c3b7c] dark:text-[#5a95e5]">
                      {row.className}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#0b2a5b] dark:text-white">
                      {row.teacher}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-[#4a5f82] dark:text-[#9db4dd]">
                      {row.totalStudents}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${
                              row.rate >= 95
                                ? 'bg-emerald-500'
                                : row.rate >= 90
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                            }`}
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs whitespace-nowrap">
                          {row.keldi}/{row.totalStudents} ({row.rate}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      {row.keldi}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-red-600">
                      {row.kelmadi}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                      {row.sababli}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-yellow-600">
                      {row.kechikdi}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          row.statusText === 'A’lo'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : row.statusText === 'Yaxshi'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300'
                        }`}
                      >
                        {row.statusText}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PanelShell>
  );
}
