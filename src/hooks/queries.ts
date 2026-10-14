import type { CatalogProduct } from '../api/types';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import * as api from '../api';

export const queryKeys = {
  account: ['account'] as const,
  context: ['context'] as const,
  singles: ['singles'] as const,
  sealed: ['sealed'] as const,
  accounts: ['accounts'] as const,
  completedHolds: ['completedHolds'] as const,
  summary: ['summary'] as const,
  avatar: ['avatar'] as const,
  marketLinks: ['marketLinks'] as const,
};

// Approval almost never changes, so don't re-ask every time the app comes back to the front.
export const useAccount = (enabled: boolean) =>
  useQuery({ queryKey: queryKeys.account, queryFn: api.getAccount, enabled, staleTime: 60 * 60 * 1000 });

export const useAppContext = () => useQuery({ queryKey: queryKeys.context, queryFn: api.getContext });

export const useSingles = () => useQuery({ queryKey: queryKeys.singles, queryFn: api.listSingles });

export const useSealed = () => useQuery({ queryKey: queryKeys.sealed, queryFn: api.listSealed });

export const useAccounts = () => useQuery({ queryKey: queryKeys.accounts, queryFn: api.listAccounts });

export const useCompletedHolds = () =>
  useQuery({ queryKey: queryKeys.completedHolds, queryFn: api.listCompletedHolds });

export const useSummary = () => useQuery({ queryKey: queryKeys.summary, queryFn: api.getSummary });

export const useAvatarUrl = () => useQuery({ queryKey: queryKeys.avatar, queryFn: api.getAvatarUrl });

export const useMarketLinks = () =>
  useQuery({ queryKey: queryKeys.marketLinks, queryFn: api.listMarketLinks });

function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);

    return () => clearTimeout(timer);
  }, [value, ms]);

  return settled;
}

/**
 * Catalog matches for what's being typed (2+ characters), after a short pause in typing.
 * `searching` stays true until the matches for the current text are in.
 */
export function useCatalogSearch(kind: CatalogProduct['kind'], text: string, enabled = true) {
  const typed = text.trim();
  const query = useDebounced(typed, 250);
  const active = enabled && query.length >= 2;
  const result = useQuery({
    queryKey: ['catalog', kind, query.toLowerCase()],
    queryFn: () => api.searchCatalog(query, kind),
    enabled: active,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    products: query.length >= 2 ? (result.data ?? []) : [],
    searching: enabled && (typed !== query || (active && result.isFetching)),
  };
}
