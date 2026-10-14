import { InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';

import { EyeButton } from '../../components/EyeButton';
import { cleanCode } from '../../lib/signUpForm';

export function EmailField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <TextField
      label="Email"
      type="email"
      autoComplete="username"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error}
      required
      fullWidth
      slotProps={{ htmlInput: { inputMode: 'email', autoCapitalize: 'none' } }}
    />
  );
}

export function PasswordField({
  label = 'Password',
  isNew = false,
  value,
  onChange,
  error,
  helperText,
}: {
  label?: string;
  /** Choosing a password (sign-up, reset) rather than typing your current one. */
  isNew?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <TextField
      label={label}
      type={revealed ? 'text' : 'password'}
      autoComplete={isNew ? 'new-password' : 'current-password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error ?? helperText}
      required
      fullWidth
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end" sx={{ mr: 0.5 }}>
              <EyeButton revealed={revealed} what="password" onClick={() => setRevealed((r) => !r)} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export function CodeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <TextField
      label="Code"
      inputMode="numeric"
      autoComplete="one-time-code"
      value={value}
      onChange={(e) => onChange(cleanCode(e.target.value))}
      fullWidth
      autoFocus
      slotProps={{ htmlInput: { style: { letterSpacing: 8, fontSize: 22, textAlign: 'center' } } }}
    />
  );
}
