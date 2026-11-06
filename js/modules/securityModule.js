/**
 * CompraFácil v2 - Módulo Restringido para Autoridades Acreditadas
 * js/modules/securityModule.js
 *
 * Sistema de Indicios y Alertas Privadas para Revisión Humana.
 * Durante desarrollo opera estrictamente con datos ficticios.
 */

import { state } from '../state.js';
import { auth } from './auth.js';
import { supabaseClient } from '../supabaseClient.js';

export const securityModule = {
  activeTab: 'alerts', // 'alerts' | 'new-record' | 'records-list' | 'architecture'

  // Motor de Detección de Indicios
  calculateIndicios() {
    const ads = state.getProducts(true);
    const records = state.getSecurityRecords();
    const indicios = [];

    records.forEach(record => {
      ads.forEach(ad => {
        const cleanRecSerial = (record.serialNumber || '').replace(/[\s\-_]/g, '').toLowerCase();
        const cleanAdSerial = (ad.serialNumber || '').replace(/[\s\-_]/g, '').toLowerCase();

        let hasExactMatch = Boolean(cleanRecSerial && cleanAdSerial && cleanRecSerial === cleanAdSerial);
        let hasTextSimilarity = false;
        const reasons = [];

        // 1. Coincidencia Exacta de Identificador
        if (hasExactMatch) {
          reasons.push(`Coincidencia exacta de identificador / N° de Serie: "${record.serialNumber}"`);
        } else {
          // 2. Similitud de Texto (Marca + Modelo)
          const recBrand = (record.brand || '').toLowerCase().trim();
          const adBrand = (ad.brand || '').toLowerCase().trim();
          const recModel = (record.model || '').toLowerCase().trim();
          const adModel = (ad.model || '').toLowerCase().trim();

          if (recBrand && adBrand && recBrand === adBrand && recModel && adModel && recModel === adModel) {
            hasTextSimilarity = true;
            reasons.push(`Misma Marca (${ad.brand}) y mismo Modelo (${ad.model})`);

            if (record.category === ad.category) {
              reasons.push(`Misma categoría (${ad.category})`);
            }
          }
        }

        if (hasExactMatch || hasTextSimilarity) {
          const indicioId = `indicio-${record.id}-${ad.id}`;
          indicios.push({
            id: indicioId,
            record,
            ad,
            matchType: hasExactMatch ? 'Coincidencia exacta de identificador' : 'Similitud de características de texto',
            isExact: hasExactMatch,
            reasons,
            // Estado por defecto
            status: 'Pendiente', // 'Pendiente' | 'Revisada' | 'Descartada'
            visualSimilarityStatus: 'Análisis visual: Requiere servicio de visión artificial (pendiente de integración)',
            createdAt: new Date().toISOString()
          });
        }
      });
    });

    return indicios;
  },

  render(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!auth.canAccessSecurity()) {
      container.innerHTML = `
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛡️</div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a;">ACCESO RESTRINGIDO A AUTORIDADES ACREDITADAS</h2>
          <p style="color: var(--text-muted); max-width: 580px; margin: 1rem auto 1.5rem; line-height: 1.6;">
            Este módulo requiere inicio de sesión con cuenta institucional verificada y doble factor de autenticación (2FA). Ocultar menús no sustituye la seguridad del servidor; este módulo permanece estrictamente bloqueado hasta la implementación de verificación institucional en el backend.
          </p>
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; max-width: 540px; margin: 0 auto 1.5rem; text-align: left; font-size: 0.88rem; color: #64748b;">
            🔒 <strong>Estado de Seguridad:</strong> Acceso denegado para cuentas de usuario común. No se admiten elevaciones de permisos desde el cliente.
          </div>
          <a href="#/catalog" class="btn btn-secondary">Volver al Catálogo</a>
        </div>
      `;
      return;
    }

    const currentUser = auth.getCurrentUser();
    const indicios = this.calculateIndicios();
    const records = state.getSecurityRecords();
    const isCloud = supabaseClient.isConfigured();

    const html = `
      <div class="container">
        <!-- Contenedor Táctico Restringido -->
        <div class="security-wrapper">
          <!-- Encabezado del Módulo -->
          <div class="security-header">
            <div class="security-title-group">
              <div class="police-shield-icon">
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <div class="security-main-title">
                  MÓDULO DE REVISIÓN PARA AUTORIDADES ACREDITADAS
                </div>
                <div class="security-sub-title">
                  Operador: <strong>${currentUser.name}</strong> • ${currentUser.institution || 'Organismo Judicial'} • Identificador: ${currentUser.badgeNumber || 'AUT-9921'}
                </div>
              </div>
            </div>

            <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; padding: 0.4rem 0.85rem; border-radius: var(--radius-full); font-size: 0.8rem; color: #f59e0b; font-weight: 700;">
              ENTORNO DE PRUEBAS (DATOS FICTICIOS)
            </div>
          </div>

          <!-- Cuadro de Principio Rector Obligatorio -->
          <div style="background: rgba(15, 23, 42, 0.9); border-left: 4px solid #3b82f6; border-radius: var(--radius-sm); padding: 1rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.88rem; line-height: 1.6; color: #cbd5e1;">
            <strong style="color: #ffffff;">Aviso Legal y Principio de Presunción:</strong><br>
            Toda coincidencia detectada constituye exclusivamente un <strong>indicio para revisión humana</strong>. No prueba la comisión de un delito, no identifica automáticamente al vendedor como infractor ni genera acusaciones públicas, bloqueos cautelares automáticos ni denuncias penales automáticas. Cualquier medida ulterior requiere intervención judicial fundamentada conforme al Código Procesal Penal. El uso con denuncias reales está deshabilitado hasta definir formalmente el convenio institucional y marco legal respectivo.
          </div>

          <!-- Pestañas de Navegación del Módulo -->
          <div class="sec-tabs">
            <button class="sec-tab-btn ${this.activeTab === 'alerts' ? 'active' : ''}" data-tab="alerts">
              🔔 Indicios y Alertas (${indicios.length})
            </button>
            <button class="sec-tab-btn ${this.activeTab === 'new-record' ? 'active' : ''}" data-tab="new-record">
              ➕ Cargar Ficha de Objeto Buscado (Ficticio)
            </button>
            <button class="sec-tab-btn ${this.activeTab === 'records-list' ? 'active' : ''}" data-tab="records-list">
              📁 Fichas de Bienes Registradas (${records.length})
            </button>
            <button class="sec-tab-btn ${this.activeTab === 'architecture' ? 'active' : ''}" data-tab="architecture">
              🔒 Seguridad RLS y Permisos
            </button>
          </div>

          <!-- Contenido de Pestañas -->
          <div>
            ${this.activeTab === 'alerts' ? this._renderAlertsTab(indicios) : ''}
            ${this.activeTab === 'new-record' ? this._renderNewRecordTab() : ''}
            ${this.activeTab === 'records-list' ? this._renderRecordsListTab(records) : ''}
            ${this.activeTab === 'architecture' ? this._renderArchitectureTab(isCloud) : ''}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this._attachEvents(container, indicios);
  },

  _renderAlertsTab(indicios) {
    if (indicios.length === 0) {
      return `
        <div style="background: #1e293b; border-radius: var(--radius-md); padding: 3rem; text-align: center; border: 1px solid #334155;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✅</div>
          <h3 style="color: #ffffff; font-size: 1.15rem; margin-bottom: 0.5rem;">Sin indicios pendientes</h3>
          <p style="color: #94a3b8; font-size: 0.88rem;">No se detectaron coincidencias entre los anuncios vigentes y las fichas de objetos buscados.</p>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${indicios.map(ind => `
          <div class="match-card ${ind.isExact ? 'critical' : 'medium'}">
            
            <div class="match-header">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="match-score-badge ${ind.isExact ? 'score-critical' : 'score-medium'}">
                  ${ind.matchType.toUpperCase()}
                </span>
                <span style="font-size: 0.8rem; color: #94a3b8;">Estado: <strong style="color: #f8fafc;">${ind.status}</strong></span>
              </div>
              <div style="font-size: 0.8rem; color: #94a3b8;">
                Ref. Caso: <strong style="color: #ffffff;">${ind.record.caseReference}</strong>
              </div>
            </div>

            <!-- Comparativa Objetiva de Datos -->
            <div class="comparator-grid">
              <!-- Ficha de Objeto Buscado -->
              <div class="comparator-col">
                <div class="comparator-col-title police">
                  <span>📄</span> Ficha del Bien Buscado (Organismo Judicial)
                </div>
                <div class="comparator-field">
                  <span class="comparator-field-label">Organismo Requiriente:</span>
                  <span class="comparator-field-value">${ind.record.organism}</span>
                </div>
                <div class="comparator-field">
                  <span class="comparator-field-label">Bien Reportado:</span>
                  <span class="comparator-field-value">${ind.record.brand} ${ind.record.model} (${ind.record.category})</span>
                </div>
                <div class="comparator-field">
                  <span class="comparator-field-label">Identificador / N° Serie Buscado:</span>
                  <span class="comparator-field-value highlight">${ind.record.serialNumber || 'No especificado'}</span>
                </div>
                <div class="comparator-field">
                  <span class="comparator-field-label">Descripción registrada:</span>
                  <span class="comparator-field-value" style="font-size: 0.8rem; color: #cbd5e1;">"${ind.record.description}"</span>
                </div>
              </div>

              <!-- Anuncio en CompraFácil -->
              <div class="comparator-col">
                <div class="comparator-col-title marketplace">
                  <span>🛒</span> Anuncio Público en CompraFácil
                </div>
                <div class="comparator-field">
                  <span class="comparator-field-label">Título del Anuncio:</span>
                  <span class="comparator-field-value">${ind.ad.title}</span>
                </div>
                <div class="comparator-field">
                  <span class="comparator-field-label">Precio y Estado:</span>
                  <span class="comparator-field-value" style="color: #38bdf8;">${state.formatARS(ind.ad.price)} (${ind.ad.condition})</span>
                </div>
                <div class="comparator-field">
                  <span class="comparator-field-label">N° de Serie Declarado:</span>
                  <span class="comparator-field-value highlight">${ind.ad.serialNumber || 'No declarado'}</span>
                </div>
                <div class="comparator-field">
                  <span class="comparator-field-label">Contacto WhatsApp del Anunciante:</span>
                  <span class="comparator-field-value" style="color: #25D366; font-size: 0.95rem;">
                    💬 ${ind.ad.whatsapp}
                  </span>
                </div>
              </div>
            </div>

            <!-- Fundamentación y Estado Visual -->
            <div style="background: rgba(15, 23, 42, 0.7); border-radius: var(--radius-sm); padding: 0.6rem 0.85rem; margin-bottom: 1rem; font-size: 0.8rem; color: #94a3b8;">
              <div><strong>Motivos de la coincidencia:</strong> ${ind.reasons.join(' • ')}</div>
              <div style="margin-top: 0.25rem; color: #f59e0b; font-style: italic;">
                📷 ${ind.visualSimilarityStatus}
              </div>
            </div>

            <!-- Acciones de Revisión Humana -->
            <div class="match-actions-row">
              <a href="#/product/${ind.ad.id}" target="_blank" class="btn btn-sm btn-outline" style="color: #60a5fa; border-color: #3b82f6;">
                🔍 Abrir Anuncio Público
              </a>
              <button class="btn btn-sm btn-secondary btn-mark-alert" data-id="${ind.id}" data-status="Revisada" style="color: #0f172a;">
                ✓ Marcar Revisada
              </button>
              <button class="btn btn-sm btn-secondary btn-mark-alert" data-id="${ind.id}" data-status="Descartada" style="color: #64748b;">
                ✕ Descartar Indicio
              </button>
            </div>

          </div>
        `).join('')}
      </div>
    `;
  },

  _renderNewRecordTab() {
    const categories = state.getState().categories || [];

    return `
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: var(--radius-md); padding: 1.75rem; max-width: 820px;">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">
          Carga de Ficha de Objeto Buscado
        </h3>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.25rem;">
          Solo se registran datos esenciales del bien objeto de pesquisa judicial. Evitar datos de víctimas o expedientes completos innecesarios.
        </p>

        <form id="form-new-security-record">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Referencia de Causa / Expediente <span class="required">*</span></label>
              <input type="text" id="rec-case" class="sec-form-input" placeholder="Ej: EXP-2026/8912" required />
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Organismo / Fiscalía Requiriente <span class="required">*</span></label>
              <input type="text" id="rec-organism" class="sec-form-input" placeholder="Ej: Fiscalía de Investigaciones Complejas" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Categoría del Bien <span class="required">*</span></label>
              <select id="rec-category" class="sec-form-select" required>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Marca</label>
              <input type="text" id="rec-brand" class="sec-form-input" placeholder="Ej: Apple, Venzo, DeWalt" />
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Modelo</label>
              <input type="text" id="rec-model" class="sec-form-input" placeholder="Ej: iPhone 14 Pro, Inferno 29" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Color / Señas Distintivas</label>
              <input type="text" id="rec-color" class="sec-form-input" placeholder="Ej: Negro y Naranja, marco rayado" />
            </div>
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">N° de Serie / IMEI / Cuadro (Si existe)</label>
              <input type="text" id="rec-serial" class="sec-form-input" placeholder="Ej: VNZ-2023-88419X" />
              <div class="form-help" style="color: #94a3b8;">Permite vinculación unívoca exacta con anuncios.</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="color: #cbd5e1;">Descripción Concreta del Objeto <span class="required">*</span></label>
            <textarea id="rec-desc" class="sec-form-textarea" placeholder="Breve detalle técnico y marcas características para cotejo..." required></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
            <button type="submit" class="btn btn-primary" style="background: #2563eb;">
              Registrar Ficha y Cotejar con Anuncios
            </button>
          </div>
        </form>
      </div>
    `;
  },

  _renderRecordsListTab(records) {
    return `
      <div class="data-table-wrapper" style="background: #1e293b; border-color: #334155;">
        <table class="data-table" style="color: #f1f5f9;">
          <thead>
            <tr style="background: #0f172a;">
              <th style="color: #94a3b8;">Referencia Causa</th>
              <th style="color: #94a3b8;">Organismo</th>
              <th style="color: #94a3b8;">Bien</th>
              <th style="color: #94a3b8;">Identificador / Serie</th>
              <th style="color: #94a3b8;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(r => `
              <tr style="border-bottom: 1px solid #334155;">
                <td><strong style="color: #38bdf8;">${r.caseReference}</strong></td>
                <td>${r.organism}</td>
                <td>${r.brand || ''} ${r.model || ''} (${r.category})</td>
                <td><code>${r.serialNumber || 'No consta'}</code></td>
                <td><span class="badge badge-warning">${r.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderArchitectureTab(isCloud) {
    return `
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: var(--radius-md); padding: 1.75rem; color: #cbd5e1; line-height: 1.6;">
        <h3 style="color: #ffffff; font-size: 1.2rem; margin-bottom: 0.75rem;">Arquitectura de Seguridad y Permisos RLS</h3>
        <p>
          En una aplicación web que maneja información restringida para autoridades, <strong>ocultar menús del lado del navegador no brinda seguridad</strong>. La plataforma CompraFácil implementa y documenta la siguiente arquitectura de control en base de datos:
        </p>

        <ul style="margin: 1rem 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <li><strong>Autenticación Institucional:</strong> Cuentas individuales mediante Supabase Auth con verificación de correo de dominio oficial y 2FA (doble factor obligatorio). Se descartan contraseñas o códigos compartidos.</li>
          <li><strong>Row Level Security (RLS) en PostgreSQL:</strong> Las tablas <code>fichas_seguridad</code> y <code>coincidencias_alertas</code> tienen políticas activas que rechazan cualquier consulta (SELECT/INSERT/UPDATE) cuyo token JWT no contenga el rol verificado <code>authority</code>.</li>
          <li><strong>Estado Actual:</strong> ${isCloud ? '<span style="color: #10b981; font-weight: 700;">Conectado a backend Supabase en la nube.</span>' : '<span style="color: #f59e0b; font-weight: 700;">Modo Local de Evaluación (localStorage). Esquema SQL con RLS preparado en <code>supabase_schema.sql</code>.</span>'}</li>
        </ul>

        <div style="background: #0f172a; padding: 1rem; border-radius: var(--radius-sm); font-size: 0.85rem; border: 1px solid #334155;">
          Archivo de esquema y políticas listo para ejecutar en Supabase: <code>supabase_schema.sql</code>.<br>
          Variables de entorno seguras: <code>.env.example</code> (sin secretos incluidos).
        </div>
      </div>
    `;
  },

  _attachEvents(container, indicios) {
    container.querySelectorAll('.sec-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Formulario de Nueva Ficha
    const formNew = container.querySelector('#form-new-security-record');
    if (formNew) {
      formNew.addEventListener('submit', (e) => {
        e.preventDefault();
        const caseRef = container.querySelector('#rec-case').value.trim();
        const organism = container.querySelector('#rec-organism').value.trim();
        const category = container.querySelector('#rec-category').value;
        const brand = container.querySelector('#rec-brand').value.trim();
        const model = container.querySelector('#rec-model').value.trim();
        const color = container.querySelector('#rec-color').value.trim();
        const serial = container.querySelector('#rec-serial').value.trim();
        const desc = container.querySelector('#rec-desc').value.trim();

        const newRec = state.addSecurityRecord({
          caseReference: caseRef,
          organism,
          category,
          brand,
          model,
          color,
          serialNumber: serial,
          description: desc
        });

        if (window.app && window.app.showToast) {
          window.app.showToast(`Ficha ${newRec.caseReference} registrada. Cotejando anuncios...`, 'success');
        }

        this.activeTab = 'alerts';
        this.render();
      });
    }

    // Botones de Marcar Alerta
    container.querySelectorAll('.btn-mark-alert').forEach(btn => {
      btn.addEventListener('click', () => {
        const status = btn.getAttribute('data-status');
        if (window.app && window.app.showToast) {
          window.app.showToast(`Indicio marcado como: ${status}`, 'info');
        }
      });
    });
  }
};
