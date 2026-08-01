/* ═══════════════════════════════════════════════════════════════════════════
   MIÑA PONTEVEDRA v2.0 · LÓGICA PRINCIPAL JAVASCRIPT VANILLA (100% ESPAÑOL)
   ═══════════════════════════════════════════════════════════════════════════ */

// ── 1. NAVEGACIÓN SPA ENTRE PESTAÑAS ──
let activeTab = 'vidalocal';

function switchTab(tabId) {
  activeTab = tabId;

  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  const activeSec = document.getElementById(`sec-${tabId}`);
  if (activeSec) {
    activeSec.classList.remove('hidden');
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    const isCurrent = link.dataset.tab === tabId;

    if (link.classList.contains('px-2')) {
      link.classList.toggle('text-red-700', isCurrent);
      link.classList.toggle('border-b-2', isCurrent);
      link.classList.toggle('border-red-700', isCurrent);
      link.classList.toggle('text-slate-600', !isCurrent);
    }

    if (link.classList.contains('flex-col')) {
      link.classList.toggle('text-red-700', isCurrent);
      link.classList.toggle('bg-slate-100', isCurrent);
      link.classList.toggle('text-slate-500', !isCurrent);
    }
  });

  if (tabId === 'descubrir' && window.ponteMap) {
    setTimeout(() => {
      window.ponteMap.invalidateSize();
    }, 120);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 2. METROMINUTO PONTEVEDRA & RUTAS TEMÁTICAS ──
const METROMINUTO_NODOS = {
  estacion: { nombre: "Estación de Tren / Buses", coords: [42.4230, -8.6430] },
  peregrina: { nombre: "Santuario da Peregrina", coords: [42.4308, -8.6441] },
  ferreria: { nombre: "Praza da Ferrería", coords: [42.4312, -8.6432] },
  lena: { nombre: "Praza da Leña (Museo)", coords: [42.4331, -8.6440] },
  verdura: { nombre: "Praza da Verdura", coords: [42.4326, -8.6450] },
  teucro: { nombre: "Praza do Teucro", coords: [42.4320, -8.6458] },
  mercado: { nombre: "Praza de Abastos (Mercado)", coords: [42.4348, -8.6445] },
  santamaria: { nombre: "Basílica de Santa María", coords: [42.4332, -8.6469] },
  burgo: { nombre: "Ponte do Burgo", coords: [42.4358, -8.6450] },
  sculpturas: { nombre: "Illa das Sculpturas", coords: [42.4410, -8.6350] },
  campolongo: { nombre: "Parque de Campolongo", coords: [42.4265, -8.6455] }
};

function calcularDistanciaMatriz(origenKey, destinoKey) {
  if (origenKey === destinoKey) return { metros: 0, minutos: 0 };
  const p1 = METROMINUTO_NODOS[origenKey].coords;
  const p2 = METROMINUTO_NODOS[destinoKey].coords;
  
  const R = 6371e3;
  const φ1 = p1[0] * Math.PI / 180;
  const φ2 = p2[0] * Math.PI / 180;
  const Δφ = (p2[0] - p1[0]) * Math.PI / 180;
  const Δλ = (p2[1] - p1[1]) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = Math.round(R * c * 1.35);

  const minutos = Math.max(1, Math.round(d / 75));
  return { metros: d, minutos };
}

function actualizarMetrominuto() {
  const orig = document.getElementById('metro-origen')?.value;
  const dest = document.getElementById('metro-destino')?.value;
  if (!orig || !dest) return;

  const res = calcularDistanciaMatriz(orig, dest);
  const pasos = Math.round(res.metros * 1.32);
  const co2 = (res.metros * 0.00018).toFixed(2);

  const elMin = document.getElementById('metro-res-min');
  const elMetros = document.getElementById('metro-res-metros');
  const elPasos = document.getElementById('metro-res-pasos');
  const elCo2 = document.getElementById('metro-res-co2');

  if (elMin) elMin.textContent = `${res.minutos} min`;
  if (elMetros) elMetros.textContent = `${res.metros} m`;
  if (elPasos) elPasos.textContent = `${pasos} pasos`;
  if (elCo2) elCo2.textContent = `${co2} kg CO₂`;
}

function cargarRutaMetrominuto(preset) {
  const selectOrig = document.getElementById('metro-origen');
  const selectDest = document.getElementById('metro-destino');
  if (!selectOrig || !selectDest) return;

  if (preset === 'vinos') {
    selectOrig.value = 'ferreria';
    selectDest.value = 'verdura';
  } else if (preset === 'lerez') {
    selectOrig.value = 'mercado';
    selectDest.value = 'sculpturas';
  } else if (preset === 'camino') {
    selectOrig.value = 'peregrina';
    selectDest.value = 'burgo';
  }
  actualizarMetrominuto();
}

// ── 3. GALERÍA EDITORIAL & LIGHTBOX (CON FALLBACK CÓNFIDES) ──
let galleryItems = [];
let currentLightboxIndex = 0;

function cargarGaleria() {
  fetch('fotos/gallery.json')
    .then(res => res.json())
    .then(data => {
      galleryItems = data;
      renderGaleria('todas');
    })
    .catch(err => console.log("Carga de galería", err));
}

function renderGaleria(cat = 'todas') {
  const grid = document.getElementById('galeria-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtrados = galleryItems.filter(item => {
    if (cat === 'todas') return true;
    return item.categoria.toLowerCase() === cat.toLowerCase();
  });

  if (!filtrados.length) {
    grid.innerHTML = `<div class="col-span-3 text-center py-8 text-slate-400 text-sm">No se encontraron fotografías para esta categoría.</div>`;
    return;
  }

  const fallbackUrl = 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80';

  filtrados.forEach((item) => {
    const originalIndex = galleryItems.findIndex(g => g.id === item.id);
    const card = document.createElement('div');
    card.className = 'gallery-card relative group rounded-2xl overflow-hidden shadow-sm border border-slate-200 aspect-[4/3]';
    card.onclick = () => openLightbox(originalIndex);
    card.innerHTML = `
      <img src="${item.url}" alt="${item.titulo}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${fallbackUrl}';" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
        <span class="text-[9px] font-bold uppercase tracking-wider text-red-400 mb-0.5">${item.categoria}</span>
        <h4 class="font-extrabold text-sm leading-snug">${item.titulo}</h4>
        <p class="text-[10px] text-slate-300 line-clamp-1 mt-0.5">${item.descripcion}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openLightbox(index) {
  if (index < 0 || index >= galleryItems.length) return;
  currentLightboxIndex = index;
  const item = galleryItems[index];

  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const desc = document.getElementById('lightbox-desc');
  const credit = document.getElementById('lightbox-credit');

  if (!modal || !img || !title) return;

  const fallbackUrl = 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80';
  img.setAttribute('referrerpolicy', 'no-referrer');
  img.onerror = () => { img.onerror = null; img.src = fallbackUrl; };
  img.src = item.url;
  img.alt = item.titulo;
  title.textContent = item.titulo;
  if (desc) desc.textContent = item.descripcion;
  if (credit) credit.textContent = `${item.fecha} · ${item.credito}`;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function navigateLightbox(dir) {
  let nextIdx = currentLightboxIndex + dir;
  if (nextIdx < 0) nextIdx = galleryItems.length - 1;
  if (nextIdx >= galleryItems.length) nextIdx = 0;
  openLightbox(nextIdx);
}

document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('lightbox-modal');
  if (!modal || modal.classList.contains('hidden')) return;

  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

// ── 4. EL FURANCHÓMETRO ──
const FURANCHOS = [
  {
    nombre: "Furancho O Outeiro",
    parroquia: "Salcedo (A 5 min de Pontevedra)",
    estado: "abierto",
    estadoTxt: "É Época! Abierto",
    vino: "Blanco Albariño do País y Tinto de Barril",
    tapas: ["Empanada de chocos", "Raxo con patatas", "Tetilla con membrillo"],
    desc: "Auténtico furancho tradicional en bajo de piedra. Servido en tazas de loza blanca (*cuncas*)."
  },
  {
    nombre: "Furancho A Botica",
    parroquia: "Lourizán (Carretera Vieja a Marín)",
    estado: "ultimos",
    estadoTxt: "Últimos Barriles de la Cosecha",
    vino: "Blanco Loureira y Caíño",
    tapas: ["Zamburiñas a la plancha", "Tortilla de patatas casera", "Pimientos de Herbón"],
    desc: "Excelente terraza bajo el parral de viñas con vistas a la ría."
  },
  {
    nombre: "Furancho O Rebelo",
    parroquia: "Marcón (Pontevedra Este)",
    estado: "cerrado",
    estadoTxt: "Cerrado (Próxima apertura en Febrero)",
    vino: "Tinto Mención de Cosecha Propia",
    tapas: ["Chorizo al vino", "Oreja de cerdo a la gallega"],
    desc: "Agotó las existencias de la bodega de este año. Volverá a abrir tras el embotellado."
  }
];

function renderFuranchometro(filtroTapa = 'todos') {
  const container = document.getElementById('furanchometro-grid');
  if (!container) return;
  container.innerHTML = '';

  const filtrados = FURANCHOS.filter(f => {
    if (filtroTapa === 'todos') return true;
    return f.tapas.some(t => t.toLowerCase().includes(filtroTapa.toLowerCase()));
  });

  filtrados.forEach(f => {
    let badgeClass = "furancho-badge-abierto";
    if (f.estado === 'ultimos') badgeClass = "furancho-badge-ultimos";
    if (f.estado === 'cerrado') badgeClass = "furancho-badge-cerrado";

    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 premium-card';
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="font-extrabold text-base text-slate-900">${f.nombre}</h3>
          <p class="text-[11px] text-slate-500 font-semibold">📍 ${f.parroquia}</p>
        </div>
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeClass}">${f.estadoTxt}</span>
      </div>
      <p class="text-xs text-slate-600 leading-relaxed">${f.desc}</p>
      <div class="text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
        <p class="font-bold text-amber-900">🍷 Vino: <span class="font-normal text-slate-700">${f.vino}</span></p>
        <p class="font-bold text-amber-900">🍽️ Tapas: <span class="font-normal text-slate-700">${f.tapas.join(' · ')}</span></p>
      </div>
    `;
    container.appendChild(card);
  });
}

