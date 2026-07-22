/* ===================================================
   TASKS & MINI-GAMES CONTROLLER (DAYS 1 TO 5) - TASKS.JS
   =================================================== */

class TasksController {
  constructor() {
    this.selectedMood = null;
    this.feedCount = 0;
    this.minigameScore = 0;
    this.minigameActive = false;
    this.starScore = 0;
    this.bubbleScore = 0;
  }

  // Cambiar tema de colores pastel en el body según el día activo (1 a 5)
  applyDayTheme(dayNum) {
    document.body.className = 'clay-bg'; // reset
    document.body.classList.add(`theme-day-${dayNum}`);
  }

  // Actualizar renderizado visual de tareas (4 tareas por día)
  updateTasksUI(state) {
    const day = state.currentDay || 1;
    this.applyDayTheme(day);

    // DÍA 1
    const d1 = state.day1 || {};
    this.setTaskStatus('d1-1', d1.mimoDone);
    this.setTaskStatus('d1-2', d1.moodDone);
    this.setTaskStatus('d1-3', d1.notifDone);
    this.setTaskStatus('d1-4', d1.favColorDone);
    const d1Count = (d1.mimoDone?1:0) + (d1.moodDone?1:0) + (d1.notifDone?1:0) + (d1.favColorDone?1:0);
    this.updateBadge('day1-progress-badge', d1Count, 4);

    // DÍA 2
    const d2 = state.day2 || {};
    this.setTaskStatus('d2-1', d2.feedDone);
    this.setTaskStatus('d2-2', d2.memoryDone);
    this.setTaskStatus('d2-3', d2.minigameDone);
    this.setTaskStatus('d2-4', d2.musicDone);
    const d2Count = (d2.feedDone?1:0) + (d2.memoryDone?1:0) + (d2.minigameDone?1:0) + (d2.musicDone?1:0);
    this.updateBadge('day2-progress-badge', d2Count, 4);

    // DÍA 3
    const d3 = state.day3 || {};
    this.setTaskStatus('d3-1', d3.sleepDone);
    this.setTaskStatus('d3-2', d3.happyPlaceDone);
    this.setTaskStatus('d3-3', d3.albumDone);
    this.setTaskStatus('d3-4', d3.starGameDone);
    const d3Count = (d3.sleepDone?1:0) + (d3.happyPlaceDone?1:0) + (d3.albumDone?1:0) + (d3.starGameDone?1:0);
    this.updateBadge('day3-progress-badge', d3Count, 4);

    // DÍA 4
    const d4 = state.day4 || {};
    this.setTaskStatus('d4-1', d4.cookieDone);
    this.setTaskStatus('d4-2', d4.gratitudeDone);
    this.setTaskStatus('d4-3', d4.triviaDone);
    this.setTaskStatus('d4-4', d4.bubbleBathDone);
    const d4Count = (d4.cookieDone?1:0) + (d4.gratitudeDone?1:0) + (d4.triviaDone?1:0) + (d4.bubbleBathDone?1:0);
    this.updateBadge('day4-progress-badge', d4Count, 4);

    // DÍA 5
    const d5 = state.day5 || {};
    this.setTaskStatus('d5-1', d5.cakeDone);
    this.setTaskStatus('d5-2', d5.surpriseGiftDone);
    this.setTaskStatus('d5-3', d5.wishMessageDone);
    this.setTaskStatus('d5-4', d5.partyFireworksDone);
    const d5Count = (d5.cakeDone?1:0) + (d5.surpriseGiftDone?1:0) + (d5.wishMessageDone?1:0) + (d5.partyFireworksDone?1:0);
    this.updateBadge('day5-progress-badge', d5Count, 4);

    // Actualizar barras de estado
    this.updateStatsUI(state.stats);
  }

  updateBadge(badgeId, count, max) {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    if (count === max) {
      badge.textContent = `${max}/${max} ¡Día Completado! 🎉`;
      badge.style.background = '#C8E6C9';
    } else {
      badge.textContent = `${count}/${max} completadas`;
      badge.style.background = '#FFF';
    }
  }

