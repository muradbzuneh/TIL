export type AppUsageResult = {
  packageName: string;
  usageSeconds: number;
  hasUsageAccess: boolean;
  startTimeMillis: number;
  endTimeMillis: number;
  queriedAtMillis: number;
};

export type BatchUsageResult = {
  hasUsageAccess: boolean;
  startTimeMillis: number;
  endTimeMillis: number;
  queriedAtMillis: number;

  apps: {
    packageName: string;
    usageSeconds: number;
  }[];
};

export interface UsageService {
  isUsageAccessGranted(): boolean;

  getTodayUsage(
    packageName: string
  ): AppUsageResult;

  getTodayUsageForPackages(
    packageNames: string[]
  ): BatchUsageResult;
}