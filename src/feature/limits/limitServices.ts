import type {
  TrackedApp,
  DailyUsage,
} from '@/db/repositories';

import {
  getEffectiveUsageSeconds,
} from '@/utils/effectiveUsage';

import {
  calculateProgress,
  calculateRemaining,
  getUsageStatus,
} from '@/utils/usage';

import type {
  TrackedAppUsage,
} from '@/types/dashboard';

export function buildTrackedAppUsage(
  app: TrackedApp,
  usage: DailyUsage | null
): TrackedAppUsage {

  const isLimitEnabled =
    app.dailyLimitSeconds > 0;

  const usedSeconds =
    getEffectiveUsageSeconds(
      app,
      usage
    );

  const remainingSeconds =
    isLimitEnabled
      ? calculateRemaining(
          usedSeconds,
          app.dailyLimitSeconds
        )
      : 0;

  const progressPercent =
    isLimitEnabled
      ? calculateProgress(
          usedSeconds,
          app.dailyLimitSeconds
        )
      : 0;

  const status =
    isLimitEnabled
      ? getUsageStatus(
          usedSeconds,
          app.dailyLimitSeconds
        )
      : 'normal';

  return {
    id: app.id,

    appName:
      app.appName,

    packageName:
      app.packageName,

    source:
      app.source,

    dailyLimitSeconds:
      app.dailyLimitSeconds,

    usedSeconds,

    remainingSeconds,

    progressPercent,

    status,

    isLimitEnabled,

    hasUsageData:
      usage !== null,
  };
}