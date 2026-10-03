export type DailyUsage = {
  id: number;
  trackedAppId: number;
  date: string;
  systemUsageSeconds: number;
  manualUsageSeconds: number;
  totalUsageSeconds: number;
  lastSyncedAt: string | null;
};

export type UsageStatus =
  | 'normal'
  | 'warning'
  | 'reached';

export type SystemUsageSnapshot = {
  packageName: string;
  usageSeconds: number;
  hasUsageAccess: boolean;
  startTimeMillis: number;
  endTimeMillis: number;
  queriedAtMillis: number;
};