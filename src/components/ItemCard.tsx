import type { ReactNode } from 'react';
import type { CardNumbers, QuarterBox } from '../lib/cardMath';

import { Box } from '@mui/material';

import { formatGain, formatMoney, gainLabel } from '../lib/format';
import { canHover, fonts, tokens } from '../theme/tokens';
import { CardArt } from './CardArt';
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
  /** Catalog art for linked items, shown down the card's left side. */
  image?: string | null;
  /** The market value got a fresh automatic price today. */
  liveToday?: boolean;
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
              // Five-digit totals ($10,000.00+) would overflow the narrow box on phones.
              fontSize: q.total != null && q.total >= 10_000 ? 10 : 12,
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

function Gain({ amount, size }: { amount: number; size: number }) {
  return (
    <Box sx={{ ...mono, fontSize: size, color: amount >= 0 ? tokens.green : tokens.red }}>
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

// Each column as wide as its contents, spread edge to edge (Cost left, Market Value middle, Gain
// right), each label centered over its number.
const ledger = {
  display: 'grid',
  gridTemplateColumns: 'auto auto auto',
  justifyContent: 'space-between',
  columnGap: 1.5,
  alignItems: 'baseline',
  '& > *': { justifySelf: 'center', textAlign: 'center' },
};
const money = { ...mono, fontSize: 14, color: tokens.text } as const;
// Beside card art the row is narrow, so long amounts step down a size to fit small phones
// (judged by the amount as shown, e.g. "$10,000.00").
const steps = (amount: number, sizes: [number, number, number]) => {
  const digits = formatMoney(Math.abs(amount)).replace(/\D/g, '').length;

  return digits >= 7 ? sizes[2] : digits >= 6 ? sizes[1] : sizes[0];
};
const valueSize = (amount: number) => steps(amount, [15, 13, 11.5]);
const sideSize = (amount: number) => steps(amount, [13, 12, 11]);
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
  image,
  liveToday = false,
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

  const headerRow = (
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
  );
  // Beside large art the row is narrower: Market Value gets the widest column and the
  // labels sit tighter, so "MARKET VALUE" stays on one line.
  const narrow = !!image;
  const label = narrow ? { ...metaLabel, letterSpacing: '0.4px' } : metaLabel;
  const bodyRows = (
    <>
      <Box
        sx={{
          ...divider,
          ...ledger,
          ...(narrow && { columnGap: 0.5 }),
        }}
      >
        <Box sx={label}>Cost</Box>
        <Box
          sx={{
            ...label,
            ...(autoValue && { color: tokens.blue }),
            ...(valuePct < 100 && { color: tokens.gold }),
          }}
        >
          {valuePct < 100 ? `Market @ ${valuePct}%` : 'Market Value'}
        </Box>
        <Box sx={label}>{gainLabel(numbers.gain)}</Box>
        <Box sx={{ ...money, mt: 0.5, ...(narrow && { fontSize: sideSize(numbers.totalCost) }) }}>
          {formatMoney(numbers.totalCost)}
        </Box>
        <Box
          sx={{
            ...money,
            mt: 0.5,
            fontWeight: 500,
            fontSize: { xs: narrow ? valueSize(numbers.totalValue) : 16, sm: 18 },
            display: 'flex',
            alignItems: 'center',
            gap: narrow ? '4px' : '6px',
          }}
        >
          {formatMoney(numbers.totalValue)}
          {liveToday && (
            <Box
              role="img"
              aria-label="Updated today"
              title="Updated today"
              sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tokens.blue, flexShrink: 0 }}
            />
          )}
        </Box>
        <Box sx={{ mt: 0.5 }}>
          <Gain amount={numbers.gain} size={narrow ? sideSize(numbers.gain) : 13} />
        </Box>
        {many && (
          <>
            <Box sx={each}>{formatMoney(numbers.unitCost)} ea</Box>
            <Box sx={each}>{formatMoney(numbers.unitValue)} ea</Box>
            <Box />
          </>
        )}
      </Box>
      {feesLabel && <Box sx={{ ...finePrint, mt: 0.75 }}>Includes fees / taxes: {feesLabel}</Box>}
      {market}
    </>
  );

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
      {image ? (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <CardArt url={image} width={76} height={106} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {headerRow}
            {bodyRows}
          </Box>
        </Box>
      ) : (
        <>
          {headerRow}
          {bodyRows}
        </>
      )}

      {quarters && <QuarterGrid quarters={quarters} onQuarterClick={onQuarterClick} />}

      {actions && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75, mt: 1.25 }}>{actions}</Box>
      )}
    </Box>
  );
}
