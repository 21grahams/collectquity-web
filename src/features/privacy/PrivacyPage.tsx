import type { ReactNode } from 'react';

import { Box, Link, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router';

import { Wordmark } from '../../components/Wordmark';
import { APP_NAME } from '../../lib/brand';
import { tokens } from '../../theme/tokens';

export const PRIVACY_EMAIL = 'privacy@collectquity.com';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mb: 3 }}>
      <Typography variant="h6" component="h2" sx={{ color: tokens.gold, mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ color: tokens.text2, '& p': { m: 0, mb: 1.25 }, '& ul': { m: 0, mb: 1.25, pl: 2.5 } }}>
        {children}
      </Box>
    </Box>
  );
}

export function PrivacyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Opened straight from a link there's nothing to go back to, so go to the start instead.
  const back = () => (location.key === 'default' ? navigate('/') : navigate(-1));

  return (
    <Box
      sx={{
        maxWidth: 640,
        mx: 'auto',
        pl: 'max(16px, env(safe-area-inset-left))',
        pr: 'max(16px, env(safe-area-inset-right))',
        pt: 'calc(env(safe-area-inset-top) + 24px)',
        pb: 'calc(env(safe-area-inset-bottom) + 32px)',
        lineHeight: 1.6,
      }}
    >
      <Link component="button" type="button" onClick={back} variant="body2" sx={{ mb: 2 }}>
        ← Back
      </Link>
      <Box sx={{ mb: 1 }}>
        <Wordmark />
      </Box>
      <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
        Privacy Policy
      </Typography>
      <Typography variant="body2" sx={{ color: tokens.text2, mb: 3 }}>
        {APP_NAME} beta · Last updated October 14, 2026
      </Typography>

      <Section title="What we collect">
        <ul>
          <li>
            <strong>Your account:</strong> your email and password. Passwords are stored scrambled by our
            login provider; nobody can read them, including us.
          </li>
          <li>
            <strong>Your collection:</strong> the items, costs, dates, values, sales and holds you enter, and
            any retailer accounts you choose to add.
          </li>
          <li>
            <strong>An optional profile photo.</strong>
          </li>
          <li>
            <strong>Your time zone,</strong> from your device, so dates and quarters are right.
          </li>
        </ul>
        <p>
          Our providers also record technical details like your IP address and browser type to run logins and
          keep the service secure, and we note which invite code you used. No location, contacts, ads,
          analytics or tracking.
        </p>
      </Section>

      <Section title="How we use it">
        <p>
          Only to run the app for you. We never sell your data, share it for advertising, or use it to profile
          you.
        </p>
      </Section>

      <Section title="Services that help run the app">
        <ul>
          <li>Supabase: database, login and photo storage (USA).</li>
          <li>Resend: sends account emails, like your sign-up codes.</li>
          <li>GitHub Pages: serves the website.</li>
          <li>Porkbun: the collectquity.com domain and email forwarding.</li>
          <li>
            TCGplayer: card pictures load straight from TCGplayer's image servers, so they see your IP address
            and which pictures load, like any website you visit.
          </li>
          <li>
            Price lookups (JustTCG, PokemonPriceTracker, TCGCSV): we send them only product IDs, never
            anything about you.
          </li>
        </ul>
      </Section>

      <Section title="On your device">
        <p>
          The app keeps your login and a copy of your data in your browser so it works offline. Logging out
          clears it.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Encrypted connections, each account can only ever access its own data, and passwords are never
          stored in readable form.
        </p>
      </Section>

      <Section title="Keeping and deleting">
        <p>
          Your data is kept while you have an account. <strong>Delete account</strong> (in the account menu)
          permanently deletes your login, collection and photo right away. Weekly backups of collection data
          (without your email or photo) are kept on the operator's computer and deleted within about 3 months.
        </p>
      </Section>

      <Section title="Beta">
        <p>
          {APP_NAME} is an invite-only test version. If this policy changes in a meaningful way, we'll update
          this page and its date.
        </p>
      </Section>

      <Section title="Age">
        <p>{APP_NAME} is for people 18 and older.</p>
      </Section>

      <Section title="Contact">
        <p>
          Questions or requests: <Link href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</Link>
        </p>
      </Section>
    </Box>
  );
}
