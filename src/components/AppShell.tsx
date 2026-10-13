import { Box, Tab, Tabs, useMediaQuery } from '@mui/material';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useKeyboardOpen } from '../hooks/useKeyboardOpen';
import { tokens } from '../theme/tokens';
import { AvatarMenu } from './AvatarMenu';
import { BOTTOM_TABS_HEIGHT, BottomTabs } from './BottomTabs';
import { OfflineBanner } from './OfflineBanner';
import { PracticeBanner } from './PracticeBanner';
import { PullToRefresh } from './PullToRefresh';
import { ScrollTopButton } from './ScrollTopButton';
import { TABS } from './tabs';
import { Wordmark } from './Wordmark';

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = TABS.find((t) => pathname.startsWith(t.path))?.path ?? false;
  const isPhone = useMediaQuery('(max-width:599.95px)', { noSsr: true });
  // A bar pinned to the bottom rides up on the iPhone keyboard, so hide it while typing.
  const keyboardOpen = useKeyboardOpen();
  const showBottomTabs = isPhone && !keyboardOpen;

  // iOS can leave pinned bars (the bottom tabs) floating where the keyboard was, mostly on
  // short pages. Nudging the scroll by a pixel once the keyboard has closed resets them.
  const keyboardWasOpen = useRef(false);
  useEffect(() => {
    if (keyboardOpen) {
      keyboardWasOpen.current = true;

      return;
    }
    if (!keyboardWasOpen.current) return;
    keyboardWasOpen.current = false;
    const timer = setTimeout(() => {
      const y = window.scrollY;
      window.scrollTo(0, y + 1);
      window.scrollTo(0, y);
    }, 350);

    return () => clearTimeout(timer);
  }, [keyboardOpen]);

  // Tapping the tab you're already on scrolls back to the top, like most apps.
  const goTo = (path: string) => {
    if (path === current) window.scrollTo({ top: 0, behavior: 'smooth' });
    else navigate(path);
  };

  // Floating buttons, toasts and the page's bottom padding sit above the bottom tabs.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--bottom-inset',
      showBottomTabs
        ? `calc(${BOTTOM_TABS_HEIGHT}px + env(safe-area-inset-bottom))`
        : 'env(safe-area-inset-bottom)',
    );
  }, [showBottomTabs]);

  const scrollByTab = useRef<Record<string, number>>({});
  const tabRef = useRef(pathname);
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const onScroll = () => {
      scrollByTab.current[tabRef.current] = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useLayoutEffect(() => {
    if (tabRef.current === pathname) return;
    tabRef.current = pathname;
    window.scrollTo(0, scrollByTab.current[pathname] ?? 0);
  }, [pathname]);

  // The header is fixed rather than sticky: iOS Safari skips painting a sticky
  // header for a frame after the scroll jump when switching tabs. Its height
  // varies (notch, offline banner), so measure it for the spacer and the
  // pull-to-refresh pill, before the first paint to avoid a jump.
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    setHeaderHeight(el.offsetHeight);
    const observer = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    observer.observe(el);

    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  }, [headerHeight]);

  return (
    <Box sx={{ minHeight: 'calc(100dvh + 1px)' }}>
      <Box
        component="header"
        ref={headerRef}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: tokens.bg,
          borderBottom: `1px solid ${tokens.border}`,
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <PracticeBanner />
        <Box
          sx={{
            px: 2,
            pt: 1.5,
            pb: isPhone ? 1.25 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Wordmark />
          <AvatarMenu />
        </Box>
        {!isPhone && (
          <Tabs
            value={current}
            onChange={(_, path: string) => goTo(path)}
            variant="fullWidth"
            sx={{
              minHeight: 44,
              '& .MuiTab-root': { minHeight: 44, color: tokens.text2, fontSize: 15 },
              '& .MuiTab-root.Mui-selected': { color: tokens.gold },
            }}
          >
            {TABS.map((t) => (
              <Tab
                key={t.path}
                value={t.path}
                label={t.label}
                onClick={() => t.path === current && goTo(t.path)}
              />
            ))}
          </Tabs>
        )}
        <OfflineBanner />
      </Box>
      <Box sx={{ height: headerHeight }} />
      {/* The bottom padding lets the last card scroll clear of the floating + button. */}
      <Box component="main" sx={{ maxWidth: 900, mx: 'auto', p: 2, pb: 'calc(92px + var(--bottom-inset))' }}>
        <Outlet />
      </Box>
      <PullToRefresh top={headerHeight} />
      <ScrollTopButton />
      {showBottomTabs && <BottomTabs value={current} onChange={goTo} />}
    </Box>
  );
}
