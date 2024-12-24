import axios from 'axios';
import translateText from './translationService';

const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';
const RATE_LIMIT_DELAY = 1000; // Уменьшаем до 1 секунды
const ANILIBRIA_API_URL = 'https://api.anilibria.tv/v2';

// Кэш для хранения результатов запросов
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // Увеличиваем время кэширования до 1 часа
const PREFETCH_LIMIT = 6; // Лимит для предварительной загрузки

// Локальное хранилище
const LOCAL_STORAGE_KEY = 'animeCache';
const LOCAL_STORAGE_VERSION = '1.0';

// Добавляем резервные изображения для каждого жанра
const genreBackupImages = {
  'Action': [
    'https://cdn.myanimelist.net/images/anime/1908/135431.jpg', // Demon Slayer
    'https://cdn.myanimelist.net/images/anime/1286/99889.jpg', // Sword Art Online
    'https://cdn.myanimelist.net/images/anime/5/87048.jpg'  // Attack on Titan
  ],
  'Romance': [
    'https://cdn.myanimelist.net/images/anime/1441/122795.jpg', // Your Name
    'https://cdn.myanimelist.net/images/anime/13/17405.jpg',    // Toradora
    'https://cdn.myanimelist.net/images/anime/1822/122469.jpg'  // Horimiya
  ],
  'Fantasy': [
    'https://cdn.myanimelist.net/images/anime/1170/124312.jpg', // SAO Progressive
    'https://cdn.myanimelist.net/images/anime/1298/134198.jpg', // Re:Zero
    'https://cdn.myanimelist.net/images/anime/1152/136632.jpg'  // Mushoku Tensei
  ],
  'Comedy': [
    'https://cdn.myanimelist.net/images/anime/12/76049.jpg',    // One Punch Man
    'https://cdn.myanimelist.net/images/anime/1517/100633.jpg', // Kaguya-sama
    'https://cdn.myanimelist.net/images/anime/1618/134679.jpg'  // Spy x Family
  ],
  'Drama': [
    'https://cdn.myanimelist.net/images/anime/1404/134655.jpg', // Your Lie in April
    'https://cdn.myanimelist.net/images/anime/13/22128.jpg',    // Clannad: After Story
    'https://cdn.myanimelist.net/images/anime/1375/121599.jpg'  // Violet Evergarden
  ],
  'Supernatural': [
    'https://cdn.myanimelist.net/images/anime/1079/138100.jpg', // Death Note
    'https://cdn.myanimelist.net/images/anime/10/78745.jpg',    // Noragami
    'https://cdn.myanimelist.net/images/anime/11/39717.jpg'     // Mob Psycho 100
  ],
  'Slice of Life': [
    'https://cdn.myanimelist.net/images/anime/1935/127974.jpg', // Yuru Camp
    'https://cdn.myanimelist.net/images/anime/1958/138622.jpg', // Frieren
    'https://cdn.myanimelist.net/images/anime/1804/95033.jpg'   // A Silent Voice
  ],
  'Adventure': [
    'https://cdn.myanimelist.net/images/anime/1337/99013.jpg',  // Made in Abyss
    'https://cdn.myanimelist.net/images/anime/6/73245.jpg',     // One Piece
    'https://cdn.myanimelist.net/images/anime/1171/109222.jpg'  // Hunter x Hunter
  ]
};

// Функция для проверки доступности изображения
const checkImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Функция для получения рабочего URL изображения
const getWorkingImageUrl = async (genre) => {
  const backupUrls = genreBackupImages[genre.name];
  if (!backupUrls) return null;

  for (const url of backupUrls) {
    const isWorking = await checkImage(url);
    if (isWorking) return url;
  }

  // Если ни одно изображение не работает, возвращаем последнее
  return backupUrls[backupUrls.length - 1];
};

// Загрузка кэша из localStorage при инициализации
const loadCacheFromStorage = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const { version, data, timestamp } = JSON.parse(stored);
      if (version === LOCAL_STORAGE_VERSION && Date.now() - timestamp < CACHE_DURATION) {
        Object.entries(data).forEach(([key, value]) => {
          cache.set(key, { data: value, timestamp });
        });
      }
    }
  } catch (error) {
    console.warn('Error loading cache from storage:', error);
  }
};