// ── 5. REPRODUCTOR SINTETIZADOR "SONS DA BOA VILA" ──
let audioCtx = null;
let activeOscillators = [];

function toggleSoundscape(soundType) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  stopSoundscape();

  const statusEl = document.getElementById('soundscape-status');
  if (soundType === 'stop') {
    if (statusEl) statusEl.textContent = "Reproducción detenida";
    return;
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (soundType === 'lerez') {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.12;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();

    activeOscillators.push(noise, gain);
    if (statusEl) statusEl.textContent = "🔊 Reproduciendo: Susurro del Río Lérez (Agua fluvial)";

  } else if (soundType === 'campanas') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 3.6);

    if (statusEl) statusEl.textContent = "🔔 Repique de Campanas do Santuario da Peregrina";
  }
}

function stopSoundscape() {
  activeOscillators.forEach(item => {
    try { if (item.stop) item.stop(); if (item.disconnect) item.disconnect(); } catch (e) {}
  });
  activeOscillators = [];
}

// ── 6. MINI-JUEGO: QUIZ GALEGO-PONTEVEDRÉS ──
const QUIZ_PREGUNTAS = [
  {
    q: "1. ¿Qué animal legendario e irónico es la mascota del Carnaval (Entroido) de Pontevedra?",
    options: ["El Gaiteiro de Campolongo", "O Loro Ravachol", "O Choco de la Ría", "El Héroe Teucro"],
    correct: 1
  },
  {
    q: "2. ¿Qué es exactamente un 'Furancho'?",
    options: ["Un tipo de hórreo para secar el maíz", "Una bodega privada de casa donde se vende el vino del país con tapas caseras", "Una danza tradicional de los mareantes", "Una plaza del casco histórico"],
    correct: 1
  },
  {
    q: "3. ¿Qué particularidad arquitectónica tiene la planta del Santuario da Virxe da Peregrina?",
    options: ["Planta con forma de concha de vieira", "Planta en cruz latina románica", "Planta circular perfecta", "Planta octogonal templaria"],
    correct: 0
  },
  {
    q: "4. ¿Qué significa la palabra gallega 'Orballo'?",
    options: ["Un viento fuerte procedente de la ría", "Lluvia fina, suave y continua que cala silenciosamente", "Un guiso tradicional de pulpo", "Una fiesta de la vendimia"],
    correct: 1
  },
  {
    q: "5. ¿Por qué razón Pontevedra ha ganado prestigiosos premios internacionales de la ONU y Dubái?",
    options: ["Por su modelo urbano 100% peatonal sin coches y prioridad a las personas", "Por tener el rascacielos más alto de Galicia", "Por su circuito de carreras de coches", "Por su puerto de cruceros gigante"],
    correct: 0
  }
];

