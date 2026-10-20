'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const WARNING_TIME_MS = 28 * 60 * 1000; // 28 minutes
const LOGOUT_TIME_MS = 30 * 60 * 1000;  // 30 minutes

export const IdleTimer: React.FC = () => {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const handleExtend = async () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    try {
      await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignored
    }
  };

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignored
    }
    router.push('/kirish');
  }, [router]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity));

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= LOGOUT_TIME_MS) {
        handleLogout();
      } else if (elapsed >= WARNING_TIME_MS) {
        setShowWarning(true);
        const rem = Math.max(0, Math.ceil((LOGOUT_TIME_MS - elapsed) / 1000));
        setSecondsRemaining(rem);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleActivity, handleLogout]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] rounded-[20px] p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#fff3c2] text-[#5c4400] flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#0b2a5b] dark:text-white">
            Seans tugamoqda
          </h3>
          <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd] mt-1.5 leading-relaxed">
            Siz 28 daqiqadan beri hech qanday harakat qilmadingiz. Xavfsizlik
            sababli seans {secondsRemaining} soniyadan keyin avtomatik yopiladi.
          </p>
        </div>

        <div className="flex gap-2.5 w-full mt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className="flex-1"
          >
            Chiqish
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExtend}
            className="flex-1"
          >
            Davom etish
          </Button>
        </div>
      </div>
    </div>
  );
};
