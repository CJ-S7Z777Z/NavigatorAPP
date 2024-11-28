// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

// Проверяем поддержку LocationManager
const supportsLocationManager = tg.WebApp && tg.WebApp.location;

// Проверяем поддержку полноэкранного режима
const supportsFullscreen = typeof tg.requestFullscreen === 'function';

// Устанавливаем обработчик событий на изменение полноэкранного режима
if (supportsFullscreen) {
  tg.onEvent('fullscreenChanged', () => {
    console.log('Полноэкранный режим изменён:', tg.isFullscreen);
  });

  // Запрашиваем полноэкранный режим
  tg.requestFullscreen();
} else {
  tg.expand(); // Если нет поддержки, просто расширяем WebApp
}

// Получаем данные пользователя
let user = tg.initDataUnsafe.user;

// Устанавливаем аватар и имя пользователя
document.getElementById('username').innerText = user.first_name + ' ' + (user.last_name || '');
document.getElementById('avatar').src = `https://t.me/i/userpic/320/${user.id}.jpg`;

// Инициализируем карту
let map = L.map('map').setView([55.751244, 37.618423], 13); // Москва по умолчанию

// Используем OpenStreetMap в качестве источника карт
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '', // Мы можем отключить атрибуцию в настройках, но важно указать её вручную
  maxZoom: 19,
}).addTo(map);

// Добавляем атрибуцию вручную
map.attributionControl.addAttribution('&copy; OpenStreetMap');

// Создаем маркер пользователя
let userMarker = L.marker([0, 0]).addTo(map);

// Функция обновления местоположения
function updateLocation(lat, lon) {
  map.setView([lat, lon], 15);
  userMarker.setLatLng([lat, lon]);
}

// Обработчик ошибки
function locationError(error) {
  console.error('Ошибка получения геолокации:', error);
  alert('Не удалось получить ваше местоположение.');
}

// Функция запроса геолокации через Telegram Web Apps
function requestGeoLocation() {
  if (supportsLocationManager) {
    // Запрашиваем доступ к геолокации
    tg.WebApp.requestLocation({
      // Можем указать параметры, если они доступны
    });

    // Обрабатываем событие обновления местоположения
    tg.WebApp.onEvent('locationChanged', (location) => {
      console.log('Получено местоположение:', location);
      updateLocation(location.latitude, location.longitude);
    });
  } else {
    // Если версия Telegram не поддерживает LocationManager
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      }, locationError);
    } else {
      alert('Геолокация не поддерживается вашим устройством.');
    }
  }
}

// Обработчик нажатия на кнопку "Моё местоположение"
document.getElementById('locate-button').addEventListener('click', () => {
  requestGeoLocation();
});

// При загрузке страницы запрашиваем геолокацию
requestGeoLocation();

