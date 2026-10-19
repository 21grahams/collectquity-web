import type { PopperProps } from '@mui/material';
import type { InputHTMLAttributes } from 'react';
import type { CatalogProduct } from '../api/types';

import OpenInFullRounded from '@mui/icons-material/OpenInFullRounded';
import { Autocomplete, Box, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useCatalogSearch } from '../hooks/queries';
import { lowestPrice, pricesByPrinting } from '../lib/catalogPrices';
import { matchSuggestions } from '../lib/suggestions';
import { fonts, tokens } from '../theme/tokens';
import { ArtViewer } from './ArtViewer';
import { sheetButtonSx } from './buttonStyles';
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

const productDetails = (p: CatalogProduct) => [p.number, p.setName].filter(Boolean).join(' · ');

function ProductOption({ product, onPreview }: { product: CatalogProduct; onPreview: () => void }) {
  const price = lowestPrice(product.prices);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.5, minWidth: 0, width: '100%' }}>
      {/* Tapping the picture enlarges it; anywhere else on the row picks the product. Screen readers
          can't use a button inside a list option, so it's hidden from them; without a picture it's
          plain, so a tap there still picks the row. */}
      <Box
        {...(product.imageUrl && {
          component: 'button' as const,
          type: 'button' as const,
          tabIndex: -1,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onPreview();
          },
        })}
        aria-hidden
        sx={{
          position: 'relative',
          flexShrink: 0,
          p: '4px',
          m: '-4px',
          border: 'none',
          background: 'none',
          cursor: product.imageUrl ? 'zoom-in' : 'inherit',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
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
            display: 'block',
            borderRadius: '3px',
            backgroundColor: tokens.surface,
          }}
        />
        {product.imageUrl && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 16,
              height: 16,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              backgroundColor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
              color: tokens.text2,
            }}
          >
            <OpenInFullRounded sx={{ fontSize: 9 }} />
          </Box>
        )}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</Box>
        <Box sx={{ fontSize: 12, color: tokens.text2 }}>{productDetails(product)}</Box>
      </Box>
      {price && (
        <Box
          sx={{
            fontFamily: fonts.mono,
            fontSize: 13,
            color: tokens.blue,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            pl: 1,
            ml: 'auto',
            textAlign: 'right',
          }}
        >
          {price.from ? `from ${price.amount}` : price.amount}
        </Box>
      )}
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
  const [listOpen, setListOpen] = useState(false);
  const [preview, setPreview] = useState<CatalogProduct | null>(null);
  const { products, searching } = useCatalogSearch(catalog ?? 'single', value, focused && !!catalog);
  const { anchor, room } = useRoomBelow(focused);
  const previewPrices = preview && (pricesByPrinting(preview.prices) ?? lowestPrice(preview.prices)?.amount);
  // The preview has to be gone before the field takes focus back, or it pulls the focus into
  // itself; doing both in the same tap keeps the iPhone keyboard coming back up.
  const closePreview = () => {
    flushSync(() => setPreview(null));
    anchor.current?.querySelector('input')?.focus();
  };

  return (
    <Box ref={anchor}>
      <Autocomplete<Option, false, true, true>
        freeSolo
        disableClearable
        // The preview takes focus; the list stays open behind it for "Back".
        open={listOpen}
        onOpen={() => setListOpen(true)}
        onClose={() => !preview && setListOpen(false)}
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
            {typeof o === 'string' ? o : <ProductOption product={o} onPreview={() => setPreview(o)} />}
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
                if (!preview) setFocused(false);
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
      {preview?.imageUrl && (
        <ArtViewer
          url={preview.imageUrl}
          open
          onClose={closePreview}
          restoreFocus={false}
          caption={
            <>
              <div>{preview.name}</div>
              <Box sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{productDetails(preview)}</Box>
              {previewPrices && (
                <Box sx={{ fontFamily: fonts.mono, fontSize: 13, mt: 0.5 }}>{previewPrices}</Box>
              )}
            </>
          }
          actions={
            <>
              <Button
                variant="outlined"
                sx={{ ...sheetButtonSx, px: 2.5, color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
                onClick={closePreview}
              >
                Back
              </Button>
              <Button
                variant="contained"
                sx={{ ...sheetButtonSx, flex: 1 }}
                onClick={() => {
                  onPickProduct?.(preview);
                  setPreview(null);
                  setListOpen(false);
                  setFocused(false);
                }}
              >
                {preview.kind === 'single' ? 'Use this card' : 'Use this product'}
              </Button>
            </>
          }
        />
      )}
    </Box>
  );
}
