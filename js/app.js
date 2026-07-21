/* ===================================================
   MAIN APPLICATION CONTROLLER - APP.JS
   =================================================== */

class App {
  constructor() {
    this.state = null;
    this.activeScreen = 'gift';
  }

  async init() {
    console.log("🚀 Inicializando Mascota Virtual App...");
    
    // Cargar estado inicial
    this.state = await window.storageManager.loadState();
    
    // Configurar escuchadores de eventos UI
    this.bindEvents();
    
    // Sincronizar nombre de mascota en todos los textos
    this.updatePetNamePlaceholders();

    // Determinar pantalla de inicio según progreso guardado
    let targetScreen = this.state.screen || 'gift';
    if (targetScreen === 'gift' && this.state.petName && this.state.petName !== 'Pompom') {
      targetScreen = 'dashboard';
    }
    this.switchScreen(targetScreen);

    // Renderizar estado de tareas e interfaz
    if (window.tasksController) {
      window.tasksController.updateTasksUI(this.state);
    }

    // Actualizar vista de día
    this.renderCurrentDayView();
  }

  // Cambiar pantalla con animación suave
  switchScreen(screenId) {
    const current = document.querySelector('.screen.active');
    const target = document.getElementById(`screen-${screenId}`);

    if (!target) return;

    if (current) {
      current.classList.remove('active');
      current.classList.add('hidden');
    }

    target.classList.remove('hidden');
    // Forzar reflow para animación
    void target.offsetWidth;
    target.classList.add('active');

    this.activeScreen = screenId;
    this.state.screen = screenId;
    window.storageManager.saveState(this.state);
  }

  updatePetNamePlaceholders() {
    const name = this.state.petName || 'Pompom';
    const placeholders = document.querySelectorAll('.pet-name-placeholder');
    placeholders.forEach(el => el.textContent = name);

    const dashName = document.getElementById('dash-pet-name');
    if (dashName) dashName.textContent = name;

    const ownerEl = document.getElementById('dash-owner-name');
    if (ownerEl) ownerEl.textContent = this.state.ownerName || 'Para Ti 💖';
  }

  renderCurrentDayView() {
    const day = this.state.currentDay || 1;
    const badge = document.getElementById('dash-day-badge');
    const modalTitle = document.getElementById('tasks-modal-title');
    const day1Box = document.getElementById('day-1-tasks');
    const day2Box = document.getElementById('day-2-tasks');
    const toggleLabel = document.getElementById('day-toggle-label');

    if (badge) badge.textContent = `Día ${day} / 5 🌸`;
    if (modalTitle) modalTitle.textContent = `Tareas del Día ${day}`;

    if (day === 1) {
      if (day1Box) day1Box.classList.remove('hidden');
      if (day2Box) day2Box.classList.add('hidden');
      if (toggleLabel) toggleLabel.textContent = 'Día 2';
    } else {
      if (day1Box) day1Box.classList.add('hidden');
      if (day2Box) day2Box.classList.remove('hidden');
      if (toggleLabel) toggleLabel.textContent = 'Día 1';
    }
  }

