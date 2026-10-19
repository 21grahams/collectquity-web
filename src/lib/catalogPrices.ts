import { formatMoney } from './format';

export const shortPrinting = (p: string) => p.replace('Holofoil', 'Holo').replace('1st Edition', '1st Ed.');

/** The lowest price, flagged "from" when printings differ; null with no price today. */
export function lowestPrice(prices: Record<string, number>): { amount: string; from: boolean } | null {
  const values = Object.values(prices);
  if (!values.length) return null;
  const low = Math.min(...values);

  return { amount: formatMoney(low), from: Math.max(...values) !== low };
}

/** "Normal $1.20 · Reverse Holo $6.80", cheapest first; null with fewer than two printings priced. */
export function pricesByPrinting(prices: Record<string, number>): string | null {
  const entries = Object.entries(prices).sort(([, a], [, b]) => a - b);
  if (entries.length < 2) return null;

  return entries.map(([printing, price]) => `${shortPrinting(printing)} ${formatMoney(price)}`).join(' · ');
}
