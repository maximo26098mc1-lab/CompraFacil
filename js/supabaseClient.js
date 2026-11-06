/**
 * CompraFácil v2 - Cliente Oficial Supabase
 * js/supabaseClient.js
 */

export const SUPABASE_URL = 'https://woklkocnmiznmpnxcnbg.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BtvnNsnF9xHwZDu609JhHA_lGIb7FYD';

let supabaseInstance = null;

export function getSupabase() {
  if (!supabaseInstance) {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } else {
      console.warn('Supabase SDK aún no cargado en window.supabase.');
    }
  }
  return supabaseInstance;
}

export const supabaseClient = {
  get client() {
    return getSupabase();
  },
  isConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
  }
};

// Caché en memoria de URLs de Blobs para evitar descargas duplicadas
const imageBlobCache = new Map();

/**
 * Carga una fotografía desde el bucket privado 'listing-photos' utilizando
 * la sesión autenticada activa de Supabase (sin getPublicUrl).
 */
export async function loadListingImage(imagePath) {
  if (!imagePath) return '';
  // Si ya es un blob URL, data URI o enlace web externo
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  if (imageBlobCache.has(imagePath)) {
    return imageBlobCache.get(imagePath);
  }

  const supabase = getSupabase();
  if (!supabase) return '';

  try {
    const { data, error } = await supabase.storage
      .from('listing-photos')
      .download(imagePath);

    if (error) {
      console.warn(`[Storage] No se pudo descargar la foto privada '${imagePath}':`, error.message);
      return '';
    }

    if (data) {
      const blobUrl = URL.createObjectURL(data);
      imageBlobCache.set(imagePath, blobUrl);
      return blobUrl;
    }
  } catch (err) {
    console.warn('[Storage] Error descargando foto privada con sesión:', err);
  }
  return '';
}

export function clearImageCache() {
  imageBlobCache.forEach(url => {
    try { URL.revokeObjectURL(url); } catch (_) {}
  });
  imageBlobCache.clear();
}
