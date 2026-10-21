import type { ReactNode } from 'react';
import type { CardNumbers } from '../../lib/cardMath';

import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import { Box, Button, IconButton, Link, Modal, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';

import { ItemCard } from '../../components/ItemCard';
import { SummaryTiles } from '../../components/SummaryTiles';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Wordmark } from '../../components/Wordmark';
import { APP_NAME, TAGLINE } from '../../lib/brand';
import { fonts, tokens } from '../../theme/tokens';
import { useAuth } from '../auth/authContext';

const art = (id: number) => `https://tcgplayer-cdn.tcgplayer.com/product/${id}_200w.jpg`;

function numbers(totalCost: number, totalValue: number, quantity = 1): CardNumbers {
  const gain = totalValue - totalCost;

  return {
    unitCost: totalCost / quantity,
    unitValue: totalValue / quantity,
    totalCost,
    totalValue,
    gain,
    gainPct: (gain / totalCost) * 100,
    value80: totalValue * 0.8,
    profit80: totalValue * 0.8 - totalCost,
    profit80Pct: ((totalValue * 0.8 - totalCost) / totalCost) * 100,
    tone: gain >= 0 ? 'gain' : 'loss',
  };
}

// Sample cards for the phone mockup (made-up costs, real catalog pictures).
const SAMPLES = [
  {
    title: 'Umbreon ex',
    subtitle: 'Prismatic Evolutions · NM',
    image: art(610516),
    numbers: numbers(650, 1240.36),
  },
  { title: 'Charizard', subtitle: 'Base Set · LP', image: art(42382), numbers: numbers(400, 954.65) },
  { title: 'Pikachu ex', subtitle: 'Surging Sparks · NM', image: art(593169), numbers: numbers(45, 71.59) },
  {
    title: 'Prismatic Evolutions ETB',
    subtitle: 'Sealed · Long Hold',
    image: art(593355),
    numbers: numbers(120, 254.4, 2),
    quantity: 2,
  },
];

const SAMPLE_TOTALS = (() => {
  const totalCost = SAMPLES.reduce((n, s) => n + s.numbers.totalCost, 0);
  const totalValue = SAMPLES.reduce((n, s) => n + s.numbers.totalValue, 0);

  return {
    units: 5,
    totalCost,
    totalValue,
    gain: totalValue - totalCost,
    gainPct: ((totalValue - totalCost) / totalCost) * 100,
    value80: totalValue * 0.8,
  };
})();

const SHOTS = [
  { src: 'landing/singles.jpg', caption: 'Every card, priced every morning.' },
  { src: 'landing/search.jpg', caption: 'Search 30,000+ cards and products, prices included.' },
  { src: 'landing/estimate.jpg', caption: 'Today’s price before you even save.' },
  { src: 'landing/sealed.jpg', caption: 'Booster boxes, ETBs and more, priced too.' },
  { src: 'landing/holds.jpg', caption: 'Flips and holds, kept apart.' },
  { src: 'landing/profit.jpg', caption: 'See what you’ve actually made.' },
];

const autoLine = (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75, fontSize: 11, color: tokens.text3 }}>
    <AutorenewRounded sx={{ fontSize: 13, color: tokens.blue }} />
    Auto · updated today
  </Box>
);

const COMPARISON = {
  others: [
    'They show today’s value but forget what you paid.',
    'They don’t know what you sold, or for how much.',
    'Quick flips and long-term holds get lumped together.',
  ],
  ours: [
    'Remembers what you paid, fees and taxes included.',
    'Logs every sale and shows your real profit.',
    'Keeps flips and holds apart, with profit for each.',
  ],
};

const FEATURES = [
  {
    title: 'Prices itself',
    text: 'Every card and sealed product updates each morning. Raw cards by condition, graded cards by grade.',
  },
  {
    title: 'Real profit',
    text: 'What you paid (fees and taxes included), what you sold for, and what you kept.',
  },
  {
    title: 'Flips and holds, kept apart',
    text: 'Group quick flips into separate short holds and see each one’s profit next to your long-term collection.',
  },
  { title: 'Made for your phone', text: 'Search 30,000+ cards and products, see the picture, tap, done.' },
];

