import type { Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import type { AuthContextValue } from './authContext';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { clearStickyMemory } from '../../hooks/useStickyState';
import { cachePersister } from '../../lib/queryClient';
import { supabase } from '../../lib/supabase';
import { AuthContext, friendlyAuthError } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));

    return () => data.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    loading,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

      return error ? friendlyAuthError(error.message) : null;
    },
    async signOut() {
      // 'local' = log out this device only. Supabase's default ('global')
      // would also end the session on every other device you're logged into.
      await supabase.auth.signOut({ scope: 'local' });
      // Drop every piece of loaded data so nothing lingers on the device.
      queryClient.clear();
      clearStickyMemory();
      await cachePersister.removeClient();
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
