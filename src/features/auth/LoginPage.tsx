import type { FormEvent } from 'react';

import { Alert, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router';

import { EyeButton } from '../../components/EyeButton';
import { SaveButton } from '../../components/SaveButton';
import { TAGLINE } from '../../lib/brand';
import { validateLogin } from '../../lib/loginForm';
import { useAuth } from './authContext';
import { AuthLayout } from './AuthLayout';

export function LoginPage() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthLayout onSubmit={handleSubmit}>
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
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!shown.password}
        helperText={shown.password}
        required
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: 0.5 }}>
                <EyeButton
                  revealed={showPassword}
                  what="password"
                  onClick={() => setShowPassword((s) => !s)}
                />
              </InputAdornment>
            ),
          },
        }}
      />
      <SaveButton
        type="submit"
        size="large"
        invalid={invalid}
        pending={submitting}
        label="Log in"
        pendingLabel="Logging in…"
      />
      <Typography variant="body2" align="center">
        New here?{' '}
        <Link component={RouterLink} to="/signup">
          Create an account
        </Link>
      </Typography>
      <Typography variant="caption" color="text.secondary" align="center">
        {TAGLINE}
      </Typography>
    </AuthLayout>
  );
}
