export type InstalledApp = {
  packageName: string;
  appName: string;
  iconResourceId: number;
};

export interface InstalledAppsService {
  getInstalledApps(): InstalledApp[];

  isPackageInstalled(packageName: string): boolean;
}