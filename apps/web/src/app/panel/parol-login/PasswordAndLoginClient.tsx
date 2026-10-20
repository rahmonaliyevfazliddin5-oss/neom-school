'use client';

import React, { useState, useEffect } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@neom/shared';
import { Eye, EyeOff, Check, X, KeyRound, User, Lock, ShieldCheck } from 'lucide-react';

interface Props {
  initialRole?: Role;
}

export default function PasswordAndLoginClient({ initialRole = Role.DIRECTOR }: Props) {
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [initialFullName, setInitialFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<Role>(initialRole);

  // Fetch current user info
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        const data = res?.data || res;
        if (data) {
          if (data.role) setUserRole(data.role);
          if (data.fullName) {
            setFullName(data.fullName);
            setInitialFullName(data.fullName);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Password strength checks
  const hasMinLength = newPassword.length >= 10;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const validCount =
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasNumber ? 1 : 0);

  const strengthLabel =
    validCount <= 2 ? 'Zaif' : validCount === 3 ? "O'rtacha" : 'Kuchli';
  const strengthColor =
    validCount <= 2
      ? 'bg-red-500'
      : validCount === 3
        ? 'bg-yellow-500'
        : 'bg-green-600';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast("O‘zgarishlarni tasdiqlash uchun joriy parolingizni kiriting", 'error');
      return;
    }

    const wantsPasswordChange = newPassword.length > 0 || confirmPassword.length > 0;
    const wantsNameChange = fullName.trim().length > 0 && fullName.trim() !== initialFullName;
    const wantsLoginChange = newLogin.trim().length > 0;

    if (!wantsPasswordChange && !wantsNameChange && !wantsLoginChange) {
      toast("O‘zgartirish uchun ism-familiya, yangi login yoki yangi parolni kiriting", 'info');
      return;
    }

    if (wantsPasswordChange) {
      if (validCount < 4) {
        toast("Yangi parol barcha xavfsizlik talablariga javob berishi kerak (kamida 10 belgi, katta/kichik harf, raqam)", 'error');
        return;
      }

      if (!isMatch) {
        toast("Yangi parollar bir-biriga mos kelmadi", 'error');
        return;
      }
    }

    setIsLoading(true);

    try {
      let csrfToken = '';
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/neom_csrf_token=([^;]+)/);
        if (match) csrfToken = match[1];
      }

      const res = await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          fullName: fullName.trim() || undefined,
          newLogin: newLogin.trim() || undefined,
          newPassword: wantsPasswordChange ? newPassword : undefined,
          confirmPassword: wantsPasswordChange ? confirmPassword : undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast(data?.message || "Xatolik yuz berdi", 'error');
        return;
      }

      toast("Ma‘lumotlar muvaffaqiyatli yangilandi va saqlandi!", 'success');
      setInitialFullName(fullName.trim());
      if (data?.role) setUserRole(data.role);
      else if (data?.data?.role) setUserRole(data.data.role);

      // Clear password & login fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewLogin('');
    } catch {
      toast("Server bilan aloqa uzildi", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PanelShell
      role={userRole}
      userName={fullName}
      roleLabel="Profil va xavfsizlik sozlamalari"
    >
      <div>
        <h1 className="text-[28px] font-bold text-[#0b2a5b] dark:text-white">
          Profil va xavfsizlik
        </h1>
        <p className="text-sm text-[#4a5f82] dark:text-[#9db4dd]">
          F.I.SH (ism-familiya), login va parolni yangilash
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Form Card */}
        <Card className="p-6 gap-5 max-w-xl w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            {/* 1. Ism va familiya (F.I.SH) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                htmlFor="fullName"
                className="text-[13px] font-semibold text-[#0b2a5b] dark:text-[#d5e3ff] flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-[#0c3b7c] dark:text-[#5a95e5]" />
                <span>Ism va familiya (F.I.SH)</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Masalan: Rustamov Shavkat Akbarovich"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15 dark:bg-[#141d2e] dark:border-[#324466] dark:text-white transition-all"
              />
              <span className="text-[11px] text-[#556987] dark:text-[#8ea4c8]">
                Barcha panellarda va hisobotlarda ushbu ism-familiya ko‘rsatiladi.
              </span>
            </div>

            {/* 2. Yangi login */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                htmlFor="newLogin"
                className="text-[13px] font-semibold text-[#0b2a5b] dark:text-[#d5e3ff] flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4 text-[#0c3b7c] dark:text-[#5a95e5]" />
                <span>Yangi login (ixtiyoriy)</span>
              </label>
              <input
                id="newLogin"
                type="text"
                autoComplete="username"
                placeholder="O‘zgartirmaslik uchun bo‘sh qoldiring"
                value={newLogin}
                onChange={(e) => setNewLogin(e.target.value)}
                className="border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15 dark:bg-[#141d2e] dark:border-[#324466] dark:text-white transition-all"
              />
            </div>

            <div className="border-t border-[#e2eaf5] dark:border-[#24344e] my-1" />

            {/* 3. Yangi parol (ixtiyoriy) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                htmlFor="newPassword"
                className="text-[13px] font-semibold text-[#0b2a5b] dark:text-[#d5e3ff] flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4 text-[#0c3b7c] dark:text-[#5a95e5]" />
                <span>Yangi parol (ixtiyoriy)</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Parolni almashtirmaslik uchun bo‘sh qoldiring"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 pr-11 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15 dark:bg-[#141d2e] dark:border-[#324466] dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[#4a5f82] hover:text-[#0b2a5b] dark:hover:text-white"
                  title={showNew ? 'Yashirish' : 'Ko‘rsatish'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength progress bar */}
              {newPassword.length > 0 && (
                <div className="mt-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Parol mustahkamligi:</span>
                    <span className={validCount === 4 ? 'text-green-600' : 'text-yellow-600'}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(validCount / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Yangi parolni takrorlang */}
            {newPassword.length > 0 && (
              <div className="flex flex-col gap-1.5 w-full">
                <label
                  htmlFor="confirmPassword"
                  className="text-[13px] font-semibold text-[#0b2a5b] dark:text-[#d5e3ff]"
                >
                  Yangi parolni takrorlang *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Yangi parolni qayta tering"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 pr-11 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15 dark:bg-[#141d2e] dark:border-[#324466] dark:text-white transition-all"
                    required={newPassword.length > 0}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[#4a5f82] hover:text-[#0b2a5b] dark:hover:text-white"
                    title={showConfirm ? 'Yashirish' : 'Ko‘rsatish'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Criteria checklist */}
            {newPassword.length > 0 && (
              <div className="bg-[#f4f7fc] dark:bg-[#1f2b40] p-3.5 rounded-[10px] flex flex-col gap-1.5 text-xs border border-[#e2eaf5] dark:border-[#2d3e5b]">
                <span className="font-semibold text-[#0b2a5b] dark:text-white mb-0.5">
                  Parol mezonlari:
                </span>
                <div className="flex items-center gap-2">
                  {hasMinLength ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span className={hasMinLength ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500'}>
                    Kamida 10 ta belgi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUppercase ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span className={hasUppercase ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500'}>
                    Kamida bitta katta harf (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasLowercase ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span className={hasLowercase ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500'}>
                    Kamida bitta kichik harf (a-z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span className={hasNumber ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500'}>
                    Kamida bitta raqam (0-9)
                  </span>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2">
                    {isMatch ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-red-500" />}
                    <span className={isMatch ? 'text-green-700 dark:text-green-400 font-medium' : 'text-red-500'}>
                      Parollar mos keldi
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-[#e2eaf5] dark:border-[#24344e] my-1" />

            {/* 5. Joriy parol (Tasdiqlash uchun majburiy) */}
            <div className="flex flex-col gap-1.5 w-full bg-[#f8faff] dark:bg-[#111927] p-3.5 rounded-xl border border-[#d6e3f8] dark:border-[#22334f]">
              <label
                htmlFor="currentPassword"
                className="text-[13px] font-bold text-[#0c3b7c] dark:text-[#7baaff] flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#0c3b7c] dark:text-[#7baaff]" />
                <span>Joriy parol * (Tasdiqlash uchun)</span>
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Joriy parolingizni kiriting"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 pr-11 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15 dark:bg-[#141d2e] dark:border-[#324466] dark:text-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[#4a5f82] hover:text-[#0b2a5b] dark:hover:text-white"
                  title={showCurrent ? 'Yashirish' : 'Ko‘rsatish'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-[#556987] dark:text-[#8ea4c8]">
                Xavfsizlik yuzasidan har qanday o‘zgarishni tasdiqlash uchun joriy parolni kiritish majburiydir.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="mt-2 py-3 text-[15px] font-semibold bg-[#0c3b7c] hover:bg-[#092c5d] text-white rounded-xl shadow-md cursor-pointer"
            >
              O‘zgarishlarni saqlash
            </Button>
          </form>
        </Card>

        {/* Right Security Notice Card */}
        <Card className="p-6 gap-4 bg-white dark:bg-[#141d2e]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#fef5e7] dark:bg-[#342410] flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#f78b2d]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b2a5b] dark:text-white">
                Xavfsizlik va boshqaruv qoidalari
              </h3>
              <p className="text-xs text-[#556987] dark:text-[#8ea4c8]">
                Direktor va xodim ma‘lumotlari himoyasi
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm text-[#4a5f82] dark:text-[#9db4dd] leading-relaxed">
            <p>
              • <strong>F.I.SH tahrirlash:</strong> Ism va familiyangizni o‘zgartirgach, bu o‘zgarish maktab monitoringi, xodimlar ro‘yxati va hisobotlarda birdek yangilanadi.
            </p>
            <p>
              • <strong>Joriy parol tasdig‘i:</strong> Ruxsatsiz o‘zgarishlarning oldini olish uchun joriy parol kiritilmaguncha hech bir ma‘lumot o‘zgarmaydi.
            </p>
            <p>
              • <strong>Kriptografik himoya:</strong> Barcha parollar Argon2id (64 MiB xotira, 3 iteratsiya) va server maxfiy pepper bilan xeshlanadi.
            </p>
            <p>
              • <strong>Login shifrlash:</strong> Loginlar bazada ochiq saqlanmaydi — HMAC-SHA256 indeksi va AES-256-GCM shifrlash orqali himoyalangan.
            </p>
            <p>
              • <strong>Sessiya nazorati:</strong> Parol yoki login yangilangan zahoti barcha boshqa faol sessiyalar xavfsizlik nuqtai nazaridan avtomatik bekor qilinadi.
            </p>
          </div>
        </Card>
      </div>
    </PanelShell>
  );
}
