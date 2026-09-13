const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/** Clock display: `m:ss`, widening to `h:mm:ss` past an hour. */
export function formatDuration(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / MS_PER_SECOND));
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

/** Same clock, but a missing record reads as an em dash rather than 0:00. */
export function formatBestTime(bestTimeMs: number | null | undefined): string {
  if (bestTimeMs === null || bestTimeMs === undefined) return '—';
  return formatDuration(bestTimeMs);
}

/** Spoken form for screen readers: "3 minutes 5 seconds". */
export function describeDuration(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / MS_PER_SECOND));
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);

  const parts: string[] = [];
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
  return parts.join(' ');
}
