// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

// Устанавливаем полноэкранный режим
tg.expand();
// Или можно использовать метод requestFullscreen при необходимости
// tg.requestFullscreen();

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
function updateLocation(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  map.setView([lat, lon], 15);
  userMarker.setLatLng([lat, lon]);
}

// Обработчик ошибки
function locationError(error) {
  console.error('Ошибка получения геолокации:', error);
}

// Запрашиваем доступ к геолокации через Telegram
tg.WebApp.location.request({
  accuracy: 'city', // или 'street' в зависимости от необходимой точности
  request_id: 'location_request' // уникальный идентификатор запроса
});

// Событие обновления геолокации
tg.WebApp.onEvent('locationChanged', (location) => {
  updateLocation({ coords: { latitude: location.latitude, longitude: location.longitude } });
});

// Обработчик нажатия на кнопку "Моё местоположение"
document.getElementById('locate-button').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(updateLocation, locationError);
  } else {
    alert('Геолокация не поддерживается вашим браузером.');
  }
});
