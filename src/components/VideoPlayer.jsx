import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';
import { PlayArrow, HighQuality } from '@mui/icons-material';
import Hls from 'hls.js';
import { styled } from '@mui/material/styles';

// Создаем стилизованный компонент для контейнера видео
const VideoContainer = styled(Box)(({ glowColor }) => ({
  position: 'relative',
  width: '100%',
  padding: '30px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: -1,
    background: glowColor ? `radial-gradient(circle at center, ${glowColor}90 0%, ${glowColor}70 25%, ${glowColor}40 50%, transparent 70%)` : 'none',
    filter: 'blur(30px)',
    transition: 'background 0.3s ease',
    transform: 'scale(1.1)',
    opacity: 0.8,
    pointerEvents: 'none'
  },
  '& video': {
    borderRadius: '8px',
    boxShadow: glowColor ? `0 0 30px 5px ${glowColor}70` : 'none',
    transition: 'box-shadow 0.3s ease'
  }
}));

const VideoPlayer = ({ episode }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [error, setError] = useState(null);
  const [glowColor, setGlowColor] = useState(null);
  const analyzeFrameRef = useRef(null);

  // Функция для определения доминирующего цвета с усиленной яркостью
  const getAverageColor = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    let maxBrightness = 0;
    const samples = 10000;
    const step = Math.floor(data.length / 4 / samples);
    
    for (let i = 0; i < data.length; i += step * 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > maxBrightness) {
        maxBrightness = brightness;
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
      }
    }
    
    // Усиливаем яркость цвета
    const brightnessBoost = 1.5;
    r = Math.min(255, r * brightnessBoost);
    g = Math.min(255, g * brightnessBoost);
    b = Math.min(255, b * brightnessBoost);
    
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  // Функция анализа кадра
  const analyzeVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    
    // Устанавливаем размер canvas равным размеру видео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Отрисовываем текущий кадр видео на canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Получаем доминирующий цвет
    const color = getAverageColor(context, canvas.width, canvas.height);
    setGlowColor(color);
    
    // Планируем следующий анализ
    analyzeFrameRef.current = requestAnimationFrame(analyzeVideoFrame);
  };

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

  useEffect(() => {
    if (!videoRef.current) return;
    
    // Создаем canvas для анализа видео
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    
    // Начинаем анализ при воспроизведении
    const handlePlay = () => {
      analyzeFrameRef.current = requestAnimationFrame(analyzeVideoFrame);
    };
    
    // Останавливаем анализ при паузе
    const handlePause = () => {
      if (analyzeFrameRef.current) {
        cancelAnimationFrame(analyzeFrameRef.current);
      }
    };
    
    videoRef.current.addEventListener('play', handlePlay);
    videoRef.current.addEventListener('pause', handlePause);
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('play', handlePlay);
        videoRef.current.removeEventListener('pause', handlePause);
      }
      if (analyzeFrameRef.current) {
        cancelAnimationFrame(analyzeFrameRef.current);
      }
    };
  }, []);

  if (!episode) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', p: 2 }}>
        <Typography>No episode selected</Typography>
      </Box>
    );
  }

  return (
    <VideoContainer glowColor={glowColor}>
      <video
        ref={videoRef}
        controls
        style={{
          width: '100%',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <ButtonGroup sx={{ mt: 2 }}>
        <Button
          startIcon={<HighQuality />}
          onClick={() => handleQualityChange('fhd')}
          variant={currentQuality === 'fhd' ? 'contained' : 'outlined'}
          disabled={!episode.hls.fhd}
        >
          FHD
        </Button>
        <Button
          onClick={() => handleQualityChange('hd')}
          variant={currentQuality === 'hd' ? 'contained' : 'outlined'}
          disabled={!episode.hls.hd}
        >
          HD
        </Button>
        <Button
          onClick={() => handleQualityChange('sd')}
          variant={currentQuality === 'sd' ? 'contained' : 'outlined'}
          disabled={!episode.hls.sd}
        >
          SD
        </Button>
      </ButtonGroup>
    </VideoContainer>
  );
};

export default VideoPlayer;
