import type { ReactNode } from 'react';

import { Box, Button, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router';

import { ErrorState } from '../../components/ListStates';
import { useAccount } from '../../hooks/queries';
import { OnboardingPage } from '../onboarding/OnboardingPage';
import { useAuth } from './authContext';
import { InvitePage } from './InvitePage';

function Spinner() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const account = useAccount(!!session);

  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (account.isPending) return <Spinner />;
  // A failed re-check keeps the last answer, so a weak signal never pulls the app out from under you.
  if (!account.data) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <ErrorState error={account.error} onRetry={() => account.refetch()} />
          <Button size="small" color="inherit" onClick={signOut}>
            Log out
          </Button>
        </Box>
      </Box>
    );
  }
  if (!account.data.approved) return <InvitePage />;
  if (!account.data.onboarded) return <OnboardingPage />;

  return <>{children}</>;
}
