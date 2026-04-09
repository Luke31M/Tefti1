const CACHE_NAME = 'tefti-v1';
const ASSETS = [
  '/',
  '/app.html',
  '/index.html',
  '/estilos.css',
  '/logica.js',
  '/navbar.js',
  '/config.js',
  '/img/Logo.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Activación
self.addEventListener('activate', event => {
  console.log('[SW] Activado y listo.');
});

// Estrategia: Network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
