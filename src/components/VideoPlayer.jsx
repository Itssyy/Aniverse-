import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';
import { PlayArrow, HighQuality } from '@mui/icons-material';
import Hls from 'hls.js';

const VideoPlayer = ({ episode }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      // Очищаем HLS при размонтировании
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!episode || !videoRef.current) return;

    const video = videoRef.current;
    
    // Проверяем поддержку HLS
    if (Hls.isSupported()) {
      // Создаем новый экземпляр HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true
      });

      hlsRef.current = hls;

      // Привязываем HLS к видео элементу
      hls.attachMedia(video);

      // Загружаем поток высокого качества по умолчанию
      const streamUrl = episode.hls.fhd || episode.hls.hd || episode.hls.sd;
      if (streamUrl) {
        const fullUrl = `https://cache.libria.fun${streamUrl}`;
        hls.loadSource(fullUrl);
      }

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(error => {
          console.error('Error playing video:', error);
          setError('Failed to start playback');
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error');
              hls.recoverMediaError();
              break;
            default:
              console.error('Unrecoverable error');
              hls.destroy();
              break;
          }
          setError('Failed to load video');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Для Safari, который имеет встроенную поддержку HLS
      const streamUrl = episode.hls.fhd || episode.hls.hd || episode.hls.sd;
      if (streamUrl) {
        video.src = `https://cache.libria.fun${streamUrl}`;
      }
    }
  }, [episode]);

  const handleQualityChange = (quality) => {
    if (!episode || !episode.hls[quality]) return;
    
    setCurrentQuality(quality);
    const streamUrl = `https://cache.libria.fun${episode.hls[quality]}`;
    
    if (hlsRef.current) {
      hlsRef.current.loadSource(streamUrl);
    } else if (videoRef.current) {
      videoRef.current.src = streamUrl;
    }
  };

  if (!episode) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select an episode to watch
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          bgcolor: 'black',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <video
          ref={videoRef}
          controls
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <ButtonGroup variant="outlined" size="small">
          {episode.hls.fhd && (
            <Button
              startIcon={<HighQuality />}
              onClick={() => handleQualityChange('fhd')}
              variant={currentQuality === 'fhd' ? 'contained' : 'outlined'}
            >
              1080p
            </Button>
          )}
          {episode.hls.hd && (
            <Button
              startIcon={<HighQuality />}
              onClick={() => handleQualityChange('hd')}
              variant={currentQuality === 'hd' ? 'contained' : 'outlined'}
            >
              720p
            </Button>
          )}
          {episode.hls.sd && (
            <Button
              startIcon={<HighQuality />}
              onClick={() => handleQualityChange('sd')}
              variant={currentQuality === 'sd' ? 'contained' : 'outlined'}
            >
              480p
            </Button>
          )}
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
