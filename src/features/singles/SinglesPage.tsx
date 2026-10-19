import type { Single } from '../../api/types';
import type { SinglesFilters } from '../../lib/singlesFilter';
import type { MarketTarget } from '../items/MarketSheet';
import type { QuarterTarget } from '../items/QuarterSheet';
import type { SellTarget } from '../items/SellSheet';

import DeleteOutline from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SellOutlined from '@mui/icons-material/SellOutlined';
import { Box, Button } from '@mui/material';
import { useMemo, useState } from 'react';

import { AddButton } from '../../components/AddButton';
import { IconAction } from '../../components/IconAction';
import { ItemCard } from '../../components/ItemCard';
import { EmptyCollection, EmptyState, ErrorState, LoadingState } from '../../components/ListStates';
import { PercentPicker } from '../../components/PercentPicker';
import { StickyToolbar } from '../../components/StickyToolbar';
import { SummaryTiles } from '../../components/SummaryTiles';
import { useAppContext, useMarketLinks, useSingles } from '../../hooks/queries';
import { useStickyState, useValuePercent } from '../../hooks/useStickyState';
import { cardNumbers, cardsLabel, pasFeesLabel, quarterBoxes, totals } from '../../lib/cardMath';
import { formatDate } from '../../lib/format';
import { findLink, isAuto, updatedToday } from '../../lib/marketLink';
import { activeFilterCount, emptyFilters, filterOptions, filterSingles } from '../../lib/singlesFilter';
import { tokens } from '../../theme/tokens';
import { ItemFormSheet } from '../items/ItemFormSheet';
import { MarketLine } from '../items/MarketLine';
import { MarketSheet } from '../items/MarketSheet';
import { QuarterSheet } from '../items/QuarterSheet';
import { RemoveItemDialog } from '../items/RemoveItemDialog';
import { SellSheet } from '../items/SellSheet';
import { SinglesFilterSheet } from './SinglesFilterSheet';

function Subtitle({ single }: { single: Single }) {
  const parts = [
    single.quantity > 1 ? `Qty ${single.quantity}` : '',
    formatDate(single.purchaseDate),
    single.condition,
  ].filter(Boolean);

  return (
    <>
      {parts.join(' · ')}
      {single.extra && (
        <>
          {' · '}
          <Box
            component="span"
            sx={{
              px: 0.5,
              border: `1px solid ${tokens.gold}`,
              borderRadius: '4px',
              color: tokens.gold,
              fontSize: 9,
              letterSpacing: '0.5px',
              verticalAlign: 'middle',
            }}
          >
            {single.extra}
          </Box>
        </>
      )}
    </>
  );
}

function cardTitle(single: Single): string {
  return single.setName ? `${single.pokemon} – ${single.setName}` : single.pokemon;
}

