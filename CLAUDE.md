# CLAUDE.md · Especificaciones Técnicas de Miña Pontevedra

## 📌 Principios del Proyecto

- **Nombre oficial**: Miña Pontevedra (con la **ñ** característica del gallego).
- **Idioma**: 100% Español en interfaz, código y documentación.
- **Tecnologías**: HTML5, CSS3, JavaScript Vanilla. Sin frameworks externos ni compiladores.
- **Hosting**: GitHub Pages compatible (rutas relativas).
- **Licencia**: Dual CC0 1.0 Universal + MIT.

---

## 📱 App instalable y modo offline (`/free-tour/`)

El Free Tour se usa con el móvil en la mano y andando, así que tiene que abrir sin
cobertura y poder instalarse en la pantalla de inicio.

- **`manifest.webmanifest` vive en la raíz del sitio**, no en `/free-tour/`, y lo enlazan
  las dos páginas de la sección. `start_url` apunta al listado de rutas: quien instala la
  app viene a caminar, no a la portada de la guía.
- **El service worker está en `/free-tour/sw.js`, no en `js/`.** Un SW solo controla su
  propio directorio hacia abajo y GitHub Pages no deja mandar `Service-Worker-Allowed`;
  desde `js/` dejaría fuera a `ruta.html`.
- **Lo registran `index.html` y `ruta.html`.** Antes solo el primero, así que quien
  abría directamente el enlace de una ruta —el caso normal— se quedaba sin offline.
- **Estrategia partida**: red primero para HTML y JSON (un despliegue tiene que verse
  en el acto; sin cobertura cae a lo cacheado) y caché primero para CSS, JS e imágenes
  (la ruta abre al instante en mitad de la calle). Antes era caché primero para todo, y
  una parada corregida no llegaba nunca a quien ya había abierto la ruta una vez.
- El precacheo usa `allSettled`, no `addAll`: con `addAll`, un solo archivo renombrado
  deja el SW sin instalar y el tour entero sin modo offline.
- Los CDN (Tailwind, Leaflet) se dejan pasar sin cachear: responden opaco y no se puede
  comprobar si la respuesta es buena.

**Al añadir archivos a la sección**: mételos en `ESQUELETO` y **sube `CACHE_NAME`**.

### Audioguía

`js/speech.js` usa Web Speech API y hoy **solo lee en castellano**, porque los datos de
las rutas solo traen `audiotexto` en castellano. Para la audioguía en gallego que pide el
backlog hace falta primero traducir las paradas (`audiotexto_gl` o similar): poner una voz
gallega a leer texto castellano no es una audioguía en gallego.
