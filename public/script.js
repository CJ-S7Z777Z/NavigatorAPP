// Initialize Telegram WebApp
let tg = window.Telegram.WebApp;

// Request fullscreen mode
if (tg.requestFullscreen) {
  tg.requestFullscreen();
} else {
  tg.expand();
}

// Get user data
let user = tg.initDataUnsafe.user;

// Set user avatar and name
document.getElementById('username').innerText = `${user.first_name} ${user.last_name || ''}`;
document.getElementById('avatar').src = user.photo_url || 'default_avatar.png'; // Use default if no avatar

// Initialize Yandex Map
ymaps.ready(init);

function init() {
  // Create the map instance
  var myMap = new ymaps.Map("map", {
    center: [55.751244, 37.618423], // Default to Moscow
    zoom: 10,
    controls: []
  });

  // Add controls
  myMap.controls.add('zoomControl', {
    position: {
      right: 20,
      bottom: 180
    }
  });

  // Create locate button
  var locateButton = new ymaps.control.Button({
    data: { image: '', title: 'Моё местоположение' },
    options: {
      layout: ymaps.templateLayoutFactory.createClass('<div id="custom-locate-button"><i class="fa-solid fa-location-arrow"></i></div>'),
      maxWidth: [50]
    }
  });
  myMap.controls.add(locateButton, {
    position: {
      right: 20,
      bottom: 120
    }
  });

  // Handle locate button click
  locateButton.events.add('click', function () {
    requestGeoLocation(myMap);
  });

  // Map type buttons
  var mapTypeButtons = document.querySelectorAll('.map-type-button');
  mapTypeButtons.forEach(button => {
    button.addEventListener('click', function () {
      var mapType = this.getAttribute('data-type');
      switch (mapType) {
        case 'map':
          myMap.setType('yandex#map');
          break;
        case 'satellite':
          myMap.setType('yandex#satellite');
          break;
        case 'hybrid':
          myMap.setType('yandex#hybrid');
          break;
        case 'dark':
          myMap.setType('yandex#map');
          myMap.setMapStyle('dark');
          break;
        default:
          myMap.setType('yandex#map');
      }
    });
  });

  // Function to request geolocation
  function requestGeoLocation(map) {
    if (tg.WebApp.isVersionAtLeast('6.1')) {
      // Use Telegram's geolocation API if available
      tg.WebApp.requestGeoLocation('Для работы приложения необходимо предоставить доступ к геолокации.').then((geo) => {
        if (geo) {
          var userLocation = [geo.latitude, geo.longitude];
          map.setCenter(userLocation, 15);
          addUserMarker(map, userLocation);
        }
      }).catch((error) => {
        console.error('Error obtaining geolocation:', error);
      });
    } else if (navigator.geolocation) {
      // Fallback to browser geolocation
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

  // Function to add user marker
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

  // Initial geolocation request
  requestGeoLocation(myMap);
}
