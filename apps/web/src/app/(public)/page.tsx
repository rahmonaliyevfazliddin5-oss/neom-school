import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Award,
  Trophy,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { StatsCard } from '@/components/public/StatsCard';
import { NewsSection } from '@/components/public/NewsSection';
import { fetchPublicSettings, fetchPublicPosts } from '@/lib/api/public';
import guestMessages from '../../../messages/guest.json';

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Neom School — Kelajak maktabi',
  description:
    'Neom School — o‘quvchilarga ilm, tarbiya hamda muvaffaqiyat ulashishni maqsad qilgan zamonaviy kelajak maktabi. 1-11 sinflar, repetitorlik kurslari, IELTS, CEFR, TOPIK, SAT tayyorlov kurslari.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Neom School — Kelajak maktabi',
    description:
      'Bugun bilim, ertaga yetakchilik. Ilm • Tarbiya • Muvaffaqiyat.',
    url: 'https://neom.school.uz',
    siteName: 'Neom School',
    locale: 'uz_UZ',
    type: 'website',
  },
};

export default async function GuestHomePage() {
  const [settings, postsResult] = await Promise.all([
    fetchPublicSettings(),
    fetchPublicPosts('ALL', 1, 6),
  ]);

  const advantageIcons = [
    GraduationCap, // Xususiy maktab 1-11
    BookOpen,      // Repetitorlik
    Award,         // IELTS, CEFR, TOPIK, SAT
    Trophy,        // @Neomnatija
    Users,         // Kichik sinflar
    ShieldCheck,   // Xavfsiz muhit
  ];

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Neom School',
    description:
      'Zamonaviy xususiy maktab, repetitorlik kurslari va xalqaro sertifikatlar (IELTS, CEFR, TOPIK, SAT) markazi.',
    url: 'https://neom.school.uz',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toshkent',
      addressCountry: 'UZ',
    },
    telephone: '+998500067969',
  };

  return (
    <PublicLayout settings={settings}>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero Section with Large Matching Logo */}
      <section
        id="hero"
        aria-label="Kirish va taklif"
        className="bg-gradient-to-b from-[#0c3b7c] via-[#0b336b] to-[#082652] dark:from-[#0a1e3d] dark:via-[#08172e] dark:to-[#061224] text-white pt-14 md:pt-20 pb-28 md:pb-36 px-6 md:px-14 relative overflow-hidden"
      >
        {/* Ambient background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#f78b2d]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#5a95e5]/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <span className="inline-flex items-center gap-2 bg-[#2c5594]/80 dark:bg-[#1a386b]/80 border border-[#406eb3] dark:border-[#2e599e] rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold tracking-wide text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#f78b2d] animate-pulse" />
              {guestMessages.hero.badge}
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12] text-white drop-shadow-sm">
              {guestMessages.hero.title}
            </h1>

            {/* Shiorlar / Taglines */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 my-1">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-[#f78b2d] font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-xs">
                ✨ {guestMessages.hero.tagline1}
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-xs">
                🌟 {guestMessages.hero.tagline2}
              </span>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-[#d5e3ff] max-w-xl font-normal leading-relaxed">
              {guestMessages.hero.description}
            </p>

            <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start mt-2">
              <a
                href="#qabul"
                className="bg-[#f78b2d] hover:bg-[#e0771c] text-[#1a1204] font-bold px-7 py-3 rounded-xl text-sm sm:text-base transition-all shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f78b2d]"
              >
                {guestMessages.hero.visitBtn}
              </a>
              <a
                href="#haqida"
                className="border border-[#9db4dd]/70 hover:bg-white/10 text-white font-medium px-7 py-3 rounded-xl text-sm sm:text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {guestMessages.hero.aboutBtn}
              </a>
            </div>
          </div>

          {/* Right Column: Grand Big Logo Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] aspect-[4/5] flex items-center justify-center">
              {/* Backlight / Ambient ring */}
              <div className="absolute inset-4 bg-gradient-to-tr from-[#f78b2d]/25 via-white/15 to-[#5a95e5]/20 rounded-[36px] blur-2xl pointer-events-none" />

              {/* Glass container */}
              <div className="relative z-10 w-full h-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:scale-[1.02] transition-all duration-300 group">
                <img
                  src="/logo-shield.png"
                  alt="Neom School Katta Logosi"
                  className="w-auto h-full max-h-[280px] sm:max-h-[340px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_20px_40px_rgba(247,139,45,0.45)] transition-all duration-300"
                />
                <div className="mt-4 px-5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white font-extrabold text-sm tracking-wider uppercase shadow-xs">
                  NEOM SCHOOL
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Overlapping Statistics Card */}
      <div className="max-w-7xl mx-auto">
        <StatsCard stats={settings?.stats} />
      </div>

      {/* 3. Biz haqimizda Section */}
      <section
        id="haqida"
        aria-label="Maktab haqida maʼlumot"
        className="py-20 md:py-28 px-6 md:px-14 max-w-7xl mx-auto flex flex-col items-center text-center gap-6"
      >
        <span className="inline-block bg-[#fdebd9] text-[#8a3d00] dark:bg-[#3d220a] dark:text-[#ff9c4b] rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
          {guestMessages.about.badge}
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0b2a5b] dark:text-white tracking-tight">
          {guestMessages.about.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center text-left w-full mt-4">
          {/* School Logo Showcase with crisp shield */}
          <div className="min-h-[340px] md:min-h-[420px] bg-gradient-to-br from-[#f8faff] to-[#edf3fc] dark:from-[#111928] dark:to-[#162238] border border-[#e1e8f3] dark:border-[#22324e] rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#f78b2d]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#0c3b7c]/15 dark:bg-[#5a95e5]/10 rounded-full blur-3xl pointer-events-none" />
            <img
              src="/logo-shield.png"
              alt="NEOM SCHOOL Rasmiy Logosi"
              className="max-h-[260px] md:max-h-[300px] w-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
            />
            <div className="mt-5 flex flex-col items-center gap-1">
              <span className="font-extrabold text-lg tracking-tight text-[#0c3b7c] dark:text-white">
                NEOM SCHOOL
              </span>
              <span className="text-xs font-semibold text-[#f78b2d] tracking-wider uppercase">
                Ilm • Tarbiya • Muvaffaqiyat
              </span>
            </div>
          </div>

          {/* School Story, Mission, Values */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#f78b2d] font-bold text-xl md:text-2xl tracking-tight">
              {guestMessages.about.schoolName}
            </h3>
            <p className="text-sm md:text-base text-[#4a5f82] dark:text-[#a0b3d6] leading-relaxed">
              {guestMessages.about.intro}
            </p>

            {/* Mission card */}
            <div className="p-4 rounded-xl bg-[#f4f7fc] dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] flex flex-col gap-1">
              <span className="font-bold text-sm text-[#0c3b7c] dark:text-[#5a95e5] flex items-center gap-1.5">
                🎯 {guestMessages.about.missionTitle}:
              </span>
              <p className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] leading-relaxed">
                {guestMessages.about.mission}
              </p>
            </div>

            {/* Values card */}
            <div className="p-4 rounded-xl bg-[#f4f7fc] dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] flex flex-col gap-1">
              <span className="font-bold text-sm text-[#f78b2d] dark:text-[#ff9c4b] flex items-center gap-1.5">
                💎 {guestMessages.about.valuesTitle}:
              </span>
              <p className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] leading-relaxed">
                {guestMessages.about.values}
              </p>
            </div>

            {/* History card */}
            <div className="pt-2 text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] leading-relaxed border-t border-[#e1e8f3] dark:border-[#24324d]">
              <span className="font-semibold text-[#0b2a5b] dark:text-white">🏛 {guestMessages.about.historyTitle}: </span>
              {guestMessages.about.history}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Afzalliklar / Ta'lim Yo'nalishlari Section */}
      <section
        id="afzalliklar"
        aria-label="Maktabning asosiy afzalliklari va ta'lim yo'nalishlari"
        className="py-20 md:py-28 px-6 md:px-14 bg-[#f8faff] dark:bg-[#0d1526] text-center border-y border-[#e1e8f3] dark:border-[#1e2a3f]"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <span className="inline-block bg-[#fdebd9] text-[#8a3d00] dark:bg-[#3d220a] dark:text-[#ff9c4b] rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
            {guestMessages.advantages.badge}
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0b2a5b] dark:text-white tracking-tight">
            {guestMessages.advantages.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left mt-6">
            {guestMessages.advantages.items.map((item, idx) => {
              const IconComp = advantageIcons[idx] || Sparkles;
              const isResultsItem = item.title.includes('@Neomnatija');
              return (
                <div
                  key={idx}
                  className="bg-[#f4f7fc] dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#1b273d] border border-[#e1e8f3] dark:border-[#24324d] flex items-center justify-center text-[#0c3b7c] dark:text-[#5a95e5] shadow-xs group-hover:scale-110 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-[#0b2a5b] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] leading-relaxed">
                    {item.desc}
                  </p>
                  {isResultsItem && (
                    <a
                      href="https://t.me/Neomnatija"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#0c3b7c] dark:text-[#5a95e5] hover:underline inline-flex items-center gap-1 mt-auto pt-2"
                    >
                      Kanalga o‘tish &rarr;
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Yangiliklar, Tadbirlar va Rejalar */}
      <NewsSection
        initialPosts={postsResult.data}
        totalPosts={postsResult.meta.total}
      />

      {/* 6. Qabul jarayoni Section */}
      <section
        id="qabul"
        aria-label="O‘quvchilarni qabul qilish bosqichlari"
        className="py-20 md:py-28 px-6 md:px-14 bg-[#f8faff] dark:bg-[#0d1526] text-center border-t border-[#e1e8f3] dark:border-[#1e2a3f]"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <span className="inline-block bg-[#fdebd9] text-[#8a3d00] dark:bg-[#3d220a] dark:text-[#ff9c4b] rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
            {guestMessages.admission.badge}
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0b2a5b] dark:text-white tracking-tight">
            {guestMessages.admission.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-center mt-6">
            {guestMessages.admission.steps.map((step) => (
              <div
                key={step.num}
                className="bg-[#f4f7fc] dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-full bg-[#0c3b7c] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {step.num}
                </div>
                <h3 className="font-bold text-base text-[#0b2a5b] dark:text-white mt-1">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
