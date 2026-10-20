'use client';

import React, { useState, useEffect } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@neom/shared';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Shield,
  Edit2,
  Phone,
  BookOpen,
} from 'lucide-react';

interface StaffMember {
  id: string;
  fullName: string;
  role: string;
  roleType: 'DIRECTOR' | 'ZAVUCH' | 'TEACHER';
  subjectOrClass: string;
  phone: string;
  isActive: boolean;
  joinedDate: string;
}

export default function DirectorStaffPage() {
  const { toast } = useToast();
  const [directorName, setDirectorName] = useState('Rustamov Shavkat Akbarovich');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'DIRECTOR' | 'ZAVUCH' | 'TEACHER'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding staff
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'TEACHER' | 'ZAVUCH' | 'DIRECTOR'>('TEACHER');
  const [newSubject, setNewSubject] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'st-1',
      fullName: 'Rustamov Shavkat Akbarovich',
      role: 'Maktab direktori',
      roleType: 'DIRECTOR',
      subjectOrClass: 'Umumiy boshqaruv',
      phone: '+998 50 006 79 69',
      isActive: true,
      joinedDate: '2024-08-15',
    },
    {
      id: 'st-2',
      fullName: 'Nodirova Dilnoza Alisherovna',
      role: 'O‘quv ishlari bo‘yicha direktor o‘rinbosari (Zavuch)',
      roleType: 'ZAVUCH',
      subjectOrClass: 'O‘quv jarayoni va metodika',
      phone: '+998 90 123 45 67',
      isActive: true,
      joinedDate: '2024-08-20',
    },
    {
      id: 'st-3',
      fullName: 'Qodirov Jamshid Baxromovich',
      role: 'Sinf rahbari / Katta o‘qituvchi',
      roleType: 'TEACHER',
      subjectOrClass: '1-A sinf rahbari · Matematika',
      phone: '+998 93 555 44 33',
      isActive: true,
      joinedDate: '2025-01-10',
    },
    {
      id: 'st-4',
      fullName: 'Ahmedova Nilufar Shuxratovna',
      role: 'Sinf rahbari / O‘qituvchi',
      roleType: 'TEACHER',
      subjectOrClass: '2-A sinf rahbari · Ona tili va adabiyot',
      phone: '+998 97 777 88 99',
      isActive: true,
      joinedDate: '2025-02-01',
    },
    {
      id: 'st-5',
      fullName: 'Usmonov Otabek Mirzohidovich',
      role: 'Sinf rahbari / O‘qituvchi',
      roleType: 'TEACHER',
      subjectOrClass: '11-A sinf rahbari · Fizika va Astronomiya',
      phone: '+998 94 321 00 11',
      isActive: true,
      joinedDate: '2025-02-15',
    },
    {
      id: 'st-6',
      fullName: 'Xoliqova Feruza Mansurovna',
      role: 'Fan o‘qituvchisi',
      roleType: 'TEACHER',
      subjectOrClass: 'Ingliz tili (IELTS / CEFR)',
      phone: '+998 91 444 33 22',
      isActive: true,
      joinedDate: '2025-03-01',
    },
    {
      id: 'st-7',
      fullName: 'Karimov Sanjar Anvarovich',
      role: 'Fan o‘qituvchisi',
      roleType: 'TEACHER',
      subjectOrClass: 'Informatika va Robototexnika',
      phone: '+998 99 888 77 66',
      isActive: true,
      joinedDate: '2025-03-10',
    },
  ]);

  const filteredStaff = staffList.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.subjectOrClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedFilter === 'ALL' || member.roleType === selectedFilter;

    return matchesSearch && matchesRole;
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newSubject.trim()) {
      toast("Iltimos, F.I.SH va fan/sinf ma'lumotini to'ldiring", 'error');
      return;
    }

    let roleTitle = 'Fan o‘qituvchisi';
    if (newRole === 'DIRECTOR') roleTitle = 'Direktorat a’zosi';
    if (newRole === 'ZAVUCH') roleTitle = 'O‘quv bo‘limi / Zavuch';

    const newMember: StaffMember = {
      id: `st-${Date.now()}`,
      fullName: newFullName.trim(),
      role: roleTitle,
      roleType: newRole,
      subjectOrClass: newSubject.trim(),
      phone: newPhone.trim() || '+998 90 000 00 00',
      isActive: true,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setStaffList([newMember, ...staffList]);
    setShowAddModal(false);
    setNewFullName('');
    setNewSubject('');
    setNewPhone('');
    toast("Yangi xodim muvaffaqiyatli qo'shildi!", 'success');
  };

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const user = data?.data || data;
        if (user?.fullName) {
          setDirectorName(user.fullName);
          setStaffList((prev) =>
            prev.map((m) =>
              m.roleType === 'DIRECTOR' ? { ...m, fullName: user.fullName } : m,
            ),
          );
        }
      })
      .catch(() => {});
  }, []);

  const toggleStaffStatus = (id: string) => {
    setStaffList(
      staffList.map((m) =>
        m.id === id ? { ...m, isActive: !m.isActive } : m,
      ),
    );
    toast("Xodim holati yangilandi", 'info');
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
              Maktab xodimlari va ustozlar
            </h1>
            <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd]">
              O‘qituvchilar, sinf rahbarlari va maktab jamoasini nazorat qilish
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0c3b7c] hover:bg-[#092c5d] text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi xodim qo‘shish</span>
          </Button>
        </div>

        {/* 4 Quick Stat Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#141d2e] p-4 rounded-xl border border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#0c3b7c] dark:text-[#5a95e5] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">Jami xodimlar</div>
              <div className="text-lg font-bold text-[#0b2a5b] dark:text-white">{staffList.length} nafar</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141d2e] p-4 rounded-xl border border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">O‘qituvchilar</div>
              <div className="text-lg font-bold text-[#0b2a5b] dark:text-white">
                {staffList.filter((s) => s.roleType === 'TEACHER').length} nafar
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141d2e] p-4 rounded-xl border border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-[#f78b2d] flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">Rahbariyat</div>
              <div className="text-lg font-bold text-[#0b2a5b] dark:text-white">
                {staffList.filter((s) => s.roleType !== 'TEACHER').length} nafar
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141d2e] p-4 rounded-xl border border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">Faol holatda</div>
              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                {staffList.filter((s) => s.isActive).length} nafar
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a5f82]" />
              <input
                type="text"
                placeholder="Xodim ismi, fani yoki lavozimi bo‘yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#e1e8f3] dark:border-[#24324d] bg-[#f8fafc] dark:bg-[#0e1726] text-[#0b2a5b] dark:text-white outline-none focus:border-[#0c3b7c]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFilter('ALL')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  selectedFilter === 'ALL'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setSelectedFilter('TEACHER')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  selectedFilter === 'TEACHER'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                O‘qituvchilar
              </button>
              <button
                onClick={() => setSelectedFilter('ZAVUCH')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  selectedFilter === 'ZAVUCH'
                    ? 'bg-[#0c3b7c] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[#4a5f82] dark:text-[#9db4dd]'
                }`}
              >
                Zavuch
              </button>
            </div>
          </div>
        </Card>

        {/* Staff Table */}
        <Card className="p-0 overflow-hidden bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f4f7fc] dark:bg-[#0e1726] border-b border-[#e1e8f3] dark:border-[#24324d] text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd]">
                  <th className="py-3.5 px-4">F.I.SH</th>
                  <th className="py-3.5 px-4">Lavozimi / Roli</th>
                  <th className="py-3.5 px-4">Biriktirilgan fan / Sinf</th>
                  <th className="py-3.5 px-4">Telefon</th>
                  <th className="py-3.5 px-4">Maqomi</th>
                  <th className="py-3.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e8f3] dark:divide-[#24324d]">
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#0b2a5b] dark:text-white">
                      {member.fullName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          member.roleType === 'DIRECTOR'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : member.roleType === 'ZAVUCH'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#4a5f82] dark:text-[#d5e3ff]">
                      {member.subjectOrClass}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[#4a5f82] dark:text-[#9db4dd]">
                      {member.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${
                          member.isActive
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        {member.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleStaffStatus(member.id)}
                        className="text-xs text-[#0c3b7c] dark:text-[#5a95e5] hover:underline font-semibold"
                      >
                        {member.isActive ? 'Nofaol qilish' : 'Faollashtirish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-[#141d2e] rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e1e8f3] dark:border-[#24324d] flex flex-col gap-4">
              <h2 className="text-xl font-bold text-[#0b2a5b] dark:text-white">
                Yangi xodim qo‘shish
              </h2>
              <form onSubmit={handleAddStaff} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#0b2a5b] dark:text-[#d5e3ff]">
                    To‘liq ism (F.I.SH) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Karimova Dilnoza"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e1e8f3] dark:border-[#24324d] bg-[#f8fafc] dark:bg-[#0e1726] text-sm text-[#0b2a5b] dark:text-white outline-none focus:border-[#0c3b7c]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0b2a5b] dark:text-[#d5e3ff]">
                    Lavozimi / Roli
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e1e8f3] dark:border-[#24324d] bg-[#f8fafc] dark:bg-[#0e1726] text-sm text-[#0b2a5b] dark:text-white outline-none focus:border-[#0c3b7c]"
                  >
                    <option value="TEACHER">O‘qituvchi / Sinf rahbari</option>
                    <option value="ZAVUCH">O‘quv ishlari bo‘yicha o‘rinbosar (Zavuch)</option>
                    <option value="DIRECTOR">Direktorat xodimi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0b2a5b] dark:text-[#d5e3ff]">
                    Fan yoki Biriktirilgan sinf *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: 3-B sinf rahbari · Tarix"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e1e8f3] dark:border-[#24324d] bg-[#f8fafc] dark:bg-[#0e1726] text-sm text-[#0b2a5b] dark:text-white outline-none focus:border-[#0c3b7c]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0b2a5b] dark:text-[#d5e3ff]">
                    Telefon raqami
                  </label>
                  <input
                    type="text"
                    placeholder="+998 90 123 45 67"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e1e8f3] dark:border-[#24324d] bg-[#f8fafc] dark:bg-[#0e1726] text-sm text-[#0b2a5b] dark:text-white outline-none focus:border-[#0c3b7c]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[#e1e8f3] dark:border-[#24324d]">
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-[#4a5f82] px-4 py-2 rounded-xl text-sm"
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#0c3b7c] hover:bg-[#092c5d] text-white px-5 py-2 rounded-xl text-sm font-semibold"
                  >
                    Saqlash
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
