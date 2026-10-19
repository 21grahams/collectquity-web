import type { FormLink } from '../../lib/itemForm';

import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, IconButton } from '@mui/material';
import { useState } from 'react';

import { ArtViewer } from '../../components/ArtViewer';
import { Segmented } from '../../components/form';
import { Field } from '../../components/Sheet';
import { shortPrinting } from '../../lib/catalogPrices';
import { tokens } from '../../theme/tokens';

interface Props {
  link: FormLink | null;
  /** Something has been typed, so a hint to pick from the list makes sense. */
  named: boolean;
  printingError?: string;
  onChange: (link: FormLink | null) => void;
}

/** Which catalog product the item is priced from, with a way to unlink it. */
export function CatalogLink({ link, named, printingError, onChange }: Props) {
  const [viewing, setViewing] = useState(false);
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          mt: -0.75,
          mb: 1.75,
          p: 1,
          borderRadius: '10px',
          border: `1px solid ${tokens.border}`,
          backgroundColor: tokens.surface2,
        }}
      >
        {link.imageUrl && (
          <Box
            component="button"
            type="button"
            aria-label={`Enlarge picture of ${link.productName}`}
            onClick={() => setViewing(true)}
            sx={{ p: 0, border: 'none', background: 'none', flexShrink: 0, cursor: 'zoom-in' }}
          >
            <Box
              component="img"
              src={link.imageUrl}
              alt=""
              referrerPolicy="no-referrer"
              sx={{ width: 44, height: 62, objectFit: 'contain', display: 'block', borderRadius: '4px' }}
            />
          </Box>
        )}
        <Box sx={{ minWidth: 0, fontSize: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: tokens.blue }}>
            <AutorenewRounded sx={{ fontSize: 14 }} />
            Auto-priced
          </Box>
          <Box sx={{ color: tokens.text, fontSize: 14, mt: '2px' }}>
            {link.productName}
            {link.printing && link.printings.length <= 1 ? ` · ${link.printing}` : ''}
          </Box>
        </Box>
        <IconButton
          size="small"
          aria-label="Unlink from catalog"
          onClick={() => onChange(null)}
          sx={{ ml: 'auto', color: tokens.text2, p: 0.5, alignSelf: 'flex-start' }}
        >
          <CloseRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
      {link.imageUrl && (
        <ArtViewer
          url={link.imageUrl}
          open={viewing}
          onClose={() => setViewing(false)}
          caption={link.productName}
        />
      )}
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
