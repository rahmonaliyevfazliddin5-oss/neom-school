'use client';

import React, { useState, useEffect } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@neom/shared';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface AttendanceRow {
  id: string;
  student: string;
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

export default function TeacherReportPage() {
  const { toast } = useToast();
  const [className, setClassName] = useState('9-A');
  const [teacherName, setTeacherName] = useState('O‘qituvchi');
  const [periodType, setPeriodType] = useState<'MONTH' | 'WEEK' | 'QUARTER' | 'YEAR'>('MONTH');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [selectedMonthName, setSelectedMonthName] = useState('Oktabr 2026');
  const [reportRows, setReportRows] = useState<AttendanceRow[]>([]);

  const [stats, setStats] = useState({
    rate: 100,
    totalDays: 0,
    keldi: 0,
    kelmadi: 0,
    kechikdi: 0,
  });

  // Load teacher profile & initial report
  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) {
          const meData = await meRes.json();
          const targetClass = meData.className || '9-A';
          setClassName(targetClass);
          if (meData.fullName) setTeacherName(meData.fullName);

          loadReport(targetClass, selectedMonth);
        }
      } catch {
        // Fallback
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReport = async (cls: string, periodId: string) => {
    try {
      const res = await fetch(`/api/reports/class?className=${encodeURIComponent(cls)}&period=${encodeURIComponent(periodId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.report) {
          const rep = data.report;
          setSelectedMonthName(rep.monthName);
          setStats({
            rate: rep.attendanceRate,
            totalDays: rep.totalDays,
            keldi: rep.keldi,
            kelmadi: rep.kelmadi,
            kechikdi: rep.kechikdi,
          });

          if (Array.isArray(rep.students) && rep.students.length > 0) {
            const formatted: AttendanceRow[] = rep.students.map((s: any) => ({
              id: s.id,
              student: s.name,
              mon: s.mon || 'Keldi',
              tue: s.tue || 'Keldi',
              wed: s.wed || 'Keldi',
              thu: s.thu || 'Keldi',
              fri: s.fri || 'Keldi',
              sat: s.sat || 'Keldi',
              attendedDays: s.attendedDays ?? 0,
              missedDays: s.missedDays ?? 0,
              excusedDays: s.excusedDays ?? 0,
              lateDays: s.lateDays ?? 0,
              rate: s.rate ?? 100,
            }));
            setReportRows(formatted);
          } else {
            setReportRows([]);
          }
        }
      }
    } catch {
      // Fallback
    }
  };

  const handlePeriodChange = (type: 'MONTH' | 'WEEK' | 'QUARTER' | 'YEAR', periodId: string) => {
    setPeriodType(type);
    setSelectedMonth(periodId);
    loadReport(className, periodId);
  };

  const handleExportCSV = () => {
    const headers = '№,O‘quvchi,Dushanba,Seshanba,Chorshanba,Payshanba,Juma,Shanba,Qatnashgan kunlar,Qoldirgan,Kechikkan,Davomat ko‘rsatkichi\n';
    const rows = reportRows.map((r, idx) =>
      `${idx + 1},"${r.student}","${r.mon}","${r.tue}","${r.wed}","${r.thu}","${r.fri}","${r.sat}",${r.attendedDays},${r.missedDays},${r.lateDays},${r.rate}%`
    ).join('\n');

    const cleanName = selectedMonthName.replace(/[^a-zA-Z0-9]/g, '_');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `davomat_hisoboti_${className}_${cleanName}_2026-2027.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`${selectedMonthName} davomat hisoboti Excel (CSV) faylida saqlandi!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (val: string) => {
    switch (val) {
      case 'Keldi':
        return <span className="text-xs font-bold text-[#009944] bg-[#e6fff0] dark:bg-[#163824] px-2 py-0.5 rounded-sm">K</span>;
      case 'Kelmadi':
        return <span className="text-xs font-bold text-[#b3261e] bg-[#fde0e0] dark:bg-[#381616] px-2 py-0.5 rounded-sm">Q</span>;
      case 'Sababli':
        return <span className="text-xs font-bold text-[#0066cc] bg-[#e6f0ff] dark:bg-[#1c2c47] px-2 py-0.5 rounded-sm">S</span>;
      case 'Kechikdi':
        return <span className="text-xs font-bold text-[#d97706] bg-[#fff8e6] dark:bg-[#382d16] px-2 py-0.5 rounded-sm">Kch</span>;
      default:
        return <span>{val}</span>;
    }
  };

  return (
    <PanelShell
      role={Role.TEACHER}
      roleLabel={`O'qituvchi · ${className} sinf rahbari`}
      userName={teacherName}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#e6f0ff] dark:bg-[#1c2c47] text-[#0066cc] dark:text-[#4d9fff] text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              2026–2027 o‘quv yili hisoboti
            </div>
            <h1 className="text-[28px] font-bold text-[#0b2a5b] dark:text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-[#0066cc] dark:text-[#4d9fff]" />
              Sinf davomat hisoboti ({className} sinf)
            </h1>
            <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd] mt-1">
              {selectedMonthName} holatiga ko‘ra saqlangan oylik va choraklik hisobotlar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#0066cc]" />
              Chop etish
            </Button>

            <Button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-sm"
            >
              <Download className="w-4 h-4" />
              Excel yuklab olish
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6fff0] dark:bg-[#163824] flex items-center justify-center text-[#009944] dark:text-[#33cc77] shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{stats.rate}%</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Oylik o‘rtacha davomat</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6f0ff] dark:bg-[#1c2c47] flex items-center justify-center text-[#0066cc] dark:text-[#4d9fff] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{stats.totalDays} kun</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Jami dars kunlari</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fde0e0] dark:bg-[#381616] flex items-center justify-center text-[#b3261e] dark:text-[#ff6b6b] shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{stats.kelmadi} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Sababsiz qoldirish</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fff8e6] dark:bg-[#382d16] flex items-center justify-center text-[#d97706] dark:text-[#fbbf24] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{stats.kechikdi} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Kechikishlar</div>
            </div>
          </Card>
        </div>

        {/* Filter bar: O‘tgan oylar va davrlar filtri */}
        <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#4a5f82] dark:text-[#9db4dd] mr-1">
              O‘quv yili davri:
            </span>

            {/* Oy tanlash dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => handlePeriodChange('MONTH', e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#e6f0ff] dark:bg-[#1c2c47] text-[#0066cc] dark:text-[#4d9fff] border border-[#ccd8e8] dark:border-[#2f4063] focus:outline-hidden cursor-pointer"
            >
              <optgroup label="2026-yil oylari">
                <option value="2026-10">Oktabr 2026 (Joriy oy)</option>
                <option value="2026-09">Sentabr 2026 (O‘tgan oy)</option>
                <option value="2026-11">Noyabr 2026</option>
                <option value="2026-12">Dekabr 2026</option>
              </optgroup>
              <optgroup label="2027-yil oylari">
                <option value="2027-01">Yanvar 2027</option>
                <option value="2027-02">Fevral 2027</option>
                <option value="2027-03">Mart 2027</option>
                <option value="2027-04">Aprel 2027</option>
                <option value="2027-05">May 2027</option>
              </optgroup>
            </select>

            {/* Choraklar va Yillik */}
            <button
              onClick={() => handlePeriodChange('QUARTER', 'QUARTER-1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedMonth === 'QUARTER-1'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f5]'
              }`}
            >
              1-chorak (Sentabr–Oktabr)
            </button>

            <button
              onClick={() => handlePeriodChange('QUARTER', 'QUARTER-2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedMonth === 'QUARTER-2'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f5]'
              }`}
            >
              2-chorak
            </button>

            <button
              onClick={() => handlePeriodChange('YEAR', 'YEAR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedMonth === 'YEAR'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f5]'
              }`}
            >
              Yillik (2026–2027)
            </button>
          </div>

          <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">
            Ko‘rsatkich: <span className="font-bold text-[#009944]">K</span> (Keldi), <span className="font-bold text-[#b3261e]">Q</span> (Qoldi), <span className="font-bold text-[#0066cc]">S</span> (Sababli), <span className="font-bold text-[#d97706]">Kch</span> (Kechikdi)
          </div>
        </Card>

        {/* Detailed Table */}
        <Card className="p-0 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8fafc] dark:bg-[#1c2c47] border-b border-[#e1e8f3] dark:border-[#24324d] text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">O‘quvchi (F.I.SH)</th>
                  <th className="py-3 px-3 text-center">Du</th>
                  <th className="py-3 px-3 text-center">Se</th>
                  <th className="py-3 px-3 text-center">Chor</th>
                  <th className="py-3 px-3 text-center">Pay</th>
                  <th className="py-3 px-3 text-center">Jum</th>
                  <th className="py-3 px-3 text-center">Shan</th>
                  <th className="py-3 px-3 text-center">Qatnashgan</th>
                  <th className="py-3 px-3 text-center">Qoldirgan</th>
                  <th className="py-3 px-4 text-center">Davomat %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f7] dark:divide-[#1e2c45]">
                {reportRows.length > 0 ? (
                  reportRows.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-[#f8fafc] dark:hover:bg-[#172236] transition-colors">
                      <td className="py-3.5 px-4 text-xs font-bold text-[#7e95b8]">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-[#0b2a5b] dark:text-white">{row.student}</td>
                      <td className="py-3.5 px-3 text-center">{getStatusBadge(row.mon)}</td>
                      <td className="py-3.5 px-3 text-center">{getStatusBadge(row.tue)}</td>
                      <td className="py-3.5 px-3 text-center">{getStatusBadge(row.wed)}</td>
                      <td className="py-3.5 px-3 text-center">{getStatusBadge(row.thu)}</td>
                      <td className="py-3.5 px-3 text-center">{getStatusBadge(row.fri)}</td>
                      <td className="py-3.5 px-3 text-center">{getStatusBadge(row.sat)}</td>
                      <td className="py-3.5 px-3 text-center font-semibold text-[#009944]">{row.attendedDays} kun</td>
                      <td className="py-3.5 px-3 text-center font-semibold text-[#b3261e]">{row.missedDays} kun</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e6fff0] dark:bg-[#163824] text-[#009944] dark:text-[#33cc77]">
                          {row.rate}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-sm text-[#7e95b8] dark:text-[#8ea8d6]">
                      Ushbu sinf uchun hozircha o‘quvchilar ro‘yxati yoki davomat hisoboti shakllanmagan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PanelShell>
  );
}
