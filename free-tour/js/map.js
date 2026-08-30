/* ═══════════════════════════════════════════════════════════════════════════
   MINA PONTEVEDRA · MAPA LEAFLET PARA FREE TOUR
   ═══════════════════════════════════════════════════════════════════════════ */

let freeTourMap = null;
let freeTourPolyline = null;
let freeTourMarkers = [];

function initFreeTourMap(paradas, activeIndex) {
  const container = document.getElementById('ft-map');
  if (!container) return;

  if (!freeTourMap) {
    freeTourMap = L.map('ft-map').setView(paradas[0].coords, 16);
    /* CARTO empezó a exigir API key y estampa "API KEY REQUIRED" sobre cada tile
     (HTTP 200 con la marca ya dibujada, no hay error que capturar).
     Esri no pide clave. OJO: ordena la ruta {z}/{y}/{x}, no {z}/{x}/{y}. */
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Teselas © Esri'
    }).addTo(freeTourMap);
  }

  // Limpiar marcadores antiguos
  freeTourMarkers.forEach(m => freeTourMap.removeLayer(m));
  freeTourMarkers = [];
  if (freeTourPolyline) freeTourMap.removeLayer(freeTourPolyline);

  // Trazar línea de la ruta
  const latLons = paradas.map(p => p.coords);
  freeTourPolyline = L.polyline(latLons, { color: '#3D6B4F', weight: 4, opacity: 0.85 }).addTo(freeTourMap);

  // Añadir pines numerados
  paradas.forEach((p, idx) => {
    const isCurrent = idx === activeIndex;
    const marker = L.circleMarker(p.coords, {
      radius: isCurrent ? 12 : 8,
      fillColor: isCurrent ? '#B8723D' : '#3D6B4F',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1
    }).addTo(freeTourMap);

    marker.bindPopup(`<b>Parada ${p.id}: ${p.nombre}</b><br>${p.lugar}`);
    freeTourMarkers.push(marker);

    if (isCurrent) {
      freeTourMap.setView(p.coords, 16);
      marker.openPopup();
    }
  });
}