let quizIndex = 0;
let quizScore = 0;

function renderQuiz() {
  const box = document.getElementById('quiz-box');
  if (!box) return;

  if (quizIndex >= QUIZ_PREGUNTAS.length) {
    let tituloDiplome = "Pontevedrés de Corazón 🏅";
    if (quizScore === 5) tituloDiplome = "Maestro Ilustre da Boa Vila 🏆";

    box.innerHTML = `
      <div class="text-center py-6 space-y-3">
        <span class="text-4xl">🎉</span>
        <h3 class="font-bold text-xl text-slate-900">${tituloDiplome}</h3>
        <p class="text-xs text-slate-600">Has acertado <strong>${quizScore} de ${QUIZ_PREGUNTAS.length}</strong> preguntas correctamente.</p>
        <button onclick="reiniciarQuiz()" class="mt-2 px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-800 transition-colors">Volver a Jugar 🔄</button>
      </div>
    `;
    return;
  }

  const current = QUIZ_PREGUNTAS[quizIndex];
  let optionsHtml = '';
  current.options.forEach((opt, idx) => {
    optionsHtml += `
      <button onclick="responderQuiz(${idx})" class="w-full text-left p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-red-50 hover:border-red-200 transition-all text-slate-800">
        ${opt}
      </button>
    `;
  });

  box.innerHTML = `
    <div class="space-y-3">
      <div class="flex justify-between items-center text-xs font-bold text-red-700">
        <span>Pregunta ${quizIndex + 1} de ${QUIZ_PREGUNTAS.length}</span>
        <span>Puntos: ${quizScore}</span>
      </div>
      <p class="font-bold text-sm text-slate-900 leading-snug">${current.q}</p>
      <div class="space-y-2 pt-1">
        ${optionsHtml}
      </div>
    </div>
  `;
}

