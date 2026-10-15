import type { ReactNode } from 'react';

import CheckRounded from '@mui/icons-material/CheckRounded';
import { Box } from '@mui/material';

import { tokens } from '../../theme/tokens';

/** A large tappable choice: gold outline when selected, dimmed when not available yet. */
export function OptionCard({
  title,
  hint,
  badge,
  selected = false,
  multiple = false,
  disabled = false,
  onClick,
}: {
  title: string;
  hint?: ReactNode;
  badge?: string;
  selected?: boolean;
  /** One of several that can be picked together: shows a checkbox instead of a radio dot. */
  multiple?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      aria-pressed={disabled ? undefined : selected}
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        p: 2,
        borderRadius: `${tokens.radius}px`,
        border: `1px solid ${selected ? tokens.gold : tokens.border}`,
        backgroundColor: selected ? tokens.goldDim : tokens.surface,
        color: tokens.text,
        font: 'inherit',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ fontSize: 16, fontWeight: 500 }}>{title}</Box>
        {hint && <Box sx={{ fontSize: 13, color: tokens.text2, mt: 0.25 }}>{hint}</Box>}
      </Box>
      {badge && (
        <Box
          sx={{
            fontSize: 11,
            color: tokens.text2,
            border: `1px solid ${tokens.border}`,
            borderRadius: '999px',
            px: 1,
            py: 0.25,
            whiteSpace: 'nowrap',
          }}
        >
          {badge}
        </Box>
      )}
      {!disabled &&
        (multiple ? (
          <Box
            aria-hidden
            sx={{
              width: 20,
              height: 20,
              borderRadius: '5px',
              border: `2px solid ${selected ? tokens.gold : tokens.text3}`,
              backgroundColor: selected ? tokens.gold : 'transparent',
              color: tokens.bg,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {selected && <CheckRounded sx={{ fontSize: 16 }} />}
          </Box>
        ) : (
          <Box
            aria-hidden
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${selected ? tokens.gold : tokens.text3}`,
              backgroundColor: selected ? tokens.gold : 'transparent',
              boxShadow: selected ? `inset 0 0 0 3px ${tokens.surface}` : 'none',
              flexShrink: 0,
            }}
          />
        ))}
    </Box>
  );
}
