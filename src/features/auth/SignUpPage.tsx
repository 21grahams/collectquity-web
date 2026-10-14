import type { FormEvent } from 'react';

import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router';

import { SaveButton } from '../../components/SaveButton';
import { CODE_LENGTH, isCompleteCode, validateSignUp } from '../../lib/signUpForm';
import { useAuth } from './authContext';
import { AuthLayout } from './AuthLayout';
import { CodeField, EmailField, PasswordField } from './fields';

export function SignUpPage() {
  const { session, signUp, confirmSignUp, resendSignUpCode } = useAuth();
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [existing, setExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const errors = validateSignUp(email, password);
  const shown = attempted ? errors : {};
  const invalid = step === 'details' ? Object.keys(errors).length > 0 : !isCompleteCode(code);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (invalid) {
      setAttempted(true);

      return;
    }
    setSubmitting(true);
    setError(null);
    setNotice(null);
    if (step === 'details') {
      const result = await signUp(email, password);
      setExisting(result.existing);
      if (result.error) setError(result.error);
      else if (!result.existing) setStep('code');
    } else {
      const message = await confirmSignUp(email, code);
      if (message) setError(message);
    }
    setSubmitting(false);
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    const message = await resendSignUpCode(email);
    if (message) setError(message);
    else setNotice('Sent a new code.');
  }

  function useDifferentEmail() {
    setStep('details');
    setCode('');
    setError(null);
    setNotice(null);
  }

  if (step === 'code') {
    return (
      <AuthLayout onSubmit={handleSubmit}>
        <Typography align="center">
          We sent a {CODE_LENGTH}-digit code to <strong>{email.trim()}</strong>. Enter it to confirm your
          email.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {notice && <Alert severity="success">{notice}</Alert>}
        <CodeField value={code} onChange={setCode} />
        <SaveButton
          type="submit"
          size="large"
          invalid={invalid}
          pending={submitting}
          label="Confirm"
          pendingLabel="Confirming…"
        />
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Button size="small" onClick={handleResend}>
            Send a new code
          </Button>
          <Button size="small" onClick={useDifferentEmail}>
            Use a different email
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout onSubmit={handleSubmit}>
      <Typography variant="h6" align="center">
        Create your account
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {existing && (
        <Alert severity="info">
          That email already has an account.{' '}
          <Link component={RouterLink} to="/login">
            Log in instead
          </Link>
        </Alert>
      )}
      <EmailField value={email} onChange={setEmail} error={shown.email} />
      <PasswordField
        isNew
        value={password}
        onChange={setPassword}
        error={shown.password}
        helperText="At least 8 characters"
      />
      <SaveButton
        type="submit"
        size="large"
        invalid={invalid}
        pending={submitting}
        label="Create account"
        pendingLabel="Creating…"
      />
      <Typography variant="caption" color="text.secondary" align="center">
        For ages 18+. See how we handle your data in our{' '}
        <Link component={RouterLink} to="/privacy" color="inherit">
          Privacy Policy
        </Link>
        .
      </Typography>
      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Log in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
