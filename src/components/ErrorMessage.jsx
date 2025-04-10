import { Box, Typography } from '@mui/material';

export const ErrorMessage = ({ message, errorCode }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#333', color: '#fff', flexDirection: 'column' }}>
      {errorCode === 429 ? (
        <Typography variant="h4" sx={{ mb: 2 }}>
          Too many requests. Please try again later.
        </Typography>
      ) : (
        <Typography variant="h4" sx={{ mb: 2 }}>
          Error: {message}
        </Typography>
      )}
    </Box>
  );
};
