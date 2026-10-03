import type {
  UsageStatus,
} from '@/types/usage';

export function isUsageLocked(
  status: UsageStatus
): boolean {
  return status === 'reached';
}

export function canManageApp(
  status: UsageStatus
): boolean {
  return status !== 'reached';
}