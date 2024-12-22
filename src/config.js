// API configuration
export const API_BASE_URL = 'http://localhost:3001';

// API endpoints
export const API_ENDPOINTS = {
  // Anime endpoints
  ANIME: {
    POPULAR: `${API_BASE_URL}/api/anime/popular`,
    SEARCH: `${API_BASE_URL}/api/anime/search`,
    DETAILS: (id) => `${API_BASE_URL}/api/anime/${id}`,
    RECOMMENDATIONS: (id) => `${API_BASE_URL}/api/anime/${id}/recommendations`,
  }
};

// Other configuration
export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  IMAGE_FALLBACK: 'https://via.placeholder.com/225x350?text=No+Image',
  DEBOUNCE_DELAY: 300, // ms
};
