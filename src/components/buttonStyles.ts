import { canHover, tokens } from '../theme/tokens';

/** The size of the buttons along the bottom of every sheet (Cancel, Save, Apply…). */
export const sheetButtonSx = { py: 1.5, fontSize: 15 } as const;

export const greenButtonSx = {
  ...sheetButtonSx,
  backgroundColor: 'rgba(52,199,123,0.12)',
  color: tokens.green,
  border: '1px solid rgba(52,199,123,0.25)',
  boxShadow: 'none',
  [canHover]: {
    '&:hover:not(.Mui-disabled)': { backgroundColor: 'rgba(52,199,123,0.2)', boxShadow: 'none' },
  },
  '&.Mui-disabled': { borderColor: 'transparent' },
};
