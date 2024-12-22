// API endpoints configuration
const API_BASE_URL = 'http://localhost:3001';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export const API_ENDPOINTS = {
  JIKAN_API: JIKAN_BASE_URL,
  ANILIBRIA_API: 'https://api.anilibria.tv/v3',
  BASE_URL: API_BASE_URL,
  ANIME: {
    SEARCH: '/api/anime/search',
    DETAILS: (id) => `/api/anime/${id}`,
    EPISODES: (id) => `/api/anime/${id}/episodes`,
  }
};

// Axios configuration
export const axiosConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};