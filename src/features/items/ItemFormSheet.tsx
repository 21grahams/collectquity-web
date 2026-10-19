import type { CatalogProduct, SealedItem, Single } from '../../api/types';
import type { ItemFormOriginal, ItemFormValues, ItemKind } from '../../lib/itemForm';

import { Box } from '@mui/material';
import { useMemo, useState } from 'react';

import { AutocompleteInput } from '../../components/AutocompleteInput';
import { sheetButtonSx } from '../../components/buttonStyles';
import { FieldRow, MoneyInput, Segmented, Stepper, TextInput } from '../../components/form';
import { SaveButton } from '../../components/SaveButton';
import { CancelButton, Field, Sheet } from '../../components/Sheet';
import { useAddSealed, useAddSingle, useEditSealed, useEditSingle } from '../../hooks/mutations';
import { useMarketLinks, useSealed, useSections, useSingles } from '../../hooks/queries';
import { useSaveSession } from '../../hooks/useSaveSession';
import {
  emptyItemForm,
  formFromItem,
  linkFromProduct,
  marketLabel,
  marketPreview,
  toSealedInput,
  toSingleInput,
  validateItemForm,
} from '../../lib/itemForm';
import { findLink } from '../../lib/marketLink';
import { suggestionList } from '../../lib/suggestions';
import { tokens } from '../../theme/tokens';
import { CatalogLink } from './CatalogLink';
import { ConditionPicker } from './ConditionPicker';

interface Props {
  kind: ItemKind;
  open: boolean;
  onClose: () => void;
  today: string;
  editing?: Single | SealedItem | null;
}

function LinkButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        background: 'none',
        border: 'none',
        color: tokens.gold,
        fontFamily: 'inherit',
        fontSize: 13,
        p: 0,
        cursor: 'pointer',
      }}
    >
      {children}
    </Box>
  );
}

