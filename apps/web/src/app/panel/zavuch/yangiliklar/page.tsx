'use client';

import React, { useState, useEffect } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@neom/shared';
import {
  Newspaper,
  Calendar,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  X,
  Share2,
} from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  type: 'NEWS' | 'EVENT' | 'PLAN';
  excerpt: string;
  content?: string;
  eventDate?: string;
  publishedAt: string;
  isPublished: boolean;
  viewsCount?: number;
}

const INITIAL_POSTS: PostItem[] = [
  {
    id: 'post-1',
    title: 'Neom School 2026-2027 o‘quv yili uchun qabul jarayoni boshlandi',
    type: 'NEWS',
    excerpt: '1-sinfdan 11-sinfgacha bo‘lgan o‘quvchilar uchun saralash imtihonlari va qabul ochiq deb e’lon qilindi.',
    content: 'Neom School — zamonaviy ta’lim standartlari asosida o‘quvchilarga ilm va tarbiya beruvchi maskan. Qabul shartlari va test sinovlari haqida to‘liq ma’lumot olish uchun administrator bilan bog‘laning.',
    publishedAt: '2026-10-18',
    isPublished: true,
    viewsCount: 420,
  },
  {
    id: 'post-2',
    title: 'IELTS va SAT xalqaro sertifikatlariga tayyorlov master-klassi',
    type: 'EVENT',
    eventDate: '2026-10-25',
    excerpt: 'Xalqaro imtihonlarda yuqori ball (IELTS 8.0+, SAT 1450+) to‘plagan ustozlarimizdan maxsus master-klass.',
    content: 'O‘quvchilarimiz va repetitorlik kurslari tinglovchilari uchun mo‘ljallangan ochiq dars maktabning asosiy faollar zalida bo‘lib o‘tadi.',
    publishedAt: '2026-10-15',
    isPublished: true,
    viewsCount: 310,
  },
  {
    id: 'post-3',
    title: 'Kuzgi ta’til davrida o‘quvchilar o‘rtasida Shaxmat va Zakovat turniri',
    type: 'EVENT',
    eventDate: '2026-11-04',
    excerpt: 'Barcha sinflar o‘rtasida an’anaviy aqliy bellashuv va qimmatbaho sovg‘alar sovrini.',
    content: 'Turnirda 1-11 sinf o‘quvchilari qatnashishi mumkin. G‘oliblarga maxsus diplom va esdalik sovg‘alari topshiriladi.',
    publishedAt: '2026-10-12',
    isPublished: true,
    viewsCount: 285,
  },
  {
    id: 'post-4',
    title: '2026-2027 o‘quv yili 2-chorak ta’lim rejasi va fan olimpiadalari',
    type: 'PLAN',
    excerpt: 'Matematika, fizika va ingliz tili fanlari bo‘yicha maktab bosqichi olimpiadasi rejalari tasdiqlandi.',
    content: 'Iqtidorli o‘quvchilarni aniqlash va xalqaro olimpiadalarga yo‘naltirish bo‘yicha maxsus guruhlar tashkil etilmoqda.',
    publishedAt: '2026-10-10',
    isPublished: true,
    viewsCount: 195,
  },
  {
    id: 'post-5',
    title: 'Ota-onalar bilan umumiy yig‘ilish va chorak monitoringi muhokamasi',
    type: 'EVENT',
    eventDate: '2026-10-28',
    excerpt: 'O‘quvchilarning 1-chorak davomati va o‘zlashtirish ko‘rsatkichlari bo‘yicha ochiq hisobot yig‘ilishi.',
    content: 'Barcha sinf rahbarlari va fan o‘qituvchilari ishtirokida ota-onalar bilan yuzma-yuz suhbatlar rejalashtirilgan.',
    publishedAt: '2026-10-08',
    isPublished: false,
    viewsCount: 0,
  },
];

