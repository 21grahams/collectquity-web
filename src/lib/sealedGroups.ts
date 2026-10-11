import type { HoldStatus, SealedItem } from '../api/types';

import { totals } from './cardMath';
import { formatMoney } from './format';
import { newestFirst } from './singlesFilter';

export interface SealedGroup {
  holdId: number;
  name: string;
  status: HoldStatus;
  items: SealedItem[];
}

export function groupSealed(items: readonly SealedItem[]): SealedGroup[] {
  const groups = new Map<number, SealedGroup>();
  for (const item of items) {
    let group = groups.get(item.holdId);
    if (!group) {
      group = { holdId: item.holdId, name: item.holdName, status: item.holdStatus, items: [] };
      groups.set(item.holdId, group);
    }
    group.items.push(item);
  }
  const rank = (g: SealedGroup) => (g.status === 'long' ? -1 : 0);
  const number = (g: SealedGroup) => g.items[0]?.holdNumber ?? 0;

  return [...groups.values()]
    .sort((a, b) => rank(a) - rank(b) || number(b) - number(a))
    .map((g) => ({ ...g, items: newestFirst(g.items) }));
}

const unitsLabel = (n: number) => `${n} unit${n !== 1 ? 's' : ''}`;

export function groupSummary(group: SealedGroup, valuePct = 100): string {
  const t = totals(group.items, { valuePct });
  const base = `${unitsLabel(t.units)} · ${formatMoney(t.totalValue)}`;

  return valuePct < 100 ? `${base} @${valuePct}%` : base;
}

/** A completed hold's header: the real sale total instead of a stale market value. */
export function soldSummary(group: SealedGroup, soldPrice: number): string {
  return `${unitsLabel(totals(group.items).units)} · Sold ${formatMoney(soldPrice)}`;
}
