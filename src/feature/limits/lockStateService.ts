import TilAndroid from '../../../modules/til-android';

import type {
  TrackedAppUsage,
} from '@/types/dashboard';

/**
 * Pushes the locked apps to the native layer.
 *
 * The accessibility service that blocks apps cannot
 * read SQLite, so the dashboard hands it the current
 * lock state every time it is rebuilt.
 *
 * Entries are "packageName|App name" so the blocking
 * screen can show a friendly label.
 */
export function applyLockState(
  apps: TrackedAppUsage[]
): void {

  const lockedApps =
    apps
      .filter(
        (app) =>
          app.isLocked &&
          app.packageName !== null
      )
      .map(
        (app) =>
          `${app.packageName}|${app.appName}`
      );

  try {
    TilAndroid.setLockedApps(lockedApps);
  } catch (error) {

    console.error(
      'Could not apply lock state:',
      error
    );
  }
}
