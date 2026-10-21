import type { FormEvent, ReactNode } from 'react';

import { Box, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

import { PracticeBanner } from '../../components/PracticeBanner';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Wordmark } from '../../components/Wordmark';
import { APP_NAME } from '../../lib/brand';
import { isHomeScreenApp } from '../../lib/platform';

/** The centered, logo-topped form shared by the screens you see before getting into the app. */
export function AuthLayout({
  onSubmit,
  tagline,
  homeLink = false,
  children,
}: {
  onSubmit: (e: FormEvent) => void;
  /** Shown under the centered logo (only when there's no header). */
  tagline?: string;
  /** A header whose logo goes back to the landing page (logged-out screens, in a browser). */
  homeLink?: boolean;
  children: ReactNode;
}) {
  const header = homeLink && !isHomeScreenApp;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        pl: 'max(16px, env(safe-area-inset-left))',
        pr: 'max(16px, env(safe-area-inset-right))',
        pt: 'env(safe-area-inset-top)',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* In a browser, the corner logo leads back to the landing page, as on every site. */}
      {header && (
        <Box
          component="header"
          sx={{
            width: '100%',
            maxWidth: 1040,
            mx: 'auto',
            pt: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link component={RouterLink} to="/welcome" aria-label={`${APP_NAME} home`} underline="none">
            <Wordmark />
          </Link>
          <ThemeToggle />
        </Box>
      )}
      <Box
        sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: header ? 3 : 0 }}
      >
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ width: '100%', maxWidth: 380 }}>
          <Stack spacing={2.5}>
            <PracticeBanner />
            {!header && (
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Wordmark />
                {tagline && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {tagline}
                  </Typography>
                )}
              </Box>
            )}
            {children}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
