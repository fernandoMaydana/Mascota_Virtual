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
    
    // Hold gesture elements
    this.holdOverlay = document.getElementById('hold-progress-overlay');
    this.holdCircle = document.getElementById('hold-circle');
    
    this.holdTimer = null;
    this.holdStartTime = 0;
    this.holdDuration = 3000; // 3 segundos
    this.isHolding = false;

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

  sayRandomQuote() {
    if (!this.petDialog) return;
    const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    this.petDialog.textContent = randomQuote;
    
    // Animación de rebote al hablar
    this.petDialog.classList.remove('pulse-subtle');
    void this.petDialog.offsetWidth; // Trigger reflow
    this.petDialog.classList.add('pulse-subtle');
  }

  bindEvents() {
    if (!this.interactiveContainer) return;

    // Clic / Tap simple
    this.interactiveContainer.addEventListener('click', (e) => {
      if (this.isHolding) return;
      this.sayRandomQuote();
      this.setExpression('excited');
      this.spawnFloatingParticle(e.clientX, e.clientY);
      
      setTimeout(() => this.setExpression('happy'), 1200);
    });

    // Eventos de Mantener Presionado (Mimo de 3 seg)
    const startHold = (e) => {
      e.preventDefault();
      this.isHolding = false;
      this.holdStartTime = Date.now();
      
      if (this.holdOverlay) this.holdOverlay.classList.remove('hidden');
      this.setExpression('petting');
      this.sayQuote("¡Aww, qué rico mimo! Mantén presionado... 💕");

      this.holdTimer = setInterval(() => {
        const elapsed = Date.now() - this.holdStartTime;
        const progress = Math.min(elapsed / this.holdDuration, 1);
        
        // Actualizar círculo SVG (radio 85px = circunferencia ~534px)
        const circumference = 534;
        const offset = circumference - (progress * circumference);
        if (this.holdCircle) this.holdCircle.style.strokeDashoffset = offset;

        if (progress >= 1) {
          this.completeHoldMimo();
        }
      }, 50);
    };

    const cancelHold = () => {
      if (this.holdTimer) {
        clearInterval(this.holdTimer);
        this.holdTimer = null;
      }
      if (this.holdOverlay) this.holdOverlay.classList.add('hidden');
      if (this.holdCircle) this.holdCircle.style.strokeDashoffset = 534;
      
      setTimeout(() => {
        this.isHolding = false;
        this.setExpression('happy');
      }, 300);
    };

    // Touch & Mouse bindings
    this.interactiveContainer.addEventListener('mousedown', startHold);
    this.interactiveContainer.addEventListener('mouseup', cancelHold);
    this.interactiveContainer.addEventListener('mouseleave', cancelHold);

    this.interactiveContainer.addEventListener('touchstart', startHold, { passive: false });
    this.interactiveContainer.addEventListener('touchend', cancelHold);
    this.interactiveContainer.addEventListener('touchcancel', cancelHold);
  }

  sayQuote(text) {
    if (this.petDialog) this.petDialog.textContent = text;
  }

  completeHoldMimo() {
    if (this.holdTimer) clearInterval(this.holdTimer);
    if (this.holdOverlay) this.holdOverlay.classList.add('hidden');
    this.isHolding = true;

    // Lanzar confeti y sonido/vibración
    if (window.confetti) {
      window.confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    this.sayQuote("¡YAY! ¡Me diste un gran mimo de 3 segundos! 💖✨");
    this.setExpression('excited');

    // Notificar al controlador de tareas
    if (window.tasksController) {
      window.tasksController.completeTask('mimo');
    }
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