  bindEvents() {
    // --- PANTALLA 1: ABRIR REGALO ---
    const giftBox = document.getElementById('gift-box-trigger');
    const btnOpenGift = document.getElementById('btn-open-gift');

    const handleOpenGift = () => {
      if (giftBox) giftBox.classList.add('opened');
      if (window.confetti) {
        window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
      setTimeout(() => this.switchScreen('reveal'), 600);
    };

    if (giftBox) giftBox.addEventListener('click', handleOpenGift);
    if (btnOpenGift) btnOpenGift.addEventListener('click', handleOpenGift);

    // --- PANTALLA 2: GUARDAR NOMBRE (PASO 1) ---
    const btnSaveName = document.getElementById('btn-save-name');
    const nameInput = document.getElementById('pet-name-input');
    const revealTopHeader = document.getElementById('reveal-top-header');
    const nameStep1 = document.getElementById('name-step-1');
    const nameStep2 = document.getElementById('name-step-2');

    if (btnSaveName && nameInput) {
      btnSaveName.addEventListener('click', () => {
        const val = nameInput.value.trim();
        if (!val) {
          alert('¡Por favor escribe un nombre bonito para tu amiguito! 💕');
          return;
        }
        this.state.petName = val;
        window.storageManager.saveState(this.state);
        this.updatePetNamePlaceholders();
        
        // Ocultar cabecera superior (GIF/avatar) y mostrar pantalla limpia del Paso 2
        if (revealTopHeader) revealTopHeader.classList.add('hidden');
        if (nameStep1) nameStep1.classList.add('hidden');
        if (nameStep2) nameStep2.classList.remove('hidden');
      });
    }

    // --- PANTALLA 2: GUARDAR RAZÓN / CHISTE INTERNO (PASO 2) ---
    const btnSaveReason = document.getElementById('btn-save-reason');
    const reasonInput = document.getElementById('pet-name-reason-input');

    if (btnSaveReason) {
      btnSaveReason.addEventListener('click', () => {
        const reasonVal = reasonInput ? reasonInput.value.trim() : '';
        this.state.nameReason = reasonVal || '¡Por puro amor y cariño!';
        window.storageManager.saveState(this.state);

        if (window.confetti) {
          window.confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        }

        // Transicionar al tutorial
        this.switchScreen('tutorial');
      });
    }

    // --- PANTALLA 3: ENTENDIDO, A JUGAR ---
    const btnStartGame = document.getElementById('btn-start-game');
    if (btnStartGame) {
      btnStartGame.addEventListener('click', () => {
        this.switchScreen('dashboard');
      });
    }

    // --- BARRA SUPERIOR: ALTERNAR DÍA 1 / DÍA 2 ---
    const btnToggleDay = document.getElementById('btn-toggle-day');
    if (btnToggleDay) {
      btnToggleDay.addEventListener('click', () => {
        this.state.currentDay = this.state.currentDay === 1 ? 2 : 1;
        window.storageManager.saveState(this.state);
        this.renderCurrentDayView();
      });
    }

    // --- MODALES: ABRIR & CERRAR ---
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-close');
        this.closeModal(modalId);
      });
    });

    // Modal Estado de Ánimo (Día 1 Tarea 2)
    const btnOpenMood = document.getElementById('btn-open-mood-modal');
    if (btnOpenMood) {
      btnOpenMood.addEventListener('click', () => this.openModal('modal-mood'));
    }

    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        window.tasksController.selectedMood = btn.getAttribute('data-mood');
      });
    });

    const btnSaveMood = document.getElementById('btn-save-mood');
    if (btnSaveMood) {
      btnSaveMood.addEventListener('click', () => {
        const selected = window.tasksController.selectedMood;
        if (!selected) {
          alert('Por favor selecciona una emoción del día 😊');
          return;
        }
        const note = document.getElementById('mood-note-input').value;
        this.state.moodHistory.push({
          date: new Date().toLocaleDateString(),
          mood: selected,
          note: note
        });
        window.tasksController.completeTask('mood');
        this.closeModal('modal-mood');
        alert(`✨ Ánimo registrado: "${selected}". ¡Tu amiguito lo ha guardado en su corazón! 💕`);
      });
    }

    // Tarea 3 Día 1: Notificaciones
    const btnNotif = document.getElementById('btn-activate-notif');
    if (btnNotif) {
      btnNotif.addEventListener('click', () => {
        window.tasksController.requestNotificationPermission();
      });
    }

    // Modal Feed (Día 2 Tarea 1)
    const btnOpenFeed = document.getElementById('btn-open-feed-modal');
    if (btnOpenFeed) {
      btnOpenFeed.addEventListener('click', () => this.openModal('modal-feed'));
    }

    const btnPuddingTap = document.getElementById('btn-pudding-tap');
    if (btnPuddingTap) {
      btnPuddingTap.addEventListener('click', () => {
        window.tasksController.tapPuddingFeed();
      });
    }

    // Modal Nota Secreta (Día 2 Tarea 2)
    const btnOpenMemory = document.getElementById('btn-open-memory-modal');
    if (btnOpenMemory) {
      btnOpenMemory.addEventListener('click', () => this.openModal('modal-memory'));
    }

    const btnMemoryDone = document.getElementById('btn-read-memory-done');
    if (btnMemoryDone) {
      btnMemoryDone.addEventListener('click', () => {
        this.closeModal('modal-memory');
        window.tasksController.completeTask('memory');
      });
    }

    // Modal Minijuego (Día 2 Tarea 3)
    const btnOpenMinigame = document.getElementById('btn-open-minigame-modal');
    if (btnOpenMinigame) {
      btnOpenMinigame.addEventListener('click', () => this.openModal('modal-minigame'));
    }

    const btnStartMinigame = document.getElementById('btn-start-minigame');
    if (btnStartMinigame) {
      btnStartMinigame.addEventListener('click', () => {
        window.tasksController.startMinigame();
      });
    }

    // --- BOTÓN PRINCIPAL: ABRIR MODAL DE TAREAS DEL DÍA ---
    const btnOpenTasksModal = document.getElementById('btn-open-tasks-modal');
    if (btnOpenTasksModal) {
      btnOpenTasksModal.addEventListener('click', () => {
        this.openModal('modal-tasks-list');
      });
    }

    // Modal Settings / Supabase
    const btnOpenSettings = document.getElementById('btn-open-settings');
    if (btnOpenSettings) {
      btnOpenSettings.addEventListener('click', () => {
        const cfg = window.storageManager.getSupabaseConfig();
        document.getElementById('cfg-owner-name').value = this.state.ownerName || '';
        document.getElementById('cfg-supabase-url').value = cfg.url || '';
        document.getElementById('cfg-supabase-key').value = cfg.key || '';
        this.openModal('modal-settings');
      });
    }

    const btnSaveSettings = document.getElementById('btn-save-settings');
    if (btnSaveSettings) {
      btnSaveSettings.addEventListener('click', () => {
        const ownerVal = document.getElementById('cfg-owner-name').value.trim();
        if (ownerVal) {
          this.state.ownerName = ownerVal;
          window.storageManager.saveState(this.state);
          this.updatePetNamePlaceholders();
        }

        const url = document.getElementById('cfg-supabase-url').value;
        const key = document.getElementById('cfg-supabase-key').value;
        window.storageManager.saveSupabaseConfig(url, key);
        alert('⚙️ Configuración guardada correctamente.');
        this.closeModal('modal-settings');
      });
    }

    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('¿Estás segura/o de querer reiniciar todo el progreso? Esto borrará el nombre y tareas.')) {
          this.state = window.storageManager.resetState();
          this.updatePetNamePlaceholders();
          this.renderCurrentDayView();
          window.tasksController.updateTasksUI(this.state);
          this.closeModal('modal-settings');
          this.switchScreen('gift');
        }
      });
    }
  }

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  }
}

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
