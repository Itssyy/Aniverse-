import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

export const ErrorMessage = ({ message }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        textAlign: 'center',
        padding: 3,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: '#fff',
          mb: 2,
          textShadow: '0 0 10px rgba(255,16,240,0.5)',
        }}
      >
        {message || 'Произошла ошибка'}
      </Typography>
      <Button
        variant="contained"
        startIcon={<Refresh />}
        onClick={() => window.location.reload()}
        sx={{
          background: 'linear-gradient(45deg, #FF10F0, #00FFFF)',
          px: 4,
          py: 1.5,
          borderRadius: '50px',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF10F0, #00FFFF)',
            filter: 'brightness(1.2)',
          },
        }}
      >
        Обновить страницу
      </Button>
    </Box>
  );
};
