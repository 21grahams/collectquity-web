import { Box, Divider, Menu, MenuItem } from '@mui/material';
import { useRef, useState } from 'react';

import { useAuth } from '../features/auth/authContext';
import { useRemoveAvatar, useUploadAvatar } from '../hooks/mutations';
import { useAvatarUrl } from '../hooks/queries';
import { squareJpeg } from '../lib/avatarImage';
import { APP_NAME, TAGLINE } from '../lib/brand';
import { fonts, tokens } from '../theme/tokens';
import { useNotify } from './notifyContext';

function formatBuiltAt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Denver',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Your initial in a circle (a photo later); opens a menu with your email, version and Log out. */
export function AvatarMenu() {
  const { session, signOut } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const email = session?.user.email ?? '';
  const open = anchor != null;
  const notify = useNotify();
  const avatar = useAvatarUrl();
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const fileInput = useRef<HTMLInputElement>(null);
  // An expired or missing photo link falls back to the initial.
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
  const photo = avatar.data && avatar.data !== brokenUrl ? avatar.data : null;

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAnchor(null);
    try {
      upload.mutate(await squareJpeg(file));
    } catch {
      notify("Couldn't read that photo", 'error');
    }
  }

  return (
    <>
      <Box
        component="button"
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          fontFamily: fonts.serif,
          fontSize: 17,
          lineHeight: 1,
          color: open ? tokens.bg : tokens.gold,
          backgroundColor: open ? tokens.gold : tokens.goldDim,
          border: `1px solid ${tokens.gold}`,
          overflow: 'hidden',
          p: 0,
          opacity: upload.isPending || remove.isPending ? 0.5 : 1,
        }}
      >
        {photo ? (
          <Box
            component="img"
            src={photo}
            alt=""
            onError={() => setBrokenUrl(photo)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          (email.trim()[0] ?? '?').toUpperCase()
        )}
      </Box>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={pickPhoto} />
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 240,
              maxWidth: 'calc(100vw - 32px)',
              backgroundColor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
              color: tokens.text,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Box sx={{ fontSize: 12, color: tokens.text3 }}>Logged in as</Box>
          <Box sx={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </Box>
        </Box>
        <Divider sx={{ borderColor: tokens.border }} />
        <MenuItem onClick={() => fileInput.current?.click()} sx={{ fontSize: 15, minHeight: 44 }}>
          {photo ? 'Change photo' : 'Add photo'}
        </MenuItem>
        {photo && (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              remove.mutate();
            }}
            sx={{ fontSize: 15, minHeight: 44, color: tokens.text2 }}
          >
            Remove photo
          </MenuItem>
        )}
        <Divider sx={{ borderColor: tokens.border }} />
        <Box sx={{ px: 2, py: 1.25, fontSize: 11, color: tokens.text3 }}>
          {APP_NAME} · {TAGLINE}
          <br />
          Version {__APP_VERSION__} · built {formatBuiltAt(__BUILT_AT__)}
        </Box>
        <Divider sx={{ borderColor: tokens.border }} />
        <MenuItem
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            await signOut();
          }}
          sx={{ color: tokens.red, fontSize: 15, minHeight: 44 }}
        >
          {signingOut ? 'Logging out…' : 'Log out'}
        </MenuItem>
      </Menu>
    </>
  );
}
