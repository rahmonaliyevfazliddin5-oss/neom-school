import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f4f7fc] dark:bg-[#0a101d] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] rounded-[20px] p-10 max-w-md w-full shadow-sm flex flex-col items-center gap-4">
        <span className="text-[56px] font-bold text-[#0c3b7c] dark:text-[#d5e3ff]">
          404
        </span>
        <h1 className="text-xl font-bold text-[#0b2a5b] dark:text-white">
          Sahifa topilmadi
        </h1>
        <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd] leading-relaxed">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas, nomi o‘zgartirilgan yoki
          vaqtincha o‘chirilgan bo‘lishi mumkin.
        </p>
        <Link
          href="/"
          className="mt-2 bg-[#0c3b7c] text-white font-semibold px-6 py-3 rounded-[10px] text-sm hover:bg-[#0c2f66] transition-colors"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
