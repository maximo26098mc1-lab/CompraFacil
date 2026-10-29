/**
 * CompraFácil - Service Worker para PWA (Progressive Web App)
 * Permite instalación en dispositivos móviles/desktop y funcionamiento 100% offline.
 */

const CACHE_NAME = 'comprafacil-pwa-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  './css/main.css',
  './css/components.css',
  './css/security.css',
  './js/app.js',
  './js/state.js',
  './js/supabaseClient.js',
  './js/modules/auth.js',
  './js/modules/catalog.js',
  './js/modules/productDetail.js',
  './js/modules/sellerDashboard.js',
  './js/modules/securityModule.js',
  './js/modules/legal.js',
  './js/modules/admin.js'
];

// Instalación: Pre-cacheo de recursos críticos de la aplicación
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalando nueva versión:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-cacheando archivos estáticos de la plataforma...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de versiones obsoletas de caché
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activado y listo.');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de Solicitudes (Estrategia Híbrida: Cache-First con Network Fallback + Soporte Offline)
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones no HTTP/HTTPS o esquemas chrome-extension
  if (!event.request.url.startsWith('http')) return;

  // Manejo de navegación SPA (siempre servir index.html si no hay red)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // Estrategia para recursos estáticos y assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retornar de la caché inmediatamente
        return cachedResponse;
      }

      // Si no está en caché, buscar en la red y almacenar en caché dinámica (ej. fotos de Unsplash)
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Clonar la respuesta para guardarla en la caché
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Solo cachear peticiones GET
          if (event.request.method === 'GET') {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      }).catch((err) => {
        console.warn('[ServiceWorker] Falló la red para:', event.request.url);
        // Si es una imagen y no hay red, podríamos devolver un placeholder
      });
    })
  );
});
