import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Rating,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { API_ENDPOINTS } from '../config/api.config';
import EpisodePlayer from '../components/EpisodePlayer';
import anilibriaService from '../services/anilibriaService';
import translationService from '../services/translationService';
import { Star as StarIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { translateGenres, formatSeasonYear, translateStatus } from '../utils/translations';

const AnimePage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translatedSynopsis, setTranslatedSynopsis] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем данные об аниме с Jikan API
        const jikanResponse = await axios.get(`${API_ENDPOINTS.JIKAN_API}/anime/${id}/full`);
        console.log('Jikan API response:', jikanResponse.data);

        if (!jikanResponse.data?.data) {
          throw new Error('Failed to load anime data from Jikan API');
        }

        const animeData = jikanResponse.data.data;
        setAnime(animeData);

        // Переводим описание
        if (animeData.synopsis) {
          try {
            console.log('Translating synopsis...');
            const translated = await translationService.translateText(animeData.synopsis);
            console.log('Translation completed:', translated);
            setTranslatedSynopsis(translated);
          } catch (translationError) {
            console.error('Translation error:', translationError);
            setTranslatedSynopsis('');
          }
        }

        // Пытаемся найти аниме на AniLibria
        try {
          // Пробуем разные варианты названий
          const titleVariants = [
            animeData.title_russian,
            animeData.title,
            ...(animeData.titles?.map(t => t.title) || [])
          ].filter(Boolean);

          console.log('Trying titles:', titleVariants);

          let anilibriaData = null;
          for (const title of titleVariants) {
            console.log('Searching with title:', title);
            const result = await anilibriaService.searchAnime(title);
            if (result) {
              anilibriaData = result;
              break;
            }
          }

          if (anilibriaData) {
            console.log('AniLibria data:', anilibriaData);
            
            const animeData = anilibriaData[0];
            if (animeData?.player?.list) {
              const formattedEpisodes = Object.entries(animeData.player.list)
                .map(([episodeNum, episodeData]) => ({
                  episode: parseInt(episodeNum),
                  hls: {
                    fhd: episodeData?.hls?.fhd || episodeData?.hls?.fullhd,
                    hd: episodeData?.hls?.hd,
                    sd: episodeData?.hls?.sd
                  }
                }))
                .sort((a, b) => a.episode - b.episode);

              console.log('Formatted episodes:', formattedEpisodes);
              setEpisodes(formattedEpisodes);
            } else {
              console.log('No episodes data found in response');
              setEpisodes([]);
            }
          } else {
            console.log('No matching anime found on AniLibria');
            setEpisodes([]);
          }
        } catch (anilibriaError) {
          console.warn('Failed to load AniLibria data:', anilibriaError);
          setEpisodes([]);
        }
      } catch (error) {
        console.error('Error loading anime:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a192f 100%)',
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a192f 100%)',
        }}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!anime) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a192f 100%)',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Аниме не найдено
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a192f 100%)',
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Основная информация */}
        <Paper
          elevation={24}
          sx={{
            p: 4,
            mb: 4,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Grid container spacing={4}>
            {/* Постер */}
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                alt={anime.title}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              />
            </Grid>

            {/* Информация */}
            <Grid item xs={12} md={8}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  mb: 2,
                }}
              >
                {anime.title_russian || anime.title}
              </Typography>

              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: alpha(theme.palette.text.primary, 0.7),
                  mb: 3,
                }}
              >
                {anime.title_japanese}
              </Typography>

              {/* Рейтинг и статистика */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  value={anime.score / 2}
                  precision={0.5}
                  readOnly
                  icon={<StarIcon fontSize="inherit" color="primary" />}
                  emptyIcon={<StarIcon fontSize="inherit" />}
                />
                <Typography variant="body1" color="text.secondary">
                  {anime.score} ({anime.scored_by?.toLocaleString()} голосов)
                </Typography>
              </Box>

              {/* Жанры */}
              <Box sx={{ mb: 3 }}>
                {translateGenres(anime.genres?.map(genre => genre.name) || []).map((genre, index) => (
                  <Chip
                    key={index}
                    label={genre}
                    sx={{
                      m: 0.5,
                      background: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.primary.main,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                    variant="outlined"
                  />
                ))}
              </Box>

              {/* Информация о выпуске */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        background: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <ScheduleIcon color="primary" />
                      <Typography variant="body2">
                        {formatSeasonYear(anime.season, anime.year)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        background: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Typography variant="body2">
                        {anime.episodes} эпизодов
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        background: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Typography variant="body2">
                        Рейтинг #{anime.rank}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        background: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Typography variant="body2">
                        Популярность #{anime.popularity}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Описание */}
              <Typography
                variant="body1"
                paragraph
                sx={{
                  color: theme.palette.text.primary,
                  lineHeight: 1.8,
                  textAlign: 'justify',
                  background: alpha(theme.palette.background.paper, 0.5),
                  p: 2,
                  borderRadius: 1,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                }}
              >
                {translatedSynopsis || anime.synopsis}
              </Typography>

              {/* Студия */}
              {anime.studios?.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    color: theme.palette.text.secondary,
                  }}
                >
                  <strong>Студия:</strong> {anime.studios.map(studio => studio.name).join(', ')}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Плеер с эпизодами */}
        {episodes.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 3,
              }}
            >
              Смотреть онлайн
            </Typography>
            <EpisodePlayer episodes={episodes} />
          </Box>
        ) : (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              К сожалению, эпизоды не найдены на AniLibria
            </Typography>
          </Paper>
        )}

        {/* Рекомендации */}
        {recommendations.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: 'primary.main', 
              fontWeight: 'bold',
              textShadow: '0 0 10px #00f3ff',
              fontFamily: "Russo One, sans-serif",
              mb: 2 
            }}>
              Похожие аниме
            </Typography>
            <Grid container spacing={3}>
              {recommendations.map((rec) => (
                <Grid item xs={12} sm={6} md={4} key={rec.entry.mal_id}>
                  <Paper
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'rgba(17, 25, 40, 0.75)',
                      backdropFilter: 'blur(16px) saturate(180%)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.125)',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 0 20px ${theme.palette.primary.main}`,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={rec.entry.images.jpg.image_url}
                      alt={rec.entry.title}
                      sx={{ 
                        height: '200px', 
                        objectFit: 'cover', 
                        borderTopLeftRadius: 2, 
                        borderTopRightRadius: 2 
                      }}
                    />
                    <Box sx={{ p: 2 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{
                          color: '#fff',
                          fontWeight: 600,
                          textShadow: '0 0 10px #00f3ff',
                          fontFamily: "Russo One, sans-serif",
                          letterSpacing: '0.5px',
                          mb: 1,
                        }}
                      >
                        {rec.entry.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {translateGenres(rec.entry.genres?.map(genre => genre.name) || []).map((genre, index) => (
                          <Chip
                            key={index}
                            label={genre}
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              color: theme.palette.primary.light,
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                              },
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#00f3ff',
                            textShadow: '0 0 5px #00f3ff',
                            fontFamily: "Russo One, sans-serif",
                          }}
                        >
                          Эпизодов: {rec.entry.episodes || 'TBA'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#ff00ff',
                            textShadow: '0 0 5px #ff00ff',
                            fontFamily: "Russo One, sans-serif",
                          }}
                        >
                          Статус: {translateStatus(rec.entry.status)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.primary.light,
                            fontFamily: "Russo One, sans-serif",
                          }}
                        >
                          Сезон: {formatSeasonYear(rec.entry.season, rec.entry.year)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AnimePage;
