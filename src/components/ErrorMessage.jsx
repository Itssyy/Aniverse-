import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export const ErrorMessage = ({ message }) => {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Typography variant="h5" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Container>
  );
};
