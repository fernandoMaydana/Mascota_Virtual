/* ===================================================
   CONFIGURATION & INITIAL STATE - CONFIG.JS
   =================================================== */

const APP_CONFIG = {
  STORAGE_KEY: 'mascota_virtual_state_v1',
  SUPABASE_CONFIG_KEY: 'mascota_virtual_supabase_cfg',

  // Configuración predeterminada de Supabase
  DEFAULT_SUPABASE_URL: '',
  DEFAULT_SUPABASE_KEY: '',

  // Estado inicial predeterminado para los 5 Días (4 tareas cada día)
  INITIAL_STATE: {
    screen: 'gift',          // 'gift' | 'reveal' | 'tutorial' | 'dashboard'
    ownerName: 'Para Ti 💖',  // Nombre de la dueña (amiga)
    petName: 'Pompom',
    nameReason: '',          // Chiste interno / razón del nombre
    currentDay: 1,           // 1 a 5
    unlockedDay: 1,          // Día máximo alcanzado
    stats: {
      mimos: 25,     // Inicia en 25% (Ánimo bajo para enseñar a mimar)
      comida: 30,    // Inicia en 30% (Hambre baja para enseñar a alimentar)
      energia: 20    // Inicia en 20% (Energía baja para enseñar a dar la siesta)
    },
    // DÍA 1 (4 Tareas)
    day1: {
      mimoDone: false,
      moodDone: false,
      notifDone: false,
      favColorDone: false,
      completed: false
    },
    // DÍA 2 (4 Tareas)
    day2: {
      feedDone: false,
      memoryDone: false,
      minigameDone: false,
      musicDone: false,
      completed: false
    },
    // DÍA 3 (4 Tareas)
    day3: {
      sleepDone: false,
      happyPlaceDone: false,
      albumDone: false,
      starGameDone: false,
      completed: false
    },
    // DÍA 4 (4 Tareas)
    day4: {
      cookieDone: false,
      gratitudeDone: false,
      triviaDone: false,
      bubbleBathDone: false,
      completed: false
    },
    // DÍA 5 (4 Tareas - Sorpresa Final 🎉)
    day5: {
      cakeDone: false,
      surpriseGiftDone: false,
      wishMessageDone: false,
      partyFireworksDone: false,
      completed: false
    },
    // Respuestas para conocer a la dueña
    ownerAnswers: {
      favColor: '',
      favMusic: '',
      happyPlace: '',
      gratitude: '',
      trivia: '',
      finalWish: ''
    },
    moodHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};
