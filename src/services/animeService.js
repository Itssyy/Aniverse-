import axios from 'axios';
import translateText from './translationService';

const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';
const RATE_LIMIT_DELAY = 4000; // Увеличиваем задержку до 4 секунд
const ANILIBRIA_API_URL = 'https://api.anilibria.tv/v2';

// Кэш для хранения результатов запросов
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // Увеличиваем время кэширования до 30 минут

// Очередь запросов
let requestQueue = Promise.resolve();
let lastRequestTime = 0;

// Флаг инициализации
let isInitialized = false;
let initializationPromise = null;

// Начальные данные
let initialData = {
  topAnime: null,
  currentSeason: null,
  popularGenres: null
};

const api = axios.create({
  baseURL: JIKAN_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Функция для проверки и очистки устаревшего кэша
const cleanCache = () => {
  const now = Date.now();
  for (const [key, { timestamp }] of cache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
};

// Функция для получения данных из кэша
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Функция для сохранения данных в кэш
const setCacheData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const animeService = {
  // Инициализация сервиса и загрузка начальных данных
  async initialize() {
    if (isInitialized || initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      try {
        // Загружаем данные последовательно, чтобы избежать превышения лимита
        const topAnimeResponse = await this.makeRequest('/top/anime?limit=9');
        initialData.topAnime = topAnimeResponse.data.map(this.formatAnimeData);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

        const currentSeasonResponse = await this.makeRequest('/seasons/now?limit=9');
        initialData.currentSeason = currentSeasonResponse.data
          .filter(anime => anime.score)
          .sort((a, b) => b.score - a.score)
          .slice(0, 9)
          .map(this.formatAnimeData);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

        // Загружаем только базовую информацию о жанрах
        const genresResponse = await this.makeRequest('/genres/anime');
        initialData.popularGenres = genresResponse.data
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
          .map(genre => ({
            id: genre.mal_id,
            name: genre.name,
            description: `${genre.count} аниме`,
            examples: [] // Примеры будем загружать по требованию
          }));

        isInitialized = true;
        return initialData;
      } catch (error) {
        console.error('Error initializing anime service:', error);
        throw error;
      }
    })();

    return initializationPromise;
  },

  async makeRequest(url, retries = 3) {
    const cacheKey = url;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
    }

    return new Promise((resolve, reject) => {
      requestQueue = requestQueue
        .then(async () => {
          try {
            lastRequestTime = Date.now();
            const response = await api.get(url);
            
            if (response.status === 429 && retries > 0) {
              console.log(`Rate limit hit, waiting ${RATE_LIMIT_DELAY * 2}ms before retry... (${retries} retries left)`);
              await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * 2));
              return this.makeRequest(url, retries - 1);
            }

            const data = response.data;
            setCacheData(cacheKey, data);
            return data;
          } catch (error) {
            if (error.response?.status === 429 && retries > 0) {
              console.log(`Rate limit hit, waiting ${RATE_LIMIT_DELAY * 2}ms before retry... (${retries} retries left)`);
              await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * 2));
              return this.makeRequest(url, retries - 1);
            }
            throw error;
          }
        })
        .then(resolve)
        .catch(reject);

      requestQueue = requestQueue.then(() => new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY)));
    });
  },

  async getTopAnime(limit = 9) {
    try {
      if (!isInitialized) {
        await this.initialize();
      }
      return initialData.topAnime || [];
    } catch (error) {
      console.error('Error fetching top anime:', error);
      return [];
    }
  },

  async getSeasonalAnime(seasonYear, limit = 9) {
    try {
      if (seasonYear === `${this.getCurrentSeason().season}-${this.getCurrentSeason().year}` && initialData.currentSeason) {
        return initialData.currentSeason;
      }

      const cacheKey = `seasonal_${seasonYear}_${limit}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      // Разбираем строку сезона
      const [season, year] = seasonYear.split('-');
      if (!season || !year || !['winter', 'spring', 'summer', 'fall'].includes(season.toLowerCase())) {
        throw new Error('Invalid season format');
      }

      // Формируем правильный URL для API
      const response = await this.makeRequest(`/seasons/${year}/${season.toLowerCase()}`);
      
      // Проверяем ответ
      if (!response || !response.data) {
        console.error('Invalid response format:', response);
        return [];
      }

      const results = response.data
        .filter(anime => anime && anime.score) // Проверяем каждый элемент
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(anime => this.formatAnimeData(anime));

      setCacheData(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error fetching seasonal anime:', error);
      if (error.response?.status === 400) {
        console.error('API Error:', error.response.data);
      }
      return [];
    }
  },

  getCurrentSeason() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    let season;
    if (month >= 1 && month <= 3) season = 'winter';
    else if (month >= 4 && month <= 6) season = 'spring';
    else if (month >= 7 && month <= 9) season = 'summer';
    else season = 'fall';

    return { season, year };
  },

  async getAnimeDetails(id) {
    return this.makeRequest(`/anime/${id}/full`);
  },

  // Функция для транслитерации русского текста в английский
  transliterate(text) {
    const ru = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      ' ': ' '
    };

    return text.toLowerCase().split('').map(char => ru[char] || char).join('');
  },

  async searchAnilibria(query) {
    try {
      const response = await fetch(`${ANILIBRIA_API_URL}/searchTitles?search=${encodeURIComponent(query)}&limit=50`);
      const data = await response.json();
      return data.map(item => ({
        russian: item.names.ru,
        english: item.names.en,
        romaji: item.names.alternative,
        id: item.id,
        // Сохраняем оригинальные названия для поиска соответствий
        originalTitles: [
          item.names.en,
          ...(item.names.alternative || []),
          item.names.ru
        ].filter(Boolean)
      }));
    } catch (error) {
      console.error('Error fetching from Anilibria:', error);
      return [];
    }
  },

  // Функция для поиска соответствия между MAL и Anilibria
  findMatchingTitle(malTitle, anilibriaResults) {
    if (!anilibriaResults || anilibriaResults.length === 0) return null;
    
    const normalizeTitle = (title) => {
      if (!title) return '';
      return title.toLowerCase()
        .replace(/[^a-zа-яё0-9\s]/gi, '') // Удаляем специальные символы
        .replace(/\s+/g, ' ') // Нормализуем пробелы
        .trim();
    };

    const malTitleNorm = normalizeTitle(malTitle);
    
    // Ищем точное совпадение
    const exactMatch = anilibriaResults.find(item => 
      item.originalTitles.some(title => normalizeTitle(title) === malTitleNorm)
    );
    
    if (exactMatch) return exactMatch;

    // Ищем частичное совпадение
    return anilibriaResults.find(item => 
      item.originalTitles.some(title => {
        const normTitle = normalizeTitle(title);
        return normTitle.includes(malTitleNorm) || malTitleNorm.includes(normTitle);
      })
    );
  },

  async searchAnime(query, page = 1) {
    try {
      const cacheKey = `search_${query}_${page}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const isRussian = /[а-яё]/i.test(query);
      let searchResults = [];
      let anilibriaResults = [];

      if (isRussian) {
        anilibriaResults = await this.searchAnilibria(query);
        
        if (anilibriaResults.length > 0) {
          // Берем только первые 3 результата для уменьшения количества запросов
          const promises = anilibriaResults
            .slice(0, 3)
            .map(async (result) => {
              const searchQuery = result.english || result.romaji?.[0] || result.russian;
              const response = await this.makeRequest(`/anime?q=${encodeURIComponent(searchQuery)}&limit=5&sfw=true`);
              return response.data || [];
            });

          const results = await Promise.all(promises);
          searchResults = results.flat();
        }

        if (searchResults.length < 5) {
          const transliteratedQuery = this.transliterate(query);
          const response = await this.makeRequest(`/anime?q=${encodeURIComponent(transliteratedQuery)}&page=${page}&limit=12&sfw=true`);
          searchResults = [...searchResults, ...(response.data || [])];
        }

        searchResults = Array.from(new Set(searchResults.map(a => a.mal_id)))
          .map(id => searchResults.find(a => a.mal_id === id));
      } else {
        const response = await this.makeRequest(`/anime?q=${encodeURIComponent(query)}&page=${page}&limit=12&sfw=true`);
        searchResults = response.data || [];
      }

      if (!Array.isArray(searchResults)) {
        throw new Error('Invalid response format');
      }

      // Форматируем результаты
      const formattedResults = await Promise.all(searchResults.map(async (anime) => {
        const formatted = {
          id: anime.mal_id,
          title: anime.title,
          title_japanese: anime.title_japanese,
          title_english: anime.title_english,
          image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          synopsis: anime.synopsis,
          score: anime.score,
          episodes: anime.episodes,
          status: anime.status,
          season: anime.season,
          year: anime.year,
          genres: anime.genres?.map(genre => genre.name) || [],
          studios: anime.studios?.map(studio => studio.name) || [],
          url: anime.url,
          rating: anime.rating,
          airing: anime.airing,
          duration: anime.duration,
          type: anime.type
        };

        // Если запрос был на русском, пытаемся найти русское название
        if (isRussian) {
          const match = this.findMatchingTitle(anime.title, anilibriaResults);
          if (match) {
            formatted.title_russian = match.russian;
          }
        }

        return formatted;
      }));

      // Улучшенная сортировка результатов
      const sortedResults = formattedResults.sort((a, b) => {
        const query_lower = query.toLowerCase();

        // Функция для проверки совпадения
        const checkMatch = (title) => {
          if (!title) return false;
          const title_lower = title.toLowerCase();
          return title_lower.includes(query_lower);
        };

        // Проверяем совпадения во всех вариантах названий
        const aMatches = [
          checkMatch(a.title),
          checkMatch(a.title_english),
          checkMatch(a.title_japanese),
          checkMatch(a.title_russian)
        ].filter(Boolean).length;

        const bMatches = [
          checkMatch(b.title),
          checkMatch(b.title_english),
          checkMatch(b.title_japanese),
          checkMatch(b.title_russian)
        ].filter(Boolean).length;

        // Сначала сортируем по количеству совпадений
        if (aMatches !== bMatches) {
          return bMatches - aMatches;
        }

        // Затем по рейтингу
        return (b.score || 0) - (a.score || 0);
      });

      const result = {
        results: sortedResults.slice(0, 12),
        total: searchResults.length,
        currentPage: page,
        lastPage: Math.ceil(searchResults.length / 12)
      };

      setCacheData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
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
      if (!isInitialized) {
        await this.initialize();
      }

      // Если примеры еще не загружены, загружаем их последовательно
      if (initialData.popularGenres && initialData.popularGenres[0].examples.length === 0) {
        for (const genre of initialData.popularGenres) {
          const animeResponse = await this.makeRequest(`/anime?genres=${genre.mal_id}&order_by=score&sort=desc&limit=3`);
          genre.examples = animeResponse.data.map(this.formatAnimeData);
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        }
      }

      return initialData.popularGenres || [];
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
  },

  // Очистка кэша каждые 5 минут
  startCacheCleanup() {
    setInterval(cleanCache, CACHE_DURATION);
  },

  getSeasons() {
    const { season, year } = this.getCurrentSeason();
    
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
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      synopsis: anime.synopsis,
      score: anime.score,
      episodes: anime.episodes,
      status: anime.status,
      season: anime.season,
      year: anime.year,
      genres: anime.genres?.map(genre => genre.name) || [],
      studios: anime.studios?.map(studio => studio.name) || [],
      url: anime.url,
      rating: anime.rating,
      airing: anime.airing,
      duration: anime.duration,
      type: anime.type
    };
  }
};

// Запускаем очистку кэша
animeService.startCacheCleanup();

export default animeService;
