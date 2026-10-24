'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!login.trim() || !password) {
      setErrorMessage("Login va parolni kiriting");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Fetch CSRF token if already stored or pre-fetched
      let csrfToken = '';
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/neom_csrf_token=([^;]+)/);
        if (match) csrfToken = match[1];
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        credentials: 'include', // Ensures httpOnly session cookies are saved
        body: JSON.stringify({
          login: login.trim(),
          password,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 429) {
          const msg = "Juda ko'p urinish. 15 daqiqadan keyin qayta urining";
          setErrorMessage(msg);
          toast(msg, 'error');
          return;
        }

        const msg = result?.message || "Login yoki parol noto'g'ri";
        setErrorMessage(msg);
        toast(msg, 'error');
        return;
      }

      toast("Muvaffaqiyatli kirildi!", 'success');

      // Wipe password and login from memory state
      setPassword('');
      setLogin('');

      const data = result?.data || result;
      if (data?.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push('/panel/ustoz');
      }
    } catch {
      const genericError = "Serverga ulanishda xatolik yuz berdi";
      setErrorMessage(genericError);
      toast(genericError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-8 gap-5 bg-white dark:bg-[#141d2e] shadow-md border-[#e1e8f3] dark:border-[#24324d]">
        <h2 className="text-[26px] font-bold text-[#0b2a5b] dark:text-white">
          Tizimga kirish
        </h2>

        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-[10px] bg-[#fde0e0] border border-[#b3261e] text-[#7a1410] text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col gap-4"
        >
          {/* Login Input */}
          <div className="flex flex-col gap-1.5 w-full">
            <label
              htmlFor="login"
              className="text-[13px] font-medium text-[#0b2a5b] dark:text-[#d5e3ff]"
            >
              Login
            </label>
            <input
              id="login"
              name="login"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-autocomplete="none"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15 dark:bg-[#141d2e] dark:border-[#324466] dark:text-white"
              required
            />
          </div>

          {/* Password Input with show/hide toggle */}
          <div className="flex flex-col gap-1.5 w-full">
            <label
              htmlFor="password"
              className="text-[13px] font-medium text-[#0b2a5b] dark:text-[#d5e3ff]"
            >
              Parol
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-autocomplete="none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 pr-11 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15 dark:bg-[#141d2e] dark:border-[#324466] dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[#4a5f82] hover:text-[#0b2a5b] dark:text-[#9db4dd] dark:hover:text-white"
                title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-1 text-[15px]"
          >
            Kirish
          </Button>
        </form>

        <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd] leading-relaxed">
          Kirish ma&apos;lumotlari shifrlangan holda tekshiriladi. Ish tugagach,
          albatta, tizimdan chiqing.
        </p>
      </Card>
    </AuthLayout>
  );
}
