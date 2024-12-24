import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  useTheme,
  Chip,
  IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RatingDisplay from './RatingDisplay';
import translationService from '../services/translationService';
import { translateGenres, formatSeasonYear, translateStatus, translateRating } from '../utils/translations';

const SeasonAnimeCard = ({ anime }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [translatedSynopsis, setTranslatedSynopsis] = useState('');

  useEffect(() => {
    const translateSynopsis = async () => {
      if (anime.synopsis) {
        const translated = await translationService.translateText(anime.synopsis);
        setTranslatedSynopsis(translated);
      }
    };
    translateSynopsis();
  }, [anime.synopsis]);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (anime.id) {
      navigate(`/anime/${anime.id}`);
    }
  };

  const translatedGenres = translateGenres(anime.genres);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(26, 29, 36, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 0 20px ${theme.palette.primary.main}`,
          '& .media-overlay': {
            opacity: 1,
          },
          '& .card-content': {
            transform: 'translateY(0)',
          },
        },
      }}
      onClick={() => anime.id && navigate(`/anime/${anime.id}`)}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="400"
          image={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image}
          alt={anime.title}
          sx={{
            objectFit: 'cover',
            filter: 'brightness(0.9)',
          }}
        />
        <Box
          className="media-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <IconButton
            onClick={handlePlayClick}
            sx={{
              color: 'white',
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
        {anime.score && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
            }}
          >
            <RatingDisplay score={anime.score} />
          </Box>
        )}
      </Box>

      <CardContent
        className="card-content"
        sx={{
          flexGrow: 1,
          p: 2,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 600,
            textShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 30px #00f3ff',
            fontFamily: "Russo One, sans-serif",
            letterSpacing: '1px',
            marginBottom: '1rem',
            transition: 'all 0.3s ease',
            '&:hover': {
              textShadow: '0 0 20px #00f3ff, 0 0 30px #00f3ff, 0 0 40px #00f3ff',
            },
          }}
        >
          {anime.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.85)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
            minHeight: '4.5em',
            lineHeight: '1.5',
            fontSize: '0.875rem',
            fontWeight: '300',
            letterSpacing: '0.2px',
            fontFamily: theme.typography.fontFamily,
            transition: 'color 0.3s ease-in-out',
            '&:hover': {
              color: 'rgba(255, 255, 255, 0.95)',
            },
          }}
        >
          {translatedSynopsis || anime.synopsis}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {translatedGenres.map((genre, index) => (
            <Chip
              key={index}
              label={genre}
              size="small"
              sx={{
                backgroundColor: theme.palette.action.selected,
                color: theme.palette.primary.light,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: '#00f3ff',
              textShadow: '0 0 5px #00f3ff',
              fontFamily: "Russo One, sans-serif",
              letterSpacing: '0.5px',
            }}
          >
            {translateStatus(anime.type)} • {anime.episodes ? `${anime.episodes} эп.` : 'Онгоинг'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: '#ff00ff',
              textShadow: '0 0 5px #ff00ff',
              fontFamily: "Russo One, sans-serif",
              letterSpacing: '0.5px',
            }}
          >
            {translateRating(anime.rating)} • {translateStatus(anime.status)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {formatSeasonYear(anime.season, anime.year)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SeasonAnimeCard;
