import { formatDate } from './format';

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** "today", "yesterday", "10/14", or "not yet" (no open recorded since tracking began). */
export function lastOpenedLabel(day: string | null, today: string | undefined): string {
  if (!day) return 'not yet';
  if (today) {
    const ago = daysBetween(day, today);
    if (ago <= 0) return 'today';
    if (ago === 1) return 'yesterday';
  }

  return formatDate(day).slice(0, 5);
}

/** Opened within the last seven days, counting today. */
export const activeThisWeek = (day: string | null, today: string) => !!day && daysBetween(day, today) < 7;
