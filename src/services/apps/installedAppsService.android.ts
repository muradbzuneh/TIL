import TilAndroid from '../../../modules/til-android';

import type {
  InstalledApp,
  InstalledAppsService,
} from './installedAppsService';

class AndroidInstalledAppsService
  implements InstalledAppsService
{
  getInstalledApps(): InstalledApp[] {
    return TilAndroid.getInstalledApps();
  }

  isPackageInstalled(packageName: string): boolean {
    return TilAndroid.isPackageInstalled(packageName);
  }
}

export const installedAppsService =
  new AndroidInstalledAppsService();