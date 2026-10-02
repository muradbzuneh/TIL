export type PermissionStatus = {
  usageAccess: boolean;
  overlay: boolean;
};

export interface PermissionService {
  getPermissionStatus(): PermissionStatus;

  isUsageAccessGranted(): boolean;

  openUsageAccessSettings(): void;

  isOverlayPermissionGranted(): boolean;

  openOverlaySettings(): void;
}