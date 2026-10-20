'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Menu, X, Phone, Send, MapPin, Clock } from 'lucide-react';
import { SiteSettingsResponseDto } from '@neom/shared';
import guestMessages from '../../../messages/guest.json';

export interface PublicLayoutProps {
  children: React.ReactNode;
  settings?: SiteSettingsResponseDto | null;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  settings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check saved theme or system preference
    const saved = localStorage.getItem('neom_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('neom_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('neom_theme', 'light');
    }
  };

  const navLinks = [
    { label: guestMessages.nav.home, href: '#hero' },
    { label: guestMessages.nav.about, href: '#haqida' },
    { label: guestMessages.nav.advantages, href: '#afzalliklar' },
    { label: guestMessages.nav.news, href: '#yangiliklar' },
    { label: guestMessages.nav.admission, href: '#qabul' },
    { label: guestMessages.nav.contact, href: '#aloqa' },
  ];

  const address = settings?.address || guestMessages.cta.defaultAddress;
  const phone = settings?.phone || guestMessages.cta.defaultPhone;
  const workHours = settings?.workHours || guestMessages.cta.defaultWorkHours;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a101d] text-[#0b2a5b] dark:text-[#f0f4fc]">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a101d]/95 backdrop-blur-md border-b border-[#e1e8f3] dark:border-[#24324d]">
        <div className="max-w-7xl mx-auto px-6 md:px-14 py-3.5 flex items-center justify-between gap-6">
          {/* Logo matching Image 2 format */}
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-lg md:text-xl tracking-tight shrink-0 group"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white p-1 border border-[#e1e8f3] dark:border-white/10 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Neom School Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-[19px] md:text-[21px] tracking-tight text-[#0b2a5b] dark:text-white">
              Neom School
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Asosiy navigatsiya"
            className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-[#0b2a5b] dark:text-[#d5e3ff]"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-[#f78b2d] dark:hover:text-[#f78b2d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c3b7c] rounded px-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Elements */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Selector */}
            <span
              className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#f4f7fc] dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] text-[#0b2a5b] dark:text-[#d5e3ff]"
              title="Til: O'zbekcha"
            >
              {guestMessages.nav.lang}
            </span>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#141d2e] text-[#4a5f82] dark:text-[#d5e3ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c3b7c]"
              aria-label={guestMessages.nav.darkMode}
              title={guestMessages.nav.darkMode}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Kirish Button */}
            <Link
              href="/kirish"
              className="bg-[#0c3b7c] hover:bg-[#0c2f66] text-white px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0c3b7c]"
            >
              {guestMessages.nav.login}
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-[#4a5f82] dark:text-[#d5e3ff]"
              aria-label={guestMessages.nav.darkMode}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#0b2a5b] dark:text-white"
              aria-label="Menyu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#e1e8f3] dark:border-[#24324d] px-6 py-4 flex flex-col gap-3 bg-white dark:bg-[#0a101d]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-sm font-medium hover:text-[#f78b2d]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                {guestMessages.nav.lang}
              </span>
              <Link
                href="/kirish"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#0c3b7c] text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {guestMessages.nav.login}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer & Aloqa */}
      <footer id="aloqa" aria-label="Aloqa va tashrif" className="mt-auto">
        {/* Orange CTA banner */}
        <div className="bg-[#f78b2d] text-[#1a1204] px-6 md:px-14 py-8 md:py-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-1.5 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {guestMessages.cta.title}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#2d1b03]/80">
                Farzandingiz kelajagi uchun eng yaxshi ta’lim maskani. Hoziroq bog‘laning yoki administratorga yozing!
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:+998500067969"
                className="inline-flex items-center gap-2 bg-[#0c3b7c] hover:bg-[#082a5a] text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>+998 50 006 79 69</span>
              </a>
              <a
                href="https://t.me/Neomschool_admin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0c3b7c] font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-sm"
              >
                <Send className="w-4 h-4 text-[#0c3b7c]" />
                <span>@Neomschool_admin</span>
              </a>
            </div>
          </div>
        </div>

        {/* Detailed Navy Blue Footer */}
        <div className="bg-[#0c2f66] text-white px-6 md:px-14 pt-12 pb-8 border-t border-[#1b3d75]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand & Logo */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                  <img
                    src="/logo.png"
                    alt="Neom School"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">Neom School</span>
              </div>
              <p className="text-xs sm:text-sm text-[#d5e3ff] leading-relaxed">
                Zamonaviy xususiy maktab, repetitorlik kurslari hamda xalqaro sertifikatlar (IELTS, CEFR, TOPIK, SAT) markazi.
              </p>
              <div className="text-xs font-semibold text-[#f78b2d] mt-1">
                Ilm • Tarbiya • Muvaffaqiyat
              </div>
            </div>

            {/* Col 2: Services / Ta'lim */}
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-sm tracking-wide text-white uppercase">
                Ta&apos;lim Yo&apos;nalishlari
              </h3>
              <ul className="flex flex-col gap-2 text-xs sm:text-sm text-[#d5e3ff]">
                <li>• Xususiy maktab (1–11 sinflar)</li>
                <li>• Barcha fanlardan repetitorlik</li>
                <li>• IELTS va CEFR tayyorlov</li>
                <li>• TOPIK va SAT kurslari</li>
                <li>• Robototexnika va to‘garaklar</li>
              </ul>
            </div>

            {/* Col 3: Social & Channels */}
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-sm tracking-wide text-white uppercase">
                Ijtimoiy Tarmoqlar
              </h3>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#d5e3ff]">
                <li>
                  <a
                    href="https://t.me/NeomSchool2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f78b2d] transition-colors inline-flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#f78b2d]" />
                    <span>Kanal: @NeomSchool2025</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/Neomnatija"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f78b2d] transition-colors inline-flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#f78b2d]" />
                    <span>Natijalar: @Neomnatija</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/Neomschool_admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f78b2d] transition-colors inline-flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#f78b2d]" />
                    <span>Admin: @Neomschool_admin</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact Info */}
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-sm tracking-wide text-white uppercase">
                Bog&apos;lanish
              </h3>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#d5e3ff]">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-[#f78b2d] shrink-0 mt-0.5" />
                  <a href="tel:+998500067969" className="hover:text-white transition-colors">
                    +998 50 006 79 69
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#f78b2d] shrink-0 mt-0.5" />
                  <span>Toshkent sh., Yangi O‘zbekiston ko‘chasi</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#f78b2d] shrink-0 mt-0.5" />
                  <span>Dush – Shan: 08:30 – 18:00</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9db4dd]">
            <span>{guestMessages.footer.copyright} · Barcha huquqlar himoyalangan.</span>
            <div className="flex items-center gap-6">
              <a href="#hero" className="hover:text-white transition-colors">Bosh sahifa</a>
              <a href="#haqida" className="hover:text-white transition-colors">Biz haqimizda</a>
              <a href="#afzalliklar" className="hover:text-white transition-colors">Afzalliklar</a>
              <a href="#qabul" className="hover:text-white transition-colors">Qabul</a>
              <Link href="/kirish" className="hover:text-white transition-colors font-medium">Kirish</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
