/**
 * CompraFácil v2 - Controlador Principal y Enrutador SPA
 * js/app.js
 */

import { state } from './state.js';
import { auth } from './modules/auth.js';
import { catalog } from './modules/catalog.js';
import { productDetail } from './modules/productDetail.js';
import { sellerDashboard } from './modules/sellerDashboard.js';
import { securityModule } from './modules/securityModule.js';
import { legal } from './modules/legal.js';

class AppController {
  constructor() {
    this.currentRoute = '';
    this.modalEl = null;
  }

  init() {
    console.log('Inicializando CompraFácil v2 (Clasificados con Contacto Directo)...');
    
    // Configurar componentes globales
    auth.renderRoleSwitcher('header-role-switcher');
    this._setupGlobalEvents();
    this._setupSearchHeader();
    this._setupPWA();

    // Escuchar eventos de cambio de estado reactivo
    window.addEventListener('comprafacil:statechange', (e) => {
      this._handleStateChange(e.detail);
    });

    // Enrutador Hash
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  }

  handleRouting() {
    const rawHash = window.location.hash.slice(1) || '/';
    this.currentRoute = rawHash;
    const cleanHash = rawHash.split('?')[0];
    const parts = cleanHash.split('/').filter(Boolean);
    const mainSection = parts[0] || 'catalog';

    // Actualizar clase activa en enlaces de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes(mainSection) || (mainSection === 'catalog' && href === '#/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Enrutamiento de Vistas
    if (mainSection === 'catalog' || mainSection === '') {
      catalog.render();
    } else if (mainSection === 'product' && parts[1]) {
      productDetail.render(parts[1]);
    } else if (mainSection === 'seller') {
      sellerDashboard.render();
    } else if (mainSection === 'security') {
      securityModule.render();
    } else if (mainSection === 'terms') {
      legal.renderTerms();
    } else if (mainSection === 'privacy') {
      legal.renderPrivacy();
    } else if (mainSection === 'report') {
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      legal.renderReportForm(urlParams.get('id') || '');
    } else if (mainSection === 'cart') {
      // Redirección explicativa si quedó algún enlace antiguo
      this.showToast('CompraFácil no procesa carritos ni cobros. El contacto es directo por WhatsApp.', 'info');
      window.location.hash = '#/catalog';
    } else {
      // Fallback a catálogo
      catalog.render();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '⚠️';
    else if (type === 'warning') icon = '⚡';

    toast.innerHTML = `
      <span>${icon}</span>
      <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  openModal(title, htmlContent) {
    this.closeModal();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" aria-label="Cerrar modal">&times;</button>
        </div>
        <div class="modal-body">
          ${htmlContent}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;

    const closeBtns = backdrop.querySelectorAll('.modal-close, .modal-close-btn');
    closeBtns.forEach(btn => btn.addEventListener('click', () => this.closeModal()));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.closeModal();
    });
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

  _setupSearchHeader() {
    const searchForm = document.getElementById('header-search-form');
    const searchInput = document.getElementById('header-search-input');

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        catalog.currentFilters.query = query;
        if (window.location.hash !== '#/' && window.location.hash !== '#/catalog') {
          window.location.hash = '#/catalog';
        } else {
          catalog.render();
        }
      });
    }
  }

  _setupGlobalEvents() {
    // Cambio de ubicación simulada
    const locBtn = document.getElementById('btn-change-location');
    if (locBtn) {
      locBtn.addEventListener('click', () => {
        const prov = prompt('Ingresá tu provincia o zona de búsqueda preferida en Argentina:', 'CABA');
        if (prov) {
          const locText = document.getElementById('current-location-text');
          if (locText) locText.textContent = `Zona: ${prov}`;
          this.showToast(`Zona actualizada a ${prov}`, 'success');
        }
      });
    }
  }

  _setupPWA() {
    // 1. Registro de Service Worker para soporte Offline
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker v2 registrado con éxito. Ámbito:', registration.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Error registrando ServiceWorker:', err);
          });
      });
    }

    // 2. Captura del evento de instalación en pantalla de inicio
    let deferredPrompt = null;
    const installBtn = document.getElementById('btn-pwa-install');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
        installBtn.onclick = async () => {
          installBtn.style.display = 'none';
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA] Respuesta del usuario a la instalación:', outcome);
            deferredPrompt = null;
          }
        };
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] CompraFácil v2 fue instalada en el dispositivo.');
      if (installBtn) installBtn.style.display = 'none';
      this.showToast('¡CompraFácil se instaló en tu dispositivo!', 'success');
    });

    // 3. Monitoreo de conectividad en tiempo real (Online / Offline)
    const offlineBanner = document.getElementById('offline-banner');
    const updateOnlineStatus = (isInitial = false) => {
      if (navigator.onLine) {
        if (offlineBanner) offlineBanner.style.display = 'none';
        if (!isInitial) this.showToast('Conexión a internet restablecida', 'success');
      } else {
        if (offlineBanner) offlineBanner.style.display = 'block';
        if (!isInitial) this.showToast('Modo Offline: Operando con caché local.', 'warning');
      }
    };

    window.addEventListener('online', () => updateOnlineStatus(false));
    window.addEventListener('offline', () => updateOnlineStatus(false));
    if (!navigator.onLine) {
      updateOnlineStatus(true);
    }
  }

  _handleStateChange(detail) {
    const { action } = detail;
    auth.renderRoleSwitcher('header-role-switcher');

    if (action === 'AD_ADDED' || action === 'AD_UPDATED' || action === 'AD_DELETED') {
      if (this.currentRoute.includes('catalog') || this.currentRoute === '/') {
        catalog.render();
      } else if (this.currentRoute.includes('seller')) {
        sellerDashboard.render();
      }
    } else if (action === 'USER_CHANGED') {
      this.handleRouting();
    } else if (action === 'STATE_RESET') {
      this.handleRouting();
    }
  }
}

export const app = new AppController();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
