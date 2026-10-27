/**
 * CompraFácil - Vista Detallada de Producto y Preguntas & Respuestas
 * js/modules/productDetail.js
 */

import { state } from '../state.js';
import { auth } from './auth.js';

export const productDetail = {
  render(productId, containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const product = state.getProductById(productId);
    if (!product) {
      container.innerHTML = `
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <h2>Publicación no encontrada</h2>
          <p style="color: var(--text-muted); margin: 1rem 0;">La publicación solicitada no existe o fue dada de baja.</p>
          <a href="#/catalog" class="btn btn-primary">Volver al Catálogo</a>
        </div>
      `;
      return;
    }

    const isFrozen = product.isFrozen;
    const isPolice = auth.canAccessSecurity();
    const formattedPrice = state.formatARS(product.price);
    const installments = product.installments || 6;
    const installmentPrice = state.formatARS(Math.round(product.price / installments));
    const questions = product.questions || [];
    const currentUser = auth.getCurrentUser();

    const html = `
      <div class="container">
        <!-- Breadcrumbs -->
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <a href="#/catalog">Catálogo</a>
          <span>›</span>
          <span>${product.category}</span>
          <span>›</span>
          <span style="color: var(--text-main); font-weight: 600;">${product.brand || ''} ${product.model || ''}</span>
        </div>

        ${isFrozen ? `
          <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 1rem;">
            <div style="background: #ef4444; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.2rem;">
              ⚖️
            </div>
            <div>
              <h3 style="color: #991b1b; font-size: 1.1rem; font-weight: 800; margin: 0 0 0.35rem;">MEDIDA CAUTELAR JUDICIAL - PUBLICACIÓN CONGELADA</h3>
              <p style="color: #7f1d1d; font-size: 0.9rem; margin: 0;">
                Esta publicación ha sido suspendida preventivamente por las Fuerzas de Seguridad por presunta coincidencia con un objeto denunciado como sustraído. La venta y despacho están estrictamente inhabilitados.
              </p>
              ${product.frozenReason ? `<p style="font-size: 0.82rem; color: #991b1b; margin-top: 0.4rem;"><strong>Motivo:</strong> ${product.frozenReason}</p>` : ''}
            </div>
          </div>
        ` : ''}

        <div class="product-detail-layout">
          <!-- Columna Izquierda: Galería, Descripción y Q&A -->
          <div>
            <div class="detail-main-card">
              <div class="detail-gallery-main">
                <img src="${product.image}" alt="${product.title}" class="detail-gallery-img" />
              </div>

              <!-- Ficha Técnica y Trazabilidad -->
              <div style="margin-top: 1.5rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.75rem;">Características Principales</h3>
                
                <table class="data-table" style="font-size: 0.88rem;">
                  <tbody>
                    <tr>
                      <td style="width: 35%; font-weight: 600; color: var(--text-muted);">Condición</td>
                      <td><span class="product-condition-tag">${product.condition}</span></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: var(--text-muted);">Marca</td>
                      <td><strong>${product.brand || 'No especificada'}</strong></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: var(--text-muted);">Modelo</td>
                      <td><strong>${product.model || 'No especificado'}</strong></td>
                    </tr>
                    ${product.serialNumber ? `
                      <tr style="background: #f8fafc;">
                        <td style="font-weight: 600; color: var(--text-muted);">
                          Identificador / N° Serie
                        </td>
                        <td>
                          <code style="background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; color: #0f172a;">
                            ${product.serialNumber}
                          </code>
                          <span class="badge badge-success" style="margin-left: 0.5rem; font-size: 0.7rem;">
                            ✓ Trazabilidad Registrada
                          </span>
                        </td>
                      </tr>
                    ` : ''}
                    ${product.imei ? `
                      <tr style="background: #f8fafc;">
                        <td style="font-weight: 600; color: var(--text-muted);">Código IMEI</td>
                        <td>
                          <code style="background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700;">
                            ${product.imei}
                          </code>
                        </td>
                      </tr>
                    ` : ''}
                    <tr>
                      <td style="font-weight: 600; color: var(--text-muted);">Ubicación del Producto</td>
                      <td>📍 ${product.city}, ${product.province}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Descripción -->
              <div style="margin-top: 2rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.75rem;">Descripción de la Publicación</h3>
                <div style="white-space: pre-line; line-height: 1.6; color: #374151; font-size: 0.95rem; background: #fafafa; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                  ${product.description || 'Sin descripción adicional proporcionada por el vendedor.'}
                </div>
              </div>

              <!-- Preguntas y Respuestas (Q&A) -->
              <div class="qa-section">
                <h3 style="font-size: 1.15rem; font-weight: 700;">Preguntas y Respuestas</h3>
                
                <form id="form-ask-question" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                  <input type="text" id="input-new-question" class="form-input" placeholder="Escribile una pregunta al vendedor..." required />
                  <button type="submit" class="btn btn-primary" style="white-space: nowrap;">Preguntar</button>
                </form>

                <div class="qa-list">
                  ${questions.length === 0 ? `
                    <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.5rem;">Nadie ha hecho preguntas todavía. ¡Sé el primero en consultar!</p>
                  ` : questions.map(q => `
                    <div class="qa-item">
                      <div class="qa-question">
                        <span>💬</span>
                        <span>${q.text}</span>
                      </div>
                      ${q.answer ? `
                        <div class="qa-answer">
                          <strong>Respuesta del Vendedor:</strong> ${q.answer}
                        </div>
                      ` : `
                        <div style="margin-left: 1.5rem; margin-top: 0.5rem;">
                          ${currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin') ? `
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
                              <input type="text" class="form-input answer-input" data-qid="${q.id}" placeholder="Escribir respuesta oficial..." style="padding: 0.35rem 0.6rem; font-size: 0.82rem;" />
                              <button class="btn btn-sm btn-outline btn-submit-answer" data-qid="${q.id}">Responder</button>
                            </div>
                          ` : `
                            <span style="font-size: 0.8rem; color: var(--text-light); font-style: italic;">Esperando respuesta del vendedor...</span>
                          `}
                        </div>
                      `}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Tarjeta de Compra, Precios y Envío -->
          <div>
            <div class="detail-buy-box">
              <span class="product-condition-tag">${product.condition} | +50 vendidos</span>
              <h1 style="font-size: 1.35rem; font-weight: 700; margin: 0.5rem 0 1rem; line-height: 1.3;">${product.title}</h1>

              <div style="font-size: 2rem; font-weight: 800; color: var(--text-main); line-height: 1.1;">
                ${formattedPrice}
              </div>

              <div style="font-size: 0.92rem; color: #059669; font-weight: 600; margin-top: 0.4rem; margin-bottom: 1.25rem;">
                en ${installments} cuotas sin interés de ${installmentPrice}
              </div>

              <!-- Calculador de Envíos Argentinos -->
              <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 600; color: #065f46; margin-bottom: 0.5rem;">
                  <span>🚚 ${product.freeShipping ? 'Envío Gratis a todo el país' : 'Calculá tu costo de envío'}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="text" id="input-shipping-cp" class="form-input" placeholder="Código Postal (ej: 1425)" style="font-size: 0.82rem; padding: 0.4rem;" />
                  <button id="btn-calc-shipping" class="btn btn-sm btn-secondary">Calcular</button>
                </div>
                <div id="shipping-calc-result" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
                  Llega a tu domicilio entre 24 y 48 hs hábiles por Correo Argentino / Andreani.
                </div>
              </div>

              <!-- Stock -->
              <div style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 1.25rem;">
                Stock disponible: <strong>${product.stock} unidades</strong>
              </div>

              <!-- Acciones de Compra -->
              ${isFrozen ? `
                <button class="btn btn-secondary btn-block" disabled style="margin-bottom: 0.75rem;">
                  🚫 Venta Bloqueada por Cautelar Judicial
                </button>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  <button id="btn-buy-now" class="btn btn-primary btn-block btn-lg">
                    Comprar Ahora
                  </button>
                  <button id="btn-add-cart" class="btn btn-outline btn-block">
                    Agregar al Carrito 🛒
                  </button>
                </div>
              `}

              <!-- Datos del Vendedor -->
              <div style="margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); font-size: 0.85rem;">
                <div style="color: var(--text-muted);">Información del vendedor</div>
                <div style="font-weight: 700; font-size: 0.95rem; margin-top: 0.2rem;">${product.sellerName}</div>
                <div style="color: #059669; font-weight: 600; margin-top: 0.25rem;">⭐ Vendedor Destacado</div>
                <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.2rem;">Despacha sus productos a tiempo</div>
              </div>

              <!-- Acciones Policiales Rápidas si es Policía/Admin -->
              ${isPolice ? `
                <div style="margin-top: 1.5rem; padding: 1rem; background: #0f172a; border-radius: var(--radius-md); color: #ffffff;">
                  <div style="font-size: 0.8rem; font-weight: 700; color: #60a5fa; text-transform: uppercase; margin-bottom: 0.5rem;">
                    🛡️ Opciones de Control Policial
                  </div>
                  ${isFrozen ? `
                    <button id="btn-police-unfreeze" class="btn btn-sm btn-secondary btn-block" style="color: #0f172a;">
                      Levantar Medida Cautelar
                    </button>
                  ` : `
                    <button id="btn-police-freeze" class="btn btn-sm btn-danger btn-block">
                      Emitir Bloqueo Cautelar Judicial
                    </button>
                  `}
                  <a href="#/security" class="btn btn-sm btn-outline btn-block" style="margin-top: 0.5rem; color: #ffffff; border-color: #3b82f6;">
                    Ir a Radar de Investigación
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this._attachEvents(container, product);
  },

  _attachEvents(container, product) {
    // Comprar Ahora
    const btnBuyNow = container.querySelector('#btn-buy-now');
    if (btnBuyNow) {
      btnBuyNow.addEventListener('click', () => {
        state.addToCart(product.id, 1);
        window.location.hash = '#/cart';
      });
    }

    // Agregar al Carrito
    const btnAddCart = container.querySelector('#btn-add-cart');
    if (btnAddCart) {
      btnAddCart.addEventListener('click', () => {
        state.addToCart(product.id, 1);
        if (window.app && window.app.showToast) {
          window.app.showToast(`"${product.title.slice(0, 30)}..." se agregó al carrito`, 'success');
        }
      });
    }

    // Calcular Envío
    const btnCalcShipping = container.querySelector('#btn-calc-shipping');
    if (btnCalcShipping) {
      btnCalcShipping.addEventListener('click', () => {
        const cp = container.querySelector('#input-shipping-cp').value.trim();
        const resDiv = container.querySelector('#shipping-calc-result');
        if (!cp) {
          resDiv.innerHTML = '<span style="color: var(--danger);">Ingresá un código postal válido (ej: 1425).</span>';
        } else {
          resDiv.innerHTML = `
            <span style="color: #059669; font-weight: 600;">✓ Envío disponible para CP ${cp}</span><br>
            Llega entre mañana y pasado por Andreani / Correo Argentino.
          `;
        }
      });
    }

    // Formulario de Preguntas
    const formQuestion = container.querySelector('#form-ask-question');
    if (formQuestion) {
      formQuestion.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = container.querySelector('#input-new-question');
        const text = input.value.trim();
        if (text) {
          state.addQuestion(product.id, text);
          input.value = '';
          if (window.app && window.app.showToast) {
            window.app.showToast('Tu pregunta fue enviada al vendedor', 'info');
          }
          this.render(product.id);
        }
      });
    }

    // Respuestas del Vendedor
    container.querySelectorAll('.btn-submit-answer').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.getAttribute('data-qid');
        const input = container.querySelector(`.answer-input[data-qid="${qid}"]`);
        if (input && input.value.trim()) {
          state.addAnswer(product.id, qid, input.value.trim());
          if (window.app && window.app.showToast) {
            window.app.showToast('Respuesta publicada con éxito', 'success');
          }
          this.render(product.id);
        }
      });
    });

    // Control Policial de Bloqueo Cautelar
    const btnPoliceFreeze = container.querySelector('#btn-police-freeze');
    if (btnPoliceFreeze) {
      btnPoliceFreeze.addEventListener('click', () => {
        const reason = prompt('Ingrese el motivo u oficio judicial para trabar la medida cautelar:', 'Presunta coincidencia unívoca con bien sustraído en investigación.');
        if (reason) {
          state.freezeProduct(product.id, reason);
          if (window.app && window.app.showToast) {
            window.app.showToast('Medida cautelar ejecutada. Publicación congelada.', 'error');
          }
          this.render(product.id);
        }
      });
    }

    const btnPoliceUnfreeze = container.querySelector('#btn-police-unfreeze');
    if (btnPoliceUnfreeze) {
      btnPoliceUnfreeze.addEventListener('click', () => {
        if (confirm('¿Confirmar el levantamiento de la medida cautelar y reactivar la publicación?')) {
          state.unfreezeProduct(product.id);
          if (window.app && window.app.showToast) {
            window.app.showToast('Medida cautelar levantada. Publicación reactivada.', 'success');
          }
          this.render(product.id);
        }
      });
    }
  }
};
