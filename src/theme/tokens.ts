const darkColors = {
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
};

// Deeper gold, green, red and blue than dark mode so they stay readable on white.
const lightColors: typeof darkColors = {
  bg: '#F6F5F2',
  surface: '#FFFFFF',
  surface2: '#F0EEEA',
  border: '#E2DFD8',
  gold: '#BF7D14',
  goldDim: 'rgba(191,125,20,0.12)',
  green: '#178048',
  red: '#CF3B3B',
  blue: '#2E78C7',
  text: '#1A1B1E',
  text2: '#5E616A',
  text3: '#6B6E77',
};

export const colors = { dark: darkColors, light: lightColors };

type ColorName = keyof typeof darkColors;

/** Each color is a CSS variable, so the whole app switches with the light/dark mode. */
export const tokens = {
  ...(Object.fromEntries(Object.keys(darkColors).map((k) => [k, `var(--c-${k})`])) as Record<
    ColorName,
    string
  >),
  radius: 10,
};

/** The CSS variable declarations for one mode, e.g. { '--c-bg': '#0E0F11', … }. */
export const colorVars = (mode: keyof typeof colors) =>
  Object.fromEntries(Object.entries(colors[mode]).map(([k, v]) => [`--c-${k}`, v]));

/** Hover styles go under this, so a finger resting on something mid-scroll (iPhone) doesn't trigger them. */
export const canHover = '@media (hover: hover)';

export const fonts = {
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'DM Mono', ui-monospace, monospace", // numbers
  serif: "'DM Serif Display', Georgia, serif", // headings
} as const;
