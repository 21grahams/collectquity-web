import type { Summary } from '../api/types';

/** Without the short/long split, sealed is just "Sealed" and short holds aren't mentioned. */
export function realizedProfitLabel(
  s: Pick<Summary, 'longHoldSales' | 'singlesSales' | 'completedHoldCount'>,
  splitsSealed = true,
) {
  const parts: string[] = [];
  if (s.singlesSales.hasSales) parts.push('Singles');
  if (s.longHoldSales.hasSales) parts.push(splitsSealed ? 'Long Hold' : 'Sealed');
  if (splitsSealed && s.completedHoldCount > 0) parts.push(`Short Holds 1–${s.completedHoldCount}`);

  return parts.length ? `Realized Profit — ${parts.join(' + ')}` : 'Realized Profit';
}

export function returnPct(box: { gain: number; spent: number }): number {
  return box.spent > 0 ? (box.gain / box.spent) * 100 : 0;
}
