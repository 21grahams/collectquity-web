export const RAW_CONDITIONS = ['NM', 'LP', 'MP', 'HP', 'DMG'] as const;
export const GRADERS = ['PSA', 'BGS', 'CGC', 'SGC', 'TAG'] as const;
export const GRADES = Array.from({ length: 19 }, (_, i) => String(10 - i * 0.5));

export type RawCondition = (typeof RAW_CONDITIONS)[number];

/** What each raw condition means, for people who don't know the shorthand (TCGplayer's scale). */
export const RAW_CONDITION_INFO: Record<RawCondition, { name: string; meaning: string }> = {
  NM: { name: 'Near Mint', meaning: 'Looks fresh from the pack, with tiny wear at most.' },
  LP: { name: 'Lightly Played', meaning: 'Slight wear on the edges or corners, or light scratches.' },
  MP: { name: 'Moderately Played', meaning: 'Clear wear: whitened edges, scuffs or a small crease.' },
  HP: { name: 'Heavily Played', meaning: 'Heavy wear: creases, bends or lots of whitening.' },
  DMG: { name: 'Damaged', meaning: 'Tears, water damage, writing or a major bend.' },
};
export type Grader = (typeof GRADERS)[number];

export type Condition =
  { kind: 'raw'; code: RawCondition } | { kind: 'graded'; grader: Grader; grade: string };

/** "NM" or "PSA 10" → structured; anything else (free text from the old app) → null. */
export function parseCondition(text: string): Condition | null {
  const t = text.trim().toUpperCase();
  const raw = RAW_CONDITIONS.find((c) => c === t);
  if (raw) return { kind: 'raw', code: raw };
  const [grader, grade, ...rest] = t.split(/\s+/);
  const g = GRADERS.find((x) => x === grader);
  if (g && grade && !rest.length && GRADES.includes(grade)) return { kind: 'graded', grader: g, grade };

  return null;
}

export const formatCondition = (c: Condition) => (c.kind === 'raw' ? c.code : `${c.grader} ${c.grade}`);

export const isValidCondition = (text: string) => parseCondition(text) !== null;
