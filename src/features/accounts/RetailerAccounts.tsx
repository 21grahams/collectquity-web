import type { RetailerAccount } from '../../api/types';
import type { RetailerGroup } from '../../lib/retailers';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

import { CardButton } from '../../components/CardActions';
import { EyeButton } from '../../components/EyeButton';
import { EmptyCollection, ErrorState, LoadingState } from '../../components/ListStates';
import { useAccounts } from '../../hooks/queries';
import { groupAccounts } from '../../lib/retailers';
import { fonts, tokens } from '../../theme/tokens';

const detail = { fontSize: 12, color: tokens.text2, fontFamily: fonts.mono, mt: '3px' } as const;

interface CardHandlers {
  onEdit: (a: RetailerAccount) => void;
  onRemove: (a: RetailerAccount) => void;
}

function AccountCard({
  account,
  color,
  onEdit,
  onRemove,
}: { account: RetailerAccount; color: string } & CardHandlers) {
  const [revealed, setRevealed] = useState(false);

  // Re-mask when the app goes to the background (switching apps, locking the phone).
  useEffect(() => {
    const hide = () => {
      if (document.visibilityState === 'hidden') setRevealed(false);
    };
    document.addEventListener('visibilitychange', hide);

    return () => document.removeEventListener('visibilitychange', hide);
  }, []);

  const show = (value: string, dots: string) => (value ? (revealed ? value : dots) : '—');

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: `${tokens.radius}px`,
        p: '12px 14px 12px 16px',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: color,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ fontSize: 14, fontWeight: 600 }}>{account.label}</Box>
        <EyeButton revealed={revealed} what="account details" onClick={() => setRevealed((r) => !r)} />
      </Box>
      <Box sx={detail}>{show(account.email, '••••••••••••')}</Box>
      <Box sx={detail}>
        Card •• {show(account.cardLast2, '••')} · Phone •••• {show(account.phoneLast4, '••••')}
      </Box>
      {account.loop && <Box sx={detail}>Loop: {account.loop}</Box>}
      {account.notes && (
        <Box
          sx={{ ...detail, fontFamily: revealed ? 'inherit' : fonts.mono, whiteSpace: 'pre-wrap', mt: '5px' }}
        >
          {revealed ? account.notes : '••••••••••••'}
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
        <CardButton onClick={() => onEdit(account)}>Edit</CardButton>
        <CardButton variant="danger" onClick={() => onRemove(account)}>
          Remove
        </CardButton>
      </Box>
    </Box>
  );
}

function Group({
  group,
  collapsed,
  onToggle,
  ...handlers
}: { group: RetailerGroup; collapsed: boolean; onToggle: () => void } & CardHandlers) {
  const n = group.accounts.length;

  return (
    <Box sx={{ mb: 0.5 }}>
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
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: group.color, flexShrink: 0 }} />
        <Box
          sx={{
            fontSize: 11,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: tokens.text2,
            fontWeight: 600,
          }}
        >
          {group.retailer}
        </Box>
        <Box sx={{ flex: 1, height: '1px', backgroundColor: tokens.border }} />
        <Box sx={{ fontFamily: fonts.mono, fontSize: 11, color: tokens.text3, flexShrink: 0 }}>
          {n} account{n !== 1 ? 's' : ''}
        </Box>
      </Box>
      {!collapsed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {group.accounts.map((a) => (
            <AccountCard key={a.id} account={a} color={group.color} {...handlers} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export function RetailerAccounts({
  isCollapsed,
  toggle,
  onAdd,
  ...handlers
}: {
  isCollapsed: (retailer: string) => boolean;
  toggle: (retailer: string) => void;
  onAdd: () => void;
} & CardHandlers) {
  const accounts = useAccounts();
  const groups = groupAccounts(accounts.data ?? []);
  if (!accounts.data) {
    return accounts.isError ? (
      <ErrorState error={accounts.error} onRetry={() => accounts.refetch()} />
    ) : (
      <LoadingState />
    );
  }

  if (groups.length === 0) {
    return <EmptyCollection title="No accounts yet" action="Add your first account" onAdd={onAdd} />;
  }

  return (
    <Box>
      {groups.map((g) => (
        <Group
          key={g.retailer}
          group={g}
          collapsed={isCollapsed(g.retailer)}
          onToggle={() => toggle(g.retailer)}
          {...handlers}
        />
      ))}
    </Box>
  );
}
