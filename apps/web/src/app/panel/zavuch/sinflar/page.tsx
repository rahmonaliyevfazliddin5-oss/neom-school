'use client';

import React, { useState } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@neom/shared';
import {
  Layers,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  DoorOpen,
  GraduationCap,
  X,
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  grade: number;
  letter: string;
  teacher: string;
  studentsCount: number;
  room: string;
  attendanceRate: number;
  isSubmitted: boolean;
  students?: string[];
}

const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'c-1',
    name: '1-A',
    grade: 1,
    letter: 'A',
    teacher: 'Qodirov Jamshid Baxromovich',
    studentsCount: 26,
    room: '101-xona',
    attendanceRate: 98,
    isSubmitted: true,
    students: ['Aliyev Anvar', 'Karimova Malika', 'Hasanov Ali', 'Saidova Madina', 'Toshmatov Jasur'],
  },
  {
    id: 'c-2',
    name: '1-D',
    grade: 1,
    letter: 'D',
    teacher: 'Ahmedova Nilufar Shuxratovna',
    studentsCount: 24,
    room: '102-xona',
    attendanceRate: 96,
    isSubmitted: true,
    students: ['Ergashev Bobur', 'Xoliqova Ziyoda', 'Nazarov Diyor', 'Ismoilova Sevara'],
  },
  {
    id: 'c-3',
    name: '2-A',
    grade: 2,
    letter: 'A',
    teacher: 'Usmonov Otabek Mirzohidovich',
    studentsCount: 25,
    room: '103-xona',
    attendanceRate: 100,
    isSubmitted: true,
    students: ['Rahimov Dilshod', 'Sobirova Kamola', 'Vohidov Sardor', 'Mirzayeva Lola'],
  },
  {
    id: 'c-4',
    name: '2-B',
    grade: 2,
    letter: 'B',
    teacher: 'Nodirova Dilnoza Alisherovna',
    studentsCount: 23,
    room: '104-xona',
    attendanceRate: 95,
    isSubmitted: true,
    students: ['Zokirov Temur', 'Qosimova Shahlo', 'Boboyev Farhod'],
  },
  {
    id: 'c-5',
    name: '3-A',
    grade: 3,
    letter: 'A',
    teacher: 'Sultonov Bekzod Xurramovich',
    studentsCount: 27,
    room: '201-xona',
    attendanceRate: 97,
    isSubmitted: true,
    students: ['Abdullayev Javohir', 'Yusupova Rayhona', 'Normatov Rustam'],
  },
  {
    id: 'c-6',
    name: '5-B',
    grade: 5,
    letter: 'B',
    teacher: 'G‘aniyeva Feruza Akbarovna',
    studentsCount: 28,
    room: '205-xona',
    attendanceRate: 96,
    isSubmitted: true,
    students: ['Karimov Ulug‘bek', 'Azizova Shaxzoda', 'Toirov Samandar'],
  },
  {
    id: 'c-7',
    name: '9-A',
    grade: 9,
    letter: 'A',
    teacher: 'Qodirov Jamshid Baxromovich',
    studentsCount: 26,
    room: '302-xona',
    attendanceRate: 94,
    isSubmitted: true,
    students: ['Aliyev Anvar', 'Karimova Malika', 'Hasanov Ali', 'Saidova Madina'],
  },
  {
    id: 'c-8',
    name: '11-A',
    grade: 11,
    letter: 'A',
    teacher: 'Usmonov Otabek Mirzohidovich',
    studentsCount: 22,
    room: '308-xona',
    attendanceRate: 98,
    isSubmitted: true,
    students: ['Ergashev Bobur', 'Mamatov Doniyor', 'Mirzayeva Lola'],
  },
  {
    id: 'c-9',
    name: '11-B',
    grade: 11,
    letter: 'B',
    teacher: 'Ahmedova Nilufar Shuxratovna',
    studentsCount: 24,
    room: '309-xona',
    attendanceRate: 92,
    isSubmitted: false,
    students: ['Nazarov Diyor', 'Xoliqova Ziyoda', 'Ismoilova Sevara'],
  },
];

