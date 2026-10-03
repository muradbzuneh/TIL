import type {
  UsageStatus,
} from './usage';

export type TrackedAppUsage = {
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
};

export type GlobalUsageSummary = {
  isEnabled: boolean;

  dailyLimitSeconds: number;

  usedSeconds: number;

  remainingSeconds: number;

  progressPercent: number;

  isReached: boolean;

  status: UsageStatus;
};

export type DashboardSummary = {
  date: string;

  apps: TrackedAppUsage[];

  global: GlobalUsageSummary;

  trackedAppCount: number;

  activeManualTimerCount: number;

  usageAccessGranted: boolean;

  lastUpdatedAt: string;
};