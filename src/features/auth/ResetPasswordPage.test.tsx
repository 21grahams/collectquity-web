import type { AuthContextValue } from './authContext';

import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '../../theme/theme';
import { AuthContext } from './authContext';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('../../lib/supabase', () => ({ supabase: {} }));
vi.mock('../../components/notifyContext', () => ({ useNotify: () => vi.fn() }));

function renderReset(overrides: Partial<AuthContextValue> = {}) {
  const value = {
    session: null,
    loading: false,
    sendPasswordReset: vi.fn().mockResolvedValue(null),
    verifyResetCode: vi.fn().mockResolvedValue(null),
    setNewPassword: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as unknown as AuthContextValue;
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <AuthContext.Provider value={value}>
          <ResetPasswordPage />
        </AuthContext.Provider>
      </MemoryRouter>
    </ThemeProvider>,
  );

  return value;
}

async function reachCodeStep() {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'me@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /send code/i }));
  await screen.findByText(/choose a new password/i);
}

function submitCode(code: string, password: string) {
  if (code) fireEvent.change(screen.getByLabelText(/code/i), { target: { value: code } });
  fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /save new password/i }));
}

describe('ResetPasswordPage', () => {
  it('emails a code, then checks it and saves the new password', async () => {
    const auth = renderReset();
    await reachCodeStep();
    expect(auth.sendPasswordReset).toHaveBeenCalledWith('me@example.com');

    submitCode('123456', 'brand new pass');
    await waitFor(() => expect(auth.setNewPassword).toHaveBeenCalledWith('brand new pass'));
    expect(auth.verifyResetCode).toHaveBeenCalledWith('me@example.com', '123456');
  });

  it('keeps you on the code step when the code is wrong', async () => {
    const auth = renderReset({
      verifyResetCode: vi.fn().mockResolvedValue('That code is wrong or has expired.'),
    });
    await reachCodeStep();
    submitCode('000000', 'brand new pass');
    expect(await screen.findByText('That code is wrong or has expired.')).toBeInTheDocument();
    expect(auth.setNewPassword).not.toHaveBeenCalled();
  });

  it('after a refused password, retries only the password', async () => {
    const setNewPassword = vi
      .fn()
      .mockResolvedValueOnce('Choose a password different from your old one.')
      .mockResolvedValueOnce(null);
    const auth = renderReset({ setNewPassword });
    await reachCodeStep();
    submitCode('123456', 'old password');
    expect(await screen.findByText(/different from your old one/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^code/i)).not.toBeInTheDocument();

    submitCode('', 'another password');
    await waitFor(() => expect(setNewPassword).toHaveBeenLastCalledWith('another password'));
    expect(auth.verifyResetCode).toHaveBeenCalledTimes(1);
  });

  it('asks for a long enough new password', async () => {
    const auth = renderReset();
    await reachCodeStep();
    submitCode('123456', 'short');
    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument();
    expect(auth.verifyResetCode).not.toHaveBeenCalled();
  });
});
