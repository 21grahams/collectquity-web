import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../api';
import { theme } from '../../theme/theme';
import { OnboardingPage } from './OnboardingPage';

vi.mock('../../lib/supabase', () => ({ supabase: {} }));
vi.mock('../../api', () => ({ saveSections: vi.fn().mockResolvedValue(undefined) }));

function renderPage() {
  render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={new QueryClient()}>
        <OnboardingPage />
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

const next = () => fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

describe('OnboardingPage', () => {
  beforeEach(() => vi.mocked(api.saveSections).mockClear());

  it('offers Pokémon, with other collections coming later', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /pokémon/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /other collections/i })).toBeDisabled();
  });

  it('saves singles and sealed with one simple sealed list by default', async () => {
    renderPage();
    next();
    next();
    fireEvent.click(screen.getByRole('button', { name: /start collecting/i }));
    await waitFor(() =>
      expect(api.saveSections).toHaveBeenCalledWith({
        tracksSingles: true,
        tracksSealed: true,
        splitsSealed: false,
        usesAccounts: false,
      }),
    );
  });

  it('skips the sealed question for singles-only collectors', async () => {
    renderPage();
    next();
    fireEvent.click(screen.getByRole('button', { name: /^sealed/i }));
    fireEvent.click(screen.getByRole('button', { name: /start collecting/i }));
    await waitFor(() =>
      expect(api.saveSections).toHaveBeenCalledWith({
        tracksSingles: true,
        tracksSealed: false,
        splitsSealed: false,
        usesAccounts: false,
      }),
    );
  });

  it('needs at least one of singles or sealed', () => {
    renderPage();
    next();
    fireEvent.click(screen.getByRole('button', { name: /^singles/i }));
    fireEvent.click(screen.getByRole('button', { name: /^sealed/i }));
    fireEvent.click(screen.getByRole('button', { name: /start collecting/i }));
    expect(api.saveSections).not.toHaveBeenCalled();
  });
});
