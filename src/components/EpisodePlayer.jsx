import React, { useEffect, useRef, useState } from 'react';
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
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';

const EpisodePlayer = ({ episodes }) => {
  const theme = useTheme();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
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
  const controlsTimeoutRef = useRef(null);

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

  const handleEpisodeChange = (event) => {
    const episode = episodes.find(ep => ep.episode === event.target.value);
    setSelectedEpisode(episode);
  };

  const handleQualityChange = (event) => {
    setSelectedQuality(event.target.value);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    }
  };

  const handlePrevEpisode = () => {
    const currentIndex = episodes.findIndex(ep => ep.episode === selectedEpisode.episode);
    if (currentIndex > 0) {
      setSelectedEpisode(episodes[currentIndex - 1]);
    }
  };

  const handleNextEpisode = () => {
    const currentIndex = episodes.findIndex(ep => ep.episode === selectedEpisode.episode);
    if (currentIndex < episodes.length - 1) {
      setSelectedEpisode(episodes[currentIndex + 1]);
    }
  };

  const handleTimeSliderChange = (event, newValue) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const video = videoRef.current;
    if (video) {
      video.volume = newValue;
      setVolume(newValue);
      setIsMuted(newValue === 0);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!videoRef.current?.paused) {
        setShowControls(false);
      }
    }, 3000);
  };

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
    <Paper
      elevation={24}
      sx={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: '12px',
        overflow: 'hidden',
        '&:hover': {
          '& .controls-overlay': {
            opacity: 1,
          },
        },
      }}
    >
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
            borderRadius: '12px',
          }}
          onTimeUpdate={handleTimeUpdate}
        />

        {/* Overlay с элементами управления */}
        <Box
          className="controls-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%, rgba(0,0,0,0.7) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '20px',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1,
          }}
        >
          {/* Слайдер времени */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <Slider
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleTimeSliderChange}
              sx={{
                color: theme.palette.primary.main,
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 8,
                  height: 8,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                    width: 12,
                    height: 12,
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.28,
                },
              }}
            />
          </Box>

          {/* Нижняя панель управления */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              width: '100%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
              borderRadius: '8px',
              padding: '8px',
            }}
          >
            <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton onClick={handlePrevEpisode} disabled={!episodes?.length} sx={{ color: 'white' }}>
              <SkipPrevious />
            </IconButton>

            <IconButton onClick={handleNextEpisode} disabled={!episodes?.length} sx={{ color: 'white' }}>
              <SkipNext />
            </IconButton>

            <Box sx={{ width: 100, mx: 1 }}>
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                sx={{
                  color: theme.palette.primary.main,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  },
                }}
              />
            </Box>

            <IconButton onClick={handleMute} sx={{ color: 'white' }}>
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>

            <Typography sx={{ color: 'white', flex: 1, textAlign: 'center' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

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

            <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
              <Fullscreen />
            </IconButton>
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
    </Paper>
  );
};

export default EpisodePlayer;
