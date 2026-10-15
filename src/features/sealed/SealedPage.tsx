import type { ReactNode } from 'react';
import type { CompletedHold, SealedItem } from '../../api/types';
import type { SealedGroup } from '../../lib/sealedGroups';
import type { MarketTarget } from '../items/MarketSheet';
import type { QuarterTarget } from '../items/QuarterSheet';
import type { SellTarget } from '../items/SellSheet';
import type { CompleteTarget } from './CompleteHoldSheet';

import DeleteOutline from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SellOutlined from '@mui/icons-material/SellOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import { Box, useMediaQuery } from '@mui/material';
import { useMemo, useState } from 'react';

import { AddButton } from '../../components/AddButton';
import { CollapseAllButton } from '../../components/CollapseAllButton';
import { IconAction } from '../../components/IconAction';
import { ItemCard } from '../../components/ItemCard';
import { EmptyCollection, ErrorState, LoadingState } from '../../components/ListStates';
import { PercentPicker } from '../../components/PercentPicker';
import { StickyToolbar } from '../../components/StickyToolbar';
import {
  useAppContext,
  useCompletedHolds,
  useMarketLinks,
  useSealed,
  useSections,
} from '../../hooks/queries';
import { useCollapsibleGroups } from '../../hooks/useCollapsibleGroups';
import { useValuePercent } from '../../hooks/useStickyState';
import { cardNumbers, pasFeesLabel, quarterBoxes, totals } from '../../lib/cardMath';
import { formatDate, formatGain, formatMoney, gainLabel } from '../../lib/format';
import { findLink, isAuto, updatedToday } from '../../lib/marketLink';
import { groupSealed, groupSummary, soldSummary } from '../../lib/sealedGroups';
import { fonts, tokens } from '../../theme/tokens';
import { ItemFormSheet } from '../items/ItemFormSheet';
import { MarketLine } from '../items/MarketLine';
import { MarketSheet } from '../items/MarketSheet';
import { MoveSheet } from '../items/MoveSheet';
import { QuarterSheet } from '../items/QuarterSheet';
import { RemoveItemDialog } from '../items/RemoveItemDialog';
import { SellSheet } from '../items/SellSheet';
import { CompleteHoldSheet } from './CompleteHoldSheet';

function GroupHeader({
  group,
  collapsed,
  onToggle,
  valuePct,
  sold,
}: {
  group: SealedGroup;
  collapsed: boolean;
  onToggle: () => void;
  valuePct: number;
  /** Set for completed holds: show what it actually sold for. */
  sold?: CompletedHold;
}) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        mt: 1.75,
        mb: 1,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          fontSize: 11,
          color: tokens.text3,
          flexShrink: 0,
          transition: 'transform 0.2s',
          transform: collapsed ? 'rotate(-90deg)' : 'none',
        }}
      >
        ▼
      </Box>
      <Box
        sx={{
          fontSize: 11,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: tokens.text2,
          fontWeight: 600,
        }}
      >
        {group.name}
      </Box>
      <Box sx={{ flex: 1, height: '1px', backgroundColor: tokens.border }} />
      <Box
        sx={{
          fontFamily: fonts.mono,
          fontSize: 11,
          color: sold ? (sold.profit >= 0 ? tokens.green : tokens.red) : tokens.text3,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {sold ? soldSummary(group, sold.soldPrice) : groupSummary(group, valuePct)}
      </Box>
    </Box>
  );
}

/** Under Long Hold's and the current hold's header while open: cost and gain at the picked percentage. */
function CostGainLine({ group, valuePct }: { group: SealedGroup; valuePct: number }) {
  const t = totals(group.items, { valuePct });

  return (
    <Box sx={{ fontFamily: fonts.mono, fontSize: 11, color: tokens.text3, pl: 2.75, mt: -0.5, mb: 1 }}>
      Cost {formatMoney(t.totalCost)} ·{' '}
      <Box component="span" sx={{ color: t.gain >= 0 ? tokens.green : tokens.red }}>
        {gainLabel(t.gain)} {formatGain(t.gain)}
      </Box>
    </Box>
  );
}

