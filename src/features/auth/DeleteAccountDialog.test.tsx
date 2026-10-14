import type { AuthContextValue } from './authContext';

import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as api from '../../api';
import { theme } from '../../theme/theme';
import { AuthContext } from './authContext';
import { DeleteAccountDialog } from './DeleteAccountDialog';

vi.mock('../../lib/supabase', () => ({ supabase: {} }));
vi.mock('../../api', () => ({ deleteMyAccount: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../components/notifyContext', () => ({ useNotify: () => vi.fn() }));

describe('DeleteAccountDialog', () => {
  it('only deletes after DELETE is typed, then logs out', async () => {
    const auth = { signOut: vi.fn().mockResolvedValue(undefined) } as unknown as AuthContextValue;
    render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={new QueryClient()}>
          <AuthContext.Provider value={auth}>
            <DeleteAccountDialog open onClose={vi.fn()} />
          </AuthContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>,
    );
    const button = screen.getByRole('button', { name: /^delete$/i });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/type delete/i), { target: { value: 'delete' } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => expect(auth.signOut).toHaveBeenCalled());
    expect(api.deleteMyAccount).toHaveBeenCalled();
  });
});
