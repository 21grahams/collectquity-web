import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import * as api from '../../api';
import { theme } from '../../theme/theme';
import { SectionsPage } from './SectionsPage';

vi.mock('../../lib/supabase', () => ({ supabase: {} }));
vi.mock('../../components/notifyContext', () => ({ useNotify: () => vi.fn() }));
vi.mock('../../api', () => ({
  getAccount: vi.fn().mockResolvedValue({
    approved: true,
    timeZone: 'America/Denver',
    onboarded: true,
    tracksSingles: true,
    tracksSealed: true,
    splitsSealed: true,
    usesAccounts: true,
  }),
  listSealed: vi.fn().mockResolvedValue([
    { id: 1, holdStatus: 'current' },
    { id: 2, holdStatus: 'long' },
  ]),
  saveSections: vi.fn().mockResolvedValue(undefined),
}));

async function renderPage() {
  const client = new QueryClient();
  await client.prefetchQuery({ queryKey: ['account'], queryFn: api.getAccount });
  render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <SectionsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('SectionsPage', () => {
  it('explains what happens to the current short hold when the split is turned off, then saves', async () => {
    await renderPage();
    fireEvent.click(screen.getByRole('button', { name: /one sealed list/i }));
    expect(await screen.findByText(/current short hold has 1 item/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() =>
      expect(api.saveSections).toHaveBeenCalledWith({
        tracksSingles: true,
        tracksSealed: true,
        splitsSealed: false,
        usesAccounts: true,
      }),
    );
  });

  it("won't save with neither singles nor sealed", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole('button', { name: /^singles/i }));
    fireEvent.click(screen.getByRole('button', { name: /^sealed/i }));
    expect(screen.getByText(/choose singles, sealed or both/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(api.saveSections).not.toHaveBeenCalled();
  });
});
