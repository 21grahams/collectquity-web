import type { Database } from '../types/database';

import { createClient } from '@supabase/supabase-js';

import { resolveDatabaseUrl } from './environment';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example)');
}

// The publishable key is meant to ship in the app: on its own it can't read
// or write anything. Data access comes from logging in, and the database's
// row level security only answers to accounts on its allow-list.
export const supabase = createClient<Database>(
  resolveDatabaseUrl(url, window.location.hostname),
  publishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Google sign-in comes back with ?code=…, which AuthProvider exchanges
      // itself; letting supabase-js scan the URL would clash with the
      // HashRouter's #/ routes.
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  },
);
