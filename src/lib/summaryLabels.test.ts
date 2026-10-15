import { describe, expect, it } from 'vitest';

import { formatSignedPct } from './format';
import { realizedProfitLabel, returnPct } from './summaryLabels';

const sales = (hasSales: boolean) => ({ soldPrice: 0, profit: 0, markup: 0, margin: 0, hasSales });

describe('realizedProfitLabel', () => {
  it('lists every source that has sales, cards first then holds', () => {
    expect(
      realizedProfitLabel({ longHoldSales: sales(true), singlesSales: sales(true), completedHoldCount: 13 }),
    ).toBe('Realized Profit — Singles + Long Hold + Short Holds 1–13');
  });
  it('leaves out sources with no sales', () => {
    expect(
      realizedProfitLabel({ longHoldSales: sales(false), singlesSales: sales(true), completedHoldCount: 2 }),
    ).toBe('Realized Profit — Singles + Short Holds 1–2');
    expect(
      realizedProfitLabel({ longHoldSales: sales(false), singlesSales: sales(false), completedHoldCount: 1 }),
    ).toBe('Realized Profit — Short Holds 1–1');
  });
  it('calls sealed "Sealed" and skips short holds without the split', () => {
    expect(
      realizedProfitLabel(
        { longHoldSales: sales(true), singlesSales: sales(false), completedHoldCount: 0 },
        false,
      ),
    ).toBe('Realized Profit — Sealed');
    expect(
      realizedProfitLabel(
        { longHoldSales: sales(false), singlesSales: sales(false), completedHoldCount: 0 },
        false,
      ),
    ).toBe('Realized Profit');
    expect(
      realizedProfitLabel(
        { longHoldSales: sales(true), singlesSales: sales(false), completedHoldCount: 3 },
        false,
      ),
    ).toBe('Realized Profit — Sealed + Short Holds 1–3');
  });
});

describe('returnPct', () => {
  it('is gain over spent', () => {
    // Portfolio from the current app's screenshot: Spent $5,430.19, Gain $645.12 → +11.9%
    expect(formatSignedPct(returnPct({ gain: 645.12, spent: 5430.19 }))).toBe('+11.9%');
    expect(returnPct({ gain: 10, spent: 0 })).toBe(0);
  });
});
