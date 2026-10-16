import type { ReactNode } from 'react';

import { Box, Button, CircularProgress } from '@mui/material';

import { CONNECTION_MESSAGE, isConnectionError } from '../lib/errors';
import { tokens } from '../theme/tokens';

export function LoadingState() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
      <CircularProgress size={28} />
    </Box>
  );
}

export function EmptyState({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <Box sx={{ textAlign: 'center', py: 5, px: 2.5, color: tokens.text3 }}>
      <Box sx={{ fontSize: 32, mb: 1.25 }}>{icon}</Box>
      {children}
    </Box>
  );
}

function friendlyLoadError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (isConnectionError(message)) return CONNECTION_MESSAGE;

  return `Couldn't load this. ${message}`;
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <EmptyState icon="⚠️">
      <Box sx={{ color: tokens.text2, mb: 1.5 }}>{friendlyLoadError(error)}</Box>
      <Button variant="outlined" size="small" onClick={onRetry}>
        Try again
      </Button>
    </EmptyState>
  );
}

/** A section with nothing in it yet: one big + in the middle instead of the usual corner button. */
export function EmptyCollection({
  title,
  action,
  onAdd,
  note,
}: {
  title: string;
  action: string;
  onAdd: () => void;
  note?: string;
}) {
  return (
    <Box
      sx={{
        minHeight: '50dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1.5,
        px: 2.5,
      }}
    >
      <Box sx={{ fontSize: 16, color: tokens.text2 }}>{title}</Box>
      <Box
        component="button"
        type="button"
        aria-label={action}
        onClick={onAdd}
        sx={{
          width: 64,
          height: 64,
          borderRadius: '32px',
          border: 'none',
          backgroundColor: tokens.gold,
          color: tokens.bg,
          fontSize: 30,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(232,168,56,0.4)',
          display: 'grid',
          placeItems: 'center',
          transition: 'transform 0.15s',
          '&:active': { transform: 'scale(0.95)' },
        }}
      >
        +
      </Box>
      <Box sx={{ fontSize: 13, color: tokens.text3 }}>{action}</Box>
      {note && <Box sx={{ fontSize: 13, color: tokens.text3, mt: 2 }}>{note}</Box>}
    </Box>
  );
}
