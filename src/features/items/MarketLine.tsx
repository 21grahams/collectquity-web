import type { MarketLink } from '../../api/types';

import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import { Box } from '@mui/material';

import { formatMoney } from '../../lib/format';
import { isGradedLink, marketStatus } from '../../lib/marketLink';
import { canHover, fonts, tokens } from '../../theme/tokens';

interface Props {
  link: MarketLink;
  today: string;
  quantity: number;
  /** The item has a market value, e.g. the catalog estimate before its first morning run. */
  valued: boolean;
  onClick: () => void;
}

export function MarketLine({ link, today, quantity, valued, onClick }: Props) {
  const Icon = link.pinned ? PushPinOutlined : AutorenewRounded;
  const ea = quantity > 1 ? ' ea' : '';
  const reference = (value: number | null, active: boolean) => (
    <Box component="span" sx={{ fontFamily: fonts.mono, color: active ? tokens.text2 : tokens.text3 }}>
      {formatMoney(value)}
      {ea}
    </Box>
  );
  const recentActive = !link.pinned && link.gradedBasis === 'recent';
  const longTermActive = !link.pinned && link.gradedBasis === 'long_term';

  // Two separate tap targets so the blank space beside the shorter line isn't one.
  const line = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    width: 'fit-content',
    p: 0,
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontSize: 11,
    color: tokens.text3,
    cursor: 'pointer',
    [canHover]: { '&:hover': { color: tokens.gold } },
  } as const;

  return (
    <Box sx={{ mt: 0.75 }}>
      <Box component="button" type="button" onClick={onClick} aria-label="Market price settings" sx={line}>
        <Icon sx={{ fontSize: 13, color: link.pinned ? tokens.text3 : tokens.blue }} />
        {marketStatus(link, today, valued)}
      </Box>
      {isGradedLink(link) && (
        <Box
          component="button"
          type="button"
          onClick={onClick}
          sx={{ ...line, display: 'block', mt: '2px', ml: '17px' }}
        >
          7-day {reference(link.recentUnitValue, recentActive)} · Long-term{' '}
          {reference(link.longTermUnitValue, longTermActive)}
        </Box>
      )}
    </Box>
  );
}
