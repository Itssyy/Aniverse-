import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Grid, useTheme, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { AnimeCard } from '../components/AnimeCard';
import animeService from '../services/animeService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { PlayArrow, Whatshot, Update, Star } from '@mui/icons-material';
import logoImage from '../assets/image_fx_-removebg-preview.png';
import { motion } from 'framer-motion';
import { translateStatus, formatSeasonYear } from '../utils/translations';

const Home = () => {
  const theme = useTheme();
  const [topAnime, setTopAnime] = useState([]);
  const [currentSeasonAnime, setCurrentSeasonAnime] = useState([]);
  const [previousSeasonAnime, setPreviousSeasonAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredAnime, setFeaturedAnime] = useState(null);
  const initialFeaturedSet = useRef(false);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [genres, setGenres] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAnime: 0,
    totalUsers: 0,
    totalViews: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const seasons = animeService.getSeasons();
        if (!seasons || !seasons.current || !seasons.previous) {
          throw new Error('Invalid seasons data');
        }
        
        const [topResults, currentResults, previousResults, latestResults, genresResults, statsResults] = await Promise.all([
          animeService.getTopAnime(),
          animeService.getSeasonalAnime(seasons.current),
          animeService.getSeasonalAnime(seasons.previous),
          animeService.getLatestUpdates(),
          animeService.getPopularGenres(),
          animeService.getStatistics()
        ]);

        // Проверяем валидность данных
        if (!Array.isArray(topResults) || !Array.isArray(currentResults) || 
            !Array.isArray(previousResults) || !Array.isArray(latestResults) ||
            !Array.isArray(genresResults)) {
          throw new Error('Invalid data format received');
        }

        // Фильтруем невалидные элементы
        const validateAnime = (anime) => anime && anime.id && anime.title && anime.image;
        
        setTopAnime(topResults.filter(validateAnime));
        setCurrentSeasonAnime(currentResults.filter(validateAnime));
        setPreviousSeasonAnime(previousResults.filter(validateAnime));
        setLatestUpdates(latestResults.filter(validateAnime));
        setGenres(genresResults.filter(genre => genre && genre.id && genre.name));
        setStatistics({
          totalAnime: statsResults?.totalAnime || 0,
          totalUsers: statsResults?.totalUsers || 0,
          totalViews: statsResults?.totalViews || 0
        });
        
        // Устанавливаем featured anime только если еще не установлен
        if (!initialFeaturedSet.current) {
          const topPool = topResults.filter(validateAnime).slice(0, 3);
          const currentPool = currentResults.filter(validateAnime).slice(0, 3);
          const combinedPool = [...topPool, ...currentPool];
          
          if (combinedPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * combinedPool.length);
            setFeaturedAnime(combinedPool[randomIndex]);
          }
          initialFeaturedSet.current = true;
        }
      } catch (err) {
        console.error('Error fetching anime data:', err);
        setError(err.message || 'Failed to load anime data. Please try again later.');
        // Очищаем все состояния при ошибке
        setTopAnime([]);
        setCurrentSeasonAnime([]);
        setPreviousSeasonAnime([]);
        setLatestUpdates([]);
        setGenres([]);
        setStatistics({
          totalAnime: 0,
          totalUsers: 0,
          totalViews: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 100%)',
      minHeight: '100vh',
      pt: 2
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '80vh',
          width: '100%',
          overflow: 'hidden',
          mb: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: featuredAnime ? `url(${featuredAnime.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px) brightness(0.3)',
            transform: 'scale(1.1)',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="xl" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
          <Grid container sx={{ height: '100%' }} alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={logoImage}
                alt="Aniverse Logo"
                sx={{
                  width: { xs: '80%', sm: '60%', md: '70%' },
                  maxWidth: '500px',
                  height: 'auto',
                  mb: 4,
                  filter: 'drop-shadow(0 0 20px rgba(255,16,240,0.5))',
                  animation: 'glow 3s ease-in-out infinite alternate',
                  '@keyframes glow': {
                    from: {
                      filter: 'drop-shadow(0 0 10px rgba(255,16,240,0.5)) drop-shadow(0 0 20px rgba(0,255,255,0.5))',
                    },
                    to: {
                      filter: 'drop-shadow(0 0 20px rgba(255,16,240,0.8)) drop-shadow(0 0 30px rgba(0,255,255,0.8))',
                    },
                  },
                }}
              />
              <Box
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                Погрузитесь в захватывающий мир аниме! Откройте для себя лучшие тайтлы, следите за текущими сезонами и находите новые любимые истории.
              </Box>
              <Button
                component={Link}
                to="/anime"
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                sx={{
                  background: 'linear-gradient(45deg, #FF10F0, #00FFFF)',
                  fontSize: '1.2rem',
                  py: 1.5,
                  px: 4,
                  borderRadius: '50px',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF10F0, #00FFFF)',
                    filter: 'brightness(1.2)',
                  }
                }}
              >
                Начать просмотр
              </Button>
            </Grid>
            {featuredAnime && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    background: 'rgba(0,0,0,0.7)',
                    p: 3,
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Box sx={{ 
                    fontSize: '1.5rem', 
                    mb: 3, 
                    color: '#00FFFF',
                    borderBottom: '2px solid rgba(0,255,255,0.3)',
                    pb: 1
                  }}>
                    Рекомендуемое аниме
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          position: 'relative',
                        }}
                      >
                        <img
                          src={featuredAnime.image}
                          alt={featuredAnime.title}
                          style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '10px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                          }}
                        />
                        {featuredAnime.score && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              background: 'rgba(0,0,0,0.8)',
                              borderRadius: '10px',
                              padding: '5px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                            <Box sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                              {featuredAnime.score}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        fontSize: '1.3rem', 
                        mb: 2, 
                        color: '#fff',
                        fontWeight: 'bold',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        pb: 1
                      }}>
                        {featuredAnime.title}
                      </Box>
                      {featuredAnime.title_japanese && (
                        <Box sx={{ 
                          color: 'rgba(255,255,255,0.7)', 
                          mb: 2,
                          fontSize: '1rem',
                          fontStyle: 'italic'
                        }}>
                          {featuredAnime.title_japanese}
                        </Box>
                      )}
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {featuredAnime.type && (
                          <Grid item>
                            <Box sx={{
                              background: 'rgba(255,16,240,0.2)',
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '0.9rem',
                              color: '#FF10F0',
                            }}>
                              {featuredAnime.type}
                            </Box>
                          </Grid>
                        )}
                        {featuredAnime.status && (
                          <Grid item>
                            <Box sx={{
                              background: 'rgba(0,255,255,0.2)',
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '0.9rem',
                              color: '#00FFFF',
                            }}>
                              {translateStatus(featuredAnime.status)}
                            </Box>
                          </Grid>
                        )}
                        {featuredAnime.rating && (
                          <Grid item>
                            <Box sx={{
                              background: 'rgba(255,255,255,0.1)',
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '0.9rem',
                              color: '#fff',
                            }}>
                              {featuredAnime.rating}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                      <Box sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        mb: 2,
                        fontSize: '0.95rem',
                        maxHeight: '100px',
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(255,255,255,0.3)',
                          borderRadius: '3px',
                        }
                      }}>
                        {featuredAnime.description}
                      </Box>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        {featuredAnime.episodes && (
                          <Grid item xs={6}>
                            <Box sx={{ 
                              color: '#00f3ff',
                              textShadow: '0 0 5px #00f3ff',
                              fontFamily: "Russo One, sans-serif",
                              fontSize: '0.9rem' 
                            }}>
                              Эпизоды
                            </Box>
                            <Box sx={{ 
                              color: '#fff',
                              fontSize: '1.1rem',
                              fontFamily: "Russo One, sans-serif",
                            }}>
                              {featuredAnime.episodes}
                            </Box>
                          </Grid>
                        )}
                        {featuredAnime.season && (
                          <Grid item xs={6}>
                            <Box sx={{ 
                              color: '#00f3ff',
                              textShadow: '0 0 5px #00f3ff',
                              fontFamily: "Russo One, sans-serif",
                              fontSize: '0.9rem' 
                            }}>
                              Сезон
                            </Box>
                            <Box sx={{ 
                              color: '#fff',
                              fontSize: '1.1rem',
                              fontFamily: "Russo One, sans-serif",
                            }}>
                              {formatSeasonYear(featuredAnime.season, featuredAnime.year)}
                            </Box>
                          </Grid>
                        )}
                        {featuredAnime.studios && featuredAnime.studios.length > 0 && (
                          <Grid item xs={6}>
                            <Box sx={{ 
                              color: '#00f3ff',
                              textShadow: '0 0 5px #00f3ff',
                              fontFamily: "Russo One, sans-serif",
                              fontSize: '0.9rem' 
                            }}>
                              Студия
                            </Box>
                            <Box sx={{ 
                              color: '#fff',
                              fontSize: '1.1rem',
                              fontFamily: "Russo One, sans-serif",
                            }}>
                              {featuredAnime.studios[0].name}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          component={Link}
                          to={`/anime/${featuredAnime.id}`}
                          variant="contained"
                          size="large"
                          startIcon={<PlayArrow />}
                          sx={{
                            background: 'linear-gradient(45deg, #FF10F0, #00FFFF)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #FF10F0, #00FFFF)',
                              filter: 'brightness(1.2)',
                            },
                            flex: 1
                          }}
                        >
                          Смотреть
                        </Button>
                        {featuredAnime.trailer_url && (
                          <Button
                            component="a"
                            href={featuredAnime.trailer_url}
                            target="_blank"
                            variant="outlined"
                            size="large"
                            sx={{
                              color: '#fff',
                              borderColor: 'rgba(255,255,255,0.3)',
                              '&:hover': {
                                borderColor: '#fff',
                                background: 'rgba(255,255,255,0.1)',
                              }
                            }}
                          >
                            Трейлер
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Quick Stats Section */}
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255,16,240,0.1)',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,16,240,0.2)',
                textAlign: 'center',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <Whatshot sx={{ fontSize: 40, color: '#FF10F0', mb: 1 }} />
              <Box sx={{ fontSize: '2rem', color: '#FF10F0', mb: 1 }}>
                {topAnime.length}+
              </Box>
              <Box sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Топ аниме
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(0,255,255,0.1)',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,255,255,0.2)',
                textAlign: 'center',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <Update sx={{ fontSize: 40, color: '#00FFFF', mb: 1 }} />
              <Box sx={{ fontSize: '2rem', color: '#00FFFF', mb: 1 }}>
                {currentSeasonAnime.length}+
              </Box>
              <Box sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Текущий сезон
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255,16,240,0.1)',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,16,240,0.2)',
                textAlign: 'center',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <Star sx={{ fontSize: 40, color: '#FF10F0', mb: 1 }} />
              <Box sx={{ fontSize: '2rem', color: '#FF10F0', mb: 1 }}>
                {previousSeasonAnime.length}+
              </Box>
              <Box sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Предыдущий сезон
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(0,255,255,0.1)',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,255,255,0.2)',
                textAlign: 'center',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <PlayArrow sx={{ fontSize: 40, color: '#00FFFF', mb: 1 }} />
              <Box sx={{ fontSize: '2rem', color: '#00FFFF', mb: 1 }}>
                24/7
              </Box>
              <Box sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Доступность
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Featured Anime Section */}
        <Box sx={{ mb: 8 }}>
          <Box
            sx={{
              fontSize: '2.5rem',
              color: '#FF10F0',
              mb: 4,
              textAlign: 'center',
              textShadow: '0 0 10px rgba(255,16,240,0.5), 0 0 20px rgba(255,16,240,0.3)',
              fontFamily: 'Russo One, sans-serif',
              letterSpacing: '2px',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '150px',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #FF10F0, transparent)',
                borderRadius: '2px',
              }
            }}
          >
            Популярные тайтлы
          </Box>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
          >
            <Grid container spacing={3}>
              {topAnime.slice(0, 4).map((anime) => (
                <Grid item xs={12} sm={6} md={3} key={anime.id}>
                  <motion.div variants={item}>
                    <AnimeCard anime={anime} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* Current Season Section */}
        <Box sx={{ mb: 8 }}>
          <Box
            sx={{
              fontSize: '2.5rem',
              color: '#00FFFF',
              mb: 4,
              textAlign: 'center',
              textShadow: '0 0 10px rgba(0,255,255,0.5), 0 0 20px rgba(0,255,255,0.3)',
              fontFamily: 'Russo One, sans-serif',
              letterSpacing: '2px',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '150px',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
                borderRadius: '2px',
              }
            }}
          >
            Аниме текущего сезона
          </Box>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
          >
            <Grid container spacing={3}>
              {currentSeasonAnime.slice(0, 4).map((anime) => (
                <Grid item xs={12} sm={6} md={3} key={anime.id}>
                  <motion.div variants={item}>
                    <AnimeCard anime={anime} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>
      </Container>

      {/* Latest Updates Section */}
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Box
          sx={{
            fontSize: '2.5rem',
            color: '#FF10F0',
            mb: 4,
            textAlign: 'center',
            textShadow: '0 0 10px rgba(255,16,240,0.5), 0 0 20px rgba(255,16,240,0.3)',
            fontFamily: 'Russo One, sans-serif',
            letterSpacing: '2px',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #FF10F0, transparent)',
              borderRadius: '2px',
            }
          }}
        >
          <Update sx={{ fontSize: '3rem', verticalAlign: 'middle', mr: 2 }} />
          Последние обновления
        </Box>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <Grid container spacing={3}>
            {latestUpdates.slice(0, 6).map((anime) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={anime.id}>
                <motion.div variants={item}>
                  <AnimeCard anime={anime} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Genres Section */}
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Box
          sx={{
            fontSize: '2.5rem',
            color: '#00FFFF',
            mb: 4,
            textAlign: 'center',
            textShadow: '0 0 10px rgba(0,255,255,0.5), 0 0 20px rgba(0,255,255,0.3)',
            fontFamily: 'Russo One, sans-serif',
            letterSpacing: '2px',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
              borderRadius: '2px',
            }
          }}
        >
          <Whatshot sx={{ fontSize: '3rem', verticalAlign: 'middle', mr: 2 }} />
          Популярные жанры
        </Box>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <Grid container spacing={3}>
            {genres.map((genre) => (
              <Grid item xs={12} sm={6} md={4} key={genre.id}>
                <motion.div variants={item}>
                  <Paper
                    component={Link}
                    to={`/genre/${genre.id}`}
                    sx={{
                      p: 3,
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '15px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      border: '1px solid rgba(0,255,255,0.1)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 5px 20px rgba(0,255,255,0.3)',
                        borderColor: 'rgba(0,255,255,0.3)',
                      }
                    }}
                  >
                    <Box sx={{ fontSize: '1.5rem', color: '#00FFFF', fontWeight: 'bold' }}>
                      {genre.name}
                    </Box>
                    <Box sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {genre.description}
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap'
                    }}>
                      {genre.examples.slice(0, 3).map((anime) => (
                        <Box
                          key={anime.id}
                          component="img"
                          src={anime.image}
                          alt={anime.title}
                          sx={{
                            width: 60,
                            height: 80,
                            borderRadius: '5px',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Statistics Section */}
      <Container maxWidth="xl" sx={{ mt: 8, mb: 8 }}>
        <Box
          sx={{
            fontSize: '2.5rem',
            color: '#FF10F0',
            mb: 4,
            textAlign: 'center',
            textShadow: '0 0 10px rgba(255,16,240,0.5), 0 0 20px rgba(255,16,240,0.3)',
            fontFamily: 'Russo One, sans-serif',
            letterSpacing: '2px',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #FF10F0, transparent)',
              borderRadius: '2px',
            }
          }}
        >
          <Star sx={{ fontSize: '3rem', verticalAlign: 'middle', mr: 2 }} />
          Статистика проекта
        </Box>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div variants={item}>
                <Paper
                  sx={{
                    p: 4,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    textAlign: 'center',
                    border: '1px solid rgba(0,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 5px 20px rgba(0,255,255,0.3)',
                      borderColor: 'rgba(0,255,255,0.3)',
                    }
                  }}
                >
                  <Box sx={{ fontSize: '3rem', color: '#00FFFF', fontWeight: 'bold', mb: 1 }}>
                    {statistics.totalAnime.toLocaleString()}
                  </Box>
                  <Box sx={{ color: '#fff', fontSize: '1.2rem' }}>
                    Аниме в базе
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div variants={item}>
                <Paper
                  sx={{
                    p: 4,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,16,240,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 5px 20px rgba(255,16,240,0.3)',
                      borderColor: 'rgba(255,16,240,0.3)',
                    }
                  }}
                >
                  <Box sx={{ fontSize: '3rem', color: '#FF10F0', fontWeight: 'bold', mb: 1 }}>
                    {statistics.totalUsers.toLocaleString()}
                  </Box>
                  <Box sx={{ color: '#fff', fontSize: '1.2rem' }}>
                    Пользователей
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div variants={item}>
                <Paper
                  sx={{
                    p: 4,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,215,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 5px 20px rgba(255,215,0,0.3)',
                      borderColor: 'rgba(255,215,0,0.3)',
                    }
                  }}
                >
                  <Box sx={{ fontSize: '3rem', color: '#FFD700', fontWeight: 'bold', mb: 1 }}>
                    {statistics.totalViews.toLocaleString()}
                  </Box>
                  <Box sx={{ color: '#fff', fontSize: '1.2rem' }}>
                    Просмотров
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Home;
