/* ═══════════════════════════════════════════════════════════════════════════
   MIÑA PONTEVEDRA · MOTOR PRINCIPAL DEL FREE TOUR DIGITAL (NAVIGATION FIX)
   ═══════════════════════════════════════════════════════════════════════════ */

let rutaData = null;
let currentStopIndex = 0;

function obtenerParametroUrl(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || 'peatonal';
}

function cargarRutaFreeTour() {
  const rutaId = obtenerParametroUrl('ruta');
  const jsonPath = `data/ruta-${rutaId}.json`;

  fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      rutaData = data;
      
      const savedIndex = localStorage.getItem(`ft_progreso_${rutaId}`);
      if (savedIndex !== null) {
        currentStopIndex = parseInt(savedIndex, 10);
      } else {
        currentStopIndex = 0;
      }

      renderParadaActual();
    })
    .catch(err => {
      console.error("Error al cargar la ruta:", err);
      document.getElementById('ft-content').innerHTML = `
        <div class="p-6 text-center text-slate-500">
          <p class="text-lg font-bold">No se pudo cargar la ruta solicitada.</p>
          <a href="../index.html" class="inline-block mt-4 px-4 py-2 bg-emerald-800 text-white rounded-full text-xs font-bold">Volver a la Web Principal 🏠</a>
        </div>
      `;
    });
}

