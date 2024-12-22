import React from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

const RatingDisplay = ({ score, maxScore = 10, showNumber = true }) => {
  if (!score) return null;

  // Преобразуем оценку из 10-балльной в 5-звездочную систему
  const normalizedScore = (score / maxScore) * 5;
  const fullStars = Math.floor(normalizedScore);
  const hasHalfStar = normalizedScore % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '20px',
        padding: '4px 12px',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mr: showNumber ? 1 : 0 }}>
        {[...Array(fullStars)].map((_, index) => (
          <StarIcon
            key={`full-${index}`}
            sx={{
              color: '#FFD700',
              fontSize: '1rem',
              filter: 'drop-shadow(0 0 2px rgba(255,215,0,0.5))',
            }}
          />
        ))}
        {hasHalfStar && (
          <StarHalfIcon
            sx={{
              color: '#FFD700',
              fontSize: '1rem',
              filter: 'drop-shadow(0 0 2px rgba(255,215,0,0.5))',
            }}
          />
        )}
        {[...Array(emptyStars)].map((_, index) => (
          <StarOutlineIcon
            key={`empty-${index}`}
            sx={{
              color: 'rgba(255,215,0,0.3)',
              fontSize: '1rem',
            }}
          />
        ))}
      </Box>
      {showNumber && (
        <Typography
          variant="body2"
          sx={{
            color: '#FFD700',
            fontWeight: 'bold',
            textShadow: '0 0 4px rgba(255,215,0,0.5)',
          }}
        >
          {score.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export default RatingDisplay;
