import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { fetchPublicPostById, fetchPublicSettings } from '@/lib/api/public';
import guestMessages from '../../../../../messages/guest.json';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPublicPostById(id);

  if (!post) {
    return {
      title: 'Eʼlon topilmadi — NEOM School',
    };
  }

  return {
    title: `${post.title} — NEOM School`,
    description: post.body.slice(0, 160),
    openGraph: {
      title: `${post.title} — NEOM School`,
      description: post.body.slice(0, 160),
      type: 'article',
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [post, settings] = await Promise.all([
    fetchPublicPostById(id),
    fetchPublicSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const getBadgeText = (type: string) => {
    if (type === 'EVENT') return guestMessages.news.filterEvent;
    if (type === 'PLAN') return guestMessages.news.filterPlan;
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

  return (
    <PublicLayout settings={settings}>
      <article className="py-12 md:py-20 px-6 md:px-14 max-w-4xl mx-auto flex flex-col gap-8">
        {/* Back Link */}
        <div>
          <Link
            href="/#yangiliklar"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c3b7c] dark:text-[#5a95e5] hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c3b7c] rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{guestMessages.news.backBtn}</span>
          </Link>
        </div>

        {/* Post Header */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-block bg-[#fdebd9] text-[#8a3d00] dark:bg-[#3d220a] dark:text-[#ff9c4b] rounded-full px-3 py-0.5 text-xs font-semibold">
              {getBadgeText(post.type)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#4a5f82] dark:text-[#a0b3d6]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0b2a5b] dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.eventDate && (
            <div className="p-3.5 rounded-xl bg-[#e8eef7] dark:bg-[#141d2e] border border-[#b9c8e2] dark:border-[#24324d] text-xs sm:text-sm text-[#0c3b7c] dark:text-[#5a95e5] font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {guestMessages.news.eventDate}: {formatDate(post.eventDate)}
              </span>
            </div>
          )}
        </header>

        {/* Post Image */}
        <div className="w-full h-64 sm:h-96 bg-[#e8eef7] dark:bg-[#141d2e] rounded-2xl overflow-hidden border border-[#e1e8f3] dark:border-[#24324d] relative flex items-center justify-center">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="text-[#4a5f82] dark:text-[#9db4dd] font-semibold text-base">
              {guestMessages.news.imagePlaceholder}
            </div>
          )}
        </div>

        {/* Post Full Body */}
        <section className="text-base sm:text-lg text-[#0b2a5b] dark:text-[#d5e3ff] leading-relaxed whitespace-pre-line font-normal">
          {post.body}
        </section>

        {/* Bottom Navigation */}
        <footer className="pt-8 border-t border-[#e1e8f3] dark:border-[#24324d] flex justify-between items-center">
          <Link
            href="/#yangiliklar"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c3b7c] dark:text-[#5a95e5] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{guestMessages.news.backBtn}</span>
          </Link>
        </footer>
      </article>
    </PublicLayout>
  );
}
