// Словарь для перевода жанров
const genreTranslations = {
  'Action': 'Экшен',
  'Adventure': 'Приключения',
  'Comedy': 'Комедия',
  'Drama': 'Драма',
  'Fantasy': 'Фэнтези',
  'Horror': 'Ужасы',
  'Mystery': 'Детектив',
  'Romance': 'Романтика',
  'Sci-Fi': 'Научная фантастика',
  'Slice of Life': 'Повседневность',
  'Sports': 'Спорт',
  'Supernatural': 'Сверхъестественное',
  'Thriller': 'Триллер',
  'Seinen': 'Сейнен',
  'Shounen': 'Сёнен',
  'Shoujo': 'Сёдзё',
  'Mecha': 'Меха',
  'Music': 'Музыка',
  'Psychological': 'Психологическое',
  'School': 'Школа',
};

// Словарь для перевода сезонов
const seasonTranslations = {
  'winter': 'Зима',
  'spring': 'Весна',
  'summer': 'Лето',
  'fall': 'Осень',
};

// Словарь для перевода статусов
const statusTranslations = {
  'Currently Airing': 'Онгоинг',
  'Finished Airing': 'Завершён',
  'Not yet aired': 'Анонс',
};

// Функция для перевода жанра
export const translateGenre = (genre) => {
  return genreTranslations[genre] || genre;
};

// Функция для перевода списка жанров
export const translateGenres = (genres) => {
  if (!genres) return [];
  return genres.map(genre => translateGenre(genre));
};

// Функция для перевода сезона
export const translateSeason = (season) => {
  return seasonTranslations[season?.toLowerCase()] || season;
};

// Функция для форматирования сезона и года
export const formatSeasonYear = (season, year) => {
  const translatedSeason = translateSeason(season);
  return year ? `${translatedSeason} ${year}` : 'TBA';
};

// Функция для перевода статуса
export const translateStatus = (status) => {
  return statusTranslations[status] || status;
};
