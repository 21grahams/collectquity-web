import type { ReactNode } from 'react';
import type { CardNumbers, QuarterBox } from '../lib/cardMath';

import { Box } from '@mui/material';

import { formatGain, formatMoney, gainLabel } from '../lib/format';
import { canHover, fonts, tokens } from '../theme/tokens';
import { useNotify } from './notifyContext';

interface ItemCardProps {
  title: string;
  subtitle: ReactNode;
  copyText: string;
  quantity: number;
  numbers: CardNumbers;
  /** Market value is shown at this percentage; below 100 the column says so. */
  valuePct: number;
  feesLabel: string | null;
  /** The automatic-price line, for items linked to a catalog product. */
  market?: ReactNode;
  /** The market value updates itself daily (shown in the Auto line's blue). */
  autoValue?: boolean;
  quarters?: QuarterBox[];
  onQuarterClick?: (q: QuarterBox) => void;
  actions?: ReactNode;
}

const BORDER: Record<CardNumbers['tone'], string> = {
  gain: tokens.green,
  loss: tokens.red,
  neutral: tokens.text3,
};

const mono = { fontFamily: fonts.mono };
const metaLabel = {
  fontSize: 10,
  color: tokens.text3,
  letterSpacing: '1px',
  textTransform: 'uppercase',
} as const;
const finePrint = { fontSize: 11, color: tokens.text3 } as const;
const divider = { mt: 1.25, pt: 1.25, borderTop: `1px solid ${tokens.border}` } as const;

function QuarterGrid({
  quarters,
  onQuarterClick,
}: {
  quarters: QuarterBox[];
  onQuarterClick?: (q: QuarterBox) => void;
}) {
  return (
    <Box sx={{ ...divider, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75 }}>
      {quarters.map((q) => (
        <Box
          key={q.quarter}
          component={onQuarterClick ? 'button' : 'div'}
          type={onQuarterClick ? 'button' : undefined}
          onClick={onQuarterClick ? () => onQuarterClick(q) : undefined}
          sx={{
            backgroundColor: tokens.surface2,
            borderRadius: '6px',
            px: 1,
            py: 0.75,
            border: `1px solid ${q.active ? tokens.gold : 'transparent'}`,
            minWidth: 0,
            textAlign: 'left',
            color: 'inherit',
            fontFamily: 'inherit',
            cursor: onQuarterClick ? 'pointer' : 'default',
            transition: 'border-color 0.15s',
            [canHover]: onQuarterClick ? { '&:hover': { borderColor: tokens.gold } } : {},
          }}
        >
          <Box sx={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: tokens.text3 }}>
            {q.label}
            {q.active ? ' ●' : ''}
          </Box>
          <Box
            sx={{
              ...mono,
              fontSize: 12,
              mt: '2px',
              color: q.delta == null ? tokens.text2 : q.delta >= 0 ? tokens.green : tokens.red,
            }}
          >
            {q.total != null ? formatMoney(q.total) : '—'}
          </Box>
          {q.delta != null && (
            <Box sx={{ fontSize: 9, mt: '2px', color: q.delta >= 0 ? tokens.green : tokens.red }}>
              {q.delta >= 0 ? '↑' : '↓'} {formatMoney(Math.abs(q.delta))}{' '}
              <Box component="span" sx={{ color: tokens.text3 }}>
                {q.deltaLabel}
              </Box>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

function Gain({ amount }: { amount: number }) {
  return (
    <Box sx={{ ...mono, fontSize: 13, color: amount >= 0 ? tokens.green : tokens.red }}>
      {formatGain(amount)}
    </Box>
  );
}

function GainPill({ pct, tone, hasCost }: { pct: number; tone: CardNumbers['tone']; hasCost: boolean }) {
  const color = BORDER[tone];

  return (
    <Box
      sx={{
        ...mono,
        fontSize: 12,
        color,
        backgroundColor: tone === 'neutral' ? tokens.surface2 : `${color}1f`,
        borderRadius: '6px',
        px: 0.75,
        py: '2px',
        whiteSpace: 'nowrap',
      }}
    >
      {tone === 'gain' ? '▲ ' : tone === 'loss' ? '▼ ' : ''}
      {hasCost ? `${Math.abs(pct).toFixed(1)}%` : 'No cost'}
    </Box>
  );
}

const ledger = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1.3fr',
  columnGap: 1.5,
  alignItems: 'baseline',
};
const money = { ...mono, fontSize: 14, color: tokens.text } as const;
const each = { ...mono, fontSize: 11, color: tokens.text3, mt: '2px' } as const;

export function ItemCard({
  title,
  subtitle,
  copyText,
  quantity,
  numbers,
  valuePct,
  feesLabel,
  market,
  autoValue,
  quarters,
  onQuarterClick,
  actions,
}: ItemCardProps) {
  const notify = useNotify();
  const many = quantity > 1;

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyText);
      notify('Copied!', 'success');
    } catch {
      notify('Copy failed', 'error');
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: `${tokens.radius}px`,
        p: 1.75,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: BORDER[numbers.tone],
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ fontWeight: 500, fontSize: 14, lineHeight: 1.3 }}>{title}</Box>
            <Box
              component="button"
              onClick={copy}
              aria-label="Copy name"
              sx={{
                background: 'none',
                border: 'none',
                color: tokens.text3,
                cursor: 'pointer',
                p: '2px 4px',
                fontSize: 13,
                lineHeight: 1,
                flexShrink: 0,
                [canHover]: { '&:hover': { color: tokens.gold } },
                '&:active': { color: tokens.green },
              }}
            >
              ⧉
            </Box>
          </Box>
          <Box sx={{ fontSize: 11, color: tokens.text3, mt: '2px' }}>{subtitle}</Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
          <GainPill pct={numbers.gainPct} tone={numbers.tone} hasCost={numbers.totalCost > 0} />
        </Box>
      </Box>

      <Box sx={{ ...divider, ...ledger }}>
        <Box sx={metaLabel}>Cost</Box>
        <Box
          sx={{
            ...metaLabel,
            ...(autoValue && { color: tokens.blue }),
            ...(valuePct < 100 && { color: tokens.gold }),
          }}
        >
          {valuePct < 100 ? `Market @ ${valuePct}%` : 'Market Value'}
        </Box>
        <Box sx={metaLabel}>{gainLabel(numbers.gain)}</Box>
        <Box sx={{ ...money, mt: 0.5 }}>{formatMoney(numbers.totalCost)}</Box>
        <Box sx={{ ...money, mt: 0.5 }}>{formatMoney(numbers.totalValue)}</Box>
        <Box sx={{ mt: 0.5 }}>
          <Gain amount={numbers.gain} />
        </Box>
        {many && (
          <>
            <Box sx={each}>{formatMoney(numbers.unitCost)} ea</Box>
            <Box sx={each}>{formatMoney(numbers.unitValue)} ea</Box>
            <Box />
          </>
        )}
      </Box>
      {feesLabel && <Box sx={{ ...finePrint, mt: 0.75 }}>Includes PAS fees: {feesLabel}</Box>}
      {market}

      {quarters && <QuarterGrid quarters={quarters} onQuarterClick={onQuarterClick} />}

      {actions && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75, mt: 1.25 }}>{actions}</Box>
      )}
    </Box>
  );
}
