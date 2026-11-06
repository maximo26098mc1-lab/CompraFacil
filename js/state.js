/**
 * CompraFácil v2 - Gestor de Estado Centralizado y Persistencia
 * js/state.js
 *
 * Modelo de Clasificados con Contacto Directo por WhatsApp.
 * Sin procesamiento de pagos, envíos ni datos financieros.
 */

import { getSupabase, loadListingImage, clearImageCache } from './supabaseClient.js';

const STORAGE_KEY = 'comprafacil_state_v2';

// Función para normalizar números de WhatsApp al formato internacional E.164 sin símbolos
export function normalizeWhatsApp(rawPhone) {
  if (!rawPhone) return '';
  // Eliminar todo lo que no sea dígito
  let digits = rawPhone.toString().replace(/\D/g, '');
  
  // Normalizaciones comunes en Argentina:
  // Si empieza con 0 (ej: 011 -> 11)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  // Si es un número local de 10 dígitos (ej: 1155667788), anteponer prefijo internacional de Argentina 549
  if (digits.length === 10) {
    digits = '549' + digits;
  } else if (digits.length === 12 && digits.startsWith('54') && !digits.startsWith('549')) {
    // Si tiene 54 11..., agregar el 9 móvil de Argentina
    digits = '549' + digits.slice(2);
  }
  return digits;
}

