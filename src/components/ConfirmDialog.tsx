import type { ReactNode } from 'react';

import { Box, Button, CircularProgress, Dialog } from '@mui/material';

import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { fonts, tokens } from '../theme/tokens';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  pendingLabel?: string;
  /** Extra content between the message and the buttons. */
  children?: ReactNode;
  confirmDisabled?: boolean;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  pendingLabel = 'Removing…',
  children,
  confirmDisabled = false,
  pending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const online = useOnlineStatus();

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onCancel}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.75)' } },
        paper: {
          sx: {
            backgroundColor: tokens.surface,
            border: `1px solid ${tokens.border}`,
            borderRadius: '16px',
            p: 2.5,
            m: 2,
            width: '100%',
            maxWidth: 360,
          },
        },
      }}
    >
      <Box sx={{ fontFamily: fonts.serif, fontSize: 20, color: tokens.gold, mb: 1 }}>{title}</Box>
      <Box sx={{ fontSize: 14, color: tokens.text2, mb: 2.5, overflowWrap: 'anywhere' }}>{message}</Box>
      {children}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={pending || !online || confirmDisabled}
          startIcon={pending ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {!online ? 'Offline' : pending ? pendingLabel : confirmLabel}
        </Button>
      </Box>
    </Dialog>
  );
}
