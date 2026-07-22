/* ===================================================
   PET INTERACTIVE MODULE (POMPOMPURIN) - PET.JS
   =================================================== */

class PetController {
  constructor() {
    this.petSprite = document.getElementById('pet-sprite');
    this.revealAvatar = document.querySelector('#pet-reveal-avatar .pompompurin-avatar');
    this.feedAvatar = document.querySelector('#feed-pet-sprite');
    this.petDialog = document.getElementById('pet-dialog');
    this.interactiveContainer = document.getElementById('pet-interactive-avatar');
    
    this.mimoTapCount = 0;
    this.mimoTarget = 5; // 5 toques acumulados para completar el mimo
    this.quoteHideTimer = null;

    this.quotes = [
      "¡Hola amiga! Te estaba esperando con mucha alegría 💛",
      "¡Un mimito más por favor! 🥰 Me encantan tus caricias.",
      "¡Eres una persona increíble, nunca lo olvides! ✨",
      "¡Me alegra muchísimo compartir este día contigo! 🌸",
      "¡Los pudines caseros son mi comida favorita del mundo! 🍮",
      "¡Qué lindo día para regalar sonrisas! ☀️",
      "¡Te mando un gran abrazo apapachable! 🫂",
      "¡Gracias por cuidarme tan bonito hoy! 💖"
    ];

    this.initFaces();
    this.bindEvents();
  }

  // Define e inyecta caras SVG vectoriales
  getFaceSvg(expression = 'happy') {
    let eyes = `<ellipse cx="38" cy="50" rx="4" ry="5" fill="#4A3E4D"/>
                <ellipse cx="82" cy="50" rx="4" ry="5" fill="#4A3E4D"/>`;
    let mouth = `<path d="M 52 56 Q 60 64 68 56" stroke="#4A3E4D" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    let nose = `<ellipse cx="60" cy="53" rx="4" ry="3" fill="#4A3E4D"/>`;
    let cheeks = `<ellipse cx="28" cy="58" rx="7" ry="5" fill="#FF8DA1" opacity="0.6"/>
                  <ellipse cx="92" cy="58" rx="7" ry="5" fill="#FF8DA1" opacity="0.6"/>`;

    if (expression === 'petting' || expression === 'excited') {
      eyes = `<path d="M 32 52 Q 38 44 44 52" stroke="#4A3E4D" stroke-width="4" fill="none" stroke-linecap="round"/>
              <path d="M 76 52 Q 82 44 88 52" stroke="#4A3E4D" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      mouth = `<path d="M 50 54 Q 60 68 70 54 Z" fill="#FF758F"/>`;
    } else if (expression === 'eating') {
      eyes = `<path d="M 32 48 Q 38 54 44 48" stroke="#4A3E4D" stroke-width="3.5" fill="none" stroke-linecap="round"/>
              <path d="M 76 48 Q 82 54 88 48" stroke="#4A3E4D" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      mouth = `<ellipse cx="60" cy="59" rx="6" ry="5" fill="#4A3E4D"/>`;
    } else if (expression === 'greeting') {
      eyes = `<ellipse cx="38" cy="48" rx="5" ry="6" fill="#4A3E4D"/>
              <ellipse cx="82" cy="48" rx="5" ry="6" fill="#4A3E4D"/>
              <circle cx="40" cy="46" r="2" fill="#FFF"/>
              <circle cx="84" cy="46" r="2" fill="#FFF"/>`;
      mouth = `<path d="M 52 56 Q 60 66 68 56" stroke="#4A3E4D" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }

    return `
      <svg class="pet-face-svg" viewBox="0 0 120 110">
        ${cheeks}
        ${eyes}
        ${nose}
        ${mouth}
      </svg>
    `;
  }

  initFaces() {
    if (this.petSprite) this.petSprite.innerHTML = this.getFaceSvg('happy');
    if (this.revealAvatar) this.revealAvatar.innerHTML = this.getFaceSvg('greeting');
    if (this.feedAvatar) this.feedAvatar.innerHTML = this.getFaceSvg('happy');
  }

  setExpression(expression) {
    if (this.petSprite) {
      this.petSprite.innerHTML = this.getFaceSvg(expression);
    }
  }

  // Mostrar mensaje solo al tocar y desvanecer a los 3.5 segundos
  sayQuote(text) {
    if (!this.petDialog) return;
    this.petDialog.textContent = text;
    this.petDialog.classList.remove('hidden');

    if (this.quoteHideTimer) clearTimeout(this.quoteHideTimer);

    this.quoteHideTimer = setTimeout(() => {
      if (this.petDialog) this.petDialog.classList.add('hidden');
    }, 3500);
  }

  sayRandomQuote() {
    const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    this.sayQuote(randomQuote);
  }

  bindEvents() {
    if (!this.interactiveContainer) return;

    // Clic / Tap acumulativo (5 toques para mimo)
    this.interactiveContainer.addEventListener('click', (e) => {
      this.mimoTapCount++;
      this.spawnFloatingParticle(e.clientX, e.clientY);
      this.setExpression('excited');

      // Actualizar estado de mimo
      const statusText = document.getElementById('mimo-status-text');
      if (statusText) {
        statusText.textContent = `Toca a la mascota (${this.mimoTapCount}/${this.mimoTarget} mimos)`;
      }

      if (this.mimoTapCount >= this.mimoTarget) {
        this.sayQuote("¡YAY! ¡Me diste todos tus mimos de hoy! 💕✨");
        if (window.confetti) {
          window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
        if (window.tasksController) {
          window.tasksController.completeSpecificTask('day1', 'mimoDone');
        }
        if (statusText) statusText.textContent = '¡Mimos completados! 💕';
      } else {
        this.sayRandomQuote();
      }

      setTimeout(() => this.setExpression('happy'), 1200);
    });
  }

  spawnFloatingParticle(x, y) {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const particle = document.createElement('div');
    const items = ['💖', '✨', '🌸', '🍮', '💕'];
    particle.textContent = items[Math.floor(Math.random() * items.length)];
    particle.style.position = 'fixed';
    particle.style.left = `${x || window.innerWidth / 2}px`;
    particle.style.top = `${y || window.innerHeight / 2}px`;
    particle.style.fontSize = '1.6rem';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '99';
    particle.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
    
    container.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, -80px) scale(1.4)`;
      particle.style.opacity = '0';
    });

    setTimeout(() => particle.remove(), 1000);
  }
}

window.petController = new PetController();
