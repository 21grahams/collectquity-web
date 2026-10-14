import type { AuthContextValue } from './authContext';

import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../api';
import { theme } from '../../theme/theme';
import { AuthContext } from './authContext';
import { InvitePage } from './InvitePage';

vi.mock('../../lib/supabase', () => ({ supabase: {} }));
vi.mock('../../api', () => ({ redeemInvite: vi.fn(), deleteMyAccount: vi.fn() }));
vi.mock('../../components/notifyContext', () => ({ useNotify: () => vi.fn() }));

function renderInvite() {
  const auth = { signOut: vi.fn() } as unknown as AuthContextValue;
  render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={new QueryClient()}>
        <AuthContext.Provider value={auth}>
          <InvitePage />
        </AuthContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>,
  );

  return auth;
}

function submit(code: string) {
  fireEvent.change(screen.getByLabelText(/invite code/i), { target: { value: code } });
  fireEvent.click(screen.getByRole('button', { name: /join/i }));
}

describe('InvitePage', () => {
  beforeEach(() => vi.mocked(api.redeemInvite).mockReset());

  it('sends the code with the device time zone', async () => {
    vi.mocked(api.redeemInvite).mockResolvedValue('joined');
    renderInvite();
    submit('beta-one');
    await waitFor(() =>
      expect(api.redeemInvite).toHaveBeenCalledWith(
        'beta-one',
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      ),
    );
  });

  it('explains a wrong code', async () => {
    vi.mocked(api.redeemInvite).mockResolvedValue('invalid');
    renderInvite();
    submit('nope');
    expect(await screen.findByText(/that code doesn't work/i)).toBeInTheDocument();
  });

  it('explains too many tries', async () => {
    vi.mocked(api.redeemInvite).mockResolvedValue('too_many');
    renderInvite();
    submit('nope');
    expect(await screen.findByText(/wait an hour/i)).toBeInTheDocument();
  });

  it('lets you log out', () => {
    const auth = renderInvite();
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('lets you delete the account without an invite', () => {
    renderInvite();
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    expect(screen.getByText('Delete your account?')).toBeInTheDocument();
  });
});
