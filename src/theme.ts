import { createTheme, Theme } from '@mui/material';

declare module '@mui/material/styles/createPalette' {
  interface SimplePaletteColorOptions {
    opaque?: string;
  }

  interface PaletteColor {
    opaque: string;
  }

  interface PaletteOptions {
    lend?: PaletteColorOptions;
    borrow?: PaletteColorOptions;
    backstop?: PaletteColorOptions;
    menu?: PaletteColorOptions;
  }

  interface Palette {
    lend: PaletteColor;
    borrow: PaletteColor;
    backstop: PaletteColor;
    menu: PaletteColorOptions;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    lend: true;
    borrow: true;
    backstop: true;
    menu: false;
  }
}

const FONT: string = '"DM Sans", Roboto';

const pxToRem = (px: number) => {
  const remVal = px / 16;
  return `${remVal.toFixed(3)}rem`;
};

const theme: Theme = createTheme({
  palette: {
    mode: 'dark',
    tonalOffset: 0,
    background: {
      default: '#191B1F',
      paper: '#212429E5',
    },
    primary: {
      main: '#36B04A',
      opaque: '#36B04A26',
      contrastText: 'white',
    },
    secondary: {
      main: '#ff3366',
      opaque: '#ff336626',
    },
    lend: {
      main: '#00C4EF',
      opaque: '#00C4EF26',
    },
    borrow: {
      main: '#FF8A00',
      opaque: '#FF8A0026',
    },
    backstop: {
      main: '#E16BFF',
      opaque: '#E16BFF26',
    },
    menu: {
      main: '#2E3138',
      light: '#565A6840',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#979797',
    },
  },
  typography: {
    fontFamily: FONT,
    h1: {
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: pxToRem(20),
      lineHeight: 1.6,
    },
    h2: {
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: pxToRem(18),
      lineHeight: 1.473,
    },
    h3: {
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: pxToRem(18),
      lineHeight: 1.473,
    },
    h4: {
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: pxToRem(16),
      lineHeight: 1.3125,
    },
    h5: undefined,
    h6: undefined,
    subtitle1: undefined,
    subtitle2: undefined,
    body1: {
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: pxToRem(16),
      lineHeight: 1.3125,
    },
    body2: {
      fontFamily: FONT,
      fontWeight: 400,
      fontSize: pxToRem(14),
      lineHeight: 1.125,
    },
    button: {
      textTransform: 'none',
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: pxToRem(16),
      lineHeight: 1.3125,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 420, // marker for the mobile layout requirement
      md: 640,
      lg: 850, // marker for compact layout requirements
      xl: 1024,
    },
  },
});

export default theme;