export default function ZavuchPostsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'NEWS' | 'EVENT' | 'PLAN'>('ALL');

  // Load live posts from API
  useEffect(() => {
    fetch('/api/posts')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setPosts(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'NEWS' | 'EVENT' | 'PLAN'>('NEWS');
  const [formEventDate, setFormEventDate] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPublished, setFormPublished] = useState(true);

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (typeFilter !== 'ALL' && p.type !== typeFilter) return false;
    return true;
  });

  const newsCount = posts.filter((p) => p.type === 'NEWS').length;
  const eventCount = posts.filter((p) => p.type === 'EVENT').length;
  const planCount = posts.filter((p) => p.type === 'PLAN').length;
  const publishedCount = posts.filter((p) => p.isPublished).length;

  const handleOpenAddModal = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormType('NEWS');
    setFormEventDate('');
    setFormExcerpt('');
    setFormContent('');
    setFormPublished(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: PostItem) => {
    setEditingPost(p);
    setFormTitle(p.title);
    setFormType(p.type);
    setFormEventDate(p.eventDate || '');
    setFormExcerpt(p.excerpt);
    setFormContent(p.content || '');
    setFormPublished(p.isPublished);
    setIsAddModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast('Sarlavhani kiriting', 'error');
      return;
    }

    if (editingPost) {
      // Update
      try {
        const res = await fetch('/api/posts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPost.id,
            title: formTitle.trim(),
            type: formType,
            eventDate: formType === 'EVENT' ? formEventDate : undefined,
            excerpt: formExcerpt.trim() || formTitle.trim(),
            content: formContent.trim(),
            isPublished: formPublished,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setPosts(posts.map((p) => (p.id === editingPost.id ? json.data : p)));
          toast('E’lon muvaffaqiyatli yangilandi!', 'success');
        }
      } catch {
        toast('Saqlashda xatolik yuz berdi', 'error');
      }
    } else {
      // Create new
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle.trim(),
            type: formType,
            eventDate: formType === 'EVENT' ? formEventDate : undefined,
            excerpt: formExcerpt.trim() || formTitle.trim(),
            content: formContent.trim(),
            isPublished: formPublished,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setPosts([json.data, ...posts]);
          toast('Yangi e’lon yaratildi va saqlandi!', 'success');
        }
      } catch {
        toast('Saqlashda xatolik yuz berdi', 'error');
      }
    }

    setIsAddModalOpen(false);
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (confirm(`"${title}" e’lonini o‘chirmoqchimisiz?`)) {
      try {
        const res = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setPosts(posts.filter((p) => p.id !== id));
          toast('E’lon o‘chirildi', 'success');
        }
      } catch {
        toast('O‘chirishda xatolik yuz berdi', 'error');
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const nextState = !post.isPublished;

    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isPublished: nextState,
        }),
      });

      if (res.ok) {
        setPosts(
          posts.map((p) => (p.id === id ? { ...p, isPublished: nextState } : p))
        );
        toast(
          nextState ? 'E’lon saytda chop etildi!' : 'E’lon qoralamaga olindi',
          'success'
        );
      }
    } catch {
      toast('Holatni o‘zgartirishda xatolik', 'error');
    }
  };

  const getTypeBadge = (type: 'NEWS' | 'EVENT' | 'PLAN') => {
    switch (type) {
      case 'NEWS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6f0ff] dark:bg-[#1c2c47] text-[#0066cc] dark:text-[#4d9fff]">
            <Newspaper className="w-3 h-3" />
            Yangilik
          </span>
        );
      case 'EVENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5e6ff] dark:bg-[#2c1a3e] text-[#7c3aed] dark:text-[#a78bfa]">
            <Calendar className="w-3 h-3" />
            Tadbir
          </span>
        );
      case 'PLAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6fff0] dark:bg-[#163824] text-[#009944] dark:text-[#33cc77]">
            <Sparkles className="w-3 h-3" />
            Reja
          </span>
        );
    }
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
              <Newspaper className="w-7 h-7 text-[#0066cc] dark:text-[#4d9fff]" />
              Yangilik va tadbirlar
            </h1>
            <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd] mt-1">
              Maktab e’lonlari, xalqaro tadbirlar, darsdan tashqari faoliyat va rejalar boshqaruvi
            </p>
          </div>

          <Button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi e’lon qo‘shish
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6f0ff] dark:bg-[#1c2c47] flex items-center justify-center text-[#0066cc] dark:text-[#4d9fff] shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{posts.length} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Jami e’lonlar</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e6fff0] dark:bg-[#163824] flex items-center justify-center text-[#009944] dark:text-[#33cc77] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{publishedCount} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Chop etilgan</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f5e6ff] dark:bg-[#2c1a3e] flex items-center justify-center text-[#7c3aed] dark:text-[#a78bfa] shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{eventCount} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Tadbirlar</div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fff8e6] dark:bg-[#382d16] flex items-center justify-center text-[#d97706] dark:text-[#fbbf24] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b2a5b] dark:text-white">{posts.length - publishedCount} ta</div>
              <div className="text-xs text-[#5f7599] dark:text-[#8ea8d6]">Qoralama (Draft)</div>
            </div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-4 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
              }`}
            >
              Barchasi ({posts.length})
            </button>
            <button
              onClick={() => setTypeFilter('NEWS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === 'NEWS'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
              }`}
            >
              Yangiliklar ({newsCount})
            </button>
            <button
              onClick={() => setTypeFilter('EVENT')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === 'EVENT'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
              }`}
            >
              Tadbirlar ({eventCount})
            </button>
            <button
              onClick={() => setTypeFilter('PLAN')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === 'PLAN'
                  ? 'bg-[#0066cc] text-white shadow-xs'
                  : 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
              }`}
            >
              Rejalar ({planCount})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7e95b8]" />
            <input
              type="text"
              placeholder="E’lonlarni qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-[#f8fafc] dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white placeholder-[#7e95b8] focus:outline-hidden focus:border-[#0066cc]"
            />
          </div>
        </Card>

        {/* Posts List */}
        <div className="flex flex-col gap-3">
          {filteredPosts.map((item) => (
            <Card
              key={item.id}
              className="p-5 bg-white dark:bg-[#141d2e] border-[#e1e8f3] dark:border-[#24324d] hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {getTypeBadge(item.type)}

                  {item.eventDate && (
                    <span className="text-xs font-medium text-[#7c3aed] dark:text-[#a78bfa] bg-[#f5e6ff] dark:bg-[#2c1a3e] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Tadbir: {item.eventDate}
                    </span>
                  )}

                  <span className="text-xs text-[#7e95b8]">
                    {item.publishedAt}
                  </span>

                  {item.isPublished ? (
                    <span className="text-xs font-medium text-[#00873a] bg-[#e6fff0] dark:bg-[#163824] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Chop etilgan
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#b45309] bg-[#fff8e6] dark:bg-[#382d16] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Qoralama
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd] mt-1 line-clamp-2">
                  {item.excerpt}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#edf2f7] dark:border-[#24324d]">
                <button
                  onClick={() => handleTogglePublish(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    item.isPublished
                      ? 'bg-[#f0f4fa] dark:bg-[#1c2c47] text-[#4a5f82] dark:text-[#9db4dd] hover:bg-[#e1e8f3]'
                      : 'bg-[#009944] text-white hover:bg-[#008038]'
                  }`}
                >
                  {item.isPublished ? 'Qoralamaga olish' : 'Chop etish'}
                </button>

                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-2 text-[#0066cc] dark:text-[#4d9fff] hover:bg-[#e6f0ff] dark:hover:bg-[#1c2c47] rounded-lg transition-colors"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeletePost(item.id, item.title)}
                  className="p-2 text-[#e53e3e] hover:bg-[#ffebeb] dark:hover:bg-[#3b1c1c] rounded-lg transition-colors"
                  title="O‘chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-[#141d2e] rounded-xl border border-[#e1e8f3] dark:border-[#24324d] text-[#5f7599] dark:text-[#8ea8d6]">
            Qidiruv bo‘yicha hech qanday e’lon topilmadi.
          </div>
        )}

        {/* Modal: Yangi / Tahrirlash */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg p-6 bg-white dark:bg-[#141d2e] border-[#ccd8e8] dark:border-[#24324d] shadow-xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-[#edf2f7] dark:border-[#24324d] shrink-0">
                <h3 className="text-lg font-bold text-[#0b2a5b] dark:text-white flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#0066cc]" />
                  {editingPost ? 'E’lonni tahrirlash' : 'Yangi e’lon qo‘shish'}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-[#7e95b8] hover:text-[#0b2a5b] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePost} className="mt-4 flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
                <div>
                  <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                    E’lon sarlavhasi
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Masalan: 1-chorak yakuniy imtihonlari jadvali..."
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                      Turi
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                    >
                      <option value="NEWS">Yangilik (NEWS)</option>
                      <option value="EVENT">Tadbir (EVENT)</option>
                      <option value="PLAN">Reja (PLAN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                      Tadbir sanasi (ixtiyoriy)
                    </label>
                    <input
                      type="date"
                      value={formEventDate}
                      onChange={(e) => setFormEventDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                    Qisqa tavsif (Excerpt)
                  </label>
                  <textarea
                    rows={2}
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="Mehmon sahifasida ko‘rinadigan qisqa 1-2 jumlalik annotatsiya..."
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a5f82] dark:text-[#9db4dd] mb-1 block">
                    To‘liq matn (Content)
                  </label>
                  <textarea
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="E’lonning to‘liq matni..."
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8e8] dark:border-[#2f4063] bg-white dark:bg-[#0f172a] text-sm text-[#0b2a5b] dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="publishCheck"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="w-4 h-4 text-[#0066cc] rounded border-[#ccd8e8] focus:ring-[#0066cc]"
                  />
                  <label htmlFor="publishCheck" className="text-xs font-semibold text-[#0b2a5b] dark:text-white cursor-pointer">
                    Darhol saytda chop etish (Published)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#edf2f7] dark:border-[#24324d] mt-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Bekor qilish
                  </Button>
                  <Button type="submit" className="bg-[#0066cc] text-white">
                    {editingPost ? 'Saqlash' : 'E’lonni joylashtirish'}
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
