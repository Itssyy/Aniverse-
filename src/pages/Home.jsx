import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Grid, useTheme, Paper, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { AnimeCard } from '../components/AnimeCard';
import animeService from '../services/animeService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { PlayArrow, Whatshot, Update, Star } from '@mui/icons-material';
import logoImage from '../assets/image_fx_-removebg-preview.png';
import { motion } from 'framer-motion';
import { translateStatus, formatSeasonYear, translateRating, translateGenre } from '../utils/translations';

// Добавляем анимационные варианты
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const StatsCards = () => {
  const cards = [
    {
      title: 'Топ аниме',
      value: '9+',
      icon: <Whatshot />,
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF10F0 100%)',
      description: 'Лучшие тайтлы'
    },
    {
      title: 'Текущий сезон',
      value: '9+',
      icon: <Update />,
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #00FFFF 100%)',
      description: 'Новые релизы'
    },
    {
      title: 'Предыдущий сезон',
      value: '9+',
      icon: <Star />,
      gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
      description: 'Завершённые тайтлы'
    },
    {
      title: 'Доступность',
      value: '24/7',
      icon: <PlayArrow />,
      gradient: 'linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%)',
      description: 'Всегда онлайн'
    }
  ];

  return (
    <Grid container spacing={4}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Paper
              sx={{
                p: 3,
                height: '100%',
                background: card.gradient,
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                  '& .icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                  zIndex: 1
                }
              }}
            >
              <Box
                className="icon"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: '-20px',
                  transform: 'translateY(-50%)',
                  opacity: 0.2,
                  transition: 'all 0.3s ease',
                  '& .MuiSvgIcon-root': {
                    fontSize: '100px',
                    color: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                {card.icon}
              </Box>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    mb: 1,
                    fontFamily: 'Russo One, sans-serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {card.value}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    mb: 1,
                    fontFamily: 'Russo One, sans-serif'
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Russo One, sans-serif'
                  }}
                >
                  {card.description}
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

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
  const [sectionsLoading, setSectionsLoading] = useState({
    featured: true,
    top: true,
    current: true,
    previous: true,
    latest: true,
    genres: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Инициализируем сервис
        await animeService.initialize();

        // Получаем базовые данные
        const seasons = animeService.getSeasons();
        if (!seasons || !seasons.current || !seasons.previous) {
          throw new Error('Invalid seasons data');
        }

        // Загружаем данные поэтапно
        // 1. Сначал�� загружаем критически важные данные
        const loadCriticalData = async () => {
          const [topAnime, currentSeason] = await Promise.all([
            animeService.getTopAnime(),
            animeService.getSeasonalAnime(seasons.current)
          ]);
          setTopAnime(topAnime);
          setCurrentSeasonAnime(currentSeason);
          setSectionsLoading(prev => ({
            ...prev,
            top: false,
            current: false
          }));

          // Устанавливаем featured anime сразу после получения первых данных
          if (!initialFeaturedSet.current && (topAnime.length > 0 || currentSeason.length > 0)) {
            const combinedPool = [...(topAnime || []), ...(currentSeason || [])].filter(anime => anime && anime.id);
            if (combinedPool.length > 0) {
              const randomIndex = Math.floor(Math.random() * combinedPool.length);
              setFeaturedAnime(combinedPool[randomIndex]);
              setSectionsLoading(prev => ({ ...prev, featured: false }));
            }
            initialFeaturedSet.current = true;
          }
        };

        // 2. Затем загружаем второстепенные данные
        const loadSecondaryData = async () => {
          const [previousSeason, genres] = await Promise.all([
            animeService.getSeasonalAnime(seasons.previous),
            animeService.getPopularGenres()
          ]);
          setPreviousSeasonAnime(previousSeason);
          setGenres(genres);
          setSectionsLoading(prev => ({
            ...prev,
            previous: false,
            genres: false
          }));
        };

        // 3. Наконец, загружаем дополнительные данные
        const loadAdditionalData = async () => {
          const [latestUpdates, stats] = await Promise.all([
            animeService.getLatestUpdates(),
            animeService.getStatistics()
          ]);
          setLatestUpdates(latestUpdates);
          setStatistics(stats);
          setSectionsLoading(prev => ({
            ...prev,
            latest: false
          }));
        };

        // Запускаем загрузку всех данных
        await loadCriticalData();
        loadSecondaryData(); // Не ждем завершения
        loadAdditionalData(); // Не ждем завершения

      } catch (err) {
        console.error('Error fetching anime data:', err);
        setError(err.message || 'Failed to load anime data. Please try again later.');
        // Очищаем состояния при ошибке
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
                              {translateRating(featuredAnime.rating)}
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

      {/* Stats Cards */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <StatsCards />
      </Container>

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
      <Container maxWidth="xl" sx={{ mt: 8, mb: 6 }}>
        <Box
          component={motion.div}
          variants={container}
          initial="hidden"
          animate="visible"
          sx={{ width: '100%' }}
        >
          <Typography variant="h4" sx={{
            color: '#fff',
            mb: 3,
            fontFamily: 'Russo One, sans-serif',
            textShadow: '0 0 10px rgba(255,16,240,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'center'
          }}>
            <Whatshot sx={{ color: '#FF10F0' }} />
            Популярные жанры
          </Typography>
          <Grid container spacing={2}>
            {genres.slice(0, 8).map((genre, index) => (
              <Grid item xs={12} sm={6} md={3} key={genre.name || index}>
                <motion.div variants={item}>
                  <Paper
                    component={Link}
                    to={`/genre/${genre.name}`}
                    sx={{
                      position: 'relative',
                      height: '200px',
                      overflow: 'hidden',
                      borderRadius: '15px',
                      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${genre.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '20px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255,16,240,0.1)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 5px 20px rgba(255,16,240,0.3)',
                        '& .genre-overlay': {
                          opacity: 0.8,
                        },
                        '& .genre-count': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                        '& .genre-title': {
                          color: '#FF10F0',
                          textShadow: '0 0 10px rgba(255,16,240,0.5)',
                        }
                      },
                    }}
                  >
                    <Box
                      className="genre-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8))',
                        opacity: 0.6,
                        transition: 'opacity 0.3s ease',
                      }}
                    />
                    <Typography
                      className="genre-title"
                      variant="h6"
                      sx={{
                        color: '#fff',
                        fontFamily: 'Russo One, sans-serif',
                        position: 'relative',
                        zIndex: 1,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {translateGenre(genre.name)}
                    </Typography>
                    <Typography
                      className="genre-count"
                      sx={{
                        color: '#FF10F0',
                        position: 'relative',
                        zIndex: 1,
                        opacity: 0.8,
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9rem',
                        mt: 1,
                        fontFamily: 'Russo One, sans-serif',
                      }}
                    >
                      {genre.count.toLocaleString()} аниме
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
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
