import axios from 'axios';
import translateText from './translationService';

const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests

// Очередь запросов
let requestQueue = Promise.resolve();

const api = axios.create({
  baseURL: JIKAN_API_BASE_URL,
  timeout: 30000, // Увеличиваем timeout до 30 секунд
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      console.log('Rate limit exceeded, retrying after delay...');
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(error.config));
        }, RATE_LIMIT_DELAY);
      });
    }
    return Promise.reject(error);
  }
);

const animeService = {
  async makeRequest(url, retries = 3) {
    // Добавляем запрос в очередь
    return new Promise((resolve, reject) => {
      requestQueue = requestQueue
        .then(() => api.get(url))
        .then(async (response) => {
          if (response.status === 429 && retries > 0) {
            console.log(`Rate limit hit, waiting ${RATE_LIMIT_DELAY}ms before retry... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
            return this.makeRequest(url, retries - 1);
          }
          return response.data;
        })
        .then(resolve)
        .catch(reject);

      // Добавляем задержку между запросами
      requestQueue = requestQueue.then(() => new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY)));
    });
  },

  getSeasons() {
    const now = new Date();
    const year = now.getFullYear();
    let season;
    const month = now.getMonth() + 1;

    if (month >= 1 && month <= 3) season = 'winter';
    else if (month >= 4 && month <= 6) season = 'spring';
    else if (month >= 7 && month <= 9) season = 'summer';
    else season = 'fall';

    let previousSeason;
    let previousYear = year;
    
    switch (season) {
      case 'winter':
        previousSeason = 'fall';
        previousYear = year - 1;
        break;
      case 'spring':
        previousSeason = 'winter';
        break;
      case 'summer':
        previousSeason = 'spring';
        break;
      case 'fall':
        previousSeason = 'summer';
        break;
    }

    return {
      current: `${season}-${year}`,
      previous: `${previousSeason}-${previousYear}`
    };
  },

  formatAnimeData(anime) {
    return {
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
      synopsis: anime.synopsis,
      score: anime.score,
      episodes: anime.episodes,
      status: anime.status,
      season: anime.season,
      year: anime.year,
      genres: anime.genres?.map(genre => genre.name) || [],
      studios: anime.studios?.map(studio => studio.name) || [],
      url: anime.url
    };
  },

  async getTopAnime(limit = 9) {
    try {
      const response = await this.makeRequest(`/top/anime?limit=${limit}`);
      return response.data.map(this.formatAnimeData);
    } catch (error) {
      console.error('Error fetching top anime:', error);
      throw error;
    }
  },

  async getSeasonalAnime(seasonYear, limit = 9) {
    try {
      const [season, year] = seasonYear.split('-');
      const response = await this.makeRequest(`/seasons/${year}/${season}?limit=${limit}`);
      
      return response.data
        .filter(anime => anime.score)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(this.formatAnimeData);
    } catch (error) {
      console.error('Error fetching seasonal anime:', error);
      throw error;
    }
  },

  async getCurrentSeason() {
    return this.makeRequest('/seasons/now', {
      params: {
        sfw: true,
        limit: 15
      }
    });
  },

  async getAnimeDetails(id) {
    return this.makeRequest(`/anime/${id}/full`);
  },

  async searchAnime(query) {
    return this.makeRequest('/anime', {
      params: {
        q: query,
        limit: 15,
        sfw: true
      }
    });
  },

  async getAnimeById(id) {
    try {
      const response = await this.makeRequest(`/anime/${id}/full`);
      return this.formatAnimeData(response.data);
    } catch (error) {
      console.error('Error fetching anime by ID:', error);
      return null;
    }
  },
  
  async getAnimeRecommendations(id) {
    try {
      const response = await this.makeRequest(`/anime/${id}/recommendations`);
      return response.data.map(rec => this.formatAnimeData(rec.entry));
    } catch (error) {
      console.error('Error fetching anime recommendations:', error);
      return [];
    }
  },

  async getLatestUpdates(limit = 6) {
    try {
      // Получаем текущий сезон и последние обновления
      const response = await this.makeRequest('/seasons/now');
      const animeList = response.data
        .sort((a, b) => new Date(b.aired?.from) - new Date(a.aired?.from))
        .slice(0, limit);
      
      return animeList.map(this.formatAnimeData);
    } catch (error) {
      console.error('Error fetching latest updates:', error);
      return [];
    }
  },

  async getPopularGenres(limit = 6) {
    try {
      // Получаем список жанров
      const response = await this.makeRequest('/genres/anime');
      const genres = response.data
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      // Для каждого жанра получаем примеры аниме
      const genresWithExamples = await Promise.all(
        genres.map(async (genre) => {
          const animeResponse = await this.makeRequest(`/anime?genres=${genre.mal_id}&order_by=score&sort=desc&limit=3`);
          return {
            id: genre.mal_id,
            name: genre.name,
            description: `${genre.count} аниме`,
            examples: animeResponse.data.map(this.formatAnimeData)
          };
        })
      );

      return genresWithExamples;
    } catch (error) {
      console.error('Error fetching popular genres:', error);
      return [];
    }
  },

  async getStatistics() {
    try {
      // В реальном приложении эти данные должны приходить с вашего бэкенда
      // Сейчас используем моковые данные
      return {
        totalAnime: 16800,    // Примерное количество аниме в базе данных MyAnimeList
        totalUsers: 25000,    // Моковое количество пользователей
        totalViews: 1500000   // Моковое количество просмотров
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalAnime: 0,
        totalUsers: 0,
        totalViews: 0
      };
    }
  }
};

export default animeService;
