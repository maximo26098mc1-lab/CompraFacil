/**
 * CompraFácil - Panel de Gestión para Vendedores
 * js/modules/sellerDashboard.js
 */

import { state } from '../state.js';
import { auth } from './auth.js';

export const sellerDashboard = {
  activeTab: 'publications', // 'publications' | 'new-product' | 'questions' | 'orders'

  render(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!auth.canAccessSeller()) {
      container.innerHTML = `
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
          <h2>Acceso Exclusivo para Vendedores</h2>
          <p style="color: var(--text-muted); margin: 1rem 0;">
            Tu usuario actual no tiene el rol de Vendedor. Podés cambiar el rol desde el selector superior para probar esta función.
          </p>
          <button id="btn-switch-seller" class="btn btn-primary">Cambiar a Rol Vendedor</button>
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

    const allProducts = state.getState().products || [];
    const currentUser = auth.getCurrentUser();
    // En demo, mostramos los productos que pertenecen al vendedor o todos si es vendedor demo
    const myProducts = allProducts.filter(p => p.sellerId === currentUser.id || currentUser.id === 'u-vendedor');
    const myOrders = state.getState().orders || [];
    
    // Contar preguntas pendientes
    let pendingQuestionsCount = 0;
    myProducts.forEach(p => {
      (p.questions || []).forEach(q => {
        if (!q.answer) pendingQuestionsCount++;
      });
    });

    const totalRevenue = myOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const html = `
      <div class="container">
        <!-- Encabezado de Vendedor -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800; margin: 0;">Panel de Control del Vendedor</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">
              Comercio: <strong>${currentUser.name}</strong> • Reputación: <span style="color: #059669; font-weight: 700;">4.9 ★ MercadoLíder Platinum</span>
            </p>
          </div>
          <button id="btn-new-listing" class="btn btn-primary">
            + Publicar Nuevo Producto
          </button>
        </div>

        <!-- Tarjetas de Métricas -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div>
              <div class="metric-value">${state.formatARS(totalRevenue)}</div>
              <div class="metric-label">Facturación Total en ARS</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div>
              <div class="metric-value">${myProducts.length}</div>
              <div class="metric-label">Publicaciones Activas</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💬</div>
            <div>
              <div class="metric-value">${pendingQuestionsCount}</div>
              <div class="metric-label">Preguntas por Responder</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div>
              <div class="metric-value">${myOrders.length}</div>
              <div class="metric-label">Órdenes Concretadas</div>
            </div>
          </div>
        </div>

        <!-- Navegación de Pestañas -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem;">
          <button class="btn btn-sm ${this.activeTab === 'publications' ? 'btn-primary' : 'btn-secondary'} tab-btn" data-tab="publications">
            Mis Publicaciones (${myProducts.length})
          </button>
          <button class="btn btn-sm ${this.activeTab === 'new-product' ? 'btn-primary' : 'btn-secondary'} tab-btn" data-tab="new-product">
            + Nueva Publicación
          </button>
          <button class="btn btn-sm ${this.activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'} tab-btn" data-tab="questions">
            Preguntas Pendientes (${pendingQuestionsCount})
          </button>
          <button class="btn btn-sm ${this.activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'} tab-btn" data-tab="orders">
            Ventas Realizadas (${myOrders.length})
          </button>
        </div>

        <!-- Contenido de Pestañas -->
        <div>
          ${this.activeTab === 'publications' ? this._renderPublicationsTab(myProducts) : ''}
          ${this.activeTab === 'new-product' ? this._renderNewProductTab() : ''}
          ${this.activeTab === 'questions' ? this._renderQuestionsTab(myProducts) : ''}
          ${this.activeTab === 'orders' ? this._renderOrdersTab(myOrders) : ''}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this._attachEvents(container);
  },

  _renderPublicationsTab(products) {
    if (products.length === 0) {
      return `
        <div style="background: var(--bg-card); border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid var(--border-color);">
          <p style="color: var(--text-muted); margin-bottom: 1rem;">No tenés publicaciones activas actualmente.</p>
          <button class="btn btn-primary" onclick="document.querySelector('[data-tab=new-product]').click()">Crear mi primera publicación</button>
        </div>
      `;
    }

    return `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Identificador / Serie</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${p.image}" alt="${p.title}" style="width: 48px; height: 48px; border-radius: 4px; object-fit: cover; border: 1px solid var(--border-color);" />
                    <div>
                      <div style="font-weight: 600; color: var(--text-main); font-size: 0.92rem;">${p.title}</div>
                      <div style="font-size: 0.78rem; color: var(--text-muted);">${p.category} • ${p.province}</div>
                    </div>
                  </div>
                </td>
                <td>
                  ${p.serialNumber || p.imei ? `
                    <code style="font-size: 0.78rem; background: #e2e8f0; padding: 0.2rem 0.4rem; border-radius: 4px;">
                      ${p.serialNumber || p.imei}
                    </code>
                  ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Sin serie</span>'}
                </td>
                <td style="font-weight: 700;">${state.formatARS(p.price)}</td>
                <td>${p.stock} u.</td>
                <td>
                  ${p.isFrozen ? `
                    <span class="badge badge-danger">⚖️ Bloqueado Policial</span>
                  ` : `
                    <span class="badge badge-success">Activo</span>
                  `}
                </td>
                <td>
                  <div style="display: flex; gap: 0.5rem;">
                    <a href="#/product/${p.id}" class="btn btn-sm btn-secondary" title="Ver en Catálogo">Ver</a>
                    <button class="btn btn-sm btn-danger btn-delete-prod" data-id="${p.id}" title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderNewProductTab() {
    const categories = state.getState().categories || [];
    const provinces = state.getState().provinces || [];

    return `
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem; max-width: 820px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem;">Publicar un Nuevo Producto</h3>

        <!-- Nota de Seguridad y Verificación -->
        <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 0.75rem;">
          <span style="font-size: 1.3rem;">🛡️</span>
          <div style="font-size: 0.85rem; color: #1e40af;">
            <strong>Aviso de Trazabilidad Policial:</strong> CompraFácil valida automáticamente el número de serie, IMEI o cuadro contra la base de datos nacional de denuncias judiciales de objetos sustraídos. Publicar bienes con pedido de secuestro activo constituye delito tipificado.
          </div>
        </div>

        <form id="form-publish-product">
          <div class="form-group">
            <label class="form-label">Título de la Publicación <span class="required">*</span></label>
            <input type="text" id="new-prod-title" class="form-input" placeholder="Ej: iPhone 13 Pro 128GB Grafito Impecable Batería 88%" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Categoría <span class="required">*</span></label>
              <select id="new-prod-category" class="form-select" required>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Condición <span class="required">*</span></label>
              <select id="new-prod-condition" class="form-select" required>
                <option value="usado">Usado</option>
                <option value="nuevo">Nuevo (Sellado en caja)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Marca <span class="required">*</span></label>
              <input type="text" id="new-prod-brand" class="form-input" placeholder="Ej: Apple, Venzo, DeWalt, Sony" required />
            </div>
            <div class="form-group">
              <label class="form-label">Modelo <span class="required">*</span></label>
              <input type="text" id="new-prod-model" class="form-input" placeholder="Ej: iPhone 13 Pro, Inferno 29, DCD796" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                Número de Serie / IMEI / N° de Cuadro
                <span style="font-size: 0.75rem; color: var(--primary); font-weight: normal;">(Recomendado para verificación)</span>
              </label>
              <input type="text" id="new-prod-serial" class="form-input" placeholder="Ej: 354892110293847 o VNZ-2023-88419X" />
              <div class="form-help">Si el bien cuenta con número de serie visible, regístrelo para certificar autenticidad.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Precio en Pesos Argentinos (ARS) <span class="required">*</span></label>
              <input type="number" id="new-prod-price" class="form-input" placeholder="Ej: 450000" min="100" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Provincia <span class="required">*</span></label>
              <select id="new-prod-province" class="form-select" required>
                ${provinces.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ciudad / Localidad <span class="required">*</span></label>
              <input type="text" id="new-prod-city" class="form-input" placeholder="Ej: San Isidro, Palermo, Rosario" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Stock Inicial <span class="required">*</span></label>
              <input type="number" id="new-prod-stock" class="form-input" value="1" min="1" required />
            </div>
            <div class="form-group">
              <label class="form-label">URL de la Foto</label>
              <input type="url" id="new-prod-image" class="form-input" placeholder="https://..." value="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Descripción detallada</label>
            <textarea id="new-prod-desc" class="form-textarea" placeholder="Describí el estado del producto, accesorios incluidos, detalles o marcas de uso..."></textarea>
          </div>

          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; cursor: pointer; color: #065f46; font-weight: 600;">
              <input type="checkbox" id="new-prod-free-shipping" checked />
              Ofrecer Envío Gratis a cargo del vendedor
            </label>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary" onclick="document.querySelector('[data-tab=publications]').click()">Cancelar</button>
            <button type="submit" class="btn btn-primary btn-lg">Publicar Producto</button>
          </div>
        </form>
      </div>
    `;
  },

  _renderQuestionsTab(products) {
    const list = [];
    products.forEach(p => {
      (p.questions || []).forEach(q => {
        list.push({ product: p, question: q });
      });
    });

    if (list.length === 0) {
      return `
        <div style="background: var(--bg-card); border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid var(--border-color);">
          <p style="color: var(--text-muted);">No tenés preguntas realizadas por compradores.</p>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${list.map(({ product, question }) => `
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              En publicación: <strong>${product.title}</strong> (${state.formatARS(product.price)})
            </div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem; margin-bottom: 0.5rem;">
              👤 ${question.userName || 'Comprador'}: "${question.text}"
            </div>
            ${question.answer ? `
              <div style="background: #ecfdf5; border-left: 3px solid #10b981; padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; color: #065f46;">
                <strong>Tu respuesta:</strong> ${question.answer}
              </div>
            ` : `
              <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                <input type="text" class="form-input seller-ans-input" data-pid="${product.id}" data-qid="${question.id}" placeholder="Escribir respuesta para el comprador..." style="font-size: 0.85rem;" />
                <button class="btn btn-primary btn-seller-submit-ans" data-pid="${product.id}" data-qid="${question.id}">
                  Responder
                </button>
              </div>
            `}
          </div>
        `).join('')}
      </div>
    `;
  },

  _renderOrdersTab(orders) {
    if (orders.length === 0) {
      return `
        <div style="background: var(--bg-card); border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid var(--border-color);">
          <p style="color: var(--text-muted);">Aún no registrás ventas concretadas.</p>
        </div>
      `;
    }

    return `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Orden</th>
              <th>Fecha</th>
              <th>Detalle</th>
              <th>Comprador / Destino</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td style="font-size: 0.85rem; color: var(--text-muted);">${new Date(o.date).toLocaleDateString('es-AR')}</td>
                <td>${(o.items || []).map(i => `${i.quantity}x ${i.title}`).join(', ')}</td>
                <td style="font-size: 0.85rem;">${o.shippingAddress || 'Retiro en punto seguro'}</td>
                <td style="font-weight: 700;">${state.formatARS(o.total)}</td>
                <td><span class="badge badge-success">${o.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _attachEvents(container) {
    // Cambio de Pestañas
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    const btnNewListing = container.querySelector('#btn-new-listing');
    if (btnNewListing) {
      btnNewListing.addEventListener('click', () => {
        this.activeTab = 'new-product';
        this.render();
      });
    }

    // Publicar Producto Form
    const formPublish = container.querySelector('#form-publish-product');
    if (formPublish) {
      formPublish.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUser = auth.getCurrentUser();

        const title = container.querySelector('#new-prod-title').value.trim();
        const category = container.querySelector('#new-prod-category').value;
        const condition = container.querySelector('#new-prod-condition').value;
        const brand = container.querySelector('#new-prod-brand').value.trim();
        const model = container.querySelector('#new-prod-model').value.trim();
        const serial = container.querySelector('#new-prod-serial').value.trim();
        const price = parseFloat(container.querySelector('#new-prod-price').value);
        const province = container.querySelector('#new-prod-province').value;
        const city = container.querySelector('#new-prod-city').value.trim();
        const stock = parseInt(container.querySelector('#new-prod-stock').value, 10);
        const image = container.querySelector('#new-prod-image').value.trim();
        const desc = container.querySelector('#new-prod-desc').value.trim();
        const freeShipping = container.querySelector('#new-prod-free-shipping').checked;

        const newProd = state.addProduct({
          title,
          category,
          condition,
          brand,
          model,
          serialNumber: serial,
          price,
          province,
          city,
          stock,
          image,
          description: desc,
          freeShipping,
          sellerId: currentUser.id,
          sellerName: currentUser.name
        });

        if (window.app && window.app.showToast) {
          window.app.showToast('¡Publicación creada y disponible en el catálogo!', 'success');
        }

        this.activeTab = 'publications';
        this.render();
      });
    }

    // Eliminar Producto
    container.querySelectorAll('.btn-delete-prod').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Estás seguro de eliminar esta publicación del catálogo?')) {
          state.deleteProduct(id);
          if (window.app && window.app.showToast) {
            window.app.showToast('Publicación eliminada', 'info');
          }
          this.render();
        }
      });
    });

    // Responder Pregunta desde Pestaña
    container.querySelectorAll('.btn-seller-submit-ans').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-pid');
        const qid = btn.getAttribute('data-qid');
        const input = container.querySelector(`.seller-ans-input[data-qid="${qid}"]`);
        if (input && input.value.trim()) {
          state.addAnswer(pid, qid, input.value.trim());
          if (window.app && window.app.showToast) {
            window.app.showToast('Respuesta enviada al comprador', 'success');
          }
          this.render();
        }
      });
    });
  }
};
