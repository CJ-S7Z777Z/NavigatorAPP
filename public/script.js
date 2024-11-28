// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

// Устанавливаем обработчик событий на изменение полноэкранного режима
tg.onEvent('fullscreenChanged', () => {
  console.log('Полноэкранный режим изменён:', tg.isFullscreen);
});

// Запрашиваем полноэкранный режим
tg.requestFullscreen();

// Получаем данные пользователя
let user = tg.initDataUnsafe.user;

// Устанавливаем аватар и имя пользователя
document.getElementById('username').innerText = user.first_name + ' ' + (user.last_name || '');
document.getElementById('avatar').src = `https://t.me/i/userpic/320/${user.id}.jpg`;

// Инициализируем карту
let map = L.map('map').setView([0, 0], 13);

// Добавляем слой карты (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

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
}

// Функция запроса геолокации через Telegram Web Apps
function requestGeoLocation() {
  // Проверяем, поддерживается ли LocationManager
  if (tg.isVersionAtLeast('6.11')) {
    // Добавляем обработчик события на обновление LocationManager
    tg.onEvent('locationUpdated', (location) => {
      console.log('Получено местоположение:', location);
      updateLocation(location.latitude, location.longitude);
    });

    // Запрашиваем доступ к геолокации
    tg.requestLocation({
      // Указываем необходимые параметры
      accurate: true // или false, если нужна менее точная геолокация
    }).then((location) => {
      console.log('Местоположение получено:', location);
      updateLocation(location.latitude, location.longitude);
    }).catch((err) => {
      console.error('Ошибка при запросе геолокации:', err);
    });
  } else {
    // Если версия не поддерживает LocationManager, используем стандартный способ
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      }, locationError);
    } else {
      alert('Геолокация не поддерживается вашим браузером.');
    }
  }
}

// При загрузке страницы запрашиваем геолокацию
requestGeoLocation();

// Обработчик нажатия на кнопку "Моё местоположение"
document.getElementById('locate-button').addEventListener('click', () => {
  requestGeoLocation();
});