function SealedCard({
  item,
  year,
  valuePct,
  onEdit,
  onRemove,
  onQuarter,
  onSell,
  onMove,
  market,
  autoValue,
  image,
  liveToday,
}: {
  item: SealedItem;
  year: number;
  valuePct: number;
  market: ReactNode;
  autoValue: boolean;
  image: string | null | undefined;
  liveToday: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onQuarter: (quarter: 1 | 2 | 3 | 4) => void;
  onSell: () => void;
  /** Left out when sealed isn't split into short and long holds (nowhere to move to). */
  onMove?: () => void;
}) {
  const isLong = item.holdStatus === 'long';

  return (
    <ItemCard
      title={item.name}
      subtitle={[item.quantity > 1 ? `Qty ${item.quantity}` : '', formatDate(item.purchaseDate)]
        .filter(Boolean)
        .join(' · ')}
      copyText={item.name}
      quantity={item.quantity}
      valuePct={valuePct}
      // Short Hold items with no price show their cost as their value (old-app behavior).
      numbers={cardNumbers(item, { fallbackToCost: !isLong, valuePct })}
      feesLabel={pasFeesLabel(item.fees, item.feeUnits)}
      market={item.holdStatus === 'historical' ? undefined : market}
      autoValue={item.holdStatus !== 'historical' && autoValue}
      image={image}
      liveToday={item.holdStatus !== 'historical' && liveToday}
      quarters={
        isLong ? quarterBoxes(item.quarterUnitValues, item.quantity, item.totalCost, year) : undefined
      }
      onQuarterClick={isLong ? (q) => onQuarter(q.quarter) : undefined}
      // Completed holds are history: their sale is already recorded, so their items are read-only.
      actions={
        item.holdStatus === 'historical' ? undefined : (
          <>
            <IconAction label="Edit" icon={<EditOutlined />} onClick={onEdit} />
            {isLong && <IconAction label="Mark Sold" icon={<SellOutlined />} tone="green" onClick={onSell} />}
            {onMove && <IconAction label="Move" icon={<SwapHorizOutlined />} onClick={onMove} />}
            <IconAction label="Remove" icon={<DeleteOutline />} tone="danger" onClick={onRemove} />
          </>
        )
      }
    />
  );
}

