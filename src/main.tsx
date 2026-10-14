import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import '@fontsource/dm-sans/300.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-serif-display/400.css';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { registerSW } from 'virtual:pwa-register';

import { App } from './App';
import { NotifyProvider } from './components/NotifyProvider';
import { AuthProvider } from './features/auth/AuthProvider';
import { persistOptions, queryClient } from './lib/queryClient';
import { theme } from './theme/theme';

// A home-screen app is resumed rather than reloaded, so it checks for a new version each time it
// comes to the front. A downloaded update only takes over at launch, or on returning after a
// while with no sheet or dialog open, so a quick app switch never wipes something half-typed.
const launchedAt = Date.now();
const AWAY_LONG_ENOUGH = 5 * 60 * 1000;
let updateReady = false;
let hiddenAt = 0;
const nothingOpen = () => !document.querySelector('.MuiModal-root');

const applyUpdate = registerSW({
  immediate: true,
  onNeedRefresh: () => {
    updateReady = true;
    if (Date.now() - launchedAt < 10_000 && nothingOpen()) void applyUpdate(true);
  },
  onRegisteredSW: (_url, registration) => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();

        return;
      }
      const wasAwayLong = hiddenAt > 0 && Date.now() - hiddenAt >= AWAY_LONG_ENOUGH;
      if (updateReady && wasAwayLong && nothingOpen()) void applyUpdate(true);
      else void registration?.update();
    });
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        {/* HashRouter (#/singles) so GitHub Pages needs no server rewrites. */}
        <HashRouter>
          <AuthProvider>
            <NotifyProvider>
              <App />
            </NotifyProvider>
          </AuthProvider>
        </HashRouter>
      </PersistQueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
