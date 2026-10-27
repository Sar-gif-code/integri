/**
 * НАСТРОЙКИ САЙТА — всё, что меняется чаще всего, собрано здесь.
 * Пустая строка = кнопка/ссылка скрыта.
 */
window.SITE = {
  whatsapp: '77776337063', // номер без «+» и пробелов
  telegram: '', // например 'https://t.me/integrifilms'
  instagram: 'https://instagram.com/integrifilms',
  email: '', // например 'hello@integrifilms.kz'

  // Цены тарифов. null = «Цена по запросу». Пример: '25 000 ₸'
  prices: { greeting: null, tale: null, film: null },

  // Фоновая музыка. Пусто = тихое фортепиано, которое сайт играет сам.
  // Свой трек: положите файл рядом с index.html и впишите его имя, например 'music.mp3'.
  music: 'music.m4a', // мелодия из видео с письмом

  // Фото основательницы. Пусто = элегантная заглушка с монограммой.
  founderPhoto: '',

  // Портфолио: добавьте строку — карточка появится автоматически.
  // title — ключ из texts (portfolio.works) или просто строка.
  works: [
    { video: 'showreel.mp4', poster: 'showreel-poster.jpg', title: 'home', type: 'film', wide: true },
    { video: 'arrival.mp4', poster: 'arrival-city.jpg', title: 'arrival', type: 'film' },
  ],

  // Отзывы: { name, city, text, photo }. Пока пусто — показываем тёплую заглушку.
  reviews: [],
};
