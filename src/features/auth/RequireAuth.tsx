import type { ReactNode } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router';

import { ErrorState } from '../../components/ListStates';
import { useAccount } from '../../hooks/queries';
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
  const { session, loading } = useAuth();
  const account = useAccount(!!session);

  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (account.isPending) return <Spinner />;
  if (account.isError) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
        <ErrorState error={account.error} onRetry={() => account.refetch()} />
      </Box>
    );
  }
  if (!account.data.approved) return <InvitePage />;

  return <>{children}</>;
}
