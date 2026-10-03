import type { TrackedApp, DailyUsage } from '@/db/repositories';

/**
 * Returns the usage that TIL should use for limit calculations.
 *
 * V1 rule:
 *
 * Installed app with a package name:
 *   Android system usage is authoritative.
 *
 * Manual-only app:
 *   Manual timer usage is authoritative.
 */
export function getEffectiveUsageSeconds(
  app: TrackedApp,
  usage: DailyUsage | null
): number {
  if (!usage) {
    return 0;
  }

  if (app.packageName) {
    return Math.max(
      0,
      usage.systemUsageSeconds
    );
  }

  return Math.max(
    0,
    usage.manualUsageSeconds
  );
}