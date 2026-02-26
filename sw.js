
const CACHE_NAME = 'emotion-companion-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/hooks/useLocalStorage.ts',
  '/contexts/AppContext.tsx',
  '/components/Icons.tsx',
  '/components/TabNavigator.tsx',
  '/components/LiveTab.tsx',
  '/components/ChatTab.tsx',
  '/components/ActivitiesTab.tsx',
  '/components/ActivityModal.tsx',
  '/components/StatsTab.tsx',
  '/components/SettingsTab.tsx',
  '/components/SplashScreen.tsx',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // STRICT EXCLUSION: Do not intercept any Azure-hosted or WebSocket traffic
  const isAzure = event.request.url.includes('azurewebsites.net');
  const isWebSocket = event.request.headers.get('upgrade') === 'websocket';
  
  if (event.request.method !== 'GET' || isAzure || isWebSocket) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
