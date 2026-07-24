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

    // Inicializar música de fondo con auto-inicio y control inteligente
    this.initBackgroundMusic();

    // Limpiar estado de sueño viejo de testing si supera 60s
    if (this.state.sleepState && this.state.sleepState.totalDurationSec > 60) {
      this.state.sleepState.isSleeping = false;
      this.state.sleepState.totalDurationSec = 10;
      window.storageManager.saveState(this.state);
    }

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

  // Cambiar pantalla con animación suave y reseteo de pasos
  switchScreen(screenId) {
    const current = document.querySelector('.screen.active');
    const target = document.getElementById(`screen-${screenId}`);

    if (!target) return;

    if (current) {
      current.classList.remove('active');
      current.classList.add('hidden');
    }

    // Reseteo de visibilidad de pasos internos para la pantalla de revelación de nombre
    if (screenId === 'reveal') {
      const nameStep1 = document.getElementById('name-step-1');
      const nameStep2 = document.getElementById('name-step-2');
      if (nameStep1) nameStep1.classList.remove('hidden');
      if (nameStep2) nameStep2.classList.add('hidden');
    }

    target.classList.remove('hidden');
    void target.offsetWidth; // Force reflow
    target.classList.add('active');

    // Control de visibilidad del Dock Flotante Inferior (Solo visible en Dashboard)
    const dockNav = document.querySelector('.clay-bottom-dock');
    if (dockNav) {
      if (screenId === 'dashboard') {
        dockNav.classList.remove('hidden');
      } else {
        dockNav.classList.add('hidden');
      }
    }

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

    const foodItems = [
      { name: 'Pastel 🍰', gif: 'assets/feed/feed_pastel.gif', fallbackGif: 'assets/purin_comiendo.gif', quote: '¡Mmmm pastel delicioso! 🍰✨', particle: '🍰' },
      { name: 'Pizza 🍕', gif: 'assets/feed/feed_pizza.gif', fallbackGif: 'assets/purin_comiendo.gif', quote: '¡Qué pizza tan sabrosa! 🍕✨', particle: '🍕' },
      { name: 'Agua 💧', gif: 'assets/feed/feed_agua.gif', fallbackGif: 'assets/purin_comiendo.gif', quote: '¡Refrescante agüita pura! 💧✨', particle: '💧' }
    ];

    const handleFeedAction = (e) => {
      const selectedFood = foodItems[Math.floor(Math.random() * foodItems.length)];
      
      if (dashPurinGif) {
        dashPurinGif.src = selectedFood.gif;
        dashPurinGif.onerror = () => { dashPurinGif.src = selectedFood.fallbackGif; };
        dashPurinGif.classList.add('eating-active');
      }
      if (window.petController) {
        window.petController.setExpression('eating');
        window.petController.sayQuote(selectedFood.quote);
        if (e && e.clientX) window.petController.spawnFloatingParticle(e.clientX, e.clientY);
      }

      this.state.stats.comida = Math.min(100, (this.state.stats.comida || 30) + 15);
      window.storageManager.saveState(this.state);
      if (window.tasksController) window.tasksController.updateStatsUI(this.state.stats);

      if (this.feedTimer) clearTimeout(this.feedTimer);
      this.feedTimer = setTimeout(() => {
        if (dashPurinGif) {
          dashPurinGif.src = 'assets/purin_saludando.gif';
          dashPurinGif.classList.remove('eating-active');
        }
        if (window.petController) {
          window.petController.setExpression('happy');
        }
      }, 10000);
    };

    if (dockFeed) dockFeed.addEventListener('click', handleFeedAction);
    if (oldBtnFeed) oldBtnFeed.addEventListener('click', handleFeedAction);

    // 3. DOCK - DORMIR / SIESTA ININTERRUMPIDA (10 MIN / 30 MIN)
    const dockSleep = document.getElementById('dock-btn-sleep');
    const sleepOverlay = document.getElementById('night-sleep-overlay');
    const nightTimerText = document.getElementById('night-timer-text');
    const dockNav = document.querySelector('.clay-bottom-dock');

    const updateTimerText = (remainingSec) => {
      if (!nightTimerText) return;
      const m = Math.floor(remainingSec / 60).toString().padStart(2, '0');
      const s = (remainingSec % 60).toString().padStart(2, '0');
      nightTimerText.textContent = `⏱️ Tiempo restante: ${m}:${s}`;
    };

    const wakeUp = () => {
      if (this.sleepTimerInterval) clearInterval(this.sleepTimerInterval);

      // Al sonar el despertador (00:00), recargar energía al 100%
      this.state.stats.energia = 100;
      if (this.state.sleepState) {
        this.state.sleepState.isSleeping = false;
      }
      window.storageManager.saveState(this.state);

      if (sleepOverlay) sleepOverlay.classList.remove('active');
      if (dashPurinGif) dashPurinGif.src = 'assets/purin_saludando.gif';
      
      // Volver a mostrar el Dock flotante en el Dashboard
      if (dockNav && this.activeScreen === 'dashboard') {
        dockNav.classList.remove('hidden');
      }

      if (window.confetti) {
        window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
      if (window.tasksController) window.tasksController.updateTasksUI(this.state);
      if (window.petController) {
        window.petController.sayQuote('¡Desperté renovado y con 100% de energía! 🌟');
      }

      // Reanudar música de fondo al despertar de la siesta
      this.resumeBackgroundMusic();
    };

    const tickSleep = () => {
      if (!this.state.sleepState || !this.state.sleepState.isSleeping) return;
      const elapsedSec = Math.floor((Date.now() - this.state.sleepState.startTime) / 1000);
      const totalSec = this.state.sleepState.totalDurationSec || 10; // 10 segundos en testing
      const remainingSec = Math.max(0, totalSec - elapsedSec);

      updateTimerText(remainingSec);

      if (remainingSec <= 0) {
        wakeUp();
      }
    };

    const startSleeping = () => {
      // MODO PRUEBA / TESTING: 10 SEGUNDOS DE SIESTA
      const sleepSeconds = 10;

      // Pausar música de fondo durante la siesta
      this.pauseBackgroundMusic();

      this.state.sleepState = {
        isSleeping: true,
        startTime: Date.now(),
        totalDurationSec: sleepSeconds,
        initialEnergy: this.state.stats.energia || 20
      };
      window.storageManager.saveState(this.state);

      // Ocultar Dock flotante durante la siesta para despejar la pantalla
      if (dockNav) dockNav.classList.add('hidden');

      // Cambiar a GIF de dormir (assets/purin_durmiendo.gif)
      if (dashPurinGif) {
        dashPurinGif.src = 'assets/purin_durmiendo.gif';
      }

      if (sleepOverlay) sleepOverlay.classList.add('active');
      updateTimerText(sleepSeconds);

      if (this.sleepTimerInterval) clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = setInterval(tickSleep, 1000);
    };

    if (dockSleep) dockSleep.addEventListener('click', startSleeping);

    // 4. DOCK - JUGAR (HUB DE 3 MINIJUEGOS)
    const dockPlay = document.getElementById('dock-btn-play');
    const hubView = document.getElementById('minigame-hub-view');
    const viewportView = document.getElementById('minigame-viewport-view');
    const btnBackToHub = document.getElementById('btn-back-to-hub');
    const activeGameTitle = document.getElementById('active-game-title');

    const showGameHub = () => {
      if (hubView) hubView.classList.remove('hidden');
      if (viewportView) viewportView.classList.add('hidden');
      this.stopActiveMinigames();
    };

    if (btnBackToHub) btnBackToHub.addEventListener('click', showGameHub);

    const launchGameStage = (stageId, title) => {
      if (hubView) hubView.classList.add('hidden');
      if (viewportView) viewportView.classList.remove('hidden');
      if (activeGameTitle) activeGameTitle.textContent = title;

      document.querySelectorAll('.game-stage').forEach(el => el.classList.add('hidden'));
      const activeStage = document.getElementById(`stage-${stageId}`);
      if (activeStage) activeStage.classList.remove('hidden');
    };

    if (dockPlay) {
      dockPlay.addEventListener('click', (e) => {
        if (window.petController) {
          window.petController.setExpression('excited');
          window.petController.sayQuote('¡A JUGAR! 🎮 Elige tu minijuego favorito');
          if (e && e.clientX) window.petController.spawnFloatingParticle(e.clientX, e.clientY);
        }
        showGameHub();
        this.openModal('modal-minigame');
      });
    }

    // --- JUEGO 1: PONCHO RUNNER (SALTA CHARCOS Y ATRAPA PUDINES) ---
    const btnLaunchRunner = document.getElementById('btn-launch-runner');
    const btnStartRunner = document.getElementById('btn-start-runner');
    if (btnLaunchRunner) btnLaunchRunner.addEventListener('click', () => launchGameStage('runner', 'Poncho Runner 🏃'));
    if (btnStartRunner) btnStartRunner.addEventListener('click', () => this.startPonchoRunnerGame());

    // --- JUEGO 2: MEMORIA DE PUDINES (4x3 / 6 PARES) ---
    const btnLaunchMemory = document.getElementById('btn-launch-memory');
    const btnStartMemory = document.getElementById('btn-start-memory');
    if (btnLaunchMemory) btnLaunchMemory.addEventListener('click', () => launchGameStage('memory', 'Memoria de Pudines 🧠'));
    if (btnStartMemory) btnStartMemory.addEventListener('click', () => this.startMemoryGame());

    // --- JUEGO 3: POP-POP PUDÍN (BURBUJAS 20s) ---
    const btnLaunchBubbles = document.getElementById('btn-launch-bubbles');
    const btnStartBubblesGame = document.getElementById('btn-start-bubbles-game');
    if (btnLaunchBubbles) btnLaunchBubbles.addEventListener('click', () => launchGameStage('bubbles', 'Pop-Pop Pudín 🎈'));
    if (btnStartBubblesGame) btnStartBubblesGame.addEventListener('click', () => this.startPopBubblesGame());

    // --- BOTÓN DE AJUSTES ⚙️ EN EL HEADER SUPERIOR ---
    const btnTopSettings = document.getElementById('btn-top-settings');
    const openSettingsModal = () => {
      const cfg = window.storageManager.getSupabaseConfig();
      const ownerInput = document.getElementById('cfg-owner-name');
      const urlInput = document.getElementById('cfg-supabase-url');
      const keyInput = document.getElementById('cfg-supabase-key');
      if (ownerInput) ownerInput.value = this.state.ownerName || '';
      if (urlInput) urlInput.value = cfg.url || '';
      if (keyInput) keyInput.value = cfg.key || '';
      this.openModal('modal-settings');
    };

    if (btnTopSettings) btnTopSettings.addEventListener('click', openSettingsModal);

    // Sintetizador de música de baile alegre (Fallback si no existen los MP3)
    const playFallbackDanceMusic = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        const ctx = new AudioCtx();
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        let step = 0;
        const interval = setInterval(() => {
          if (step > 30) { clearInterval(interval); return; }
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = notes[step % notes.length];
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
          step++;
        }, 450);
        return { stop: () => { clearInterval(interval); ctx.close(); } };
      } catch (err) { return null; }
    };

    // 5. DOCK - BAILAR 💃 (10 GIFs ALEATORIOS Y MÚSICA DE 15 SEGUNDOS)
    const dockDance = document.getElementById('dock-btn-dance');
    if (dockDance) {
      dockDance.addEventListener('click', (e) => {
        // Pausar música suave de fondo mientras bailamos
        this.pauseBackgroundMusic();

        // Elegir aleatoriamente 1 de los 10 GIFs de baile
        const randomDanceIndex = Math.floor(Math.random() * 10) + 1;
        const danceGifUrl = `assets/dance/dance${randomDanceIndex}.gif`;

        // Elegir aleatoriamente 1 de las 5 canciones de baile
        const randomSongIndex = Math.floor(Math.random() * 5) + 1;
        const songUrl = `assets/music/song${randomSongIndex}.mp3`;

        // Reproducir audio con fallback sintetizado
        if (this.currentDanceAudio) {
          try { this.currentDanceAudio.pause(); } catch(e){}
        }
        if (this.currentSynthDance) {
          try { this.currentSynthDance.stop(); } catch(e){}
        }

        const audio = new Audio(songUrl);
        this.currentDanceAudio = audio;
        audio.play().catch(() => {
          this.currentSynthDance = playFallbackDanceMusic();
        });

        if (dashPurinGif) {
          dashPurinGif.src = danceGifUrl;
          dashPurinGif.onerror = () => { dashPurinGif.src = 'assets/purin_saludando.gif'; };
          dashPurinGif.classList.add('eating-active');
        }

        if (window.petController) {
          window.petController.setExpression('excited');
          window.petController.sayQuote(`¡A BAILAR! 💃🎶 ¡Disfrutando el ritmo por 15 segundos!`);
          if (e && e.clientX) {
            window.petController.spawnFloatingParticle(e.clientX, e.clientY);
          }
        }

        if (window.confetti) {
          window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }

        // Aumentar Ánimo un +15% por bailar
        this.state.stats.mimos = Math.min(100, (this.state.stats.mimos || 25) + 15);
        window.storageManager.saveState(this.state);
        if (window.tasksController) window.tasksController.updateStatsUI(this.state.stats);

        // Terminar la fiesta de baile exactamente a los 15 segundos
        if (this.danceTimer) clearTimeout(this.danceTimer);
        this.danceTimer = setTimeout(() => {
          if (this.currentDanceAudio) {
            try { this.currentDanceAudio.pause(); } catch(e){}
          }
          if (this.currentSynthDance) {
            try { this.currentSynthDance.stop(); } catch(e){}
          }
          if (dashPurinGif) {
            dashPurinGif.src = 'assets/purin_saludando.gif';
            dashPurinGif.classList.remove('eating-active');
          }
          if (window.petController) {
            window.petController.setExpression('happy');
            window.petController.sayQuote('¡Qué baile tan genial por 15 segundos! 💕');
          }

          // Reanudar música suave de fondo al finalizar el baile
          this.resumeBackgroundMusic();
        }, 15000);
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
    if (modalId === 'modal-minigame') {
      this.pauseBackgroundMusic();
    }
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
    if (modalId === 'modal-minigame') {
      this.resumeBackgroundMusic();
    }
  }

  // --- GESTOR DE MÚSICA DE FONDO (AUTO-INICIO, PAUSA EN SUEÑO/BAILE/JUEGO) ---
  initBackgroundMusic() {
    this.bgAudio = new Audio('assets/music/bg_music.mp3');
    this.bgAudio.loop = true;
    this.bgAudio.volume = 0.3;
    this.isBgMusicPlaying = false;
    this.isBgMusicMuted = false;

    const btnTopMusic = document.getElementById('btn-top-music');
    const musicIcon = document.getElementById('music-top-icon');

    const updateIcon = () => {
      if (musicIcon) {
        musicIcon.textContent = this.isBgMusicPlaying && !this.isBgMusicMuted ? '🎵' : '🔇';
      }
    };

    if (btnTopMusic) {
      btnTopMusic.addEventListener('click', () => {
        if (this.isBgMusicPlaying) {
          this.pauseBackgroundMusic(true);
        } else {
          this.resumeBackgroundMusic(true);
        }
        updateIcon();
      });
    }

    // Intentar reproducción inmediata al cargar la app
    this.resumeBackgroundMusic();
    updateIcon();

    // Desbloquear instantáneamente al primer toque/clic por política de navegadores
    const unlockAudioOnGesture = () => {
      if (!this.isBgMusicPlaying && !this.isBgMusicMuted) {
        this.resumeBackgroundMusic();
        updateIcon();
      }
      ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
        document.removeEventListener(evt, unlockAudioOnGesture);
      });
    };

    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
      document.addEventListener(evt, unlockAudioOnGesture, { once: true });
    });
  }

  pauseBackgroundMusic(userInitiated = false) {
    if (userInitiated) this.isBgMusicMuted = true;
    if (this.bgAudio) {
      try { this.bgAudio.pause(); } catch(e){}
    }
    this.isBgMusicPlaying = false;
  }

  resumeBackgroundMusic(userInitiated = false) {
    if (userInitiated) this.isBgMusicMuted = false;
    if (this.isBgMusicMuted) return;

    if (this.bgAudio) {
      this.bgAudio.play().then(() => {
        this.isBgMusicPlaying = true;
      }).catch((err) => {
        // Buscar sí o sí la canción assets/music/bg_music.mp3 sin melodías sintéticas
        console.log('Buscando archivo de música: assets/music/bg_music.mp3');
        this.isBgMusicPlaying = false;
      });
    }
  }
  stopActiveMinigames() {
    if (this.runnerInterval) clearInterval(this.runnerInterval);
    if (this.runnerFrame) cancelAnimationFrame(this.runnerFrame);
    if (this.bubbleSpawnInterval) clearInterval(this.bubbleSpawnInterval);
    if (this.bubbleTimerInterval) clearInterval(this.bubbleTimerInterval);
    if (this.runnerKeyHandler) {
      document.removeEventListener('keydown', this.runnerKeyHandler);
    }
  }

  // 🏃 1. PONCHO RUNNER (SALTA CHARCOS Y ATRAPA PUDINES)
  startPonchoRunnerGame() {
    this.stopActiveMinigames();

    const ponchoEl = document.getElementById('runner-poncho');
    const arenaEl = document.getElementById('runner-arena');
    const scoreVal = document.getElementById('runner-score-val');
    const btnStart = document.getElementById('btn-start-runner');

    if (!ponchoEl || !arenaEl) return;
    if (btnStart) btnStart.textContent = '¡Saltar! 🚀';

    let score = 0;
    let ponchoY = 0;
    let velocityY = 0;
    const gravity = 0.7;
    let isJumping = false;
    let isGameOver = false;
    let obstacles = [];
    let puddings = [];

    ponchoEl.textContent = '🐶';
    ponchoEl.style.bottom = '24px';
    if (scoreVal) scoreVal.textContent = '0';

    // Limpiar obstáculos anteriores
    arenaEl.querySelectorAll('.runner-obstacle, .runner-pudding').forEach(e => e.remove());

    const jump = () => {
      if (isGameOver) return;
      if (!isJumping) {
        velocityY = 13;
        isJumping = true;
      }
    };

    this.runnerKeyHandler = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    document.addEventListener('keydown', this.runnerKeyHandler);
    arenaEl.onclick = jump;
    arenaEl.ontouchstart = (e) => { e.preventDefault(); jump(); };

    let spawnTimer = 0;
    let frameCount = 0;

    const gameLoop = () => {
      if (isGameOver) return;

      // Física de salto
      ponchoY += velocityY;
      velocityY -= gravity;

      if (ponchoY <= 0) {
        ponchoY = 0;
        velocityY = 0;
        isJumping = false;
      }
      ponchoEl.style.bottom = `${24 + ponchoY}px`;

      // Generar obstáculos y pudines cada N frames
      frameCount++;
      if (frameCount > 80) {
        frameCount = 0;
        if (Math.random() > 0.35) {
          // Obstáculo (Charco / Nube de Lluvia)
          const obs = document.createElement('div');
          obs.className = 'runner-obstacle';
          obs.textContent = Math.random() > 0.5 ? '🌧️' : '🌊';
          obs.style.right = '-30px';
          arenaEl.appendChild(obs);
          obstacles.push({ el: obs, x: arenaEl.clientWidth });
        } else {
          // Pudín flotante
          const pud = document.createElement('div');
          pud.className = 'runner-pudding';
          pud.textContent = '🍮';
          pud.style.right = '-30px';
          arenaEl.appendChild(pud);
          puddings.push({ el: pud, x: arenaEl.clientWidth });
        }
      }

      // Mover obstáculos
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= 4.5;
        obs.el.style.right = `${arenaEl.clientWidth - obs.x}px`;

        // Colisión con Poncho
        if (obs.x > 20 && obs.x < 65 && ponchoY < 30) {
          isGameOver = true;
          ponchoEl.textContent = '🥺';
          if (window.petController) window.petController.setExpression('petting');
          alert(`¡Oh no! Poncho tropezó con un charquito 🌧️\nPuntaje Final: ${score} pts`);
          if (btnStart) btnStart.textContent = '¡Intentar de nuevo! 🔄';
          return;
        }

        if (obs.x < -30) {
          obs.el.remove();
          obstacles.splice(i, 1);
        }
      }

      // Mover pudines
      for (let i = puddings.length - 1; i >= 0; i--) {
        const pud = puddings[i];
        pud.x -= 4.5;
        pud.el.style.right = `${arenaEl.clientWidth - pud.x}px`;

        // Atrapar pudín
        if (pud.x > 20 && pud.x < 65 && ponchoY > 35) {
          score += 10;
          if (scoreVal) scoreVal.textContent = score;
          if (window.confetti) window.confetti({ particleCount: 20, spread: 40 });
          pud.el.remove();
          puddings.splice(i, 1);

          // Completar tarea
          if (window.tasksController) window.tasksController.completeSpecificTask('day2', 'minigameDone');
        } else if (pud.x < -30) {
          pud.el.remove();
          puddings.splice(i, 1);
        }
      }

      this.runnerFrame = requestAnimationFrame(gameLoop);
    };

    this.runnerFrame = requestAnimationFrame(gameLoop);
  }

  // 🧠 2. MEMORIA DE PUDINES (4x3 GRID / 6 PARES)
  startMemoryGame() {
    this.stopActiveMinigames();

    const gridEl = document.getElementById('memory-grid');
    const pairsVal = document.getElementById('memory-pairs-val');
    const btnStart = document.getElementById('btn-start-memory');
    if (!gridEl) return;

    if (btnStart) btnStart.textContent = '¡Mezclar e Iniciar! 🧠';
    gridEl.innerHTML = '';
    if (pairsVal) pairsVal.textContent = '0';

    const icons = ['🍮', '🌸', '🎀', '🍰', '⭐', '💖'];
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;

    deck.forEach(icon => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.icon = icon;
      card.textContent = '❓';

      card.addEventListener('click', () => {
        if (lockBoard || card === firstCard || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.textContent = icon;

        if (!firstCard) {
          firstCard = card;
          return;
        }

        secondCard = card;
        lockBoard = true;

        if (firstCard.dataset.icon === secondCard.dataset.icon) {
          firstCard.classList.add('matched');
          secondCard.classList.add('matched');
          matchedPairs++;
          if (pairsVal) pairsVal.textContent = matchedPairs;

          firstCard = null;
          secondCard = null;
          lockBoard = false;

          if (matchedPairs === 6) {
            if (window.confetti) window.confetti({ particleCount: 80, spread: 70 });
            if (window.petController) window.petController.sayQuote('¡Increíble memoria! ¡Encontraste todos los pares! 🎉');
            if (window.tasksController) window.tasksController.completeSpecificTask('day2', 'minigameDone');
            if (btnStart) btnStart.textContent = '¡Jugar de Nuevo! 🌟';
          }
        } else {
          setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            firstCard.textContent = '❓';
            secondCard.textContent = '❓';
            firstCard = null;
            secondCard = null;
            lockBoard = false;
          }, 800);
        }
      });

      gridEl.appendChild(card);
    });
  }

  // 🎈 3. POP-POP PUDÍN (BURBUJAS 20 SEGUNDOS)
  startPopBubblesGame() {
    this.stopActiveMinigames();

    const arenaEl = document.getElementById('bubbles-arena');
    const scoreVal = document.getElementById('bubbles-score-val');
    const timerVal = document.getElementById('bubbles-timer-val');
    const btnStart = document.getElementById('btn-start-bubbles-game');

    if (!arenaEl) return;
    arenaEl.innerHTML = '';
    let score = 0;
    let timeLeft = 20;

    if (scoreVal) scoreVal.textContent = '0';
    if (timerVal) timerVal.textContent = '20';
    if (btnStart) btnStart.textContent = '¡En Progreso...! 🎈';

    // Generador de burbujas flotantes
    this.bubbleSpawnInterval = setInterval(() => {
      const bubble = document.createElement('div');
      const rand = Math.random();

      let typeClass = 'bubble-normal';
      let content = '🌸';
      let pts = 1;

      if (rand > 0.7) {
        typeClass = 'bubble-pudding';
        content = '🍮';
        pts = 5;
      } else if (rand > 0.5) {
        typeClass = 'bubble-star';
        content = '⭐';
        pts = 2;
      }

      bubble.className = `popping-bubble ${typeClass}`;
      bubble.textContent = content;

      const size = Math.floor(Math.random() * 20) + 40;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * (arenaEl.clientWidth - size)}px`;
      bubble.style.bottom = '-50px';

      let bottomPos = -50;
      const speed = Math.random() * 1.5 + 1.2;

      const floatLoop = setInterval(() => {
        bottomPos += speed;
        bubble.style.bottom = `${bottomPos}px`;
        if (bottomPos > arenaEl.clientHeight + 50) {
          clearInterval(floatLoop);
          bubble.remove();
        }
      }, 20);

      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        clearInterval(floatLoop);
        score += pts;
        if (typeClass === 'bubble-star') timeLeft += 2;
        if (scoreVal) scoreVal.textContent = score;

        bubble.style.transform = 'scale(1.4)';
        bubble.style.opacity = '0';
        setTimeout(() => bubble.remove(), 100);
      });

      arenaEl.appendChild(bubble);
    }, 450);

    // Temporizador descendente
    this.bubbleTimerInterval = setInterval(() => {
      timeLeft--;
      if (timerVal) timerVal.textContent = Math.max(0, timeLeft);

      if (timeLeft <= 0) {
        this.stopActiveMinigames();
        arenaEl.innerHTML = '';

        // Recargar +15% de energía a Poncho
        this.state.stats.energia = Math.min(100, (this.state.stats.energia || 20) + 15);
        window.storageManager.saveState(this.state);
        if (window.tasksController) {
          window.tasksController.updateStatsUI(this.state.stats);
          window.tasksController.completeSpecificTask('day2', 'minigameDone');
        }

        if (window.confetti) window.confetti({ particleCount: 70, spread: 60 });
        alert(`¡Tiempo Agotado! 🎈\nExplotaste burbujas para sumar ${score} pts.\n¡Energía de Poncho aumentada un +15%! ⚡`);
        if (btnStart) btnStart.textContent = '¡Explotar de Nuevo! 🎈';
      }
    }, 1000);
  }
}

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
