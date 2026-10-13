import type { FormLink } from '../../lib/itemForm';

import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, IconButton } from '@mui/material';

import { Segmented } from '../../components/form';
import { Field } from '../../components/Sheet';
import { tokens } from '../../theme/tokens';

const shortPrinting = (p: string) => p.replace('Holofoil', 'Holo').replace('1st Edition', '1st Ed.');

interface Props {
  link: FormLink | null;
  /** Something has been typed, so a hint to pick from the list makes sense. */
  named: boolean;
  printingError?: string;
  onChange: (link: FormLink | null) => void;
}

/** Which catalog product the item is priced from, with a way to unlink it. */
export function CatalogLink({ link, named, printingError, onChange }: Props) {
  if (!link) {
    if (!named) return null;

    return (
      <Box sx={{ fontSize: 12, color: tokens.text2, mt: -0.75, mb: 1.75 }}>
        Not auto-priced · pick a match from the suggestions to link it
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: -0.75, mb: 1.75, fontSize: 12 }}>
        <AutorenewRounded sx={{ fontSize: 14, color: tokens.blue, flexShrink: 0 }} />
        <Box sx={{ color: tokens.text2, minWidth: 0 }}>
          Auto-priced: {link.productName}
          {link.printing && link.printings.length <= 1 ? ` · ${link.printing}` : ''}
        </Box>
        <IconButton
          size="small"
          aria-label="Unlink from catalog"
          onClick={() => onChange(null)}
          sx={{ ml: 'auto', color: tokens.text2, p: 0.5 }}
        >
          <CloseRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
      {link.printings.length > 1 && (
        <Field label="Printing" error={printingError}>
          <Box data-field-box sx={{ border: '1px solid transparent', borderRadius: '9px' }}>
            <Segmented
              value={link.printing ?? ''}
              onChange={(printing) => onChange({ ...link, printing })}
              options={link.printings.map((p) => ({ value: p, label: shortPrinting(p) }))}
            />
          </Box>
        </Field>
      )}
    </>
  );
}
