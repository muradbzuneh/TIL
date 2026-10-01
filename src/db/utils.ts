export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getSecondsUntilMidnight(
  now = new Date()
): number {
  const midnight = new Date(now);

  midnight.setHours(24, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((midnight.getTime() - now.getTime()) / 1000)
  );
}