import type { FormEvent } from 'react';

import { Alert, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { SaveButton } from '../../components/SaveButton';
import { useRedeemInvite } from '../../hooks/mutations';
import { useAuth } from './authContext';
import { AuthLayout } from './AuthLayout';

const MESSAGES = {
  invalid: "That code doesn't work. Check it and try again.",
  too_many: 'Too many tries. Wait an hour, then try again.',
} as const;

/** What a login sees until it redeems an invite code. */
export function InvitePage() {
  const { signOut } = useAuth();
  const redeem = useRedeemInvite();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const invalid = !code.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (invalid || redeem.isPending) return;
    setError(null);
    try {
      const result = await redeem.mutateAsync(code);
      if (result !== 'joined') setError(MESSAGES[result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AuthLayout onSubmit={handleSubmit}>
      <Typography variant="h6" align="center">
        You're almost in
      </Typography>
      <Typography align="center" color="text.secondary">
        The beta is invite-only. Enter your invite code to get started.
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Invite code"
        autoCapitalize="characters"
        autoComplete="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        fullWidth
      />
      <SaveButton
        type="submit"
        size="large"
        invalid={invalid}
        pending={redeem.isPending}
        label="Join"
        pendingLabel="Joining…"
      />
      <Button size="small" onClick={signOut}>
        Log out
      </Button>
    </AuthLayout>
  );
}
