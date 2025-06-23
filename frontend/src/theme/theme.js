import { createTheme } from '@mui/material/styles';

// Modern Dark Batman-Inspired Theme for FusionMeet
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00D4FF', // Bright cyan - Batman tech blue
      light: '#33DDFF',
      dark: '#0099CC',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FFD700', // Gold accent - Batman yellow
      light: '#FFED4A',
      dark: '#E6C200',
      contrastText: '#000000',
    },
    success: {
      main: '#00FF88', // Bright green
      light: '#33FFAA',
      dark: '#00CC66',
    },
    warning: {
      main: '#FF8C00', // Dark orange
      light: '#FFA533',
      dark: '#CC7000',
    },
    error: {
      main: '#FF4444', // Bright red
      light: '#FF6666',
      dark: '#CC3333',
    },
    background: {
      default: '#0A0A0A', // Deep black
      paper: '#1A1A1A', // Dark gray
      surface: '#2A2A2A', // Medium gray
    },
    text: {
      primary: '#FFFFFF', // Pure white
      secondary: '#B0B0B0', // Light gray
      disabled: '#666666',
    },
    divider: '#333333',
    // Custom colors for Batman theme
    batman: {
      darkest: '#000000',
      dark: '#0A0A0A',
      medium: '#1A1A1A',
      light: '#2A2A2A',
      accent: '#00D4FF',
      gold: '#FFD700',
      glow: 'rgba(0, 212, 255, 0.3)',
      goldGlow: 'rgba(255, 215, 0, 0.3)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 212, 255, 0.1)',
    '0px 4px 8px rgba(0, 212, 255, 0.15)',
    '0px 8px 16px rgba(0, 212, 255, 0.2)',
    '0px 12px 24px rgba(0, 212, 255, 0.25)',
    '0px 16px 32px rgba(0, 212, 255, 0.3)',
    // Add more custom shadows as needed
    ...Array(19).fill('0px 16px 32px rgba(0, 212, 255, 0.3)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 25px rgba(0, 212, 255, 0.4)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
          boxShadow: '0px 4px 15px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #33DDFF 0%, #00D4FF 100%)',
            boxShadow: '0px 8px 25px rgba(0, 212, 255, 0.5)',
          },
        },
        outlined: {
          borderColor: '#00D4FF',
          color: '#00D4FF',
          borderWidth: 2,
          '&:hover': {
            borderColor: '#33DDFF',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(145deg, #1A1A1A 0%, #2A2A2A 100%)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 16px 48px rgba(0, 212, 255, 0.2)',
            border: '1px solid rgba(0, 212, 255, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.3)',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00D4FF',
              boxShadow: '0px 0px 20px rgba(0, 212, 255, 0.3)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        },
      },
    },
  },
});

export default theme;
