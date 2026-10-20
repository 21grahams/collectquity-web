import { describe, expect, it } from 'vitest';

import { activeThisWeek, lastOpenedLabel } from './admin';

describe('admin labels', () => {
  it('says when someone last opened the app', () => {
    expect(lastOpenedLabel('2026-10-19', '2026-10-19')).toBe('today');
    expect(lastOpenedLabel('2026-10-18', '2026-10-19')).toBe('yesterday');
    expect(lastOpenedLabel('2026-10-14', '2026-10-19')).toBe('10/14');
    expect(lastOpenedLabel(null, '2026-10-19')).toBe('not yet');
  });
  it('counts the last seven days as this week', () => {
    expect(activeThisWeek('2026-10-13', '2026-10-19')).toBe(true);
    expect(activeThisWeek('2026-10-12', '2026-10-19')).toBe(false);
    expect(activeThisWeek(null, '2026-10-19')).toBe(false);
  });
});
