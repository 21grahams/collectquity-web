import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAuth } from './authContext';
import { AuthProvider } from './AuthProvider';

const signOut = vi.fn().mockResolvedValue({ error: null });
let authListener: (event: string, session: unknown) => void = () => {};

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (listener: typeof authListener) => {
        authListener = listener;

        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: (...args: unknown[]) => signOut(...args),
    },
  },
}));

function LogoutButton() {
  const { signOut: logOut } = useAuth();

  return <button onClick={() => logOut()}>Log out</button>;
}

describe('AuthProvider', () => {
  it('logs out only this device, never every device', async () => {
    const queryClient = new QueryClient();
    const clear = vi.spyOn(queryClient, 'clear');
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LogoutButton />
        </AuthProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ scope: 'local' }));
    await waitFor(() => expect(clear).toHaveBeenCalled()); // loaded data is wiped too
  });

  it("wipes the previous person's saved data when someone else's login takes over", async () => {
    const queryClient = new QueryClient();
    const clear = vi.spyOn(queryClient, 'clear');
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LogoutButton />
        </AuthProvider>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(authListener).toBeTypeOf('function'));
    act(() => authListener('SIGNED_IN', { user: { id: 'a' } }));
    clear.mockClear();

    act(() => authListener('TOKEN_REFRESHED', { user: { id: 'a' } }));
    expect(clear).not.toHaveBeenCalled();

    act(() => authListener('SIGNED_IN', { user: { id: 'b' } }));
    expect(clear).toHaveBeenCalled();
  });
});
