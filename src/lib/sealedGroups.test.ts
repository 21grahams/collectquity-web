import type { SealedItem } from '../api/types';

import { describe, expect, it } from 'vitest';

import { groupSealed, groupSummary, soldSummary } from './sealedGroups';

function item(overrides: Partial<SealedItem>): SealedItem {
  return {
    id: 1,
    name: 'S&V 151 ETB',
    quantity: 1,
    purchaseDate: '2026-03-18',
    totalCost: 712,
    fees: 0,
    feeUnits: 0,
    holdId: 1,
    holdName: 'Long Hold',
    holdNumber: null,
    holdStatus: 'long',
    unitValue: 480.21,
    quarterUnitValues: [620, 602, 480.21, null],
    ...overrides,
  };
}

const short = (
  id: number,
  n: number,
  status: 'current' | 'historical',
  overrides: Partial<SealedItem> = {},
) =>
  item({ id, holdId: 100 + n, holdName: `Short Hold ${n}`, holdNumber: n, holdStatus: status, ...overrides });

describe('groupSealed', () => {
  it('puts Long Hold first, then Short Holds newest to oldest', () => {
    const groups = groupSealed([
      short(5, 1, 'historical'),
      item({ id: 1 }),
      short(6, 14, 'current'),
      short(7, 13, 'historical'),
      item({ id: 2, name: 'Prismatic ETB' }),
    ]);
    expect(groups.map((g) => g.name)).toEqual([
      'Long Hold',
      'Short Hold 14',
      'Short Hold 13',
      'Short Hold 1',
    ]);
    expect(groups[0]!.items.map((i) => i.id)).toEqual([2, 1]); // newest added first
    expect(groups[1]!.status).toBe('current');
  });
});

describe('groupSummary', () => {
  it('shows units and value for Long Hold, like every hold', () => {
    const [long] = groupSealed([
      item({ quantity: 1, unitValue: 480.21 }),
      item({ id: 2, quantity: 6, unitValue: 139.63 }),
    ]);
    expect(groupSummary(long!)).toBe('7 units · $1,317.99');
  });

  it('shows the chosen percentage instead when below 100%', () => {
    const [long] = groupSealed([item({ quantity: 2, unitValue: 100 })]);
    expect(groupSummary(long!, 70)).toBe('2 units · $140.00 @70%');
  });

  it('shows units and value for Short Holds', () => {
    const [g] = groupSealed([short(1, 14, 'current', { quantity: 6, unitValue: 72.38 })]);
    expect(groupSummary(g!)).toBe('6 units · $434.28');
  });
});

describe('soldSummary', () => {
  it('shows units and the sale total', () => {
    const [g] = groupSealed([short(1, 14, 'historical', { quantity: 15, unitValue: 50 })]);
    expect(soldSummary(g!, 1000)).toBe('15 units · Sold $1,000.00');
  });
  it('says "unit" for one', () => {
    const [g] = groupSealed([short(1, 15, 'historical', { quantity: 1, unitValue: 50 })]);
    expect(soldSummary(g!, 200)).toBe('1 unit · Sold $200.00');
  });
});