const STEPS = [
  'Add what you own.',
  'It prices itself every morning.',
  'Log what you sell.',
  'See what you’ve made.',
  'Enjoy the hobby.',
];

/** What a browser visitor sees before logging in. The home-screen app skips it. */
export function LandingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const actions = session ? (
    <Button variant="contained" size="large" onClick={() => navigate('/')}>
      Open my collection
    </Button>
  ) : (
    <>
      <Button variant="contained" size="large" onClick={() => navigate('/signup')}>
        I have an invite
      </Button>
      <Button variant="outlined" size="large" color="inherit" onClick={() => navigate('/login')}>
        Log in
      </Button>
    </>
  );

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        // Safari can count the shrunken mockup and off-screen slides as page size; keep them inside.
        overflow: 'hidden',
        backgroundColor: tokens.bg,
        color: tokens.text,
        pl: 'max(20px, env(safe-area-inset-left))',
        pr: 'max(20px, env(safe-area-inset-right))',
        pt: 'calc(env(safe-area-inset-top) + 16px)',
        pb: 'calc(env(safe-area-inset-bottom) + 24px)',
      }}
    >
      <Box sx={{ maxWidth: 1040, mx: 'auto' }}>
        <Box
          component="header"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Wordmark />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            {!session && (
              <Button color="inherit" onClick={() => navigate('/login')}>
                Log in
              </Button>
            )}
          </Box>
        </Box>

        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' },
            gap: { xs: 5, md: 6 },
            alignItems: 'center',
            py: { xs: 5, md: 9 },
          }}
        >
          <Box>
            <Eyebrow>Invite-only beta · For Pokémon collectors</Eyebrow>
            <Box
              component="h1"
              sx={{
                fontFamily: fonts.serif,
                fontWeight: 400,
                fontSize: { xs: 36, md: 52 },
                lineHeight: 1.1,
                m: 0,
                mt: 1.5,
              }}
            >
              Know what your collection is worth, and what you’ve actually made.
            </Box>
            <Box sx={{ fontSize: { xs: 17, md: 19 }, color: tokens.text2, lineHeight: 1.55, mt: 2.5 }}>
              {APP_NAME} prices your cards and sealed products every morning and keeps track of every buy,
              sale and flip, so you see real profit instead of guesses.
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 4 }}>{actions}</Box>
          </Box>
          <PhoneMockup />
        </Box>

        <Section>
          <SectionTitle>Most collection apps stop at “what’s it worth?”</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mt: 3 }}>
            <CompareList title="Most apps" items={COMPARISON.others} mark="✕" color={tokens.red} />
            <CompareList
              title={<Gold>{APP_NAME}</Gold>}
              items={COMPARISON.ours}
              mark="✓"
              color={tokens.green}
              highlight
            />
          </Box>
          <Box
            sx={{
              fontFamily: fonts.serif,
              fontSize: { xs: 30, md: 40 },
              color: tokens.gold,
              mt: { xs: 5, md: 7 },
              textAlign: 'center',
            }}
          >
            A price isn’t a profit.
          </Box>
        </Section>

        <Section>
          <SectionTitle>
            What <Gold>{APP_NAME}</Gold> does
          </SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 3 }}>
            {FEATURES.map((f) => (
              <Box
                key={f.title}
                sx={{
                  backgroundColor: tokens.surface,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: `${tokens.radius}px`,
                  p: 2.5,
                }}
              >
                <Box sx={{ fontWeight: 600, fontSize: 17 }}>{f.title}</Box>
                <Box sx={{ color: tokens.text2, mt: 0.75, lineHeight: 1.55 }}>{f.text}</Box>
              </Box>
            ))}
          </Box>
        </Section>

        <Section>
          <Box sx={{ textAlign: 'center' }}>
            <SectionTitle>A look inside</SectionTitle>
          </Box>
          <Screenshots />
        </Section>

        <Section>
          <Box sx={{ textAlign: 'center' }}>
            <SectionTitle>How it works</SectionTitle>
          </Box>
          <Box
            component="ol"
            sx={{
              m: 0,
              mt: 3,
              p: 0,
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
              gap: 1.5,
            }}
          >
            {STEPS.map((step, i) => (
              <Box
                component="li"
                key={step}
                sx={{
                  backgroundColor: tokens.surface,
                  border: `1px solid ${i === STEPS.length - 1 ? tokens.gold : tokens.border}`,
                  borderRadius: `${tokens.radius}px`,
                  p: 2.5,
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    mx: 'auto',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    border: `1px solid ${tokens.gold}`,
                    color: tokens.gold,
                    fontFamily: fonts.mono,
                    fontSize: 15,
                  }}
                >
                  {i + 1}
                </Box>
                <Box sx={{ fontSize: 17, mt: 1.5 }}>{step}</Box>
              </Box>
            ))}
          </Box>
        </Section>

        <Section>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontFamily: fonts.serif, fontSize: { xs: 28, md: 38 }, lineHeight: 1.2 }}>
              Your collection has a number. Find out what it is.
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center', mt: 3.5 }}>
              {actions}
            </Box>
          </Box>
        </Section>

        <Box
          component="footer"
          sx={{
            borderTop: `1px solid ${tokens.border}`,
            mt: 8,
            pt: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            justifyContent: 'space-between',
            color: tokens.text3,
            fontSize: 13,
          }}
        >
          <span>
            {APP_NAME} · {TAGLINE}
          </span>
          <span>
            <Link component={RouterLink} to="/privacy" color="inherit">
              Privacy
            </Link>{' '}
            · © 2026
          </span>
        </Box>
      </Box>
    </Box>
  );
}

