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

const AnimeSearchCard = ({ anime }) => {
  return (
    <Card
      component={motion.div}
      whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(255,16,240,0.2)' }}
      sx={{
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          border: '1px solid rgba(255,16,240,0.3)',
        },
      }}
    >
      <Link to={`/anime/${anime.id}`} style={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="350"
          image={anime.image}
          alt={anime.title}
          sx={{
            objectFit: 'cover',
          }}
        />
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {anime.score && (
              <Chip
                icon={<Star sx={{ color: '#FFD700 !important' }} />}
                label={anime.score}
                sx={{
                  backgroundColor: 'rgba(255,215,0,0.1)',
                  color: '#FFD700',
                  border: '1px solid rgba(255,215,0,0.3)',
                }}
              />
            )}
            {anime.type && (
              <Chip
                label={anime.type}
                sx={{
                  backgroundColor: 'rgba(255,16,240,0.1)',
                  color: '#FF10F0',
                  border: '1px solid rgba(255,16,240,0.3)',
                }}
              />
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              mb: 1,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              textShadow: '0 0 10px rgba(0,0,0,0.5)',
            }}
          >
            {anime.title}
          </Typography>
          {anime.title_japanese && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 1,
                fontStyle: 'italic',
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
              }}
            >
              {anime.title_english}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {anime.genres.slice(0, 3).map((genre) => (
              <Chip
                key={genre}
                label={genre}
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,255,255,0.1)',
                  color: '#00FFFF',
                  border: '1px solid rgba(0,255,255,0.3)',
                  fontSize: '0.75rem',
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
      if (!query) {
        setResults([]);
        setTotalPages(1);
        return;
      }

      setLoading(true);
      setError(null);
      try {
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