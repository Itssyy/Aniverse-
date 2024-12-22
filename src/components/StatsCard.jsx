import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const StatsCard = ({ number, label }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={6}
      borderRadius="xl"
      bg="rgba(0, 0, 0, 0.3)"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: '0 0 20px rgba(255, 16, 240, 0.3)',
      }}
      transition="all 0.3s ease"
    >
      <VStack spacing={2}>
        <Text
          fontSize="3xl"
          fontWeight="bold"
          bgGradient="linear(to-r, neon.pink, neon.blue)"
          bgClip="text"
        >
          {number}
        </Text>
        <Text
          color="whiteAlpha.800"
          fontSize="sm"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {label}
        </Text>
      </VStack>
    </MotionBox>
  );
};

export default StatsCard;