export function SealedPage() {
  const sealed = useSealed();
  const context = useAppContext();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<SealedItem | null>(null);
  const [removing, setRemoving] = useState<SealedItem | null>(null);
  const [quarterTarget, setQuarterTarget] = useState<QuarterTarget | null>(null);
  const [marketTarget, setMarketTarget] = useState<MarketTarget | null>(null);
  const marketLinks = useMarketLinks();
  const [selling, setSelling] = useState<SellTarget | null>(null);
  const [moving, setMoving] = useState<SealedItem | null>(null);
  const [completing, setCompleting] = useState<CompleteTarget | null>(null);

  const { splitsSealed } = useSections();
  // Without the split, everything sealed lives in the Long Hold and shows as one "Sealed" list.
  const groups = useMemo(() => {
    const all = groupSealed(sealed.data ?? []);

    return splitsSealed ? all : all.filter((g) => g.status === 'long').map((g) => ({ ...g, name: 'Sealed' }));
  }, [sealed.data, splitsSealed]);
  const currentGroup = groups.find((g) => g.status === 'current');
  const completedHolds = useCompletedHolds();
  const soldByHold = new Map((completedHolds.data ?? []).map((h) => [h.id, h]));
  const [valuePct, setValuePct] = useValuePercent();
  const isPhone = useMediaQuery('(max-width:599.95px)', { noSsr: true });
  const { isCollapsed, toggle, allCollapsed, toggleAll } = useCollapsibleGroups(
    'ui:sealed',
    groups.map((g) => g.holdId),
    { persist: true },
  );

  if (!sealed.data || !context.data) {
    if (sealed.isError) return <ErrorState error={sealed.error} onRetry={() => sealed.refetch()} />;
    if (context.isError) return <ErrorState error={context.error} onRetry={() => context.refetch()} />;

    return <LoadingState />;
  }

  const today = context.data.today;
  const marketLine = (item: SealedItem) => {
    const link = findLink(marketLinks.data, { sealedItemId: item.id });

    return (
      link && (
        <MarketLine
          link={link}
          today={today}
          quantity={item.quantity}
          onClick={() => setMarketTarget({ item: { sealedItemId: item.id }, name: item.name, link })}
        />
      )
    );
  };

  const addSheet = (
    <>
      <QuarterSheet target={quarterTarget} onClose={() => setQuarterTarget(null)} />
      <MarketSheet target={marketTarget} onClose={() => setMarketTarget(null)} />
      <SellSheet target={selling} onClose={() => setSelling(null)} />
      <MoveSheet
        item={moving}
        currentShortHoldName={context.data.currentShortHoldName}
        onClose={() => setMoving(null)}
      />
      <CompleteHoldSheet target={completing} onClose={() => setCompleting(null)} />
      <RemoveItemDialog
        target={removing && { kind: 'sealed', item: removing }}
        onClose={() => setRemoving(null)}
      />
      <ItemFormSheet
        kind="sealed"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        today={context.data.today}
      />
      <ItemFormSheet
        kind="sealed"
        open={editing != null}
        editing={editing}
        onClose={() => setEditing(null)}
        today={context.data.today}
      />
    </>
  );

  if (groups.length === 0) {
    return (
      <>
        <EmptyCollection
          title="No sealed product yet"
          action="Add your first sealed product"
          onAdd={() => setAddOpen(true)}
        />
        {addSheet}
      </>
    );
  }

  return (
    <Box>
      <StickyToolbar justify="flex-end">
        {currentGroup && (
          <Box
            component="button"
            type="button"
            onClick={() =>
              setCompleting({ holdName: currentGroup.name, spent: totals(currentGroup.items).totalCost })
            }
            sx={{
              mr: 'auto',
              backgroundColor: 'rgba(52,199,123,0.12)',
              border: '1px solid rgba(52,199,123,0.25)',
              color: tokens.green,
              borderRadius: '10px',
              px: 1.75,
              py: 1.25,
              fontSize: 14,
              fontFamily: 'inherit',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isPhone
              ? `Complete #${currentGroup.items[0]?.holdNumber ?? ''} ✓`
              : `Complete ${currentGroup.name} ✓`}
          </Box>
        )}
        <PercentPicker value={valuePct} onChange={setValuePct} />
        {splitsSealed && (
          <CollapseAllButton allCollapsed={allCollapsed} onClick={toggleAll} short={isPhone} />
        )}
      </StickyToolbar>

      {groups.map((group) => {
        const groupCollapsed = isCollapsed(group.holdId);

        return (
          <Box key={group.holdId} sx={{ mb: 0.5 }}>
            <GroupHeader
              group={group}
              collapsed={groupCollapsed}
              onToggle={() => toggle(group.holdId)}
              valuePct={valuePct}
              sold={soldByHold.get(group.holdId)}
            />
            {!groupCollapsed && group.status !== 'historical' && (
              <CostGainLine group={group} valuePct={valuePct} />
            )}
            {!groupCollapsed && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items.map((item) => (
                  <SealedCard
                    key={item.id}
                    item={item}
                    year={context.data.year}
                    valuePct={valuePct}
                    market={marketLine(item)}
                    autoValue={isAuto(marketLinks.data, { sealedItemId: item.id })}
                    image={findLink(marketLinks.data, { sealedItemId: item.id })?.imageUrl}
                    liveToday={updatedToday(findLink(marketLinks.data, { sealedItemId: item.id }), today)}
                    onEdit={() => setEditing(item)}
                    onRemove={() => setRemoving(item)}
                    onMove={splitsSealed ? () => setMoving(item) : undefined}
                    onSell={() =>
                      setSelling({
                        kind: 'sealed',
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        unitCost: cardNumbers(item).unitCost,
                      })
                    }
                    onQuarter={(quarter) =>
                      setQuarterTarget({
                        item: { sealedItemId: item.id },
                        name: item.name,
                        quarter,
                        quantity: item.quantity,
                        unitValue: item.quarterUnitValues[quarter - 1] ?? null,
                      })
                    }
                  />
                ))}
              </Box>
            )}
          </Box>
        );
      })}
      <AddButton label="Add sealed product" onClick={() => setAddOpen(true)} />
      {addSheet}
    </Box>
  );
}