const ADVANCE_MS = 4500;

/**
 * A looping carousel of real screens: one large in the middle, its neighbors smaller beside it.
 * Arrows, swipes and drags move one screen; it advances on its own, waiting a beat after each
 * interaction, and the pause button (or hovering, or focus inside it) stops it.
 */
function Screenshots() {
  const n = SHOTS.length;
  // The previous position too, so a slide wrapping from one end to the other jumps instead of
  // sliding across behind the rest.
  const [{ current, previous }, setPosition] = useState({ current: 0, previous: 0 });
  const setCurrent = (next: (c: number) => number) =>
    setPosition((p) => ({ current: next(p.current), previous: p.current }));
  const [open, setOpen] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  // Bumped on every interaction, which restarts the timer, so it waits a full beat after a tap.
  const [nudge, setNudge] = useState(0);
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  // On a phone, the tap that closes the big view can land again on the carousel underneath.
  const closedAt = useRef(0);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isPhone = useMediaQuery('(max-width:599.95px)');
  const canHover = useMediaQuery('(hover: hover)');

  const move = (by: number) => {
    setCurrent((c) => (c + by + n) % n);
    setNudge((v) => v + 1);
  };

  useEffect(() => {
    if (reduceMotion || paused || hovered || focused || open != null) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') setCurrent((c) => (c + 1) % n);
    }, ADVANCE_MS);

    return () => clearInterval(id);
  }, [reduceMotion, paused, hovered, focused, open, nudge, n]);

  const playing = !reduceMotion && !paused && !hovered && !focused && open == null;
  const offsetOf = (i: number, from: number) => {
    const offset = (i - from + n) % n;

    return offset > n / 2 ? offset - n : offset;
  };
  const width = isPhone ? 240 : 290;
  const spacing = isPhone ? 200 : 260;

  return (
    <Box
      sx={{ mt: 3 }}
      // Phones fake a hover on tap that never ends, which would stop the timer for good.
      onMouseEnter={() => canHover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Only keyboard focus pauses it (a tap or click also focuses a button, which would stop it
      // for good), and only focus here, not in the big view, which renders elsewhere.
      onFocus={(e) =>
        e.currentTarget.contains(e.target) && e.target.matches(':focus-visible') && setFocused(true)
      }
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
    >
      <Box
        onPointerDown={(e) => (swipe.current = { x: e.clientX, moved: false })}
        onPointerMove={(e) => {
          if (swipe.current && Math.abs(e.clientX - swipe.current.x) > 8) swipe.current.moved = true;
        }}
        onPointerUp={(e) => {
          const s0 = swipe.current;
          if (s0 && Math.abs(e.clientX - s0.x) > 40) move(e.clientX < s0.x ? 1 : -1);
          // Cleared after the click that follows, so a swipe never also counts as a tap.
          setTimeout(() => (swipe.current = null));
        }}
        sx={{
          position: 'relative',
          height: (width * 1121) / 600 + 28,
          overflow: 'hidden',
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
      >
        {SHOTS.map((shot, i) => {
          // Where this screen sits relative to the middle one, wrapping around: -2 … 3.
          const offset = offsetOf(i, current);
          const wrapped = Math.abs(offset - offsetOf(i, previous)) > 2;
          const center = offset === 0;

          return (
            <Box
              key={shot.src}
              component="button"
              type="button"
              tabIndex={center ? 0 : -1}
              aria-label={center ? `See bigger: ${shot.caption}` : `Show: ${shot.caption}`}
              onClick={() => {
                if (swipe.current?.moved || performance.now() - closedAt.current < 500) return;
                if (center) setOpen(i);
                else move(offset);
              }}
              sx={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width,
                ml: `${-width / 2}px`,
                p: 0,
                pt: 1.5,
                borderRadius: '32px',
                border: `8px solid ${tokens.surface2}`,
                overflow: 'hidden',
                backgroundColor: '#0e0f11',
                boxShadow: center ? '0 18px 44px rgba(0,0,0,0.35)' : 'none',
                cursor: center ? 'zoom-in' : 'pointer',
                transform: `translateX(${offset * spacing}px) scale(${center ? 1 : 0.84})`,
                opacity: Math.abs(offset) > 1 ? 0.25 : center ? 1 : 0.55,
                zIndex: 3 - Math.abs(offset),
                transition: reduceMotion || wrapped ? 'none' : 'transform 0.45s ease, opacity 0.45s ease',
              }}
            >
              <Box
                component="img"
                src={`${import.meta.env.BASE_URL}${shot.src}`}
                alt={center ? shot.caption : ''}
                draggable={false}
                loading="lazy"
                sx={{ display: 'block', width: '100%', aspectRatio: '600 / 1121' }}
              />
            </Box>
          );
        })}
      </Box>
      {/* Announced only when someone moves it, not on every automatic turn. */}
      <Box
        aria-live={playing ? 'off' : 'polite'}
        sx={{ color: tokens.text2, fontSize: 16, textAlign: 'center', minHeight: 24 }}
      >
        {SHOTS[current]!.caption}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 1.5 }}>
        <IconButton aria-label="Previous screen" onClick={() => move(-1)}>
          <ChevronLeftRounded />
        </IconButton>
        {SHOTS.map((shot, i) => (
          <Box
            key={shot.src}
            component="button"
            type="button"
            aria-label={`Show screen ${i + 1}`}
            onClick={() => {
              setCurrent(() => i);
              setNudge((v) => v + 1);
            }}
            sx={{
              width: 8,
              height: 8,
              p: 0,
              border: 0,
              borderRadius: '50%',
              cursor: 'pointer',
              backgroundColor: i === current ? tokens.gold : tokens.border,
              transition: 'background-color 0.3s',
            }}
          />
        ))}
        <IconButton aria-label="Next screen" onClick={() => move(1)}>
          <ChevronRightRounded />
        </IconButton>
        {!reduceMotion && (
          <IconButton
            aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            onClick={() => setPaused(!paused)}
            sx={{ color: tokens.text3 }}
          >
            {paused ? <PlayArrowRounded fontSize="small" /> : <PauseRounded fontSize="small" />}
          </IconButton>
        )}
      </Box>
      <ScreenViewer
        index={open}
        // The carousel holds still while the big view is open (phones can freeze animations hidden
        // under it, leaving slides stuck mid-way) and moves to the last screen viewed on close.
        onChange={(i) => {
          if (i == null) {
            closedAt.current = performance.now();
            if (open != null) setCurrent(() => open);
          }
          setOpen(i);
          setNudge((v) => v + 1);
        }}
      />
    </Box>
  );
}

