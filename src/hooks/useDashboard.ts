import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  AppState,
} from 'react-native';

import {
  useDatabase,
} from '@/database/useDatabase';

import {
  buildDashboard,
} from '@/features/dashboard/dashboardService';

import type {
  DashboardSummary,
} from '@/types/dashboard';

export function useDashboard() {

  const db =
    useDatabase();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<
      DashboardSummary | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  /*
   * Silent load.
   *
   * No state is touched synchronously here, so the
   * effect below is allowed to call it directly.
   */
  const load =
    useCallback(
      () =>

        buildDashboard(db)

          .then((result) => {

            setError(null);

            setDashboard(result);
          })

          .catch((err) => {

            console.error(
              'Dashboard error:',
              err
            );

            setError(
              err instanceof Error
                ? err.message
                : 'Unable to load dashboard.'
            );
          })

          .finally(() => {

            setLoading(false);
          }),
      [db]
    );

  /*
   * Explicit refresh (pull to refresh, retry buttons).
   * Shows the spinner while it runs.
   */
  const refresh =
    useCallback(
      () => {

        setLoading(true);

        return load();
      },
      [load]
    );

  useEffect(() => {

    const subscription =
      AppState.addEventListener(
        'change',
        (state) => {

          if (
            state === 'active'
          ) {
            load();
          }
        }
      );

    load();

    return () =>
      subscription.remove();

  }, [load]);

  return {
    dashboard,
    loading,
    error,
    refresh,
  };
}
