import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { calculateProgress, calculateRemaining, getUsageStatus } from '@/utils/usage';
import type { UsageStatus } from '@/types/usage';

export interface TrackedApp {
  id: number;
  packageName: string | null;
  appName: string;
  iconUri: string | null;
  source: 'installed' | 'manual';
  dailyLimitSeconds: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyUsage {
  trackedAppId: number;
  date: string;
  systemUsageSeconds: number;
  manualUsageSeconds: number;
  totalUsageSeconds: number;
  lastSyncedAt: string;
}

export interface ManualSession {
  id: number;
  trackedAppId: number;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  date: string;
}

export interface GlobalSettings {
  dailyLimitSeconds: number;
  isEnabled: boolean;
  onboardingCompleted: boolean;
  usageAccessGranted: boolean;
  overlayPermissionGranted: boolean;
  accessibilityServiceGranted: boolean;
  updatedAt: string;
}

export interface ComputedAppUsage {
  id: number;
  appName: string;
  packageName: string | null;
  source: 'installed' | 'manual';
  dailyLimitSeconds: number;
  usedSeconds: number;
  remainingSeconds: number;
  progressPercent: number;
  status: UsageStatus;
  isLimitEnabled: boolean;
  hasUsageData: boolean;
  isLocked: boolean;
  systemUsageSeconds: number;
  manualUsageSeconds: number;
  raw: TrackedApp;
}

export interface GlobalUsageSummary {
  isEnabled: boolean;
  dailyLimitSeconds: number;
  usedSeconds: number;
  remainingSeconds: number;
  progressPercent: number;
  isReached: boolean;
  status: UsageStatus;
}

interface TilContextType {
  apps: ComputedAppUsage[];
  rawApps: TrackedApp[];
  globalUsage: GlobalUsageSummary;
  settings: GlobalSettings;
  activeSession: ManualSession | null;
  activeSessionElapsed: number;
  activeLockedApp: ComputedAppUsage | null;
  setActiveLockedApp: (app: ComputedAppUsage | null) => void;
  resetSeconds: number;
  todayDateFormatted: string;
  
