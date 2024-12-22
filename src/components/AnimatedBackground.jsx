import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

const float = keyframes`
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
`;

const backgroundShift = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(1deg);
  }
`;

const AnimatedBackground = () => {
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a192f 100%)',
          zIndex: -3,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(64, 224, 208, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(64, 224, 208, 0.05) 0%, transparent 50%),
            linear-gradient(60deg, rgba(64, 224, 208, 0.02) 0%, transparent 50%),
            linear-gradient(-60deg, rgba(64, 224, 208, 0.02) 0%, transparent 50%),
            repeating-linear-gradient(45deg, rgba(64, 224, 208, 0.01) 0%, rgba(64, 224, 208, 0.01) 1px, transparent 1px, transparent 10px)
          `,
          opacity: 0.7,
          animation: `${backgroundShift} 20s ease-in-out infinite`,
          zIndex: -2,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '200vw',
          height: '200vh',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle at center, transparent 0%, #0a192f 70%)',
          opacity: 0.8,
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: -1,
          opacity: 0.3,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: '#40E0D0',
              borderRadius: '50%',
              boxShadow: '0 0 10px #40E0D0, 0 0 20px #40E0D0',
              left: `${Math.random() * 100}%`,
              animation: `${float} 8s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </Box>
    </>
  );
};

export default AnimatedBackground;
