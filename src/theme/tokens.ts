export const tokens = {
  bg: '#0E0F11',
  surface: '#16181C',
  surface2: '#1E2128',
  border: '#2A2D35',
  gold: '#E8A838',
  goldDim: 'rgba(232,168,56,0.12)',
  green: '#34C77B',
  red: '#E85555',
  blue: '#4A9EE8',
  text: '#F0EDE8',
  text2: '#8A8D96',
  text3: '#4A4D55',
  radius: 10,
} as const;

/** Hover styles go under this, so a finger resting on something mid-scroll (iPhone) doesn't trigger them. */
export const canHover = '@media (hover: hover)';

export const fonts = {
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'DM Mono', ui-monospace, monospace", // numbers
  serif: "'DM Serif Display', Georgia, serif", // headings
} as const;
