
// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

// Запрашиваем полноэкранный режим
if (tg.requestFullscreen) {
  tg.requestFullscreen();
} else {
  tg.expand();
}

// Получаем данные пользователя
let user = tg.initDataUnsafe.user;

// Устанавливаем аватар и имя пользователя в меню профиля
document.getElementById('profile-name').innerText = `${user.first_name} ${user.last_name || ''}`;
document.getElementById('profile-avatar').src = user.photo_url || 'default_avatar.png'; // Используйте изображение по умолчанию, если аватарки нет

// Инициализация карты Яндекса
ymaps.ready(init);

function init() {
  var myMap = new ymaps.Map("map", {
    center: [55.751244, 37.618423], // Москва по умолчанию
    zoom: 10,
    controls: []
  });

  // Кнопки управления масштабом
  document.getElementById('zoom-in').addEventListener('click', function() {
    myMap.setZoom(myMap.getZoom() + 1, { duration: 300 });
  });

  document.getElementById('zoom-out').addEventListener('click', function() {
    myMap.setZoom(myMap.getZoom() - 1, { duration: 300 });
  });

  // Кнопка определения местоположения
  document.getElementById('locate-button').addEventListener('click', function() {
    requestGeoLocation(myMap);
  });

  // Функция запроса геолокации
  function requestGeoLocation(map) {
    if (tg.WebApp.isVersionAtLeast('6.1')) {
      // Используем API геолокации Telegram
      tg.WebApp.requestGeoLocation('Для работы приложения необходимо предоставить доступ к геолокации.').then((geo) => {
        if (geo) {
          var userLocation = [geo.latitude, geo.longitude];
          map.setCenter(userLocation, 15);
          addUserMarker(map, userLocation);
        }
      }).catch((error) => {
        console.error('Ошибка получения геолокации:', error);
      });
    } else if (navigator.geolocation) {
      // Используем API геолокации браузера
      navigator.geolocation.getCurrentPosition(position => {
        var userLocation = [position.coords.latitude, position.coords.longitude];
        map.setCenter(userLocation, 15);
        addUserMarker(map, userLocation);
      }, error => {
        alert('Не удалось получить ваше местоположение.');
      });
    } else {
      alert('Геолокация не поддерживается вашим устройством.');
    }
  }

  // Функция добавления маркера пользователя
  function addUserMarker(map, coords) {
    if (!window.userMarker) {
      window.userMarker = new ymaps.Placemark(coords, {}, {
        preset: 'islands#blueCircleIcon',
        iconColor: '#1E98FF'
      });
      map.geoObjects.add(window.userMarker);
    } else {
      window.userMarker.geometry.setCoordinates(coords);
    }
  }

  // Обработка выбора типа карты
  document.querySelectorAll('.map-type-button').forEach(button => {
    button.addEventListener('click', function() {
      var mapType = this.getAttribute('data-type');
      switch (mapType) {
        case 'map':
          myMap.setType('yandex#map');
          myMap.container.getElement().style.filter = ''; // Сбрасываем фильтр
          break;
        case 'satellite':
          myMap.setType('yandex#satellite');
          myMap.container.getElement().style.filter = ''; // Сбрасываем фильтр
          break;
        case 'hybrid':
          myMap.setType('yandex#hybrid');
          myMap.container.getElement().style.filter = ''; // Сбрасываем фильтр
          break;
        case 'dark':
          myMap.setType('yandex#map');
          // Применяем тёмный стиль через CSS-фильтр
          myMap.container.getElement().style.filter = 'invert(1) hue-rotate(180deg)';
          break;
        default:
          myMap.setType('yandex#map');
          myMap.container.getElement().style.filter = ''; // Сбрасываем фильтр
      }
      closeMenu('settings-menu');
    });
  });

  // Обработка поисковых запросов
  document.getElementById('search-input').addEventListener('input', function() {
    var query = this.value.trim();
    if (query.length > 3) {
      ymaps.geocode(query, { results: 5 }).then(function (res) {
        var items = res.geoObjects.toArray();
        var resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
        if (items.length > 0) {
          items.forEach(function (item) {
            var address = item.getAddressLine();
            var coords = item.geometry.getCoordinates();
            var li = document.createElement('li');
            li.textContent = address;
            li.addEventListener('click', function () {
              myMap.setCenter(coords, 15);
              addUserMarker(myMap, coords);
              closeMenu('search-menu');
            });
            resultsContainer.appendChild(li);
          });
        } else {
          var li = document.createElement('li');
          li.textContent = 'Ничего не найдено';
          resultsContainer.appendChild(li);
        }
      }).catch(function(error) {
        console.error('Ошибка при выполнении геокодирования:', error);
      });
    } else {
      // Очищаем результаты поиска, если запрос короткий
      document.getElementById('search-results').innerHTML = '';
    }
  });

  // Обработка кнопок меню
  document.getElementById('profile-button').addEventListener('click', function() {
    openMenu('profile-menu');
  });

  document.getElementById('settings-button').addEventListener('click', function() {
    openMenu('settings-menu');
  });

  document.getElementById('search-button').addEventListener('click', function() {
    openMenu('search-menu');
    // Очищаем предыдущий поиск
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
  });

  // Функции открытия и закрытия меню
  function openMenu(menuId) {
    var menu = document.getElementById(menuId);
    menu.classList.add('active');
  }

  function closeMenu(menuId) {
    var menu = document.getElementById(menuId);
    menu.classList.remove('active');
  }

  // Инициализация меню (закрытие всех меню при загрузке)
  function initializeMenus() {
    closeMenu('profile-menu');
    closeMenu('settings-menu');
    closeMenu('search-menu');
  }

  initializeMenus();

  // Обработка кнопок закрытия меню
  document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', function() {
      var menu = this.closest('.slide-up');
      menu.classList.remove('active');
    });
  });

  // Обработка свайпа вниз для закрытия меню
  document.querySelectorAll('.slide-up').forEach(menu => {
    var startY = 0;
    menu.addEventListener('touchstart', function(e) {
      startY = e.touches[0].clientY;
    });
    menu.addEventListener('touchmove', function(e) {
      var currentY = e.touches[0].clientY;
      if (currentY - startY > 50) { // Если свайп вниз больше 50px
        menu.classList.remove('active');
      }
    });
  });
}
