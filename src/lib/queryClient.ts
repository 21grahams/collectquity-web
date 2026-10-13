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

export const cachePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: isLiveDatabase ? 'collectquity-cache' : 'collectquity-cache-practice',
});

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
