import type { Grader } from '../../lib/condition';

import { Box } from '@mui/material';
import { useState } from 'react';

import { Segmented } from '../../components/form';
import { GRADERS, GRADES, parseCondition, RAW_CONDITION_INFO, RAW_CONDITIONS } from '../../lib/condition';
import { fonts, tokens } from '../../theme/tokens';

const selectSx = {
  width: '100%',
  backgroundColor: tokens.surface2,
  border: `1px solid ${tokens.border}`,
  borderRadius: '8px',
  padding: '11px 13px',
  color: tokens.text,
  fontFamily: 'inherit',
  fontSize: 16,
  outline: 'none',
  WebkitAppearance: 'none' as const,
};

/** Emits "NM" / "PSA 10", or "" until a complete choice is made. */
export function ConditionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const initial = parseCondition(value);
  const [kind, setKind] = useState<'raw' | 'graded'>(initial?.kind ?? 'raw');
  const [grader, setGrader] = useState<Grader | ''>(initial?.kind === 'graded' ? initial.grader : '');
  const [grade, setGrade] = useState(initial?.kind === 'graded' ? initial.grade : '');
  const [rawChoice, setRawChoice] = useState(initial?.kind === 'raw' ? initial.code : '');

  const picked = parseCondition(value);
  const rawInfo = kind === 'raw' && picked?.kind === 'raw' ? RAW_CONDITION_INFO[picked.code] : undefined;

  const emitGraded = (g: Grader | '', n: string) => onChange(g && n ? `${g} ${n}` : '');

  return (
    <Box>
      <Segmented
        value={kind}
        onChange={(k) => {
          setKind(k);
          // Each side keeps its last choice, so switching back restores it.
          if (k === 'raw') onChange(rawChoice);
          else emitGraded(grader, grade);
        }}
        options={[
          { value: 'raw', label: 'Raw' },
          { value: 'graded', label: 'Graded' },
        ]}
      />
      <Box sx={{ mt: 1 }}>
        {kind === 'raw' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.75 }}>
            {RAW_CONDITIONS.map((code) => {
              const selected = value === code;

              return (
                <Box
                  key={code}
                  component="button"
                  type="button"
                  aria-pressed={selected}
                  title={RAW_CONDITION_INFO[code].name}
                  onClick={() => {
                    setRawChoice(code);
                    onChange(code);
                  }}
                  sx={{
                    py: 1.25,
                    borderRadius: '8px',
                    fontFamily: fonts.mono,
                    fontSize: 14,
                    cursor: 'pointer',
                    backgroundColor: selected ? tokens.goldDim : tokens.surface2,
                    border: `1px solid ${selected ? tokens.gold : tokens.border}`,
                    color: selected ? tokens.gold : tokens.text,
                  }}
                >
                  {code}
                </Box>
              );
            })}
            <Box
              aria-live="polite"
              sx={{ gridColumn: '1 / -1', fontSize: 13, color: tokens.text3, mt: 0.25 }}
            >
              {rawInfo ? (
                <>
                  <Box component="span" sx={{ color: tokens.text2 }}>
                    {rawInfo.name}:
                  </Box>{' '}
                  {rawInfo.meaning}
                </>
              ) : (
                'Best to worst: Near Mint to Damaged. Tap one to see what it means.'
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <select
              aria-label="Grading company"
              style={selectSx}
              value={grader}
              onChange={(e) => {
                const g = e.target.value as Grader | '';
                setGrader(g);
                emitGraded(g, grade);
              }}
            >
              <option value="">Company</option>
              {GRADERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              aria-label="Grade"
              style={selectSx}
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                emitGraded(grader, e.target.value);
              }}
            >
              <option value="">Grade</option>
              {GRADES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Box>
        )}
      </Box>
    </Box>
  );
}
