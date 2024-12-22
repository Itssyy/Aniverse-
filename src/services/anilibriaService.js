import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

// Нормализация строки для поиска
const normalizeTitle = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .trim();
};

// Функция для проверки совпадения названий
const matchTitles = (searchTitle, targetTitle) => {
  if (!searchTitle || !targetTitle) return false;
  const normalizedSearch = normalizeTitle(searchTitle);
  const normalizedTarget = normalizeTitle(targetTitle);
  return normalizedTarget.includes(normalizedSearch) || normalizedSearch.includes(normalizedTarget);
};

const anilibriaService = {
  async searchAnime(searchTitle) {
    try {
      console.log('Original search title:', searchTitle);
      if (!searchTitle) {
        console.log('No search title provided');
        return null;
      }

      const normalizedSearchTitle = normalizeTitle(searchTitle);
      console.log('Normalized search title:', normalizedSearchTitle);

      // Используем поиск по названию
      const response = await axios.get(`${API_ENDPOINTS.ANILIBRIA_API}/title/search`, {
        params: {
          search: searchTitle,
          filter: 'id,names,player,torrents',
          limit: 10
        }
      });

      if (!response.data?.list?.length) {
        console.log('No results found from AniLibria API');
        return null;
      }

      console.log('AniLibria search results:', response.data.list);

      // Ищем точное совпадение
      const exactMatch = response.data.list.find(anime => {
        const names = [
          anime.names?.ru,
          anime.names?.en,
          ...(anime.names?.alternative || [])
        ].filter(Boolean);

        return names.some(name => matchTitles(searchTitle, name));
      });

      if (exactMatch) {
        // Преобразуем URL для видео
        if (exactMatch.player?.list) {
          Object.keys(exactMatch.player.list).forEach(episodeNum => {
            const episode = exactMatch.player.list[episodeNum];
            if (episode.hls) {
              Object.keys(episode.hls).forEach(quality => {
                if (episode.hls[quality]) {
                  // Используем CDN URL для видео
                  episode.hls[quality] = `https://cache.libria.fun${episode.hls[quality]}`;
                }
              });
            }
          });
        }
        
        console.log('Found exact match:', exactMatch);
        return [exactMatch];
      }

      // Если точного совпадения нет, возвращаем первый результат с преобразованными URL
      const firstResult = response.data.list[0];
      if (firstResult?.player?.list) {
        Object.keys(firstResult.player.list).forEach(episodeNum => {
          const episode = firstResult.player.list[episodeNum];
          if (episode.hls) {
            Object.keys(episode.hls).forEach(quality => {
              if (episode.hls[quality]) {
                // Используем CDN URL для видео
                episode.hls[quality] = `https://cache.libria.fun${episode.hls[quality]}`;
              }
            });
          }
        });
      }
      
      console.log('No exact match found, returning first result');
      return [firstResult];

    } catch (error) {
      console.error('Error searching anime:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },

  // Получить информацию об аниме по ID
  getAnimeById: async (id) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.ANILIBRIA_API}/title`, {
        params: {
          id: id,
          filter: 'id,names,player'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting anime:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return null;
    }
  },
};

export default anilibriaService;