function responderQuiz(idx) {
  if (idx === QUIZ_PREGUNTAS[quizIndex].correct) {
    quizScore++;
  }
  quizIndex++;
  renderQuiz();
}

function reiniciarQuiz() {
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
}

// ── 7. CLIMA Y ANIMACIÓN ORBALLO ──
async function cargarClimaPontevedra() {
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const adviceEl = document.getElementById('weather-advice');
  const timeEl = document.getElementById('weather-time');
  const iconEl = document.getElementById('weather-icon');

  if (!tempEl) return;

  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=42.4308&longitude=-8.6441&current_weather=true&timezone=Europe%2FMadrid');
    const data = await res.json();
    
    if (data && data.current_weather) {
      const cw = data.current_weather;
      const temp = Math.round(cw.temperature);
      const code = cw.weathercode;

      tempEl.textContent = `${temp}°C`;
      timeEl.textContent = `Actualizado ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

      let desc = "Día despejado";
      let icon = "☀️";
      let advice = "Día espectacular para tapear en las terrazas de a Praza da Verdura.";

      if (code >= 51 && code <= 67) {
        desc = "Orballo / Lluvia fina";
        icon = "🌧️";
        advice = "Típico orballo gallego. Buen día para refugiarse bajo los soportales de a Praza da Leña con un vino blanco.";
        iniciarEfectoOrballo();
      } else if (code >= 80) {
        desc = "Chubascos intensos";
        icon = "🌩️";
        advice = "Lluvia de ría. Ideal para visitar la Praza de Abastos o las sedes del Museo de Pontevedra.";
        iniciarEfectoOrballo();
      } else if (code >= 1 && code <= 3) {
        desc = "Parcialmente nublado";
        icon = "⛅";
        advice = "Temperatura perfecta para pasear por la Senda do Lérez o la Illa das Sculpturas.";
      }

      descEl.textContent = desc;
      iconEl.textContent = icon;
      adviceEl.textContent = advice;
    }
  } catch (err) {
    if (descEl) descEl.textContent = "Clima atlántico templado (~18°C)";
    if (adviceEl) adviceEl.textContent = "Pontevedra goza de un microclima suave en las Rías Baixas ideal para caminar.";
  }
}

function iniciarEfectoOrballo() {
  const container = document.getElementById('orballo-container');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const drop = document.createElement('div');
    drop.className = 'drop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDelay = `${Math.random() * 1.5}s`;
    drop.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
    container.appendChild(drop);
  }
}

// ── 8. DICCIONARIO GALEGO-ESPAÑOL ──
const DICIONARIO = [
  { palabra: "Morriña", pron: "mo-rri-ña", tipo: "Sustantivo", trad: "Nostalgia profunda", desc: "Sentimiento melancólico de añoranza por la tierra gallega y sus gentes cuando se está lejos." },
  { palabra: "Furancho", pron: "fu-ran-cho", tipo: "Sustantivo", trad: "Bodega de temporada", desc: "Local en casa particular de las parroquias rústicas donde se vende el excedente de vino de cosecha propia con tapas caseras." },
  { palabra: "Orballo", pron: "or-ba-llo", tipo: "Sustantivo", trad: "Lluvia muy fina", desc: "Lluvia de gotas finas y continuas (chirimiri) que casi no se siente pero cala suavemente." },
  { palabra: "Xeito", pron: "xei-to", tipo: "Sustantivo", trad: "Maña / Habilidad especial", desc: "Tener estilo, soltura o gracia natural para hacer las cosas bien. 'Con xeito'." },
  { palabra: "Choco", pron: "cho-co", tipo: "Sustantivo", trad: "Sepia de la ría", desc: "Cefalópodo emblemático de la Ría de Pontevedra. El plato estrella son los chocos en su tinta." },
  { palabra: "Trapallada", pron: "tra-pa-lla-da", tipo: "Sustantivo", trad: "Cosa mal hecha o lío", desc: "Obra de mala calidad, chapuza o conversación ligera sin importancia." },
  { palabra: "Licor Café", pron: "li-cor ca-fé", tipo: "Bebida", trad: "Digestivo tradicional", desc: "Elixir alcohólico gallego elaborado macerando café de tueste natural en aguardiente de orujo." },
  { palabra: "Boa Vila", pron: "boa vi-la", tipo: "Expresión", trad: "La Buena Villa", desc: "Nombre cariñoso con el que se conoce a Pontevedra: 'Pontevedra da boa vila, da boa xente'." }
];

function renderDicionario(filtro = '') {
  const grid = document.getElementById('glosario-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtrados = DICIONARIO.filter(item => {
    const q = filtro.toLowerCase();
    return item.palabra.toLowerCase().includes(q) ||
           item.trad.toLowerCase().includes(q) ||
           item.desc.toLowerCase().includes(q);
  });

  if (!filtrados.length) {
    grid.innerHTML = `<div class="col-span-2 text-center py-8 text-slate-400 text-sm">No se encontraron términos para "${filtro}"</div>`;
    return;
  }

  filtrados.forEach(item => {
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-2xl border border-slate-200/80 premium-card shadow-sm';
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <h3 class="font-extrabold text-xl text-red-700">${item.palabra}</h3>
          <span class="text-xs font-mono text-slate-400 italic">${item.pron}</span>
        </div>
        <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 bg-slate-50">${item.tipo}</span>
      </div>
      <p class="font-bold text-xs text-slate-800 mb-2">➡️ ${item.trad}</p>
      <p class="text-xs text-slate-600 leading-relaxed">${item.desc}</p>
    `;
    grid.appendChild(card);
  });
}

