'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicPostListItemDto, PostType } from '@neom/shared';
import guestMessages from '../../../messages/guest.json';

interface NewsSectionProps {
  initialPosts: PublicPostListItemDto[];
  totalPosts: number;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  initialPosts,
  totalPosts,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'NEWS' | 'EVENT' | 'PLAN'>('ALL');
  const [posts, setPosts] = useState<PublicPostListItemDto[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length < totalPosts);

  const filters = [
    { key: 'ALL' as const, label: guestMessages.news.filterAll },
    { key: 'NEWS' as const, label: guestMessages.news.filterNews },
    { key: 'EVENT' as const, label: guestMessages.news.filterEvent },
    { key: 'PLAN' as const, label: guestMessages.news.filterPlan },
  ];

  const handleFilterChange = async (newFilter: 'ALL' | 'NEWS' | 'EVENT' | 'PLAN') => {
    setActiveFilter(newFilter);
    setPage(1);
    setLoading(true);

    try {
      const query = new URLSearchParams();
      if (newFilter !== 'ALL') query.set('type', newFilter);
      query.set('page', '1');
      query.set('limit', '6');

      const res = await fetch(`/api/public/posts?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setPosts(json.data || []);
        setHasMore((json.data?.length || 0) < (json.meta?.total || 0));
      }
    } catch {
      // Keep existing posts on network error
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;

    try {
      const query = new URLSearchParams();
      if (activeFilter !== 'ALL') query.set('type', activeFilter);
      query.set('page', String(nextPage));
      query.set('limit', '6');

      const res = await fetch(`/api/public/posts?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const newItems: PublicPostListItemDto[] = json.data || [];
        setPosts((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(posts.length + newItems.length < (json.meta?.total || 0));
      }
    } catch {
      // Graceful error
    } finally {
      setLoading(false);
    }
  };

  const getBadgeText = (type: PostType | string) => {
    if (type === 'EVENT' || type === 'Tadbir') return guestMessages.news.filterEvent;
    if (type === 'PLAN' || type === 'Reja') return guestMessages.news.filterPlan;
    return guestMessages.news.filterNews;
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return '';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return String(date);
    }
  };

  // Real fallback cards when DB is empty
  const displayPosts = posts.length > 0 ? posts : [
    {
      id: 'event-robotics',
      type: 'EVENT' as any,
      title: 'Ilm-fan va robototexnika haftaligi',
      excerpt: 'Neom School o‘quvchilarining innovatsion ishlanmalari, texnologik va ilmiy loyihalari namoyishi bo‘lib o‘tadi. Barcha ota-onalar taklif etiladi.',
      eventDate: '2026-10-24T10:00:00.000Z',
      thumbUrl: null,
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'news-certificates',
      type: 'NEWS' as any,
      title: 'O‘quvchilarimiz xalqaro sertifikatlar va olimpiadalarda yuqori natijalarga erishmoqda',
      excerpt: 'IELTS 7.5+, CEFR B2/C1 va SAT bo‘yicha eng so‘nggi yutuqlar hamda o‘quvchilarimiz natijalari bilan @Neomnatija kanalimizda tanishing.',
      eventDate: null,
      thumbUrl: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'plan-new-courses',
      type: 'PLAN' as any,
      title: 'Yangi o‘quv choragi uchun til kurslari va to‘garaklar jadvali',
      excerpt: 'Noyabr oyidan boshlab ingliz, koreys tillari hamda matematika, fizika va robototexnika bo‘yicha yangi chuqurlashtirilgan guruhlar ochiladi.',
      eventDate: null,
      thumbUrl: null,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  return (
    <section
      id="yangiliklar"
      aria-label="Yangiliklar, tadbirlar va rejalar"
      className="py-16 md:py-24 px-6 md:px-14 bg-[#f4f7fc] dark:bg-[#0c1524] text-center"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
        {/* Badge tag */}
        <span className="inline-block bg-[#fdebd9] text-[#8a3d00] dark:bg-[#3d220a] dark:text-[#ff9c4b] rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
          {guestMessages.news.badge}
        </span>

        {/* Section title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0b2a5b] dark:text-white tracking-tight">
          {guestMessages.news.title}
        </h2>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 justify-center mt-2" role="tablist">
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleFilterChange(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0c3b7c] text-white shadow-sm'
                    : 'bg-white dark:bg-[#141d2e] text-[#4a5f82] dark:text-[#a0b3d6] hover:bg-gray-50 border border-[#e1e8f3] dark:border-[#24324d]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left mt-6">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={`/yangiliklar/${post.id}`}
              className="group bg-white dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#0c3b7c]"
            >
              {/* Card Image / Header */}
              <div className="h-44 bg-gradient-to-br from-[#0c3b7c] to-[#08234a] flex items-center justify-center relative overflow-hidden p-6 text-white border-b border-[#e1e8f3] dark:border-[#24324d]">
                {post.thumbUrl ? (
                  <Image
                    src={post.thumbUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-center z-10">
                    <img
                      src="/logo.png"
                      alt="NEOM SCHOOL"
                      className="w-12 h-12 object-contain bg-white rounded-xl p-1.5 shadow-sm group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-semibold text-[#f78b2d] tracking-wider uppercase">
                      NEOM SCHOOL · {getBadgeText(post.type)}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col gap-2.5 flex-1 justify-between">
                <div>
                  <span className="inline-block bg-[#fdebd9] text-[#8a3d00] dark:bg-[#3d220a] dark:text-[#ff9c4b] rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2">
                    {getBadgeText(post.type)}
                  </span>
                  <h3 className="font-bold text-base text-[#0b2a5b] dark:text-white line-clamp-2 group-hover:text-[#0c3b7c] dark:group-hover:text-[#5a95e5] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] mt-1.5 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e8eef7] dark:border-[#24324d] flex items-center justify-between text-xs text-[#4a5f82] dark:text-[#a0b3d6]">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="text-[#0c3b7c] dark:text-[#5a95e5] font-semibold group-hover:underline">
                    {guestMessages.news.readMore} &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-white dark:bg-[#141d2e] hover:bg-gray-50 border border-[#b9c8e2] dark:border-[#24324d] text-[#0c2f66] dark:text-[#d5e3ff] font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Yuklanmoqda...' : guestMessages.news.loadMore}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
