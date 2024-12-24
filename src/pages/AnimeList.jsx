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
        let data = [];

        if (!type || !['current', 'previous', 'top'].includes(type)) {
          throw new Error('Invalid list type');
        }

        const seasons = animeService.getSeasons();
        if (!seasons || !seasons.current || !seasons.previous) {
          throw new Error('Failed to determine anime seasons');
        }

        console.log('Fetching anime for:', type);
        console.log('Seasons:', seasons);

        switch (type) {
          case 'current':
            data = await animeService.getSeasonalAnime(seasons.current, 20);
            break;
          case 'previous':
            data = await animeService.getSeasonalAnime(seasons.previous, 20);
            break;
          case 'top':
            data = await animeService.getTopAnime(20);
            break;
          default:
            throw new Error('Invalid anime list type');
        }

        if (!Array.isArray(data)) {
          console.error('Invalid data format:', data);
          throw new Error('Invalid data format received');
        }

        const validData = data.filter(anime => 
          anime && 
          anime.id && 
          anime.title && 
          anime.image &&
          typeof anime.id === 'number' &&
          typeof anime.title === 'string' &&
          typeof anime.image === 'string'
        );

        console.log('Valid anime data:', validData);

        if (validData.length === 0) {
          if (data.length > 0) {
            console.error('No valid entries in data:', data);
            throw new Error('No valid anime entries found in the response');
          } else {
            throw new Error('No anime data available for this selection');
          }
        }

        setAnimeList(validData);
      } catch (err) {
        console.error('Error fetching anime:', err);
        setError(err.message || 'Failed to load anime data');
        setAnimeList([]);
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
