import {
  create,
} from 'zustand';

import {
  permissionService,
} from '@/services/permissions';

import type {
  PermissionStatus,
} from '@/services/permissions';

type PermissionsState = {
  status: PermissionStatus;
  refresh: () => void;
};

/**
 * Permission state is needed by several screens and
 * by the onboarding flow, so it lives in one store
 * instead of being re-read per screen.
 */
export const usePermissionsStore =
  create<PermissionsState>(
    (set) => ({
      status: {
        usageAccess: false,
        overlay: false,
        accessibility: false,
      },

      refresh: () => {

        try {
          set({
            status:
              permissionService.getPermissionStatus(),
          });
        } catch (error) {

          console.error(
            'Could not read permissions:',
            error
          );
        }
      },
    })
  );