export function ItemFormSheet({ kind, open, onClose, today, editing }: Props) {
  const session = useSaveSession();
  const addSingle = useAddSingle();
  const addSealed = useAddSealed();
  const editSingle = useEditSingle();
  const editSealed = useEditSealed();
  const marketLinks = useMarketLinks();
  const { splitsSealed } = useSections();
  const [form, setForm] = useState<ItemFormValues>(() => emptyItemForm(today));
  const [original, setOriginal] = useState<ItemFormOriginal | null>(null);
  const [showMore, setShowMore] = useState(false);
  // The set came from picking a card (not typed), so it goes when the Pokémon is cleared.
  const [pickedSet, setPickedSet] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const [attempted, setAttempted] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const prefill = editing
        ? formFromItem(
            editing,
            today,
            findLink(
              marketLinks.data,
              'pokemon' in editing ? { singleId: editing.id } : { sealedItemId: editing.id },
            ),
          )
        : null;
      setOriginal(prefill);
      setForm(prefill?.values ?? emptyItemForm(today));
      setShowMore(
        !!prefill && (!!prefill.values.fees || prefill.values.feeUnits > 0 || !!prefill.values.extra),
      );
      setPickedSet(!!prefill?.values.link);
      setOpenCount((n) => n + 1);
      setAttempted(false);
      session.reset();
    }
  }
  const isEdit = !!editing;

  const set = <K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const singles = useSingles();
  const sealed = useSealed();
  const suggestions = useMemo(
    () => ({
      pokemon: suggestionList((singles.data ?? []).map((x) => x.pokemon)),
      setName: suggestionList((singles.data ?? []).map((x) => x.setName)),
      name: suggestionList((sealed.data ?? []).map((x) => x.name)),
    }),
    [singles.data, sealed.data],
  );

  const errors = validateItemForm(kind, form);
  const invalid = Object.keys(errors).length > 0;
  const shown = attempted ? errors : {};

  const pickProduct = (p: CatalogProduct) => {
    if (p.kind === 'single') setPickedSet(true);
    setForm((f) => {
      const was = original?.values.link;
      // Switching an item to another product replaces an untouched value with the new estimate
      // on save; clearing it here shows that instead of a value that's about to change.
      const switched = !!original && (!was || was.tcgplayerId !== p.tcgplayerId);

      return {
        ...f,
        ...(p.kind === 'single' ? { pokemon: p.name, setName: p.setName } : { name: p.name }),
        link: linkFromProduct(p),
        ...(switched && f.market === original.values.market && { market: '' }),
      };
    });
  };
  // When adding, a typed value went with the removed pick; when editing it's the item's saved value.
  const unlinked = original ? { link: null } : { link: null, market: '' };
  const catalogLink = (
    <CatalogLink
      link={form.link}
      named={!!(kind === 'single' ? form.pokemon : form.name).trim()}
      printingError={shown.printing}
      onChange={(link) => setForm((f) => ({ ...f, ...(link ? { link } : unlinked) }))}
    />
  );

  const text = (key: keyof ItemFormValues) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value as never),
  });

  const pending = addSingle.isPending || addSealed.isPending || editSingle.isPending || editSealed.isPending;

  const qtyField = (
    <Field label="Qty">
      <Stepper value={form.quantity} min={1} onChange={(n) => set('quantity', n)} ariaLabel="quantity" />
    </Field>
  );
  const dateField = (
    <Field label="Purchase Date">
      <TextInput type="date" {...text('purchaseDate')} />
    </Field>
  );
  const preview = form.market.trim()
    ? null
    : marketPreview(form.link, kind === 'single' ? form.condition : '');
  const autoShown = preview?.estimate != null;
  const hasExtras = !!form.fees || form.feeUnits > 0 || !!form.extra.trim();
  // Never hide something filled in (or a fee error) behind "More".
  const moreOpen = showMore || hasExtras || !!shown.feeUnits;
  const dateAndQty = (
    <FieldRow columns="3fr minmax(112px, 1fr)">
      {dateField}
      {qtyField}
    </FieldRow>
  );

  const unchanged = original != null && JSON.stringify(form) === JSON.stringify(original.values);

  function submit() {
    if (invalid) {
      setAttempted(true);

      return;
    }
    if (unchanged) return;
    const done = { onSuccess: onClose };
    const prefill = original ?? undefined;
    if (kind === 'single') {
      const input = toSingleInput(form, prefill);
      if (editing) editSingle.mutate({ requestId: session.idFor(input), id: editing.id, input }, done);
      else addSingle.mutate({ requestId: session.idFor(input), input }, done);
    } else if (editing) {
      const input = toSealedInput(form, prefill);
      editSealed.mutate({ requestId: session.idFor(input), id: editing.id, input }, done);
    } else {
      const input = toSealedInput(form);
      const hold = splitsSealed ? form.hold : 'long';
      addSealed.mutate({ requestId: session.idFor({ hold, input }), hold, input }, done);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`${isEdit ? 'Edit' : 'Add'} ${kind === 'single' ? 'Single Card' : 'Sealed Product'}`}
      footer={
        <>
          <CancelButton onClick={onClose} />
          <SaveButton
            invalid={invalid || unchanged}
            pending={pending}
            label={isEdit ? 'Save Changes' : 'Add to Collection'}
            pendingLabel={isEdit ? 'Saving…' : 'Adding…'}
            onClick={submit}
            sx={sheetButtonSx}
          />
        </>
      }
    >
      {kind === 'sealed' && !isEdit && splitsSealed && (
        <Field label="Hold Type">
          <Segmented
            value={form.hold}
            onChange={(hold) => set('hold', hold)}
            options={[
              { value: 'long', label: 'Long Hold' },
              { value: 'short', label: 'Current Short Hold' },
            ]}
          />
        </Field>
      )}

      {kind === 'single' ? (
        <>
          <Field label="Pokémon" error={shown.pokemon}>
            <AutocompleteInput
              placeholder="e.g. Charizard ex"
              autoCapitalize="words"
              value={form.pokemon}
              onChange={(v) =>
                // A picked card's set and match go with its Pokémon (a typed set stays); its value
                // goes too, so the next pick can show its own.
                setForm((f) => ({
                  ...f,
                  pokemon: v,
                  ...(!v.trim() && f.link && unlinked),
                  ...(!v.trim() && pickedSet && { setName: '' }),
                }))
              }
              options={suggestions.pokemon}
              catalog="single"
              onPickProduct={pickProduct}
            />
          </Field>
          <Field label="Set" error={shown.setName}>
            <AutocompleteInput
              placeholder="e.g. Obsidian Flames"
              value={form.setName}
              onChange={(v) => {
                setPickedSet(false);
                setForm((f) => ({ ...f, setName: v, ...(!v.trim() && f.link && unlinked) }));
              }}
              options={suggestions.setName}
            />
          </Field>
          {catalogLink}
          {dateAndQty}
          <Field label="Condition" error={shown.condition}>
            <ConditionPicker key={openCount} value={form.condition} onChange={(c) => set('condition', c)} />
          </Field>
        </>
      ) : (
        <>
          <Field label="Product Name" error={shown.name}>
            <AutocompleteInput
              placeholder="e.g. Prismatic Evolutions ETB"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v, ...(!v.trim() && f.link && unlinked) }))}
              options={suggestions.name}
              catalog="sealed"
              onPickProduct={pickProduct}
            />
          </Field>
          {catalogLink}
          {dateAndQty}
        </>
      )}

      <FieldRow>
        <Field label="Total Cost Paid">
          <MoneyInput {...text('cost')} />
        </Field>
        <Field
          label={marketLabel(form.quantity)}
          error={shown.market}
          labelColor={autoShown ? tokens.blue : undefined}
        >
          <MoneyInput
            placeholder={preview?.placeholder ?? (form.link ? 'Auto' : '0.00')}
            autoValue={autoShown}
            aria-describedby={preview ? 'market-note' : undefined}
            {...text('market')}
          />
        </Field>
      </FieldRow>
      {preview && (
        <Box
          id="market-note"
          sx={{ fontSize: 12, color: autoShown ? tokens.blue : tokens.text3, mt: -0.75, mb: 1.75 }}
        >
          {preview.note}
        </Box>
      )}

      {moreOpen && (
        <>
          <FieldRow>
            <Field label="Fees / Taxes">
              <MoneyInput {...text('fees')} />
            </Field>
            <Field label="Units w/ fee" error={shown.feeUnits}>
              <Stepper
                value={form.feeUnits}
                min={0}
                max={form.quantity}
                onChange={(n) => set('feeUnits', n)}
                ariaLabel="units with fee"
              />
            </Field>
          </FieldRow>
          {kind === 'single' && (
            <Field label="Tag">
              <TextInput
                placeholder="e.g. PULLED"
                autoCapitalize="characters"
                onFocus={(e) => e.target.select()}
                {...text('extra')}
              />
            </Field>
          )}
        </>
      )}
      {/* Fees and tags are rarely used, so they wait behind "More"; it only folds back up while empty. */}
      {!hasExtras && !shown.feeUnits && (
        <Box sx={{ textAlign: 'center' }}>
          <LinkButton onClick={() => setShowMore(!showMore)}>{showMore ? '− Less' : '+ More'}</LinkButton>
        </Box>
      )}
    </Sheet>
  );
}
