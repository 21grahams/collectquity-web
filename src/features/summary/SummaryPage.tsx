import type { ReactNode } from 'react';
import type { CompletedHold, SummaryBox } from '../../api/types';
import type { SalesTotals } from '../../lib/sales';

import { Box, useMediaQuery } from '@mui/material';
import { useState } from 'react';

import { ErrorState, LoadingState } from '../../components/ListStates';
import { PercentPicker } from '../../components/PercentPicker';
import { StickyToolbar } from '../../components/StickyToolbar';
import { useCompletedHolds, useSections, useSummary } from '../../hooks/queries';
import { useStickyState, useValuePercent } from '../../hooks/useStickyState';
import { formatGain, formatMoney, formatRatioPct, formatSignedPct, gainLabel } from '../../lib/format';
import { combineSales } from '../../lib/sales';
import { realizedProfitLabel, returnPct } from '../../lib/summaryLabels';
import { fonts, tokens } from '../../theme/tokens';

const signColor = (n: number) => (n >= 0 ? tokens.green : tokens.red);
const GREEN_BORDER = 'rgba(52,199,123,0.3)';

function Panel({ children, borderColor = tokens.border }: { children: ReactNode; borderColor?: string }) {
  return (
    <Box
      sx={{
        backgroundColor: tokens.surface,
        border: `1px solid ${borderColor}`,
        borderRadius: `${tokens.radius}px`,
        p: 1.75,
        minWidth: 0,
      }}
    >
      {children}
    </Box>
  );
}

function Label({ children, color = tokens.text3 }: { children: ReactNode; color?: string }) {
  return (
    <Box sx={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color, mb: 0.75 }}>
      {children}
    </Box>
  );
}

function Row({
  label,
  value,
  color = tokens.text as string,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
      <Box sx={{ fontSize: 12, color: tokens.text2 }}>{label}</Box>
      <Box sx={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 500, color }}>{value}</Box>
    </Box>
  );
}

/** Market value at a chosen percentage, to the cent. */
const atPct = (value: number, pct: number) => Math.round(value * pct) / 100;

function CategoryPanel({ title, box, pct }: { title: string; box: SummaryBox; pct: number }) {
  const value = atPct(box.value, pct);
  const gain = value - box.spent;
  const whatIf = pct < 100;

  return (
    <Panel>
      <Label>{title}</Label>
      <Box sx={{ fontFamily: fonts.mono, fontSize: 22, fontWeight: 500 }}>{formatMoney(value)}</Box>
      <Box sx={{ fontSize: 11, color: whatIf ? tokens.gold : tokens.text3, mb: 1 }}>
        {whatIf ? `Market @ ${pct}%` : 'Market Value'}
      </Box>
      <Row label="Cost" value={formatMoney(box.spent)} />
      <Row
        label={gainLabel(gain, whatIf ? `Gain at ${pct}%` : 'Gain')}
        value={formatGain(gain)}
        color={signColor(gain)}
      />
    </Panel>
  );
}

const signedMoney = (n: number) => (n < 0 ? `−${formatMoney(-n)}` : formatMoney(n));

function StatGrid({
  sales,
  labels = true,
  profitColumn,
}: {
  sales: SalesTotals;
  labels?: boolean;
  /** A fourth, right-aligned column: the profit on hold rows, left blank on the totals so columns line up. */
  profitColumn?: 'value' | 'blank';
}) {
  const stat = (label: string, value: string) => (
    <Box sx={{ minWidth: 0 }}>
      {labels && (
        <Box sx={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: tokens.text3 }}>
          {label}
        </Box>
      )}
      <Box
        sx={{
          fontFamily: fonts.mono,
          fontSize: labels ? 13 : 12,
          color: labels ? tokens.text : tokens.text2,
          mt: labels ? '2px' : 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        // Fixed tracks (minmax 0, a set profit width) so every row's columns line up, whatever the amounts.
        gridTemplateColumns: `minmax(0, 1.3fr) repeat(2, minmax(0, 1fr))${profitColumn ? ' 5.75rem' : ''}`,
        gap: 1,
        alignItems: 'end',
      }}
    >
      {stat('Sold', formatMoney(sales.soldPrice))}
      {stat('Markup', formatRatioPct(sales.markup))}
      {stat('Margin', formatRatioPct(sales.margin))}
      {profitColumn && (
        <Box
          sx={{
            fontFamily: fonts.mono,
            fontSize: 13,
            textAlign: 'right',
            color: signColor(sales.profit),
            minWidth: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {profitColumn === 'value' && signedMoney(sales.profit)}
        </Box>
      )}
    </Box>
  );
}

function CardTitle({ title, profit }: { title: ReactNode; profit?: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.25 }}>
      <Box
        sx={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: tokens.text2,
          flex: 1,
          minWidth: 0,
        }}
      >
        {title}
      </Box>
      {profit !== undefined && (
        <Box sx={{ fontFamily: fonts.mono, fontSize: 16, fontWeight: 500, color: signColor(profit) }}>
          {signedMoney(profit)}
        </Box>
      )}
    </Box>
  );
}