/** One screen large, with previous / next; a tap outside or Esc closes it. */
function ScreenViewer({ index, onChange }: { index: number | null; onChange: (i: number | null) => void }) {
  const shot = index == null ? null : SHOTS[index];
  const move = (by: number) => index != null && onChange((index + by + SHOTS.length) % SHOTS.length);

  return (
    <Modal
      open={!!shot}
      onClose={() => onChange(null)}
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.88)' } } }}
    >
      <Box
        onClick={() => onChange(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') move(-1);
          if (e.key === 'ArrowRight') move(1);
        }}
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          p: 2,
          pt: 'calc(env(safe-area-inset-top) + 16px)',
          pb: 'calc(env(safe-area-inset-bottom) + 16px)',
          outline: 'none',
        }}
      >
        {shot && (
          <>
            <Box
              component="img"
              src={`${import.meta.env.BASE_URL}${shot.src}`}
              alt={shot.caption}
              sx={{
                maxWidth: '100%',
                minHeight: 0,
                flex: '0 1 auto',
                borderRadius: '20px',
                objectFit: 'contain',
              }}
            />
            <Box
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#fff' }}
            >
              <IconButton aria-label="Previous screen" onClick={() => move(-1)} sx={{ color: '#fff' }}>
                <ChevronLeftRounded />
              </IconButton>
              <Box sx={{ fontSize: 15, textAlign: 'center' }}>{shot.caption}</Box>
              <IconButton aria-label="Next screen" onClick={() => move(1)} sx={{ color: '#fff' }}>
                <ChevronRightRounded />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}

function PhoneMockup() {
  return (
    <Box
      aria-hidden
      inert
      sx={{
        justifySelf: 'center',
        width: 320,
        maxWidth: '100%',
        height: { xs: 480, md: 560 },
        borderRadius: '40px',
        border: `10px solid ${tokens.surface2}`,
        backgroundColor: tokens.bg,
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      {/* Laid out at a phone's width, then shrunk to fit the frame, so the cards look like the app. */}
      <Box
        sx={{
          width: 400,
          transform: 'scale(0.75)',
          transformOrigin: 'top left',
          display: 'grid',
          gap: 1,
          p: 1.5,
          pt: 5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Wordmark />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: `1px solid ${tokens.border}`,
                display: 'grid',
                placeItems: 'center',
                color: tokens.text2,
              }}
            >
              <LightModeOutlined sx={{ fontSize: 18 }} />
            </Box>
            <Box
              component="img"
              src={art(610383)}
              alt=""
              referrerPolicy="no-referrer"
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: '50% 22%',
                border: `1px solid ${tokens.gold}`,
              }}
            />
          </Box>
        </Box>
        <SummaryTiles full={SAMPLE_TOTALS} valuePct={100} caption="5 items (4 entries)" />
        {SAMPLES.map((s) => (
          <ItemCard
            key={s.title}
            title={s.title}
            subtitle={s.subtitle}
            copyText={s.title}
            quantity={s.quantity ?? 1}
            numbers={s.numbers}
            valuePct={100}
            feesLabel={null}
            market={autoLine}
            autoValue
            image={s.image}
            liveToday
          />
        ))}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 90,
          background: `linear-gradient(transparent, ${tokens.bg})`,
        }}
      />
    </Box>
  );
}

