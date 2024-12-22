import axios from 'axios';

const translationService = {
  async translateText(text) {
    if (!text) return '';
    
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      // Google Translate возвращает массив переведенных частей текста
      // Собираем все части в одну строку
      const translatedText = data[0]
        .map(item => item[0])
        .filter(Boolean)
        .join(' ');
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }
};

export default translationService;
