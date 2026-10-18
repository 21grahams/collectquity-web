import type { LinkChange, SealedInput, SingleInput } from '../api';
import type { CatalogProduct, MarketLink, SealedItem, Single } from '../api/types';

import { isValidCondition } from './condition';

export type ItemKind = 'single' | 'sealed';

/** The catalog product an item is (or will be) priced from. */
export interface FormLink {
  tcgplayerId: string;
  productName: string;
  printing: string | null;
  /** Empty when unknown (a link saved earlier); the printing then can't be changed without re-picking. */
  printings: string[];
  imageUrl: string | null;
}

export interface ItemFormValues {
  pokemon: string;
  setName: string;
  condition: string;
  extra: string;
  name: string;
  quantity: number;
  purchaseDate: string;
  /** Total cost paid, before fees / taxes. */
  cost: string;
  /** Per item; with a quantity of 1 that's also the total. */
  market: string;
  fees: string;
  feeUnits: number;
  hold: 'long' | 'short';
  link: FormLink | null;
}

export const emptyItemForm = (today: string): ItemFormValues => ({
  pokemon: '',
  setName: '',
  condition: '',
  extra: '',
  name: '',
  quantity: 1,
  purchaseDate: today,
  cost: '',
  market: '',
  fees: '',
  feeUnits: 0,
  hold: 'long',
  link: null,
});

export const linkFromProduct = (p: CatalogProduct): FormLink => ({
  tcgplayerId: p.tcgplayerId,
  productName: p.productName,
  printing: p.kind === 'single' && p.printings.length === 1 ? p.printings[0]! : null,
  printings: p.kind === 'single' ? p.printings : [],
  imageUrl: p.imageUrl,
});

export const needsPrinting = (link: FormLink | null) => !!link && !link.printing && link.printings.length > 1;

export const marketLabel = (quantity: number) =>
  quantity > 1 ? 'Market Value Per Item' : 'Total Market Value';

function parseMoney(text: string): number {
  const n = Number.parseFloat(text.replace(/[$,\s]/g, ''));

  return Number.isFinite(n) ? n : 0;
}

export type ItemFormErrors = Partial<
  Record<'pokemon' | 'setName' | 'condition' | 'name' | 'market' | 'feeUnits' | 'printing', string>
>;

export function validateItemForm(kind: ItemKind, v: ItemFormValues): ItemFormErrors {
  const errors: ItemFormErrors = {};
  if (kind === 'single') {
    if (!v.pokemon.trim()) errors.pokemon = 'Enter a Pokémon';
    if (!v.setName.trim()) errors.setName = 'Enter a set';
    if (!isValidCondition(v.condition)) errors.condition = 'Choose a condition';
  } else if (!v.name.trim()) {
    errors.name = 'Enter a name';
  }
  if (!parseMoney(v.market) && !v.link) errors.market = 'Enter a market value';
  if (needsPrinting(v.link)) errors.printing = 'Choose a printing';
  if (v.feeUnits > v.quantity) errors.feeUnits = "Units w/ fee can't exceed qty";

  return errors;
}

export interface ItemFormOriginal {
  values: ItemFormValues;
  baseCost: number;
  fees: number;
  unitValue: number | null;
}

export const toInputText = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

export function formFromItem(item: Single | SealedItem, today: string, link?: MarketLink): ItemFormOriginal {
  const baseCost = item.totalCost - item.fees;
  const values: ItemFormValues = {
    ...emptyItemForm(today),
    ...('pokemon' in item
      ? { pokemon: item.pokemon, setName: item.setName, condition: item.condition, extra: item.extra }
      : { name: item.name }),
    quantity: item.quantity,
    purchaseDate: item.purchaseDate ?? today,
    cost: baseCost ? toInputText(baseCost) : '',
    market: item.unitValue != null ? toInputText(item.unitValue) : '',
    fees: item.fees ? toInputText(item.fees) : '',
    feeUnits: item.feeUnits,
    link: link
      ? {
          tcgplayerId: link.tcgplayerId,
          productName: link.productName,
          printing: link.printing,
          printings: [],
          imageUrl: link.imageUrl,
        }
      : null,
  };

  return { values, baseCost, fees: item.fees, unitValue: item.unitValue };
}

// Untouched money fields send back the exact stored value, so an edit never
// rounds away fractions of a cent left by earlier partial sales or moves; an
// untouched market value is sent as null so no quarter price gets written.
// A linked item may leave it blank: the morning update fills it in.
function shared(v: ItemFormValues, original?: ItemFormOriginal) {
  const keep = <T, P>(field: 'cost' | 'fees' | 'market', exact: T, parsed: P): T | P =>
    original && v[field] === original.values[field] ? exact : parsed;

  return {
    quantity: v.quantity,
    purchaseDate: v.purchaseDate,
    baseCost: keep('cost', original?.baseCost ?? 0, parseMoney(v.cost)),
    fees: keep('fees', original?.fees ?? 0, parseMoney(v.fees)),
    feeUnits: v.feeUnits,
    unitValue: keep('market', null, parseMoney(v.market) || null),
    link: linkChange(v.link, original?.values.link ?? null),
  };
}

function linkChange(link: FormLink | null, was: FormLink | null): LinkChange {
  if (!link) return was ? 'unlink' : null;
  if (was && link.tcgplayerId === was.tcgplayerId && link.printing === was.printing) return null;

  return { tcgplayerId: link.tcgplayerId, printing: link.printing };
}

export const toSingleInput = (v: ItemFormValues, original?: ItemFormOriginal): SingleInput => ({
  pokemon: v.pokemon.trim(),
  setName: v.setName.trim(),
  condition: v.condition.trim().toUpperCase(),
  extra: v.extra.trim().toUpperCase(),
  ...shared(v, original),
});

export const toSealedInput = (v: ItemFormValues, original?: ItemFormOriginal): SealedInput => ({
  name: v.name.trim(),
  ...shared(v, original),
});
