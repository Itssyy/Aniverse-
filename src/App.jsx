import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import theme from './theme';
import Navbar from './components/Navbar';
import AnimePage from './pages/AnimePage';
import AnimeList from './pages/AnimeList';
import Home from './pages/Home';
import AppRoutes from './routes';

const App = () => {
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative'
        }}
      >
        <Navbar>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none',
            }}
          >
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                fontWeight: '400',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: theme.palette.primary.main,
                  transform: 'scaleX(0)',
                  transformOrigin: 'right',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                  transformOrigin: 'left',
                },
              }}
            >
              Главная
            </Typography>
          </Link>
          <Link 
            to="/list/current" 
            style={{ 
              textDecoration: 'none',
            }}
          >
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                fontWeight: '400',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: theme.palette.primary.main,
                  transform: 'scaleX(0)',
                  transformOrigin: 'right',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                  transformOrigin: 'left',
                },
              }}
            >
              Текущий сезон
            </Typography>
          </Link>
          <Link 
            to="/list/previous" 
            style={{ 
              textDecoration: 'none',
            }}
          >
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                fontWeight: '400',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: theme.palette.primary.main,
                  transform: 'scaleX(0)',
                  transformOrigin: 'right',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                  transformOrigin: 'left',
                },
              }}
            >
              Прошлый сезон
            </Typography>
          </Link>
          <Link 
            to="/list/top" 
            style={{ 
              textDecoration: 'none',
            }}
          >
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                fontWeight: '400',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: theme.palette.primary.main,
                  transform: 'scaleX(0)',
                  transformOrigin: 'right',
                  transition: 'transform 0.3s ease',
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                  transformOrigin: 'left',
                },
              }}
            >
              Топ аниме
            </Typography>
          </Link>
        </Navbar>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/anime/:id" element={<PageTransition><AnimePage /></PageTransition>} />
            <Route path="/list/:type" element={<PageTransition><AnimeList /></PageTransition>} />
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Box>
    </ThemeProvider>
  );
};

export default App;
