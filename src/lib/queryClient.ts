import type { Query } from '@tanstack/react-query';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';

import { isLiveDatabase } from './environment';

const WEEK = 7 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, gcTime: WEEK },
    // Never pause and replay saves later (TanStack's default when offline).
    mutations: { networkMode: 'always', retry: false },
  },
});

const cacheKey = isLiveDatabase ? 'collectquity-cache' : 'collectquity-cache-practice';

export const cachePersister = createSyncStoragePersister({ storage: window.localStorage, key: cacheKey });

const ownerKey = `${cacheKey}-owner`;

function tryStorage<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

/** Whose data the saved cache holds, so another person's login can wipe it first. */
export const cacheOwner = {
  get: () => tryStorage(() => window.localStorage.getItem(ownerKey), null),
  set: (userId: string) => tryStorage(() => window.localStorage.setItem(ownerKey, userId), undefined),
  clear: () => tryStorage(() => window.localStorage.removeItem(ownerKey), undefined),
  /** Saved before owners were recorded, so it can't be trusted to belong to anyone. */
  hasUnownedCache: () =>
    tryStorage(() => !window.localStorage.getItem(ownerKey) && !!window.localStorage.getItem(cacheKey), true),
};

export const persistOptions = {
  persister: cachePersister,
  maxAge: WEEK,
  buster: __APP_VERSION__,
  dehydrateOptions: {
    shouldDehydrateQuery: (q: Query) => q.state.status === 'success' && q.queryKey[0] !== 'catalog',
  },
};

// TanStack only learns about offline from 'offline' events, so an app opened
// already offline would think it's online and attempt (failing) refreshes.
onlineManager.setOnline(navigator.onLine);
