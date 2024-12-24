import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Rating,
} from '@mui/material';
import { PlayArrow, Star } from '@mui/icons-material';
import animeService from '../services/animeService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { motion } from 'framer-motion';

const AnimeDetails = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      if (!id) {
        setError('Invalid anime ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await animeService.getAnimeById(id);
        
        if (!data) {
          throw new Error('Anime not found');
        }

        // Проверяем обязательные поля
        if (!data.id || !data.title || !data.image) {
          throw new Error('Invalid anime data received');
        }

        // Проверяем типы данных
        if (
          typeof data.id !== 'number' ||
          typeof data.title !== 'string' ||
          typeof data.image !== 'string'
        ) {
          throw new Error('Invalid data types in anime details');
        }

        // Проверяем дополнительные поля
        const validatedData = {
          ...data,
          genres: Array.isArray(data.genres) ? data.genres : [],
          studios: Array.isArray(data.studios) ? data.studios : [],
          episodes: typeof data.episodes === 'number' ? data.episodes : null,
          score: typeof data.score === 'number' ? data.score : null,
          status: typeof data.status === 'string' ? data.status : null,
          synopsis: typeof data.synopsis === 'string' ? data.synopsis : null
        };

        setAnime(validatedData);
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError(err.message || 'Failed to load anime details');
        setAnime(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!anime) return <ErrorMessage message="Anime not found" />;

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={4}>
            {/* Изображение аниме */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  overflow: 'hidden',
                  borderRadius: '20px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Box
                  component="img"
                  src={anime.image}
                  alt={anime.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Paper>
            </Grid>

            {/* Информация об аниме */}
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 4,
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    mb: 2,
                    fontFamily: 'Russo One, sans-serif',
                    textShadow: '0 0 10px rgba(255,16,240,0.5)',
                  }}
                >
                  {anime.title}
                </Typography>

                {anime.score && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Star sx={{ color: '#FFD700', mr: 1 }} />
                    <Typography
                      variant="h5"
                      sx={{
                        color: '#FFD700',
                        fontWeight: 'bold',
                      }}
                    >
                      {anime.score}
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    mb: 3,
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                  }}
                >
                  {anime.synopsis}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {anime.genres?.map((genre) => (
                    <Grid item key={genre}>
                      <Chip
                        label={genre}
                        sx={{
                          background: 'rgba(255,16,240,0.2)',
                          color: '#fff',
                          borderRadius: '15px',
                          '&:hover': {
                            background: 'rgba(255,16,240,0.3)',
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={3}>
                  {anime.episodes && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: '#00FFFF', mb: 0.5 }}
                        >
                          Эпизоды
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#fff' }}>
                          {anime.episodes}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {anime.status && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: '#00FFFF', mb: 0.5 }}
                        >
                          Статус
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#fff' }}>
                          {anime.status}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {anime.season && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: '#00FFFF', mb: 0.5 }}
                        >
                          Сезон
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#fff' }}>
                          {`${anime.season} ${anime.year}`}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {anime.studios?.length > 0 && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: '#00FFFF', mb: 0.5 }}
                        >
                          Студия
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#fff' }}>
                          {anime.studios[0]}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
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
                    Смотреть
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AnimeDetails; 