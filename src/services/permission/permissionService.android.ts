import TilAndroid from '../../../modules/til-android';

import type {
  PermissionService,
  PermissionStatus,
} from './permissionService';

class AndroidPermissionService implements PermissionService {

  getPermissionStatus(): PermissionStatus {
    return {
      usageAccess: this.isUsageAccessGranted(),
      overlay: this.isOverlayPermissionGranted(),
    };
  }

  isUsageAccessGranted(): boolean {
    return TilAndroid.isUsageAccessGranted();
  }

  openUsageAccessSettings(): void {
    TilAndroid.openUsageAccessSettings();
  }

  isOverlayPermissionGranted(): boolean {
    return TilAndroid.isOverlayPermissionGranted();
  }

  openOverlaySettings(): void {
    TilAndroid.openOverlaySettings();
  }
}

export const permissionService =
  new AndroidPermissionService();