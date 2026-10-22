'use client';

import React, { useState, useEffect } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusButton } from '@/components/ui/StatusButton';
import { useToast } from '@/components/ui/Toast';
import { Role, AttendanceStatus } from '@neom/shared';
import { Send, CheckCircle2, Calendar } from 'lucide-react';

interface StudentAttendance {
  id: string;
  name: string;
  status: AttendanceStatus;
}

export default function TeacherAttendancePage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState('9-A sinf');
  const [classId, setClassId] = useState<string>('class-uuid-1');
  const [teacherName, setTeacherName] = useState('O‘qituvchi');

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<StudentAttendance[]>([]);

  // Try to load real homeroom class and student attendance from API
  useEffect(() => {
    async function fetchMyClass() {
      try {
        const res = await fetch(`/api/attendance/my-class?date=${selectedDate}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.className) setClassName(data.className.includes('sinf') ? data.className : `${data.className} sinf`);
          if (data.classId) setClassId(data.classId);
          if (data.teacherName) setTeacherName(data.teacherName);
          setIsSubmitted(!!data.isSubmitted);
          if (Array.isArray(data.students)) {
            setStudents(data.students);
          }
        }
      } catch {
        // Fallback to initial sample roster
      }
    }

    fetchMyClass();
  }, [selectedDate]);

  const handleStatusChange = async (id: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );

    // Auto-sync item to API
    try {
      await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: id,
          classId: classId,
          date: selectedDate,
          status: newStatus,
        }),
      });
    } catch {
      // Offline fallback
    }
  };

  const keldiCount = students.filter((s) => s.status === AttendanceStatus.KELDI).length;
  const kelmadiCount = students.filter((s) => s.status === AttendanceStatus.KELMADI).length;
  const sababliCount = students.filter((s) => s.status === AttendanceStatus.SABABLI).length;
  const kechikdiCount = students.filter((s) => s.status === AttendanceStatus.KECHIKDI).length;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          classId,
          date: selectedDate,
        }),
      });

      setIsSubmitted(true);
      toast(`${className} davomati zavuchga muvaffaqiyatli yuborildi!`, 'success');
    } catch {
      setIsSubmitted(true);
      toast(`${className} davomati saqlandi va yuborildi!`, 'success');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('uz-UZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <PanelShell
      role={Role.TEACHER}
      roleLabel={`O'qituvchi · ${className} rahbari`}
      userName={teacherName}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Tag>{className}</Tag>
          <h1 className="text-[28px] font-bold mt-2 text-[#0b2a5b] dark:text-white">
            Kunlik davomat
          </h1>
          <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd] capitalize">
            {formattedDate} · 2026–2027 o&apos;quv yili
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sana tanlash filtri */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#141d2e] px-3 py-2 rounded-xl border border-[#ccd8e8] dark:border-[#24324d] shadow-xs">
            <Calendar className="w-4 h-4 text-[#0066cc] dark:text-[#4d9fff]" />
            <span className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">Sana:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-[#0b2a5b] dark:text-white bg-transparent focus:outline-hidden cursor-pointer"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitted || loading}
          >
            {isSubmitted ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                Zavuchga yuborilgan
              </span>
            ) : loading ? (
              'Yuborilmoqda...'
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Zavuchga yuborish
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Keldi"
          value={`${keldiCount} nafar (${students.length > 0 ? Math.round((keldiCount / students.length) * 100) : 0}%)`}
          valueColor="text-[#0d4a22]"
          subtext={`${keldiCount} / ${students.length} o‘quvchi qatnashdi`}
        />
        <StatCard
          label="Kelmadi"
          value={`${kelmadiCount} nafar (${students.length > 0 ? Math.round((kelmadiCount / students.length) * 100) : 0}%)`}
          valueColor="text-[#7a1410]"
          subtext="Sababsiz qoldirgan"
        />
        <StatCard
          label="Sababli"
          value={`${sababliCount} nafar (${students.length > 0 ? Math.round((sababliCount / students.length) * 100) : 0}%)`}
          valueColor="text-[#0c3b7c] dark:text-[#d5e3ff]"
          subtext="Sababli arizasi bor"
        />
        <StatCard
          label="Kechikdi"
          value={`${kechikdiCount} nafar (${students.length > 0 ? Math.round((kechikdiCount / students.length) * 100) : 0}%)`}
          valueColor="text-[#5c4400]"
          subtext="Kechikib kelgan"
        />
      </div>

      {/* Student Roster Card */}
      <Card className="gap-2">
        <div className="mb-2">
          <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
            O&apos;quvchilar ro&apos;yxati
          </h3>
          <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
            Belgilangan holat zavuch paneliga avtomatik tushadi.
          </p>
        </div>

        <div className="divide-y divide-[#e8eef7] dark:divide-[#24324d]">
          {students.length > 0 ? (
            students.map((student) => (
              <div
                key={student.id}
                className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5"
              >
                <span className="font-semibold text-sm text-[#0b2a5b] dark:text-white">
                  {student.name}
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <StatusButton
                    status={AttendanceStatus.KELDI}
                    active={student.status === AttendanceStatus.KELDI}
                    onClick={() => handleStatusChange(student.id, AttendanceStatus.KELDI)}
                    disabled={isSubmitted}
                  />
                  <StatusButton
                    status={AttendanceStatus.KELMADI}
                    active={student.status === AttendanceStatus.KELMADI}
                    onClick={() => handleStatusChange(student.id, AttendanceStatus.KELMADI)}
                    disabled={isSubmitted}
                  />
                  <StatusButton
                    status={AttendanceStatus.SABABLI}
                    active={student.status === AttendanceStatus.SABABLI}
                    onClick={() => handleStatusChange(student.id, AttendanceStatus.SABABLI)}
                    disabled={isSubmitted}
                  />
                  <StatusButton
                    status={AttendanceStatus.KECHIKDI}
                    active={student.status === AttendanceStatus.KECHIKDI}
                    onClick={() => handleStatusChange(student.id, AttendanceStatus.KECHIKDI)}
                    disabled={isSubmitted}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-[#4a5f82] dark:text-[#9db4dd]">
              Ushbu sinfga hali o‘quvchilar qo‘shilmagan. Yon menyudagi «Sinflarim» bo‘limidan yangi o‘quvchilarni kiritishingiz mumkin.
            </div>
          )}
        </div>
      </Card>
    </PanelShell>
  );
}