  setTaskStatus(taskDomId, isDone) {
    const card = document.getElementById(`task-card-${taskDomId}`);
    const check = document.getElementById(`check-${taskDomId}`);
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
    const circumference = 176; // 2 * PI * r (r=28)

    // Mimos
    const circleM = document.getElementById('circle-mimos');
    const valM = document.getElementById('val-mimos');
    if (valM) valM.textContent = `${stats.mimos}%`;
    if (circleM) {
      const offsetM = circumference - ((stats.mimos / 100) * circumference);
      circleM.style.strokeDashoffset = Math.max(0, offsetM);
    }

    // Comida
    const circleC = document.getElementById('circle-comida');
    const valC = document.getElementById('val-comida');
    if (valC) valC.textContent = `${stats.comida}%`;
    if (circleC) {
      const offsetC = circumference - ((stats.comida / 100) * circumference);
      circleC.style.strokeDashoffset = Math.max(0, offsetC);
    }

    // Energía
    const circleE = document.getElementById('circle-energia');
    const valE = document.getElementById('val-energia');
    if (valE) valE.textContent = `${stats.energia}%`;
    if (circleE) {
      const offsetE = circumference - ((stats.energia / 100) * circumference);
      circleE.style.strokeDashoffset = Math.max(0, offsetE);
    }
  }

  // Marcar tarea completada por código de día y número
  async completeSpecificTask(dayKey, taskProp) {
    const state = window.app.state;
    if (!state[dayKey]) return;

    if (!state[dayKey][taskProp]) {
      state[dayKey][taskProp] = true;
      state.stats.mimos = Math.min(100, state.stats.mimos + 15);
      state.stats.comida = Math.min(100, state.stats.comida + 15);
      state.stats.energia = Math.min(100, state.stats.energia + 15);

      if (window.confetti) {
        window.confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      }

      // Verificar si el día fue completado (4/4)
      const keys = Object.keys(state[dayKey]).filter(k => k !== 'completed');
      const allDone = keys.every(k => state[dayKey][k] === true);
      if (allDone && !state[dayKey].completed) {
        state[dayKey].completed = true;
        const currentDayNum = parseInt(dayKey.replace('day', ''));
        state.unlockedDay = Math.max(state.unlockedDay, currentDayNum + 1);
        this.celebrateDayCompletion(currentDayNum);
      }

      await window.storageManager.saveState(state);
      this.updateTasksUI(state);
    }
  }

