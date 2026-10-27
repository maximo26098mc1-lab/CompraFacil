/**
 * CompraFácil - Módulo de Seguridad e Investigación Policial
 * js/modules/securityModule.js
 */

import { state } from '../state.js';
import { auth } from './auth.js';

export const securityModule = {
  activeTab: 'radar', // 'radar' | 'new-report' | 'reports-list' | 'frozen-items'
  selectedMatch: null,

  // Motor de Matching Algorítmico Policial
  calculateMatches() {
    const products = state.getState().products || [];
    const reports = state.getState().securityReports || [];
    const matches = [];

    reports.forEach(report => {
      products.forEach(product => {
        let score = 0;
        const reasons = [];

        // 1. Coincidencia Exacta de Identificador Unívoco (IMEI / Serie / Cuadro)
        const cleanRepId = (report.identifier || '').replace(/[\s\-_]/g, '').toLowerCase();
        const cleanProdSerial = (product.serialNumber || '').replace(/[\s\-_]/g, '').toLowerCase();
        const cleanProdImei = (product.imei || '').replace(/[\s\-_]/g, '').toLowerCase();
        const cleanProdFrame = (product.frameNumber || '').replace(/[\s\-_]/g, '').toLowerCase();

        if (cleanRepId && (cleanRepId === cleanProdSerial || cleanRepId === cleanProdImei || cleanRepId === cleanProdFrame)) {
          score = 100;
          reasons.push(`COINCIDENCIA EXACTA UNÍVOCA de ${report.identifierType || 'Identificador'}: "${report.identifier}"`);
        } else {
          // 2. Coincidencia por Marca y Modelo
          const repBrand = (report.brand || '').toLowerCase().trim();
          const prodBrand = (product.brand || '').toLowerCase().trim();
          const repModel = (report.model || '').toLowerCase().trim();
          const prodModel = (product.model || '').toLowerCase().trim();

          let brandMatch = repBrand && prodBrand && (repBrand.includes(prodBrand) || prodBrand.includes(repBrand));
          let modelMatch = repModel && prodModel && (repModel.includes(prodModel) || prodModel.includes(repModel));

          if (brandMatch && modelMatch) {
            score += 55;
            reasons.push(`Misma Marca (${product.brand}) y Modelo (${product.model})`);

            // Proximidad Geográfica
            if (report.province && product.province && report.province === product.province) {
              score += 20;
              reasons.push(`Misma jurisdicción provincial (${product.province})`);
            }

            // Anomalía de Precio Sospechosamente Bajo
            if (product.condition === 'usado' && product.price < 350000) {
              score += 15;
              reasons.push(`Precio anómalo por debajo de la media (${state.formatARS(product.price)})`);
            }

            // Análisis Temporal: Publicado después de la fecha de sustracción
            const incidentTime = new Date(report.incidentDate).getTime();
            const productTime = new Date(product.createdAt).getTime();
            if (productTime >= incidentTime) {
              score += 10;
              reasons.push(`Publicado con posterioridad a la denuncia (${new Date(report.incidentDate).toLocaleDateString('es-AR')})`);
            }
          }

          // 3. Coincidencia Heurística en Señas Particulares
          if (report.notes && product.description) {
            const keywords = ['sin cargador', 'sin bateria', 'valija', 'raspon', 'raspón', 'fisura', 'velo', 'fluo', 'naranja', 'arrebato'];
            keywords.forEach(kw => {
              if (report.notes.toLowerCase().includes(kw) && product.description.toLowerCase().includes(kw)) {
                score += 10;
                reasons.push(`Coincidencia en señas particulares: "${kw}"`);
              }
            });
          }
        }

        // Si supera el umbral de interés investigativo (>= 60)
        if (score >= 60) {
          let level = 'medium';
          let levelLabel = 'SOSPECHA MEDIA';
          if (score >= 95) {
            level = 'critical';
            levelLabel = 'ALERTA ROJA (COINCIDENCIA UNÍVOCA)';
          } else if (score >= 80) {
            level = 'high';
            levelLabel = 'ALTO RIESGO';
          }

          matches.push({
            report,
            product,
            score: Math.min(score, 100),
            level,
            levelLabel,
            reasons
          });
        }
      });
    });

    // Ordenar de mayor a menor gravedad
    matches.sort((a, b) => b.score - a.score);
    return matches;
  },

  render(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!auth.canAccessSecurity()) {
      container.innerHTML = `
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛡️</div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a;">ACCESO RESTRINGIDO - ÁREA DE INVESTIGACIONES POLICIALES</h2>
          <p style="color: var(--text-muted); max-width: 540px; margin: 1rem auto 1.5rem;">
            Este módulo es de uso reservado para las Fuerzas de Seguridad y el Ministerio Público Fiscal para el rastreo y secuestro de bienes sustraídos.
          </p>
          <button id="btn-switch-police" class="btn btn-primary">
            Cambiar a Rol Oficial de Policía / Investigador
          </button>
        </div>
      `;
      const btn = container.querySelector('#btn-switch-police');
      if (btn) {
        btn.addEventListener('click', () => {
          auth.switchRole('police');
          this.render();
        });
      }
      return;
    }

    const matches = this.calculateMatches();
    const reports = state.getSecurityReports();
    const products = state.getState().products || [];
    const frozenProducts = products.filter(p => p.isFrozen);
    const currentUser = auth.getCurrentUser();

    const html = `
      <div class="container">
        <!-- Wrapper Oscuro Táctico Policial -->
        <div class="security-wrapper">
          <!-- Encabezado del Mando Policial -->
          <div class="security-header">
            <div class="security-title-group">
              <div class="police-shield-icon">
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <div class="security-main-title">
                  SISTEMA POLICIAL DE INVESTIGACIÓN Y SECUESTRO DE BIENES SUSTRAÍDOS
                </div>
                <div class="security-sub-title">
                  Dirección de Investigaciones Judiciales • Efectivo: <strong>${currentUser.name}</strong> (${currentUser.badgeNumber || 'DDI-POL-9921'})
                </div>
              </div>
            </div>

            <!-- Radar Blip -->
            <div class="radar-status">
              <div class="radar-blip"></div>
              <div class="radar-text">Radar de Coincidencias Activo (${matches.length} Alertas)</div>
            </div>
          </div>

          <!-- Pestañas de Navegación -->
          <div class="sec-tabs">
            <button class="sec-tab-btn ${this.activeTab === 'radar' ? 'active' : ''}" data-tab="radar">
              📡 Radar de Coincidencias (${matches.length})
            </button>
            <button class="sec-tab-btn ${this.activeTab === 'new-report' ? 'active' : ''}" data-tab="new-report">
              ➕ Cargar Denuncia Judicial
            </button>
            <button class="sec-tab-btn ${this.activeTab === 'reports-list' ? 'active' : ''}" data-tab="reports-list">
              📁 Base de Denuncias (${reports.length})
            </button>
            <button class="sec-tab-btn ${this.activeTab === 'frozen-items' ? 'active' : ''}" data-tab="frozen-items">
              ⚖️ Medidas Cautelares Activas (${frozenProducts.length})
            </button>
          </div>

          <!-- Contenido según pestaña -->
          <div>
            ${this.activeTab === 'radar' ? this._renderRadarTab(matches) : ''}
            ${this.activeTab === 'new-report' ? this._renderNewReportTab() : ''}
            ${this.activeTab === 'reports-list' ? this._renderReportsListTab(reports) : ''}
            ${this.activeTab === 'frozen-items' ? this._renderFrozenItemsTab(frozenProducts) : ''}
          </div>
        </div>
      </div>

      <!-- Contenedor para Acta Judicial Imprimible Oculta -->
      <div id="judicial-acta-container"></div>
    `;

    container.innerHTML = html;
    this._attachEvents(container, matches);
  },

  _renderRadarTab(matches) {
    if (matches.length === 0) {
      return `
        <div style="background: #1e293b; border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid #334155;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🛡️</div>
          <h3 style="color: #ffffff; font-size: 1.2rem; margin-bottom: 0.5rem;">No se detectan alertas activas en este momento</h3>
          <p style="color: #94a3b8; font-size: 0.9rem;">El motor de coincidencia no ha encontrado publicaciones compatibles con denuncias judiciales registradas.</p>
        </div>
      `;
    }

    return `
      <div>
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.85rem; color: #cbd5e1; display: flex; align-items: center; justify-content: space-between;">
          <span>🔍 El motor algorítmico compara números de serie, IMEI, cuadros, anomalías de precio y señas particulares.</span>
          <span style="font-weight: 700; color: #ef4444;">${matches.filter(m => m.score === 100).length} Coincidencias Críticas Identificadas</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${matches.map(match => this._renderMatchCard(match)).join('')}
        </div>
      </div>
    `;
  },

  _renderMatchCard(match) {
    const { report, product, score, level, levelLabel, reasons } = match;
    const isFrozen = product.isFrozen;

    let scoreClass = 'score-medium';
    if (level === 'critical') scoreClass = 'score-critical';
    else if (level === 'high') scoreClass = 'score-high';

    return `
      <div class="match-card ${level}">
        <div class="match-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="match-score-badge ${scoreClass}">
              ${score}% MATCH - ${levelLabel}
            </span>
            ${isFrozen ? '<span class="badge badge-danger">⚖️ MEDIDA CAUTELAR TRABADA</span>' : ''}
          </div>
          <div style="font-size: 0.8rem; color: #94a3b8;">
            Causa N°: <strong style="color: #ffffff;">${report.caseNumber}</strong>
          </div>
        </div>

        <!-- Vista Comparativa Lado a Lado -->
        <div class="comparator-grid">
          <!-- Columna Denuncia Judicial -->
          <div class="comparator-col">
            <div class="comparator-col-title police">
              <span>⚖️</span> Ficha de Denuncia Judicial (Objeto Sustraído)
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Fiscalía / Juzgado / Seccional:</span>
              <span class="comparator-field-value">${report.court} (${report.policeStation})</span>
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Fecha del Ilícito & Damnificado:</span>
              <span class="comparator-field-value">${new Date(report.incidentDate).toLocaleDateString('es-AR')} • ${report.victimName}</span>
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Bien Denunciado:</span>
              <span class="comparator-field-value">${report.brand} ${report.model} (${report.itemType})</span>
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">${report.identifierType || 'Identificador'}:</span>
              <span class="comparator-field-value highlight">${report.identifier}</span>
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Señas Particulares Denunciadas:</span>
              <span class="comparator-field-value" style="font-size: 0.8rem; color: #cbd5e1;">"${report.notes}"</span>
            </div>
          </div>

          <!-- Columna Publicación del Marketplace -->
          <div class="comparator-col">
            <div class="comparator-col-title marketplace">
              <span>🛒</span> Publicación Activa en CompraFácil
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Título Publicado:</span>
              <span class="comparator-field-value">${product.title}</span>
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Vendedor y Ubicación:</span>
              <span class="comparator-field-value">${product.sellerName} • 📍 ${product.city}, ${product.province}</span>
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Precio Publicado:</span>
              <span class="comparator-field-value" style="color: #38bdf8;">${state.formatARS(product.price)} (${product.condition})</span>
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Identificador Registrado en Publicación:</span>
              <span class="comparator-field-value highlight">${product.serialNumber || product.imei || product.frameNumber || 'No declarado'}</span>
            </div>
            <div class="comparator-field">
              <span class="comparator-field-label">Descripción del Vendedor:</span>
              <span class="comparator-field-value" style="font-size: 0.8rem; color: #cbd5e1;">"${(product.description || '').slice(0, 110)}..."</span>
            </div>
          </div>
        </div>

        <!-- Razones del Algoritmo -->
        <div style="background: rgba(15, 23, 42, 0.7); border-radius: var(--radius-sm); padding: 0.6rem 0.85rem; margin-bottom: 1rem; font-size: 0.8rem; color: #94a3b8;">
          <strong style="color: #e2e8f0;">Fundamentación del Motor de Vinculación:</strong>
          <ul style="margin-left: 1.25rem; margin-top: 0.25rem;">
            ${reasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <!-- Acciones Policiales y Judiciales -->
        <div class="match-actions-row">
          <button class="btn btn-sm btn-secondary btn-dossier" data-prod-id="${product.id}" data-seller-id="${product.sellerId || ''}" style="color: #0f172a;">
            🔍 Dossier Forense del Vendedor
          </button>
          
          <button class="btn btn-sm btn-outline btn-print-acta" data-rep-id="${report.id}" data-prod-id="${product.id}" style="color: #60a5fa; border-color: #3b82f6;">
            📄 Generar Oficio / Acta Judicial
          </button>

          ${isFrozen ? `
            <button class="btn btn-sm btn-secondary btn-unfreeze-order" data-prod-id="${product.id}" style="background: #334155; color: #ffffff;">
              Levantar Bloqueo
            </button>
          ` : `
            <button class="btn btn-sm btn-danger btn-freeze-order" data-prod-id="${product.id}" data-rep-id="${report.id}">
              ⚖️ Trabar Bloqueo Cautelar Inmediato
            </button>
          `}
        </div>
      </div>
    `;
  },

  _renderNewReportTab() {
    const provinces = state.getState().provinces || [];
    const categories = state.getState().categories || [];

    return `
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: var(--radius-md); padding: 1.75rem; max-width: 850px;">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">
          Ingreso de Denuncia Judicial de Objeto Sustraído
        </h3>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem;">
          Al registrar un expediente, el radar correlaciona de inmediato el catálogo completo de publicaciones y genera alertas ante cualquier coincidencia.
        </p>

        <form id="form-new-security-report">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">N° de Causa Penal / IPR / Expediente <span class="required">*</span></label>
              <input type="text" id="rep-case" class="sec-form-input" placeholder="Ej: IPP-14-02-008922-26/00" required />
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Fiscalía / Juzgado Interviniente <span class="required">*</span></label>
              <input type="text" id="rep-court" class="sec-form-input" placeholder="Ej: UFI N° 4 San Isidro" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Comisaría o Seccional Receptora</label>
              <input type="text" id="rep-station" class="sec-form-input" placeholder="Ej: Comisaría Vecinal 14C" />
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Fecha del Ilícito <span class="required">*</span></label>
              <input type="date" id="rep-date" class="sec-form-input" value="2026-10-20" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Nombre del Damnificado / Denunciante <span class="required">*</span></label>
              <input type="text" id="rep-victim" class="sec-form-input" placeholder="Ej: Carlos Rodriguez" required />
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Teléfono / Contacto</label>
              <input type="text" id="rep-victim-phone" class="sec-form-input" placeholder="11-4455-6677" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Rubro o Tipo de Bien <span class="required">*</span></label>
              <select id="rep-category" class="sec-form-select" required>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Marca <span class="required">*</span></label>
              <input type="text" id="rep-brand" class="sec-form-input" placeholder="Ej: Apple, Venzo, DeWalt, Trek" required />
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Modelo <span class="required">*</span></label>
              <input type="text" id="rep-model" class="sec-form-input" placeholder="Ej: iPhone 14 Pro, Inferno 29" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Tipo de Identificador <span class="required">*</span></label>
              <select id="rep-id-type" class="sec-form-select">
                <option value="N° de Serie">N° de Serie</option>
                <option value="IMEI">Código IMEI (Celulares)</option>
                <option value="N° de Cuadro">N° de Cuadro (Bicicletas)</option>
                <option value="Chasis / Motor">Chasis / Motor</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Identificador Unívoco <span class="required">*</span></label>
              <input type="text" id="rep-id-val" class="sec-form-input" placeholder="Ej: F2LXT909MD6R o VNZ-2023-88419X" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Provincia del Hecho <span class="required">*</span></label>
              <select id="rep-province" class="sec-form-select" required>
                ${provinces.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Localidad / Barrio</label>
              <input type="text" id="rep-city" class="sec-form-input" placeholder="Ej: Vicente López, Palermo" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="color: #cbd5e1;">Señas Particulares y Modus Operandi</label>
            <textarea id="rep-notes" class="sec-form-textarea" placeholder="Describa marcas físicas, calcomanías, faltantes (ej: sin cargador, raspón en marco) o detalles del hecho..."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
            <button type="submit" class="btn btn-primary btn-lg" style="background: #2563eb;">
              🛡️ Registrar Denuncia y Correr Radar
            </button>
          </div>
        </form>
      </div>
    `;
  },

  _renderReportsListTab(reports) {
    return `
      <div class="data-table-wrapper" style="background: #1e293b; border-color: #334155;">
        <table class="data-table" style="color: #f1f5f9;">
          <thead>
            <tr style="background: #0f172a;">
              <th style="color: #94a3b8;">Causa Judicial</th>
              <th style="color: #94a3b8;">Fiscalía / Radicación</th>
              <th style="color: #94a3b8;">Bien Sustraído</th>
              <th style="color: #94a3b8;">Identificador Registrado</th>
              <th style="color: #94a3b8;">Damnificado</th>
              <th style="color: #94a3b8;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${reports.map(r => `
              <tr style="border-bottom: 1px solid #334155;">
                <td><strong style="color: #38bdf8;">${r.caseNumber}</strong></td>
                <td>${r.court}</td>
                <td>${r.brand} ${r.model}</td>
                <td><code style="background: #0f172a; padding: 0.2rem 0.4rem; color: #f87171;">${r.identifier}</code></td>
                <td>${r.victimName}</td>
                <td><span class="badge badge-warning">${r.status || 'Búsqueda Activa'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderFrozenItemsTab(frozenProducts) {
    if (frozenProducts.length === 0) {
      return `
        <div style="background: #1e293b; border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid #334155;">
          <p style="color: #94a3b8;">No hay publicaciones con medidas cautelares de bloqueo activas en este momento.</p>
        </div>
      `;
    }

    return `
      <div class="data-table-wrapper" style="background: #1e293b; border-color: #334155;">
        <table class="data-table" style="color: #f1f5f9;">
          <thead>
            <tr style="background: #0f172a;">
              <th style="color: #94a3b8;">Publicación Bloqueada</th>
              <th style="color: #94a3b8;">Identificador</th>
              <th style="color: #94a3b8;">Motivo Cautelar</th>
              <th style="color: #94a3b8;">Ordenado por</th>
              <th style="color: #94a3b8;">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${frozenProducts.map(p => `
              <tr style="border-bottom: 1px solid #334155;">
                <td>
                  <div style="font-weight: 700; color: #f87171;">${p.title}</div>
                  <div style="font-size: 0.78rem; color: #94a3b8;">Vendedor: ${p.sellerName} • ${state.formatARS(p.price)}</div>
                </td>
                <td><code>${p.serialNumber || p.imei || p.frameNumber || 'N/A'}</code></td>
                <td style="font-size: 0.85rem; color: #fca5a5;">${p.frozenReason || 'Medida Cautelar Judicial'}</td>
                <td style="font-size: 0.85rem;">${p.frozenBy || 'Fuerza Policial'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary btn-unfreeze-order" data-prod-id="${p.id}" style="color: #0f172a;">
                    Levantar Cautelar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _attachEvents(container, matches) {
    // Pestañas
    container.querySelectorAll('.sec-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Formulario de Nueva Denuncia
    const formNewReport = container.querySelector('#form-new-security-report');
    if (formNewReport) {
      formNewReport.addEventListener('submit', (e) => {
        e.preventDefault();
        const caseNumber = container.querySelector('#rep-case').value.trim();
        const court = container.querySelector('#rep-court').value.trim();
        const station = container.querySelector('#rep-station').value.trim();
        const incidentDate = container.querySelector('#rep-date').value;
        const victimName = container.querySelector('#rep-victim').value.trim();
        const victimPhone = container.querySelector('#rep-victim-phone').value.trim();
        const category = container.querySelector('#rep-category').value;
        const brand = container.querySelector('#rep-brand').value.trim();
        const model = container.querySelector('#rep-model').value.trim();
        const identifierType = container.querySelector('#rep-id-type').value;
        const identifier = container.querySelector('#rep-id-val').value.trim();
        const province = container.querySelector('#rep-province').value;
        const city = container.querySelector('#rep-city').value.trim();
        const notes = container.querySelector('#rep-notes').value.trim();

        const report = state.addSecurityReport({
          caseNumber,
          court,
          policeStation: station,
          incidentDate,
          victimName,
          victimContact: victimPhone,
          itemType: category,
          brand,
          model,
          identifierType,
          identifier,
          province,
          city,
          notes
        });

        if (window.app && window.app.showToast) {
          window.app.showToast(`Denuncia ${report.caseNumber} registrada. Radar actualizado.`, 'success');
        }

        this.activeTab = 'radar';
        this.render();
      });
    }

    // Bloqueo Cautelar
    container.querySelectorAll('.btn-freeze-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-prod-id');
        const repId = btn.getAttribute('data-rep-id');
        const reason = prompt('Ingrese fundamento judicial para la traba de la medida cautelar:', 'Coincidencia pericial fehaciente con bien sustraído según orden judicial.');
        if (reason) {
          state.freezeProduct(prodId, reason, repId);
          if (window.app && window.app.showToast) {
            window.app.showToast('Medida cautelar ejecutada. Publicación suspendida de inmediato.', 'error');
          }
          this.render();
        }
      });
    });

    // Levantar Bloqueo
    container.querySelectorAll('.btn-unfreeze-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-prod-id');
        if (confirm('¿Confirma el levantamiento judicial de la medida cautelar?')) {
          state.unfreezeProduct(prodId);
          if (window.app && window.app.showToast) {
            window.app.showToast('Medida cautelar levantada.', 'info');
          }
          this.render();
        }
      });
    });

    // Ver Dossier Forense del Vendedor
    container.querySelectorAll('.btn-dossier').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-prod-id');
        const prod = state.getProductById(prodId);
        if (prod && window.app && window.app.openModal) {
          const content = `
            <div style="font-size: 0.9rem;">
              <div style="background: #0f172a; color: #ffffff; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                <h4 style="color: #60a5fa; margin-bottom: 0.5rem;">REGISTRO FORENSE DE USUARIO VENDEDOR</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.85rem;">
                  <div><strong>Nombre/Razón Social:</strong> ${prod.sellerName}</div>
                  <div><strong>ID Usuario:</strong> ${prod.sellerId || 'u-vendedor-simulado'}</div>
                  <div><strong>Correo Registrado:</strong> vendedor@ejemplo.com</div>
                  <div><strong>Teléfono Validado:</strong> +54 11 5566-7788</div>
                  <div><strong>Dirección IP de Publicación:</strong> 181.44.120.89 (Telecom Argentina)</div>
                  <div><strong>CBU / CVU Asociado:</strong> 0000003100098234190821</div>
                  <div><strong>Geolocalización:</strong> ${prod.city}, ${prod.province}</div>
                  <div><strong>Fecha de Registro:</strong> 14/03/2025</div>
                </div>
              </div>
              <p style="color: var(--text-muted); font-size: 0.82rem;">
                Esta información confidencial se proporciona exclusivamente bajo secreto sumarial para requerimientos de allanamiento o comparecencia judicial conforme al Código Procesal Penal.
              </p>
            </div>
          `;
          window.app.openModal('Dossier Pericial del Vendedor - Requerimiento Judicial', content);
        }
      });
    });

    // Generar Acta Judicial Imprimible
    container.querySelectorAll('.btn-print-acta').forEach(btn => {
      btn.addEventListener('click', () => {
        const repId = btn.getAttribute('data-rep-id');
        const prodId = btn.getAttribute('data-prod-id');
        const rep = state.getSecurityReports().find(r => r.id === repId);
        const prod = state.getProductById(prodId);
        const currentUser = auth.getCurrentUser();

        if (rep && prod) {
          const actaHTML = `
            <div class="printable-acta">
              <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <h2 style="margin: 0; font-size: 16pt; font-weight: bold;">MINISTERIO DE SEGURIDAD - REPÚBLICA ARGENTINA</h2>
                <h3 style="margin: 0.25rem 0; font-size: 13pt;">DIRECCIÓN NACIONAL DE INVESTIGACIONES JUDICIALES</h3>
                <p style="margin: 0; font-size: 10pt; font-style: italic;">ACTA DE VINCULACIÓN PERICIAL Y REQUERIMIENTO CAUTELAR DE SECUESTRO</p>
              </div>

              <p style="text-align: right; margin-bottom: 1.5rem;">
                <strong>Buenos Aires, ${new Date().toLocaleDateString('es-AR')}</strong><br>
                Expediente N°: <strong>${rep.caseNumber}</strong><br>
                Fiscalía / Juzgado: <strong>${rep.court}</strong>
              </p>

              <p>
                En la fecha, el suscrito <strong>${currentUser.name}</strong>, de la División Investigaciones Complejas y Ciberdelito, deja formal constancia que mediante el Sistema Automatizado de Trazabilidad y Detección Temprana de Bienes Sustraídos se ha constatado la <strong>CORRELACIÓN POSITIVA</strong> entre el bien denunciado como sustraído en autos y la publicación activa en la plataforma comercial CompraFácil.
              </p>

              <h4 style="text-decoration: underline; margin-top: 1.25rem;">1. DATOS DEL BIEN CON PEDIDO DE SECUESTRO:</h4>
              <ul style="margin-left: 2rem;">
                <li><strong>Damnificado:</strong> ${rep.victimName}</li>
                <li><strong>Fecha de Denuncia:</strong> ${new Date(rep.incidentDate).toLocaleDateString('es-AR')}</li>
                <li><strong>Bien Sustraído:</strong> ${rep.brand} ${rep.model} (${rep.itemType})</li>
                <li><strong>Identificador Unívoco (${rep.identifierType}):</strong> ${rep.identifier}</li>
                <li><strong>Señas Particulares:</strong> ${rep.notes}</li>
              </ul>

              <h4 style="text-decoration: underline; margin-top: 1.25rem;">2. PUBLICACIÓN VINCULADA EN COMPRAFÁCIL:</h4>
              <ul style="margin-left: 2rem;">
                <li><strong>Título Publicación:</strong> ${prod.title} (ID: ${prod.id})</li>
                <li><strong>Identificador Declarado:</strong> ${prod.serialNumber || prod.imei || prod.frameNumber || 'N/A'}</li>
                <li><strong>Precio Ofrecido:</strong> ${state.formatARS(prod.price)}</li>
                <li><strong>Usuario Vendedor:</strong> ${prod.sellerName} (Ubicación: ${prod.city}, ${prod.province})</li>
              </ul>

              <h4 style="text-decoration: underline; margin-top: 1.25rem;">3. DICTAMEN Y MEDIDA CAUTELAR:</h4>
              <p>
                Habiéndose verificado la correspondencia fehaciente, se ha procedido a trabar la <strong>MEDIDA CAUTELAR DE CONGELAMIENTO PREVENTIVO</strong> de la publicación a fin de salvaguardar el cuerpo del delito y prevenir la defraudación a terceros de buena fe, elevándose las presentes actuaciones a la fiscalía requirente a los efectos de expedir la pertinente orden de secuestro y allanamiento.
              </p>

              <div style="margin-top: 4rem; display: flex; justify-content: space-between;">
                <div style="text-align: center; width: 220px; border-top: 1px solid #000; padding-top: 0.5rem;">
                  Firma y Sello Oficial Instructor<br>
                  <strong>${currentUser.name}</strong>
                </div>
                <div style="text-align: center; width: 220px; border-top: 1px solid #000; padding-top: 0.5rem;">
                  Recibido Fiscalía Interviniente
                </div>
              </div>
            </div>
          `;

          const containerActa = document.getElementById('judicial-acta-container');
          if (containerActa) {
            containerActa.innerHTML = actaHTML;
            window.print();
          }
        }
      });
    });
  }
};
