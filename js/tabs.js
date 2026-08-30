/* ═══════════════════════════════════════════════════════════════════════════
   MIÑA PONTEVEDRA · TIMELINE COMPLETO Y REALISTA POR DÍAS (QA ENRICHED)
   ═══════════════════════════════════════════════════════════════════════════ */

const ITINERARIOS_DATA = {
  1: {
    titulo: "Día 1: Inmersión Total en a Boa Vila (De Mañana a Noche)",
    desc: "Día completo de 09:00h a 22:30h recorriendo el centro 100% peatonal, mercado, arquitectura gótica, puente medieval y ruta nocturna de tapas.",
    coords: [
      { lat: 42.4348, lng: -8.6445, titulo: "09:00h - Mercado de Abastos & Desayuno", foto: "fotos/praza_de_abastos.png" },
      { lat: 42.4312, lng: -8.6432, titulo: "10:30h - Praza da Ferrería & San Francisco", foto: "fotos/praza_da_lena.png" },
      { lat: 42.4332, lng: -8.6469, titulo: "12:30h - Basílica de Santa María & Santo Domingo", foto: "fotos/basilica_santa_maria.png" },
      { lat: 42.4348, lng: -8.6445, titulo: "14:00h - Almuerzo Marinero en el Mercado", foto: "fotos/praza_de_abastos.png" },
      { lat: 42.4308, lng: -8.6441, titulo: "16:30h - Virxe da Peregrina & Loro Ravachol", foto: "fotos/peregrina_church.png" },
      { lat: 42.4358, lng: -8.6450, titulo: "18:00h - Ponte do Burgo (Camino Portugués)", foto: "fotos/ponte_do_burgo.png" },
      { lat: 42.4310, lng: -8.6475, titulo: "20:00h - Alameda de Pontevedra & Valle-Inclán", foto: "fotos/peregrina_church.png" },
      { lat: 42.4326, lng: -8.6450, titulo: "21:30h - Tapeo Nocturno en Praza da Verdura", foto: "fotos/chocos_en_su_tinta.png" }
    ]
  },
  2: {
    titulo: "Día 2: Arte, Naturaleza Fluvial, Furanchos & Monasterios",
    desc: "Jornada completa combinando el Museo de Pontevedra, la Senda Fluvial do Lérez, comida de furancho y el Monasterio de Poio.",
    coords: [
      { lat: 42.4331, lng: -8.6440, titulo: "09:30h - Museo de Pontevedra (Edificio Castelao)", foto: "fotos/praza_da_lena.png" },
      { lat: 42.4410, lng: -8.6350, titulo: "11:30h - Senda Fluvial & Illa das Sculpturas", foto: "fotos/illa_das_sculpturas.png" },
      { lat: 42.4230, lng: -8.6430, titulo: "14:00h - Almuerzo en Furancho Tradicional", foto: "fotos/chocos_en_su_tinta.png" },
      { lat: 42.4460, lng: -8.6850, titulo: "16:30h - Monasterio de San Xoán de Poio", foto: "fotos/basilica_santa_maria.png" },
      { lat: 42.4265, lng: -8.6455, titulo: "18:30h - Parque de Campolongo & Río Gafos", foto: "fotos/ponte_do_burgo.png" },
      { lat: 42.4331, lng: -8.6440, titulo: "21:00h - Cena Gourmet en Praza da Leña", foto: "fotos/chocos_en_su_tinta.png" }
    ]
  },
  3: {
    titulo: "Día 3: Gran Tour Rías Baixas (Combarro, Cascadas & Albariño)",
    desc: "Excursión de día completo visitando Combarro, las Cascadas de A Barosa, bodegas de Albariño en Cambados y playas de la ría.",
    coords: [
      { lat: 42.4300, lng: -8.7000, titulo: "09:00h - Combarro (Hórreos sobre la Mar)", foto: "fotos/ponte_do_burgo.png" },
      { lat: 42.5200, lng: -8.6300, titulo: "11:30h - Cascadas e Muiños de A Barosa", foto: "fotos/illa_das_sculpturas.png" },
      { lat: 42.5150, lng: -8.8150, titulo: "14:00h - Mariscada en Cambados / O Grove", foto: "fotos/praza_de_abastos.png" },
      { lat: 42.5150, lng: -8.8150, titulo: "16:30h - Cuna del Albariño (Pazo de Fefiñáns)", foto: "fotos/praza_de_abastos.png" },
      { lat: 42.4000, lng: -8.7100, titulo: "19:00h - Atardecer en Playa de Mogor / Lapamán", foto: "fotos/ponte_do_burgo.png" },
      { lat: 42.4308, lng: -8.6441, titulo: "21:30h - Broche de Oro en Pontevedra", foto: "fotos/peregrina_church.png" }
    ]
  }
};

let itinerarioMap = null;
let itinerarioPolyline = null;
let itinerarioMarkers = [];

function switchItinerarioTab(dia) {
  document.querySelectorAll('.tab-dia-btn').forEach(btn => {
    const isCurrent = btn.dataset.dia === String(dia);
    btn.classList.toggle('active', isCurrent);
  });

  document.querySelectorAll('.itinerario-pane').forEach(pane => {
    pane.classList.add('hidden');
  });

  const activePane = document.getElementById(`itinerario-dia-${dia}`);
  if (activePane) {
    activePane.classList.remove('hidden');
  }

  actualizarMapaItinerario(dia);
}

function initItinerarioMap() {
  const container = document.getElementById('itinerario-map');
  if (!container || itinerarioMap) return;

  itinerarioMap = L.map('itinerario-map').setView([42.4312, -8.6432], 14);
  /* CARTO empezó a exigir API key y estampa "API KEY REQUIRED" sobre cada tile
     (HTTP 200 con la marca ya dibujada, no hay error que capturar).
     Esri no pide clave. OJO: ordena la ruta {z}/{y}/{x}, no {z}/{x}/{y}. */
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Teselas © Esri'
  }).addTo(itinerarioMap);

  actualizarMapaItinerario(1);
}

function actualizarMapaItinerario(dia) {
  if (!itinerarioMap || !ITINERARIOS_DATA[dia]) return;

  itinerarioMarkers.forEach(m => itinerarioMap.removeLayer(m));
  itinerarioMarkers = [];
  if (itinerarioPolyline) itinerarioMap.removeLayer(itinerarioPolyline);

  const puntos = ITINERARIOS_DATA[dia].coords;
  const latLons = puntos.map(p => [p.lat, p.lng]);

  itinerarioPolyline = L.polyline(latLons, {
    color: '#3D6B4F',
    weight: 4,
    dashArray: '6, 8',
    opacity: 0.85
  }).addTo(itinerarioMap);

  puntos.forEach((p, idx) => {
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 9,
      fillColor: '#B8723D',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1
    }).addTo(itinerarioMap);

    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: #3D6B4F;">Parada ${idx + 1}</strong><br/>
        <b>${p.titulo}</b>
      </div>
    `);

    itinerarioMarkers.push(marker);
  });

  if (latLons.length > 0) {
    itinerarioMap.fitBounds(L.latLngBounds(latLons), { padding: [35, 35] });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initItinerarioMap();
  }, 300);
});
