import type { FormEvent } from 'react';

import { Alert, Button, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router';

import { EyeButton } from '../../components/EyeButton';
import { SaveButton } from '../../components/SaveButton';
import { cleanCode, CODE_LENGTH, isCompleteCode, validateSignUp } from '../../lib/signUpForm';
import { useAuth } from './authContext';
import { AuthLayout } from './AuthLayout';

export function SignUpPage() {
  const { session, signUp, confirmSignUp, resendSignUpCode } = useAuth();
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        <TextField
          label="Code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(cleanCode(e.target.value))}
          fullWidth
          autoFocus
          slotProps={{ htmlInput: { style: { letterSpacing: 8, fontSize: 22, textAlign: 'center' } } }}
        />
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
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!shown.password}
        helperText={shown.password ?? 'At least 8 characters'}
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
        label="Create account"
        pendingLabel="Creating…"
      />
      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Log in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
