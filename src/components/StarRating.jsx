import React from 'react';
import { Box, Rating } from '@mui/material';

export const StarRating = ({ value, readOnly = false, size = 'medium' }) => {
  return (
    <Box>
      <Rating
        value={value}
        readOnly={readOnly}
        precision={0.5}
        size={size}
      />
    </Box>
  );
};
