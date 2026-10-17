import type { Single } from '../api/types';

import { describe, expect, it } from 'vitest';

import { activeFilterCount, emptyFilters, filterOptions, filterSingles, sameFilters } from './singlesFilter';

function single(overrides: Partial<Single>): Single {
  return {
    id: 1,
    pokemon: 'Marill',
    setName: 'Southern Islands',
    condition: 'LP',
    extra: '',
    displayName: 'Marill - Southern Islands - LP',
    quantity: 1,
    purchaseDate: '2026-03-28',
    totalCost: 88.39,
    fees: 0,
    feeUnits: 0,
    unitValue: 88.02,
    quarterUnitValues: [null, null, 88.02, null],
    ...overrides,
  };
}

const cards = [
  single({ id: 1 }),
  single({
    id: 2,
    pokemon: 'Bulbasaur',
    setName: '151',
    condition: 'NM',
    displayName: 'Bulbasaur - 151 - NM',
    purchaseDate: '2026-05-01',
  }),
  single({
    id: 3,
    pokemon: 'Bulbasaur',
    setName: 'Base',
    condition: 'PSA 10',
    displayName: 'Bulbasaur - Base - PSA 10',
    purchaseDate: '2026-09-30',
  }),
];
const ids = (list: Single[]) => list.map((s) => s.id);

describe('filterSingles', () => {
  it('lists newest-added first', () => {
    expect(ids(filterSingles([cards[0]!, cards[2]!, cards[1]!], '', emptyFilters))).toEqual([3, 2, 1]);
  });

  it('searches the full name, case-insensitively', () => {
    expect(ids(filterSingles(cards, 'bulba', emptyFilters))).toEqual([3, 2]);
    expect(ids(filterSingles(cards, ' psa ', emptyFilters))).toEqual([3]);
    expect(ids(filterSingles(cards, '', emptyFilters))).toEqual([3, 2, 1]);
  });

  it('matches Pokémon / Set / Condition exactly, and combines with search', () => {
    expect(ids(filterSingles(cards, '', { ...emptyFilters, pokemon: 'Bulbasaur' }))).toEqual([3, 2]);
    expect(ids(filterSingles(cards, '', { ...emptyFilters, setName: '151' }))).toEqual([2]);
    expect(ids(filterSingles(cards, 'base', { ...emptyFilters, pokemon: 'Bulbasaur' }))).toEqual([3]);
  });

  it('filters an inclusive purchase-date range', () => {
    const f = { ...emptyFilters, dateFrom: '2026-05-01', dateTo: '2026-09-30' };
    expect(ids(filterSingles(cards, '', f))).toEqual([3, 2]);
    expect(ids(filterSingles(cards, '', { ...emptyFilters, dateTo: '2026-04-30' }))).toEqual([1]);
  });
});

describe('activeFilterCount and filterOptions', () => {
  it('counts set filters (a date range counts once)', () => {
    expect(activeFilterCount(emptyFilters)).toBe(0);
    expect(
      activeFilterCount({ ...emptyFilters, pokemon: 'Marill', dateFrom: '2026-01-01', dateTo: '2026-02-01' }),
    ).toBe(2);
  });

  it('lists the values that exist, sorted and de-duplicated', () => {
    expect(filterOptions(cards)).toEqual({
      pokemon: ['Bulbasaur', 'Marill'],
      setName: ['151', 'Base', 'Southern Islands'],
      condition: ['LP', 'NM', 'PSA 10'],
    });
  });
});

describe('sameFilters', () => {
  it('is true only when every filter matches', () => {
    expect(sameFilters(emptyFilters, { ...emptyFilters })).toBe(true);
    expect(sameFilters(emptyFilters, { ...emptyFilters, condition: 'NM' })).toBe(false);
    expect(
      sameFilters({ ...emptyFilters, dateFrom: '2026-01-01' }, { ...emptyFilters, dateFrom: '2026-01-01' }),
    ).toBe(true);
  });
});
