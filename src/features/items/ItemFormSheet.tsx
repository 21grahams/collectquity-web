import type { CatalogProduct, SealedItem, Single } from '../../api/types';
import type { ItemFormOriginal, ItemFormValues, ItemKind } from '../../lib/itemForm';

import { Box } from '@mui/material';
import { useMemo, useState } from 'react';

import { AutocompleteInput } from '../../components/AutocompleteInput';
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
  const [showTag, setShowTag] = useState(false);
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
      setShowTag(!!prefill?.values.extra);
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

  const pickProduct = (p: CatalogProduct) =>
    setForm((f) => ({
      ...f,
      ...(p.kind === 'single' ? { pokemon: p.name, setName: p.setName } : { name: p.name }),
      link: linkFromProduct(p),
    }));
  const catalogLink = (
    <CatalogLink
      link={form.link}
      named={!!(kind === 'single' ? form.pokemon : form.name).trim()}
      printingError={shown.printing}
      onChange={(link) => set('link', link)}
    />
  );

  const text = (key: keyof ItemFormValues) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value as never),
  });

  const pending = addSingle.isPending || addSealed.isPending || editSingle.isPending || editSealed.isPending;

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
            sx={{ py: 1.5, fontSize: 15 }}
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

      <FieldRow columns="1fr 112px">
        {kind === 'single' ? (
          <Field label="Pokémon" error={shown.pokemon}>
            <AutocompleteInput
              placeholder="e.g. Charizard ex"
              autoCapitalize="words"
              value={form.pokemon}
              onChange={(v) => set('pokemon', v)}
              options={suggestions.pokemon}
              catalog="single"
              onPickProduct={pickProduct}
            />
          </Field>
        ) : (
          <Field label="Product Name" error={shown.name}>
            <AutocompleteInput
              placeholder="e.g. Prismatic Evolutions ETB"
              value={form.name}
              onChange={(v) => set('name', v)}
              options={suggestions.name}
              catalog="sealed"
              onPickProduct={pickProduct}
            />
          </Field>
        )}
        <Field label="Qty">
          <Stepper value={form.quantity} min={1} onChange={(n) => set('quantity', n)} ariaLabel="quantity" />
        </Field>
      </FieldRow>
      {kind === 'sealed' && catalogLink}

      {kind === 'single' && (
        <>
          <Field label="Set" error={shown.setName}>
            <AutocompleteInput
              placeholder="e.g. Obsidian Flames"
              value={form.setName}
              onChange={(v) => set('setName', v)}
              options={suggestions.setName}
            />
          </Field>
          {catalogLink}
          <Field label="Condition" error={shown.condition}>
            <ConditionPicker key={openCount} value={form.condition} onChange={(c) => set('condition', c)} />
          </Field>
        </>
      )}

      <FieldRow>
        <Field label="Purchase Date">
          <TextInput type="date" {...text('purchaseDate')} />
        </Field>
        <Field label={marketLabel(form.quantity)} error={shown.market}>
          <MoneyInput placeholder={form.link ? 'Auto' : '0.00'} {...text('market')} />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label="Total Cost Paid">
          <MoneyInput {...text('cost')} />
        </Field>
        <Field label="Fees / Taxes (Optional)" error={shown.feeUnits}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <MoneyInput {...text('fees')} style={{ flex: 1, minWidth: 0 }} />
            <Box sx={{ width: 104, flexShrink: 0 }}>
              <Stepper
                value={form.feeUnits}
                min={0}
                max={form.quantity}
                onChange={(n) => set('feeUnits', n)}
                ariaLabel="units with fee"
              />
            </Box>
          </Box>
          <Box
            sx={{
              fontSize: 9,
              color: tokens.text3,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              mt: 0.5,
              textAlign: 'right',
            }}
          >
            Units w/ fee
          </Box>
        </Field>
      </FieldRow>

      {kind === 'single' &&
        (showTag ? (
          <>
            <Field label="Tag (Optional)">
              <TextInput
                placeholder="e.g. PULLED"
                autoCapitalize="characters"
                onFocus={(e) => e.target.select()}
                {...text('extra')}
              />
            </Field>
            <LinkButton
              onClick={() => {
                setShowTag(false);
                set('extra', '');
              }}
            >
              − Remove tag
            </LinkButton>
          </>
        ) : (
          <LinkButton onClick={() => setShowTag(true)}>+ Add tag</LinkButton>
        ))}
    </Sheet>
  );
}
