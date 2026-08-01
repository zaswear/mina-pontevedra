/* ═══════════════════════════════════════════════════════════════════════════
   MINA PONTEVEDRA · SERVICE WORKER FOR OFFLINE FREE TOUR
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'ft-pontevedra-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './ruta.html',
  './css/free-tour.css',
  './js/free-tour.js',
  './js/speech.js',
  './js/geolocation.js',
  './js/map.js',
  './data/ruta-peatonal.json',
  './data/ruta-piedra.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
