import type { Session } from '@supabase/supabase-js';

import { createContext, useContext } from 'react';

import { APP_NAME } from '../../lib/brand';

export interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');

  return ctx;
}

export function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Wrong email or password.';
  if (/fetch|network/i.test(message)) return `Can't reach ${APP_NAME}. Check your connection and try again.`;

  return message;
}
