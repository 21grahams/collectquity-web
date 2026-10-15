import type { Sections } from '../api/types';

export const TABS = [
  { path: '/singles', label: 'Singles' },
  { path: '/sealed', label: 'Sealed' },
  { path: '/summary', label: 'Summary' },
  { path: '/accounts', label: 'Accounts' },
] as const;

/** The tabs this user tracks; Summary always shows. */
export function visibleTabs(sections: Sections) {
  return TABS.filter(
    (t) =>
      (t.path !== '/singles' || sections.tracksSingles) &&
      (t.path !== '/sealed' || sections.tracksSealed) &&
      (t.path !== '/accounts' || sections.usesAccounts),
  );
}
