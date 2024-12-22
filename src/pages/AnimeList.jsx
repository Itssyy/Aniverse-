import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import animeService from '../services/animeService';
import SeasonAnimeCard from '../components/SeasonAnimeCard';

const AnimeList = () => {
  const { type } = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let data;

        switch (type) {
          case 'current':
            const { current } = animeService.getSeasons();
            data = await animeService.getSeasonalAnime(current, 20);
            break;
          case 'previous':
            const { previous } = animeService.getSeasons();
            data = await animeService.getSeasonalAnime(previous, 20);
            break;
          case 'top':
            data = await animeService.getTopAnime(20);
            break;
          default:
            throw new Error('Invalid anime list type');
        }

        setAnimeList(data);
      } catch (err) {
        console.error('Error fetching anime:', err);
        setError(err.message || 'Failed to load anime data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnime();
  }, [type]);

  const getTitle = () => {
    switch (type) {
      case 'current':
        return 'Current Season Anime';
      case 'previous':
        return 'Previous Season Anime';
      case 'top':
        return 'Top Anime';
      default:
        return 'Anime List';
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          mb: 4,
          color: 'primary.main'
        }}
      >
        {getTitle()}
      </Typography>

      <Grid container spacing={3}>
        {animeList.map((anime) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={anime.id}>
            <SeasonAnimeCard anime={anime} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AnimeList;
