import type { PopperProps } from '@mui/material';
import type { InputHTMLAttributes } from 'react';
import type { CatalogProduct } from '../api/types';

import { Autocomplete, Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { useCatalogSearch } from '../hooks/queries';
import { matchSuggestions } from '../lib/suggestions';
import { tokens } from '../theme/tokens';
import { TextInput } from './form';

type Option = string | CatalogProduct;

// On phones the field shares a row with Qty; the list spans the whole row so names don't wrap.
const fillRow: NonNullable<PopperProps['modifiers']>[number] = {
  name: 'fillRow',
  enabled: true,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  fn: ({ state }) => {
    const ref = state.elements.reference;
    const row = ref instanceof Element ? ref.closest('[data-field-row]') : null;
    if (row) {
      state.styles.popper = {
        ...state.styles.popper,
        width: `${row.getBoundingClientRect().right - ref.getBoundingClientRect().left}px`,
      };
    }
  },
};

/** Room between the field and the bottom of what's visible (above the keyboard on iPhone). */
function useRoomBelow(active: boolean) {
  const anchor = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<number>();
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const update = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (!rect) return;
      const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      setRoom(Math.max(120, visibleBottom - rect.bottom - 16));
    };
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);

    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
    };
  }, [active]);

  return { anchor, room };
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: string;
  onChange: (text: string) => void;
  options: readonly string[];
  /** Also suggest catalog products of this kind; picking one calls onPickProduct. */
  catalog?: CatalogProduct['kind'];
  onPickProduct?: (product: CatalogProduct) => void;
};

function ProductOption({ product }: { product: CatalogProduct }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.5, minWidth: 0 }}>
      <Box
        component="img"
        src={product.imageUrl ?? undefined}
        alt=""
        referrerPolicy="no-referrer"
        loading="lazy"
        sx={{
          width: 30,
          height: 42,
          objectFit: 'contain',
          flexShrink: 0,
          borderRadius: '3px',
          backgroundColor: tokens.surface,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</Box>
        <Box sx={{ fontSize: 12, color: tokens.text2 }}>
          {[product.number, product.setName].filter(Boolean).join(' · ')}
        </Box>
      </Box>
    </Box>
  );
}

/** A text input that suggests catalog products or previously saved values; anything new can still be typed. */
export function AutocompleteInput({
  value,
  onChange,
  options,
  catalog,
  onPickProduct,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const { products, searching } = useCatalogSearch(catalog ?? 'single', value, focused && !!catalog);
  const { anchor, room } = useRoomBelow(focused);

  return (
    <Box ref={anchor}>
      <Autocomplete<Option, false, true, true>
        freeSolo
        disableClearable
        blurOnSelect="touch"
        options={[...options, ...products]}
        inputValue={value}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
        getOptionKey={(o) => (typeof o === 'string' ? `saved:${o}` : o.tcgplayerId)}
        // Selecting a suggestion arrives here; a 'reset' from the component itself is ignored
        // so it can never blank the field.
        onInputChange={(_, text, reason) => {
          if (reason !== 'reset') onChange(text);
        }}
        onChange={(_, picked) => {
          if (typeof picked === 'string') onChange(picked);
          else if (picked) onPickProduct?.(picked);
        }}
        // With a catalog, saved values only cover what it doesn't have (e.g. a custom bundle),
        // so they wait until the search has come back empty.
        filterOptions={(opts, state) => {
          if (products.length) return products;
          if (catalog && (searching || state.inputValue.trim().length < 2)) return [];

          return matchSuggestions(
            opts.filter((o) => typeof o === 'string'),
            state.inputValue,
          );
        }}
        renderOption={({ key, ...props }, o) => (
          <li key={key} {...props}>
            {typeof o === 'string' ? o : <ProductOption product={o} />}
          </li>
        )}
        renderInput={(params) => (
          <Box ref={params.slotProps.input.ref} sx={{ position: 'relative' }}>
            <TextInput
              {...params.slotProps.htmlInput}
              {...inputProps}
              style={{ paddingRight: value ? 34 : undefined }}
              onFocus={(e) => {
                params.slotProps.htmlInput.onFocus?.(e);
                setFocused(true);
                e.target.select();
              }}
              onBlur={(e) => {
                params.slotProps.htmlInput.onBlur?.(e);
                setFocused(false);
              }}
            />
            {value && (
              <Box
                component="button"
                type="button"
                aria-label="Clear"
                // Keeps the keyboard up (no blur) so the new name can be typed right away.
                onPointerDown={(e: React.PointerEvent) => e.preventDefault()}
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  onChange('');
                  e.currentTarget.parentElement?.querySelector('input')?.focus();
                }}
                sx={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: tokens.text3,
                  fontSize: 15,
                  p: 0.75,
                  cursor: 'pointer',
                }}
              >
                ✕
              </Box>
            )}
          </Box>
        )}
        slotProps={{
          popper: { placement: 'bottom-start', modifiers: [fillRow] },
          listbox: { style: { maxHeight: room } },
          paper: {
            sx: {
              mt: 0.5,
              backgroundColor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
              color: tokens.text,
              '& .MuiAutocomplete-option': { fontSize: 15, minHeight: 44 },
            },
          },
        }}
      />
    </Box>
  );
}
