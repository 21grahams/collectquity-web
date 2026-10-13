import { Box, Modal } from '@mui/material';
import { useState } from 'react';

import { artUrl } from '../lib/cardArt';
import { tokens } from '../theme/tokens';

/** The item's catalog art; tapping it shows it full-screen, tapping again closes. */
export function CardArt({ url, width, height }: { url: string; width: number; height: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        component="button"
        type="button"
        aria-label="View card art"
        onClick={() => setOpen(true)}
        sx={{
          width,
          height,
          flexShrink: 0,
          p: 0,
          border: 'none',
          borderRadius: '5px',
          overflow: 'hidden',
          backgroundColor: tokens.surface2,
          cursor: 'zoom-in',
        }}
      >
        <Box
          component="img"
          src={artUrl(url, 'card')}
          alt=""
          loading="lazy"
          sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </Box>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.88)' } } }}
      >
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            outline: 'none',
            cursor: 'zoom-out',
          }}
        >
          <Box
            component="img"
            src={artUrl(url, 'full')}
            alt=""
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }}
          />
        </Box>
      </Modal>
    </>
  );
}
