import type { FormEvent } from 'react';

import { Alert, Link, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router';

import { SaveButton } from '../../components/SaveButton';
import { TAGLINE } from '../../lib/brand';
import { validateLogin } from '../../lib/loginForm';
import { useAuth } from './authContext';
import { AuthLayout } from './AuthLayout';
import { EmailField, PasswordField } from './fields';
import { GoogleButton } from './GoogleButton';

export function LoginPage() {
  const { session, signIn, redirectError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(redirectError);
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
    <AuthLayout onSubmit={handleSubmit} tagline={TAGLINE}>
      {error && <Alert severity="error">{error}</Alert>}
      <GoogleButton onError={setError} />
      <EmailField value={email} onChange={setEmail} error={shown.email} />
      <PasswordField value={password} onChange={setPassword} error={shown.password} />
      <Link component={RouterLink} to="/reset" variant="body2" sx={{ alignSelf: 'flex-end' }}>
        Forgot password?
      </Link>
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
      <Typography variant="caption" align="center" sx={{ pt: 1 }}>
        <Link component={RouterLink} to="/privacy" color="text.secondary">
          Privacy
        </Link>
      </Typography>
    </AuthLayout>
  );
}
