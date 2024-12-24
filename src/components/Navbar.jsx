import React, { useState } from 'react';
import { AppBar, Toolbar, Box, useTheme, Button, InputBase, IconButton } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Update, History, Star, Search, Clear } from '@mui/icons-material';

const NavButton = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Button
      component={Link}
      to={to}
      startIcon={<Icon />}
      sx={{
        color: isActive ? '#FF10F0' : 'rgba(255,255,255,0.7)',
        fontSize: '0.95rem',
        fontWeight: '500',
        letterSpacing: '1px',
        padding: '8px 16px',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        background: isActive ? 'rgba(255,16,240,0.1)' : 'transparent',
        backdropFilter: 'blur(8px)',
        textTransform: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, #FF10F0, #00FFFF)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover': {
          color: '#fff',
          background: 'rgba(255,16,240,0.15)',
          transform: 'translateY(-2px)',
          boxShadow: isActive 
            ? '0 0 20px rgba(255,16,240,0.3), inset 0 0 10px rgba(255,16,240,0.2)'
            : 'none',
          '&::before': {
            opacity: 0.1,
          },
        },
        '& .MuiButton-startIcon': {
          color: isActive ? '#FF10F0' : 'rgba(255,255,255,0.7)',
          transition: 'all 0.3s ease',
        },
        '&:hover .MuiButton-startIcon': {
          color: isActive ? '#FF10F0' : '#00FFFF',
          transform: 'scale(1.1)',
        },
      }}
    >
      {label}
    </Button>
  );
};

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchValue('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        position: 'relative',
        borderRadius: '20px',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid',
        borderColor: isFocused ? 'rgba(255,16,240,0.5)' : 'rgba(255,255,255,0.1)',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        width: '300px',
        transition: 'all 0.3s ease',
        boxShadow: isFocused 
          ? '0 0 15px rgba(255,16,240,0.2), inset 0 0 10px rgba(255,16,240,0.1)'
          : 'none',
        '&:hover': {
          borderColor: 'rgba(255,16,240,0.3)',
          boxShadow: '0 0 10px rgba(255,16,240,0.1)',
        },
      }}
    >
      <IconButton 
        type="submit"
        sx={{ 
          p: '6px',
          color: isFocused ? '#FF10F0' : 'rgba(255,255,255,0.7)',
          transition: 'all 0.3s ease',
        }}
      >
        <Search />
      </IconButton>
      <InputBase
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Поиск аниме..."
        sx={{
          ml: 1,
          flex: 1,
          color: '#fff',
          '& .MuiInputBase-input': {
            padding: '6px 0',
            '&::placeholder': {
              color: 'rgba(255,255,255,0.5)',
              opacity: 1,
            },
          },
        }}
      />
      {searchValue && (
        <IconButton
          onClick={handleClear}
          sx={{
            p: '6px',
            color: 'rgba(255,255,255,0.5)',
            '&:hover': {
              color: '#FF10F0',
            },
          }}
        >
          <Clear />
        </IconButton>
      )}
    </Box>
  );
};

const Navbar = () => {
  const theme = useTheme();

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'rgba(17, 25, 40, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255,255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing(1, 3),
          gap: 2,
        }}
      >
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              fontFamily: '"Zen Tokyo Zoo", sans-serif',
              background: 'linear-gradient(45deg, #FF10F0, #00FFFF)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 3s ease infinite',
              display: 'inline-block',
              letterSpacing: '2px',
              position: 'relative',
              padding: '0 5px',
              '@keyframes gradient': {
                '0%': {
                  backgroundPosition: '0% center',
                  textShadow: '0 0 10px #FF10F0',
                },
                '50%': {
                  backgroundPosition: '100% center',
                  textShadow: '0 0 20px #00FFFF',
                },
                '100%': {
                  backgroundPosition: '0% center',
                  textShadow: '0 0 10px #FF10F0',
                },
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '100%',
                width: '100%',
                left: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #FF10F0, #00FFFF, transparent)',
                transform: 'scaleX(0)',
                transition: 'transform 0.3s ease',
              },
              '&:hover': {
                '&::before': {
                  transform: 'scaleX(1)',
                },
              },
            }}
          >
            ANIVERSE
          </Box>
        </Link>

        <SearchBar />

        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1,
            background: 'rgba(0,0,0,0.2)',
            padding: '4px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <NavButton to="/" icon={Home} label="Главная" />
          <NavButton to="/list/current" icon={Update} label="Текущий сезон" />
          <NavButton to="/list/previous" icon={History} label="Прошлый сезон" />
          <NavButton to="/list/top" icon={Star} label="Топ аниме" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