  // Actions
  startManualTimer: (appId: number) => void;
  stopManualTimer: () => void;
  updateAppLimit: (appId: number, dailyLimitSeconds: number) => void;
  removeTrackedApp: (appId: number) => { success: boolean; message?: string };
  addTrackedApp: (params: { appName: string; packageName?: string | null; source: 'installed' | 'manual'; dailyLimitSeconds: number }) => void;
  updateGlobalSettings: (partial: Partial<GlobalSettings>) => void;
  simulateUsage: (appId: number, additionalSeconds: number) => void;
  simulateDailyReset: () => void;
  deleteAllLocalData: () => void;
}

const STORAGE_KEY = 'til_app_state_v1';

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSecondsToMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

const DEFAULT_APPS: TrackedApp[] = [
  {
    id: 1,
    packageName: 'com.google.android.youtube',
    appName: 'YouTube',
    iconUri: null,
    source: 'installed',
    dailyLimitSeconds: 3600, // 1h
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    packageName: 'com.instagram.android',
    appName: 'Instagram',
    iconUri: null,
    source: 'installed',
    dailyLimitSeconds: 2700, // 45m
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    packageName: 'com.twitter.android',
    appName: 'X / Twitter',
    iconUri: null,
    source: 'installed',
    dailyLimitSeconds: 1800, // 30m
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    packageName: 'com.android.chrome',
    appName: 'Chrome Browser',
    iconUri: null,
    source: 'installed',
    dailyLimitSeconds: 5400, // 1h 30m
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    packageName: null,
    appName: 'Deep Work Session',
    iconUri: null,
    source: 'manual',
    dailyLimitSeconds: 7200, // 2h
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_USAGE: Record<number, DailyUsage> = {
  1: {
    trackedAppId: 1,
    date: getLocalDateString(),
    systemUsageSeconds: 2820, // 47m (approaching 1h warning)
    manualUsageSeconds: 0,
    totalUsageSeconds: 2820,
    lastSyncedAt: new Date().toISOString(),
  },
  2: {
    trackedAppId: 2,
    date: getLocalDateString(),
    systemUsageSeconds: 2760, // 46m (reached 45m limit -> locked!)
    manualUsageSeconds: 0,
    totalUsageSeconds: 2760,
    lastSyncedAt: new Date().toISOString(),
  },
  3: {
    trackedAppId: 3,
    date: getLocalDateString(),
    systemUsageSeconds: 900, // 15m
    manualUsageSeconds: 0,
    totalUsageSeconds: 900,
    lastSyncedAt: new Date().toISOString(),
  },
  4: {
    trackedAppId: 4,
    date: getLocalDateString(),
    systemUsageSeconds: 1980, // 33m
    manualUsageSeconds: 0,
    totalUsageSeconds: 1980,
    lastSyncedAt: new Date().toISOString(),
  },
  5: {
    trackedAppId: 5,
    date: getLocalDateString(),
    systemUsageSeconds: 0,
    manualUsageSeconds: 3600, // 1h manual session
    totalUsageSeconds: 3600,
    lastSyncedAt: new Date().toISOString(),
  },
};

const DEFAULT_SETTINGS: GlobalSettings = {
  dailyLimitSeconds: 14400, // 4 hours combined
  isEnabled: true,
  onboardingCompleted: true,
  usageAccessGranted: true,
  overlayPermissionGranted: true,
  accessibilityServiceGranted: true,
  updatedAt: new Date().toISOString(),
};

const TilContext = createContext<TilContextType | null>(null);

export const TilProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<TrackedApp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_apps');
      return saved ? JSON.parse(saved) : DEFAULT_APPS;
    } catch {
      return DEFAULT_APPS;
    }
  });

  const [usage, setUsage] = useState<Record<number, DailyUsage>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_usage');
      return saved ? JSON.parse(saved) : DEFAULT_USAGE;
    } catch {
      return DEFAULT_USAGE;
    }
  });

  const [settings, setSettings] = useState<GlobalSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeSession, setActiveSession] = useState<ManualSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTimestamp, setCurrentTimestamp] = useState<number>(() => Date.now());
  const [activeLockedApp, setActiveLockedApp] = useState<ComputedAppUsage | null>(null);
  const [resetSeconds, setResetSeconds] = useState<number>(getSecondsToMidnight());

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_apps', JSON.stringify(apps));
    } catch (e) {
      console.warn('Failed to save apps to localStorage', e);
    }
  }, [apps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_usage', JSON.stringify(usage));
    } catch (e) {
      console.warn('Failed to save usage to localStorage', e);
    }
  }, [usage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_active_session', JSON.stringify(activeSession));
    } catch (e) {
      console.warn('Failed to save activeSession to localStorage', e);
    }
  }, [activeSession]);

  // Tick clock for countdown and active manual session
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Date.now());
      setResetSeconds(getSecondsToMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSessionElapsed = useMemo(() => {
    if (!activeSession) return 0;
    const startTimestamp = new Date(activeSession.startedAt).getTime();
    return Math.max(0, Math.floor((currentTimestamp - startTimestamp) / 1000));
  }, [activeSession, currentTimestamp]);

  // Compute usage for each app
  const computedApps: ComputedAppUsage[] = useMemo(() => {
    const today = getLocalDateString();

    return apps.map((app) => {
      const appUsage = usage[app.id] || {
        trackedAppId: app.id,
        date: today,
        systemUsageSeconds: 0,
        manualUsageSeconds: 0,
        totalUsageSeconds: 0,
        lastSyncedAt: new Date().toISOString(),
      };

      // If active session is running for this app, add live elapsed
      const liveManual = (activeSession && activeSession.trackedAppId === app.id) ? activeSessionElapsed : 0;
      const effectiveUsedSeconds = appUsage.totalUsageSeconds + liveManual;

      const isLimitEnabled = app.dailyLimitSeconds > 0;
      const progressPercent = calculateProgress(effectiveUsedSeconds, app.dailyLimitSeconds);
      const remainingSeconds = calculateRemaining(effectiveUsedSeconds, app.dailyLimitSeconds);
      
      const rawStatus = getUsageStatus(effectiveUsedSeconds, app.dailyLimitSeconds);
      // If usage access is not granted, status is unverified for system tracked apps
      const status: UsageStatus = (!settings.usageAccessGranted && app.source === 'installed')
        ? 'unverified'
        : rawStatus;

      const isLocked = isLimitEnabled && (effectiveUsedSeconds >= app.dailyLimitSeconds);

      return {
        id: app.id,
        appName: app.appName,
        packageName: app.packageName,
        source: app.source,
        dailyLimitSeconds: app.dailyLimitSeconds,
        usedSeconds: effectiveUsedSeconds,
        remainingSeconds,
        progressPercent,
        status,
        isLimitEnabled,
        hasUsageData: effectiveUsedSeconds > 0,
        isLocked,
        systemUsageSeconds: appUsage.systemUsageSeconds,
        manualUsageSeconds: appUsage.manualUsageSeconds + liveManual,
        raw: app,
      };
    });
  }, [apps, usage, activeSession, activeSessionElapsed, settings.usageAccessGranted]);

  // Global usage summary
  const globalUsage: GlobalUsageSummary = useMemo(() => {
    const totalUsed = computedApps.reduce((acc, a) => acc + a.usedSeconds, 0);
    const limit = settings.dailyLimitSeconds;
    const isEnabled = settings.isEnabled;

    const progressPercent = isEnabled ? calculateProgress(totalUsed, limit) : 0;
    const remainingSeconds = isEnabled ? calculateRemaining(totalUsed, limit) : 0;
    const isReached = isEnabled && limit > 0 && totalUsed >= limit;
    
    let status: UsageStatus = 'normal';
    if (!settings.usageAccessGranted) {
      status = 'unverified';
    } else if (isReached) {
      status = 'reached';
    } else if (isEnabled && progressPercent >= 80) {
      status = 'warning';
    }

    return {
      isEnabled,
      dailyLimitSeconds: limit,
      usedSeconds: totalUsed,
      remainingSeconds,
      progressPercent,
      isReached,
      status,
    };
  }, [computedApps, settings]);

  const startManualTimer = useCallback((appId: number) => {
    const targetApp = apps.find(a => a.id === appId);
    if (!targetApp) return;

    const newSession: ManualSession = {
      id: Date.now(),
      trackedAppId: appId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationSeconds: 0,
      date: getLocalDateString(),
    };

    setActiveSession(newSession);
  }, [apps]);

  const stopManualTimer = useCallback(() => {
    if (!activeSession) return;

    const startTimestamp = new Date(activeSession.startedAt).getTime();
    const duration = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
    const today = getLocalDateString();
    const appId = activeSession.trackedAppId;

    setUsage(prev => {
      const existing = prev[appId] || {
        trackedAppId: appId,
        date: today,
        systemUsageSeconds: 0,
        manualUsageSeconds: 0,
        totalUsageSeconds: 0,
        lastSyncedAt: new Date().toISOString(),
      };

      const newManual = existing.manualUsageSeconds + duration;
      const newTotal = existing.systemUsageSeconds + newManual;

      return {
        ...prev,
        [appId]: {
          ...existing,
          manualUsageSeconds: newManual,
          totalUsageSeconds: newTotal,
          lastSyncedAt: new Date().toISOString(),
        },
      };
    });

    setActiveSession(null);
  }, [activeSession]);

  const updateAppLimit = useCallback((appId: number, dailyLimitSeconds: number) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, dailyLimitSeconds, updatedAt: new Date().toISOString() } : a));
  }, []);

  const removeTrackedApp = useCallback((appId: number): { success: boolean; message?: string } => {
    const computed = computedApps.find(a => a.id === appId);
    if (computed?.isLocked) {
      return {
        success: false,
        message: 'This app has reached its daily limit. It is locked and cannot be removed until the daily reset.',
      };
    }

    if (activeSession?.trackedAppId === appId) {
      setActiveSession(null);
    }

    setApps(prev => prev.filter(a => a.id !== appId));
    setUsage(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });

    return { success: true };
  }, [computedApps, activeSession]);

  const addTrackedApp = useCallback((params: {
    appName: string;
    packageName?: string | null;
    source: 'installed' | 'manual';
    dailyLimitSeconds: number;
  }) => {
    const newId = Date.now();
    const newApp: TrackedApp = {
      id: newId,
      appName: params.appName,
      packageName: params.packageName || null,
      iconUri: null,
      source: params.source,
      dailyLimitSeconds: params.dailyLimitSeconds,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApps(prev => [newApp, ...prev]);
    setUsage(prev => ({
      ...prev,
      [newId]: {
        trackedAppId: newId,
        date: getLocalDateString(),
        systemUsageSeconds: 0,
        manualUsageSeconds: 0,
        totalUsageSeconds: 0,
        lastSyncedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const updateGlobalSettings = useCallback((partial: Partial<GlobalSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const simulateUsage = useCallback((appId: number, additionalSeconds: number) => {
    const today = getLocalDateString();
    setUsage(prev => {
      const existing = prev[appId] || {
        trackedAppId: appId,
        date: today,
        systemUsageSeconds: 0,
        manualUsageSeconds: 0,
        totalUsageSeconds: 0,
        lastSyncedAt: new Date().toISOString(),
      };

      const newSystem = existing.systemUsageSeconds + additionalSeconds;
      const newTotal = newSystem + existing.manualUsageSeconds;

      return {
        ...prev,
        [appId]: {
          ...existing,
          systemUsageSeconds: newSystem,
          totalUsageSeconds: newTotal,
          lastSyncedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const simulateDailyReset = useCallback(() => {
    const today = getLocalDateString();
    setUsage(prev => {
      const reset: Record<number, DailyUsage> = {};
      Object.keys(prev).forEach(keyStr => {
        const id = Number(keyStr);
        reset[id] = {
          trackedAppId: id,
          date: today,
          systemUsageSeconds: 0,
          manualUsageSeconds: 0,
          totalUsageSeconds: 0,
          lastSyncedAt: new Date().toISOString(),
        };
      });
      return reset;
    });
    setActiveSession(null);
    setActiveLockedApp(null);
  }, []);

  const deleteAllLocalData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY + '_apps');
    localStorage.removeItem(STORAGE_KEY + '_usage');
    localStorage.removeItem(STORAGE_KEY + '_settings');
    localStorage.removeItem(STORAGE_KEY + '_active_session');

    setApps([]);
    setUsage({});
    setActiveSession(null);
    setActiveLockedApp(null);
    setSettings({
      dailyLimitSeconds: 0,
      isEnabled: false,
      onboardingCompleted: false,
      usageAccessGranted: false,
      overlayPermissionGranted: false,
      accessibilityServiceGranted: false,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const todayDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const value: TilContextType = {
    apps: computedApps,
    rawApps: apps,
    globalUsage,
    settings,
    activeSession,
    activeSessionElapsed,
    activeLockedApp,
    setActiveLockedApp,
    resetSeconds,
    todayDateFormatted,
    startManualTimer,
    stopManualTimer,
    updateAppLimit,
    removeTrackedApp,
    addTrackedApp,
    updateGlobalSettings,
    simulateUsage,
    simulateDailyReset,
    deleteAllLocalData,
  };

  return <TilContext.Provider value={value}>{children}</TilContext.Provider>;
};

export function useTil() {
  const context = useContext(TilContext);
  if (!context) {
    throw new Error('useTil must be used within a TilProvider');
  }
  return context;
}
