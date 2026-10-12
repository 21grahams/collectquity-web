import { Box } from '@mui/material';

import { APP_NAME } from '../lib/brand';
import { fonts, tokens } from '../theme/tokens';

export function Wordmark() {
  return (
    <Box component="span" sx={{ fontFamily: fonts.serif, fontSize: 26, color: tokens.gold, lineHeight: 1 }}>
      {APP_NAME}
    </Box>
  );
}
