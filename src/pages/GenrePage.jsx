import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import { Box, Typography, Grid } from '@mui/material';
import animeService from '../services/animeService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

function GenrePage() {
  const { genreName } = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeByGenre = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Genre name:', genreName);
        // Инициализируем сервис

        await animeService.initialize();

        const genreId = await animeService.getGenreId(genreName);
        if (!genreId) {
          throw new Error('Genre not found');
        }
        const data = await animeService.getAnimeByGenre(genreId);
        console.log('Data from animeService.getAnimeByGenre:', data);

        setAnimeList(data);


      } catch (err) {
        console.error('Error fetching anime by genre:', err);
        setError(err.message || 'Failed to load anime by genre. Please try again later.');
        setAnimeList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeByGenre();
  }, [genreName]);

  console.log('animeList:', animeList);
  console.log('loading:', loading);
  console.log('error:', error);



  if (loading) {
    return <LoadingSpinner />;
  }


  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {genreName.charAt(0).toUpperCase() + genreName.slice(1)}
        </Typography>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {animeList.map((anime) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={anime.id}>
              <AnimeCard
                anime={anime}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default GenrePage;