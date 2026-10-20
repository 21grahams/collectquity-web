// The only module that talks to Supabase.

import type {
  Account,
  AdminPerson,
  AppContext,
  CatalogProduct,
  CompletedHold,
  GradedBasis,
  HoldStatus,
  InviteResult,
  MarketLink,
  RetailerAccount,
  SealedItem,
  Sections,
  Single,
  Summary,
} from './types';

import { friendlyConnectionError } from '../lib/errors';
import { supabase } from '../lib/supabase';

export class ApiError extends Error {
  override name = 'ApiError';

  constructor(message: string) {
    super(friendlyConnectionError(message));
  }
}

type Response<T> = { data: T | null; error: { message: string } | null };

const TIMEOUT_MS = 15_000;

/** Gives up on a request that hangs (weak signal) instead of spinning forever. */
async function send<T>(
  request: PromiseLike<Response<T>> & { abortSignal(signal: AbortSignal): PromiseLike<Response<T>> },
): Promise<Response<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const result = await request.abortSignal(controller.signal);
    if (controller.signal.aborted) {
      return { data: null, error: { message: 'Request timed out — check your connection and try again' } };
    }

    return result;
  } finally {
    clearTimeout(timer);
  }
}

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new ApiError(error.message);
  if (data == null) throw new ApiError('No data returned');

  return data;
}

/** Generated types say number; the database can return null. */
const n = (v: unknown): number | null => (v == null ? null : Number(v));
const num = (v: unknown): number => Number(v ?? 0);

export async function getAccount(): Promise<Account> {
  const [row] = unwrap(await send(supabase.rpc('api_get_account')));
  if (!row) throw new ApiError('No account returned');

  return {
    approved: row.approved,
    timeZone: row.time_zone,
    tracksSingles: row.tracks_singles,
    tracksSealed: row.tracks_sealed,
    splitsSealed: row.splits_sealed,
    usesAccounts: row.uses_accounts,
    // Missing only if this app runs before the database knows about onboarding: don't send existing users there.
    onboarded: row.onboarded ?? true,
    isAdmin: row.is_admin ?? false,
  };
}

/** Notes today's date as this person's "last opened"; the admin page shows it. */
export async function recordOpened(): Promise<void> {
  const { error } = await send(supabase.rpc('api_record_opened'));
  if (error) throw new ApiError(error.message);
}

export async function listAdminPeople(): Promise<AdminPerson[]> {
  const rows = unwrap(await send(supabase.rpc('api_admin_people')));

  return rows.map((r) => ({
    note: r.note,
    code: r.code,
    usesLeft: r.uses_left,
    joinedOn: r.joined_on ?? null,
    lastOpenedOn: r.last_opened_on ?? null,
    singles: r.singles ?? 0,
    sealed: r.sealed ?? 0,
    completedHolds: r.completed_holds ?? 0,
    splitsSealed: r.splits_sealed ?? null,
  }));
}

export async function createInvite(note: string): Promise<string> {
  const code = await save(supabase.rpc('api_admin_create_invite', { p_note: note }));
  if (!code) throw new ApiError('No code returned');

  return code;
}

// No request id: saving the same choices twice changes nothing.
export async function saveSections(sections: Sections): Promise<void> {
  await save(
    supabase.rpc('api_save_sections', {
      p_tracks_singles: sections.tracksSingles,
      p_tracks_sealed: sections.tracksSealed,
      p_splits_sealed: sections.splitsSealed,
      p_uses_accounts: sections.usesAccounts,
    }),
  );
}

export async function redeemInvite(code: string, timeZone: string): Promise<InviteResult> {
  const result = unwrap(
    await send(supabase.rpc('api_redeem_invite', { p_code: code, p_time_zone: timeZone })),
  );

  return result as InviteResult;
}

export async function getContext(): Promise<AppContext> {
  const [row] = unwrap(await send(supabase.rpc('api_get_context')));
  if (!row) throw new ApiError('No context returned');

  return {
    today: row.today,
    year: row.year,
    quarter: row.quarter as AppContext['quarter'],
    currentShortHoldId: n(row.current_short_hold_id),
    currentShortHoldName: row.current_short_hold_name ?? null,
  };
}