// Generador de enlace oficial wa.me
export function generateWhatsAppLink(rawPhone, adTitle, adPrice, adId) {
  const normalized = normalizeWhatsApp(rawPhone);
  if (!normalized) return '#';
  const priceFormatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(adPrice || 0);

  const message = `Hola! Vi tu publicación en CompraFácil: "${adTitle}" (${priceFormatted}). ¿Sigue disponible?`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

// Semillero Inicial de Datos V2 (Plataforma de Anuncios C2C/B2C con Contacto Directo)
const DEFAULT_SEED = {
  currentUser: null,
  users: [],
  categories: [
    'Celulares y Smartphones',
    'Bicicletas y Movilidad',
    'Computación y Laptops',
    'Herramientas y Maquinaria',
    'Consolas y Videojuegos',
    'Audio y Fotografía'
  ],
  provinces: [
    'CABA',
    'Buenos Aires - GBA Norte',
    'Buenos Aires - GBA Sur',
    'Buenos Aires - GBA Oeste',
    'Buenos Aires - Interior',
    'Córdoba',
    'Santa Fe',
    'Mendoza',
    'Tucumán',
    'Salta',
    'Entre Ríos',
    'Neuquén'
  ],
  products: [
    {
      id: 'anuncio-1',
      title: 'iPhone 14 Pro Max 256GB Deep Purple Batería 92%',
      category: 'Celulares y Smartphones',
      price: 1450000,
      condition: 'usado',
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      serialNumber: 'F2LXT909MD6R',
      whatsapp: '+54 9 11 5566-7788',
      whatsappNormalized: '5491155667788',
      province: 'CABA',
      city: 'Belgrano',
      sellerId: 'u-anunciante-1',
      sellerName: 'Martín Gómez',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
      description: 'Equipo libre de fábrica, excelente estado. Se entrega con cable original. Se coordina punto de encuentro en cafetería o shopping a coordinar por WhatsApp.',
      status: 'disponible', // 'disponible' | 'vendido' | 'retirado'
      termsAccepted: true,
      termsAcceptedAt: '2026-10-20T10:30:00Z',
      termsVersion: 'v2.0-draft',
      createdAt: '2026-10-20T10:30:00Z'
    },
    {
      id: 'anuncio-2',
      title: 'Bicicleta Mountain Bike Venzo Rodado 29 Inferno Shimano',
      category: 'Bicicletas y Movilidad',
      price: 420000,
      condition: 'usado',
      brand: 'Venzo',
      model: 'Inferno 29',
      serialNumber: 'VNZ-2023-88419X',
      whatsapp: '+54 9 11 4433-2211',
      whatsappNormalized: '5491144332211',
      province: 'Buenos Aires - GBA Norte',
      city: 'Vicente López',
      sellerId: 'u-anunciante-2',
      sellerName: 'Gabriel S.',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
      description: 'Mountain bike rodado 29, cuadro talle L color negro y naranja. Se entrega con asiento Velo y soporte caramañola fluo. Escribirme al WhatsApp para coordinar.',
      status: 'disponible',
      termsAccepted: true,
      termsAcceptedAt: '2026-10-22T08:00:00Z',
      termsVersion: 'v2.0-draft',
      createdAt: '2026-10-22T08:00:00Z'
    },
    {
      id: 'anuncio-3',
      title: 'Notebook Lenovo ThinkPad T14 Gen 3 Intel Core i7 16GB SSD 512GB',
      category: 'Computación y Laptops',
      price: 980000,
      condition: 'usado',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 3',
      serialNumber: 'PF3W9Q2L',
      whatsapp: '+54 9 11 5566-7788',
      whatsappNormalized: '5491155667788',
      province: 'Córdoba',
      city: 'Córdoba Capital',
      sellerId: 'u-anunciante-1',
      sellerName: 'Martín Gómez',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      description: 'Notebook de uso corporativo, impecable funcionamiento. Cargador original Lenovo 65W. Consultas por WhatsApp.',
      status: 'disponible',
      termsAccepted: true,
      termsAcceptedAt: '2026-10-18T16:00:00Z',
      termsVersion: 'v2.0-draft',
      createdAt: '2026-10-18T16:00:00Z'
    },
    {
      id: 'anuncio-4',
      title: 'Taladro Percutor Inalámbrico DeWalt 20V Max Brushless',
      category: 'Herramientas y Maquinaria',
      price: 180000,
      condition: 'usado',
      brand: 'DeWalt',
      model: 'DCD796',
      serialNumber: 'DW-991823-AR',
      whatsapp: '+54 9 11 7788-9900',
      whatsappNormalized: '5491177889900',
      province: 'Buenos Aires - GBA Oeste',
      city: 'San Martín',
      sellerId: 'u-anunciante-3',
      sellerName: 'Herramientas Oeste',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      description: 'Taladro percutor DeWalt funcionando perfecto. Solo máquina sin maletín ni cargador. Contactar por WhatsApp.',
      status: 'disponible',
      termsAccepted: true,
      termsAcceptedAt: '2026-10-24T09:30:00Z',
      termsVersion: 'v2.0-draft',
      createdAt: '2026-10-24T09:30:00Z'
    },
    {
      id: 'anuncio-5',
      title: 'Sony PlayStation 5 Standard Edition con Lector de Discos',
      category: 'Consolas y Videojuegos',
      price: 890000,
      condition: 'usado',
      brand: 'Sony',
      model: 'PlayStation 5',
      serialNumber: 'AK4729103841',
      whatsapp: '+54 9 11 3322-1100',
      whatsappNormalized: '5491133221100',
      province: 'Buenos Aires - GBA Sur',
      city: 'La Plata',
      sellerId: 'u-anunciante-4',
      sellerName: 'Ezequiel R.',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
      description: 'Consola con poco uso, incluye 1 mando original y cables. Se prueba antes de retirar en La Plata. Contactar por WhatsApp.',
      status: 'disponible',
      termsAccepted: true,
      termsAcceptedAt: '2026-10-23T11:00:00Z',
      termsVersion: 'v2.0-draft',
      createdAt: '2026-10-23T11:00:00Z'
    }
  ],
  // Fichas de Bienes Buscados para Autoridades Acreditadas (DATOS FICTICIOS PARA DESARROLLO)
  securityRecords: [
    {
      id: 'ficha-ficticia-1',
      caseReference: 'EXP-FICTICIO-2026/01',
      organism: 'UFI N° 2 Distrito Vicente López (Ficticio)',
      description: 'Bicicleta Venzo rodado 29 negra y naranja sustraída en bicisenda costanera.',
      category: 'Bicicletas y Movilidad',
      brand: 'Venzo',
      model: 'Inferno 29',
      color: 'Negro y Naranja',
      serialNumber: 'VNZ-2023-88419X',
      status: 'activa',
      isDemoFictitious: true,
      createdAt: '2026-10-13T11:20:00Z'
    },
    {
      id: 'ficha-ficticia-2',
      caseReference: 'CAUSA-DEMO-88912/26',
      organism: 'Fiscalía Correccional N° 7 CABA (Ficticio)',
      description: 'Taladro percutor DeWalt 20V sustraído de baúl de vehículo.',
      category: 'Herramientas y Maquinaria',
      brand: 'DeWalt',
      model: 'DCD796',
      color: 'Amarillo y Negro',
      serialNumber: 'DW-991823-AR',
      status: 'activa',
      isDemoFictitious: true,
      createdAt: '2026-10-19T09:40:00Z'
    }
  ],
  // Alertas / Coincidencias de Revisión Humana
  securityAlerts: [],
  // Reportes enviados por usuarios
  adReports: []
};

class StateManager {
  constructor() {
    this.state = this._loadState();
    this._setupStorageSync();
  }

  _loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SEED, ...parsed };
      }
    } catch (e) {
      console.warn('Error leyendo localStorage, restableciendo estado semilla v2:', e);
    }
    this._persist(DEFAULT_SEED);
    return JSON.parse(JSON.stringify(DEFAULT_SEED));
  }

  _persist(newState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  _notify(action, payload) {
    this._persist(this.state);
    const event = new CustomEvent('comprafacil:statechange', {
      detail: { action, payload, state: this.state }
    });
    window.dispatchEvent(event);
  }

  _setupStorageSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          this.state = JSON.parse(e.newValue);
          window.dispatchEvent(new CustomEvent('comprafacil:statechange', {
            detail: { action: 'STORAGE_SYNC', state: this.state }
          }));
        } catch (err) {
          console.error('Error sincronizando pestañas:', err);
        }
      }
    });
  }

  getState() {
    return this.state;
  }

  getCurrentUser() {
    return this.state.currentUser;
  }

  setCurrentUser(supabaseUser) {
    if (supabaseUser && supabaseUser.id) {
      this.state.currentUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
        phone: supabaseUser.user_metadata?.phone || '',
        role: 'user'
      };
    } else {
      this.state.currentUser = null;
      clearImageCache();
    }
    this._notify('USER_CHANGED', this.state.currentUser);
    this.fetchListings();
  }

  // Anuncios y Sincronización con Supabase 'listings'
  mapListingRowToProduct(row, resolvedImageUrl = null) {
    if (!row) return null;
    const rawPath = row.image_url || '';
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      price: Number(row.price),
      condition: row.condition,
      brand: row.brand || '',
      model: row.model || '',
      serialNumber: row.serial_number || '',
      whatsapp: row.whatsapp,
      whatsappNormalized: normalizeWhatsApp(row.whatsapp),
      province: row.province,
      city: row.city,
      sellerId: row.user_id,
      sellerName: row.seller_name || 'Vendedor',
      imagePath: rawPath,
      image: resolvedImageUrl || rawPath || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      description: row.description || '',
      status: row.status || 'disponible',
      termsAccepted: true,
      termsAcceptedAt: row.terms_accepted_at || row.created_at,
      termsVersion: row.terms_version || 'v2.0-draft',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      fromSupabase: true
    };
  }

  async fetchListings() {
    const supabase = getSupabase();
    if (!supabase) return this.getProducts(true);

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Consulta a Supabase listings (la tabla aún podría no estar creada):', error.message);
        return this.getProducts(true);
      }

      if (data && data.length > 0) {
        // Cargar las fotos privadas mediante la sesión autenticada de Supabase
        const mapped = await Promise.all(data.map(async (row) => {
          let resolved = '';
          if (row.image_url) {
            resolved = await loadListingImage(row.image_url);
          }
          return this.mapListingRowToProduct(row, resolved);
        }));

        this.state.products = mapped;
        this._persist(this.state);
        this._notify('LISTINGS_LOADED', this.state.products);
        return mapped;
      }
    } catch (err) {
      console.warn('Error sincronizando listings de Supabase:', err);
    }
    return this.getProducts(true);
  }

  async fetchProductById(id) {
    let existing = this.getProductById(id);
    if (existing) {
      if (existing.imagePath && (!existing.image || existing.image === existing.imagePath)) {
        existing.image = await loadListingImage(existing.imagePath);
      }
      return existing;
    }

    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        const resolved = data.image_url ? await loadListingImage(data.image_url) : '';
        const product = this.mapListingRowToProduct(data, resolved);
        this.state.products.unshift(product);
        this._persist(this.state);
        return product;
      }
    } catch (err) {
      console.warn('Error al buscar anuncio por ID en Supabase:', err);
    }
    return null;
  }

  addProductFromSupabase(row, resolvedImageUrl = null) {
    const newAd = this.mapListingRowToProduct(row, resolvedImageUrl);
    this.state.products = this.state.products.filter(p => p.id !== newAd.id);
    this.state.products.unshift(newAd);
    this._persist(this.state);
    this._notify('AD_ADDED', newAd);
    return newAd;
  }

  getProducts(includeAllStatuses = false) {
    if (includeAllStatuses) {
      return this.state.products.filter(p => p.status !== 'retirado');
    }
    return this.state.products.filter(p => p.status === 'disponible');
  }

  getProductById(id) {
    return this.state.products.find(p => p.id === id);
  }

  addProduct(adData) {
    const rawPhone = adData.whatsapp || '';
    const normPhone = normalizeWhatsApp(rawPhone);

    const newAd = {
      id: 'anuncio-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'disponible',
      whatsapp: rawPhone,
      whatsappNormalized: normPhone,
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      termsVersion: 'v2.0-draft',
      ...adData
    };

    this.state.products.unshift(newAd);
    this._notify('AD_ADDED', newAd);
    return newAd;
  }

  updateProduct(id, updates) {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      if (updates.whatsapp) {
        updates.whatsappNormalized = normalizeWhatsApp(updates.whatsapp);
      }
      updates.updatedAt = new Date().toISOString();
      this.state.products[idx] = { ...this.state.products[idx], ...updates };
      this._notify('AD_UPDATED', this.state.products[idx]);
      return this.state.products[idx];
    }
    return null;
  }

  markProductAsSold(id) {
    return this.updateProduct(id, { status: 'vendido' });
  }

  markProductAsAvailable(id) {
    return this.updateProduct(id, { status: 'disponible' });
  }

  withdrawProduct(id) {
    return this.updateProduct(id, { status: 'retirado' });
  }

  deleteProduct(id) {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = this.state.products.splice(idx, 1)[0];
      this._notify('AD_DELETED', { id });
      return true;
    }
    return false;
  }

  // Reportes de Usuarios sobre Publicaciones
  addAdReport(reportData) {
    const report = {
      id: 'rep-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
      ...reportData
    };
    if (!this.state.adReports) this.state.adReports = [];
    this.state.adReports.unshift(report);
    this._notify('REPORT_CREATED', report);
    return report;
  }

  getAdReports() {
    return this.state.adReports || [];
  }

  // Fichas de Bienes Buscados (Autoridades)
  getSecurityRecords() {
    return this.state.securityRecords || [];
  }

  addSecurityRecord(recordData) {
    const newRecord = {
      id: 'ficha-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'activa',
      isDemoFictitious: true, // Siempre marcado como ficticio durante desarrollo
      ...recordData
    };
    if (!this.state.securityRecords) this.state.securityRecords = [];
    this.state.securityRecords.unshift(newRecord);
    this._notify('SECURITY_RECORD_ADDED', newRecord);
    return newRecord;
  }

  // Alertas / Coincidencias de Seguridad
  getSecurityAlerts() {
    return this.state.securityAlerts || [];
  }

  updateAlertStatus(alertId, newStatus) {
    if (!this.state.securityAlerts) return null;
    const alert = this.state.securityAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = newStatus;
      alert.reviewedAt = new Date().toISOString();
      this._notify('ALERT_STATUS_UPDATED', alert);
      return alert;
    }
    return null;
  }

  setSecurityAlerts(alerts) {
    this.state.securityAlerts = alerts;
    this._notify('SECURITY_ALERTS_UPDATED', alerts);
  }

  // Formato ARS
  formatARS(amount) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  resetToDefaultSeed() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_SEED));
    this._persist(this.state);
    this._notify('STATE_RESET', this.state);
  }
}

export const state = new StateManager();
