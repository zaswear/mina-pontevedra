/* ═══════════════════════════════════════════════════════════════════════════
   MINA PONTEVEDRA · GEOLOCALIZACIÓN GPS EN TIEMPO REAL
   ═══════════════════════════════════════════════════════════════════════════ */

function calcularDistanciaGeodesica(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

function obtenerUbicacionGPS(targetCoords, callback) {
  if (!navigator.geolocation) {
    callback(null, "Geolocalización no disponible");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const dist = calcularDistanciaGeodesica(
        pos.coords.latitude, pos.coords.longitude,
        targetCoords[0], targetCoords[1]
      );
      callback(dist, null);
    },
    (err) => {
      callback(null, err.message);
    },
    { enableHighAccuracy: true, timeout: 5000 }
  );
}