// ── 9. INICIALIZACIÓN DEL MAPA LEAFLET ──
let mapMarkers = [];

function initPonteMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer || window.ponteMap) return;

  const map = L.map('map').setView([42.4308, -8.6441], 15);
  window.ponteMap = map;

  const cartoAttr = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>';
  const dayTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: cartoAttr, maxZoom: 19 });
  const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: cartoAttr, maxZoom: 19 });
  
  dayTiles.addTo(map);

  let isNight = false;
  const NightControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      const btn = L.DomUtil.create('button', 'leaflet-bar');
      btn.type = 'button';
      btn.title = 'Modo Noche del Mapa';
      btn.style.cssText = 'width:34px;height:34px;background:#fff;border:none;cursor:pointer;font-size:16px;line-height:34px;padding:0;border-radius:4px;box-shadow:0 2px 5px rgba(0,0,0,0.2)';
      btn.textContent = '🌙';
      L.DomEvent.on(btn, 'click', (e) => {
        L.DomEvent.stop(e);
        isNight = !isNight;
        if (isNight) { map.removeLayer(dayTiles); darkTiles.addTo(map); }
        else { map.removeLayer(darkTiles); dayTiles.addTo(map); }
        btn.textContent = isNight ? '☀️' : '🌙';
      });
      return btn;
    }
  });
  map.addControl(new NightControl());

  fetch('maps/puntos.json')
    .then(res => res.json())
    .then(puntos => {
      puntos.forEach(p => {
        const markerColor = p.color || 'orange';
        const circleMarker = L.circleMarker(p.coordenadas, {
          radius: 9,
          fillColor: markerColor === 'orange' ? '#d97706' : (markerColor === 'green' ? '#16a34a' : (markerColor === 'blue' ? '#2563eb' : '#dc2626')),
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        const popupHtml = `
          <div class="space-y-1">
            <h4 class="font-bold text-slate-900 text-sm">${p.nombre}</h4>
            <p class="text-xs text-slate-600 leading-snug">${p.descripcion}</p>
            <p class="text-[11px] font-semibold text-slate-500 mt-1">${p.nota}</p>
            ${p.google_maps_url ? `<a href="${p.google_maps_url}" target="_blank" class="inline-block mt-2 text-[11px] font-bold text-red-700 hover:underline">Ver en Google Maps ↗</a>` : ''}
          </div>
        `;
        circleMarker.bindPopup(popupHtml);
        circleMarker._pointData = p;
        mapMarkers.push(circleMarker);
      });
    })
    .catch(err => console.log("Carga del mapa", err));

  cargarRutasList(map);
}

function cargarRutasList(map) {
  const elList = document.getElementById('rutas-list');
  if (!elList) return;

  fetch('rutas/index.json')
    .then(res => res.json())
    .then(rutas => {
      elList.innerHTML = '';
      rutas.forEach(r => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-xs space-y-1';
        item.innerHTML = `
          <div class="flex items-center justify-between font-bold text-slate-900">
            <span>${r.emoji} ${r.nombre}</span>
            <span class="text-[10px] text-red-700 font-mono">${r.distancia}</span>
          </div>
          <p class="text-slate-500 text-[11px]">${r.descripcion}</p>
          <button onclick="dibujarRutaGPX('${r.archivo}')" class="mt-1 text-[11px] font-bold text-red-700 hover:underline">Visualizar ruta ↗</button>
        `;
        elList.appendChild(item);
      });
    });
}

