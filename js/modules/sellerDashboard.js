/**
 * CompraFácil v2 - Panel de Gestión de Anuncios del Vendedor
 * js/modules/sellerDashboard.js
 */

import { state, normalizeWhatsApp } from '../state.js';
import { auth } from './auth.js';

export const sellerDashboard = {
  activeTab: 'my-ads', // 'my-ads' | 'new-ad' | 'edit-ad'
  editingAdId: null,

  render(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!auth.canAccessSeller()) {
      container.innerHTML = `
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🏪</div>
          <h2>Panel de Anunciantes</h2>
          <p style="color: var(--text-muted); margin: 1rem 0;">
            Tu perfil actual no tiene rol de Anunciante. Podés cambiar el rol desde el selector superior para probar esta función.
          </p>
          <button id="btn-switch-seller" class="btn btn-primary">Cambiar a Rol Anunciante</button>
        </div>
      `;
      const btn = container.querySelector('#btn-switch-seller');
      if (btn) {
        btn.addEventListener('click', () => {
          auth.switchRole('seller');
          this.render();
        });
      }
      return;
    }

    const currentUser = auth.getCurrentUser();
    const allAds = state.getState().products || [];
    // Anuncios del usuario actual (en modo local / demo)
    const myAds = allAds.filter(a => a.sellerId === currentUser.id || currentUser.id === 'u-anunciante-1');
    const activeCount = myAds.filter(a => a.status === 'disponible').length;
    const soldCount = myAds.filter(a => a.status === 'vendido').length;

    const html = `
      <div class="container">
        <!-- Encabezado del Panel -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800; margin: 0;">Panel de Anuncios</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">
              Anunciante: <strong>${currentUser.name}</strong> • Gestioná tus avisos clasificados y contactos de WhatsApp.
            </p>
          </div>
          <button id="btn-tab-new-ad" class="btn btn-primary">
            + Publicar Nuevo Anuncio
          </button>
        </div>

        <!-- Métricas Simples -->
        <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
          <div class="metric-card">
            <div class="metric-icon">📢</div>
            <div>
              <div class="metric-value">${activeCount}</div>
              <div class="metric-label">Anuncios Activos</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🤝</div>
            <div>
              <div class="metric-value">${soldCount}</div>
              <div class="metric-label">Artículos Vendidos</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div>
              <div class="metric-value">${myAds.length}</div>
              <div class="metric-label">Total Publicaciones</div>
            </div>
          </div>
        </div>

        <!-- Pestañas de Navegación -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem;">
          <button class="btn btn-sm ${this.activeTab === 'my-ads' ? 'btn-primary' : 'btn-secondary'} tab-btn" data-tab="my-ads">
            Mis Anuncios (${myAds.length})
          </button>
          <button class="btn btn-sm ${this.activeTab === 'new-ad' ? 'btn-primary' : 'btn-secondary'} tab-btn" data-tab="new-ad">
            + Publicar Anuncio
          </button>
          ${this.activeTab === 'edit-ad' ? `
            <button class="btn btn-sm btn-primary tab-btn" data-tab="edit-ad">
              ✏️ Editar Anuncio
            </button>
          ` : ''}
        </div>

        <!-- Contenido de la Pestaña -->
        <div>
          ${this.activeTab === 'my-ads' ? this._renderMyAdsTab(myAds) : ''}
          ${this.activeTab === 'new-ad' ? this._renderNewAdTab() : ''}
          ${this.activeTab === 'edit-ad' ? this._renderEditAdTab() : ''}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this._attachEvents(container);
  },

  _renderMyAdsTab(myAds) {
    if (myAds.length === 0) {
      return `
        <div style="background: var(--bg-card); border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid var(--border-color);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📢</div>
          <p style="color: var(--text-muted); margin-bottom: 1rem;">Aún no tenés anuncios publicados.</p>
          <button class="btn btn-primary" id="btn-create-first-ad">Publicar mi primer anuncio</button>
        </div>
      `;
    }

    return `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Anuncio</th>
              <th>WhatsApp de Contacto</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${myAds.map(ad => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${ad.image}" alt="${ad.title}" style="width: 48px; height: 48px; border-radius: 4px; object-fit: cover; border: 1px solid var(--border-color);" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'48\\' height=\\'48\\'><rect width=\\'48\\' height=\\'48\\' fill=\\'%23e2e8f0\\'/></svg>'" />
                    <div>
                      <div style="font-weight: 600; color: var(--text-main); font-size: 0.92rem;">${ad.title}</div>
                      <div style="font-size: 0.78rem; color: var(--text-muted);">${ad.category} • 📍 ${ad.city || ''}, ${ad.province}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <code style="background: #ecfdf5; color: #065f46; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.85rem;">
                    ${ad.whatsapp}
                  </code>
                </td>
                <td style="font-weight: 700;">${state.formatARS(ad.price)}</td>
                <td>
                  ${ad.status === 'vendido' ? `
                    <span class="badge badge-secondary">Vendido</span>
                  ` : ad.status === 'disponible' ? `
                    <span class="badge badge-success">Disponible</span>
                  ` : `
                    <span class="badge badge-warning">Retirado</span>
                  `}
                </td>
                <td>
                  <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    <a href="#/product/${ad.id}" class="btn btn-sm btn-secondary" title="Ver anuncio">Ver</a>
                    
                    ${ad.status === 'disponible' ? `
                      <button class="btn btn-sm btn-outline btn-toggle-sold" data-id="${ad.id}" data-action="sold" title="Marcar como vendido">
                        Vendido
                      </button>
                    ` : `
                      <button class="btn btn-sm btn-outline btn-toggle-sold" data-id="${ad.id}" data-action="available" title="Marcar como disponible">
                        Disponible
                      </button>
                    `}

                    <button class="btn btn-sm btn-secondary btn-edit-ad" data-id="${ad.id}" title="Editar anuncio">
                      ✏️
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete-ad" data-id="${ad.id}" title="Retirar anuncio">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderNewAdTab() {
    const categories = state.getState().categories || [];
    const provinces = state.getState().provinces || [];
    const currentUser = auth.getCurrentUser();

    return `
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem; max-width: 820px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Publicar un Nuevo Anuncio</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Los interesados se contactarán directamente a tu WhatsApp para convenir el precio final, forma de pago y entrega.
        </p>

        <!-- Cuadro de Aviso Obligatorio de Visibilidad del Contacto -->
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; display: flex; gap: 0.85rem; align-items: flex-start;">
          <span style="font-size: 1.5rem; line-height: 1;">⚠️</span>
          <div style="font-size: 0.88rem; color: #92400e; line-height: 1.6;">
            <strong>Información al anunciante antes de publicar:</strong><br>
            Tu número de WhatsApp será visible públicamente para cualquier persona que consulte tu publicación, así como para autoridades que visiten el sitio. No publiques domicilios exactos ni datos personales innecesarios. Se prohíbe terminantemente la publicación de bienes de procedencia ilícita o robados.
          </div>
        </div>

        <form id="form-publish-ad">
          <div class="form-group">
            <label class="form-label">Título de la Publicación <span class="required">*</span></label>
            <input type="text" id="new-ad-title" class="form-input" placeholder="Ej: Bicicleta Mountain Bike Venzo Rodado 29 Inferno" required minlength="5" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Categoría <span class="required">*</span></label>
              <select id="new-ad-category" class="form-select" required>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Condición <span class="required">*</span></label>
              <select id="new-ad-condition" class="form-select" required>
                <option value="usado">Usado</option>
                <option value="nuevo">Nuevo</option>
              </select>
            </div>
          </div>

          <!-- Contacto de WhatsApp Obligatorio -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Número de WhatsApp de Contacto <span class="required">*</span></label>
              <input type="tel" id="new-ad-whatsapp" class="form-input" placeholder="Ej: +54 9 11 5566-7788" value="${currentUser.phone || ''}" required />
              <div class="form-help">Incluí código de país y de área (formato internacional). Ejemplo en Argentina: <code>+54 9 11 5566-7788</code>.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Precio en Pesos Argentinos (ARS) <span class="required">*</span></label>
              <input type="number" id="new-ad-price" class="form-input" placeholder="Ej: 350000" min="0" required />
              <div class="form-help">Precio de referencia. El precio final y la forma de pago se acuerdan por WhatsApp.</div>
            </div>
          </div>

          <!-- Ubicación General (Sin dirección exacta) -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Provincia <span class="required">*</span></label>
              <select id="new-ad-province" class="form-select" required>
                ${provinces.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ciudad / Barrio general <span class="required">*</span></label>
              <input type="text" id="new-ad-city" class="form-input" placeholder="Ej: Palermo, Vicente López, Rosario Centro" required />
              <div class="form-help">Solo zona o localidad. No ingreses calle ni numeración por seguridad.</div>
            </div>
          </div>

          <!-- Datos de Trazabilidad y Características -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Marca</label>
              <input type="text" id="new-ad-brand" class="form-input" placeholder="Ej: Apple, Venzo, DeWalt" />
            </div>
            <div class="form-group">
              <label class="form-label">Modelo</label>
              <input type="text" id="new-ad-model" class="form-input" placeholder="Ej: iPhone 14 Pro, DCD796" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Número de Serie / IMEI / Cuadro (Opcional)</label>
              <input type="text" id="new-ad-serial" class="form-input" placeholder="Ej: F2LXT909MD6R" />
              <div class="form-help">Permite certificar la autenticidad del bien.</div>
            </div>
            <div class="form-group">
              <label class="form-label">URL de Fotografía</label>
              <input type="url" id="new-ad-image" class="form-input" placeholder="https://images.unsplash.com/..." value="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Descripción detallada</label>
            <textarea id="new-ad-desc" class="form-textarea" placeholder="Describí el estado del bien, accesorios incluidos y puntos de encuentro sugeridos para la entrega..."></textarea>
          </div>

          <!-- Aceptación Obligatoria de Términos -->
          <div class="form-group" style="background: #f8fafc; border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md);">
            <label style="display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.88rem; cursor: pointer; color: var(--text-main);">
              <input type="checkbox" id="check-accept-terms" required style="margin-top: 0.25rem;" />
              <span>
                He leído y acepto los <a href="#/terms" target="_blank">Términos de Uso y Responsabilidad</a> y la <a href="#/privacy" target="_blank">Política de Privacidad</a> de CompraFácil (Borrador v2). Declaro ser el titular legítimo del bien ofrecido y autorizo la visualización de mi número de WhatsApp para el contacto directo.
              </span>
            </label>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-new-ad">Cancelar</button>
            <button type="submit" class="btn btn-primary btn-lg">Publicar Anuncio</button>
          </div>
        </form>
      </div>
    `;
  },

  _renderEditAdTab() {
    const ad = state.getProductById(this.editingAdId);
    if (!ad) {
      return `<p>Anuncio no encontrado para editar.</p>`;
    }
    const categories = state.getState().categories || [];
    const provinces = state.getState().provinces || [];

    return `
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem; max-width: 820px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem;">Editar Anuncio</h3>

        <form id="form-edit-ad">
          <div class="form-group">
            <label class="form-label">Título de la Publicación <span class="required">*</span></label>
            <input type="text" id="edit-ad-title" class="form-input" value="${ad.title}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Categoría <span class="required">*</span></label>
              <select id="edit-ad-category" class="form-select" required>
                ${categories.map(c => `<option value="${c}" ${ad.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Condición <span class="required">*</span></label>
              <select id="edit-ad-condition" class="form-select" required>
                <option value="usado" ${ad.condition === 'usado' ? 'selected' : ''}>Usado</option>
                <option value="nuevo" ${ad.condition === 'nuevo' ? 'selected' : ''}>Nuevo</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">WhatsApp de Contacto <span class="required">*</span></label>
              <input type="tel" id="edit-ad-whatsapp" class="form-input" value="${ad.whatsapp}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Precio en Pesos Argentinos (ARS) <span class="required">*</span></label>
              <input type="number" id="edit-ad-price" class="form-input" value="${ad.price}" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Provincia <span class="required">*</span></label>
              <select id="edit-ad-province" class="form-select" required>
                ${provinces.map(p => `<option value="${p}" ${ad.province === p ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ciudad / Barrio general <span class="required">*</span></label>
              <input type="text" id="edit-ad-city" class="form-input" value="${ad.city || ''}" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea id="edit-ad-desc" class="form-textarea">${ad.description || ''}</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-edit-ad">Cancelar</button>
            <button type="submit" class="btn btn-primary btn-lg">Guardar Cambios</button>
          </div>
        </form>
      </div>
    `;
  },

  _attachEvents(container) {
    // Cambio de pestañas
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    const btnNew = container.querySelector('#btn-tab-new-ad');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        this.activeTab = 'new-ad';
        this.render();
      });
    }

    const btnFirst = container.querySelector('#btn-create-first-ad');
    if (btnFirst) {
      btnFirst.addEventListener('click', () => {
        this.activeTab = 'new-ad';
        this.render();
      });
    }

    const btnCancelNew = container.querySelector('#btn-cancel-new-ad');
    if (btnCancelNew) {
      btnCancelNew.addEventListener('click', () => {
        this.activeTab = 'my-ads';
        this.render();
      });
    }

    const btnCancelEdit = container.querySelector('#btn-cancel-edit-ad');
    if (btnCancelEdit) {
      btnCancelEdit.addEventListener('click', () => {
        this.activeTab = 'my-ads';
        this.editingAdId = null;
        this.render();
      });
    }

    // Publicar Nuevo Anuncio
    const formNew = container.querySelector('#form-publish-ad');
    if (formNew) {
      formNew.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUser = auth.getCurrentUser();
        const title = container.querySelector('#new-ad-title').value.trim();
        const category = container.querySelector('#new-ad-category').value;
        const condition = container.querySelector('#new-ad-condition').value;
        const whatsapp = container.querySelector('#new-ad-whatsapp').value.trim();
        const price = parseFloat(container.querySelector('#new-ad-price').value);
        const province = container.querySelector('#new-ad-province').value;
        const city = container.querySelector('#new-ad-city').value.trim();
        const brand = container.querySelector('#new-ad-brand').value.trim();
        const model = container.querySelector('#new-ad-model').value.trim();
        const serial = container.querySelector('#new-ad-serial').value.trim();
        const image = container.querySelector('#new-ad-image').value.trim();
        const desc = container.querySelector('#new-ad-desc').value.trim();
        const termsAccepted = container.querySelector('#check-accept-terms').checked;

        const norm = normalizeWhatsApp(whatsapp);
        if (!norm || norm.length < 10) {
          alert('Por favor ingrese un número de WhatsApp válido con código internacional (mínimo 10 dígitos). Ejemplo: +54 9 11 5566-7788.');
          return;
        }

        if (!termsAccepted) {
          alert('Debe aceptar los Términos de Uso y la Política de Privacidad para publicar.');
          return;
        }

        const newAd = state.addProduct({
          title,
          category,
          condition,
          whatsapp,
          price,
          province,
          city,
          brand,
          model,
          serialNumber: serial,
          image,
          description: desc,
          sellerId: currentUser.id,
          sellerName: currentUser.name
        });

        if (window.app && window.app.showToast) {
          window.app.showToast('¡Tu anuncio ha sido publicado y está disponible en el catálogo!', 'success');
        }

        this.activeTab = 'my-ads';
        this.render();
      });
    }

    // Editar Anuncio Guardar
    const formEdit = container.querySelector('#form-edit-ad');
    if (formEdit) {
      formEdit.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = container.querySelector('#edit-ad-title').value.trim();
        const category = container.querySelector('#edit-ad-category').value;
        const condition = container.querySelector('#edit-ad-condition').value;
        const whatsapp = container.querySelector('#edit-ad-whatsapp').value.trim();
        const price = parseFloat(container.querySelector('#edit-ad-price').value);
        const province = container.querySelector('#edit-ad-province').value;
        const city = container.querySelector('#edit-ad-city').value.trim();
        const desc = container.querySelector('#edit-ad-desc').value.trim();

        const norm = normalizeWhatsApp(whatsapp);
        if (!norm || norm.length < 10) {
          alert('Por favor ingrese un número de WhatsApp válido.');
          return;
        }

        state.updateProduct(this.editingAdId, {
          title,
          category,
          condition,
          whatsapp,
          price,
          province,
          city,
          description: desc
        });

        if (window.app && window.app.showToast) {
          window.app.showToast('Anuncio actualizado con éxito.', 'success');
        }

        this.activeTab = 'my-ads';
        this.editingAdId = null;
        this.render();
      });
    }

    // Acciones de tabla: Sold / Available
    container.querySelectorAll('.btn-toggle-sold').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        if (action === 'sold') {
          state.markProductAsSold(id);
          if (window.app && window.app.showToast) window.app.showToast('Anuncio marcado como VENDIDO.', 'info');
        } else {
          state.markProductAsAvailable(id);
          if (window.app && window.app.showToast) window.app.showToast('Anuncio marcado como DISPONIBLE.', 'success');
        }
        this.render();
      });
    });

    // Editar botón
    container.querySelectorAll('.btn-edit-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.editingAdId = id;
        this.activeTab = 'edit-ad';
        this.render();
      });
    });

    // Retirar / Eliminar botón
    container.querySelectorAll('.btn-delete-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Deseas retirar definitivamente este anuncio del catálogo?')) {
          state.withdrawProduct(id);
          if (window.app && window.app.showToast) window.app.showToast('Anuncio retirado del catálogo.', 'info');
          this.render();
        }
      });
    });
  }
};
