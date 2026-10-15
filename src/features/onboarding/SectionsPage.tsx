import type { FormEvent } from 'react';
import type { Sections } from '../../api/types';

import { Alert, Link, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router';

import { useNotify } from '../../components/notifyContext';
import { SaveButton } from '../../components/SaveButton';
import { useSaveSections } from '../../hooks/mutations';
import { useSealed, useSections } from '../../hooks/queries';
import { AuthLayout } from '../auth/AuthLayout';
import { OptionCard } from './OptionCard';

/** Change what you track after onboarding. Turning a section off only hides it. */
export function SectionsPage() {
  const current = useSections();
  const sealed = useSealed();
  const save = useSaveSections();
  const notify = useNotify();
  const [choice, setChoice] = useState<Sections>(current);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) return <Navigate to="/" replace />;

  const set = (patch: Partial<Sections>) => setChoice((c) => ({ ...c, ...patch }));
  const invalid = !choice.tracksSingles && !choice.tracksSealed;
  const unchanged = (Object.keys(choice) as (keyof Sections)[]).every((k) => choice[k] === current[k]);
  const shortHoldItems = (sealed.data ?? []).filter((i) => i.holdStatus === 'current').length;
  const hidingShortHold =
    current.splitsSealed && choice.tracksSealed && !choice.splitsSealed && shortHoldItems > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (invalid || unchanged || save.isPending) return;
    setError(null);
    try {
      await save.mutateAsync({ ...choice, splitsSealed: choice.tracksSealed && choice.splitsSealed });
      notify('Sections saved', 'success');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AuthLayout onSubmit={handleSubmit}>
      <Typography variant="h6" align="center">
        Sections
      </Typography>

      <SectionTitle>What do you track?</SectionTitle>
      <Stack spacing={1.25}>
        <OptionCard
          title="Singles"
          hint="Individual cards, raw or graded"
          selected={choice.tracksSingles}
          multiple
          onClick={() => set({ tracksSingles: !choice.tracksSingles })}
        />
        <OptionCard
          title="Sealed"
          hint="Booster boxes, ETBs, tins and more"
          selected={choice.tracksSealed}
          multiple
          onClick={() => set({ tracksSealed: !choice.tracksSealed })}
        />
      </Stack>

      {choice.tracksSealed && (
        <>
          <SectionTitle>How do you hold sealed?</SectionTitle>
          <Stack spacing={1.25}>
            <OptionCard
              title="One sealed list"
              hint="Everything sealed in one place"
              selected={!choice.splitsSealed}
              onClick={() => set({ splitsSealed: false })}
            />
            <OptionCard
              title="Short and long holds"
              hint="Separate quick flips from long-term holds"
              selected={choice.splitsSealed}
              onClick={() => set({ splitsSealed: true })}
            />
          </Stack>
        </>
      )}

      <SectionTitle>Extras</SectionTitle>
      <OptionCard
        title="Retailer accounts"
        hint="Keep track of your store logins"
        selected={choice.usesAccounts}
        multiple
        onClick={() => set({ usesAccounts: !choice.usesAccounts })}
      />

      {hidingShortHold && (
        <Alert severity="info">
          Your current short hold has {shortHoldItems} {shortHoldItems === 1 ? 'item' : 'items'}. It stays on
          the Sealed page until you complete it or move its items to your Sealed list; new sealed items go
          straight to your Sealed list.
        </Alert>
      )}
      {invalid && <Alert severity="info">Choose singles, sealed or both.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="caption" color="text.secondary" align="center">
        Turning a section off only hides it. Nothing is deleted.
      </Typography>
      <SaveButton
        type="submit"
        size="large"
        invalid={invalid || unchanged}
        pending={save.isPending}
        label="Save"
        pendingLabel="Saving…"
      />
      <Typography variant="body2" align="center">
        <Link component={RouterLink} to="/">
          Cancel
        </Link>
      </Typography>
    </AuthLayout>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.5, mb: -1 }}>
      {children}
    </Typography>
  );
}
