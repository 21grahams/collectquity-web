import { Box, Divider, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { GOOGLE_CLIENT_ID, loadGoogleIdentity, newNonce } from '../../lib/googleSignIn';
import { useAuth } from './authContext';

// Google's sign-in window can't hand its result back to a home-screen app (it keeps separate
// storage from Safari), and the one-time code needs a secure page (not the practice preview on
// the Mac's network address), so those offer email and password only.
const isHomeScreenApp =
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
const available = !isHomeScreenApp && !!globalThis.crypto?.subtle;

/** Google's own "Continue with Google" button plus an "or" divider; nothing where it can't work. */
export function GoogleButton({ onError }: { onError: (message: string) => void }) {
  const { signInWithGoogle } = useAuth();
  const slot = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  // Google keeps the first callback it's given, so it reads the latest handlers through a ref.
  const handlers = useRef({ signInWithGoogle, onError });
  useEffect(() => {
    handlers.current = { signInWithGoogle, onError };
  });

  useEffect(() => {
    if (!available) return;
    let cancelled = false;
    // Blocked or very slow: drop the empty space rather than leave a gap above "or".
    const giveUp = setTimeout(() => !slot.current?.childElementCount && setFailed(true), 8000);
    (async () => {
      try {
        const [google, nonce] = await Promise.all([loadGoogleIdentity(), newNonce()]);
        if (cancelled || !slot.current) return;
        google.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: nonce.hashed,
          callback: async ({ credential }) => {
            setSigningIn(true);
            const message = await handlers.current.signInWithGoogle(credential, nonce.plain);
            setSigningIn(false);
            if (message) handlers.current.onError(message);
          },
        });
        google.renderButton(slot.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(400, slot.current.offsetWidth),
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(giveUp);
    };
  }, []);

  if (!available || failed) return null;

  return (
    <>
      <Box ref={slot} sx={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} />
      {signingIn && (
        <Typography variant="body2" color="text.secondary" align="center">
          Signing in…
        </Typography>
      )}
      <Divider sx={{ fontSize: 13, color: 'text.secondary' }}>or</Divider>
    </>
  );
}
