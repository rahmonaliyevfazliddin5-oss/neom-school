import React from 'react';
import Link from 'next/link';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#f4f7fc] dark:bg-[#0a101d]">
      {/* Left Column (Navy Hero Banner) */}
      <div className="flex-1 min-w-[340px] bg-[#0c3b7c] text-white p-8 md:p-16 flex flex-col justify-center gap-4.5">
        <div className="font-bold text-[20px] tracking-wide">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-90">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
              <img
                src="/logo.png"
                alt="Neom School Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-white text-xl font-extrabold tracking-tight">Neom School</span>
          </Link>
        </div>
        <h1 className="text-[36px] md:text-[44px] leading-[1.15] font-bold text-white max-w-lg">
          Kelajak yulduzlari shu yerdan boshlanadi
        </h1>
        <p className="text-[#d5e3ff] text-base md:text-lg">
          Maktab boshqaruv tizimi · 2026–2027 o&apos;quv yili
        </p>
      </div>

      {/* Right Column (Centered Auth Card) */}
      <div className="flex-1 min-w-[340px] flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
};
