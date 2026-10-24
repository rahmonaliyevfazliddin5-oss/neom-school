import fs from 'fs';
import path from 'path';

export interface PanelPresence {
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

export interface ActivityLogItem {
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

export interface PresenceData {
  panels: {
    DIRECTOR: PanelPresence;
    ZAVUCH: PanelPresence;
    TEACHER: PanelPresence;
  };
  logs: ActivityLogItem[];
}

function getUzbekTimeString(date = new Date()): string {
  // Tashkent is UTC+5
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const uzbekDate = new Date(utc + 5 * 3600000);

  const Y = uzbekDate.getFullYear();
  const M = String(uzbekDate.getMonth() + 1).padStart(2, '0');
  const D = String(uzbekDate.getDate()).padStart(2, '0');
  const h = String(uzbekDate.getHours()).padStart(2, '0');
  const m = String(uzbekDate.getMinutes()).padStart(2, '0');
  const s = String(uzbekDate.getSeconds()).padStart(2, '0');

  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

function parseDevice(userAgent?: string): string {
  if (!userAgent) return 'Nomaʼlum qurilma';
  const ua = userAgent.toLowerCase();
  let os = 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS (Apple)';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('linux')) os = 'Linux';

  let browser = 'Brauzer';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome/')) browser = 'Chrome';
  else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari';
  else if (ua.includes('firefox/')) browser = 'Firefox';

  return `${os} · ${browser}`;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'presence-sessions.json');

function createDefaultState(): PresenceData {
  return {
    panels: {
      DIRECTOR: {
        role: 'DIRECTOR',
        panelName: 'Direktor',
        userName: 'Direktor',
        lastLoginTime: '—',
        lastActiveTime: '—',
        lastActiveTimestamp: 0,
        lastPath: '/panel/direktor',
        ip: '—',
        device: '—',
        isOnline: false,
        durationMinutes: 0,
      },
      ZAVUCH: {
        role: 'ZAVUCH',
        panelName: 'Zavuch',
        userName: 'Zavuch',
        lastLoginTime: '—',
        lastActiveTime: '—',
        lastActiveTimestamp: 0,
        lastPath: '/panel/zavuch',
        ip: '—',
        device: '—',
        isOnline: false,
        durationMinutes: 0,
      },
      TEACHER: {
        role: 'TEACHER',
        panelName: 'Ustoz',
        userName: 'O‘qituvchi',
        lastLoginTime: '—',
        lastActiveTime: '—',
        lastActiveTimestamp: 0,
        lastPath: '/panel/ustoz',
        ip: '—',
        device: '—',
        isOnline: false,
        durationMinutes: 0,
      },
    },
    logs: [],
  };
}

let inMemoryState: PresenceData | null = null;

function loadState(): PresenceData {
  if (inMemoryState) return inMemoryState;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryState = JSON.parse(raw);
      if (inMemoryState?.panels && inMemoryState?.logs) {
        return inMemoryState;
      }
    }
  } catch {
    // ignore
  }

  inMemoryState = createDefaultState();
  return inMemoryState;
}

function saveState() {
  if (!inMemoryState) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryState, null, 2), 'utf-8');
  } catch {
    // ignore write errors
  }
}

export function recordPresenceActivity({
  role,
  userName,
  path = '',
  ip = '127.0.0.1',
  userAgent = '',
  eventType = 'HEARTBEAT',
  details = '',
}: {
  role: 'DIRECTOR' | 'ZAVUCH' | 'TEACHER' | 'SUPER_ADMIN';
  userName?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  eventType?: 'LOGIN' | 'HEARTBEAT' | 'PAGE_VIEW' | 'LOGOUT';
  details?: string;
}) {
  const state = loadState();
  const nowStr = getUzbekTimeString();
  const nowMs = Date.now();
  const device = parseDevice(userAgent);

  const panelKey =
    role === 'DIRECTOR' ? 'DIRECTOR' : role === 'ZAVUCH' ? 'ZAVUCH' : role === 'TEACHER' ? 'TEACHER' : null;

  if (panelKey) {
    const current = state.panels[panelKey];
    const previousPath = current.lastPath;
    const isNewLogin = eventType === 'LOGIN';
    const isLogout = eventType === 'LOGOUT';

    current.userName = userName || current.userName;
    current.ip = ip || current.ip;
    current.device = device || current.device;
    if (path) current.lastPath = path;

    if (isNewLogin) {
      current.lastLoginTime = nowStr;
      current.lastActiveTime = nowStr;
      current.lastActiveTimestamp = nowMs;
    } else if (isLogout) {
      current.lastActiveTime = nowStr;
      current.lastActiveTimestamp = 0; // immediate offline
    } else {
      current.lastActiveTime = nowStr;
      current.lastActiveTimestamp = nowMs;
    }

    // Determine if we should append to audit logs
    let shouldLog = false;
    let logDetails = details;

    if (isNewLogin) {
      shouldLog = true;
      logDetails = logDetails || `${current.panelName} paneliga muvaffaqiyatli kirdi`;
    } else if (isLogout) {
      shouldLog = true;
      logDetails = logDetails || `${current.panelName} panelidan chiqdi`;
    } else if (path && path !== previousPath) {
      shouldLog = true;
      logDetails = logDetails || `${current.panelName} yangi sahifaga o‘tdi: ${path}`;
    } else if (eventType === 'PAGE_VIEW') {
      shouldLog = true;
      logDetails = logDetails || `${current.panelName} sahifasi ko‘rilmoqda: ${path || current.lastPath}`;
    }

    if (shouldLog) {
      const logItem: ActivityLogItem = {
        id: `act-${nowMs}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: nowStr,
        rawTime: nowMs,
        role,
        panelName: current.panelName,
        userName: current.userName,
        eventType,
        details: logDetails,
        ip,
        device,
      };

      state.logs.unshift(logItem);
      // Keep up to 250 recent events
      if (state.logs.length > 250) {
        state.logs = state.logs.slice(0, 250);
      }
    }
  }

  saveState();
}

export function getPresenceOverview() {
  const state = loadState();
  const nowMs = Date.now();
  const ONLINE_THRESHOLD_MS = 45000; // 45 seconds heartbeat tolerance

  const calculatePanel = (panel: PanelPresence): PanelPresence => {
    const isOnline = panel.lastActiveTimestamp > 0 && nowMs - panel.lastActiveTimestamp < ONLINE_THRESHOLD_MS;
    let durationMinutes = 0;
    if (isOnline && panel.lastLoginTime && panel.lastLoginTime !== '—') {
      const loginDate = new Date(panel.lastLoginTime.replace(' ', 'T') + '+05:00').getTime();
      if (!isNaN(loginDate) && nowMs > loginDate) {
        durationMinutes = Math.max(1, Math.round((nowMs - loginDate) / 60000));
      }
    }

    return {
      ...panel,
      isOnline,
      durationMinutes,
    };
  };

  const director = calculatePanel(state.panels.DIRECTOR);
  const zavuch = calculatePanel(state.panels.ZAVUCH);
  const teacher = calculatePanel(state.panels.TEACHER);

  const totalOnline =
    (director.isOnline ? 1 : 0) + (zavuch.isOnline ? 1 : 0) + (teacher.isOnline ? 1 : 0);

  return {
    currentTime: getUzbekTimeString(),
    totalOnline,
    panels: {
      DIRECTOR: director,
      ZAVUCH: zavuch,
      TEACHER: teacher,
    },
    logs: state.logs.slice(0, 100),
  };
}

export function clearPresenceLogs() {
  const state = loadState();
  state.logs = [];
  saveState();
  return { success: true };
}
