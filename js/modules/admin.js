/**
 * CompraFácil - Panel de Administración General y Moderación
 * js/modules/admin.js
 */

import { state } from '../state.js';
import { auth } from './auth.js';

export const admin = {
  activeTab: 'overview', // 'overview' | 'moderation' | 'users' | 'audit'

  render(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!auth.canAccessAdmin()) {
      container.innerHTML = `
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚙️</div>
          <h2>Acceso Reservado a Administradores</h2>
          <p style="color: var(--text-muted); margin: 1rem 0;">
            Tu usuario actual no posee permisos de Administrador de Plataforma.
          </p>
          <button id="btn-switch-admin" class="btn btn-primary">Cambiar a Rol Administrador</button>
        </div>
      `;
      const btn = container.querySelector('#btn-switch-admin');
      if (btn) {
        btn.addEventListener('click', () => {
          auth.switchRole('admin');
          this.render();
        });
      }
      return;
    }

    const currentState = state.getState();
    const products = currentState.products || [];
    const users = currentState.users || [];
    const records = currentState.securityRecords || [];
    const reports = currentState.adReports || [];
    const logs = currentState.auditLog || [];
    const soldCount = products.filter(p => p.status === 'vendido').length;

    const html = `
      <div class="container">
        <!-- Encabezado Administrador -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800; margin: 0;">Panel de Administración Central</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">
              Auditoría global, moderación preventiva y control de trazabilidad.
            </p>
          </div>
          <button id="btn-reset-demo" class="btn btn-danger btn-sm" title="Restaura la base de datos a los valores iniciales de prueba">
            🔄 Restablecer Datos Semilla Demo
          </button>
        </div>

        <!-- Tarjetas de Métricas Globales -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">👥</div>
            <div>
              <div class="metric-value">${users.length}</div>
              <div class="metric-label">Usuarios Registrados</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📢</div>
            <div>
              <div class="metric-value">${products.length}</div>
              <div class="metric-label">Anuncios en Plataforma</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🤝</div>
            <div>
              <div class="metric-value" style="color: #059669;">${soldCount}</div>
              <div class="metric-label">Artículos Vendidos</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚩</div>
            <div>
              <div class="metric-value" style="color: #ef4444;">${reports.length}</div>
              <div class="metric-label">Reportes de Publicación</div>
            </div>
          </div>
        </div>

        <!-- Pestañas de Administración -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem;">
          <button class="btn btn-sm ${this.activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'} admin-tab-btn" data-tab="overview">
            Resumen General
          </button>
          <button class="btn btn-sm ${this.activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'} admin-tab-btn" data-tab="moderation">
            Moderación de Catálogo (${products.length})
          </button>
          <button class="btn btn-sm ${this.activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} admin-tab-btn" data-tab="users">
            Usuarios y Roles (${users.length})
          </button>
          <button class="btn btn-sm ${this.activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} admin-tab-btn" data-tab="audit">
            Registro de Auditoría (${logs.length})
          </button>
        </div>

        <!-- Contenido de Pestañas -->
        <div>
          ${this.activeTab === 'overview' ? this._renderOverviewTab(products, reports, logs) : ''}
          ${this.activeTab === 'moderation' ? this._renderModerationTab(products) : ''}
          ${this.activeTab === 'users' ? this._renderUsersTab(users) : ''}
          ${this.activeTab === 'audit' ? this._renderAuditTab(logs) : ''}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this._attachEvents(container);
  },

  _renderOverviewTab(products, reports, logs) {
    const recentLogs = logs.slice(0, 5);

    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Estado del Sistema y Seguridad</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
            <li style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
              <span>Almacenamiento Local:</span>
              <strong style="color: #059669;">Operativo (localStorage reactivo)</strong>
            </li>
            <li style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
              <span>Módulo de Indicios para Autoridades:</span>
              <strong style="color: #0072ce;">Modo evaluación (datos ficticios de desarrollo)</strong>
            </li>
            <li style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
              <span>Fichas de Bienes Registradas:</span>
              <strong>${state.getSecurityRecords().length} fichas</strong>
            </li>
            <li style="display: flex; justify-content: space-between;">
              <span>Canal de Contacto:</span>
              <strong style="color: #059669;">WhatsApp Directo</strong>
            </li>
          </ul>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Últimas Acciones Críticas Registradas</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${recentLogs.map(l => `
              <div style="background: #f8fafc; padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.82rem; border-left: 3px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 0.2rem;">
                  <span>${l.action}</span>
                  <span style="color: var(--text-muted); font-weight: normal;">${new Date(l.timestamp).toLocaleTimeString('es-AR')}</span>
                </div>
                <div style="color: var(--text-muted);">${l.details}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  _renderModerationTab(products) {
    return `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Vendedor</th>
              <th>WhatsApp</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td>
                  <div style="font-weight: 600; font-size: 0.9rem;">${p.title}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${p.category} • 📍 ${p.city || ''}, ${p.province}</div>
                </td>
                <td style="font-size: 0.85rem;">${p.sellerName}</td>
                <td><code style="color: #059669;">${p.whatsapp || 'Sin WhatsApp'}</code></td>
                <td style="font-weight: 700;">${state.formatARS(p.price)}</td>
                <td>
                  <span class="badge ${p.status === 'vendido' ? 'badge-secondary' : p.status === 'disponible' ? 'badge-success' : 'badge-warning'}">
                    ${p.status ? p.status.toUpperCase() : 'DISPONIBLE'}
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 0.4rem;">
                    <a href="#/product/${p.id}" class="btn btn-sm btn-secondary" title="Ver anuncio">Ver</a>
                    <button class="btn btn-sm btn-danger btn-admin-delete" data-id="${p.id}" title="Retirar anuncio">Retirar</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderUsersTab(users) {
    return `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre de Usuario</th>
              <th>Correo Electrónico</th>
              <th>Rol en la Plataforma</th>
              <th>Ubicación / Dependencia</th>
              <th>Acción de Prueba</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>
                  <span class="badge ${u.role === 'police' ? 'badge-danger' : u.role === 'admin' ? 'badge-secondary' : u.role === 'seller' ? 'badge-warning' : 'badge-info'}">
                    ${u.role.toUpperCase()}
                  </span>
                </td>
                <td style="font-size: 0.85rem;">${u.location || u.jurisdiction || 'Nacional'}</td>
                <td>
                  <button class="btn btn-sm btn-outline btn-impersonate" data-role="${u.role}">
                    Simular este Usuario
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderAuditTab(logs) {
    return `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Operador</th>
              <th>Tipo de Acción</th>
              <th>Detalle de la Operación</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(l => `
              <tr>
                <td style="font-size: 0.82rem; white-space: nowrap; color: var(--text-muted);">
                  ${new Date(l.timestamp).toLocaleString('es-AR')}
                </td>
                <td style="font-weight: 600; font-size: 0.85rem;">${l.user}</td>
                <td><span class="badge badge-secondary">${l.action}</span></td>
                <td style="font-size: 0.85rem;">${l.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _attachEvents(container) {
    // Pestañas
    container.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Restablecer Semilla Demo
    const btnReset = container.querySelector('#btn-reset-demo');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('¿Restablecer todas las tablas, publicaciones y denuncias a los valores demo por defecto?')) {
          state.resetToDefaultSeed();
          if (window.app && window.app.showToast) {
            window.app.showToast('Base de datos restablecida a los valores iniciales de prueba.', 'info');
          }
          this.render();
        }
      });
    }

    // Eliminar / retirar anuncio
    container.querySelectorAll('.btn-admin-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Confirmar baja definitiva de la publicación?')) {
          state.deleteProduct(id);
          this.render();
        }
      });
    });

    // Simular usuario
    container.querySelectorAll('.btn-impersonate').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        auth.switchRole(role);
        if (window.app && window.app.showToast) {
          window.app.showToast(`Sesión cambiada a rol ${role}`, 'success');
        }
        this.render();
      });
    });
  }
};
