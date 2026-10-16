import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { theme } from '../theme/theme';
import { SummaryTiles } from './SummaryTiles';

describe('SummaryTiles', () => {
  it('applies a what-if percentage once to the total, like Summary', () => {
    // 5% of $2,515.11 is $125.7555 → $125.76 (rounding each item first can drift a few cents).
    const full = {
      units: 20,
      totalCost: 2358.83,
      totalValue: 2515.11,
      gain: 156.28,
      gainPct: 6.6,
      value80: 0,
    };
    render(
      <ThemeProvider theme={theme}>
        <SummaryTiles full={full} valuePct={5} caption="20 items" />
      </ThemeProvider>,
    );
    expect(screen.getByText('$125.76')).toBeInTheDocument();
    expect(screen.getByText('Market @ 5%')).toBeInTheDocument();
  });

  it("isn't thrown a cent off by float dust in the summed total", () => {
    const totalValue = 0.21 + 0.7; // 0.9099999999999999 in floating point; Summary has exactly 0.91
    const full = { units: 2, totalCost: 1, totalValue, gain: 0, gainPct: 0, value80: 0 };
    render(
      <ThemeProvider theme={theme}>
        <SummaryTiles full={full} valuePct={50} caption="2 items" />
      </ThemeProvider>,
    );
    expect(screen.getByText('$0.46')).toBeInTheDocument();
  });
});
