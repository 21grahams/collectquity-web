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
    signIn: vi.fn().mockResolvedValue(null),
    signOut: vi.fn(),
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
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
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

  it('has no sign-up or password-reset links (single user, sign-ups disabled)', () => {
    renderLogin();
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/forgot/i)).not.toBeInTheDocument();
  });
});

describe('friendlyAuthError', () => {
  it('translates Supabase messages', () => {
    expect(friendlyAuthError('Invalid login credentials')).toBe('Wrong email or password.');
    expect(friendlyAuthError('Failed to fetch')).toMatch(/can't reach collectquity/i);
    expect(friendlyAuthError('Something else')).toBe('Something else');
  });
});
