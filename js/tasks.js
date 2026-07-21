/* ===================================================
   TASKS & MINI-GAMES CONTROLLER (DAY 1 & DAY 2) - TASKS.JS
   =================================================== */

class TasksController {
  constructor() {
    this.selectedMood = null;
    this.feedCount = 0;
    this.minigameScore = 0;
    this.minigameActive = false;
    this.basketX = 50; // Porcentaje de 0 a 100
  }

  // Actualizar renderizado visual de tareas según estado actual
  updateTasksUI(state) {
    // DÍA 1
    const d1 = state.day1 || {};
    this.setTaskStatus('mimo', d1.mimoDone);
    this.setTaskStatus('mood', d1.moodDone);
    this.setTaskStatus('notif', d1.notifDone);

    const d1Count = (d1.mimoDone ? 1 : 0) + (d1.moodDone ? 1 : 0) + (d1.notifDone ? 1 : 0);
    const badge1 = document.getElementById('day1-progress-badge');
    if (badge1) {
      badge1.textContent = d1Count === 3 ? '3/3 ¡Día 1 Completado! 🎉' : `${d1Count}/3 completadas`;
      if (d1Count === 3) badge1.style.background = '#C8E6C9';
    }

    // DÍA 2
    const d2 = state.day2 || {};
    this.setTaskStatus('feed', d2.feedDone);
    this.setTaskStatus('memory', d2.memoryDone);
    this.setTaskStatus('minigame', d2.minigameDone);

    const d2Count = (d2.feedDone ? 1 : 0) + (d2.memoryDone ? 1 : 0) + (d2.minigameDone ? 1 : 0);
    const badge2 = document.getElementById('day2-progress-badge');
    if (badge2) {
      badge2.textContent = d2Count === 3 ? '3/3 ¡Día 2 Completado! 🎉' : `${d2Count}/3 completadas`;
      if (d2Count === 3) badge2.style.background = '#C8E6C9';
    }

    // Actualizar barras de estado
    this.updateStatsUI(state.stats);
  }

  setTaskStatus(taskKey, isDone) {
    const card = document.getElementById(`task-card-${taskKey}`);
    const check = document.getElementById(`check-${taskKey}`);
    if (card && check) {
      if (isDone) {
        card.classList.add('completed');
        check.textContent = '✅';
      } else {
        card.classList.remove('completed');
        check.textContent = '⬜';
      }
    }
  }

  updateStatsUI(stats) {
    if (!stats) return;
    const barM = document.getElementById('bar-mimos');
    const valM = document.getElementById('val-mimos');
    if (barM && valM) {
      barM.style.width = `${stats.mimos}%`;
      valM.textContent = `${stats.mimos}%`;
    }

    const barC = document.getElementById('bar-comida');
    const valC = document.getElementById('val-comida');
    if (barC && valC) {
      barC.style.width = `${stats.comida}%`;
      valC.textContent = `${stats.comida}%`;
    }

    const barE = document.getElementById('bar-energia');
    const valE = document.getElementById('val-energia');
    if (barE && valE) {
      barE.style.width = `${stats.energia}%`;
      valE.textContent = `${stats.energia}%`;
    }
  }

  // Marcar tarea completada
  async completeTask(taskKey) {
    const state = window.app.state;

    if (taskKey === 'mimo' && !state.day1.mimoDone) {
      state.day1.mimoDone = true;
      state.stats.mimos = Math.min(100, state.stats.mimos + 20);
      document.getElementById('mimo-status-text').textContent = '¡Tarea completada! 💕';
    } else if (taskKey === 'mood' && !state.day1.moodDone) {
      state.day1.moodDone = true;
      state.stats.energia = Math.min(100, state.stats.energia + 15);
    } else if (taskKey === 'notif' && !state.day1.notifDone) {
      state.day1.notifDone = true;
      state.stats.comida = Math.min(100, state.stats.comida + 15);
    } else if (taskKey === 'feed' && !state.day2.feedDone) {
      state.day2.feedDone = true;
      state.stats.comida = 100;
    } else if (taskKey === 'memory' && !state.day2.memoryDone) {
      state.day2.memoryDone = true;
      state.stats.mimos = Math.min(100, state.stats.mimos + 20);
    } else if (taskKey === 'minigame' && !state.day2.minigameDone) {
      state.day2.minigameDone = true;
      state.stats.energia = 100;
    }

    // Verificar si el Día 1 fue completado totalmente
    if (state.day1.mimoDone && state.day1.moodDone && state.day1.notifDone && !state.day1.completed) {
      state.day1.completed = true;
      state.unlockedDay = Math.max(state.unlockedDay, 2);
      this.celebrateDayCompletion(1);
    }

    // Verificar si el Día 2 fue completado
    if (state.day2.feedDone && state.day2.memoryDone && state.day2.minigameDone && !state.day2.completed) {
      state.day2.completed = true;
      state.unlockedDay = Math.max(state.unlockedDay, 3);
      this.celebrateDayCompletion(2);
    }

    // Guardar y refrescar UI
    await window.storageManager.saveState(state);
    this.updateTasksUI(state);
  }

