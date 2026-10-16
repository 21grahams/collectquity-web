import { Box } from '@mui/material';

import { tokens } from '../theme/tokens';

const CHOICES = Array.from({ length: 20 }, (_, i) => 100 - i * 5);

/** Shows market values at a chosen percentage (100% = real market value); gold when below 100%. */
export function PercentPicker({ value, onChange }: { value: number; onChange: (pct: number) => void }) {
  const whatIf = value < 100;

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
      <Box
        component="select"
        aria-label="Show market value at"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(Number(e.target.value))}
        sx={{
          backgroundColor: tokens.surface2,
          border: `1px solid ${whatIf ? tokens.gold : tokens.border}`,
          color: whatIf ? tokens.gold : tokens.text,
          borderRadius: '10px',
          px: 1.25,
          pr: whatIf ? 3.75 : 1.25,
          py: 1.25,
          fontSize: 14,
          fontFamily: 'inherit',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none',
          textAlign: 'center',
          textAlignLast: 'center',
          outline: 'none',
          '&:focus-visible': { borderColor: tokens.gold },
        }}
      >
        {CHOICES.map((pct) => (
          <option key={pct} value={pct}>
            {pct}%
          </option>
        ))}
      </Box>
      {whatIf && (
        <Box
          component="button"
          type="button"
          aria-label="Back to 100%"
          onClick={() => onChange(100)}
          sx={{
            position: 'absolute',
            right: 2,
            top: 0,
            bottom: 0,
            width: 28,
            background: 'none',
            border: 'none',
            color: tokens.gold,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          ✕
        </Box>
      )}
    </Box>
  );
}
