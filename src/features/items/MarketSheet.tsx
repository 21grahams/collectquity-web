import type { GradedBasis, MarketLink } from '../../api/types';

import { Box } from '@mui/material';
import { useState } from 'react';

import { sheetButtonSx } from '../../components/buttonStyles';
import { Segmented } from '../../components/form';
import { SaveButton } from '../../components/SaveButton';
import { CancelButton, Field, Sheet } from '../../components/Sheet';
import { useSetMarketLink } from '../../hooks/mutations';
import { useSaveSession } from '../../hooks/useSaveSession';
import { formatMoney } from '../../lib/format';
import { isGradedLink } from '../../lib/marketLink';
import { tokens } from '../../theme/tokens';

export interface MarketTarget {
  item: { singleId: number } | { sealedItemId: number };
  name: string;
  link: MarketLink;
}

type Updates = 'on' | 'paused';

export function MarketSheet({ target, onClose }: { target: MarketTarget | null; onClose: () => void }) {
  const session = useSaveSession();
  const setLink = useSetMarketLink();
  const [shown, setShown] = useState<MarketTarget | null>(target);
  const [updates, setUpdates] = useState<Updates>('on');
  const [basis, setBasis] = useState<GradedBasis>('long_term');

  if (target && target !== shown) {
    setShown(target);
    setUpdates(target.link.pinned ? 'paused' : 'on');
    setBasis(target.link.gradedBasis);
    session.reset();
  }

  const link = shown?.link;
  const unchanged = !link || ((updates === 'paused') === link.pinned && basis === link.gradedBasis);

  function submit() {
    if (!target || unchanged) return;
    const vars = { item: target.item, pinned: updates === 'paused', gradedBasis: basis };
    setLink.mutate({ requestId: session.idFor(vars), ...vars }, { onSuccess: onClose });
  }

  return (
    <Sheet
      open={target != null}
      onClose={onClose}
      title="Market Price"
      subtitle={shown?.name}
      footer={
        <>
          <CancelButton onClick={onClose} />
          <SaveButton
            invalid={unchanged}
            pending={setLink.isPending}
            label="Save"
            onClick={submit}
            sx={sheetButtonSx}
          />
        </>
      }
    >
      <Field label="Matched Product">
        <Box sx={{ fontSize: 14, color: tokens.text }}>{link?.productName}</Box>
      </Field>
      <Field label="Daily Updates">
        <Segmented
          value={updates}
          onChange={setUpdates}
          options={[
            { value: 'on', label: 'On' },
            { value: 'paused', label: 'Paused' },
          ]}
        />
      </Field>
      {link && isGradedLink(link) && (
        <Field label="Price to Use">
          <Segmented
            value={basis}
            onChange={setBasis}
            options={[
              { value: 'long_term', label: `Long-term ${formatMoney(link.longTermUnitValue)}` },
              { value: 'recent', label: `7-day ${formatMoney(link.recentUnitValue)}` },
            ]}
          />
        </Field>
      )}
      <Box sx={{ fontSize: 12, color: tokens.text3, lineHeight: 1.5 }}>
        Prices update every morning around 6 AM; past quarters keep their last value. Typing a market value
        yourself pauses updates for this item.
        {link &&
          isGradedLink(link) &&
          ' Graded prices come from eBay sales: 7-day reacts fast, long-term is steadier.'}
      </Box>
    </Sheet>
  );
}
