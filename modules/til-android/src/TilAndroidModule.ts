import { requireNativeModule } from 'expo-modules-core';

export type NativeInstalledApp = {
  packageName: string;
  appName: string;
  iconResourceId: number;
};

export type TilAndroidModuleType = {
  isUsageAccessGranted(): boolean;

  openUsageAccessSettings(): void;

  isOverlayPermissionGranted(): boolean;

  openOverlaySettings(): void;

  getInstalledApps(): NativeInstalledApp[];

  isPackageInstalled(packageName: string): boolean;
};

const TilAndroid =
  requireNativeModule<TilAndroidModuleType>('TilAndroid');

export default TilAndroid;