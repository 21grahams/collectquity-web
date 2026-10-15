// Google's own "Sign in with Google" button (Google Identity Services). It hands back an ID token
// that Supabase verifies, so Google's screen names collectquity.com instead of Supabase's address.

/** Public by design: it only identifies the app to Google (the secret lives in Supabase). */
export const GOOGLE_CLIENT_ID = '663882630249-dlv1jei2mrb8gsmoppfps8g9h5vf0van.apps.googleusercontent.com';

export interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    nonce: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: { theme: string; size: string; text: string; shape: string; width: number },
  ): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

let loading: Promise<GoogleIdentity> | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () =>
      window.google ? resolve(window.google.accounts.id) : reject(new Error('No Google'));
    script.onerror = () => {
      loading = null;
      reject(new Error("Couldn't load Google sign-in"));
    };
    document.head.appendChild(script);
  });

  return loading;
}

/**
 * A one-time code tying this sign-in to this visit: Google signs the hashed copy into the token,
 * and Supabase checks it against the plain one, so a captured token can't be replayed.
 */
export async function newNonce(): Promise<{ plain: string; hashed: string }> {
  const plain = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
  const hashed = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');

  return { plain, hashed };
}
