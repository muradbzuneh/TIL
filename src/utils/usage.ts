import { WARNING_THRESHOLD_PERCENT } from '@/constants/limits';
import type { UsageStatus } from '@/types/usage';

export function calculateProgress(
  usedSeconds: number,
  limitSeconds: number
): number {
  if (limitSeconds <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, (usedSeconds / limitSeconds) * 100)
  );
}

export function calculateRemaining(
  usedSeconds: number,
  limitSeconds: number
): number {
  return Math.max(0, limitSeconds - usedSeconds);
}

export function getUsageStatus(
  usedSeconds: number,
  limitSeconds: number
): UsageStatus {
  if (limitSeconds <= 0) {
    return 'normal';
  }

  if (usedSeconds >= limitSeconds) {
    return 'reached';
  }

  const percentage = calculateProgress(
    usedSeconds,
    limitSeconds
  );

  if (percentage >= WARNING_THRESHOLD_PERCENT) {
    return 'warning';
  }

  return 'normal';
}