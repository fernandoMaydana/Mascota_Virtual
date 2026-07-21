/* ===================================================
   CONFIGURATION & INITIAL STATE - CONFIG.JS
   =================================================== */

const APP_CONFIG = {
  STORAGE_KEY: 'mascota_virtual_state_v1',
  SUPABASE_CONFIG_KEY: 'mascota_virtual_supabase_cfg',

  // Configuración predeterminada de Supabase (opcional: se puede sobrescribir en el panel de ajustes)
  DEFAULT_SUPABASE_URL: '',
  DEFAULT_SUPABASE_KEY: '',

  // Estado inicial predeterminado
  INITIAL_STATE: {
    screen: 'gift',          // 'gift' | 'reveal' | 'tutorial' | 'dashboard'
    ownerName: 'Para Ti 💖',  // Nombre de la dueña (amiga)
    petName: 'Pompom',
    nameReason: '',          // Chiste interno / razón del nombre
    currentDay: 1,           // 1 a 5
    unlockedDay: 1,          // Día máximo alcanzado
    stats: {
      mimos: 80,
      comida: 70,
      energia: 90
    },
    day1: {
      mimoDone: false,
      moodDone: false,
      notifDone: false,
      completed: false
    },
    day2: {
      feedDone: false,
      memoryDone: false,
      minigameDone: false,
      completed: false
    },
    moodHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};
