import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 100%)',
      }}
    >
      <CircularProgress
        sx={{
          color: '#FF10F0',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
        size={60}
        thickness={4}
      />
    </Box>
  );
};
