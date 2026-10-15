import type { MarketLink } from '../api/types';

import { formatDate } from './format';

/** The Denver calendar day of a timestamp, "YYYY-MM-DD" (the same day the server calls today). */
function denverDay(timestamp: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver' }).format(new Date(timestamp));
}

/** "Auto · updated today", "Manual · auto paused", … for the line under a card's numbers. */
export function marketStatus(link: MarketLink, today: string): string {
  if (link.pinned) return 'Manual · auto paused';
  if (!link.lastRunAt || !link.lastStatus) return 'Auto · first update tomorrow morning';
  const day = denverDay(link.lastRunAt);
  const when = day === today ? 'today' : formatDate(day).slice(0, 5);

  switch (link.lastStatus) {
    case 'updated':
      return `Auto · updated ${when}`;
    case 'no_price':
      return `Auto · no price ${when}`;
    case 'not_found':
      return 'Auto · product not found';
    case 'error':
      return `Auto · couldn't update ${when}`;
  }
}

export const isGradedLink = (link: MarketLink) =>
  link.recentUnitValue != null || link.longTermUnitValue != null;

export function findLink(
  links: MarketLink[] | undefined,
  item: { singleId: number } | { sealedItemId: number },
) {
  return (links ?? []).find((l) =>
    'singleId' in item ? l.singleId === item.singleId : l.sealedItemId === item.sealedItemId,
  );
}

/** Linked and not paused: the market value updates itself daily. */
export function isAuto(
  links: MarketLink[] | undefined,
  item: { singleId: number } | { sealedItemId: number },
) {
  const link = findLink(links, item);

  return !!link && !link.pinned;
}

/** Auto-updated with a fresh price today (shown as a small "live" dot on the card). */
export function updatedToday(link: MarketLink | undefined, today: string) {
  return (
    !!link &&
    !link.pinned &&
    link.lastStatus === 'updated' &&
    !!link.lastRunAt &&
    denverDay(link.lastRunAt) === today
  );
}
