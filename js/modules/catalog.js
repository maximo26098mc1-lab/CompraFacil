/**
 * CompraFácil - Catálogo de Productos y Filtros
 * js/modules/catalog.js
 */

import { state } from '../state.js';
import { auth } from './auth.js';

export const catalog = {
  currentFilters: {
    query: '',
    category: '',
    province: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    freeShipping: false,
    sortBy: 'relevancia'
  },

  setFilter(key, value) {
    this.currentFilters[key] = value;
    this.render();
  },

  resetFilters() {
    this.currentFilters = {
      query: '',
      category: '',
      province: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      freeShipping: false,
      sortBy: 'relevancia'
    };
    this.render();
  },

  getFilteredProducts() {
    const isPoliceOrAdmin = auth.canAccessSecurity();
    const allProducts = state.getProducts(isPoliceOrAdmin);
    const { query, category, province, condition, minPrice, maxPrice, freeShipping, sortBy } = this.currentFilters;

    let filtered = allProducts.filter(p => {
      // Búsqueda de texto
      if (query) {
        const q = query.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesBrand = p.brand && p.brand.toLowerCase().includes(q);
        const matchesModel = p.model && p.model.toLowerCase().includes(q);
        const matchesDesc = p.description && p.description.toLowerCase().includes(q);
        const matchesSerial = p.serialNumber && p.serialNumber.toLowerCase().includes(q);
        const matchesIMEI = p.imei && p.imei.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesModel && !matchesDesc && !matchesSerial && !matchesIMEI) {
          return false;
        }
      }

      // Categoría
      if (category && p.category !== category) return false;

      // Provincia
      if (province && p.province !== province) return false;

      // Condición
      if (condition && p.condition !== condition) return false;

      // Envío Gratis
      if (freeShipping && !p.freeShipping) return false;

      // Rango de precio
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      if (!isNaN(min) && p.price < min) return false;
      if (!isNaN(max) && p.price > max) return false;

      return true;
    });

    // Ordenamiento
    if (sortBy === 'menor-precio') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'mayor-precio') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'recientes') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  },

  render(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = this.getFilteredProducts();
    const categories = state.getState().categories || [];
    const provinces = state.getState().provinces || [];

    const html = `
      <div class="container">
        <!-- Banner promocional estilo e-commerce argentino -->
        <div style="background: linear-gradient(135deg, #0072ce 0%, #004c99 100%); color: #ffffff; padding: 1.25rem 1.75rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="background: var(--accent); color: #1e293b; font-size: 0.75rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 4px;">COMPRA PROTEGIDA</span>
              <span style="font-size: 0.85rem; opacity: 0.9;">Mercado Argentino C2C / B2C</span>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0;">CompraFácil con Trazabilidad y Verificación Policial</h2>
            <p style="font-size: 0.9rem; opacity: 0.9; margin-top: 0.2rem;">Tecnología integrada con el Sistema Nacional de Detección de Objetos Sustraídos.</p>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <a href="#/security" class="btn btn-sm" style="background: rgba(255,255,255,0.15); color: #ffffff; border: 1px solid rgba(255,255,255,0.3);">
              🛡️ Ver Módulo de Seguridad
            </a>
          </div>
        </div>

        <div class="catalog-layout">
          <!-- Barra Lateral de Filtros -->
          <aside class="filters-card">
            <div class="filters-header">
              <span class="filters-title">Filtros</span>
              <button id="btn-clear-filters" class="btn btn-sm btn-secondary" style="font-size: 0.75rem;">Limpiar</button>
            </div>

            <!-- Filtro por Categoría -->
            <div class="filter-group">
              <h4 class="filter-group-title">Categorías</h4>
              <ul class="filter-list">
                <li>
                  <button class="filter-item-btn ${!this.currentFilters.category ? 'active' : ''}" data-category="">
                    Todas
                  </button>
                </li>
                ${categories.map(cat => `
                  <li>
                    <button class="filter-item-btn ${this.currentFilters.category === cat ? 'active' : ''}" data-category="${cat}">
                      ${cat}
                    </button>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Filtro por Condición -->
            <div class="filter-group">
              <h4 class="filter-group-title">Condición</h4>
              <ul class="filter-list">
                <li>
                  <button class="filter-item-btn ${!this.currentFilters.condition ? 'active' : ''}" data-condition="">
                    Todos
                  </button>
                </li>
                <li>
                  <button class="filter-item-btn ${this.currentFilters.condition === 'nuevo' ? 'active' : ''}" data-condition="nuevo">
                    Nuevo
                  </button>
                </li>
                <li>
                  <button class="filter-item-btn ${this.currentFilters.condition === 'usado' ? 'active' : ''}" data-condition="usado">
                    Usado
                  </button>
                </li>
              </ul>
            </div>

            <!-- Filtro por Ubicación -->
            <div class="filter-group">
              <h4 class="filter-group-title">Ubicación</h4>
              <select id="filter-province-select" class="form-select" style="font-size: 0.85rem; padding: 0.4rem;">
                <option value="">Todas las Provincias</option>
                ${provinces.map(prov => `
                  <option value="${prov}" ${this.currentFilters.province === prov ? 'selected' : ''}>${prov}</option>
                `).join('')}
              </select>
            </div>

            <!-- Filtro por Precio -->
            <div class="filter-group">
              <h4 class="filter-group-title">Precio (ARS)</h4>
              <div class="price-inputs-row">
                <input type="number" id="filter-min-price" class="form-input" placeholder="Mínimo" value="${this.currentFilters.minPrice}" style="font-size: 0.82rem; padding: 0.4rem;" />
                <span>-</span>
                <input type="number" id="filter-max-price" class="form-input" placeholder="Máximo" value="${this.currentFilters.maxPrice}" style="font-size: 0.82rem; padding: 0.4rem;" />
              </div>
              <button id="btn-apply-price" class="btn btn-sm btn-outline btn-block" style="margin-top: 0.5rem;">Aplicar</button>
            </div>

            <!-- Envío Gratis -->
            <div class="filter-group" style="margin-bottom: 0;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; cursor: pointer; color: #065f46; font-weight: 600;">
                <input type="checkbox" id="filter-free-shipping" ${this.currentFilters.freeShipping ? 'checked' : ''} />
                Solo con Envío Gratis 🚚
              </label>
            </div>
          </aside>

          <!-- Sección Principal de Resultados -->
          <main>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
                  ${products.length} publicaciones encontradas
                </span>
                ${this.currentFilters.query ? `<span style="color: var(--text-muted); font-size: 0.88rem;"> para "<strong>${this.currentFilters.query}</strong>"</span>` : ''}
              </div>

              <!-- Ordenamiento -->
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem;">
                <label for="catalog-sort-select" style="color: var(--text-muted);">Ordenar por:</label>
                <select id="catalog-sort-select" class="form-select" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.85rem;">
                  <option value="relevancia" ${this.currentFilters.sortBy === 'relevancia' ? 'selected' : ''}>Más relevantes</option>
                  <option value="menor-precio" ${this.currentFilters.sortBy === 'menor-precio' ? 'selected' : ''}>Menor precio</option>
                  <option value="mayor-precio" ${this.currentFilters.sortBy === 'mayor-precio' ? 'selected' : ''}>Mayor precio</option>
                  <option value="recientes" ${this.currentFilters.sortBy === 'recientes' ? 'selected' : ''}>Más recientes</option>
                </select>
              </div>
            </div>

            ${products.length === 0 ? `
              <div style="background: #ffffff; border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid var(--border-color);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">No encontramos publicaciones que coincidan</h3>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Revisá los filtros aplicados o probá con otros términos de búsqueda.</p>
                <button id="btn-empty-reset" class="btn btn-primary">Limpiar todos los filtros</button>
              </div>
            ` : `
              <div class="product-grid">
                ${products.map(product => this._renderProductCard(product)).join('')}
              </div>
            `}
          </main>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this._attachEvents(container);
  },

  _renderProductCard(product) {
    const formattedPrice = state.formatARS(product.price);
    const installmentAmount = state.formatARS(Math.round(product.price / (product.installments || 6)));
    const isFrozen = product.isFrozen;

    return `
      <div class="product-card" data-product-id="${product.id}" title="${product.title}">
        ${isFrozen ? `
          <div class="product-frozen-overlay">
            <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <strong style="font-size: 0.85rem; color: #fca5a5;">MEDIDA CAUTELAR POLICIAL</strong>
            <p style="font-size: 0.72rem; margin-top: 0.25rem;">Publicación suspendida por orden judicial</p>
          </div>
        ` : ''}

        <div class="product-card-img-wrapper">
          <img src="${product.image}" alt="${product.title}" class="product-card-img" loading="lazy" />
        </div>

        <div class="product-card-body">
          <div class="product-price">${formattedPrice}</div>
          
          <div class="product-installments">
            mismo precio en ${product.installments || 6} cuotas de ${installmentAmount}
          </div>

          ${product.freeShipping ? `
            <div class="product-badge-free-shipping">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Envío gratis
            </div>
          ` : '<div style="height: 20px;"></div>'}

          <h3 class="product-title">${product.title}</h3>

          <div class="product-meta-row">
            <span class="product-condition-tag">${product.condition}</span>
            <span>📍 ${product.city || product.province}</span>
          </div>
        </div>
      </div>
    `;
  },

  _attachEvents(container) {
    // Click en Tarjeta para ir al Detalle
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.getAttribute('data-product-id');
        window.location.hash = `#/product/${id}`;
      });
    });

    // Filtros de Categoría
    container.querySelectorAll('.filter-item-btn[data-category]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = btn.getAttribute('data-category');
        this.setFilter('category', cat);
      });
    });

    // Filtros de Condición
    container.querySelectorAll('.filter-item-btn[data-condition]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cond = btn.getAttribute('data-condition');
        this.setFilter('condition', cond);
      });
    });

    // Filtro Provincia
    const provSelect = container.querySelector('#filter-province-select');
    if (provSelect) {
      provSelect.addEventListener('change', (e) => {
        this.setFilter('province', e.target.value);
      });
    }

    // Filtro Precio
    const btnPrice = container.querySelector('#btn-apply-price');
    if (btnPrice) {
      btnPrice.addEventListener('click', () => {
        const min = container.querySelector('#filter-min-price').value;
        const max = container.querySelector('#filter-max-price').value;
        this.currentFilters.minPrice = min;
        this.currentFilters.maxPrice = max;
        this.render();
      });
    }

    // Filtro Envío Gratis
    const freeCheck = container.querySelector('#filter-free-shipping');
    if (freeCheck) {
      freeCheck.addEventListener('change', (e) => {
        this.setFilter('freeShipping', e.target.checked);
      });
    }

    // Ordenamiento
    const sortSelect = container.querySelector('#catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.setFilter('sortBy', e.target.value);
      });
    }

    // Limpiar Filtros
    const clearBtn = container.querySelector('#btn-clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.resetFilters());
    }

    const emptyResetBtn = container.querySelector('#btn-empty-reset');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', () => this.resetFilters());
    }
  }
};
