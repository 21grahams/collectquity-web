import type { FormEvent } from 'react';

import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate } from 'react-router';

import { PracticeBanner } from '../../components/PracticeBanner';
import { SaveButton } from '../../components/SaveButton';
import { Wordmark } from '../../components/Wordmark';
import { TAGLINE } from '../../lib/brand';
import { validateLogin } from '../../lib/loginForm';
import { useAuth } from './authContext';

export function LoginPage() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const errors = validateLogin(email, password);
  const invalid = Object.keys(errors).length > 0;
  const shown = attempted ? errors : {};

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (invalid) {
      setAttempted(true);

      return;
    }
    setSubmitting(true);
    setError(null);
    const message = await signIn(email, password);
    setSubmitting(false);
    if (message) setError(message);
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        pt: 'env(safe-area-inset-top)',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', maxWidth: 380 }}>
        <Stack spacing={2.5}>
          <PracticeBanner />
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Wordmark />
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!shown.email}
            helperText={shown.email}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!shown.password}
            helperText={shown.password}
            required
            fullWidth
          />
          <SaveButton
            type="submit"
            size="large"
            invalid={invalid}
            pending={submitting}
            label="Log in"
            pendingLabel="Logging in…"
          />
          <Typography variant="caption" color="text.secondary" align="center">
            {TAGLINE}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
