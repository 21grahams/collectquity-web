import type { FormEvent } from 'react';
import type { AdminPerson } from '../../api/types';

import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate } from 'react-router';

import { ErrorState, LoadingState } from '../../components/ListStates';
import { SaveButton } from '../../components/SaveButton';
import { useCreateInvite } from '../../hooks/mutations';
import { useAccount, useAdminPeople, useAppContext } from '../../hooks/queries';
import { useGoBack } from '../../hooks/useGoBack';
import { activeThisWeek, lastOpenedLabel } from '../../lib/admin';
import { formatDate } from '../../lib/format';
import { fonts, tokens } from '../../theme/tokens';
import { AuthLayout } from '../auth/AuthLayout';

/** The owner's view of the beta: who joined, who's active, and new invite codes. */
export function AdminPage() {
  const account = useAccount(true);
  const people = useAdminPeople(!!account.data?.isAdmin);
  const context = useAppContext();
  const create = useCreateInvite();
  const goBack = useGoBack();
  const [note, setNote] = useState('');
  const [made, setMade] = useState<{ note: string; code: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (account.data && !account.data.isAdmin) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = note.trim();
    if (!name || create.isPending) return;
    setMade(null);
    const code = await create.mutateAsync(name).catch(() => null);
    if (!code) return;
    setMade({ note: name, code });
    setCopied(false);
    setNote('');
  }

  const rows = people.data ?? [];
  const joined = rows.filter((p) => p.joinedOn);
  const today = context.data?.today;

  return (
    <AuthLayout onSubmit={handleSubmit}>
      <Typography variant="h6" align="center">
        Admin
      </Typography>

      {people.data && (
        <Typography align="center" color="text.secondary" variant="body2">
          {joined.length} of {rows.length} invites used
          {today &&
            ` · ${joined.filter((p) => activeThisWeek(p.lastOpenedOn, today)).length} opened this week`}
        </Typography>
      )}

      <SectionTitle>Invite someone</SectionTitle>
      {create.isError && (
        <Alert severity="error">
          {create.error instanceof Error ? create.error.message : String(create.error)}
        </Alert>
      )}
      {made && (
        <Alert
          severity="success"
          action={
            // Copying needs a secure page; without it the code is still one tap to select.
            navigator.clipboard && (
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  navigator.clipboard.writeText(made.code).then(
                    () => setCopied(true),
                    () => undefined,
                  )
                }
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )
          }
        >
          {made.note}'s code:{' '}
          <Box component="span" sx={{ fontFamily: fonts.mono, fontWeight: 500, userSelect: 'all' }}>
            {made.code}
          </Box>
        </Alert>
      )}
      <TextField
        label="Who's it for?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        autoComplete="off"
        fullWidth
        slotProps={{ htmlInput: { autoCapitalize: 'words' } }}
      />
      <SaveButton
        type="submit"
        invalid={!note.trim()}
        pending={create.isPending}
        label="Create invite code"
        pendingLabel="Creating…"
      />

      <SectionTitle>People</SectionTitle>
      {people.isError ? (
        <ErrorState error={people.error} onRetry={() => people.refetch()} />
      ) : !people.data ? (
        <LoadingState />
      ) : (
        <Stack spacing={1}>
          {rows.map((p, i) => (
            <PersonCard key={`${p.code}-${i}`} person={p} today={today} />
          ))}
        </Stack>
      )}

      <Button size="small" color="inherit" sx={{ alignSelf: 'center' }} onClick={goBack}>
        Back
      </Button>
    </AuthLayout>
  );
}

function PersonCard({ person: p, today }: { person: AdminPerson; today: string | undefined }) {
  const items = [
    `${p.singles} ${p.singles === 1 ? 'single' : 'singles'}`,
    `${p.sealed} sealed`,
    ...(p.completedHolds
      ? [`${p.completedHolds} ${p.completedHolds === 1 ? 'hold' : 'holds'} completed`]
      : []),
  ];

  return (
    <Box
      sx={{
        backgroundColor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: `${tokens.radius}px`,
        p: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
        <Box sx={{ fontWeight: 600 }}>{p.note || 'No name'}</Box>
        <Box sx={{ fontSize: 12, color: p.joinedOn ? tokens.green : tokens.text3, whiteSpace: 'nowrap' }}>
          {p.joinedOn ? `Joined ${formatDate(p.joinedOn).slice(0, 5)}` : 'Not joined yet'}
        </Box>
      </Box>
      <Box sx={{ fontFamily: fonts.mono, fontSize: 12, color: tokens.text3, mt: '2px' }}>{p.code}</Box>
      {p.joinedOn && (
        <Box sx={{ fontSize: 13, color: tokens.text2, mt: 0.75 }}>
          Last opened {lastOpenedLabel(p.lastOpenedOn, today)} · {items.join(' · ')}
          {p.splitsSealed != null && (
            <Box component="span" sx={{ color: tokens.text3 }}>
              {' '}
              · {p.splitsSealed ? 'short & long holds' : 'one sealed list'}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.5, mb: -1 }}>
      {children}
    </Typography>
  );
}
