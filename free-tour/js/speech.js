/* ═══════════════════════════════════════════════════════════════════════════
   MIÑA PONTEVEDRA · SPEECH SYNTHESIS REPARADO Y COMPATIBLE
   ═══════════════════════════════════════════════════════════════════════════ */

let spanishVoice = null;

function cargarVocesSpanish() {
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    spanishVoice = voices.find(v => v.lang.includes('es') || v.lang.includes('ES')) || voices[0] || null;
  }
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = cargarVocesSpanish;
  cargarVocesSpanish();
}

function hablarTexto(texto) {
  if (!('speechSynthesis' in window)) {
    alert("Tu navegador no soporta la lectura de voz. Puedes leer la narración en pantalla.");
    return;
  }

  // Cancelar y reanudar estado atascado de Chrome/Edge en Windows
  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => {
      const btn = document.getElementById('btn-speech-play');
      if (btn) btn.textContent = '▶️ Escuchar Audioguía';
    };

    utterance.onerror = (err) => {
      console.log("Speech Error:", err);
      const btn = document.getElementById('btn-speech-play');
      if (btn) btn.textContent = '▶️ Escuchar Audioguía';
    };

    window.speechSynthesis.speak(utterance);

    const btn = document.getElementById('btn-speech-play');
    if (btn) btn.textContent = '⏸️ Pausar Voz';
  }, 50);
}

function pausarTexto() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const btn = document.getElementById('btn-speech-play');
    if (btn) btn.textContent = '▶️ Escuchar Audioguía';
  }
}
