import type { ChangeEvent } from 'react';
import type { SinglesFilters } from '../../lib/singlesFilter';

import { Box, Button } from '@mui/material';
import { useState } from 'react';

import { sheetButtonSx } from '../../components/buttonStyles';
import { Field, Sheet } from '../../components/Sheet';
import { emptyFilters, sameFilters } from '../../lib/singlesFilter';
import { tokens } from '../../theme/tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  filters: SinglesFilters;
  onApply: (filters: SinglesFilters) => void;
  options: { pokemon: string[]; setName: string[]; condition: string[] };
}

// Native <select>/<input type="date"> on purpose: on iPhone they open the
// system wheel pickers, as in the old app.
const inputSx = {
  width: '100%',
  backgroundColor: tokens.surface2,
  border: `1px solid ${tokens.border}`,
  borderRadius: '8px',
  padding: '11px 13px',
  color: tokens.text,
  fontFamily: 'inherit',
  fontSize: 16, // 16px+ so iOS doesn't zoom on focus
  outline: 'none',
  WebkitAppearance: 'none' as const,
};
// An empty date input on iPhone has nothing inside to give it height, so it shrinks; it also
// centers its date unlike the other fields.
const dateSx = {
  ...inputSx,
  display: 'block',
  minHeight: 46,
  '&::-webkit-date-and-time-value': { textAlign: 'left' },
};

/** Computers show "mm/dd/yyyy" in an empty date box; iPhones show nothing, so this adds "Any date". */
function DateFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Box component="input" type="date" sx={dateSx} value={value} onChange={onChange} />
      {!value && (
        <Box
          aria-hidden
          sx={{
            display: 'none',
            // Only iPhone/iPad Safari (WebKit on iOS) understands this, so other browsers keep their own text.
            '@supports (-webkit-touch-callout: none)': { display: 'block' },
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 16,
            color: tokens.text3,
            pointerEvents: 'none',
          }}
        >
          Any date
        </Box>
      )}
    </Box>
  );
}

export function SinglesFilterSheet({ open, onClose, filters, onApply, options }: Props) {
  const [draft, setDraft] = useState(filters);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(filters);
  }

  const set = (key: keyof SinglesFilters) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const select = (key: 'pokemon' | 'setName' | 'condition', allLabel: string) => (
    <select style={inputSx} value={draft[key]} onChange={set(key)}>
      <option value="">{allLabel}</option>
      {options[key].map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filter Cards"
      closeButton
      footer={
        <>
          <Button
            variant="outlined"
            color="inherit"
            sx={{ ...sheetButtonSx, px: 2.5 }}
            disabled={sameFilters(filters, emptyFilters) && sameFilters(draft, emptyFilters)}
            onClick={() => {
              onApply(emptyFilters);
              onClose();
            }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            sx={sheetButtonSx}
            disabled={sameFilters(draft, filters)}
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply
          </Button>
        </>
      }
    >
      <Field label="Pokémon">{select('pokemon', 'All Pokémon')}</Field>
      <Field label="Set">{select('setName', 'All Sets')}</Field>
      <Field label="Condition">{select('condition', 'All Conditions')}</Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Purchased From">
          <DateFilter value={draft.dateFrom} onChange={set('dateFrom')} />
        </Field>
        <Field label="Purchased To">
          <DateFilter value={draft.dateTo} onChange={set('dateTo')} />
        </Field>
      </div>
    </Sheet>
  );
}