  celebrateDayCompletion(dayNum) {
    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
    if (window.petController) {
      window.petController.sayQuote(`🎉 ¡FELICIDADES! ¡Completaste todas las tareas del Día ${dayNum}! 💕`);
      window.petController.setExpression('excited');
    }
  }

  // --- LÓGICA DE DÍA 1: NOTIFICACIONES ---
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('¡Mascota Virtual! 🍮', {
          body: `¡Hola! Tu mascota te enviará saludos diarios.`,
          icon: '🌸'
        });
      }
    }
    // Marcar tarea notif
    this.completeTask('notif');
    alert('🔔 ¡Notificaciones y recordatorios activados con éxito!');
  }

  // --- LÓGICA DE DÍA 2: ALIMENTAR PUDÍN ---
  tapPuddingFeed() {
    this.feedCount++;
    const countEl = document.getElementById('feed-count');
    if (countEl) countEl.textContent = this.feedCount;

    if (window.petController) {
      window.petController.setExpression('eating');
      setTimeout(() => window.petController.setExpression('happy'), 800);
    }

    if (this.feedCount >= 3) {
      setTimeout(() => {
        alert('🍮 ¡Pompompurin está super lleno y feliz!');
        window.app.closeModal('modal-feed');
        this.completeTask('feed');
        this.feedCount = 0;
      }, 400);
    }
  }

  // --- LÓGICA DE DÍA 2: MINI-JUEGO ATRAPA PUDINES ---
  startMinigame() {
    const minigameArea = document.getElementById('minigame-area');
    const basket = document.getElementById('basket-player');
    const startBtn = document.getElementById('btn-start-minigame');
    if (!minigameArea || !basket) return;

    if (startBtn) startBtn.style.display = 'none';

    this.minigameScore = 0;
    this.minigameActive = true;
    document.getElementById('game-score-val').textContent = '0';

    // Eventos de movimiento de la canasta (mouse/touch)
    const moveBasket = (clientX) => {
      const rect = minigameArea.getBoundingClientRect();
      let relX = clientX - rect.left;
      let percent = (relX / rect.width) * 100;
      percent = Math.max(5, Math.min(95, percent));
      this.basketX = percent;
      basket.style.left = `${percent}%`;
    };

    minigameArea.onmousemove = (e) => moveBasket(e.clientX);
    minigameArea.ontouchmove = (e) => {
      if (e.touches && e.touches[0]) moveBasket(e.touches[0].clientX);
    };

    // Spawn de pudines cayendo
    const spawnLoop = setInterval(() => {
      if (!this.minigameActive) {
        clearInterval(spawnLoop);
        return;
      }
      this.spawnFallingPudding(minigameArea, basket);
    }, 1200);
  }

  spawnFallingPudding(container, basket) {
    const pudding = document.createElement('div');
    pudding.className = 'falling-pudding';
    pudding.textContent = '🍮';
    
    const randomLeft = Math.floor(Math.random() * 85) + 5;
    pudding.style.left = `${randomLeft}%`;

    container.appendChild(pudding);

    // Detección de colisión a mitad de caída
    const checkCollision = setInterval(() => {
      if (!this.minigameActive) {
        clearInterval(checkCollision);
        pudding.remove();
        return;
      }

      const pRect = pudding.getBoundingClientRect();
      const bRect = basket.getBoundingClientRect();

      // Verificar si colisiona con la canasta
      if (
        pRect.bottom >= bRect.top &&
        pRect.top <= bRect.bottom &&
        pRect.right >= bRect.left &&
        pRect.left <= bRect.right
      ) {
        clearInterval(checkCollision);
        pudding.remove();
        this.minigameScore++;
        document.getElementById('game-score-val').textContent = this.minigameScore;

        if (this.minigameScore >= 5) {
          this.minigameActive = false;
          clearInterval(spawnLoop);
          alert('🎉 ¡Genial! Atrapaste 5 pudines y ganaste el mini-juego!');
          window.app.closeModal('modal-minigame');
          this.completeTask('minigame');
          const startBtn = document.getElementById('btn-start-minigame');
          if (startBtn) startBtn.style.display = 'inline-block';
        }
      }
    }, 50);

    // Auto-eliminar cuando llega al fondo
    setTimeout(() => {
      clearInterval(checkCollision);
      if (pudding.parentNode) pudding.remove();
    }, 2200);
  }
}

window.tasksController = new TasksController();
