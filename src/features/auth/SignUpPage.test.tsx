import type { AuthContextValue } from './authContext';

import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '../../theme/theme';
import { AuthContext } from './authContext';
import { SignUpPage } from './SignUpPage';

vi.mock('../../lib/supabase', () => ({ supabase: {} }));

function renderSignUp(overrides: Partial<AuthContextValue> = {}) {
  const value: AuthContextValue = {
    session: null,
    loading: false,
    signInWithGoogle: vi.fn().mockResolvedValue(null),
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn().mockResolvedValue({ error: null, existing: false }),
    confirmSignUp: vi.fn().mockResolvedValue(null),
    sendPasswordReset: vi.fn(),
    verifyResetCode: vi.fn(),
    setNewPassword: vi.fn(),
    resendSignUpCode: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <AuthContext.Provider value={value}>
          <SignUpPage />
        </AuthContext.Provider>
      </MemoryRouter>
    </ThemeProvider>,
  );

  return value;
}

function fillDetails(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
}

describe('SignUpPage', () => {
  it('asks for a longer password before signing up', async () => {
    const auth = renderSignUp();
    fillDetails('me@example.com', 'short');
    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('signs up, then confirms the emailed code', async () => {
    const auth = renderSignUp();
    fillDetails('me@example.com', 'long enough');
    await waitFor(() => expect(auth.signUp).toHaveBeenCalledWith('me@example.com', 'long enough'));
    expect(await screen.findByText(/we sent a 6-digit code/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/code/i), { target: { value: '123 456' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(auth.confirmSignUp).toHaveBeenCalledWith('me@example.com', '123456'));
  });

  it('points an existing account to the login screen instead of sending a code', async () => {
    renderSignUp({ signUp: vi.fn().mockResolvedValue({ error: null, existing: true }) });
    fillDetails('me@example.com', 'long enough');
    expect(await screen.findByText(/already has an account/i)).toBeInTheDocument();
    expect(screen.queryByText(/we sent a 6-digit code/i)).not.toBeInTheDocument();
  });

  it('shows a wrong code as an error and stays on the code step', async () => {
    renderSignUp({ confirmSignUp: vi.fn().mockResolvedValue('That code is wrong or has expired.') });
    fillDetails('me@example.com', 'long enough');
    fireEvent.change(await screen.findByLabelText(/code/i), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(await screen.findByText('That code is wrong or has expired.')).toBeInTheDocument();
  });
});