  celebrateDayCompletion(dayNum) {
    if (window.confetti) {
      window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
    if (window.petController) {
      window.petController.sayQuote(`🎉 ¡FELICIDADES! ¡Completaste las 4 tareas del Día ${dayNum}! 💕`);
      window.petController.setExpression('excited');
    }
  }

  // --- MINIJUEGO: ESTRELLAS FUGACES (DÍA 3 TAREA 4) ---
  startStarGame() {
    const area = document.getElementById('star-game-area');
    const startBtn = document.getElementById('btn-start-stargame');
    if (!area) return;
    if (startBtn) startBtn.style.display = 'none';

    this.starScore = 0;
    document.getElementById('star-score-val').textContent = '0';

    const spawnStar = () => {
      if (this.starScore >= 5) return;
      const star = document.createElement('div');
      star.textContent = '🌟';
      star.style.position = 'absolute';
      star.style.fontSize = '2rem';
      star.style.left = `${Math.floor(Math.random() * 80) + 10}%`;
      star.style.top = `${Math.floor(Math.random() * 60) + 10}%`;
      star.style.cursor = 'pointer';
      star.style.transition = 'transform 0.2s ease';

      star.onclick = () => {
        star.remove();
        this.starScore++;
        document.getElementById('star-score-val').textContent = this.starScore;
        if (this.starScore >= 5) {
          alert('🌟 ¡Pediste 5 deseos a las estrellas fugaces!');
          window.app.closeModal('modal-stargame');
          this.completeSpecificTask('day3', 'starGameDone');
          if (startBtn) startBtn.style.display = 'inline-block';
        } else {
          spawnStar();
        }
      };

      area.appendChild(star);
    };

    spawnStar();
  }

  // --- MINIJUEGO: BAÑO DE BURBUJAS (DÍA 4 TAREA 4) ---
  startBubbleGame() {
    const area = document.getElementById('bubbles-area');
    const startBtn = document.getElementById('btn-start-bubbles');
    if (!area) return;
    if (startBtn) startBtn.style.display = 'none';

    this.bubbleScore = 0;
    document.getElementById('bubble-score-val').textContent = '0';

    const spawnBubble = () => {
      if (this.bubbleScore >= 5) return;
      const bubble = document.createElement('div');
      bubble.textContent = '🫧';
      bubble.style.position = 'absolute';
      bubble.style.fontSize = '2.2rem';
      bubble.style.left = `${Math.floor(Math.random() * 80) + 10}%`;
      bubble.style.top = `${Math.floor(Math.random() * 60) + 10}%`;
      bubble.style.cursor = 'pointer';

      bubble.onclick = () => {
        bubble.remove();
        this.bubbleScore++;
        document.getElementById('bubble-score-val').textContent = this.bubbleScore;
        if (this.bubbleScore >= 5) {
          alert('🫧 ¡Mascota reluciente e impecable tras su baño de burbujas!');
          window.app.closeModal('modal-bubbles');
          this.completeSpecificTask('day4', 'bubbleBathDone');
          if (startBtn) startBtn.style.display = 'inline-block';
        } else {
          spawnBubble();
        }
      };

      area.appendChild(bubble);
    };

    spawnBubble();
  }

  // --- MINIJUEGO: ATRAPA PUDINES (DÍA 2 TAREA 3) ---
  startMinigame() {
    const minigameArea = document.getElementById('minigame-area');
    const basket = document.getElementById('basket-player');
    const startBtn = document.getElementById('btn-start-minigame');
    if (!minigameArea || !basket) return;
    if (startBtn) startBtn.style.display = 'none';

    this.minigameScore = 0;
    this.minigameActive = true;
    document.getElementById('game-score-val').textContent = '0';

    const moveBasket = (clientX) => {
      const rect = minigameArea.getBoundingClientRect();
      let relX = clientX - rect.left;
      let percent = (relX / rect.width) * 100;
      percent = Math.max(5, Math.min(95, percent));
      basket.style.left = `${percent}%`;
    };

    minigameArea.onmousemove = (e) => moveBasket(e.clientX);
    minigameArea.ontouchmove = (e) => {
      if (e.touches && e.touches[0]) moveBasket(e.touches[0].clientX);
    };

    const spawnLoop = setInterval(() => {
      if (!this.minigameActive) { clearInterval(spawnLoop); return; }
      this.spawnFallingPudding(minigameArea, basket, spawnLoop);
    }, 1100);
  }

  spawnFallingPudding(container, basket, spawnLoop) {
    const pudding = document.createElement('div');
    pudding.className = 'falling-pudding';
    pudding.textContent = '🍮';
    pudding.style.left = `${Math.floor(Math.random() * 85) + 5}%`;
    container.appendChild(pudding);

    const checkCollision = setInterval(() => {
      if (!this.minigameActive) { clearInterval(checkCollision); pudding.remove(); return; }
      const pRect = pudding.getBoundingClientRect();
      const bRect = basket.getBoundingClientRect();

      if (
        pRect.bottom >= bRect.top && pRect.top <= bRect.bottom &&
        pRect.right >= bRect.left && pRect.left <= bRect.right
      ) {
        clearInterval(checkCollision);
        pudding.remove();
        this.minigameScore++;
        document.getElementById('game-score-val').textContent = this.minigameScore;

        if (this.minigameScore >= 5) {
          this.minigameActive = false;
          clearInterval(spawnLoop);
          alert('🎉 ¡Genial! Atrapaste 5 pudines!');
          window.app.closeModal('modal-minigame');
          this.completeSpecificTask('day2', 'minigameDone');
          const startBtn = document.getElementById('btn-start-minigame');
          if (startBtn) startBtn.style.display = 'inline-block';
        }
      }
    }, 50);

    setTimeout(() => { clearInterval(checkCollision); if (pudding.parentNode) pudding.remove(); }, 2200);
  }

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
        alert('🍮 ¡Pompompurin está lleno y feliz!');
        window.app.closeModal('modal-feed');
        this.completeSpecificTask('day2', 'feedDone');
        this.feedCount = 0;
      }, 400);
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('¡Mascota Virtual! 🍮', { body: '¡Recordatorio activo para cuidar a tu mascota!', icon: '🌸' });
      }
    }
    this.completeSpecificTask('day1', 'notifDone');
    alert('🔔 ¡Notificaciones activadas!');
  }
}

window.tasksController = new TasksController();
