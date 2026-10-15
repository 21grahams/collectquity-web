import { describe, expect, it } from 'vitest';

import { visibleTabs } from './tabs';

const all = { tracksSingles: true, tracksSealed: true, splitsSealed: true, usesAccounts: true };
const paths = (sections: typeof all) => visibleTabs(sections).map((t) => t.path);

describe('visibleTabs', () => {
  it('shows every tab when everything is on', () => {
    expect(paths(all)).toEqual(['/singles', '/sealed', '/summary', '/accounts']);
  });
  it('hides what the user turned off, always keeping Summary', () => {
    expect(paths({ ...all, tracksSingles: false, usesAccounts: false })).toEqual(['/sealed', '/summary']);
    expect(paths({ ...all, tracksSealed: false, usesAccounts: false })).toEqual(['/singles', '/summary']);
  });
});
