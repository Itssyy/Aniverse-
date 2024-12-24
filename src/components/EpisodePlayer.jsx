import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Paper,
  InputLabel,
  CircularProgress,
  IconButton,
  Stack,
  useTheme,
  alpha,
  Slider,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  SkipNext,
  SkipPrevious,
  LightbulbOutlined,
  Lightbulb,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VideoContainer = styled(Box)(({ boxShadow }) => ({
  position: 'relative',
  width: '100%',
  margin: '20px auto',
  borderRadius: '10px',
  overflow: 'visible',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-20px',
    left: '-20px',
    right: '-20px',
    bottom: '-20px',
    borderRadius: '15px',
    background: 'transparent',
    boxShadow: boxShadow,
    transition: 'box-shadow 0.3s ease',
    pointerEvents: 'none',
    zIndex: -1
  },
  '& video': {
    borderRadius: '10px',
    transition: 'all 0.3s ease'
  }
}));

const GlowButton = styled(IconButton)(({ theme, isActive }) => ({
  color: isActive ? '#FFD700' : alpha(theme.palette.common.white, 0.7),
  transition: 'all 0.3s ease',
  '&:hover': {
    color: isActive ? '#FFC000' : theme.palette.common.white,
  },
  '& svg': {
    filter: isActive ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' : 'none',
    transition: 'filter 0.3s ease',
  },
}));

const GlowIntensitySlider = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-120px',
  right: '10px',
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(8px)',
  padding: '12px 8px',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.5)',
  },
  '& .MuiSlider-root': {
    width: '3px',
    height: 80,
    padding: '0 8px',
    '& .MuiSlider-thumb': {
      width: 12,
      height: 12,
      backgroundColor: '#fff',
      boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
      '&:hover, &.Mui-active': {
        boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
        width: 14,
        height: 14,
      },
      '&:before': {
        display: 'none',
      },
    },
    '& .MuiSlider-track': {
      background: 'linear-gradient(to top, rgba(255,215,0,0.3), rgba(255,215,0,1))',
      border: 'none',
      width: '3px',
    },
    '& .MuiSlider-rail': {
      background: 'rgba(255,255,255,0.1)',
      width: '3px',
      opacity: 1,
    },
  },
  '& .intensity-label': {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 500,
  },
}));