export function SinglesPage() {
  const singles = useSingles();
  const context = useAppContext();
  const [search, setSearch] = useStickyState('ui:singles-search', '');
  const [valuePct, setValuePct] = useValuePercent();
  const [filters, setFilters] = useStickyState<SinglesFilters>('ui:singles-filters', emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Single | null>(null);
  const [removing, setRemoving] = useState<Single | null>(null);
  const [quarterTarget, setQuarterTarget] = useState<QuarterTarget | null>(null);
  const [marketTarget, setMarketTarget] = useState<MarketTarget | null>(null);
  const [selling, setSelling] = useState<SellTarget | null>(null);
  const marketLinks = useMarketLinks();

  const all = useMemo(() => singles.data ?? [], [singles.data]);
  const shown = useMemo(() => filterSingles(all, search, filters), [all, search, filters]);
  const options = useMemo(() => filterOptions(all), [all]);
  const filterCount = activeFilterCount(filters);

  if (!singles.data || !context.data) {
    if (singles.isError) return <ErrorState error={singles.error} onRetry={() => singles.refetch()} />;
    if (context.isError) return <ErrorState error={context.error} onRetry={() => context.refetch()} />;

    return <LoadingState />;
  }

  const sum = totals(shown);
  const today = context.data.today;
  const marketLine = (item: { singleId: number }, name: string, quantity: number, valued: boolean) => {
    const link = findLink(marketLinks.data, item);

    return (
      link && (
        <MarketLine
          link={link}
          today={today}
          quantity={quantity}
          valued={valued}
          onClick={() => setMarketTarget({ item, name, link })}
        />
      )
    );
  };

  return (
    <Box>
      <StickyToolbar>
        <Box sx={{ position: 'relative', flex: 1 }}>
          <Box
            component="input"
            type="search"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search cards..."
            sx={{
              width: '100%',
              backgroundColor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
              borderRadius: '10px',
              p: '10px 34px 10px 13px',
              color: tokens.text,
              fontFamily: 'inherit',
              fontSize: 16,
              outline: 'none',
              WebkitAppearance: 'none',
              '&:focus': { borderColor: tokens.gold },
              '&::-webkit-search-cancel-button': { display: 'none' },
            }}
          />
          {search && (
            <Box
              component="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              sx={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: tokens.text3,
                fontSize: 15,
                p: 0.75,
                cursor: 'pointer',
              }}
            >
              ✕
            </Box>
          )}
        </Box>
        <Box
          component="button"
          onClick={() => setFilterOpen(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            backgroundColor: tokens.surface2,
            border: `1px solid ${filterCount ? tokens.gold : tokens.border}`,
            color: filterCount ? tokens.gold : tokens.text,
            borderRadius: '10px',
            px: 1.75,
            fontSize: 14,
            fontFamily: 'inherit',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          ⚙ Filter
          {filterCount > 0 && (
            <Box
              component="span"
              sx={{
                backgroundColor: tokens.gold,
                color: tokens.bg,
                borderRadius: '9px',
                fontSize: 11,
                fontWeight: 700,
                px: 0.75,
                minWidth: 16,
                textAlign: 'center',
              }}
            >
              {filterCount}
            </Box>
          )}
        </Box>
        <PercentPicker value={valuePct} onChange={setValuePct} />
      </StickyToolbar>

      {all.length === 0 ? (
        <EmptyCollection title="No singles yet" action="Add your first card" onAdd={() => setAddOpen(true)} />
      ) : shown.length === 0 ? (
        <EmptyState icon="🔍">
          <Box sx={{ mb: 1.25 }}>No cards match your search/filters.</Box>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={() => {
              setSearch('');
              setFilters(emptyFilters);
            }}
          >
            Clear Search & Filters
          </Button>
        </EmptyState>
      ) : (
        <>
          <SummaryTiles full={sum} valuePct={valuePct} caption={cardsLabel(shown, all)} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {shown.map((s) => (
              <ItemCard
                key={s.id}
                title={cardTitle(s)}
                subtitle={<Subtitle single={s} />}
                copyText={cardTitle(s)}
                quantity={s.quantity}
                valuePct={valuePct}
                numbers={cardNumbers(s, { valuePct })}
                feesLabel={pasFeesLabel(s.fees, s.feeUnits)}
                market={marketLine({ singleId: s.id }, cardTitle(s), s.quantity, s.unitValue != null)}
                autoValue={isAuto(marketLinks.data, { singleId: s.id })}
                image={findLink(marketLinks.data, { singleId: s.id })?.imageUrl}
                liveToday={updatedToday(findLink(marketLinks.data, { singleId: s.id }), today)}
                quarters={quarterBoxes(s.quarterUnitValues, s.quantity, s.totalCost, context.data.year)}
                onQuarterClick={(q) =>
                  setQuarterTarget({
                    item: { singleId: s.id },
                    name: cardTitle(s),
                    quarter: q.quarter,
                    quantity: s.quantity,
                    unitValue: s.quarterUnitValues[q.quarter - 1] ?? null,
                  })
                }
                actions={
                  <>
                    <IconAction label="Edit" icon={<EditOutlined />} onClick={() => setEditing(s)} />
                    <IconAction
                      label="Mark Sold"
                      icon={<SellOutlined />}
                      tone="green"
                      onClick={() =>
                        setSelling({
                          kind: 'single',
                          id: s.id,
                          name: `${cardTitle(s)} (${s.condition})`,
                          quantity: s.quantity,
                          unitCost: cardNumbers(s).unitCost,
                        })
                      }
                    />
                    <IconAction
                      label="Remove"
                      icon={<DeleteOutline />}
                      tone="danger"
                      onClick={() => setRemoving(s)}
                    />
                  </>
                }
              />
            ))}
          </Box>
        </>
      )}

      {all.length > 0 && <AddButton label="Add single card" onClick={() => setAddOpen(true)} />}
      <ItemFormSheet
        kind="single"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        today={context.data.today}
      />
      <ItemFormSheet
        kind="single"
        open={editing != null}
        editing={editing}
        onClose={() => setEditing(null)}
        today={context.data.today}
      />

      <QuarterSheet target={quarterTarget} onClose={() => setQuarterTarget(null)} />
      <MarketSheet target={marketTarget} onClose={() => setMarketTarget(null)} />
      <SellSheet target={selling} onClose={() => setSelling(null)} />
      <RemoveItemDialog
        target={removing && { kind: 'single', item: removing }}
        onClose={() => setRemoving(null)}
      />

      <SinglesFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        options={options}
      />
    </Box>
  );
}
