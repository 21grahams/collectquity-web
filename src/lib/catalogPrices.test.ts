import { describe, expect, it } from 'vitest';

import { lowestPrice, pricesByPrinting } from './catalogPrices';

describe('catalog prices', () => {
  it('shows one price, the lowest across printings, or nothing', () => {
    expect(lowestPrice({ Holofoil: 4.5 })).toEqual({ amount: '$4.50', from: false });
    expect(lowestPrice({ Normal: 1.2, 'Reverse Holofoil': 6.8 })).toEqual({ amount: '$1.20', from: true });
    expect(lowestPrice({ Normal: 2, Holofoil: 2 })).toEqual({ amount: '$2.00', from: false });
    expect(lowestPrice({})).toBeNull();
  });
  it('lists each printing, cheapest first, only when there are several', () => {
    expect(pricesByPrinting({ 'Reverse Holofoil': 6.8, Normal: 1.2 })).toBe(
      'Normal $1.20 · Reverse Holo $6.80',
    );
    expect(pricesByPrinting({ Holofoil: 4.5 })).toBeNull();
  });
});
