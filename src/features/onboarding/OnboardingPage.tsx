import type { FormEvent } from 'react';

import { Alert, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { SaveButton } from '../../components/SaveButton';
import { useSaveSections } from '../../hooks/mutations';
import { AuthLayout } from '../auth/AuthLayout';
import { OptionCard } from './OptionCard';

type Step = 'collection' | 'track' | 'split';

/** First-time setup after joining: what you collect, what you track, and whether sealed is split. */
export function OnboardingPage() {
  const save = useSaveSections();
  const [step, setStep] = useState<Step>('collection');
  const [singles, setSingles] = useState(true);
  const [sealed, setSealed] = useState(true);
  const [split, setSplit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastStep = step === 'split' || (step === 'track' && !sealed);
  const invalid = step === 'track' && !singles && !sealed;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (invalid || save.isPending) return;
    if (!lastStep) {
      setStep(step === 'collection' ? 'track' : 'split');

      return;
    }
    setError(null);
    try {
      await save.mutateAsync({
        tracksSingles: singles,
        tracksSealed: sealed,
        splitsSealed: sealed && split,
        usesAccounts: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AuthLayout onSubmit={handleSubmit}>
      {step === 'collection' && (
        <>
          <Heading title="What do you collect?" />
          <Stack spacing={1.25}>
            <OptionCard title="Pokémon" hint="Cards and sealed products" selected />
            <OptionCard
              title="Other collections"
              hint="Sneakers, coins, comics and more"
              badge="Coming in Beta V2"
              disabled
            />
          </Stack>
        </>
      )}
      {step === 'track' && (
        <>
          <Heading title="What do you track?" subtitle="Pick one or both." />
          <Stack spacing={1.25}>
            <OptionCard
              title="Singles"
              hint="Individual cards, raw or graded"
              selected={singles}
              multiple
              onClick={() => setSingles((s) => !s)}
            />
            <OptionCard
              title="Sealed"
              hint="Booster boxes, ETBs, tins and more"
              selected={sealed}
              multiple
              onClick={() => setSealed((s) => !s)}
            />
          </Stack>
        </>
      )}
      {step === 'split' && (
        <>
          <Heading
            title="How do you hold sealed?"
            subtitle="Some collectors flip some sealed quickly and hold the rest long term."
          />
          <Stack spacing={1.25}>
            <OptionCard
              title="One sealed list"
              hint="Everything sealed in one place"
              selected={!split}
              onClick={() => setSplit(false)}
            />
            <OptionCard
              title="Short and long holds"
              hint="Separate quick flips from long-term holds"
              selected={split}
              onClick={() => setSplit(true)}
            />
          </Stack>
        </>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="caption" color="text.secondary" align="center">
        You can change these anytime in the account menu.
      </Typography>
      <SaveButton
        type="submit"
        size="large"
        invalid={invalid}
        pending={save.isPending}
        label={lastStep ? 'Start collecting' : 'Next'}
        pendingLabel="Setting up…"
      />
      {step !== 'collection' && (
        <Button
          size="small"
          color="inherit"
          onClick={() => setStep(step === 'split' ? 'track' : 'collection')}
        >
          Back
        </Button>
      )}
    </AuthLayout>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <Typography variant="h6" align="center">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </div>
  );
}
