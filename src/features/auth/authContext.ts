import type { Session } from '@supabase/supabase-js';

import { createContext, useContext } from 'react';

import { APP_NAME } from '../../lib/brand';

export interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  confirmSignUp: (email: string, code: string) => Promise<string | null>;
  resendSignUpCode: (email: string) => Promise<string | null>;
}

/** existing: the email already has an account, so no code was sent. */
export interface SignUpResult {
  error: string | null;
  existing: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');

  return ctx;
}

export function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Wrong email or password.';
  if (/email not confirmed/i.test(message)) {
    return 'Confirm your email first: tap "Create an account" and sign up again to get a new code.';
  }
  if (/token has expired or is invalid/i.test(message)) return 'That code is wrong or has expired.';
  if (/fetch|network/i.test(message)) return `Can't reach ${APP_NAME}. Check your connection and try again.`;

  return message;
}
