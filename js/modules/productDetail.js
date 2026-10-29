/**
 * CompraFácil v2 - Detalle de Anuncio y Contacto Directo por WhatsApp
 * js/modules/productDetail.js
 */

import { state, generateWhatsAppLink } from '../state.js';
import { auth } from './auth.js';

export const productDetail = {
  render(adId, containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const ad = state.getProductById(adId);
    if (!ad || ad.status === 'retirado') {
      container.innerHTML = `
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <h2>Anuncio no disponible</h2>
          <p style="color: var(--text-muted); margin: 1rem 0;">La publicación solicitada fue retirada o no existe.</p>
          <a href="#/catalog" class="btn btn-primary">Volver al Catálogo</a>
        </div>
      `;
      return;
    }

    const currentUser = auth.getCurrentUser();
    const isOwner = currentUser && (currentUser.id === ad.sellerId || currentUser.role === 'admin');
    const isSold = ad.status === 'vendido';
    const formattedPrice = state.formatARS(ad.price);
    const waLink = generateWhatsAppLink(ad.whatsapp, ad.title, ad.price, ad.id);

    const html = `
      <div class="container">
        <!-- Breadcrumb -->
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <a href="#/catalog">Catálogo de Anuncios</a>
          <span>›</span>
          <span>${ad.category}</span>
          <span>›</span>
          <span style="color: var(--text-main); font-weight: 600;">${ad.title}</span>
        </div>

        ${isSold ? `
          <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.3rem;">ℹ️</span>
            <div>
              <strong style="color: #334155;">Este artículo fue marcado como VENDIDO por el anunciante.</strong>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Ya no se encuentra disponible para nuevas operaciones.</div>
            </div>
          </div>
        ` : ''}

        <div class="product-detail-layout">
          <!-- Columna Izquierda: Imagen y Descripción -->
          <div>
            <div class="detail-main-card">
              <div class="detail-gallery-main">
                <img src="${ad.image}" alt="${ad.title}" class="detail-gallery-img" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\' viewBox=\\'0 0 400 300\\'><rect width=\\'400\\' height=\\'300\\' fill=\\'%23f1f5f9\\'/><text x=\\'50%\\' y=\\'50%\\' font-family=\\'sans-serif\\' font-size=\\'16\\' fill=\\'%2394a3b8\\' text-anchor=\\'middle\\'>Sin imagen</text></svg>'" />
              </div>

              <!-- Ficha del Bien -->
              <div style="margin-top: 1.5rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.75rem;">Detalles del Producto</h3>
                
                <table class="data-table" style="font-size: 0.88rem;">
                  <tbody>
                    <tr>
                      <td style="width: 35%; font-weight: 600; color: var(--text-muted);">Condición</td>
                      <td><span class="product-condition-tag">${ad.condition}</span></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: var(--text-muted);">Marca</td>
                      <td><strong>${ad.brand || 'No informada'}</strong></td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600; color: var(--text-muted);">Modelo</td>
                      <td><strong>${ad.model || 'No informado'}</strong></td>
                    </tr>
                    ${ad.serialNumber ? `
                      <tr style="background: #f8fafc;">
                        <td style="font-weight: 600; color: var(--text-muted);">Identificador / N° Serie</td>
                        <td>
                          <code style="background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; color: #0f172a;">
                            ${ad.serialNumber}
                          </code>
                          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">(Declarado por el vendedor)</span>
                        </td>
                      </tr>
                    ` : ''}
                    <tr>
                      <td style="font-weight: 600; color: var(--text-muted);">Ubicación General</td>
                      <td>📍 ${ad.city || ''}, ${ad.province} <span style="font-size: 0.75rem; color: var(--text-muted);">(Punto de encuentro a coordinar)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Descripción -->
              <div style="margin-top: 2rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.75rem;">Descripción del Anunciante</h3>
                <div style="white-space: pre-line; line-height: 1.6; color: #374151; font-size: 0.95rem; background: #fafafa; padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                  ${ad.description || 'Sin descripción adicional proporcionada por el anunciante.'}
                </div>
              </div>

              <!-- Botón de Reporte de Publicación -->
              <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
                <button id="btn-report-this-ad" class="btn btn-sm btn-secondary" style="color: #991b1b;">
                  🚩 Reportar esta publicación
                </button>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Tarjeta de Contacto Directo -->
          <div>
            <div class="detail-buy-box">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="product-condition-tag">${ad.condition}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Publicado el ${new Date(ad.createdAt).toLocaleDateString('es-AR')}</span>
              </div>

              <h1 style="font-size: 1.35rem; font-weight: 700; margin: 0.75rem 0; line-height: 1.3;">
                ${ad.title}
              </h1>

              <div style="font-size: 2rem; font-weight: 800; color: var(--text-main); margin-bottom: 1.25rem;">
                ${formattedPrice}
              </div>

              <!-- Botón Principal: WhatsApp -->
              ${isSold ? `
                <button class="btn btn-secondary btn-block btn-lg" disabled style="margin-bottom: 1rem;">
                  Artículo Vendido
                </button>
              ` : `
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-block btn-lg" style="background-color: #25D366; color: #ffffff; font-weight: 700; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
                  <span style="font-size: 1.2rem;">💬</span> Consultar por WhatsApp
                </a>
              `}

              <!-- Cuadro Informativo de Transparencia -->
              <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #475569; line-height: 1.5;">
                <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.35rem;">
                  <span>🤝</span> Contacto directo entre partes
                </div>
                <div>Número provisto por el anunciante: <strong>${ad.whatsapp}</strong></div>
                <div style="margin-top: 0.5rem; font-size: 0.78rem; color: var(--text-muted);">
                  CompraFácil no procesa pagos ni gestiona envíos. El comprador y el anunciante acuerdan libre y directamente el precio, la forma de pago y el punto de encuentro seguro para la entrega.
                </div>
              </div>

              <!-- Datos del Anunciante -->
              <div style="padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.85rem;">
                <div style="color: var(--text-muted);">Anunciante:</div>
                <div style="font-weight: 700; font-size: 0.95rem; margin-top: 0.15rem;">${ad.sellerName || 'Usuario Registrado'}</div>
                <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.2rem;">
                  📍 ${ad.city || ''}, ${ad.province}
                </div>
              </div>

              <!-- Panel del Propietario (Si el usuario es dueño del anuncio) -->
              ${isOwner ? `
                <div style="margin-top: 1.5rem; padding: 1rem; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: var(--radius-md);">
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 0.75rem;">
                    ⚙️ Opciones del Propietario
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${isSold ? `
                      <button id="btn-mark-available" class="btn btn-sm btn-outline">
                        Marcar como Disponible nuevamente
                      </button>
                    ` : `
                      <button id="btn-mark-sold" class="btn btn-sm btn-secondary">
                        Marcar como Vendido
                      </button>
                    `}
                    <button id="btn-withdraw-ad" class="btn btn-sm btn-danger">
                      Retirar Anuncio (Eliminar)
                    </button>
                  </div>
                </div>
              ` : ''}

            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this._attachEvents(container, ad);
  },

  _attachEvents(container, ad) {
    // Reportar Publicación
    const btnReport = container.querySelector('#btn-report-this-ad');
    if (btnReport) {
      btnReport.addEventListener('click', () => {
        window.location.hash = `#/report?id=${ad.id}`;
      });
    }

    // Acciones de Propietario: Marcar Vendido
    const btnMarkSold = container.querySelector('#btn-mark-sold');
    if (btnMarkSold) {
      btnMarkSold.addEventListener('click', () => {
        state.markProductAsSold(ad.id);
        if (window.app && window.app.showToast) {
          window.app.showToast('El anuncio fue marcado como VENDIDO.', 'info');
        }
        this.render(ad.id);
      });
    }

    // Marcar Disponible
    const btnMarkAvail = container.querySelector('#btn-mark-available');
    if (btnMarkAvail) {
      btnMarkAvail.addEventListener('click', () => {
        state.markProductAsAvailable(ad.id);
        if (window.app && window.app.showToast) {
          window.app.showToast('El anuncio volvió a estar DISPONIBLE.', 'success');
        }
        this.render(ad.id);
      });
    }

    // Retirar Anuncio
    const btnWithdraw = container.querySelector('#btn-withdraw-ad');
    if (btnWithdraw) {
      btnWithdraw.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas retirar este anuncio definitivamente del catálogo?')) {
          state.withdrawProduct(ad.id);
          if (window.app && window.app.showToast) {
            window.app.showToast('Anuncio retirado del catálogo.', 'info');
          }
          window.location.hash = '#/catalog';
        }
      });
    }
  }
};