function renderParadaActual() {
  if (!rutaData || !rutaData.paradas) return;

  const total = rutaData.paradas.length;
  if (currentStopIndex >= total) {
    renderFinalRuta();
    return;
  }

  const parada = rutaData.paradas[currentStopIndex];
  const pct = Math.round(((currentStopIndex + 1) / total) * 100);

  document.title = `${parada.nombre} · Free Tour Miña Pontevedra`;
  const elTitle = document.getElementById('ft-header-title');
  if (elTitle) elTitle.textContent = rutaData.titulo;

  const elProgress = document.getElementById('ft-progress-fill');
  if (elProgress) elProgress.style.width = `${pct}%`;

  const elProgressText = document.getElementById('ft-progress-text');
  if (elProgressText) elProgressText.textContent = `Parada ${currentStopIndex + 1} de ${total}`;

  const container = document.getElementById('ft-content');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Cabecera de Parada -->
      <div class="space-y-1">
        <span class="text-xs font-bold uppercase tracking-wider text-amber-700">Parada ${parada.id}: ${parada.lugar}</span>
        <h2 class="font-title text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">${parada.nombre}</h2>
      </div>

      <!-- Reproductor Audioguía por Voz -->
      <div class="audio-player-card space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase text-emerald-400">Audioguía del Guía Local</span>
          <button id="btn-speech-play" class="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-full text-xs font-bold text-white transition-colors cursor-pointer">
            ▶️ Escuchar Audioguía
          </button>
        </div>
        <p class="text-xs text-slate-300 italic leading-relaxed pt-1">"${parada.audiotexto}"</p>
      </div>

      <!-- Historia & Anécdota Absurda -->
      <div class="stop-card space-y-4">
        <div>
          <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span>📜</span> Dato Histórico Verificado
          </h3>
          <p class="text-xs text-slate-600 leading-relaxed mt-1">${parada.datoHistorico}</p>
        </div>

        <div class="border-t border-slate-100 pt-3">
          <h3 class="font-bold text-sm text-amber-900 flex items-center gap-2">
            <span>🎭</span> Anécdota o Misterio Local
          </h3>
          <p class="text-xs text-slate-700 leading-relaxed mt-1 font-hand text-base">${parada.anecdotaAbsurda}</p>
        </div>
      </div>

      <!-- Acertijo / Quiz de la Parada -->
      <div class="stop-card space-y-3 bg-amber-50/60 border-amber-100">
        <h3 class="font-bold text-xs uppercase tracking-wider text-amber-900">🧩 Acertijo de la Parada</h3>
        <p class="font-bold text-xs text-slate-900">${parada.quiz.pregunta}</p>
        <div id="quiz-options-${parada.id}" class="space-y-2 pt-1">
          ${parada.quiz.opciones.map((opt, idx) => `
            <button onclick="verificarQuizParada(${parada.id}, ${idx}, ${parada.quiz.correcta})" class="w-full text-left p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-200 transition-all text-slate-800">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback-${parada.id}" class="hidden text-xs font-bold pt-1"></div>
      </div>

      <!-- Distancia GPS & Siguiente Parada -->
      <div class="space-y-3 pt-2">
        <div id="gps-distance-box" class="text-center text-xs text-slate-500 font-semibold">
          <span id="gps-text">Calculando distancia a la parada...</span>
        </div>
        <button onclick="avanzarSiguienteParada()" class="btn-siguiente">
          ${currentStopIndex === total - 1 ? 'Finalizar Tour 🏆' : 'He llegado a esta parada ➔ Siguiente'}
        </button>
      </div>

    </div>
  `;

  const playBtn = document.getElementById('btn-speech-play');
  if (playBtn) {
    playBtn.onclick = () => {
      if (playBtn.textContent.includes('Pausar')) {
        pausarTexto();
      } else {
        hablarTexto(parada.audiotexto);
      }
    };
  }

  initFreeTourMap(rutaData.paradas, currentStopIndex);

  obtenerUbicacionGPS(parada.coords, (dist, err) => {
    const elGps = document.getElementById('gps-text');
    if (elGps) {
      if (err) {
        elGps.textContent = `📍 Parada ubicada en ${parada.lugar}`;
      } else {
        elGps.textContent = `📍 Te encuentras a aprox. ${dist} metros de esta parada`;
      }
    }
  });
}

function verificarQuizParada(paradaId, idxSeleccionado, idxCorrecto) {
  const fb = document.getElementById(`quiz-feedback-${paradaId}`);
  if (!fb) return;

  fb.classList.remove('hidden', 'text-emerald-700', 'text-red-700');
  if (idxSeleccionado === idxCorrecto) {
    fb.classList.add('text-emerald-700');
    fb.textContent = "¡Correcto! 🎉 Has desbloqueado la pista histórica.";
  } else {
    fb.classList.add('text-red-700');
    fb.textContent = "¡Casi! Inténtalo de nuevo.";
  }
}

function avanzarSiguienteParada() {
  pausarTexto();
  currentStopIndex++;
  
  if (rutaData) {
    localStorage.setItem(`ft_progreso_${rutaData.id}`, currentStopIndex);
  }

  renderParadaActual();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderFinalRuta() {
  const container = document.getElementById('ft-content');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-10 space-y-4">
      <span class="text-5xl">🏆</span>
      <h2 class="font-title text-3xl font-extrabold text-slate-900">¡Enhorabuena!</h2>
      <p class="text-sm text-slate-600 max-w-md mx-auto">Has completado con éxito la ruta <strong>"${rutaData.titulo}"</strong>. Ahora conoces la verdadera alma de Miña Pontevedra como un local.</p>
      <div class="pt-4 flex flex-col sm:flex-row justify-center gap-3">
        <a href="../index.html" class="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-full text-xs shadow-md">🏠 Volver a la Web Principal</a>
        <button onclick="compartirRuta()" class="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-full text-xs shadow-md">Compartir mi Logro 🚀</button>
        <a href="index.html" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-full text-xs">Elegir otra ruta ↩</a>
      </div>
    </div>
  `;
}

function compartirRuta() {
  if (navigator.share) {
    navigator.share({
      title: 'Free Tour Miña Pontevedra',
      text: `¡Acabo de completar la ruta "${rutaData.titulo}" en Miña Pontevedra!`,
      url: window.location.href
    }).catch(() => {});
  } else {
    alert("¡Comparte tu logro! Copia este enlace en tus redes sociales.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarRutaFreeTour();
});
