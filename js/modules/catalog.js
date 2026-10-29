/**
 * CompraFácil v2 - Catálogo de Anuncios Clasificados
 * js/modules/catalog.js
 */

import { state } from '../state.js';

export const catalog = {
  currentFilters: {
    query: '',
    category: '',
    province: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
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
      sortBy: 'relevancia'
    };
    this.render();
  },

  getFilteredAds() {
    const allAds = state.getProducts(true); // Incluye disponibles y vendidos
    const { query, category, province, condition, minPrice, maxPrice, sortBy } = this.currentFilters;

    let filtered = allAds.filter(ad => {
      // Búsqueda de texto
      if (query) {
        const q = query.toLowerCase().trim();
        const matchesTitle = ad.title && ad.title.toLowerCase().includes(q);
        const matchesBrand = ad.brand && ad.brand.toLowerCase().includes(q);
        const matchesModel = ad.model && ad.model.toLowerCase().includes(q);
        const matchesDesc = ad.description && ad.description.toLowerCase().includes(q);
        const matchesSerial = ad.serialNumber && ad.serialNumber.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesModel && !matchesDesc && !matchesSerial) {
          return false;
        }
      }

      // Categoría
      if (category && ad.category !== category) return false;

      // Provincia
      if (province && ad.province !== province) return false;

      // Condición
      if (condition && ad.condition !== condition) return false;

      // Rango de precio
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      if (!isNaN(min) && ad.price < min) return false;
      if (!isNaN(max) && ad.price > max) return false;

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

    try {
      const ads = this.getFilteredAds();
      const categories = state.getState().categories || [];
      const provinces = state.getState().provinces || [];

      const html = `
        <div class="container">
          <!-- Banner Informativo de Contacto Directo -->
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; box-shadow: var(--shadow-sm);">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span class="badge badge-success">CONTACTO DIRECTO</span>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Sin intermediarios de pago ni cobro de comisiones</span>
              </div>
              <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0;">CompraFácil: Anuncios Clasificados</h2>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.25rem;">
                Conectate directamente por WhatsApp con los anunciantes para convenir precio, forma de pago y punto de entrega.
              </p>
            </div>
            <div>
              <a href="#/seller" class="btn btn-sm btn-primary">
                + Publicar un Anuncio
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
                    <button class="filter-item-btn ${this.currentFilters.condition === 'usado' ? 'active' : ''}" data-condition="usado">
                      Usado
                    </button>
                  </li>
                  <li>
                    <button class="filter-item-btn ${this.currentFilters.condition === 'nuevo' ? 'active' : ''}" data-condition="nuevo">
                      Nuevo
                    </button>
                  </li>
                </ul>
              </div>

              <!-- Filtro por Ubicación -->
              <div class="filter-group">
                <h4 class="filter-group-title">Ubicación (Provincia)</h4>
                <select id="filter-province-select" class="form-select" style="font-size: 0.85rem; padding: 0.4rem;">
                  <option value="">Todas las Provincias</option>
                  ${provinces.map(prov => `
                    <option value="${prov}" ${this.currentFilters.province === prov ? 'selected' : ''}>${prov}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Filtro por Rango de Precio -->
              <div class="filter-group" style="margin-bottom: 0;">
                <h4 class="filter-group-title">Precio (ARS)</h4>
                <div class="price-inputs-row">
                  <input type="number" id="filter-min-price" class="form-input" placeholder="Mínimo" value="${this.currentFilters.minPrice}" style="font-size: 0.82rem; padding: 0.4rem;" />
                  <span>-</span>
                  <input type="number" id="filter-max-price" class="form-input" placeholder="Máximo" value="${this.currentFilters.maxPrice}" style="font-size: 0.82rem; padding: 0.4rem;" />
                </div>
                <button id="btn-apply-price" class="btn btn-sm btn-outline btn-block" style="margin-top: 0.5rem;">Aplicar Rango</button>
              </div>
            </aside>

            <!-- Sección Principal de Resultados -->
            <main>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
                    ${ads.length} anuncios disponibles
                  </span>
                  ${this.currentFilters.query ? `<span style="color: var(--text-muted); font-size: 0.88rem;"> para "<strong>${this.currentFilters.query}</strong>"</span>` : ''}
                </div>

                <!-- Ordenamiento -->
                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem;">
                  <label for="catalog-sort-select" style="color: var(--text-muted);">Ordenar:</label>
                  <select id="catalog-sort-select" class="form-select" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.85rem;">
                    <option value="relevancia" ${this.currentFilters.sortBy === 'relevancia' ? 'selected' : ''}>Más relevantes</option>
                    <option value="menor-precio" ${this.currentFilters.sortBy === 'menor-precio' ? 'selected' : ''}>Menor precio</option>
                    <option value="mayor-precio" ${this.currentFilters.sortBy === 'mayor-precio' ? 'selected' : ''}>Mayor precio</option>
                    <option value="recientes" ${this.currentFilters.sortBy === 'recientes' ? 'selected' : ''}>Más recientes</option>
                  </select>
                </div>
              </div>

              ${ads.length === 0 ? `
                <div style="background: #ffffff; border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid var(--border-color);">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                  <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">No se encontraron anuncios con los filtros aplicados</h3>
                  <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Podés probar con términos más generales o reiniciar los filtros.</p>
                  <button id="btn-empty-reset" class="btn btn-primary">Limpiar todos los filtros</button>
                </div>
              ` : `
                <div class="product-grid">
                  ${ads.map(ad => this._renderAdCard(ad)).join('')}
                </div>
              `}
            </main>
          </div>
        </div>
      `;

      container.innerHTML = html;
      this._attachEvents(container);
    } catch (err) {
      console.error('Error renderizando catálogo:', err);
      container.innerHTML = `
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <h3>Ocurrió un error al cargar el catálogo</h3>
          <p style="color: var(--text-muted); margin: 1rem 0;">${err.message}</p>
          <button onclick="location.reload()" class="btn btn-primary">Recargar página</button>
        </div>
      `;
    }
  },

  _renderAdCard(ad) {
    const formattedPrice = state.formatARS(ad.price);
    const isSold = ad.status === 'vendido';

    return `
      <div class="product-card" data-ad-id="${ad.id}" title="${ad.title}">
        ${isSold ? `
          <div style="position: absolute; top: 10px; right: 10px; background: #64748b; color: #ffffff; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 4px; z-index: 5;">
            VENDIDO
          </div>
        ` : ''}

        <div class="product-card-img-wrapper">
          <img src="${ad.image}" alt="${ad.title}" class="product-card-img" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'225\\' viewBox=\\'0 0 300 225\\'><rect width=\\'300\\' height=\\'225\\' fill=\\'%23f1f5f9\\'/><text x=\\'50%\\' y=\\'50%\\' font-family=\\'sans-serif\\' font-size=\\'14\\' fill=\\'%2394a3b8\\' text-anchor=\\'middle\\'>Sin imagen</text></svg>'" />
        </div>

        <div class="product-card-body">
          <div class="product-price">${formattedPrice}</div>
          
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #059669; font-weight: 700; margin-bottom: 0.4rem;">
            <span>💬</span> Contacto directo por WhatsApp
          </div>

          <h3 class="product-title">${ad.title}</h3>

          <div class="product-meta-row">
            <span class="product-condition-tag">${ad.condition}</span>
            <span>📍 ${ad.city || ad.province}</span>
          </div>
        </div>
      </div>
    `;
  },

  _attachEvents(container) {
    // Click en Tarjeta para ir al Detalle
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-ad-id');
        window.location.hash = `#/product/${id}`;
      });
    });

    // Filtros de Categoría
    container.querySelectorAll('.filter-item-btn[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        this.setFilter('category', cat);
      });
    });

    // Filtros de Condición
    container.querySelectorAll('.filter-item-btn[data-condition]').forEach(btn => {
      btn.addEventListener('click', () => {
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
