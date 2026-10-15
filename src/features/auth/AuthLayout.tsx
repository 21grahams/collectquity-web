import type { FormEvent, ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { PracticeBanner } from '../../components/PracticeBanner';
import { Wordmark } from '../../components/Wordmark';

/** The centered, logo-topped form shared by the screens you see before getting into the app. */
export function AuthLayout({
  onSubmit,
  tagline,
  children,
}: {
  onSubmit: (e: FormEvent) => void;
  /** Shown under the logo. */
  tagline?: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pl: 'max(16px, env(safe-area-inset-left))',
        pr: 'max(16px, env(safe-area-inset-right))',
        pt: 'env(safe-area-inset-top)',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ width: '100%', maxWidth: 380 }}>
        <Stack spacing={2.5}>
          <PracticeBanner />
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Wordmark />
            {tagline && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {tagline}
              </Typography>
            )}
          </Box>
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
