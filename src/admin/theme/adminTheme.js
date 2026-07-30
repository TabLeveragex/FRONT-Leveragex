import { createTheme } from '@mui/material/styles';

const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#041016',
    },
    secondary: {
      main: '#06b6d4',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#38bdf8',
    },
    background: {
      default: '#070b12',
      paper: 'rgba(18, 27, 42, 0.92)',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#070b12',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#94a3b8',
          backgroundColor: 'rgba(15, 22, 35, 0.95)',
        },
      },
    },
  },
});

export default adminTheme;
