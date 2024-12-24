import React from 'react';
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
import { translateGenres, formatSeasonYear, translateStatus, translateRating } from '../utils/translations';

export const AnimeCard = ({ anime }) => {
  const navigate = useNavigate();

  const handlePlayClick = (e) => {
    e.preventDefault();
    if (anime.id) {
      navigate(`/anime/${anime.id}`);
    }
  };

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
          <PlayArrowIcon sx={{ fontSize: 40 }} />
        </IconButton>
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
              color: '#FFD700',
              fontFamily: 'Russo One, sans-serif',
              fontSize: '0.9rem',
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
          sx={{
            color: '#fff',
            fontFamily: 'Russo One, sans-serif',
            fontSize: '1.1rem',
            textShadow: '0 0 10px rgba(0,243,255,0.5)',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {anime.title}
        </Typography>

        <Box className="hover-info" sx={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}>
          {/* Genres */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {translatedGenres.slice(0, 2).map((genre, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: alpha('#FF10F0', 0.2),
                  color: '#FF10F0',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontFamily: 'Russo One, sans-serif',
                  textShadow: '0 0 5px rgba(255,16,240,0.5)',
                }}
              >
                {genre}
              </Box>
            ))}
          </Box>

          {/* Info Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Typography
              sx={{
                color: '#00f3ff',
                fontSize: '0.8rem',
                fontFamily: 'Russo One, sans-serif',
                textShadow: '0 0 5px rgba(0,243,255,0.5)',
              }}
            >
              {translateRating(anime.rating)}
            </Typography>
            <Typography
              sx={{
                color: '#00f3ff',
                fontSize: '0.8rem',
                fontFamily: 'Russo One, sans-serif',
                textShadow: '0 0 5px rgba(0,243,255,0.5)',
                textAlign: 'right',
              }}
            >
              {anime.episodes ? `${anime.episodes} эп.` : 'TBA'}
            </Typography>
          </Box>

          {/* Season and Studio */}
          <Typography
            sx={{
              color: '#fff',
              fontSize: '0.8rem',
              fontFamily: 'Russo One, sans-serif',
              opacity: 0.8,
              mt: 0.5,
            }}
          >
            {formatSeasonYear(anime.season, anime.year)}
            {anime.studios?.[0] && ` • ${anime.studios[0].name}`}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default AnimeCard;
