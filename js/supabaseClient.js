/**
 * CompraFácil v2 - Cliente de Integración Supabase (Auth, DB, Storage)
 * js/supabaseClient.js
 *
 * Configuración segura: Las credenciales deben definirse mediante variables o window.SUPABASE_CONFIG.
 * Si no están configuradas, la plataforma opera en modo local de desarrollo.
 */

// Objeto de configuración (configurable en tiempo de ejecución o por inyección)
const config = window.SUPABASE_CONFIG || {
  url: null,
  anonKey: null
};

export const supabaseClient = {
  isConfigured() {
    return Boolean(config.url && config.anonKey && !config.url.includes('TU_PROYECTO'));
  },

  getStatus() {
    if (this.isConfigured()) {
      return {
        mode: 'cloud',
        message: 'Conectado a backend Supabase (PostgreSQL + RLS).'
      };
    }
    return {
      mode: 'local_dev',
      message: 'Modo local de desarrollo (localStorage). Para sincronización multiusuario y RLS en producción, configure SUPABASE_URL y SUPABASE_ANON_KEY.'
    };
  },

  setConfig(url, anonKey) {
    config.url = url;
    config.anonKey = anonKey;
  }
};
