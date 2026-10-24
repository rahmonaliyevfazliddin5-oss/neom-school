'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SiteStatsDto } from '@neom/shared';
import guestMessages from '../../../messages/guest.json';

interface StatsCardProps {
  stats?: SiteStatsDto | null;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const safeStats = {
    teachers: stats?.teachers ?? 35,
    students: stats?.students ?? 450,
    classrooms: stats?.classrooms ?? 28,
    graduatesRate: stats?.graduatesRate ?? 98,
  };

  // Animated numbers state
  const [counts, setCounts] = useState({
    teachers: 0,
    students: 0,
    classrooms: 0,
    graduatesRate: 0,
  });

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      setCounts({
        teachers: safeStats.teachers,
        students: safeStats.students,
        classrooms: safeStats.classrooms,
        graduatesRate: safeStats.graduatesRate,
      });
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1200; // ms
          const startTimestamp = performance.now();

          const animate = (currentTimestamp: number) => {
            const elapsed = currentTimestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounts({
              teachers: Math.floor(safeStats.teachers * easeOut),
              students: Math.floor(safeStats.students * easeOut),
              classrooms: Math.floor(safeStats.classrooms * easeOut),
              graduatesRate: Math.floor(safeStats.graduatesRate * easeOut),
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts({
                teachers: safeStats.teachers,
                students: safeStats.students,
                classrooms: safeStats.classrooms,
                graduatesRate: safeStats.graduatesRate,
              });
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, safeStats.teachers, safeStats.students, safeStats.classrooms, safeStats.graduatesRate]);

  // Formatter: displays animated values with suffix
  const formatCount = (val: number, animatedVal: number, suffix = '+') => {
    return `${hasAnimated ? animatedVal : val}${suffix}`;
  };

  const formatPercent = (val: number, animatedVal: number) => {
    return `${hasAnimated ? animatedVal : val}%`;
  };

  return (
    <div
      ref={cardRef}
      className="relative z-10 -mt-16 mx-4 sm:mx-8 md:mx-14 bg-white dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] rounded-2xl shadow-[0_12px_32px_rgba(12,59,124,0.12)] p-6 md:p-8"
      aria-label="Maktab statistikasi"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {/* O'qituvchilar */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl sm:text-3xl font-bold text-[#0c3b7c] dark:text-[#5a95e5] tracking-tight">
            {formatCount(safeStats.teachers, counts.teachers, '+')}
          </div>
          <span className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] font-medium">
            {guestMessages.stats.teachers}
          </span>
        </div>

        {/* O'quvchilar */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl sm:text-3xl font-bold text-[#0c3b7c] dark:text-[#5a95e5] tracking-tight">
            {formatCount(safeStats.students, counts.students, '+')}
          </div>
          <span className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] font-medium">
            {guestMessages.stats.students}
          </span>
        </div>

        {/* Sinf xonalari */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl sm:text-3xl font-bold text-[#0c3b7c] dark:text-[#5a95e5] tracking-tight">
            {formatCount(safeStats.classrooms, counts.classrooms, '+')}
          </div>
          <span className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] font-medium">
            {guestMessages.stats.classrooms}
          </span>
        </div>

        {/* Bitiruvchilar natijasi */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl sm:text-3xl font-bold text-[#8a3d00] dark:text-[#f78b2d] tracking-tight">
            {formatPercent(safeStats.graduatesRate, counts.graduatesRate)}
          </div>
          <span className="text-xs sm:text-sm text-[#4a5f82] dark:text-[#a0b3d6] font-medium">
            {guestMessages.stats.graduatesRate}
          </span>
        </div>
      </div>
    </div>
  );
};
