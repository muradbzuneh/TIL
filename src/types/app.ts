export type AppSource = 'installed' | 'manual';

export type TrackedApp = {
  id: number;
  packageName: string | null;
  appName: string;
  iconUri: string | null;
  source: AppSource;
  dailyLimitSeconds: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};