export default function ZavuchClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'PRIMARY' | 'MIDDLE' | 'HIGH'>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewStudentsClass, setViewStudentsClass] = useState<ClassItem | null>(null);
  const [newStudentName, setNewStudentName] = useState('');

  // Add Class Form State
  const [newGrade, setNewGrade] = useState('1');
  const [newLetter, setNewLetter] = useState('A');
  const [newTeacher, setNewTeacher] = useState('Qodirov Jamshid Baxromovich');
  const [newRoom, setNewRoom] = useState('105-xona');
  const [newCount, setNewCount] = useState('25');

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher.toLowerCase().includes(search.toLowerCase()) ||
      c.room.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (gradeFilter === 'PRIMARY') return c.grade >= 1 && c.grade <= 4;
    if (gradeFilter === 'MIDDLE') return c.grade >= 5 && c.grade <= 9;
    if (gradeFilter === 'HIGH') return c.grade >= 10 && c.grade <= 11;
    return true;
  });

  const totalStudents = classes.reduce((acc, c) => acc + c.studentsCount, 0);
  const primaryCount = classes.filter((c) => c.grade >= 1 && c.grade <= 4).length;
  const middleCount = classes.filter((c) => c.grade >= 5 && c.grade <= 9).length;
  const highCount = classes.filter((c) => c.grade >= 10 && c.grade <= 11).length;

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const className = `${newGrade}-${newLetter.toUpperCase()}`;

    // Check duplicate
    if (classes.some((c) => c.name.toLowerCase() === className.toLowerCase())) {
      toast(`${className} sinfi allaqachon mavjud!`, 'error');
      return;
    }

    const created: ClassItem = {
      id: `c-${Date.now()}`,
      name: className,
      grade: parseInt(newGrade, 10),
      letter: newLetter.toUpperCase(),
      teacher: newTeacher,
      studentsCount: parseInt(newCount, 10) || 25,
      room: newRoom,
      attendanceRate: 100,
      isSubmitted: false,
      students: ['1-o‘quvchi', '2-o‘quvchi', '3-o‘quvchi'],
    };

    setClasses([created, ...classes]);
    setIsAddModalOpen(false);
    toast(`${className} sinfi muvaffaqiyatli qo‘shildi!`, 'success');
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`${name} sinfini o‘chirmoqchimisiz?`)) {
      setClasses(classes.filter((c) => c.id !== id));
      toast(`${name} sinfi o‘chirildi`, 'success');
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !viewStudentsClass) return;

    const updated = classes.map((c) => {
      if (c.id === viewStudentsClass.id) {
        const studentList = c.students || [];
        return {
          ...c,
          studentsCount: c.studentsCount + 1,
          students: [...studentList, newStudentName.trim()],
        };
      }
      return c;
    });

    setClasses(updated);
    setViewStudentsClass((prev) =>
      prev
        ? {
            ...prev,
            studentsCount: prev.studentsCount + 1,
            students: [...(prev.students || []), newStudentName.trim()],
          }
        : null
    );
    setNewStudentName('');
    toast('Yangi o‘quvchi sinfga qo‘shildi!', 'success');
  };

  return (
    <PanelShell
      role={Role.ZAVUCH}
      roleLabel="Zavuch · o'quv ishlari"
      userName="Nodirova Dilnoza"
    >
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#0b2a5b] dark:text-white flex items-center gap-3">
              <Layers className="w-7 h-7 text-[#0066cc] dark:text-[#4d9fff]" />
              Maktab sinflari
            </h1>
            <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd] mt-1">
              1-sinfdan 11-sinfgacha bo‘lgan barcha sinflar, o‘quvchilar va sinf rahbarlari boshqaruvi
            </p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi sinf ochish
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6f0ff] dark:bg-[#1c2c47] flex items-center justify-center text-[#0066cc] dark:text-[#4d9fff] shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{classes.length} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Jami sinflar</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6fff0] dark:bg-[#163824] flex items-center justify-center text-[#009944] dark:text-[#33cc77] shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{totalStudents} nafar</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Jami o‘quvchilar</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fff8e6] dark:bg-[#382d16] flex items-center justify-center text-[#d97706] dark:text-[#fbbf24] shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{primaryCount} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Boshlang‘ich (1–4)</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f5e6ff] dark:bg-[#2c1a3e] flex items-center justify-center text-[#7c3aed] dark:text-[#a78bfa] shrink-0">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{middleCount + highCount} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Yuqori (5–11)</div>
            </div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setGradeFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                gradeFilter === 'ALL'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
              }`}
            >
              Barcha sinflar ({classes.length})
            </button>
            <button
              onClick={() => setGradeFilter('PRIMARY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                gradeFilter === 'PRIMARY'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
              }`}
            >
              Boshlang‘ich (1–4)
            </button>
            <button
              onClick={() => setGradeFilter('MIDDLE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                gradeFilter === 'MIDDLE'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
              }`}
            >
              O‘rta (5–9)
            </button>
            <button
              onClick={() => setGradeFilter('HIGH')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                gradeFilter === 'HIGH'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
              }`}
            >
              Yuqori (10–11)
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7e95b8]" />
            <input
              type="text"
              placeholder="Sinf, ustoz yoki xonani qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-[#f8fafc] dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white placeholder-[#7e95b8] focus:outline-hidden focus:border-[#0066cc]"
            />
          </div>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((item) => (
            <Card
              key={item.id}
              className="p-5 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xl font-extrabold text-[#0066cc] dark:text-[#4d9fff] bg-[#e6f0ff] dark:bg-[#1c2c47] px-3 py-1 rounded-lg">
                    {item.name} sinf
                  </span>

                  {item.isSubmitted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#e6fff0] dark:bg-[#163824] text-[#00873a] dark:text-[#33cc77]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Topshirdi ({item.attendanceRate}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#fff8e6] dark:bg-[#382d16] text-[#b45309] dark:text-[#fbbf24]">
                      <Clock className="w-3.5 h-3.5" />
                      Kutilmoqda
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-[#0b2a5b] dark:text-white mt-3 truncate">
                  {item.teacher}
                </div>
                <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Sinf rahbari</div>

                <div className="mt-4 pt-3 border-t border-[#edf2f7] dark:border-[#1e2c45] grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#4a5f82] dark:text-[#9db4dd]">
                    <Users className="w-3.5 h-3.5 text-[#0066cc]" />
                    <span>{item.studentsCount} nafar o‘quvchi</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#4a5f82] dark:text-[#9db4dd]">
                    <DoorOpen className="w-3.5 h-3.5 text-[#0066cc]" />
                    <span>{item.room}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-[#edf2f7] dark:border-[#1e2c45]">
                <button
                  onClick={() => setViewStudentsClass(item)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#0066cc] dark:text-[#4d9fff] hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  O‘quvchilar ro‘yxati ({item.studentsCount})
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteClass(item.id, item.name)}
                    className="p-1.5 text-[#e53e3e] hover:bg-[#ffebeb] dark:hover:bg-[#3b1c1c] rounded-md transition-colors"
                    title="Sinfni o‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-[#141d2e] rounded-xl border border-[#e1e8f3] dark:border-[#24324d] text-[#5f7599] dark:text-[#8ea8d6]">
            Qidiruv bo‘yicha hech qanday sinf topilmadi.
          </div>
        )}

        {/* Modal: Yangi sinf qo'shish */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-[#141d2e] border-[#ccd8e8] dark:border-[#24324d] shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#edf2f7] dark:border-[#24324d]">
                <h3 className="text-lg font-bold text-[#0b2a5b] dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#0066cc]" />
                  Yangi sinf ochish
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-[#7e95b8] hover:text-[#0b2a5b] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="mt-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                      Sinf bosqichi (1-11)
                    </label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                    >
                      {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                        <option key={g} value={g}>
                          {g}-sinf
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                      Harfi (A, B, D, E)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={newLetter}
                      onChange={(e) => setNewLetter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white font-bold uppercase"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                    Sinf rahbari (Ustoz)
                  </label>
                  <input
                    type="text"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    placeholder="Masalan: Ahmedova Nilufar"
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                      Xona raqami
                    </label>
                    <input
                      type="text"
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                      placeholder="104-xona"
                      className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                      O‘quvchilar soni
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={45}
                      value={newCount}
                      onChange={(e) => setNewCount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                      required
                    />
                  </div>
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
                    Sinfni yaratish
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: O'quvchilar ro'yxati */}
        {viewStudentsClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg p-6 bg-white dark:bg-[#141d2e] border-[#ccd8e8] dark:border-[#24324d] shadow-xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-[#edf2f7] dark:border-[#24324d] shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-[#0b2a5b] dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#0066cc]" />
                    {viewStudentsClass.name} sinfi o‘quvchilari
                  </h3>
                  <p className="text-xs text-[#5f7599] dark:text-[#8ea8d6] mt-0.5">
                    Rahbar: {viewStudentsClass.teacher} · {viewStudentsClass.room}
                  </p>
                </div>
                <button
                  onClick={() => setViewStudentsClass(null)}
                  className="text-[#7e95b8] hover:text-[#0b2a5b] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add student inline form */}
              <form onSubmit={handleAddStudent} className="pt-3 flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Yangi o‘quvchi ismi familiyasi..."
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-[#0b2a5b] dark:text-white"
                />
                <Button type="submit" className="bg-[#0066cc] text-white shrink-0 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Qo‘shish
                </Button>
              </form>

              {/* Student list */}
              <div className="mt-4 overflow-y-auto flex-1 divide-y divide-[#edf2f7] dark:divide-[#1e2c45]">
                {(viewStudentsClass.students && viewStudentsClass.students.length > 0
                  ? viewStudentsClass.students
                  : ['Aliyev Anvar', 'Karimova Malika', 'Hasanov Ali', 'Saidova Madina', 'Toshmatov Jasur']
                ).map((student, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#0b2a5b] dark:text-white font-medium">
                      <span className="w-6 text-center text-xs text-[#7e95b8] font-bold">
                        {idx + 1}.
                      </span>
                      {student}
                    </span>
                    <span className="text-xs text-[#009944] bg-[#e6fff0] dark:bg-[#163824] px-2 py-0.5 rounded-full font-medium">
                      Faol
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#edf2f7] dark:border-[#24324d] flex justify-end shrink-0">
                <Button variant="outline" onClick={() => setViewStudentsClass(null)}>
                  Yopish
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