function CompareList({
  title,
  items,
  mark,
  color,
  highlight = false,
}: {
  title: ReactNode;
  items: string[];
  mark: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <Box
      sx={{
        backgroundColor: tokens.surface,
        border: `1px solid ${highlight ? tokens.gold : tokens.border}`,
        borderRadius: `${tokens.radius}px`,
        p: 2.5,
      }}
    >
      <Box sx={{ fontWeight: 600, fontSize: 17, mb: 1.5 }}>{title}</Box>
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.25 }}>
        {items.map((item) => (
          <Box
            component="li"
            key={item}
            sx={{ display: 'flex', gap: 1.5, color: highlight ? tokens.text : tokens.text2, fontSize: 16 }}
          >
            <Box component="span" aria-hidden sx={{ color, fontWeight: 700 }}>
              {mark}
            </Box>
            {item}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

const Gold = ({ children }: { children: ReactNode }) => (
  <Box component="span" sx={{ color: tokens.gold }}>
    {children}
  </Box>
);

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: tokens.gold }}>
      {children}
    </Box>
  );
}

function Section({ children }: { children: ReactNode }) {
  return (
    <Box component="section" sx={{ borderTop: `1px solid ${tokens.border}`, py: { xs: 5, md: 8 } }}>
      {children}
    </Box>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Box
      component="h2"
      sx={{ fontFamily: fonts.serif, fontWeight: 400, fontSize: { xs: 26, md: 34 }, lineHeight: 1.2, m: 0 }}
    >
      {children}
    </Box>
  );
}
