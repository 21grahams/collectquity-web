import { canHover, tokens } from '../theme/tokens';

export const greenButtonSx = {
  py: 1.5,
  fontSize: 15,
  backgroundColor: 'rgba(52,199,123,0.12)',
  color: tokens.green,
  border: '1px solid rgba(52,199,123,0.25)',
  boxShadow: 'none',
  [canHover]: {
    '&:hover:not(.Mui-disabled)': { backgroundColor: 'rgba(52,199,123,0.2)', boxShadow: 'none' },
  },
  '&.Mui-disabled': { borderColor: 'transparent' },
};
