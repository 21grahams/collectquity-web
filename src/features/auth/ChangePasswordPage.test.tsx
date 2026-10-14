import type { AuthContextValue } from './authContext';

import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '../../theme/theme';
import { AuthContext } from './authContext';
import { ChangePasswordPage } from './ChangePasswordPage';

vi.mock('../../lib/supabase', () => ({ supabase: {} }));
vi.mock('../../components/notifyContext', () => ({ useNotify: () => vi.fn() }));

function renderPage(overrides: Partial<AuthContextValue> = {}) {
  const value = {
    session: { user: { email: 'me@example.com' } },
    signIn: vi.fn().mockResolvedValue(null),
    setNewPassword: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as unknown as AuthContextValue;
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <AuthContext.Provider value={value}>
          <ChangePasswordPage />
        </AuthContext.Provider>
      </MemoryRouter>
    </ThemeProvider>,
  );

  return value;
}

function submit(current: string, next: string) {
  fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: current } });
  fireEvent.change(screen.getByLabelText(/^new password/i), { target: { value: next } });
  fireEvent.click(screen.getByRole('button', { name: /save new password/i }));
}

describe('ChangePasswordPage', () => {
  it('checks the current password, then saves the new one', async () => {
    const auth = renderPage();
    submit('old password', 'brand new pass');
    await waitFor(() => expect(auth.setNewPassword).toHaveBeenCalledWith('brand new pass'));
    expect(auth.signIn).toHaveBeenCalledWith('me@example.com', 'old password');
  });

  it('refuses a wrong current password without changing anything', async () => {
    const auth = renderPage({ signIn: vi.fn().mockResolvedValue('Wrong email or password.') });
    submit('guess', 'brand new pass');
    expect(await screen.findByText('Your current password is wrong.')).toBeInTheDocument();
    expect(auth.setNewPassword).not.toHaveBeenCalled();
  });

  it('refuses the same password as the current one before sending anything', async () => {
    const auth = renderPage();
    submit('same password', 'same password');
    expect(await screen.findByText(/different from your current one/i)).toBeInTheDocument();
    expect(auth.signIn).not.toHaveBeenCalled();
  });
});
