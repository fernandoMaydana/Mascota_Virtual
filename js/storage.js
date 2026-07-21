/* ===================================================
   STORAGE & SUPABASE INTEGRATION - STORAGE.JS
   =================================================== */

class StorageManager {
  constructor() {
    this.supabaseClient = null;
    this.state = null;
    this.initSupabase();
  }

  // Inicializar cliente Supabase si existen credenciales
  initSupabase() {
    const cfg = this.getSupabaseConfig();
    if (cfg.url && cfg.key && window.supabase) {
      try {
        this.supabaseClient = window.supabase.createClient(cfg.url, cfg.key);
        console.log("⚡ Supabase cliente conectado correctamente.");
      } catch (err) {
        console.warn("⚠️ No se pudo inicializar Supabase, usando LocalStorage:", err);
        this.supabaseClient = null;
      }
    } else {
      this.supabaseClient = null;
    }
  }

  getSupabaseConfig() {
    try {
      const raw = localStorage.getItem(APP_CONFIG.SUPABASE_CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Error al leer Supabase config:", e);
    }
    return {
      url: APP_CONFIG.DEFAULT_SUPABASE_URL,
      key: APP_CONFIG.DEFAULT_SUPABASE_KEY
    };
  }

  saveSupabaseConfig(url, key) {
    const cfg = { url: url.trim(), key: key.trim() };
    localStorage.setItem(APP_CONFIG.SUPABASE_CONFIG_KEY, JSON.stringify(cfg));
    this.initSupabase();
  }

  // Cargar estado (Primero LocalStorage para velocidad, luego sync con Supabase si está activo)
  async loadState() {
    let localData = null;
    try {
      const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
      if (raw) {
        localData = JSON.parse(raw);
      }
    } catch (e) {
      console.error("Error al leer localStorage:", e);
    }

    if (!localData) {
      localData = JSON.parse(JSON.stringify(APP_CONFIG.INITIAL_STATE));
    }

    this.state = localData;

    // Intentar sincronizar desde Supabase si existe cliente
    if (this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient
          .from('pet_game_state')
          .select('*')
          .single();

        if (data && !error) {
          console.log("☁️ Estado sincronizado desde Supabase:", data);
          this.state = { ...this.state, ...data.state_data };
          this.saveLocal(this.state);
        }
      } catch (err) {
        console.warn("⚠️ No se pudo consultar Supabase, usando respaldo local:", err);
      }
    }

    return this.state;
  }

  saveLocal(newState) {
    this.state = newState;
    this.state.updatedAt = new Date().toISOString();
    localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(this.state));
  }

  // Guardar estado (Local + Supabase en segundo plano)
  async saveState(newState) {
    this.saveLocal(newState);

    if (this.supabaseClient) {
      try {
        await this.supabaseClient
          .from('pet_game_state')
          .upsert({
            id: 'friend_mascota_v1', // ID fijo para la mascota de tu amiga
            pet_name: newState.petName,
            current_day: newState.currentDay,
            state_data: newState,
            updated_at: new Date().toISOString()
          });
        console.log("☁️ Estado guardado en Supabase.");
      } catch (err) {
        console.warn("⚠️ Error guardando en Supabase:", err);
      }
    }

    return this.state;
  }

  resetState() {
    const newState = JSON.parse(JSON.stringify(APP_CONFIG.INITIAL_STATE));
    this.saveLocal(newState);
    return newState;
  }
}

// Instancia global
window.storageManager = new StorageManager();
