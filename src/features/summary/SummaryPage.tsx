import type { ReactNode } from 'react';
import type { SalesBox, SummaryBox } from '../../api/types';

import { Box } from '@mui/material';

import { ErrorState, LoadingState } from '../../components/ListStates';
import { PercentPicker } from '../../components/PercentPicker';
import { StickyToolbar } from '../../components/StickyToolbar';
import { useCompletedHolds, useSections, useSummary } from '../../hooks/queries';
import { useValuePercent } from '../../hooks/useStickyState';
import { formatGain, formatMoney, formatRatioPct, formatSignedPct, gainLabel } from '../../lib/format';
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

function PeriodBox({
  title,
  sales,
  highlight,
}: {
  title: string;
  sales: Omit<SalesBox, 'hasSales'>;
  highlight?: boolean;
}) {
  const row = (label: string, value: string, color: string = tokens.text) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '3px' }}>
      <Box sx={{ fontSize: 12, color: tokens.text3 }}>{label}</Box>
      <Box sx={{ fontFamily: fonts.mono, fontSize: 12, color }}>{value}</Box>
    </Box>
  );

  return (
    <Box
      sx={{
        backgroundColor: tokens.surface,
        border: `1px solid ${highlight ? GREEN_BORDER : tokens.border}`,
        borderRadius: `${tokens.radius}px`,
        p: 1.5,
        mb: 1,
      }}
    >
      <Box
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: tokens.text2,
          mb: 1,
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Box>
      {/* Short Hold boxes leave out $0 rows; the two sales boxes always show all four (old-app behavior). */}
      {(highlight || sales.soldPrice !== 0) && row('Sold Price', formatMoney(sales.soldPrice))}
      {row('Profit', formatMoney(sales.profit), signColor(sales.profit))}
      {(highlight || sales.markup !== 0) && row('Markup', formatRatioPct(sales.markup))}
      {(highlight || sales.margin !== 0) && row('Margin', formatRatioPct(sales.margin))}
    </Box>
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
        <Label>{realizedProfitLabel(s, showHolds)}</Label>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 1, mb: 1.5 }}
        >
          <Box sx={{ fontSize: 12, color: tokens.text2 }}>Total Realized Profit</Box>
          <Box
            sx={{
              fontFamily: fonts.mono,
              fontSize: 20,
              fontWeight: 500,
              color: signColor(s.totalRealizedProfit),
            }}
          >
            {formatMoney(s.totalRealizedProfit)}
          </Box>
        </Box>
        {s.singlesSales.hasSales && (
          <PeriodBox title="Individual Card Sales" sales={s.singlesSales} highlight />
        )}
        {s.longHoldSales.hasSales && (
          <PeriodBox title={`${sealedName} Sales`} sales={s.longHoldSales} highlight />
        )}
        {(showHolds ? [...holds.data] : [])
          .sort((a, b) => b.number - a.number)
          .map((h) => (
            <PeriodBox key={h.id} title={h.name} sales={h} />
          ))}
      </Panel>
    </Box>
  );
}
