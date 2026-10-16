import { describe, expect, it } from 'vitest';

import { combineSales } from './sales';

describe('combineSales', () => {
  it('sums sold and profit, and takes markup and margin from the totals', () => {
    const total = combineSales([
      { soldPrice: 342, profit: 124, costBasis: 218 },
      { soldPrice: 639, profit: 181.85, costBasis: 457.15 },
    ]);
    expect(total.soldPrice).toBe(981);
    expect(total.profit).toBe(305.85);
    expect(total.markup).toBeCloseTo(305.85 / 675.15);
    expect(total.margin).toBeCloseTo(305.85 / 981);
  });
  it('is all zeros with nothing sold', () => {
    expect(combineSales([])).toEqual({ soldPrice: 0, profit: 0, markup: 0, margin: 0 });
  });
});
