import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import StyleOutlined from '@mui/icons-material/StyleOutlined';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';

import { useSections } from '../hooks/queries';
import { tokens } from '../theme/tokens';
import { visibleTabs } from './tabs';

const ICONS = {
  '/singles': <StyleOutlined />,
  '/sealed': <Inventory2Outlined />,
  '/summary': <InsightsOutlined />,
  '/accounts': <StorefrontOutlined />,
};

export const BOTTOM_TABS_HEIGHT = 58;

export function BottomTabs({ value, onChange }: { value: string | false; onChange: (path: string) => void }) {
  const tabs = visibleTabs(useSections());

  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={(_, path: string) => onChange(path)}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        height: `calc(${BOTTOM_TABS_HEIGHT}px + env(safe-area-inset-bottom))`,
        pb: 'env(safe-area-inset-bottom)',
        backgroundColor: tokens.bg,
        borderTop: `1px solid ${tokens.border}`,
        '& .MuiBottomNavigationAction-root': { color: tokens.text2, minWidth: 0 },
        '& .MuiBottomNavigationAction-root.Mui-selected': { color: tokens.gold },
        '& .MuiBottomNavigationAction-label, & .MuiBottomNavigationAction-label.Mui-selected': {
          fontSize: 12,
        },
      }}
    >
      {tabs.map((t) => (
        <BottomNavigationAction key={t.path} value={t.path} label={t.label} icon={ICONS[t.path]} />
      ))}
    </BottomNavigation>
  );
}
