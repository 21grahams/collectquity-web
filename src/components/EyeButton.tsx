import { Box } from '@mui/material';

import { tokens } from '../theme/tokens';

/** Shows or hides something masked; `what` names it for screen readers ("password"). */
export function EyeButton({
  revealed,
  what,
  onClick,
}: {
  revealed: boolean;
  what: string;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={`${revealed ? 'Hide' : 'Show'} ${what}`}
      aria-pressed={revealed}
      // Tapping it leaves the keyboard and cursor where they were.
      onPointerDown={(e: React.PointerEvent) => e.preventDefault()}
      onClick={onClick}
      sx={{
        background: 'none',
        border: 'none',
        p: 0.75,
        m: -0.75,
        color: revealed ? tokens.gold : tokens.text3,
        cursor: 'pointer',
        display: 'flex',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
        {!revealed && <path d="M4 4l16 16" strokeLinecap="round" />}
      </svg>
    </Box>
  );
}
