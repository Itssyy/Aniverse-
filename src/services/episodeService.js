import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const getAnimeInfo = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/anime/${id}`);
    return {
      id: response.data.id,
      title: response.data.russian || response.data.name,
      description: response.data.description,
      status: response.data.status,
      type: response.data.kind,
      episodes: response.data.episodes || 0,
      poster: `https://shikimori.one${response.data.image.original}`,
      rating: response.data.score,
      year: response.data.aired_on?.split('-')[0],
      genres: response.data.genres.map(g => g.name),
      external_links: response.data.external_links
    };
  } catch (error) {
    console.error('Error fetching anime info:', error);
    throw new Error(`Failed to fetch anime info: ${error.response?.status} ${error.response?.statusText}`);
  }
};

const searchAnime = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/anime/search/${encodeURIComponent(query)}`);
    return response.data.map(anime => ({
      id: anime.id,
      title: anime.russian || anime.name,
      description: anime.description,
      status: anime.status,
      type: anime.kind,
      episodes: anime.episodes || 0,
      poster: `https://shikimori.one${anime.image.preview}`,
      rating: anime.score,
      year: anime.aired_on?.split('-')[0]
    }));
  } catch (error) {
    console.error('Error searching anime:', error);
    throw new Error('Failed to search anime');
  }
};

const getUpdates = async (page = 1) => {
  try {
    const response = await axios.get(`${API_URL}/anime/updates/${page}`);
    return response.data.map(anime => ({
      id: anime.id,
      title: anime.russian || anime.name,
      description: anime.description,
      status: anime.status,
      type: anime.kind,
      episodes: anime.episodes || 0,
      poster: `https://shikimori.one${anime.image.preview}`,
      rating: anime.score,
      year: anime.aired_on?.split('-')[0]
    }));
  } catch (error) {
    console.error('Error fetching updates:', error);
    throw new Error('Failed to fetch updates');
  }
};

const getRandomAnime = async () => {
  try {
    const response = await axios.get(`${API_URL}/anime/random`);
    return {
      id: response.data.id,
      title: response.data.russian || response.data.name,
      description: response.data.description,
      status: response.data.status,
      type: response.data.kind,
      episodes: response.data.episodes || 0,
      poster: `https://shikimori.one${response.data.image.original}`,
      rating: response.data.score,
      year: response.data.aired_on?.split('-')[0],
      genres: response.data.genres.map(g => g.name)
    };
  } catch (error) {
    console.error('Error fetching random anime:', error);
    throw new Error('Failed to fetch random anime');
  }
};

export const getEpisodes = async (animeId) => {
  try {
    const response = await axios.get(`${API_URL}/anime/${animeId}/episodes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    throw error;
  }
};

export {
  getAnimeInfo,
  searchAnime,
  getUpdates,
  getRandomAnime,
  getEpisodes
};
