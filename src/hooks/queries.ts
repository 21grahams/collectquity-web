import { useQuery } from '@tanstack/react-query';

import * as api from '../api';

export const queryKeys = {
  context: ['context'] as const,
  singles: ['singles'] as const,
  sealed: ['sealed'] as const,
  accounts: ['accounts'] as const,
  completedHolds: ['completedHolds'] as const,
  summary: ['summary'] as const,
  avatar: ['avatar'] as const,
};

export const useAppContext = () => useQuery({ queryKey: queryKeys.context, queryFn: api.getContext });

export const useSingles = () => useQuery({ queryKey: queryKeys.singles, queryFn: api.listSingles });

export const useSealed = () => useQuery({ queryKey: queryKeys.sealed, queryFn: api.listSealed });

export const useAccounts = () => useQuery({ queryKey: queryKeys.accounts, queryFn: api.listAccounts });

export const useCompletedHolds = () =>
  useQuery({ queryKey: queryKeys.completedHolds, queryFn: api.listCompletedHolds });

export const useSummary = () => useQuery({ queryKey: queryKeys.summary, queryFn: api.getSummary });

export const useAvatarUrl = () => useQuery({ queryKey: queryKeys.avatar, queryFn: api.getAvatarUrl });
