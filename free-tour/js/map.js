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
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap © CARTO'
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
