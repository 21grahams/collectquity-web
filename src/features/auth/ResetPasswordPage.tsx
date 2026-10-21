import type { FormEvent } from 'react';

import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router';

import { useNotify } from '../../components/notifyContext';
import { SaveButton } from '../../components/SaveButton';
import { validateLogin } from '../../lib/loginForm';
import { CODE_LENGTH, isCompleteCode, validateNewPassword } from '../../lib/signUpForm';
import { useAuth } from './authContext';
import { AuthLayout } from './AuthLayout';
import { CodeField, EmailField, PasswordField } from './fields';

export function ResetPasswordPage() {
  const { session, sendPasswordReset, verifyResetCode, setNewPassword } = useAuth();
  const notify = useNotify();
  const [step, setStep] = useState<'email' | 'code'>('email');
  // Filled in from the login once it loads, until you type your own.
  const [typedEmail, setEmail] = useState<string | null>(null);
  const email = typedEmail ?? session?.user.email ?? '';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  // The code logs you in once; if the new password is then refused, only the password is retried.
  const [verified, setVerified] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  if (done) return <Navigate to="/" replace />;

  const emailError = validateLogin(email, '').email;
  const passwordError = validateNewPassword(password);
  const invalid = step === 'email' ? !!emailError : !!passwordError || (!verified && !isCompleteCode(code));

  async function sendCode() {
    const message = await sendPasswordReset(email);
    if (message) setError(message);
    else setStep('code');

    return !message;
  }

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
    if (step === 'email') {
      await sendCode();
      setAttempted(false);
    } else {
      const codeError = verified ? null : await verifyResetCode(email, code);
      if (codeError) setError(codeError);
      else {
        setVerified(true);
        const saveError = await setNewPassword(password);
        if (saveError) setError(saveError);
        else {
          notify('Password changed', 'success');
          setDone(true);
        }
      }
    }
    setSubmitting(false);
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    if (await sendCode()) setNotice('Sent a new code.');
  }

  function useDifferentEmail() {
    setStep('email');
    setCode('');
    setError(null);
    setNotice(null);
  }

  if (step === 'code') {
    return (
      <AuthLayout onSubmit={handleSubmit} homeLink>
        <Typography variant="h6" align="center">
          Check your email
        </Typography>
        <Typography align="center">
          If <strong>{email.trim()}</strong> has an account, we sent it a {CODE_LENGTH}-digit code. Enter it
          and choose a new password.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {notice && <Alert severity="success">{notice}</Alert>}
        {!verified && <CodeField value={code} onChange={setCode} />}
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
        {!verified && (
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Button size="small" onClick={handleResend}>
              Send a new code
            </Button>
            <Button size="small" onClick={useDifferentEmail}>
              Use a different email
            </Button>
          </Stack>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout onSubmit={handleSubmit} homeLink>
      <Typography variant="h6" align="center">
        Reset your password
      </Typography>
      <Typography align="center" color="text.secondary">
        We'll email you a code to choose a new one.
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <EmailField value={email} onChange={setEmail} error={attempted ? emailError : undefined} />
      <SaveButton
        type="submit"
        size="large"
        invalid={invalid}
        pending={submitting}
        label="Send code"
        pendingLabel="Sending…"
      />
      <Typography variant="body2" align="center">
        <Link component={RouterLink} to="/login">
          Back to log in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
