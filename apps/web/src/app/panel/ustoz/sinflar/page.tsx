'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@neom/shared';
import {
  Layers,
  Users,
  Plus,
  CalendarCheck,
  Search,
  CheckCircle2,
  Phone,
  UserCheck,
  X,
  UserPlus,
} from 'lucide-react';

interface StudentInfo {
  id: string;
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  attendanceRate: number;
}

const INITIAL_STUDENTS: StudentInfo[] = [
  { id: '1', name: 'Aliyev Anvar', phone: '+998 90 123-45-67', parentName: 'Aliyev Shavkat', parentPhone: '+998 90 987-65-43', attendanceRate: 98 },
  { id: '2', name: 'Karimova Malika', phone: '+998 93 234-56-78', parentName: 'Karimova Nargiza', parentPhone: '+998 93 876-54-32', attendanceRate: 92 },
  { id: '3', name: 'Hasanov Ali', phone: '+998 97 345-67-89', parentName: 'Hasanov Dilshod', parentPhone: '+998 97 765-43-21', attendanceRate: 94 },
  { id: '4', name: 'Saidova Madina', phone: '+998 99 456-78-90', parentName: 'Saidov Bahrom', parentPhone: '+998 99 654-32-10', attendanceRate: 96 },
  { id: '5', name: 'Toshmatov Jasur', phone: '+998 91 567-89-01', parentName: 'Toshmatov Otabek', parentPhone: '+998 91 543-21-09', attendanceRate: 100 },
  { id: '6', name: 'Yusupova Rayhona', phone: '+998 94 678-90-12', parentName: 'Yusupova Gulnora', parentPhone: '+998 94 432-10-98', attendanceRate: 96 },
];

export default function TeacherClassesPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentInfo[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast('O‘quvchi ismini kiriting', 'error');
      return;
    }

    const created: StudentInfo = {
      id: `std-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || '+998 90 000-00-00',
      parentName: newParentName.trim() || 'Ota-ona',
      parentPhone: newParentPhone.trim() || '+998 90 000-00-00',
      attendanceRate: 100,
    };

    setStudents([...students, created]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewParentName('');
    setNewParentPhone('');
    toast('Yangi o‘quvchi sinfga qo‘shildi!', 'success');
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
              <Layers className="w-7 h-7 text-[#0066cc] dark:text-[#4d9fff]" />
              Mening sinflarim (9-A sinf)
            </h1>
            <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd] mt-1">
              Sinf rahbari jurnali, o‘quvchilar ro‘yxati va bog‘lanish ma’lumotlari
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/panel/ustoz">
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#0066cc]" />
                Bugungi davomat
              </Button>
            </Link>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white"
            >
              <UserPlus className="w-4 h-4" />
              Yangi o‘quvchi
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6f0ff] dark:bg-[#1c2c47] flex items-center justify-center text-[#0066cc] dark:text-[#4d9fff] shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{students.length} nafar</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Sinf o‘quvchilari</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6fff0] dark:bg-[#163824] flex items-center justify-center text-[#009944] dark:text-[#33cc77] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">96%</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">O‘rtacha davomat</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fff8e6] dark:bg-[#382d16] flex items-center justify-center text-[#d97706] dark:text-[#fbbf24] shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">302-xona</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Biriktirilgan xona</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f5e6ff] dark:bg-[#2c1a3e] flex items-center justify-center text-[#7c3aed] dark:text-[#a78bfa] shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">100%</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Topshirilgan hisobot</div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center justify-between">
          <div className="text-sm font-bold text-[#0b2a5b] dark:text-white">
            O‘quvchilar ro‘yxati ({filteredStudents.length})
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7e95b8]" />
            <input
              type="text"
              placeholder="O‘quvchi yoki ota-onani qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-[#f8fafc] dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white focus:outline-hidden focus:border-[#0066cc]"
            />
          </div>
        </Card>

        {/* Student Table */}
        <Card className="p-0 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8fafc] dark:bg-[#1c2c47] border-b border-[#e1e8f3] dark:border-[#24324d] text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">O‘quvchi (F.I.SH)</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Ota-onasi</th>
                  <th className="py-3 px-4">Ota-ona telefoni</th>
                  <th className="py-3 px-4 text-center">Davomat ko‘rsatkichi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f7] dark:divide-[#1e2c45]">
                {filteredStudents.map((std, idx) => (
                  <tr key={std.id} className="hover:bg-[#f8fafc] dark:hover:bg-[#172236] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-bold text-[#7e95b8]">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-[#0b2a5b] dark:text-white">{std.name}</td>
                    <td className="py-3.5 px-4 text-[#4a5f82] dark:text-[#9db4dd] text-xs flex items-center gap-1.5 pt-4">
                      <Phone className="w-3.5 h-3.5 text-[#0066cc]" />
                      {std.phone}
                    </td>
                    <td className="py-3.5 px-4 text-[#4a5f82] dark:text-[#9db4dd] text-xs">{std.parentName}</td>
                    <td className="py-3.5 px-4 text-[#4a5f82] dark:text-[#9db4dd] text-xs">{std.parentPhone}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e6fff0] dark:bg-[#163824] text-[#009944] dark:text-[#33cc77]">
                        {std.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Yangi o'quvchi qo'shish */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-[#141d2e] border-[#ccd8e8] dark:border-[#24324d] shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#edf2f7] dark:border-[#24324d]">
                <h3 className="text-lg font-bold text-[#0b2a5b] dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#0066cc]" />
                  9-A sinfiga yangi o‘quvchi qo‘shish
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-[#7e95b8] hover:text-[#0b2a5b] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                    O‘quvchi to‘liq ismi (F.I.SH)
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Masalan: Qodirov Sardor"
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                    O‘quvchi telefoni
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+998 90 123-45-67"
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                    Ota-onasi (F.I.SH)
                  </label>
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    placeholder="Masalan: Qodirova Munira"
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                    Ota-ona telefon raqami
                  </label>
                  <input
                    type="text"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    placeholder="+998 90 987-65-43"
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#edf2f7] dark:border-[#24324d] mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Bekor qilish
                  </Button>
                  <Button type="submit" className="bg-[#0066cc] text-white">
                    O‘quvchini saqlash
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
