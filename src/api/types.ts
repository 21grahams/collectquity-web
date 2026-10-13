// The app's own data types: camelCase, with nullable fields declared
// honestly. (The generated database types claim per-unit values are always
// numbers, but they're null when an item has no price for that period.)

import type { QuarterUnitValues } from '../lib/cardMath';

export interface AppContext {
  /** Today in Denver time, "YYYY-MM-DD". */
  today: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  currentShortHoldId: number | null;
  currentShortHoldName: string | null;
}

interface ItemBase {
  id: number;
  quantity: number;
  purchaseDate: string | null;
  /** Total cost paid, PAS fees included. */
  totalCost: number;
  fees: number;
  feeUnits: number;
  unitValue: number | null;
  /** This year's Q1–Q4 per-unit values; null = no price that quarter. */
  quarterUnitValues: QuarterUnitValues;
}

export interface Single extends ItemBase {
  pokemon: string;
  setName: string;
  condition: string;
  extra: string;
  displayName: string;
}

export type HoldStatus = 'long' | 'current' | 'historical';

export interface SealedItem extends ItemBase {
  name: string;
  holdId: number;
  holdName: string;
  holdNumber: number | null;
  holdStatus: HoldStatus;
}

export type GradedBasis = 'long_term' | 'recent';

/** An item priced automatically every morning from a catalog product. */
export interface MarketLink {
  singleId: number | null;
  sealedItemId: number | null;
  tcgplayerId: string;
  printing: string | null;
  productName: string;
  /** You typed a value yourself; daily updates skip this item. */
  pinned: boolean;
  gradedBasis: GradedBasis;
  lastRunAt: string | null;
  lastStatus: 'updated' | 'no_price' | 'not_found' | 'error' | null;
  /** Graded cards only: the 7-day price and the median of all recorded sales. */
  recentUnitValue: number | null;
  longTermUnitValue: number | null;
}

/** A card or sealed product from TCGplayer's catalog. */
export interface CatalogProduct {
  tcgplayerId: string;
  kind: 'single' | 'sealed';
  /** Cards: the name without its number ("Charizard ex"); sealed: the full product name. */
  name: string;
  number: string | null;
  setName: string;
  productName: string;
  /** e.g. Normal, Holofoil, Reverse Holofoil. */
  printings: string[];
  imageUrl: string | null;
}

export interface RetailerAccount {
  id: number;
  retailer: string;
  label: string;
  email: string;
  cardLast2: string;
  phoneLast4: string;
  loop: string;
  notes: string;
}

export interface CompletedHold {
  id: number;
  number: number;
  name: string;
  completedAt: string;
  soldPrice: number;
  profit: number;
  costBasis: number;
  markup: number;
  margin: number;
}

export interface SummaryBox {
  spent: number;
  value: number;
  gain: number;
  exit80: number;
  profit80: number;
}

export interface SalesBox {
  soldPrice: number;
  profit: number;
  markup: number;
  margin: number;
  hasSales: boolean;
}

/** Every number on the Summary tab, all calculated by the database. */
export interface Summary {
  singles: SummaryBox;
  longHold: SummaryBox;
  portfolio: SummaryBox;
  currentShort: SummaryBox & { name: string | null };
  completedHoldCount: number;
  completedHoldsProfit: number;
  singlesSales: SalesBox;
  longHoldSales: SalesBox;
  totalRealizedProfit: number;
}
