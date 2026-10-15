import type { AuthContextValue } from './authContext';

import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '../../theme/theme';
import { AuthContext, friendlyAuthError } from './authContext';
import { LoginPage } from './LoginPage';

// The real AuthProvider talks to Supabase; these tests only need the
// context, so stub the client module out entirely.
vi.mock('../../lib/supabase', () => ({ supabase: {} }));

function renderLogin(overrides: Partial<AuthContextValue> = {}) {
  const value: AuthContextValue = {
    session: null,
    loading: false,
    redirectError: null,
    signInWithGoogle: vi.fn().mockResolvedValue(null),
    signIn: vi.fn().mockResolvedValue(null),
    signOut: vi.fn(),
    signUp: vi.fn(),
    confirmSignUp: vi.fn(),
    sendPasswordReset: vi.fn(),
    verifyResetCode: vi.fn(),
    setNewPassword: vi.fn(),
    resendSignUpCode: vi.fn(),
    ...overrides,
  };
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <AuthContext.Provider value={value}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>
    </ThemeProvider>,
  );

  return value;
}

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));
}

describe('LoginPage', () => {
  it('looks disabled until valid, and tapping it points at each problem field', async () => {
    const { signIn } = renderLogin();
    const button = screen.getByRole('button', { name: /log in/i });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'me@example' } });
    fireEvent.click(button);
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('passes the credentials to signIn', async () => {
    const auth = renderLogin();
    fillAndSubmit('me@example.com', 'hunter22');
    await waitFor(() => expect(auth.signIn).toHaveBeenCalledWith('me@example.com', 'hunter22'));
  });

  it('shows the error message when login fails', async () => {
    renderLogin({ signIn: vi.fn().mockResolvedValue('Wrong email or password.') });
    fillAndSubmit('me@example.com', 'nope');
    expect(await screen.findByText('Wrong email or password.')).toBeInTheDocument();
  });

  it('the eye shows and hides the password', () => {
    renderLogin();
    const password = screen.getByLabelText(/^password/i);
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByLabelText('Show password'));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('links to sign-up and password reset', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/reset');
  });
  it('offers Google sign-in and shows a failed one on return', async () => {
    const auth = renderLogin({ redirectError: 'Google sign-in failed.' });
    expect(screen.getByText('Google sign-in failed.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));
    await waitFor(() => expect(auth.signInWithGoogle).toHaveBeenCalled());
  });
});

describe('friendlyAuthError', () => {
  it('translates Supabase messages', () => {
    expect(friendlyAuthError('Invalid login credentials')).toBe('Wrong email or password.');
    expect(friendlyAuthError('Failed to fetch')).toMatch(/can't reach collectquity/i);
    expect(friendlyAuthError('Something else')).toBe('Something else');
  });
});
