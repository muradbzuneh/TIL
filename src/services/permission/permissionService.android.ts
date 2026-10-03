import TilAndroid from '../../../modules/til-android';

import type {
  PermissionService,
  PermissionStatus,
} from './permissionService';

class AndroidPermissionService
  implements PermissionService {

  getPermissionStatus(): PermissionStatus {
    return {
      usageAccess:
        this.isUsageAccessGranted(),
      overlay:
        this.isOverlayPermissionGranted(),
      accessibility:
        this.isAccessibilityServiceEnabled(),
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

  isAccessibilityServiceEnabled(): boolean {
    return TilAndroid.isAccessibilityServiceEnabled();
  }

  openAccessibilitySettings(): void {
    TilAndroid.openAccessibilitySettings();
  }
}

export const permissionService =
  new AndroidPermissionService();
