'use client';

import React, { useState } from 'react';
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
  AlertCircle,
  Clock,
} from 'lucide-react';

interface AttendanceRow {
  student: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  rate: number;
}

const REPORT_DATA: AttendanceRow[] = [
  { student: 'Aliyev Anvar', mon: 'Keldi', tue: 'Keldi', wed: 'Keldi', thu: 'Keldi', fri: 'Keldi', sat: 'Keldi', rate: 100 },
  { student: 'Karimova Malika', mon: 'Keldi', tue: 'Kelmadi', wed: 'Keldi', thu: 'Keldi', fri: 'Keldi', sat: 'Keldi', rate: 83 },
  { student: 'Hasanov Ali', mon: 'Keldi', tue: 'Keldi', wed: 'Sababli', thu: 'Keldi', fri: 'Keldi', sat: 'Keldi', rate: 83 },
  { student: 'Saidova Madina', mon: 'Keldi', tue: 'Keldi', wed: 'Kechikdi', thu: 'Keldi', fri: 'Keldi', sat: 'Keldi', rate: 95 },
  { student: 'Toshmatov Jasur', mon: 'Keldi', tue: 'Keldi', wed: 'Keldi', thu: 'Keldi', fri: 'Keldi', sat: 'Keldi', rate: 100 },
  { student: 'Yusupova Rayhona', mon: 'Keldi', tue: 'Keldi', wed: 'Keldi', thu: 'Keldi', fri: 'Keldi', sat: 'Keldi', rate: 100 },
];

export default function TeacherReportPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('WEEK');

  const handleExportCSV = () => {
    const headers = 'O‘quvchi,Dushanba,Seshanba,Chorshanba,Payshanba,Juma,Shanba,Davomat\n';
    const rows = REPORT_DATA.map(
      (r) => `"${r.student}","${r.mon}","${r.tue}","${r.wed}","${r.thu}","${r.fri}","${r.sat}",${r.rate}%`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `davomat_hisoboti_9A_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Hisobot Excel (CSV) fayl sifatida yuklab olindi!', 'success');
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
      roleLabel="O'qituvchi · 9-A sinf rahbari"
      userName="Qodirov Jamshid"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#0b2a5b] dark:text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-[#0066cc] dark:text-[#4d9fff]" />
              Sinf davomat hisoboti (9-A sinf)
            </h1>
            <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd] mt-1">
              O‘quvchilarning haftalik, oylik va choraklik davomat statistikasi
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
              className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white"
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
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">96%</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Umumiy davomat</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6f0ff] dark:bg-[#1c2c47] flex items-center justify-center text-[#0066cc] dark:text-[#4d9fff] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">32 ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Kelganlar jami</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fde0e0] dark:bg-[#381616] flex items-center justify-center text-[#b3261e] dark:text-[#ff6b6b] shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">1 ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Sababsiz qoldirish</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fff8e6] dark:bg-[#382d16] flex items-center justify-center text-[#d97706] dark:text-[#fbbf24] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">1 ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Kechikishlar</div>
            </div>
          </Card>
        </div>

        {/* Filter bar */}
        <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPeriod('WEEK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                period === 'WEEK'
                  ? 'bg-[#0066cc] text-white'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd]'
              }`}
            >
              Joriy hafta
            </button>
            <button
              onClick={() => setPeriod('MONTH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                period === 'MONTH'
                  ? 'bg-[#0066cc] text-white'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd]'
              }`}
            >
              Shu oy
            </button>
            <button
              onClick={() => setPeriod('QUARTER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                period === 'QUARTER'
                  ? 'bg-[#0066cc] text-white'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd]'
              }`}
            >
              1-chorak
            </button>
          </div>

          <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">
            Shartli belgilar: <span className="font-bold text-[#009944]">K</span> (Keldi), <span className="font-bold text-[#b3261e]">Q</span> (Qoldi), <span className="font-bold text-[#0066cc]">S</span> (Sababli), <span className="font-bold text-[#d97706]">Kch</span> (Kechikdi)
          </div>
        </Card>

        {/* Detailed Table */}
        <Card className="p-0 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8fafc] dark:bg-[#1c2c47] border-b border-[#e1e8f3] dark:border-[#24324d] text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">O‘quvchi</th>
                  <th className="py-3 px-3 text-center">Du (19)</th>
                  <th className="py-3 px-3 text-center">Se (20)</th>
                  <th className="py-3 px-3 text-center">Chor (21)</th>
                  <th className="py-3 px-3 text-center">Pay (22)</th>
                  <th className="py-3 px-3 text-center">Jum (23)</th>
                  <th className="py-3 px-3 text-center">Shan (24)</th>
                  <th className="py-3 px-4 text-center">Davomat %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f7] dark:divide-[#1e2c45]">
                {REPORT_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f8fafc] dark:hover:bg-[#172236] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-bold text-[#7e95b8]">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-[#0b2a5b] dark:text-white">{row.student}</td>
                    <td className="py-3.5 px-3 text-center">{getStatusBadge(row.mon)}</td>
                    <td className="py-3.5 px-3 text-center">{getStatusBadge(row.tue)}</td>
                    <td className="py-3.5 px-3 text-center">{getStatusBadge(row.wed)}</td>
                    <td className="py-3.5 px-3 text-center">{getStatusBadge(row.thu)}</td>
                    <td className="py-3.5 px-3 text-center">{getStatusBadge(row.fri)}</td>
                    <td className="py-3.5 px-3 text-center">{getStatusBadge(row.sat)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#e6fff0] dark:bg-[#163824] text-[#009944] dark:text-[#33cc77]">
                        {row.rate}%
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
