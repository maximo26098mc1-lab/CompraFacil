/**
 * CompraFácil - Control de Autenticación, Roles y Permisos
 * js/modules/auth.js
 */

import { state } from '../state.js';

export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  POLICE: 'police',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  buyer: 'Comprador (C2C/B2C)',
  seller: 'Vendedor / Comercio',
  police: 'Fuerzas de Seguridad / Policía',
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
    return role === ROLES.POLICE || role === ROLES.ADMIN;
  },

  canAccessSeller() {
    const role = this.getCurrentRole();
    return role === ROLES.SELLER || role === ROLES.ADMIN;
  },

  canAccessAdmin() {
    const role = this.getCurrentRole();
    return role === ROLES.ADMIN;
  },

  switchRole(role) {
    state.setCurrentUser(role);
  },

  renderRoleSwitcher(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentUser = state.getCurrentUser();
    const currentRole = currentUser ? currentUser.role : ROLES.BUYER;

    container.innerHTML = `
      <div class="role-quick-bar" title="Cambiar rol activo para evaluar las distintas perspectivas del sistema">
        <span class="role-label">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Rol Demo:
        </span>
        <select id="quick-role-select" class="role-select" aria-label="Seleccionar rol activo">
          <option value="buyer" ${currentRole === 'buyer' ? 'selected' : ''}>👤 Comprador</option>
          <option value="seller" ${currentRole === 'seller' ? 'selected' : ''}>🏪 Vendedor</option>
          <option value="police" ${currentRole === 'police' ? 'selected' : ''}>🛡️ Policía / Investigador</option>
          <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>⚙️ Administrador</option>
        </select>
      </div>
    `;

    const select = container.querySelector('#quick-role-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const newRole = e.target.value;
        this.switchRole(newRole);
      });
    }
  },

  renderUserStatus(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = state.getCurrentUser();
    if (!user) return;

    let badgeClass = 'badge-info';
    let roleText = 'Comprador';

    if (user.role === ROLES.POLICE) {
      badgeClass = 'badge-danger';
      roleText = 'Fuerza Policial';
    } else if (user.role === ROLES.SELLER) {
      badgeClass = 'badge-warning';
      roleText = 'Vendedor';
    } else if (user.role === ROLES.ADMIN) {
      badgeClass = 'badge-secondary';
      roleText = 'Administrador';
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.85rem; font-weight: 600;">${user.name}</span>
        <span class="badge ${badgeClass}">${roleText}</span>
      </div>
    `;
  }
};
