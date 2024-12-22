import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Конфигурация Jikan API
const JIKAN_API = 'https://api.jikan.moe/v4';
const jikanClient = axios.create({
  baseURL: JIKAN_API,
  timeout: 10000,
  headers: {
    'Accept': 'application/json'
  }
});

// Обработка ошибок
const handleError = (error, res) => {
  console.error('API Error:', error.response?.data || error.message);
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || error.message;
  res.status(status).json({ error: message });
};

// Получение популярных аниме
app.get('/api/anime/popular', async (req, res) => {
  try {
    const response = await jikanClient.get('/top/anime', {
      params: { filter: 'bypopularity', limit: 20 }
    });
    
    const animeList = response.data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english,
      image: anime.images.jpg.large_image_url,
      score: anime.score,
      year: anime.year,
      season: anime.season,
      episodes: anime.episodes,
      status: anime.status,
      genres: anime.genres.map(g => g.name)
    }));

    res.json(animeList);
  } catch (error) {
    handleError(error, res);
  }
});

// Поиск аниме
app.get('/api/anime/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await jikanClient.get('/anime', {
      params: { q, limit: 20 }
    });

    const animeList = response.data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english,
      image: anime.images.jpg.large_image_url,
      score: anime.score,
      year: anime.year,
      season: anime.season,
      episodes: anime.episodes,
      status: anime.status,
      genres: anime.genres.map(g => g.name)
    }));

    res.json(animeList);
  } catch (error) {
    handleError(error, res);
  }
});

// Получение информации об аниме по ID
app.get('/api/anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Добавляем задержку между запросами, чтобы не превысить лимит API
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // Получаем основную информацию
    const animeResponse = await jikanClient.get(`/anime/${id}/full`);
    await delay(1000); // Ждем секунду перед следующим запросом
    
    // Получаем информацию о персонажах
    const charactersResponse = await jikanClient.get(`/anime/${id}/characters`);
    
    const anime = animeResponse.data.data;
    const characters = charactersResponse.data.data;

    const animeData = {
      id: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english,
      image: anime.images?.jpg?.large_image_url,
      synopsis: anime.synopsis,
      score: anime.score,
      scored_by: anime.scored_by,
      rank: anime.rank,
      popularity: anime.popularity,
      status: anime.status,
      airing: anime.airing,
      aired: {
        from: anime.aired?.from,
        to: anime.aired?.to
      },
      episodes: anime.episodes,
      duration: anime.duration,
      rating: anime.rating,
      season: anime.season,
      year: anime.year,
      studios: anime.studios?.map(s => s.name) || [],
      genres: anime.genres?.map(g => g.name) || [],
      themes: anime.themes?.map(t => t.name) || [],
      trailer: anime.trailer ? {
        youtube_id: anime.trailer.youtube_id,
        url: anime.trailer.url,
        image: anime.trailer.images?.maximum_image_url
      } : null,
      characters: characters.slice(0, 10).map(char => ({
        id: char.character.mal_id,
        name: char.character.name,
        image: char.character.images?.jpg?.image_url,
        role: char.role
      }))
    };

    res.json(animeData);
  } catch (error) {
    console.error('Error fetching anime:', error.response?.data || error.message);
    handleError(error, res);
  }
});

// Получение рекомендаций с обработкой ошибок
app.get('/api/anime/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await jikanClient.get(`/anime/${id}/recommendations`);
    
    if (!response.data || !response.data.data) {
      return res.json([]); // Возвращаем пустой массив, если нет рекомендаций
    }
    
    const recommendations = response.data.data.map(rec => ({
      id: rec.entry.mal_id,
      title: rec.entry.title,
      image: rec.entry.images?.jpg?.large_image_url,
      votes: rec.votes
    })).filter(rec => rec.image); // Фильтруем записи без изображений

    res.json(recommendations.slice(0, 10));
  } catch (error) {
    console.error('Error fetching recommendations:', error.response?.data || error.message);
    // В случае ошибки возвращаем пустой массив вместо ошибки
    res.json([]);
  }
});

// Обслуживание React приложения
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
