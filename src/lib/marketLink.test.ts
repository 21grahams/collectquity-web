import type { MarketLink } from '../api/types';

import { describe, expect, it } from 'vitest';

import { findLink, isGradedLink, marketStatus } from './marketLink';

const link = (over: Partial<MarketLink> = {}): MarketLink => ({
  singleId: 1,
  sealedItemId: null,
  tcgplayerId: '42382',
  printing: 'Holofoil',
  productName: 'Charizard 004/102',
  pinned: false,
  gradedBasis: 'long_term',
  lastRunAt: '2026-10-12T12:00:05Z',
  lastStatus: 'updated',
  recentUnitValue: null,
  longTermUnitValue: null,
  imageUrl: null,
  ...over,
});

describe('marketStatus', () => {
  it('says today when the last run was on the server’s today (Denver)', () => {
    expect(marketStatus(link(), '2026-10-12')).toBe('Auto · updated today');
  });
  it('uses the Denver day, not UTC', () => {
    // 2026-10-13 03:00 UTC is still the evening of the 12th in Denver.
    expect(marketStatus(link({ lastRunAt: '2026-10-13T03:00:00Z' }), '2026-10-12')).toBe(
      'Auto · updated today',
    );
  });
  it('shows the date for older runs', () => {
    expect(marketStatus(link(), '2026-10-14')).toBe('Auto · updated 10/12');
  });
  it('explains runs that found no price', () => {
    expect(marketStatus(link({ lastStatus: 'no_price' }), '2026-10-12')).toBe('Auto · no price today');
    expect(marketStatus(link({ lastStatus: 'error' }), '2026-10-12')).toBe("Auto · couldn't update today");
    expect(marketStatus(link({ lastStatus: 'not_found' }), '2026-10-12')).toBe('Auto · product not found');
  });
  it('covers new and pinned links', () => {
    expect(marketStatus(link({ lastRunAt: null, lastStatus: null }), '2026-10-12')).toBe(
      'Auto · first update tomorrow morning',
    );
    expect(marketStatus(link({ pinned: true }), '2026-10-12')).toBe('Manual · auto paused');
  });
});

describe('links', () => {
  it('knows graded links by their reference prices', () => {
    expect(isGradedLink(link())).toBe(false);
    expect(isGradedLink(link({ longTermUnitValue: 727.5 }))).toBe(true);
  });
  it('finds an item’s link by kind', () => {
    const sealed = link({ singleId: null, sealedItemId: 1 });
    expect(findLink([link(), sealed], { sealedItemId: 1 })).toBe(sealed);
    expect(findLink([sealed], { singleId: 1 })).toBeUndefined();
  });
});
