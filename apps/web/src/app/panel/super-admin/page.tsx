'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PanelShell } from '@/components/layout/PanelShell';
import { Card } from '@/components/ui/Card';
import { Role } from '@neom/shared';
import {
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  CalendarCheck,
  RefreshCw,
  Trash2,
  Clock,
  Radio,
  Monitor,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface PanelStatus {
  role: 'DIRECTOR' | 'ZAVUCH' | 'TEACHER';
  panelName: string;
  userName: string;
  lastLoginTime: string;
  lastActiveTime: string;
  lastActiveTimestamp: number;
  lastPath: string;
  ip: string;
  device: string;
  isOnline: boolean;
  durationMinutes: number;
}

interface ActivityLogItem {
  id: string;
  timestamp: string;
  rawTime: number;
  role: 'DIRECTOR' | 'ZAVUCH' | 'TEACHER' | 'SUPER_ADMIN';
  panelName: string;
  userName: string;
  eventType: 'LOGIN' | 'HEARTBEAT' | 'PAGE_VIEW' | 'LOGOUT';
  details: string;
  ip: string;
  device?: string;
}

interface MonitorData {
  currentTime: string;
  totalOnline: number;
  panels: {
    DIRECTOR: PanelStatus;
    ZAVUCH: PanelStatus;
    TEACHER: PanelStatus;
  };
  logs: ActivityLogItem[];
}

export default function SuperAdminMonitorPage() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchMonitorData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/presence/monitor', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setData(json.data);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitorData();

    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitorData();
    }, 3000); // 3-second real-time poll

    return () => clearInterval(interval);
  }, [fetchMonitorData, isAutoRefresh]);

  const handleClearLogs = async () => {
    if (!confirm('Haqiqatan ham barcha faollik tarixini tozalamoqchimisiz?')) return;
    try {
      const res = await fetch('/api/presence/clear', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        fetchMonitorData(true);
      }
    } catch {
      // ignore
    }
  };

  const filteredLogs = (data?.logs || []).filter((log) => {
    if (filterRole === 'ALL') return true;
    return log.role === filterRole;
  });

  return (
    <PanelShell role={Role.SUPER_ADMIN}>
      <div className="flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0c2f66] to-[#081f45] p-6 rounded-2xl text-white shadow-lg border border-[#1a4488]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center shrink-0 text-red-400 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight">Nazoratchi Boshqaruv Markazi</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                  MAXFIY REJIM
                </span>
              </div>
              <p className="text-sm text-[#bcd2f5] mt-1">
                3 ta asosiy panel (Direktor, Zavuch, Ustoz) real-vaqtda to‘liq nazorat ostida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Real-time Indicator */}
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isAutoRefresh
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                  : 'bg-white/10 text-white/60 border-white/20'
              }`}
              title="Avtomatik real-time yangilanishni yoqish/o‘chirish"
            >
              <Radio className={`w-3.5 h-3.5 ${isAutoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>{isAutoRefresh ? 'Real-time: 3s' : 'Real-time: To‘xtatilgan'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchMonitorData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all disabled:opacity-50"
              title="Qayta yuklash"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Clear Logs */}
            <button
              onClick={handleClearLogs}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all"
              title="Tarixni tozalash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 ta Panel Real-time Holat Kartalari */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. DIREKTOR PANELI */}
          <Card className="p-5 flex flex-col gap-4 border-2 relative overflow-hidden transition-all shadow-md bg-white dark:bg-[#141d2e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0c2f66] dark:text-white">Direktor Paneli</h3>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">admin1 (Direktor)</span>
                </div>
              </div>

              {/* Online/Offline Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                  data?.panels?.DIRECTOR?.isOnline
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-neutral-100 text-neutral-600 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    data?.panels?.DIRECTOR?.isOnline ? 'bg-emerald-500 animate-ping' : 'bg-neutral-400'
                  }`}
                />
                <span>{data?.panels?.DIRECTOR?.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-neutral-100 dark:border-neutral-800 pt-3">
              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Kirgan vaqti:
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {data?.panels?.DIRECTOR?.lastLoginTime || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> So‘nggi faollik:
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {data?.panels?.DIRECTOR?.lastActiveTime || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" /> Turgan sahifasi:
                </span>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[170px]">
                  {data?.panels?.DIRECTOR?.lastPath || '/panel/direktor'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-500 dark:text-neutral-400">Qurilma / IP:</span>
                <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                  {data?.panels?.DIRECTOR?.device || '—'} ({data?.panels?.DIRECTOR?.ip || '—'})
                </span>
              </div>
            </div>

            <Link
              href="/panel/direktor"
              className="mt-1 w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <span>Direktor panelini ko‘rish</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* 2. ZAVUCH PANELI */}
          <Card className="p-5 flex flex-col gap-4 border-2 relative overflow-hidden transition-all shadow-md bg-white dark:bg-[#141d2e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0c2f66] dark:text-white">Zavuch Paneli</h3>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">admin2 (Zavuch)</span>
                </div>
              </div>

              {/* Online/Offline Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                  data?.panels?.ZAVUCH?.isOnline
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-neutral-100 text-neutral-600 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    data?.panels?.ZAVUCH?.isOnline ? 'bg-emerald-500 animate-ping' : 'bg-neutral-400'
                  }`}
                />
                <span>{data?.panels?.ZAVUCH?.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-neutral-100 dark:border-neutral-800 pt-3">
              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Kirgan vaqti:
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {data?.panels?.ZAVUCH?.lastLoginTime || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> So‘nggi faollik:
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {data?.panels?.ZAVUCH?.lastActiveTime || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" /> Turgan sahifasi:
                </span>
                <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 font-semibold truncate max-w-[170px]">
                  {data?.panels?.ZAVUCH?.lastPath || '/panel/zavuch'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-500 dark:text-neutral-400">Qurilma / IP:</span>
                <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                  {data?.panels?.ZAVUCH?.device || '—'} ({data?.panels?.ZAVUCH?.ip || '—'})
                </span>
              </div>
            </div>

            <Link
              href="/panel/zavuch"
              className="mt-1 w-full py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <span>Zavuch panelini ko‘rish</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* 3. USTOZ PANELI */}
          <Card className="p-5 flex flex-col gap-4 border-2 relative overflow-hidden transition-all shadow-md bg-white dark:bg-[#141d2e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0c2f66] dark:text-white">Ustoz Paneli</h3>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">admin3 (O‘qituvchi)</span>
                </div>
              </div>

              {/* Online/Offline Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                  data?.panels?.TEACHER?.isOnline
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-neutral-100 text-neutral-600 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    data?.panels?.TEACHER?.isOnline ? 'bg-emerald-500 animate-ping' : 'bg-neutral-400'
                  }`}
                />
                <span>{data?.panels?.TEACHER?.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-neutral-100 dark:border-neutral-800 pt-3">
              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Kirgan vaqti:
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {data?.panels?.TEACHER?.lastLoginTime || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> So‘nggi faollik:
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {data?.panels?.TEACHER?.lastActiveTime || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-neutral-100/60 dark:border-neutral-800/60">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" /> Turgan sahifasi:
                </span>
                <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[170px]">
                  {data?.panels?.TEACHER?.lastPath || '/panel/ustoz'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-500 dark:text-neutral-400">Qurilma / IP:</span>
                <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                  {data?.panels?.TEACHER?.device || '—'} ({data?.panels?.TEACHER?.ip || '—'})
                </span>
              </div>
            </div>

            <Link
              href="/panel/ustoz"
              className="mt-1 w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
            >
              <span>Ustoz panelini ko‘rish</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>

        {/* Real-time Jonli Faollik Jurnali */}
        <Card className="p-6 bg-white dark:bg-[#141d2e] shadow-md border border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-[#0c2f66] dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Jonli Kirishlar va Harakatlar Tarixi</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Direktor, Zavuch va Ustozlarning tizimga kirish vaqtlari va sahifalardagi harakatlari
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL', label: 'Barchasi' },
                { key: 'DIRECTOR', label: 'Direktor' },
                { key: 'ZAVUCH', label: 'Zavuch' },
                { key: 'TEACHER', label: 'Ustoz' },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setFilterRole(btn.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterRole === btn.key
                      ? 'bg-[#0c2f66] text-white dark:bg-blue-600'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                  <th className="py-2.5 px-3 font-semibold">Vaqt (Toshkent)</th>
                  <th className="py-2.5 px-3 font-semibold">Panel</th>
                  <th className="py-2.5 px-3 font-semibold">Foydalanuvchi</th>
                  <th className="py-2.5 px-3 font-semibold">Harakat / Sahifa</th>
                  <th className="py-2.5 px-3 font-semibold">Holat</th>
                  <th className="py-2.5 px-3 font-semibold">Qurilma / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400 dark:text-neutral-500">
                      Hozircha harakatlar jurnali bo‘sh. Panellarga kirilganda bu yerda real-vaqtda ko‘rinadi.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isLogin = log.eventType === 'LOGIN';
                    const isLogout = log.eventType === 'LOGOUT';
                    return (
                      <tr key={log.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              log.role === 'DIRECTOR'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : log.role === 'ZAVUCH'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {log.panelName}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                          {log.userName}
                        </td>
                        <td className="py-3 px-3 font-mono text-[12px] text-neutral-700 dark:text-neutral-300">
                          {log.details}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isLogin ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Tizimga kirdi
                            </span>
                          ) : isLogout ? (
                            <span className="inline-flex items-center gap-1 text-neutral-500 font-semibold text-[11px]">
                              <AlertCircle className="w-3 h-3" /> Chiqdi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                              <Activity className="w-3 h-3" /> Faol
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                          {log.device || '—'} · {log.ip}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PanelShell>
  );
}
