import type { QueryKey } from '@tanstack/react-query';
import type { SealedItem } from '../api/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as api from '../api';
import { useNotify } from '../components/notifyContext';
import { queryKeys } from './queries';

const SINGLES = [queryKeys.singles, queryKeys.summary];
const SEALED = [queryKeys.sealed, queryKeys.summary, queryKeys.context];
const HOLDS = [...SEALED, queryKeys.completedHolds];
const ACCOUNTS = [queryKeys.accounts];

type WithId<T> = T & { requestId: string };

function useSave<TVars, TResult>(
  fn: (vars: TVars) => Promise<TResult>,
  refresh: QueryKey[],
  successMessage: (result: TResult, vars: TVars) => string,
) {
  const queryClient = useQueryClient();
  const notify = useNotify();

  return useMutation({
    mutationFn: fn,
    onSuccess: async (result, vars) => {
      notify(successMessage(result, vars), 'success');
      await Promise.all(refresh.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
    // The item may have changed elsewhere (sold or removed on another device),
    // so refresh to show what's actually there now.
    onError: async (error) => {
      notify(`Failed — ${error.message}`, 'error');
      await Promise.all(refresh.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });
}

export const useAddSingle = () =>
  useSave(
    (v: WithId<{ input: api.SingleInput }>) => api.addSingle(v.requestId, v.input),
    SINGLES,
    () => 'Added!',
  );

export const useEditSingle = () =>
  useSave(
    (v: WithId<{ id: number; input: api.SingleInput }>) => api.editSingle(v.requestId, v.id, v.input),
    SINGLES,
    () => 'Saved!',
  );

export const useDeleteSingle = () =>
  useSave(
    (v: WithId<{ id: number }>) => api.deleteSingle(v.requestId, v.id),
    SINGLES,
    () => 'Removed',
  );

export const useSellSingle = () =>
  useSave(
    (v: WithId<{ id: number; quantity: number; soldPrice: number; profit: number }>) =>
      api.sellSingle(v.requestId, v.id, v.quantity, v.soldPrice, v.profit),
    SINGLES,
    () => 'Marked sold!',
  );

export const useAddSealed = () => {
  const queryClient = useQueryClient();

  // The database merges an add into a card already in that hold; it returns that card's id.
  return useSave(
    (v: WithId<{ hold: 'long' | 'short'; input: api.SealedInput }>) =>
      api.addSealed(v.requestId, v.hold, v.input),
    SEALED,
    (id) =>
      (queryClient.getQueryData<SealedItem[]>(queryKeys.sealed) ?? []).some((i) => i.id === id)
        ? 'Added to existing card!'
        : 'Added!',
  );
};

export const useEditSealed = () =>
  useSave(
    (v: WithId<{ id: number; input: api.SealedInput }>) => api.editSealed(v.requestId, v.id, v.input),
    SEALED,
    () => 'Saved!',
  );

export const useDeleteSealed = () =>
  useSave(
    (v: WithId<{ id: number }>) => api.deleteSealed(v.requestId, v.id),
    SEALED,
    () => 'Removed',
  );

export const useSellLongHoldItem = () =>
  useSave(
    (v: WithId<{ id: number; quantity: number; soldPrice: number; profit: number }>) =>
      api.sellLongHoldItem(v.requestId, v.id, v.quantity, v.soldPrice, v.profit),
    SEALED,
    () => 'Marked sold!',
  );

export const useMoveSealed = () =>
  useSave(
    (v: WithId<{ id: number; quantity: number }>) => api.moveSealed(v.requestId, v.id, v.quantity),
    SEALED,
    (dest) => `Moved to ${dest ?? 'destination'}!`,
  );

export const useCompleteShortHold = () =>
  useSave(
    (v: WithId<{ holdName: string; soldPrice: number; profit: number }>) =>
      api.completeShortHold(v.requestId, v.soldPrice, v.profit),
    HOLDS,
    (next, v) => `${v.holdName} completed! ${next} started.`,
  );

export const useSetQuarterPrice = () =>
  useSave(
    (
      v: WithId<{
        item: { singleId: number } | { sealedItemId: number };
        quarter: 1 | 2 | 3 | 4;
        unitValue: number;
      }>,
    ) => api.setQuarterPrice(v.requestId, v.item, v.quarter, v.unitValue),
    [...SINGLES, ...SEALED],
    () => 'Updated!',
  );

export const useAddAccount = () =>
  useSave(
    (v: WithId<{ retailer: string; input: api.AccountInput }>) =>
      api.addAccount(v.requestId, v.retailer, v.input),
    ACCOUNTS,
    () => 'Added!',
  );

export const useEditAccount = () =>
  useSave(
    (v: WithId<{ id: number; input: api.AccountInput }>) => api.editAccount(v.requestId, v.id, v.input),
    ACCOUNTS,
    () => 'Saved!',
  );

export const useDeleteAccount = () =>
  useSave(
    (v: WithId<{ id: number }>) => api.deleteAccount(v.requestId, v.id),
    ACCOUNTS,
    () => 'Removed',
  );
