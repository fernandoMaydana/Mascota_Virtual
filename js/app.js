/* ===================================================
   MAIN APPLICATION CONTROLLER - APP.JS
   =================================================== */

class App {
  constructor() {
    this.state = null;
    this.activeScreen = 'gift';
  }

  async init() {
    console.log("🚀 Inicializando Mascota Virtual App (5 Días)...");
    
    // Cargar estado inicial
    this.state = await window.storageManager.loadState();
    
    // Configurar escuchadores de eventos UI
    this.bindEvents();
    
    // Sincronizar nombre de mascota y dueña en todos los textos
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
    void target.offsetWidth; // Force reflow
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
    const day = parseInt(this.state.currentDay || 1);
    const badge = document.getElementById('dash-day-badge');
    const modalTitle = document.getElementById('tasks-modal-title');
    const dayPicker = document.getElementById('select-day-picker');

    if (badge) badge.textContent = `Día ${day} / 5 🌸`;
    if (modalTitle) modalTitle.textContent = `Tareas del Día ${day}`;
    if (dayPicker) dayPicker.value = day.toString();

    // Ocultar todos los contenedores de días y mostrar solo el activo
    for (let i = 1; i <= 5; i++) {
      const box = document.getElementById(`day-${i}-tasks`);
      if (box) {
        if (i === day) {
          box.classList.remove('hidden');
        } else {
          box.classList.add('hidden');
        }
      }
    }

    // Aplicar tema de color dinámico por día
    if (window.tasksController) {
      window.tasksController.applyDayTheme(day);
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

    // --- PANTALLA 2: GUARDAR NOMBRE (PASO 1 & PASO 2) ---
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
        
        if (revealTopHeader) revealTopHeader.classList.add('hidden');
        if (nameStep1) nameStep1.classList.add('hidden');
        if (nameStep2) nameStep2.classList.remove('hidden');
      });
    }

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

    // --- SELECTOR DE DÍA EN BARRA (1 A 5) ---
    const selectDayPicker = document.getElementById('select-day-picker');
    if (selectDayPicker) {
      selectDayPicker.addEventListener('change', (e) => {
        this.state.currentDay = parseInt(e.target.value);
        window.storageManager.saveState(this.state);
        this.renderCurrentDayView();
        window.tasksController.updateTasksUI(this.state);
      });
    }

    // --- EDITAR NOMBRE DESDE EL DASHBOARD ---
    const btnEditNameTrigger = document.getElementById('btn-edit-pet-name-trigger');
    if (btnEditNameTrigger) {
      btnEditNameTrigger.addEventListener('click', () => {
        const nameStep1 = document.getElementById('name-step-1');
        const nameStep2 = document.getElementById('name-step-2');
        const revealTopHeader = document.getElementById('reveal-top-header');

        // Resetear visibilidad de los pasos
        if (nameStep1) nameStep1.classList.remove('hidden');
        if (nameStep2) nameStep2.classList.add('hidden');
        if (revealTopHeader) revealTopHeader.classList.remove('hidden');

        // Precargar el valor actual del nombre en el campo
        const nameInput = document.getElementById('pet-name-input');
        if (nameInput) nameInput.value = this.state.petName || '';

        // Transicionar a la pantalla de asignación de nombre
        this.switchScreen('reveal');
      });
    }
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-close');
        this.closeModal(modalId);
      });
    });

    // ===================================================
    // DOCK FLOTANTE CLAYMORPHISM - ACCIONES RÁPIDAS
    // ===================================================
    
    // 1. DOCK - TAREAS DEL DÍA (CENTRO FAB ELEVADO)
    const dockTasks = document.getElementById('dock-btn-tasks');
    const oldBtnTasks = document.getElementById('btn-open-tasks-modal');
    const openTasks = () => this.openModal('modal-tasks-list');
    if (dockTasks) dockTasks.addEventListener('click', openTasks);
    if (oldBtnTasks) oldBtnTasks.addEventListener('click', openTasks);

    // 2. DOCK - ALIMENTAR (IZQUIERDA 1)
    const dockFeed = document.getElementById('dock-btn-feed');
    const oldBtnFeed = document.getElementById('btn-quick-feed-pet');
    const dashPurinGif = document.getElementById('dash-purin-gif');

    const handleFeedAction = (e) => {
      if (dashPurinGif) {
        dashPurinGif.src = 'assets/purin_comiendo.gif';
        dashPurinGif.classList.add('eating-active');
      }
      if (window.petController) {
        window.petController.setExpression('eating');
        window.petController.sayQuote('¡Mmmm! ¡Qué pudín tan delicioso! ¡Muchas gracias! 🍮✨');
        if (e && e.clientX) window.petController.spawnFloatingParticle(e.clientX, e.clientY);
      }

      this.state.stats.comida = Math.min(100, this.state.stats.comida + 15);
      window.storageManager.saveState(this.state);
      if (window.tasksController) window.tasksController.updateTasksUI(this.state);

      setTimeout(() => {
        if (dashPurinGif) {
          dashPurinGif.src = 'assets/purin_saludando.gif';
          dashPurinGif.classList.remove('eating-active');
        }
        if (window.petController) {
          window.petController.setExpression('happy');
          window.petController.sayQuote('¡Hazme clic o mantenme presionado para mimarme! 💕');
        }
      }, 10000);
    };

    if (dockFeed) dockFeed.addEventListener('click', handleFeedAction);
    if (oldBtnFeed) oldBtnFeed.addEventListener('click', handleFeedAction);

    // 3. DOCK - DORMIR / MODO NOCHE (IZQUIERDA 2)
    const dockSleep = document.getElementById('dock-btn-sleep');
    const sleepOverlay = document.getElementById('night-sleep-overlay');

    if (dockSleep) {
      dockSleep.addEventListener('click', () => {
        if (sleepOverlay) sleepOverlay.classList.add('active');
        if (window.petController) {
          window.petController.setExpression('happy');
          window.petController.sayQuote('😴 Zzz... ¡Buenas noches! Tomando una siestita reparadora... ✨');
        }

        this.state.stats.energia = Math.min(100, this.state.stats.energia + 25);
        window.storageManager.saveState(this.state);
        if (window.tasksController) window.tasksController.updateTasksUI(this.state);

        setTimeout(() => {
          if (sleepOverlay) sleepOverlay.classList.remove('active');
          if (window.petController) {
            window.petController.sayQuote('¡Desperté lleno de energía y listo para jugar contigo! 🌟');
          }
        }, 5000);
      });
    }

    // 4. DOCK - JUGAR (DERECHA 1)
    const dockPlay = document.getElementById('dock-btn-play');
    if (dockPlay) {
      dockPlay.addEventListener('click', (e) => {
        if (window.petController) {
          window.petController.setExpression('excited');
          window.petController.sayQuote('¡A JUGAR! 🎮 ¡Vamos a divertirnos atrapando pudines!');
          if (e && e.clientX) window.petController.spawnFloatingParticle(e.clientX, e.clientY);
        }
        this.openModal('modal-minigame');
      });
    }

    // 5. DOCK - AJUSTES (DERECHA 2)
    const dockSettings = document.getElementById('dock-btn-settings');
    if (dockSettings) {
      dockSettings.addEventListener('click', () => {
        const cfg = window.storageManager.getSupabaseConfig();
        const ownerInput = document.getElementById('cfg-owner-name');
        const urlInput = document.getElementById('cfg-supabase-url');
        const keyInput = document.getElementById('cfg-supabase-key');
        if (ownerInput) ownerInput.value = this.state.ownerName || '';
        if (urlInput) urlInput.value = cfg.url || '';
        if (keyInput) keyInput.value = cfg.key || '';
        this.openModal('modal-settings');
      });
    }

    // --- EVENEMENTOS DÍA 1 ---
    const btnOpenMood = document.getElementById('btn-open-mood-modal');
    if (btnOpenMood) btnOpenMood.addEventListener('click', () => this.openModal('modal-mood'));

    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        window.tasksController.selectedMood = btn.getAttribute('data-mood');
      });
    });

    const btnSaveMood = document.getElementById('btn-save-mood');
    if (btnSaveMood) {
      btnSaveMood.addEventListener('click', () => {
        const selected = window.tasksController.selectedMood;
        if (!selected) { alert('Selecciona tu emoción 😊'); return; }
        this.state.moodHistory.push({ date: new Date().toLocaleDateString(), mood: selected });
        window.tasksController.completeSpecificTask('day1', 'moodDone');
        this.closeModal('modal-mood');
      });
    }

    const btnNotif = document.getElementById('btn-activate-notif');
    if (btnNotif) btnNotif.addEventListener('click', () => window.tasksController.requestNotificationPermission());

    const btnOpenFavColor = document.getElementById('btn-open-favcolor-modal');
    if (btnOpenFavColor) btnOpenFavColor.addEventListener('click', () => this.openModal('modal-favcolor'));

    const btnSaveFavColor = document.getElementById('btn-save-favcolor');
    if (btnSaveFavColor) {
      btnSaveFavColor.addEventListener('click', () => {
        const val = document.getElementById('favcolor-input').value.trim();
        this.state.ownerAnswers.favColor = val;
        window.tasksController.completeSpecificTask('day1', 'favColorDone');
        this.closeModal('modal-favcolor');
      });
    }

    // --- EVENTOS DÍA 2 ---
    const btnOpenFeed = document.getElementById('btn-open-feed-modal');
    if (btnOpenFeed) btnOpenFeed.addEventListener('click', () => this.openModal('modal-feed'));

    const btnPuddingTap = document.getElementById('btn-pudding-tap');
    if (btnPuddingTap) btnPuddingTap.addEventListener('click', () => window.tasksController.tapPuddingFeed());

    const btnOpenMemory = document.getElementById('btn-open-memory-modal');
    if (btnOpenMemory) btnOpenMemory.addEventListener('click', () => this.openModal('modal-memory'));

    const btnMemoryDone = document.getElementById('btn-read-memory-done');
    if (btnMemoryDone) {
      btnMemoryDone.addEventListener('click', () => {
        this.closeModal('modal-memory');
        window.tasksController.completeSpecificTask('day2', 'memoryDone');
      });
    }

    const btnOpenMinigame = document.getElementById('btn-open-minigame-modal');
    if (btnOpenMinigame) btnOpenMinigame.addEventListener('click', () => this.openModal('modal-minigame'));

    const btnStartMinigame = document.getElementById('btn-start-minigame');
    if (btnStartMinigame) btnStartMinigame.addEventListener('click', () => window.tasksController.startMinigame());

    const btnOpenMusic = document.getElementById('btn-open-music-modal');
    if (btnOpenMusic) btnOpenMusic.addEventListener('click', () => this.openModal('modal-music'));

    const btnSaveMusic = document.getElementById('btn-save-music');
    if (btnSaveMusic) {
      btnSaveMusic.addEventListener('click', () => {
        this.state.ownerAnswers.favMusic = document.getElementById('music-input').value.trim();
        window.tasksController.completeSpecificTask('day2', 'musicDone');
        this.closeModal('modal-music');
      });
    }

    // --- EVENTOS DÍA 3 ---
    const btnDoSleep = document.getElementById('btn-do-sleep-task');
    if (btnDoSleep) {
      btnDoSleep.addEventListener('click', () => {
        if (window.petController) {
          window.petController.setExpression('eating');
          window.petController.sayQuote('😴 Zzz... ¡Gracias por tu abrigador abrazo para mi siestita!');
        }
        window.tasksController.completeSpecificTask('day3', 'sleepDone');
      });
    }

    const btnOpenHappyPlace = document.getElementById('btn-open-happyplace-modal');
    if (btnOpenHappyPlace) btnOpenHappyPlace.addEventListener('click', () => this.openModal('modal-happyplace'));

    const btnSaveHappyPlace = document.getElementById('btn-save-happyplace');
    if (btnSaveHappyPlace) {
      btnSaveHappyPlace.addEventListener('click', () => {
        this.state.ownerAnswers.happyPlace = document.getElementById('happyplace-input').value.trim();
        window.tasksController.completeSpecificTask('day3', 'happyPlaceDone');
        this.closeModal('modal-happyplace');
      });
    }

    const btnOpenAlbum = document.getElementById('btn-open-album-modal');
    if (btnOpenAlbum) btnOpenAlbum.addEventListener('click', () => this.openModal('modal-album'));

    const btnCloseAlbum = document.getElementById('btn-close-album');
    if (btnCloseAlbum) {
      btnCloseAlbum.addEventListener('click', () => {
        window.tasksController.completeSpecificTask('day3', 'albumDone');
        this.closeModal('modal-album');
      });
    }

    const btnOpenStarGame = document.getElementById('btn-open-stargame-modal');
    if (btnOpenStarGame) btnOpenStarGame.addEventListener('click', () => this.openModal('modal-stargame'));

    const btnStartStarGame = document.getElementById('btn-start-stargame');
    if (btnStartStarGame) btnStartStarGame.addEventListener('click', () => window.tasksController.startStarGame());

    // --- EVENTOS DÍA 4 ---
    const btnGiveCookie = document.getElementById('btn-give-cookie');
    if (btnGiveCookie) {
      btnGiveCookie.addEventListener('click', () => {
        if (window.petController) {
          window.petController.setExpression('eating');
          window.petController.sayQuote('🧁 ¡Mmm! ¡La galleta más crujiente y rica!');
        }
        window.tasksController.completeSpecificTask('day4', 'cookieDone');
      });
    }

    const btnOpenGratitude = document.getElementById('btn-open-gratitude-modal');
    if (btnOpenGratitude) btnOpenGratitude.addEventListener('click', () => this.openModal('modal-gratitude'));

    const btnSaveGratitude = document.getElementById('btn-save-gratitude');
    if (btnSaveGratitude) {
      btnSaveGratitude.addEventListener('click', () => {
        this.state.ownerAnswers.gratitude = document.getElementById('gratitude-input').value.trim();
        window.tasksController.completeSpecificTask('day4', 'gratitudeDone');
        this.closeModal('modal-gratitude');
      });
    }

    const btnOpenTrivia = document.getElementById('btn-open-trivia-modal');
    if (btnOpenTrivia) btnOpenTrivia.addEventListener('click', () => this.openModal('modal-trivia'));

    const btnSaveTrivia = document.getElementById('btn-save-trivia');
    if (btnSaveTrivia) {
      btnSaveTrivia.addEventListener('click', () => {
        this.state.ownerAnswers.trivia = document.getElementById('trivia-input').value.trim();
        window.tasksController.completeSpecificTask('day4', 'triviaDone');
        this.closeModal('modal-trivia');
      });
    }

    const btnOpenBubbles = document.getElementById('btn-open-bubbles-modal');
    if (btnOpenBubbles) btnOpenBubbles.addEventListener('click', () => this.openModal('modal-bubbles'));

    const btnStartBubbles = document.getElementById('btn-start-bubbles');
    if (btnStartBubbles) btnStartBubbles.addEventListener('click', () => window.tasksController.startBubbleGame());

    // --- EVENTOS DÍA 5 (SORPRESA FINAL 🎉) ---
    const btnGiveCake = document.getElementById('btn-give-cake');
    if (btnGiveCake) {
      btnGiveCake.addEventListener('click', () => {
        if (window.petController) {
          window.petController.setExpression('excited');
          window.petController.sayQuote('🎂 ¡FELIZ ANIVERSARIO DE 5 DÍAS! 🎂');
        }
        window.tasksController.completeSpecificTask('day5', 'cakeDone');
      });
    }

    const btnOpenFinalGift = document.getElementById('btn-open-final-gift-modal');
    if (btnOpenFinalGift) btnOpenFinalGift.addEventListener('click', () => this.openModal('modal-finalgift'));

    const btnReadFinalGift = document.getElementById('btn-read-finalgift-done');
    if (btnReadFinalGift) {
      btnReadFinalGift.addEventListener('click', () => {
        window.tasksController.completeSpecificTask('day5', 'surpriseGiftDone');
        this.closeModal('modal-finalgift');
      });
    }

    const btnOpenWish = document.getElementById('btn-open-wish-modal');
    if (btnOpenWish) btnOpenWish.addEventListener('click', () => this.openModal('modal-wish'));

    const btnSaveWish = document.getElementById('btn-save-wish');
    if (btnSaveWish) {
      btnSaveWish.addEventListener('click', () => {
        this.state.ownerAnswers.finalWish = document.getElementById('wish-input').value.trim();
        window.tasksController.completeSpecificTask('day5', 'wishMessageDone');
        this.closeModal('modal-wish');
      });
    }

    const btnTriggerFireworks = document.getElementById('btn-trigger-fireworks');
    if (btnTriggerFireworks) {
      btnTriggerFireworks.addEventListener('click', () => {
        if (window.confetti) {
          window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.4 } });
        }
        window.tasksController.completeSpecificTask('day5', 'partyFireworksDone');
        alert('🎆 ¡Felicidades por completar los 5 días maravillosos con tu mascota virtual! 🎉💖');
      });
    }

    // --- AJUSTES / SETTINGS ---
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
