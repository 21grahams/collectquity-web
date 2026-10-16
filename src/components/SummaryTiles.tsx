import type { Totals } from '../lib/cardMath';

import { Box } from '@mui/material';

import { formatGain, formatMoney, formatSignedPct, gainLabel } from '../lib/format';
import { fonts, tokens } from '../theme/tokens';

function Tile({
  label,
  value,
  color,
  sub,
  labelColor = tokens.text3,
}: {
  label: string;
  value: string;
  color: string;
  sub: string;
  labelColor?: string;
}) {
  return (
    <Box
      sx={{
        backgroundColor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: `${tokens.radius}px`,
        p: 1.75,
        minWidth: 0,
      }}
    >
      <Box
        sx={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: labelColor, mb: 0.75 }}
      >
        {label}
      </Box>
      <Box sx={{ fontFamily: fonts.mono, fontSize: 22, fontWeight: 500, color }}>{value}</Box>
      <Box sx={{ fontFamily: fonts.mono, fontSize: 11, color: tokens.text3, mt: '3px' }}>{sub}</Box>
    </Box>
  );
}

/**
 * The Market Value and Gain tiles at the top of Singles and Sealed. `full` is the totals at 100%;
 * a what-if percentage is applied once to the total (like Summary), not item by item, so the
 * tiles match Summary to the cent.
 */
export function SummaryTiles({
  full,
  valuePct,
  caption,
}: {
  full: Totals;
  valuePct: number;
  caption: string;
}) {
  // Adding many prices leaves float dust (2733.1499999…), which would round a cent away from
  // Summary's exact database total; clean it first.
  const base = Math.round(full.totalValue * 1e6) / 1e6;
  const value = valuePct === 100 ? base : Math.round(base * valuePct) / 100;
  const gain = value - full.totalCost;
  const sum = { totalValue: value, gain, gainPct: full.totalCost > 0 ? (gain / full.totalCost) * 100 : 0 };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mt: 1, mb: 2.5 }}>
      <Tile
        label={valuePct < 100 ? `Market @ ${valuePct}%` : 'Market Value'}
        labelColor={valuePct < 100 ? tokens.gold : undefined}
        value={formatMoney(sum.totalValue)}
        color={tokens.gold}
        sub={caption}
      />
      <Tile
        label={gainLabel(sum.gain)}
        value={formatGain(sum.gain)}
        color={sum.gain >= 0 ? tokens.green : tokens.red}
        sub={`${formatSignedPct(sum.gainPct)} return`}
      />
    </Box>
  );
}