const EpisodePlayer = ({ episodes }) => {
  const theme = useTheme();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const canvasRef = useRef(null);
  const [boxShadow, setBoxShadow] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isGlowEnabled, setIsGlowEnabled] = useState(true);
  const [showGlowSlider, setShowGlowSlider] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(50); // 0-100
  const controlsTimeoutRef = useRef(null);
  const glowAnimationRef = useRef(null);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!videoRef.current?.paused) {
        setShowControls(false);
      }
    }, 3000);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const handleVolumeChange = useCallback((event, newValue) => {
    setVolume(newValue);
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      setIsMuted(newValue === 0);
    }
  }, []);

  const handleMute = useCallback(() => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (newMutedState) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  }, [isMuted]);

  const handleTimeSliderChange = useCallback((event, newValue) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  }, []);

  const handleEpisodeChange = useCallback((event) => {
    const episode = episodes.find(ep => ep.episode === event.target.value);
    setSelectedEpisode(episode);
  }, [episodes]);

  const handleQualityChange = useCallback((event) => {
    setSelectedQuality(event.target.value);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  }, []);

  const handlePrevEpisode = useCallback(() => {
    const currentIndex = episodes.findIndex(ep => ep.episode === selectedEpisode.episode);
    if (currentIndex > 0) {
      setSelectedEpisode(episodes[currentIndex - 1]);
    }
  }, [episodes, selectedEpisode]);

  const handleNextEpisode = useCallback(() => {
    const currentIndex = episodes.findIndex(ep => ep.episode === selectedEpisode.episode);
    if (currentIndex < episodes.length - 1) {
      setSelectedEpisode(episodes[currentIndex + 1]);
    }
  }, [episodes, selectedEpisode]);

  const handleGlowToggle = useCallback(() => {
    setIsGlowEnabled(prev => {
      const newState = !prev;
      if (newState && videoRef.current && !videoRef.current.paused) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const video = videoRef.current;

        const updateGlow = () => {
          if (video && !video.paused && !video.ended) {
            canvas.width = video.videoWidth / 20;
            canvas.height = video.videoHeight / 20;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const frame = context.getImageData(0, 0, canvas.width, canvas.height);
            const length = frame.data.length;
            let r = 0, g = 0, b = 0;

            for (let i = 0; i < length; i += 4) {
              r += frame.data[i];
              g += frame.data[i + 1];
              b += frame.data[i + 2];
            }

            r = Math.floor(r / (length / 4));
            g = Math.floor(g / (length / 4));
            b = Math.floor(b / (length / 4));

            const brightnessBoost = 1.5;
            r = Math.min(255, r * brightnessBoost);
            g = Math.min(255, g * brightnessBoost);
            b = Math.min(255, b * brightnessBoost);

            const newBoxShadow = `
              0 0 50px 20px rgba(${r}, ${g}, ${b}, 0.8),
              0 0 100px 40px rgba(${r}, ${g}, ${b}, 0.4),
              0 0 150px 60px rgba(${r}, ${g}, ${b}, 0.2)
            `;
            setBoxShadow(newBoxShadow);

            glowAnimationRef.current = requestAnimationFrame(updateGlow);
          }
        };

        updateGlow();
      } else if (!newState) {
        if (glowAnimationRef.current) {
          cancelAnimationFrame(glowAnimationRef.current);
        }
        setBoxShadow('');
      }
      return newState;
    });
  }, []);

  const handleGlowIntensityChange = useCallback((event, newValue) => {
    setGlowIntensity(newValue);
  }, []);

  const calculateGlowIntensity = useCallback((baseIntensity) => {
    return 0.2 + (baseIntensity / 100) * 2.8;
  }, []);

  useEffect(() => {
    if (episodes && episodes.length > 0) {
      console.log('Available episodes:', episodes);
      
      const qualities = Object.keys(episodes[0].hls).filter(q => episodes[0].hls[q]);
      console.log('Available qualities:', qualities);
      setAvailableQualities(qualities);
      
      setSelectedEpisode(episodes[0]);
      setSelectedQuality(qualities[0] || '');
    }
  }, [episodes]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const updateGlow = () => {
      if (video && !video.paused && !video.ended && isGlowEnabled) {
        canvas.width = video.videoWidth / 20;
        canvas.height = video.videoHeight / 20;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const length = frame.data.length;
        let r = 0, g = 0, b = 0;

        for (let i = 0; i < length; i += 4) {
          r += frame.data[i];
          g += frame.data[i + 1];
          b += frame.data[i + 2];
        }

        r = Math.floor(r / (length / 4));
        g = Math.floor(g / (length / 4));
        b = Math.floor(b / (length / 4));

        const brightnessBoost = calculateGlowIntensity(glowIntensity);
        r = Math.min(255, r * brightnessBoost);
        g = Math.min(255, g * brightnessBoost);
        b = Math.min(255, b * brightnessBoost);

        const newBoxShadow = `
          0 0 ${50 * brightnessBoost}px ${20 * brightnessBoost}px rgba(${r}, ${g}, ${b}, 0.8),
          0 0 ${100 * brightnessBoost}px ${40 * brightnessBoost}px rgba(${r}, ${g}, ${b}, 0.4),
          0 0 ${150 * brightnessBoost}px ${60 * brightnessBoost}px rgba(${r}, ${g}, ${b}, 0.2)
        `;
        setBoxShadow(newBoxShadow);
        glowAnimationRef.current = requestAnimationFrame(updateGlow);
      } else {
        setBoxShadow('');
        if (glowAnimationRef.current) {
          cancelAnimationFrame(glowAnimationRef.current);
        }
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (isGlowEnabled) {
        updateGlow();
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (glowAnimationRef.current) {
        cancelAnimationFrame(glowAnimationRef.current);
      }
      if (!isGlowEnabled) {
        setBoxShadow('');
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Запускаем эффект сразу, если видео уже воспроизводится
    if (!video.paused && isGlowEnabled) {
      updateGlow();
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      if (glowAnimationRef.current) {
        cancelAnimationFrame(glowAnimationRef.current);
      }
    };
  }, [isGlowEnabled, glowIntensity]);

  useEffect(() => {
    if (!selectedEpisode || !selectedQuality) return;

    const video = videoRef.current;
    if (!video) return;

    console.log('Selected episode:', selectedEpisode);
    console.log('Selected quality:', selectedQuality);

    const hlsUrl = selectedEpisode.hls[selectedQuality];
    if (!hlsUrl) {
      console.error('No HLS URL available for selected quality');
      setError('Выбранное качество недоступно');
      return;
    }

    setLoading(true);
    setError(null);
    setIsPlaying(false);

    console.log('HLS URL:', hlsUrl);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
        enableWorker: true,
        maxLoadingDelay: 4,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 500,
      });
      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log('HLS error:', data);
        if (data.fatal) {
          setError('Ошибка загрузки видео. Попробуйте другое качество или эпизод.');
          console.log('Fatal network error encountered, trying to recover...');
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
      });
    }
  }, [selectedEpisode, selectedQuality]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!episodes || episodes.length === 0) {
    return (
      <Typography variant="body1" align="center">
        Эпизоды не найдены
      </Typography>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      backgroundColor: 'transparent',
      overflow: 'visible'
    }}>
      <VideoContainer boxShadow={boxShadow}>
        <Box
          onMouseMove={handleMouseMove}
          onMouseLeave={() => !videoRef.current?.paused && setShowControls(false)}
          sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}
        >
          <video
            ref={videoRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '10px',
            }}
            onClick={handlePlayPause}
            onTimeUpdate={handleTimeUpdate}
          />
          
          {/* Controls overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              padding: '20px',
              transition: 'opacity 0.3s ease',
              opacity: showControls ? 1 : 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {/* Top controls row */}
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              <IconButton onClick={handlePrevEpisode} disabled={!episodes?.length} sx={{ color: 'white' }}>
                <SkipPrevious />
              </IconButton>

              <IconButton onClick={handleNextEpisode} disabled={!episodes?.length} sx={{ color: 'white' }}>
                <SkipNext />
              </IconButton>
              
              <IconButton onClick={handleMute} sx={{ color: 'white' }}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              
              <Slider
                size="small"
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                sx={{ width: 100 }}
              />

              <Box sx={{ flexGrow: 1 }} />

              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <Select
                  value={selectedEpisode?.episode || ''}
                  onChange={handleEpisodeChange}
                  sx={{
                    color: 'white',
                    '.MuiSelect-icon': { color: 'white' },
                    '&:before': { borderColor: 'white' },
                    '&:after': { borderColor: theme.palette.primary.main },
                  }}
                >
                  {episodes?.map((ep) => (
                    <MenuItem key={ep.episode} value={ep.episode}>
                      Эпизод {ep.episode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <Select
                  value={selectedQuality}
                  onChange={handleQualityChange}
                  sx={{
                    color: 'white',
                    '.MuiSelect-icon': { color: 'white' },
                    '&:before': { borderColor: 'white' },
                    '&:after': { borderColor: theme.palette.primary.main },
                  }}
                >
                  {availableQualities.map((quality) => (
                    <MenuItem key={quality} value={quality}>
                      {quality === 'fhd' ? '1080p' : quality === 'hd' ? '720p' : '480p'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ position: 'relative' }}>
                <Tooltip title={isGlowEnabled ? "Выключить эффект свечения" : "Включить эффект свечения"}>
                  <GlowButton
                    onClick={handleGlowToggle}
                    isActive={isGlowEnabled}
                    onMouseEnter={() => setShowGlowSlider(true)}
                    onMouseLeave={() => setShowGlowSlider(false)}
                  >
                    {isGlowEnabled ? <Lightbulb /> : <LightbulbOutlined />}
                  </GlowButton>
                </Tooltip>
                
                {showGlowSlider && isGlowEnabled && (
                  <GlowIntensitySlider
                    onMouseEnter={() => setShowGlowSlider(true)}
                    onMouseLeave={() => setShowGlowSlider(false)}
                  >
                    <Typography className="intensity-label">
                      Свечение
                    </Typography>
                    <Slider
                      orientation="vertical"
                      value={glowIntensity}
                      onChange={handleGlowIntensityChange}
                      min={0}
                      max={100}
                    />
                  </GlowIntensitySlider>
                )}
              </Box>

              <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
                <Fullscreen />
              </IconButton>
            </Stack>

            {/* Progress bar */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ color: 'white' }}>
                {formatTime(currentTime)}
              </Typography>
              
              <Slider
                size="small"
                value={currentTime}
                onChange={handleTimeSliderChange}
                min={0}
                max={duration}
                sx={{ flexGrow: 1 }}
              />
              
              <Typography variant="body2" sx={{ color: 'white' }}>
                {formatTime(duration)}
              </Typography>
            </Stack>
          </Box>

          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
              }}
            >
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          )}

          {error && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'error.main',
                textAlign: 'center',
                zIndex: 2,
              }}
            >
              <Typography variant="h6">{error}</Typography>
            </Box>
          )}
        </Box>
      </VideoContainer>
    </Box>
  );
};

export default EpisodePlayer;