function SaleCard({ title, sales }: { title: string; sales: SalesTotals }) {
  return (
    <Panel>
      <CardTitle title={title} profit={sales.profit} />
      <StatGrid sales={sales} />
    </Panel>
  );
}

/**
 * One bar per hold, oldest to newest; up is profit, down is loss. Tapping a bar shows its name and
 * profit under the chart (taps, unlike touches, never fire while scrolling); a mouse can just hover.
 */
function ProfitBars({ holds }: { holds: readonly CompletedHold[] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const canHover = useMediaQuery('(hover: hover)');
  const ordered = [...holds].sort((a, b) => a.number - b.number);
  const max = Math.max(...ordered.map((h) => Math.abs(h.profit)), 1);
  const hasLoss = ordered.some((h) => h.profit < 0);
  const half = 44;
  const pickedHold = ordered.find((h) => h.id === picked);
  // A picked hold that's since been deleted counts as no pick.
  const active = pickedHold?.id ?? null;

  return (
    // Sized to the number of holds, so the end labels sit under the first and last bars. Taps here
    // never open or close the card; a tap off the bars clears the pick.
    <Box
      onClick={(e) => {
        e.stopPropagation();
        setPicked(null);
      }}
      onMouseLeave={canHover ? () => setPicked(null) : undefined}
      sx={{ maxWidth: Math.max(ordered.length * 48, 220), cursor: 'default' }}
    >
      <Box sx={{ display: 'flex', gap: '2px', height: hasLoss ? half * 2 : half, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: hasLoss ? half : half - 1,
            height: '1px',
            backgroundColor: tokens.border,
          }}
        />
        {ordered.map((h) => {
          const size = Math.max((Math.abs(h.profit) / max) * half, 2);
          const loss = h.profit < 0;

          return (
            <Box
              key={h.id}
              component="button"
              type="button"
              aria-label={`${h.name}: ${signedMoney(h.profit)}`}
              aria-pressed={active === h.id}
              onClick={(e) => {
                e.stopPropagation();
                // With a mouse, hovering already picked it; a click shouldn't undo that.
                setPicked(canHover || active !== h.id ? h.id : null);
              }}
              onMouseEnter={canHover ? () => setPicked(h.id) : undefined}
              sx={{
                flex: 1,
                position: 'relative',
                p: 0,
                border: 0,
                background: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                '&:focus-visible': { outline: `2px solid ${tokens.gold}`, outlineOffset: 1 },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: size,
                  top: loss ? half : half - size,
                  backgroundColor: loss ? tokens.red : tokens.green,
                  borderRadius: loss ? '0 0 4px 4px' : '4px 4px 0 0',
                  opacity: active === null || active === h.id ? 1 : 0.35,
                  transition: 'opacity 0.15s',
                }}
              />
            </Box>
          );
        })}
      </Box>
      <Box
        aria-live="polite"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
          fontSize: 10,
          color: tokens.text3,
          mt: 0.5,
          '& > span': { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        }}
      >
        {pickedHold ? (
          <Box component="span" sx={{ fontSize: { sm: 13 }, color: { sm: tokens.text2 } }}>
            {pickedHold.name} ·{' '}
            <Box component="span" sx={{ fontFamily: fonts.mono, color: signColor(pickedHold.profit) }}>
              {signedMoney(pickedHold.profit)}
            </Box>
          </Box>
        ) : (
          <>
            <span>{ordered[0]?.name}</span>
            <span>{ordered.at(-1)?.name}</span>
          </>
        )}
      </Box>
    </Box>
  );
}

function ShortHoldsCard({ holds }: { holds: readonly CompletedHold[] }) {
  const [open, setOpen] = useStickyState('ui:summary-holds-open', false, true);
  const total = combineSales(holds);
  const toggle = () => setOpen(!open);

  return (
    <Panel>
      {/* The whole top is tappable; only the title row is the button for keyboards and screen readers. */}
      <Box onClick={toggle} sx={{ cursor: 'pointer', userSelect: 'none' }}>
        <Box
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-label={`Short Holds, ${holds.length}, ${signedMoney(total.profit)} profit`}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            toggle();
          }}
        >
          <CardTitle
            title={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    fontSize: 10,
                    color: tokens.text3,
                    transition: 'transform 0.2s',
                    transform: open ? 'none' : 'rotate(-90deg)',
                  }}
                >
                  ▼
                </Box>
                Short Holds
                <Box component="span" sx={{ fontWeight: 400, color: tokens.text3, letterSpacing: 0 }}>
                  · {holds.length}
                </Box>
              </Box>
            }
            profit={total.profit}
          />
        </Box>
        {holds.length > 1 && (
          <Box sx={{ mb: 1.5 }}>
            <ProfitBars holds={holds} />
          </Box>
        )}
        <StatGrid sales={total} profitColumn="blank" />
      </Box>
      {open &&
        holds.map((h) => (
          <Box key={h.id} sx={{ borderTop: `1px solid ${tokens.border}`, pt: 1, mt: 1 }}>
            <Box sx={{ fontSize: 13, color: tokens.text2, mb: '2px' }}>{h.name}</Box>
            <StatGrid sales={h} labels={false} profitColumn="value" />
          </Box>
        ))}
    </Panel>
  );
}