export async function listSingles(): Promise<Single[]> {
  const rows = unwrap(await send(supabase.rpc('api_list_singles')));

  return rows.map((r) => ({
    id: r.id,
    pokemon: r.pokemon,
    setName: r.set_name,
    condition: r.condition,
    extra: r.extra,
    displayName: r.display_name,
    quantity: r.quantity,
    purchaseDate: r.purchase_date ?? null,
    totalCost: num(r.total_cost),
    fees: num(r.fees),
    feeUnits: r.fee_units,
    unitValue: n(r.unit_value),
    quarterUnitValues: [n(r.q1_unit_value), n(r.q2_unit_value), n(r.q3_unit_value), n(r.q4_unit_value)],
  }));
}

export async function listSealed(): Promise<SealedItem[]> {
  const rows = unwrap(await send(supabase.rpc('api_list_sealed')));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    quantity: r.quantity,
    purchaseDate: r.purchase_date ?? null,
    totalCost: num(r.total_cost),
    fees: num(r.fees),
    feeUnits: r.fee_units,
    holdId: r.hold_id,
    holdName: r.hold_name,
    holdNumber: n(r.hold_number),
    holdStatus: r.hold_status as HoldStatus,
    unitValue: n(r.unit_value),
    quarterUnitValues: [n(r.q1_unit_value), n(r.q2_unit_value), n(r.q3_unit_value), n(r.q4_unit_value)],
  }));
}

export async function listAccounts(): Promise<RetailerAccount[]> {
  const rows = unwrap(await send(supabase.rpc('api_list_accounts')));

  return rows.map((r) => ({
    id: r.id,
    retailer: r.retailer,
    label: r.label,
    email: r.email,
    cardLast2: r.card_last2,
    phoneLast4: r.phone_last4,
    loop: r.loop,
    notes: r.notes,
  }));
}

export async function listCompletedHolds(): Promise<CompletedHold[]> {
  const rows = unwrap(await send(supabase.rpc('api_list_completed_holds')));

  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    name: r.name,
    completedAt: r.completed_at,
    soldPrice: num(r.sold_price),
    profit: num(r.profit),
    costBasis: num(r.cost_basis),
    markup: num(r.markup),
    margin: num(r.margin),
  }));
}

export async function getSummary(): Promise<Summary> {
  const [r] = unwrap(await send(supabase.rpc('api_get_summary')));
  if (!r) throw new ApiError('No summary returned');

  return {
    singles: {
      spent: num(r.singles_spent),
      value: num(r.singles_value),
      gain: num(r.singles_gain),
      exit80: num(r.singles_exit_80),
      profit80: num(r.singles_profit_80),
    },
    longHold: {
      spent: num(r.long_hold_spent),
      value: num(r.long_hold_value),
      gain: num(r.long_hold_gain),
      exit80: num(r.long_hold_exit_80),
      profit80: num(r.long_hold_profit_80),
    },
    portfolio: {
      spent: num(r.portfolio_spent),
      value: num(r.portfolio_value),
      gain: num(r.portfolio_gain),
      exit80: num(r.portfolio_exit_80),
      profit80: num(r.portfolio_profit_80),
    },
    currentShort: {
      name: r.current_short_name ?? null,
      spent: num(r.current_short_spent),
      value: num(r.current_short_value),
      gain: num(r.current_short_gain),
      exit80: num(r.current_short_exit_80),
      profit80: num(r.current_short_profit_80),
    },
    completedHoldCount: r.completed_hold_count,
    completedHoldsProfit: num(r.completed_holds_profit),
    singlesSales: {
      soldPrice: num(r.singles_sold_price),
      profit: num(r.singles_sold_profit),
      markup: num(r.singles_sold_markup),
      margin: num(r.singles_sold_margin),
      hasSales: r.singles_has_sales,
    },
    longHoldSales: {
      soldPrice: num(r.long_hold_sold_price),
      profit: num(r.long_hold_sold_profit),
      markup: num(r.long_hold_sold_markup),
      margin: num(r.long_hold_sold_margin),
      hasSales: r.long_hold_has_sales,
    },
    totalRealizedProfit: num(r.total_realized_profit),
  };
}

export async function listMarketLinks(): Promise<MarketLink[]> {
  const rows = unwrap(await send(supabase.rpc('api_list_market_links')));

  return rows.map((r) => ({
    singleId: n(r.single_id),
    sealedItemId: n(r.sealed_item_id),
    tcgplayerId: r.tcgplayer_id,
    printing: r.printing ?? null,
    productName: r.product_name,
    pinned: r.pinned,
    gradedBasis: r.graded_basis as GradedBasis,
    lastRunAt: r.last_run_at ?? null,
    lastStatus: (r.last_status ?? null) as MarketLink['lastStatus'],
    recentUnitValue: n(r.recent_unit_value),
    longTermUnitValue: n(r.long_term_unit_value),
    imageUrl: r.image_url ?? null,
  }));
}

