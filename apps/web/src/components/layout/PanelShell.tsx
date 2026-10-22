'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Role } from '@neom/shared';
import { IdleTimer } from './IdleTimer';
import {
  Menu,
  X,
  CalendarCheck,
  Layers,
  BarChart3,
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  UserCog,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

export interface PanelShellProps {
  role: Role;
  roleLabel?: string;
  userName?: string;
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PanelShell: React.FC<PanelShellProps> = ({
  role,
  roleLabel,
  userName,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string>(userName || '');
  const [currentRole, setCurrentRole] = useState<Role>(role);
  const [currentClassName, setCurrentClassName] = useState<string>('');

  React.useEffect(() => {
    if (role) setCurrentRole(role);
    if (userName) setCurrentUserName(userName);
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const user = data?.data || data;
        if (user?.role) {
          setCurrentRole(user.role as Role);
        }
        if (user?.fullName) {
          setCurrentUserName(user.fullName);
        }
        if (user?.className) {
          setCurrentClassName(user.className);
        }
      })
      .catch(() => {});
  }, [role, userName]);

  React.useEffect(() => {
    const saved = localStorage.getItem('neom_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
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

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignored
    }
    router.push('/');
  };

  const getMenuItems = (userRole: Role): MenuItem[] => {
    switch (userRole) {
      case Role.TEACHER:
        return [
          { title: 'Davomat', href: '/panel/ustoz', icon: CalendarCheck },
          { title: 'Sinflarim', href: '/panel/ustoz/sinflar', icon: Layers },
          { title: 'Hisobot', href: '/panel/ustoz/hisobot', icon: BarChart3 },
        ];
      case Role.ZAVUCH:
        return [
          { title: 'Bosh panel', href: '/panel/zavuch', icon: LayoutDashboard },
          { title: 'Sinflar', href: '/panel/zavuch/sinflar', icon: Layers },
          { title: 'Yangilik va tadbirlar', href: '/panel/zavuch/yangiliklar', icon: Newspaper },
        ];
      case Role.DIRECTOR:
        return [
          { title: 'Nazorat', href: '/panel/direktor', icon: ShieldCheck },
          { title: 'Xodimlar', href: '/panel/direktor/xodimlar', icon: UserCog },
          { title: 'Hisobotlar', href: '/panel/direktor/hisobotlar', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(currentRole || role);

  const defaultRoleLabel =
    (currentRole || role) === Role.TEACHER
      ? `O'qituvchi · ${currentClassName || '9-A'} sinf rahbari`
      : (currentRole || role) === Role.ZAVUCH
        ? "Zavuch · o'quv ishlari"
        : 'Direktor';

  const sidebarContent = (
    <div className="flex flex-col h-full gap-1.5 p-4 bg-[#0c2f66] text-white">
      {/* Brand logo matching Image 2 */}
      <div className="font-bold text-[18px] text-white px-2.5 pt-2 pb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs shrink-0">
            <img
              src="/logo.png"
              alt="Neom School Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold tracking-tight text-[18px] text-white">Neom School</span>
        </Link>
        <button
          onClick={toggleDarkMode}
          className="p-1 rounded text-[#d5e3ff] hover:text-white md:hidden"
          title="Tungi rejim"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation menu items */}
      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[14px] transition-colors duration-150',
                isActive
                  ? 'bg-white text-[#0c2f66] font-semibold shadow-sm'
                  : 'text-[#d5e3ff] hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom role & logout */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
        <div className="text-[12px] text-[#9db4dd] px-2.5 leading-snug">
          {(currentUserName || userName) && (
            <span className="font-semibold block text-white">{currentUserName || userName}</span>
          )}
          <span>
            {currentClassName && (currentRole || role) === Role.TEACHER
              ? `O'qituvchi · ${currentClassName} sinf rahbari`
              : (roleLabel || defaultRoleLabel)}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-[14px] text-[#d5e3ff] hover:text-white hover:bg-white/10 rounded-[8px] transition-colors text-left w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f4f7fc] dark:bg-[#0a101d]">
      <IdleTimer />

      {/* Desktop Sidebar (fixed 230px) */}
      <aside className="hidden md:flex w-[230px] shrink-0 sticky top-0 h-screen border-r border-[#0c2f66]">
        {sidebarContent}
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-[#0c2f66] text-white flex items-center justify-between px-4 z-40 border-b border-white/10">
        <div className="font-bold text-[17px]">NEOM School</div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-[#d5e3ff] hover:text-white"
            title="Tungi rejim"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[240px] max-w-[80vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 pt-18 md:pt-8 md:p-8 flex flex-col gap-5">
        {/* Top desktop header actions */}
        <div className="hidden md:flex justify-end items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[#b9c8e2] dark:border-[#24324d] bg-white dark:bg-[#141d2e] text-[#0b2a5b] dark:text-[#f0f4fc] hover:bg-gray-50 cursor-pointer"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-[#0c3b7c]" />}
            <span>{isDark ? 'Kunduzgi' : 'Tungi rejim'}</span>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
};
