import type { ReactNode } from 'react';

import { Box, Modal } from '@mui/material';

import { artUrl } from '../lib/cardArt';

/**
 * Catalog art full-screen. Without `actions`, a tap anywhere closes it; with them (e.g. "Use this
 * card"), only the buttons or a tap outside the picture do.
 */
export function ArtViewer({
  url,
  open,
  onClose,
  caption,
  actions,
  restoreFocus = true,
}: {
  url: string;
  open: boolean;
  onClose: () => void;
  caption?: ReactNode;
  actions?: ReactNode;
  /** Off when the caller moves focus itself. */
  restoreFocus?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      disableRestoreFocus={!restoreFocus}
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.88)' } } }}
    >
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 3,
          pt: 'calc(env(safe-area-inset-top) + 24px)',
          pb: 'calc(env(safe-area-inset-bottom) + 24px)',
          outline: 'none',
          cursor: actions ? 'default' : 'zoom-out',
        }}
      >
        <Box
          component="img"
          src={artUrl(url, 'full')}
          alt=""
          referrerPolicy="no-referrer"
          onClick={actions ? (e: React.MouseEvent) => e.stopPropagation() : undefined}
          sx={{
            maxWidth: '100%',
            minHeight: 0,
            flex: '0 1 auto',
            objectFit: 'contain',
            borderRadius: '12px',
          }}
        />
        {caption && (
          <Box
            onClick={(e: React.MouseEvent) => actions && e.stopPropagation()}
            sx={{ color: '#fff', textAlign: 'center', fontSize: 15, lineHeight: 1.4 }}
          >
            {caption}
          </Box>
        )}
        {actions && (
          <Box
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{ display: 'flex', gap: 1.5, width: '100%', maxWidth: 400, flexShrink: 0 }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Modal>
  );
}
