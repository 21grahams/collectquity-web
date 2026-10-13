import type { ReactNode } from 'react';

import { IconButton, Tooltip, useMediaQuery } from '@mui/material';

import { tokens } from '../theme/tokens';

const COLORS = { default: tokens.text2, green: tokens.green, danger: tokens.red };

/** A small icon button for card actions; the label is read by screen readers and shows as a tooltip where there's a mouse. */
export function IconAction({
  label,
  icon,
  onClick,
  tone = 'default',
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: keyof typeof COLORS;
}) {
  const canHover = useMediaQuery('(hover: hover)');
  const button = (
    <IconButton
      aria-label={label}
      onClick={onClick}
      size="small"
      sx={{
        color: COLORS[tone],
        border: `1px solid ${tokens.border}`,
        borderRadius: '8px',
        width: 36,
        height: 36,
        '& svg': { fontSize: 19 },
      }}
    >
      {icon}
    </IconButton>
  );

  return canHover ? <Tooltip title={label}>{button}</Tooltip> : button;
}
