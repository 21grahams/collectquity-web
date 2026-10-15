import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined';
import { Box, Divider, Menu, MenuItem } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../features/auth/authContext';
import { DeleteAccountDialog } from '../features/auth/DeleteAccountDialog';
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

function Face({ photo, email, onBroken }: { photo: string | null; email: string; onBroken: () => void }) {
  return photo ? (
    <Box
      component="img"
      src={photo}
      alt=""
      onError={onBroken}
      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <>{(email.trim()[0] ?? '?').toUpperCase()}</>
  );
}

// Small text, but a finger-sized hit area (the negative margin keeps the line height unchanged).
const linkButton = {
  py: 1,
  px: 0.75,
  my: -1,
  mx: -0.75,
  border: 0,
  background: 'none',
  font: 'inherit',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
} as const;

/** Your photo (or initial) in a circle; opens a menu with your account, actions and version. */
export function AvatarMenu() {
  const { session, signOut } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { mode, setMode } = useColorScheme();
  const email = session?.user.email ?? '';
  // Google-only logins have no password to change.
  const hasPassword = !!session?.user.identities?.some((i) => i.provider === 'email');
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
        <Face photo={photo} email={email} onBroken={() => setBrokenUrl(photo)} />
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
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="button"
            type="button"
            aria-label={photo ? 'Change photo' : 'Add photo'}
            onClick={() => fileInput.current?.click()}
            sx={{
              position: 'relative',
              width: 52,
              height: 52,
              flexShrink: 0,
              p: 0,
              borderRadius: '50%',
              border: `1px solid ${tokens.gold}`,
              backgroundColor: tokens.goldDim,
              color: tokens.gold,
              fontFamily: fonts.serif,
              fontSize: 24,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Face photo={photo} email={email} onBroken={() => setBrokenUrl(photo)} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: tokens.surface2,
                border: `1px solid ${tokens.border}`,
                display: 'grid',
                placeItems: 'center',
                color: tokens.text2,
              }}
            >
              <PhotoCameraOutlined sx={{ fontSize: 12 }} />
            </Box>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontSize: 12, color: tokens.text3 }}>Logged in as</Box>
            <Box sx={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </Box>
            <Box sx={{ fontSize: 12, color: tokens.text2, mt: 0.5 }}>
              <Box
                component="button"
                type="button"
                onClick={() => fileInput.current?.click()}
                sx={{ ...linkButton, color: 'inherit' }}
              >
                {photo ? 'Change photo' : 'Add photo'}
              </Box>
              {photo && (
                <>
                  <Box component="span" sx={{ mx: 1.5 }}>
                    ·
                  </Box>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      setAnchor(null);
                      remove.mutate();
                    }}
                    sx={{ ...linkButton, color: 'inherit' }}
                  >
                    Remove
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ borderColor: tokens.border }} />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate('/sections');
          }}
          sx={{ fontSize: 15, minHeight: 44 }}
        >
          Sections
        </MenuItem>
        {hasPassword && (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              navigate('/password');
            }}
            sx={{ fontSize: 15, minHeight: 44 }}
          >
            Change password
          </MenuItem>
        )}
        {mode !== 'system' && (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              setMode('system');
            }}
            sx={{ fontSize: 15, minHeight: 44 }}
          >
            Match phone setting
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate('/privacy');
          }}
          sx={{ fontSize: 15, minHeight: 44 }}
        >
          Privacy policy
        </MenuItem>
        <Divider sx={{ borderColor: tokens.border }} />
        <MenuItem
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            await signOut();
          }}
          sx={{ fontSize: 15, minHeight: 44 }}
        >
          {signingOut ? 'Logging out…' : 'Log out'}
        </MenuItem>
        <Divider sx={{ borderColor: tokens.border }} />
        <Box sx={{ px: 2, pt: 1.25, pb: 0.5, fontSize: 11, color: tokens.text3 }}>
          {APP_NAME} · {TAGLINE}
          <br />
          Version {__APP_VERSION__} · built {formatBuiltAt(__BUILT_AT__)}
        </Box>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            setDeleting(true);
          }}
          sx={{ color: tokens.red, fontSize: 12, minHeight: 36, pb: 1 }}
        >
          Delete account
        </MenuItem>
      </Menu>
      <DeleteAccountDialog open={deleting} onClose={() => setDeleting(false)} />
    </>
  );
}
