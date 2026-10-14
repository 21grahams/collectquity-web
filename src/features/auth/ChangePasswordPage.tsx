import type { FormEvent } from 'react';

import { Alert, Link, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router';

import { useNotify } from '../../components/notifyContext';
import { SaveButton } from '../../components/SaveButton';
import { validateNewPassword } from '../../lib/signUpForm';
import { useAuth } from './authContext';
import { AuthLayout } from './AuthLayout';
import { PasswordField } from './fields';

export function ChangePasswordPage() {
  const { session, signIn, setNewPassword } = useAuth();
  const notify = useNotify();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return <Navigate to="/" replace />;

  const passwordError =
    validateNewPassword(password) ??
    (password === current ? 'Choose a password different from your current one' : undefined);
  const invalid = !current || !!passwordError;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (invalid) {
      setAttempted(true);

      return;
    }
    setSubmitting(true);
    setError(null);
    // Re-checking the current password keeps someone holding an unlocked phone from changing it.
    const wrong = await signIn(session?.user.email ?? '', current);
    const saveError = wrong ? null : await setNewPassword(password);
    setSubmitting(false);
    if (wrong) setError(wrong === 'Wrong email or password.' ? 'Your current password is wrong.' : wrong);
    else if (saveError) setError(saveError);
    else {
      notify('Password changed', 'success');
      setDone(true);
    }
  }

  return (
    <AuthLayout onSubmit={handleSubmit}>
      <Typography variant="h6" align="center">
        Change your password
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <PasswordField
        label="Current password"
        value={current}
        onChange={setCurrent}
        error={attempted && !current ? 'Enter your current password' : undefined}
      />
      <PasswordField
        label="New password"
        isNew
        value={password}
        onChange={setPassword}
        error={attempted ? passwordError : undefined}
        helperText="At least 8 characters"
      />
      <SaveButton
        type="submit"
        size="large"
        invalid={invalid}
        pending={submitting}
        label="Save new password"
        pendingLabel="Saving…"
      />
      <Typography variant="body2" align="center">
        Forgot it?{' '}
        <Link component={RouterLink} to="/reset">
          Reset with an email code
        </Link>
        {' · '}
        <Link component={RouterLink} to="/">
          Cancel
        </Link>
      </Typography>
    </AuthLayout>
  );
}
