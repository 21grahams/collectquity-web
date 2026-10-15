import { createTheme } from '@mui/material/styles';

import { colors, colorVars, fonts, tokens } from './tokens';

// MUI needs real colors (not CSS variables) to work out hovers and contrast.
const palette = (mode: keyof typeof colors) => {
  const c = colors[mode];

  return {
    primary: { main: c.gold, contrastText: colors.dark.bg },
    success: { main: c.green },
    error: { main: c.red },
    info: { main: c.blue },
    background: { default: c.bg, paper: c.surface },
    text: { primary: c.text, secondary: c.text2, disabled: c.text3 },
    divider: c.border,
  };
};

export const theme = createTheme({
  // MUI marks the page with data-theme="light" or "dark" (following the phone unless chosen).
  cssVariables: { colorSchemeSelector: 'data-theme' },
  colorSchemes: { dark: { palette: palette('dark') }, light: { palette: palette('light') } },
  defaultColorScheme: 'dark',
  shape: { borderRadius: tokens.radius },
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.serif },
    h2: { fontFamily: fonts.serif },
    h3: { fontFamily: fonts.serif },
    h4: { fontFamily: fonts.serif },
    h5: { fontFamily: fonts.serif },
    h6: { fontFamily: fonts.serif },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root, [data-theme="dark"]': { ...colorVars('dark'), colorScheme: 'dark' },
        '[data-theme="light"]': { ...colorVars('light'), colorScheme: 'light' },
        body: { backgroundColor: tokens.bg, color: tokens.text },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none', border: `1px solid ${tokens.border}` } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: tokens.surface2 },
        notchedOutline: { borderColor: tokens.border },
        // iOS zooms the page when focusing an input under 16px.
        input: { fontSize: 16 },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: 16 } },
    },
  },
});
