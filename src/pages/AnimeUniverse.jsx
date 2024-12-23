import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  useTheme,
  Card,
  CardContent,
  CardMedia,
  Badge,
} from '@mui/material';
import {
  QuizOutlined,
  PhotoCamera,
  Brush,
  EmojiEvents,
  ArrowForward,
  Star,
  Whatshot,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, color, to, image }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card
        component={Link}
        to={to}
        sx={{
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          position: 'relative',
          border: `1px solid ${color}20`,
          '&:hover': {
            border: `1px solid ${color}`,
            boxShadow: `0 0 30px ${color}40`,
            '& .card-overlay': {
              opacity: 0.7,
            },
          },
        }}
      >
        <Box
          className="card-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, ${color}40, transparent)`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        />
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
          sx={{
            objectFit: 'cover',
          }}
        />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Icon sx={{ color: color, fontSize: '2rem', mr: 1 }} />
            <Typography variant="h5" component="div" sx={{ color: '#fff', fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
            {description}
          </Typography>
          <Button
            endIcon={<ArrowForward />}
            sx={{
              color: color,
              borderColor: color,
              '&:hover': {
                borderColor: color,
                background: `${color}20`,
              },
            }}
            variant="outlined"
          >
            Открыть
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => {
  return (
    <Paper
      sx={{
        p: 3,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          border: `1px solid ${color}`,
          boxShadow: `0 5px 20px ${color}40`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ color: color, fontSize: '2.5rem', mr: 1 }} />
        <Typography variant="h4" component="div" sx={{ color: color, fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
        {label}
      </Typography>
    </Paper>
  );
};

const AnimeUniverse = () => {
  const theme = useTheme();

  const features = [
    {
      icon: QuizOutlined,
      title: 'Аниме Квизы',
      description: 'Проверь свои знания в мире аниме! Участвуй в виктори��ах, зарабатывай очки и соревнуйся с другими фанатами.',
      color: '#FF10F0',
      to: '/quizzes',
      image: 'https://wallpaperaccess.com/full/5125409.jpg',
    },
    {
      icon: PhotoCamera,
      title: 'Косплей Галерея',
      description: 'Делись своими косплей-образами, участвуй в конкурсах и находи единомышленников в мире косплея.',
      color: '#00FFFF',
      to: '/cosplay',
      image: 'https://wallpaperaccess.com/full/5125414.jpg',
    },
    {
      icon: Brush,
      title: 'Арт Студия',
      description: 'Создавай и делись своими артами, учись рисовать в аниме стиле, участвуй в художественных челленджах.',
      color: '#FFD700',
      to: '/art-studio',
      image: 'https://wallpaperaccess.com/full/5125417.jpg',
    },
  ];

  const stats = [
    {
      icon: EmojiEvents,
      value: '1,234',
      label: 'Активных участников',
      color: '#FF10F0',
    },
    {
      icon: Star,
      value: '45,678',
      label: 'Пройдено квизов',
      color: '#00FFFF',
    },
    {
      icon: Whatshot,
      value: '89,012',
      label: 'Загружено работ',
      color: '#FFD700',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                mb: 2,
                fontFamily: 'Russo One, sans-serif',
                textShadow: '0 0 10px rgba(255,16,240,0.5), 0 0 20px rgba(0,255,255,0.3)',
              }}
            >
              Anime Universe
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                maxWidth: '800px',
                mx: 'auto',
                mb: 4,
              }}
            >
              Погрузись в интерактивный мир аниме: участвуй в квизах, дели��ь косплеем и создавай арты!
            </Typography>
          </motion.div>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AnimeUniverse; 