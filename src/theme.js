import { createTheme } from '@mui/material/styles';

const neonPink = '#FF10F0';
const neonBlue = '#00FFFF';
const neonPurple = '#7B2CBF';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: neonPink,
      light: '#FF69B4',
      dark: '#B4004F',
      contrastText: '#fff',
    },
    secondary: {
      main: neonBlue,
      light: '#7FFFD4',
      dark: '#008B8B',
      contrastText: '#000',
    },
    background: {
      default: '#0D0F14',
      paper: 'rgba(26, 29, 36, 0.8)',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Zen Tokyo Zoo", sans-serif',
    },
    h2: {
      fontFamily: '"Zen Tokyo Zoo", sans-serif',
    },
    h3: {
      fontFamily: '"Zen Tokyo Zoo", sans-serif',
    },
    h4: {
      fontFamily: '"Zen Tokyo Zoo", sans-serif',
    },
    h5: {
      fontFamily: '"Zen Tokyo Zoo", sans-serif',
    },
    h6: {
      fontFamily: '"Zen Tokyo Zoo", sans-serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
            border: "2px solid #2b2b2b",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#959595",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          position: 'relative',
          overflow: 'hidden',
          padding: '10px 20px',
          transition: 'all 0.3s ease-in-out',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, ${neonPink}, ${neonBlue})`,
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 0 10px ${neonPink}, 0 0 20px ${neonBlue}`,
            '&:before': {
              opacity: 0.2,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(26, 29, 36, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 0 20px ${neonPink}, 0 0 40px ${neonBlue}`,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(13, 15, 20, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `0 0 10px ${neonPink}, 0 0 20px ${neonBlue}`,
        },
      },
    },
  },
});

export default theme;
