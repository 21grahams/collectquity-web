import type { FormEvent } from 'react';

import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { SaveButton } from '../../components/SaveButton';
import { useRedeemInvite } from '../../hooks/mutations';
import { useAuth } from './authContext';
import { AuthLayout } from './AuthLayout';
import { DeleteAccountDialog } from './DeleteAccountDialog';

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
  const [deleting, setDeleting] = useState(false);
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
        autoComplete="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        fullWidth
        slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
      />
      <SaveButton
        type="submit"
        size="large"
        invalid={invalid}
        pending={redeem.isPending}
        label="Join"
        pendingLabel="Joining…"
      />
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Button size="small" color="inherit" onClick={signOut}>
          Log out
        </Button>
        <Button size="small" color="error" onClick={() => setDeleting(true)}>
          Delete account
        </Button>
      </Stack>
      <DeleteAccountDialog open={deleting} onClose={() => setDeleting(false)} />
    </AuthLayout>
  );
}
