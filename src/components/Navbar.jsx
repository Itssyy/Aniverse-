import React from 'react';
import { AppBar, Toolbar, Box, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = ({ children }) => {
  const theme = useTheme();

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'rgba(17, 25, 40, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing(1, 3),
        }}
      >
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              fontFamily: '"Zen Tokyo Zoo", sans-serif',
              background: 'linear-gradient(45deg, #FF1493, #00FFFF)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 3s ease infinite',
              display: 'inline-block',
              letterSpacing: '2px',
              position: 'relative',
              padding: '0 5px',
              '@keyframes gradient': {
                '0%': {
                  backgroundPosition: '0% center',
                  textShadow: '0 0 10px #FF1493',
                },
                '50%': {
                  backgroundPosition: '100% center',
                  textShadow: '0 0 20px #00FFFF',
                },
                '100%': {
                  backgroundPosition: '0% center',
                  textShadow: '0 0 10px #FF1493',
                },
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '100%',
                width: '100%',
                left: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #FF1493, #00FFFF, transparent)',
                transform: 'scaleX(0)',
                transition: 'transform 0.3s ease',
              },
              '&:hover': {
                '&::before': {
                  transform: 'scaleX(1)',
                },
              },
            }}
          >
            ANIVERSE
          </Box>
        </Link>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {children}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
