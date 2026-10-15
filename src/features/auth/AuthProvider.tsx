import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { AuthContextValue } from './authContext';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { clearStickyMemory } from '../../hooks/useStickyState';
import { cacheOwner, cachePersister } from '../../lib/queryClient';
import { supabase } from '../../lib/supabase';
import { AuthContext, friendlyAuthError } from './authContext';

const GOOGLE_FAILED = "Google sign-in didn't finish. Try again, or use your email and password.";

async function clearDeviceData(queryClient: QueryClient) {
  queryClient.clear();
  clearStickyMemory();
  cacheOwner.clear();
  await cachePersister.removeClient();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // Each open tab also remembers who it last showed, since another tab may have already
  // updated the shared owner record before this tab hears about the change.
  const tabUserId = useRef<string | null>(null);

  useEffect(() => {
    // A login can end without Log out (expired, or the password changed elsewhere), so the saved
    // data is wiped when a different person logs in, not only on Log out. The same person coming
    // back keeps theirs (it's their offline copy).
    function track(event: AuthChangeEvent | 'START', next: Session | null) {
      const userId = next?.user.id ?? null;
      if (event === 'SIGNED_IN') setRedirectError(null);
      if (event === 'SIGNED_OUT') {
        void clearDeviceData(queryClient);
      } else if (userId) {
        const owner = cacheOwner.get();
        const switched = (owner && owner !== userId) || (tabUserId.current && tabUserId.current !== userId);
        if (switched || cacheOwner.hasUnownedCache()) void clearDeviceData(queryClient);
        cacheOwner.set(userId);
        tabUserId.current = userId;
      }
      setSession(next);
    }

    async function start() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const failure = params.get('error_description') ?? params.get('error');
      if (code || failure) {
        // Back from Google: take the sign-in (or its error), then tidy the address bar.
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        // A fixed message, never the address's own text, so a crafted link can't put words on the page.
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) setRedirectError(GOOGLE_FAILED);
        } else if (failure && !/access_denied/i.test(failure)) {
          setRedirectError(GOOGLE_FAILED);
        }
      }
      const { data } = await supabase.auth.getSession();
      track('START', data.session);
      setLoading(false);
    }

    void start();
    const { data } = supabase.auth.onAuthStateChange((event, next) => track(event, next));

    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const value: AuthContextValue = {
    session,
    loading,
    redirectError,
    async signInWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
      });

      return error ? friendlyAuthError(error.message) : null;
    },
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

      return error ? friendlyAuthError(error.message) : null;
    },
    async signOut() {
      // 'local' = log out this device only. Supabase's default ('global')
      // would also end the session on every other device you're logged into.
      await supabase.auth.signOut({ scope: 'local' });
      // Drop every piece of loaded data so nothing lingers on the device.
      await clearDeviceData(queryClient);
    },
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) return { error: friendlyAuthError(error.message), existing: false };

      // Supabase answers an already-registered email with a user that has no identities (and sends nothing).
      return { error: null, existing: data.user?.identities?.length === 0 };
    },
    async confirmSignUp(email, code) {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'signup' });

      return error ? friendlyAuthError(error.message) : null;
    },
    async resendSignUpCode(email) {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });

      return error ? friendlyAuthError(error.message) : null;
    },
    async sendPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      // Only real accounts hit the resend wait, so showing it would reveal the email has an account.
      if (error && /only request this after/i.test(error.message)) return null;

      return error ? friendlyAuthError(error.message) : null;
    },
    async verifyResetCode(email, code) {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'recovery' });

      return error ? friendlyAuthError(error.message) : null;
    },
    async setNewPassword(password) {
      const { error } = await supabase.auth.updateUser({ password });

      return error ? friendlyAuthError(error.message) : null;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