// Сохранение кэша в localStorage
const saveCacheToStorage = () => {
  try {
    const data = {};
    cache.forEach((value, key) => {
      data[key] = value.data;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      version: LOCAL_STORAGE_VERSION,
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Error saving cache to storage:', error);
  }
};

// Загружаем кэш при инициализации
loadCacheFromStorage();

// Периодически сохраняем кэш
setInterval(saveCacheToStorage, 5 * 60 * 1000); // Каждые 5 минут

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

const popularGenres = [
  {
    name: 'Action',
    count: 2500,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1908/135431.jpg'
  },
  {
    name: 'Romance',
    count: 1800,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg'
  },
  {
    name: 'Fantasy',
    count: 2200,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1170/124312.jpg'
  },
  {
    name: 'Comedy',
    count: 2000,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/12/76049.jpg'
  },
  {
    name: 'Drama',
    count: 1900,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1404/134655.jpg'
  },
  {
    name: 'Supernatural',
    count: 1600,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1079/138100.jpg'
  },
  {
    name: 'Slice of Life',
    count: 1400,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg'
  },
  {
    name: 'Adventure',
    count: 1700,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg'
  }
];

const animeService = {
  // Инициализация сервиса и загрузка начальных данных
  async initialize() {
    if (isInitialized || initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      try {
        // Загружаем основные данные параллельно
        const [topAnimeResponse, currentSeasonResponse, genresResponse] = await Promise.all([
          this.makeRequest('/top/anime?limit=24'),
          this.makeRequest('/seasons/now?limit=24'),
          this.makeRequest('/genres/anime')
        ]);

        // Обрабатываем полученные данные
        initialData.topAnime = topAnimeResponse.data.map(this.formatAnimeData);
        initialData.currentSeason = currentSeasonResponse.data
          .filter(anime => anime.score)
          .sort((a, b) => b.score - a.score)
          .slice(0, 24)
          .map(this.formatAnimeData);
        initialData.popularGenres = genresResponse.data
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
          .map(genre => ({
            id: genre.mal_id,
            name: genre.name,
            description: `${genre.count} аниме`,
            examples: []
          }));

        // Предварительно загружаем дополнительные данные в фоновом режиме
        this.prefetchAdditionalData();

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
  },

  async getTopAnime(limit = 24) {
    try {
      if (!isInitialized) {
        await this.initialize();
      }
      const response = await this.makeRequest('/top/anime');
      if (!response || !response.data) {
        return [];
      }
      const results = response.data
        .slice(0, limit)
        .map(anime => this.formatAnimeData(anime));
      return results;
    } catch (error) {
      console.error('Error fetching top anime:', error);
      return [];
    }
  },

  async getSeasonalAnime(seasonYear, limit = 24) {
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

  // Функция для транслитерации русского тек��та в английский
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

  async getPopularGenres() {
    try {
      // Проверяем и обновляем URL изображений для каждого жанра
      const genresWithCheckedImages = await Promise.all(
        popularGenres.map(async (genre) => {
          const isMainImageWorking = await checkImage(genre.imageUrl);
          if (!isMainImageWorking) {
            // Если основное изображение не работает, ищем рабочее из резервных
            const workingUrl = await getWorkingImageUrl(genre);
            return { ...genre, imageUrl: workingUrl || genre.imageUrl };
          }
          return genre;
        })
      );

      return genresWithCheckedImages;
    } catch (error) {
      console.error('Error fetching popular genres:', error);
      return popularGenres; // Возвращаем оригинальные жанры в случае ошибки
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
  },

  // Предварительная загрузка дополнительных данных
  async prefetchAdditionalData() {
    try {
      const seasons = this.getSeasons();
      const prefetchPromises = [
        this.getSeasonalAnime(seasons.previous, PREFETCH_LIMIT),
        this.getLatestUpdates(PREFETCH_LIMIT),
        ...initialData.popularGenres.slice(0, 3).map(genre =>
          this.makeRequest(`/anime?genres=${genre.id}&order_by=score&sort=desc&limit=3`)
        )
      ];

      // Загружаем данные в фоновом режиме
      Promise.all(prefetchPromises).catch(error => {
        console.warn('Error prefetching additional data:', error);
      });
    } catch (error) {
      console.warn('Error in prefetch:', error);
    }
  }
};

// Запускаем очистку кэша
animeService.startCacheCleanup();

export default animeService;