export async function searchCatalog(query: string, kind: CatalogProduct['kind']): Promise<CatalogProduct[]> {
  const rows = unwrap(await send(supabase.rpc('api_search_catalog', { p_query: query, p_kind: kind })));

  return rows.map((r) => ({
    tcgplayerId: r.tcgplayer_id,
    kind: r.kind as CatalogProduct['kind'],
    name: r.name,
    number: r.number ?? null,
    setName: r.set_name,
    productName: r.product_name,
    printings: r.printings ?? [],
    imageUrl: r.image_url ?? null,
    prices: (r.prices as Record<string, number> | null) ?? {},
  }));
}

async function save<T>(call: Parameters<typeof send<T>>[0]): Promise<T | null> {
  if (!navigator.onLine) throw new ApiError("You're offline — changes can't be saved until you reconnect.");
  const { data, error } = await send(call);
  if (error) throw new ApiError(error.message);

  return data;
}

/** null keeps the item's current link (or adds none); 'unlink' removes it. */
export type LinkChange = { tcgplayerId: string; printing: string | null } | 'unlink' | null;

export interface SingleInput {
  pokemon: string;
  setName: string;
  condition: string;
  extra: string;
  quantity: number;
  purchaseDate: string;
  baseCost: number;
  fees: number;
  feeUnits: number;
  /** null on edit = keep the current price. */
  unitValue: number | null;
  link: LinkChange;
}

export interface SealedInput {
  name: string;
  quantity: number;
  purchaseDate: string;
  baseCost: number;
  fees: number;
  feeUnits: number;
  /** null on edit = keep the current price. */
  unitValue: number | null;
  link: LinkChange;
}

export interface AccountInput {
  label: string;
  email: string;
  cardLast2: string;
  phoneLast4: string;
  loop: string;
  notes: string;
}

function linkArg(link: LinkChange) {
  if (link === null) return {};
  if (link === 'unlink') return { p_link: {} };

  return { p_link: { tcgplayer_id: link.tcgplayerId, printing: link.printing } };
}

const singleArgs = (i: SingleInput) => ({
  p_pokemon: i.pokemon,
  p_set_name: i.setName,
  p_condition: i.condition,
  p_extra: i.extra,
  p_quantity: i.quantity,
  p_purchase_date: i.purchaseDate,
  p_base_cost: i.baseCost,
  p_fees: i.fees,
  p_fee_units: i.feeUnits,
  p_unit_value: i.unitValue as number,
  ...linkArg(i.link),
});

const sealedArgs = (i: SealedInput) => ({
  p_name: i.name,
  p_quantity: i.quantity,
  p_purchase_date: i.purchaseDate,
  p_base_cost: i.baseCost,
  p_fees: i.fees,
  p_fee_units: i.feeUnits,
  p_unit_value: i.unitValue as number,
  ...linkArg(i.link),
});

const accountArgs = (i: AccountInput) => ({
  p_label: i.label,
  p_email: i.email,
  p_card_last2: i.cardLast2,
  p_phone_last4: i.phoneLast4,
  p_loop: i.loop,
  p_notes: i.notes,
});

export const addSingle = (requestId: string, input: SingleInput) =>
  save(supabase.rpc('api_add_single', { p_request_id: requestId, ...singleArgs(input) }));

export const editSingle = (requestId: string, id: number, input: SingleInput) =>
  save(supabase.rpc('api_edit_single', { p_request_id: requestId, p_id: id, ...singleArgs(input) }));

export const deleteSingle = (requestId: string, id: number) =>
  save(supabase.rpc('api_delete_single', { p_request_id: requestId, p_id: id }));

export const sellSingle = (
  requestId: string,
  id: number,
  quantity: number,
  soldPrice: number,
  profit: number,
) =>
  save(
    supabase.rpc('api_sell_single', {
      p_request_id: requestId,
      p_id: id,
      p_quantity: quantity,
      p_sold_price: soldPrice,
      p_profit: profit,
    }),
  );

