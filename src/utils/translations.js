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
  'TV': 'ТВ Сериал',
  'Movie': 'Фильм',
  'OVA': 'OVA',
  'ONA': 'ONA',
  'Special': 'Спешл',
  'Music': 'Клип'
};

// Словарь для перевода рейтингов
const ratingTranslations = {
  'G - All Ages': 'Для всех возрастов',
  'PG - Children': 'Детское',
  'PG-13 - Teens 13 or older': '13+',
  'R - 17+ (violence & profanity)': '17+',
  'R+ - Mild Nudity': '17+ (лёгкая обнажёнка)',
  'Rx - Hentai': 'Хентай'
};

const typeTranslations = {
  'TV': 'ТВ Сериал',
  'Movie': 'Фильм',
  'OVA': 'OVA',
  'ONA': 'ONA'
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

// Функция для перевода рейтинга
export const translateRating = (rating) => {
  return ratingTranslations[rating] || rating;
};

// Функция для перевода типа
export const translateType = (type) => {
  return typeTranslations[type] || type;
};
