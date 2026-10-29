/**
 * CompraFácil v2 - Control de Sesión y Roles
 * js/modules/auth.js
 */

import { state } from '../state.js';
import { supabaseClient } from '../supabaseClient.js';

export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  AUTHORITY: 'authority',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  buyer: 'Comprador (Visitante)',
  seller: 'Anunciante / Vendedor',
  authority: 'Autoridad Acreditada (Seguridad)',
  admin: 'Administrador de Plataforma'
};

export const auth = {
  getCurrentUser() {
    return state.getCurrentUser();
  },

  getCurrentRole() {
    const user = state.getCurrentUser();
    return user ? user.role : ROLES.BUYER;
  },

  canAccessSecurity() {
    const role = this.getCurrentRole();
    return role === ROLES.AUTHORITY || role === ROLES.ADMIN;
  },

  canAccessSeller() {
    const role = this.getCurrentRole();
    return role === ROLES.SELLER || role === ROLES.ADMIN;
  },

  switchRole(role) {
    state.setCurrentUser(role);
  },

  renderRoleSwitcher(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentUser = state.getCurrentUser();
    const currentRole = currentUser ? currentUser.role : ROLES.BUYER;
    const isCloud = supabaseClient.isConfigured();

    container.innerHTML = `
      <div class="role-quick-bar" title="Selector de perfil de desarrollo local">
        <span class="role-label">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Perfil Demo:
        </span>
        <select id="quick-role-select" class="role-select" aria-label="Seleccionar perfil demo">
          <option value="seller" ${currentRole === 'seller' ? 'selected' : ''}>🏪 Anunciante (Vendedor)</option>
          <option value="buyer" ${currentRole === 'buyer' ? 'selected' : ''}>👤 Visitante (Comprador)</option>
          <option value="authority" ${currentRole === 'authority' ? 'selected' : ''}>🛡️ Autoridad Acreditada</option>
          <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>⚙️ Administrador</option>
        </select>
        ${!isCloud ? `
          <span style="font-size: 0.7rem; color: #cbd5e1; margin-left: 0.25rem;" title="Modo local (localStorage). En producción se conecta a Supabase Auth.">
            [Modo Local]
          </span>
        ` : ''}
      </div>
    `;

    const select = container.querySelector('#quick-role-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.switchRole(e.target.value);
      });
    }
  }
};
