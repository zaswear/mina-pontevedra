/* ═══════════════════════════════════════════════════════════════════════════
   MIÑA PONTEVEDRA · SERVICE WORKER DEL FREE TOUR

   Vive en /free-tour/ y no en /free-tour/js/ a propósito: un service worker
   solo controla su propio directorio hacia abajo, y GitHub Pages no deja mandar
   la cabecera Service-Worker-Allowed. Desde js/ dejaría fuera a ruta.html, que
   es justo la página que se usa caminando.

   Estrategia partida en dos, porque las dos mitades quieren cosas contrarias:
   - HTML y JSON: red primero. Son el contenido; un despliegue tiene que verse
     en el acto. Si no hay cobertura, se sirve lo cacheado.
   - CSS, JS e imágenes: caché primero. Es el esqueleto y casi nunca cambia; así
     la ruta abre al instante en mitad de la calle.

   Antes era caché primero para TODO, así que una parada corregida no llegaba
   nunca a quien ya había abierto la ruta una vez.

   Al añadir archivos a la sección, mételos en ESQUELETO y sube CACHE_NAME.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'ft-pontevedra-v2';

const ESQUELETO = [
  './',
  './index.html',
  './ruta.html',
  './css/free-tour.css',
  './js/free-tour.js',
  './js/speech.js',
  './js/geolocation.js',
  './js/map.js',
  './data/ruta-peatonal.json',
  './data/ruta-piedra.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      // allSettled y no addAll: con addAll, un solo archivo renombrado deja el
      // service worker sin instalar y el tour entero sin modo offline.
      .then((cache) => Promise.allSettled(ESQUELETO.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  // Sin esto, la caché vieja se queda ocupando sitio para siempre.
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves.filter((c) => c !== CACHE_NAME).map((c) => caches.delete(c))
      ))
      .then(() => self.clients.claim())
  );
});

const esContenido = (url) =>
  url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname.endsWith('/');

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  // Los CDN de Tailwind y Leaflet responden opaco y no se pueden validar; se
  // dejan pasar directos en vez de guardar una respuesta que no sabemos leer.
  if (url.origin !== self.location.origin) return;

  if (esContenido(url)) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copia));
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cacheada) => cacheada || fetch(e.request).then((res) => {
      const copia = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(e.request, copia));
      return res;
    }))
  );
});
