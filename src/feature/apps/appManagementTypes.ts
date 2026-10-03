export type InstalledAppOption = {
  packageName: string;
  appName: string;
  iconUri: string | null;
};

export type LimitInput = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function limitInputToSeconds(
  input: LimitInput
): number {
  return (
    input.days * 24 * 60 * 60 +
    input.hours * 60 * 60 +
    input.minutes * 60 +
    input.seconds
  );
}

export function secondsToLimitInput(
  totalSeconds: number
): LimitInput {
  const seconds = Math.max(
    0,
    Math.floor(totalSeconds)
  );

  const days = Math.floor(
    seconds / 86400
  );

  const hours = Math.floor(
    (seconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds: remainingSeconds,
  };
}