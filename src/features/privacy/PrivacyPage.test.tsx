import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { theme } from '../../theme/theme';
import { PrivacyPage } from './PrivacyPage';

describe('PrivacyPage', () => {
  it('states the age limit and how to reach us', () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <PrivacyPage />
        </MemoryRouter>
      </ThemeProvider>,
    );
    expect(screen.getByText(/18 and older/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'privacy@collectquity.com' })).toHaveAttribute(
      'href',
      'mailto:privacy@collectquity.com',
    );
  });
});
