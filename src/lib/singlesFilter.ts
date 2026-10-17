import type { Single } from '../api/types';

export interface SinglesFilters {
  pokemon: string;
  setName: string;
  condition: string;
  dateFrom: string;
  dateTo: string;
}

export const emptyFilters: SinglesFilters = {
  pokemon: '',
  setName: '',
  condition: '',
  dateFrom: '',
  dateTo: '',
};

export const sameFilters = (a: SinglesFilters, b: SinglesFilters) =>
  (Object.keys(emptyFilters) as (keyof SinglesFilters)[]).every((k) => a[k] === b[k]);

export const newestFirst = <T extends { id: number }>(items: readonly T[]): T[] =>
  [...items].sort((a, b) => b.id - a.id);

export function filterSingles(singles: readonly Single[], search: string, f: SinglesFilters): Single[] {
  const q = search.trim().toLowerCase();

  return newestFirst(singles).filter((s) => {
    if (q && !s.displayName.toLowerCase().includes(q)) return false;
    if (f.pokemon && s.pokemon !== f.pokemon) return false;
    if (f.setName && s.setName !== f.setName) return false;
    if (f.condition && s.condition !== f.condition) return false;
    // ISO dates compare correctly as strings, with no time-zone surprises.
    if (f.dateFrom && (!s.purchaseDate || s.purchaseDate < f.dateFrom)) return false;
    if (f.dateTo && (!s.purchaseDate || s.purchaseDate > f.dateTo)) return false;

    return true;
  });
}

export function activeFilterCount(f: SinglesFilters): number {
  return [f.pokemon, f.setName, f.condition, f.dateFrom || f.dateTo].filter(Boolean).length;
}

export function filterOptions(singles: readonly Single[]) {
  const uniq = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  return {
    pokemon: uniq(singles.map((s) => s.pokemon)),
    setName: uniq(singles.map((s) => s.setName)),
    condition: uniq(singles.map((s) => s.condition)),
  };
}