export function SummaryPage() {
  const summary = useSummary();
  const holds = useCompletedHolds();
  const [valuePct, setValuePct] = useValuePercent();
  const { tracksSingles, tracksSealed, splitsSealed } = useSections();
  const sealedName = splitsSealed ? 'Long Hold' : 'Sealed';

  if (!summary.data || !holds.data) {
    if (summary.isError) return <ErrorState error={summary.error} onRetry={() => summary.refetch()} />;
    if (holds.isError) return <ErrorState error={holds.error} onRetry={() => holds.refetch()} />;

    return <LoadingState />;
  }

  const s = summary.data;
  const p = s.portfolio;
  const cs = s.currentShort;
  // A section shows while it's tracked or still has data, so the parts always add up to the totals.
  const has = (box: { spent: number; value: number }) => box.spent > 0 || box.value > 0;
  const showSingles = tracksSingles || has(s.singles) || s.singlesSales.hasSales;
  const showSealed = tracksSealed || has(s.longHold) || s.longHoldSales.hasSales;
  const showShort = (tracksSealed && splitsSealed) || has(cs);
  const showHolds = splitsSealed || s.completedHoldCount > 0;
  const shownHolds = showHolds ? [...holds.data].sort((a, b) => b.number - a.number) : [];
  const bothSales = s.singlesSales.hasSales && s.longHoldSales.hasSales;
  const portfolioGain = atPct(p.value, valuePct) - p.spent;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <StickyToolbar justify="flex-end">
        <PercentPicker value={valuePct} onChange={setValuePct} />
      </StickyToolbar>
      <Panel>
        <Label color={valuePct < 100 ? tokens.gold : undefined}>
          Portfolio Value{valuePct < 100 ? ` @ ${valuePct}%` : ''} —{' '}
          {[showSingles && 'Singles', showSealed && sealedName].filter(Boolean).join(' + ')}
        </Label>
        <Box sx={{ fontFamily: fonts.mono, fontSize: 32, fontWeight: 500, color: tokens.gold }}>
          {formatMoney(atPct(p.value, valuePct))}
        </Box>
        <Box sx={{ fontFamily: fonts.mono, fontSize: 11, color: tokens.text3, mt: '3px' }}>
          Cost: {formatMoney(p.spent)} ·{' '}
          <Box component="span" sx={{ color: signColor(portfolioGain) }}>
            {gainLabel(portfolioGain)}: {formatGain(portfolioGain)} · Return:{' '}
            {formatSignedPct(returnPct({ spent: p.spent, gain: portfolioGain }))}
          </Box>
        </Box>
      </Panel>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: showSingles && showSealed ? '1fr 1fr' : '1fr',
          gap: 1.25,
        }}
      >
        {showSingles && <CategoryPanel title="Singles" box={s.singles} pct={valuePct} />}
        {showSealed && (
          <CategoryPanel
            title={splitsSealed ? 'Long Hold Sealed' : 'Sealed'}
            box={s.longHold}
            pct={valuePct}
          />
        )}
      </Box>

      {showShort && (
        <CategoryPanel title={`${cs.name ?? 'Current Short Hold'} — Tracking Only`} box={cs} pct={valuePct} />
      )}

      <Panel borderColor={GREEN_BORDER}>
        <Label>{realizedProfitLabel(s, splitsSealed)}</Label>
        <Box
          sx={{
            fontFamily: fonts.mono,
            fontSize: 32,
            fontWeight: 500,
            color: signColor(s.totalRealizedProfit),
          }}
        >
          {signedMoney(s.totalRealizedProfit)}
        </Box>
      </Panel>
      {(s.singlesSales.hasSales || s.longHoldSales.hasSales) && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: bothSales ? '1fr 1fr' : '1fr' },
            gap: 1.25,
          }}
        >
          {s.singlesSales.hasSales && <SaleCard title="Card Sales" sales={s.singlesSales} />}
          {s.longHoldSales.hasSales && <SaleCard title={`${sealedName} Sales`} sales={s.longHoldSales} />}
        </Box>
      )}
      {shownHolds.length > 0 ? (
        <ShortHoldsCard holds={shownHolds} />
      ) : (
        tracksSealed &&
        splitsSealed && (
          <Panel>
            <CardTitle title="Short Holds" />
            <Box sx={{ fontSize: 13, color: tokens.text3 }}>
              Completed short holds and their profit will show up here.
            </Box>
          </Panel>
        )
      )}
    </Box>
  );
}
