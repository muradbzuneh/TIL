import TilAndroid from '../../../modules/til-android';

import type {
  AppUsageResult,
  BatchUsageResult,
  UsageService,
} from './usageService';

class AndroidUsageService
  implements UsageService
{
  isUsageAccessGranted(): boolean {
    return TilAndroid.isUsageAccessGranted();
  }

  getTodayUsage(
    packageName: string
  ): AppUsageResult {
    return TilAndroid.getTodayUsage(
      packageName
    );
  }

  getTodayUsageForPackages(
    packageNames: string[]
  ): BatchUsageResult {
    return TilAndroid.getTodayUsageForPackages(
      packageNames
    );
  }
}

export const usageService =
  new AndroidUsageService();