let activeGpxLayer = null;
function dibujarRutaGPX(gpxFile) {
  if (!window.ponteMap || !gpxFile) return;
  if (activeGpxLayer) window.ponteMap.removeLayer(activeGpxLayer);

  const gpxUrl = `rutas/${gpxFile}`;
  activeGpxLayer = new L.GPX(gpxUrl, {
    async: true,
    marker_options: { startIconUrl: '', endIconUrl: '', shadowUrl: '' },
    polyline_options: { color: '#c81919', weight: 4, opacity: 0.8 }
  }).on('loaded', function(e) {
    window.ponteMap.fitBounds(e.target.getBounds());
  }).addTo(window.ponteMap);
}

// ── 10. SLIDER COMPARADOR IMÁGENES ANTES / DESPUÉS ──
function initSliderComparison() {
  const slider = document.getElementById('comparison-slider');
  const beforeWrap = document.getElementById('before-img-wrap');
  const handle = document.getElementById('slider-handle');

  if (!slider || !beforeWrap || !handle) return;

  slider.addEventListener('input', (e) => {
    const val = e.target.value;
    beforeWrap.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    handle.style.left = `${val}%`;
  });
}

// ── INICIALIZACIÓN GLOBAL ──
document.addEventListener('DOMContentLoaded', () => {
  cargarGaleria();
  renderDicionario();
  renderFuranchometro();
  renderQuiz();
  cargarClimaPontevedra();
  initSliderComparison();
  initPonteMap();

  document.getElementById('metro-origen')?.addEventListener('change', actualizarMetrominuto);
  document.getElementById('metro-destino')?.addEventListener('change', actualizarMetrominuto);
  actualizarMetrominuto();

  document.getElementById('glosario-search')?.addEventListener('input', (e) => {
    renderDicionario(e.target.value);
  });
});
