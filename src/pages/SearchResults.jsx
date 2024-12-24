import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Pagination,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Search, Star } from '@mui/icons-material';
import animeService from '../services/animeService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Link } from 'react-router-dom';
import { translateGenres, translateStatus } from '../utils/translations';

const AnimeSearchCard = ({ anime }) => {
  // Преобразуем жанры в правильный формат и переводим их
  const genres = anime.genres?.map(genre => {
    if (typeof genre === 'string') {
      return genre;
    }
    return genre?.name || null;
  }).filter(Boolean) || [];

  const translatedGenres = translateGenres(genres);
  const translatedType = translateStatus(anime.type || '');

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(255,16,240,0.2)' }}
      sx={{
        height: '100%',
        background: 'rgba(17, 25, 40, 0.75)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: '1px solid rgba(255,16,240,0.3)',
          '& .anime-image': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      <Link to={`/anime/${anime.id}`} style={{ textDecoration: 'none' }}>
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="350"
            image={anime.image}
            alt={anime.title}
            className="anime-image"
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
              p: 1,
              display: 'flex',
              gap: 1,
            }}
          >
            {anime.score && (
              <Chip
                icon={<Star sx={{ color: '#FFD700 !important' }} />}
                label={anime.score}
                size="small"
                sx={{
                  backgroundColor: 'rgba(17, 25, 40, 0.85)',
                  color: '#FFD700',
                  border: '1px solid rgba(255,215,0,0.3)',
                  backdropFilter: 'blur(4px)',
                  '& .MuiChip-label': {
                    fontWeight: 600,
                  },
                }}
              />
            )}
            {translatedType && (
              <Chip
                label={translatedType}
                size="small"
                sx={{
                  backgroundColor: 'rgba(17, 25, 40, 0.85)',
                  color: '#FF10F0',
                  border: '1px solid rgba(255,16,240,0.3)',
                  backdropFilter: 'blur(4px)',
                  '& .MuiChip-label': {
                    fontWeight: 600,
                  },
                }}
              />
            )}
          </Box>
        </Box>
        <CardContent 
          sx={{ 
            p: 2,
            background: 'rgba(17, 25, 40, 0.95)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              mb: 1,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {anime.title}
          </Typography>
          {anime.title_japanese && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 0.5,
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {anime.title_japanese}
            </Typography>
          )}
          {anime.title_english && anime.title_english !== anime.title && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 1,
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {anime.title_english}
            </Typography>
          )}
          <Box 
            sx={{ 
              mt: 'auto', 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              pt: 1,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {translatedGenres.slice(0, 3).map((genre, index) => (
              <Chip
                key={index}
                label={genre}
                size="small"
                sx={{
                  height: '20px',
                  backgroundColor: 'rgba(0,255,255,0.1)',
                  color: '#00FFFF',
                  border: '1px solid rgba(0,255,255,0.2)',
                  fontSize: '0.7rem',
                  '& .MuiChip-label': {
                    px: 1,
                    fontWeight: 500,
                  },
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Link>
    </Card>
  );
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const resultsPerPage = 12;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Прокручиваем страницу вверх при новом поиске
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setLoading(true);
        setError(null);
        if (!query) {
          setResults([]);
          setTotalPages(1);
          return;
        }

        const data = await animeService.searchAnime(query, page);
        
        if (!data || !Array.isArray(data.results)) {
          throw new Error('Invalid search results format');
        }

        // Проверяем и фильтруем результаты
        const validResults = data.results.filter(anime => 
          anime &&
          anime.id &&
          anime.title &&
          anime.image &&
          typeof anime.id === 'number' &&
          typeof anime.title === 'string' &&
          typeof anime.image === 'string'
        );

        if (validResults.length === 0 && data.results.length > 0) {
          throw new Error('No valid results found in the response');
        }

        setResults(validResults);
        setTotalPages(Math.max(1, Math.ceil(data.total / resultsPerPage)));
      } catch (err) {
        console.error('Error searching anime:', err);
        setError(err.message || 'Произошла ошибка при поиске. Пожалуйста, попробуйте позже.');
        setResults([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!query) return null;

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
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              fontFamily: 'Russo One, sans-serif',
              textShadow: '0 0 10px rgba(255,16,240,0.5)',
            }}
          >
            <Search sx={{ fontSize: '2.5rem', color: '#FF10F0' }} />
            Результаты поиска
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              mb: 1,
            }}
          >
            По запросу: "{query}"
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Найдено результатов: {results.length}
          </Typography>
        </Box>

        {results.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={3}>
                {results.map((anime, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={anime.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AnimeSearchCard anime={anime} />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>

            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 6,
                  '& .MuiPagination-ul': {
                    gap: 1,
                  },
                  '& .MuiPaginationItem-root': {
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      borderColor: '#FF10F0',
                      backgroundColor: 'rgba(255,16,240,0.1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255,16,240,0.2)',
                      borderColor: '#FF10F0',
                      '&:hover': {
                        backgroundColor: 'rgba(255,16,240,0.3)',
                      },
                    },
                  },
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  variant="outlined"
                  shape="rounded"
                  size="large"
                />
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 2,
              }}
            >
              По вашему запросу ничего не найдено
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Попробуйте изменить запрос или проверить правильность написания
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SearchResults;