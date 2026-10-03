export type PermissionStatus = {
  usageAccess: boolean;
  overlay: boolean;
  accessibility: boolean;
};

export interface PermissionService {
  getPermissionStatus(): PermissionStatus;

  isUsageAccessGranted(): boolean;

  openUsageAccessSettings(): void;

  isOverlayPermissionGranted(): boolean;

  openOverlaySettings(): void;

  /**
   * Required for blocking apps that reached
   * their daily limit.
   */
  isAccessibilityServiceEnabled(): boolean;

  openAccessibilitySettings(): void;
}
