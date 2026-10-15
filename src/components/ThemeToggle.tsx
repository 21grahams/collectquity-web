import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { tokens } from '../theme/tokens';

/** Sun or moon in the header: flips light/dark. Until it's tapped, the app follows the phone. */
export function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const canHover = useMediaQuery('(hover: hover)');
  const dark = (mode === 'system' ? systemMode : mode) !== 'light';
  const label = dark ? 'Use light theme' : 'Use dark theme';
  const button = (
    <IconButton
      aria-label={label}
      onClick={() => setMode(dark ? 'light' : 'dark')}
      sx={{
        width: 34,
        height: 34,
        color: tokens.text2,
        border: `1px solid ${tokens.border}`,
        '& svg': { fontSize: 18 },
      }}
    >
      {dark ? <LightModeOutlined /> : <DarkModeOutlined />}
    </IconButton>
  );

  return canHover ? <Tooltip title={label}>{button}</Tooltip> : button;
}
