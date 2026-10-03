import { requireNativeModule } from 'expo-modules-core';

export type NativeInstalledApp = {
  packageName: string;
  appName: string;
  iconResourceId: number;
};

export type NativeUsageResult = {
  packageName: string;
  usageSeconds: number;
  hasUsageAccess: boolean;
  startTimeMillis: number;
  endTimeMillis: number;
  queriedAtMillis: number;
};

export type NativeBatchUsageResult = {
  hasUsageAccess: boolean;
  startTimeMillis: number;
  endTimeMillis: number;
  queriedAtMillis: number;
  apps: {
    packageName: string;
    usageSeconds: number;
  }[];
};

export type TilAndroidModuleType = {
  isUsageAccessGranted(): boolean;

  openUsageAccessSettings(): void;

  isOverlayPermissionGranted(): boolean;

  openOverlaySettings(): void;

  getInstalledApps(): NativeInstalledApp[];

  isPackageInstalled(packageName: string): boolean;

  getTodayUsage(packageName: string): NativeUsageResult;

  getTodayUsageForPackages(
    packageNames: string[]
  ): NativeBatchUsageResult;

  setLockedApps(lockedApps: string[]): void;

  isAccessibilityServiceEnabled(): boolean;

  openAccessibilitySettings(): void;
};

const TilAndroid =
  requireNativeModule<TilAndroidModuleType>('TilAndroid');

export default TilAndroid;
