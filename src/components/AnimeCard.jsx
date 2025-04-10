import React, { useState, useEffect } from 'react';
import {
  Card,
  CardMedia,
  Typography,
  Box,
  IconButton,
  alpha,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { translateGenres, formatSeasonYear, translateStatus, translateRating, translateType } from '../utils/translations';
import translationService from '../services/translationService';

export const AnimeCard = ({ anime }) => {
  const navigate = useNavigate();
  const [translatedSynopsis, setTranslatedSynopsis] = useState('');

  const handlePlayClick = (e) => {
    e.preventDefault();
    if (anime.id) {
      navigate(`/anime/${anime.id}`);
    }
  };
  console.log('AnimeCard component mounted with anime:', anime);
  useEffect(() => {
    const fetchTranslation = async () => {
      if (anime.synopsis) {
        const translation = await translationService.translateText(anime.synopsis);
        setTranslatedSynopsis(translation);
        console.log('Translation fetched for synopsis:', anime.synopsis);
        console.log('Translated synopsis:', translation);
      }
      
      console.log('Server is working');
    };
    if (anime.synopsis) {
      fetchTranslation();
    }
  }, [anime.synopsis]);

  const translatedGenres = translateGenres(anime.genres?.map(genre => genre.name) || []);

  return (
    <Card
      sx={{
        width: '100%',
        height: 400,
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(17, 25, 40, 0.75)',
        backdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.125)',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          '& .media-overlay': {
            opacity: 1,
          },
          '& .content-overlay': {
            transform: 'translateY(0)',
          },
          '& .hover-info': {
            opacity: 1,
          }
        },
      }}
      onClick={() => anime.id && navigate(`/anime/${anime.id}`)}
    >
      <CardMedia
        component="img"
        height="400"
        image={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image}
        alt={anime.title}
        sx={{
          objectFit: 'cover',
        }}
      />
      
      {/* Hover Overlay */}
      <Box
        className="media-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          zIndex: 1,
        }}
      >
        <Typography sx={{ color: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton 
          onClick={handlePlayClick}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255, 16, 240, 0.3)',
            backdropFilter: 'blur(4px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 16, 240, 0.5)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
            mb: 2,
          }}
        >
          <PlayArrowIcon sx={{ fontSize: 40 }} /></IconButton>
        </Typography>
      </Box>

      {/* Score Badge */}
      {anime.score && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            padding: '4px 8px',
            borderRadius: '12px',
            gap: 0.5,
          }}
        >
          <Star sx={{ color: '#FFD700', fontSize: 16 }} />
          <Typography
             sx={{
              color: '#FFD700', fontSize: '0.9rem',
            }} 
          >
            {anime.score}
          </Typography>
        </Box>
      )}

      {/* Content Overlay */}
      <Box
        className="content-overlay"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 20%)',
          padding: '20px',
          transform: 'translateY(70px)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 600,
            textShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 30px #00f3ff',
            letterSpacing: '1px',
            marginBottom: '1rem',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            
          }}
        >
          {anime.title}
        </Typography>

        <Typography
          sx={{
            color: '#fff',
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            mb: 1
          }}
        >
          {translatedSynopsis
              ? translatedSynopsis
              : anime.synopsis}
        </Typography>

        <Box className="hover-info" sx={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}>
          {/* Genres */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {translatedGenres.slice(0, 3).map((genre, index) => (
                <Box
                key={index}
                sx={{
                  color: '#FF10F0'}}>
                    {genre}
                </Box>
              ))}
          </Box>

          {/* Info Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 , mb:1}}>
              <Typography sx={{ color: '#00f3ff'}}>
                {translateType(anime.type)}
              </Typography>

              <Typography sx={{ color: '#00f3ff',
                  textAlign: 'center'}}>
                {translateStatus(anime.status)}
              </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 ,}}>
            <Typography sx={{ color: '#00f3ff'}}>
              {translateRating(anime.rating)}
            </Typography>
            <Typography sx={{ color: '#00f3ff', textAlign: 'right'}}>
              {anime.episodes ? `${anime.episodes} эп.` : 'TBA'}
            </Typography>
          </Box> </Box>


          {/* Season and Studio */}
          <Typography 
            sx={{ color: '#fff', mt: 0.5,}}
          >
            {formatSeasonYear(anime.season, anime.year)}
            {anime.studios?.[0]?.name && ` • ${anime.studios[0].name}`}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default AnimeCard;