export const addSealed = (requestId: string, hold: 'long' | 'short', input: SealedInput) =>
  save(supabase.rpc('api_add_sealed', { p_request_id: requestId, p_hold: hold, ...sealedArgs(input) }));

export const editSealed = (requestId: string, id: number, input: SealedInput) =>
  save(supabase.rpc('api_edit_sealed', { p_request_id: requestId, p_id: id, ...sealedArgs(input) }));

export const deleteSealed = (requestId: string, id: number) =>
  save(supabase.rpc('api_delete_sealed', { p_request_id: requestId, p_id: id }));

export const sellLongHoldItem = (
  requestId: string,
  id: number,
  quantity: number,
  soldPrice: number,
  profit: number,
) =>
  save(
    supabase.rpc('api_sell_long_hold_item', {
      p_request_id: requestId,
      p_id: id,
      p_quantity: quantity,
      p_sold_price: soldPrice,
      p_profit: profit,
    }),
  );

export const moveSealed = (requestId: string, id: number, quantity: number) =>
  save(supabase.rpc('api_move_sealed', { p_request_id: requestId, p_id: id, p_quantity: quantity }));

export const completeShortHold = (requestId: string, soldPrice: number, profit: number) =>
  save(
    supabase.rpc('api_complete_short_hold', {
      p_request_id: requestId,
      p_sold_price: soldPrice,
      p_profit: profit,
    }),
  );

export const setQuarterPrice = (
  requestId: string,
  item: { singleId: number } | { sealedItemId: number },
  quarter: 1 | 2 | 3 | 4,
  unitValue: number,
) =>
  save(
    supabase.rpc('api_set_quarter_price', {
      p_request_id: requestId,
      // The generated types don't allow null, but exactly one id must be null.
      p_single_id: ('singleId' in item ? item.singleId : null) as number,
      p_sealed_item_id: ('sealedItemId' in item ? item.sealedItemId : null) as number,
      p_quarter: quarter,
      p_unit_value: unitValue,
    }),
  );

export const setMarketLink = (
  requestId: string,
  item: { singleId: number } | { sealedItemId: number },
  pinned: boolean,
  gradedBasis: GradedBasis,
) =>
  save(
    supabase.rpc('api_set_market_link', {
      p_request_id: requestId,
      p_single_id: ('singleId' in item ? item.singleId : null) as number,
      p_sealed_item_id: ('sealedItemId' in item ? item.sealedItemId : null) as number,
      p_pinned: pinned,
      p_graded_basis: gradedBasis,
    }),
  );

export const addAccount = (requestId: string, retailer: string, input: AccountInput) =>
  save(
    supabase.rpc('api_add_account', { p_request_id: requestId, p_retailer: retailer, ...accountArgs(input) }),
  );

export const editAccount = (requestId: string, id: number, input: AccountInput) =>
  save(supabase.rpc('api_edit_account', { p_request_id: requestId, p_id: id, ...accountArgs(input) }));

export const deleteAccount = (requestId: string, id: number) =>
  save(supabase.rpc('api_delete_account', { p_request_id: requestId, p_id: id }));

// ── profile photo ───────────────────────────────────────────
const avatars = () => supabase.storage.from('avatars');

async function avatarPath(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new ApiError('Not logged in');

  return `${id}/avatar.jpg`;
}

/** A temporary link to your photo, or null if you haven't set one. */
export async function getAvatarUrl(): Promise<string | null> {
  const { data, error } = await avatars().createSignedUrl(await avatarPath(), 60 * 60);

  return error ? null : data.signedUrl;
}

export async function uploadAvatar(photo: Blob): Promise<void> {
  if (!navigator.onLine)
    throw new ApiError("You're offline — your photo can't be saved until you reconnect.");
  const { error } = await avatars().upload(await avatarPath(), photo, {
    upsert: true,
    contentType: 'image/jpeg',
  });
  if (error) throw new ApiError(error.message);
}

export async function removeAvatar(): Promise<void> {
  if (!navigator.onLine)
    throw new ApiError("You're offline — your photo can't be removed until you reconnect.");
  const { error } = await avatars().remove([await avatarPath()]);
  if (error) throw new ApiError(error.message);
}

/**
 * Deletes the login and everything in the collection. The photo goes first (storage files can't
 * be removed from the database side), and a failure stops here so it's never left behind.
 */
export async function deleteMyAccount(): Promise<void> {
  await removeAvatar();
  await save(supabase.rpc('api_delete_my_account'));
}
