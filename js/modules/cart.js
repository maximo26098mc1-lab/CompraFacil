/**
 * CompraFácil - Carrito de Compras y Checkout Argentino Simulado
 * js/modules/cart.js
 */

import { state } from '../state.js';

export const cart = {
  currentStep: 1, // 1: Resumen de Carrito, 2: Datos de Envío y Pago, 3: Confirmación
  checkoutData: {
    province: 'CABA',
    city: 'Palermo',
    address: 'Av. Santa Fe 3400',
    postalCode: '1425',
    paymentMethod: 'mercadopago', // 'mercadopago' | 'transferencia' | 'punto_seguro'
    notes: ''
  },
  lastOrder: null,

  render(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cartItems = state.getCart();

    if (this.currentStep === 3 && this.lastOrder) {
      this._renderOrderConfirmation(container);
      return;
    }

    if (cartItems.length === 0) {
      this._renderEmptyCart(container);
      return;
    }

    this._renderCartAndCheckout(container, cartItems);
  },

  _renderEmptyCart(container) {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 4rem 1rem;">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛒</div>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Tu carrito de compras está vacío</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">¡Descubrí miles de publicaciones con compra protegida y envíos a todo el país!</p>
        <a href="#/catalog" class="btn btn-primary btn-lg">Explorar Catálogo</a>
      </div>
    `;
  },

  _renderCartAndCheckout(container, cartItems) {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 300000 ? 0 : 4500;
    const total = subtotal + shipping;

    const html = `
      <div class="container">
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem;">
          ${this.currentStep === 1 ? 'Tu Carrito de Compras' : 'Finalizar Compra Protegida'}
        </h2>

        <!-- Barra de Progreso de Checkout -->
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: ${this.currentStep >= 1 ? 'var(--primary)' : 'var(--text-muted)'};">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: ${this.currentStep >= 1 ? 'var(--primary)' : '#e2e8f0'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">1</span>
            Carrito
          </div>
          <div style="width: 40px; height: 2px; background: ${this.currentStep >= 2 ? 'var(--primary)' : '#e2e8f0'};"></div>
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: ${this.currentStep >= 2 ? 'var(--primary)' : 'var(--text-muted)'};">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: ${this.currentStep >= 2 ? 'var(--primary)' : '#e2e8f0'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">2</span>
            Envío y Pago
          </div>
          <div style="width: 40px; height: 2px; background: ${this.currentStep >= 3 ? 'var(--primary)' : '#e2e8f0'};"></div>
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: ${this.currentStep >= 3 ? 'var(--primary)' : 'var(--text-muted)'};">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: ${this.currentStep >= 3 ? 'var(--primary)' : '#e2e8f0'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">3</span>
            Confirmación
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start;">
          <!-- Columna Principal -->
          <div>
            ${this.currentStep === 1 ? this._renderCartItemsStep(cartItems) : this._renderShippingPaymentStep()}
          </div>

          <!-- Columna Resumen de Compra -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; position: sticky; top: 90px;">
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem;">Resumen de Compra</h3>

            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.92rem; color: var(--text-muted);">
              <span>Productos (${cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
              <span>${state.formatARS(subtotal)}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.92rem; color: var(--text-muted);">
              <span>Envío</span>
              <span>${shipping === 0 ? '<strong style="color: #059669;">Gratis</strong>' : state.formatARS(shipping)}</span>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; color: var(--text-main);">
              <span>Total</span>
              <span>${state.formatARS(total)}</span>
            </div>

            <div style="margin-top: 1.5rem;">
              ${this.currentStep === 1 ? `
                <button id="btn-goto-step-2" class="btn btn-primary btn-block btn-lg">
                  Continuar Compra
                </button>
              ` : `
                <button id="btn-submit-order" class="btn btn-primary btn-block btn-lg">
                  Confirmar y Pagar
                </button>
                <button id="btn-back-step-1" class="btn btn-secondary btn-block" style="margin-top: 0.5rem;">
                  Volver al Carrito
                </button>
              `}
            </div>

            <div style="margin-top: 1.25rem; font-size: 0.78rem; color: var(--text-muted); text-align: center; display: flex; flex-direction: column; gap: 0.25rem;">
              <span>🔒 <strong>Compra Protegida</strong>: Tu dinero está seguro.</span>
              <span>Recibí el producto que esperabas o te devolvemos el dinero.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this._attachCartEvents(container);
  },

  _renderCartItemsStep(cartItems) {
    return `
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden;">
        <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); font-weight: 700; color: var(--text-muted); font-size: 0.88rem;">
          PRODUCTOS SELECCIONADOS
        </div>
        <div style="padding: 0 1.5rem;">
          ${cartItems.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 0; border-bottom: 1px solid var(--border-color); gap: 1rem; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 250px;">
                <img src="${item.image}" alt="${item.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border-color);" />
                <div>
                  <h4 style="font-size: 0.95rem; font-weight: 600; margin: 0 0 0.25rem;">
                    <a href="#/product/${item.productId}" style="color: var(--text-main);">${item.title}</a>
                  </h4>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Vendido por: ${item.sellerName || 'Comercio Verificado'}</div>
                  <button class="btn-remove-item" data-id="${item.productId}" style="background: none; border: none; color: var(--danger); font-size: 0.8rem; cursor: pointer; padding: 0; margin-top: 0.35rem;">
                    Eliminar
                  </button>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 0.5rem; background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.2rem 0.5rem;">
                <button class="btn-qty" data-id="${item.productId}" data-delta="-1" style="border: none; background: none; cursor: pointer; font-weight: 700; font-size: 1rem; width: 24px;">-</button>
                <span style="font-size: 0.9rem; font-weight: 700; min-width: 20px; text-align: center;">${item.quantity}</span>
                <button class="btn-qty" data-id="${item.productId}" data-delta="1" style="border: none; background: none; cursor: pointer; font-weight: 700; font-size: 1rem; width: 24px;">+</button>
              </div>

              <div style="font-size: 1.15rem; font-weight: 700; min-width: 120px; text-align: right;">
                ${state.formatARS(item.price * item.quantity)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  _renderShippingPaymentStep() {
    const provinces = state.getState().provinces || [];

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Datos de Entrega -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>📍</span> 1. Dirección de Entrega en Argentina
          </h3>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Provincia <span class="required">*</span></label>
              <select id="checkout-province" class="form-select">
                ${provinces.map(p => `
                  <option value="${p}" ${this.checkoutData.province === p ? 'selected' : ''}>${p}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ciudad / Localidad <span class="required">*</span></label>
              <input type="text" id="checkout-city" class="form-input" value="${this.checkoutData.city}" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Calle y Número <span class="required">*</span></label>
              <input type="text" id="checkout-address" class="form-input" value="${this.checkoutData.address}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Código Postal <span class="required">*</span></label>
              <input type="text" id="checkout-cp" class="form-input" value="${this.checkoutData.postalCode}" required />
            </div>
          </div>
        </div>

        <!-- Método de Pago Argentino -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>💳</span> 2. Elegí cómo pagar
          </h3>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <!-- Opción Mercado Pago -->
            <label style="border: 2px solid ${this.checkoutData.paymentMethod === 'mercadopago' ? 'var(--primary)' : 'var(--border-color)'}; background: ${this.checkoutData.paymentMethod === 'mercadopago' ? 'var(--primary-light)' : '#ffffff'}; border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: flex-start; gap: 1rem; cursor: pointer;">
              <input type="radio" name="paymentMethod" value="mercadopago" ${this.checkoutData.paymentMethod === 'mercadopago' ? 'checked' : ''} style="margin-top: 0.25rem;" />
              <div>
                <div style="font-weight: 700; font-size: 0.95rem; color: #0072ce;">
                  Mercado Pago (Tarjeta de Crédito / Débito / QR)
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
                  Acreditación instantánea. Hasta 6 cuotas fijas o con dinero en cuenta.
                </div>
              </div>
            </label>

            <!-- Opción Transferencia CBU / Alias -->
            <label style="border: 2px solid ${this.checkoutData.paymentMethod === 'transferencia' ? 'var(--primary)' : 'var(--border-color)'}; background: ${this.checkoutData.paymentMethod === 'transferencia' ? 'var(--primary-light)' : '#ffffff'}; border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: flex-start; gap: 1rem; cursor: pointer;">
              <input type="radio" name="paymentMethod" value="transferencia" ${this.checkoutData.paymentMethod === 'transferencia' ? 'checked' : ''} style="margin-top: 0.25rem;" />
              <div>
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                  Transferencia Bancaria Inmediata (CBU / ALIAS)
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
                  CBU: <code style="background: #e2e8f0; padding: 0.1rem 0.3rem;">0110599520000012345678</code> | Alias: <strong style="color: #0f172a;">COMPRAFACIL.ARG.BANCO</strong>
                </div>
              </div>
            </label>

            <!-- Opción Punto Seguro C2C -->
            <label style="border: 2px solid ${this.checkoutData.paymentMethod === 'punto_seguro' ? 'var(--primary)' : 'var(--border-color)'}; background: ${this.checkoutData.paymentMethod === 'punto_seguro' ? 'var(--primary-light)' : '#ffffff'}; border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: flex-start; gap: 1rem; cursor: pointer;">
              <input type="radio" name="paymentMethod" value="punto_seguro" ${this.checkoutData.paymentMethod === 'punto_seguro' ? 'checked' : ''} style="margin-top: 0.25rem;" />
              <div>
                <div style="font-weight: 700; font-size: 0.95rem; color: #059669;">
                  🛡️ Punto Seguro de Intercambio C2C (Pago contra entrega monitoreada)
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
                  Encuentro en Centros de Monitoreo Urbano o Comisarías designadas para verificar el bien antes de liberar los fondos.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;
  },

  _renderOrderConfirmation(container) {
    const order = this.lastOrder;

    container.innerHTML = `
      <div class="container" style="max-width: 720px; padding: 2rem 1rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2.5rem; text-align: center; box-shadow: var(--shadow-md);">
          <div style="width: 64px; height: 64px; background: #ecfdf5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.25rem;">
            ✓
          </div>
          <span class="badge badge-success" style="font-size: 0.85rem; padding: 0.3rem 0.8rem; margin-bottom: 0.75rem;">¡PAGO APROBADO CON ÉXITO!</span>
          
          <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem;">Comprobante de Operación N° ${order.id}</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2rem;">
            Enviamos el comprobante a tu correo y notificamos al vendedor para preparar el despacho.
          </p>

          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; text-align: left; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.9rem;">
              <span style="color: var(--text-muted);">Fecha y Hora:</span>
              <strong>${new Date(order.date).toLocaleString('es-AR')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.9rem;">
              <span style="color: var(--text-muted);">Método de Pago:</span>
              <strong>${order.paymentMethod}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.9rem;">
              <span style="color: var(--text-muted);">Dirección de Entrega:</span>
              <strong>${order.shippingAddress}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.75rem; font-size: 1.15rem; font-weight: 800;">
              <span>Total Abonado:</span>
              <span style="color: var(--primary);">${state.formatARS(order.total)}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
            <button onclick="window.print()" class="btn btn-secondary">
              🖨️ Imprimir Comprobante
            </button>
            <a href="#/catalog" class="btn btn-primary" id="btn-back-catalog">
              Seguir Comprando
            </a>
          </div>
        </div>
      </div>
    `;

    const btnBack = container.querySelector('#btn-back-catalog');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.currentStep = 1;
        this.lastOrder = null;
      });
    }
  },

  _attachCartEvents(container) {
    // Aumentar/Disminuir Cantidad
    container.querySelectorAll('.btn-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const delta = parseInt(btn.getAttribute('data-delta'), 10);
        const item = state.getCart().find(i => i.productId === id);
        if (item) {
          state.updateCartQuantity(id, item.quantity + delta);
        }
      });
    });

    // Eliminar Item
    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        state.removeFromCart(id);
      });
    });

    // Ir a Paso 2
    const btnGotoStep2 = container.querySelector('#btn-goto-step-2');
    if (btnGotoStep2) {
      btnGotoStep2.addEventListener('click', () => {
        this.currentStep = 2;
        this.render();
      });
    }

    // Volver a Paso 1
    const btnBackStep1 = container.querySelector('#btn-back-step-1');
    if (btnBackStep1) {
      btnBackStep1.addEventListener('click', () => {
        this.currentStep = 1;
        this.render();
      });
    }

    // Cambiar Método de Pago
    container.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.checkoutData.paymentMethod = e.target.value;
      });
    });

    // Enviar Orden Final
    const btnSubmitOrder = container.querySelector('#btn-submit-order');
    if (btnSubmitOrder) {
      btnSubmitOrder.addEventListener('click', () => {
        const province = container.querySelector('#checkout-province').value;
        const city = container.querySelector('#checkout-city').value;
        const address = container.querySelector('#checkout-address').value;
        const cp = container.querySelector('#checkout-cp').value;

        if (!city || !address || !cp) {
          alert('Por favor complete todos los datos de envío requeridos.');
          return;
        }

        let paymentLabel = 'Mercado Pago';
        if (this.checkoutData.paymentMethod === 'transferencia') {
          paymentLabel = 'Transferencia Bancaria Inmediata';
        } else if (this.checkoutData.paymentMethod === 'punto_seguro') {
          paymentLabel = 'Punto Seguro de Intercambio C2C';
        }

        const newOrder = state.createOrder({
          shippingAddress: `${address}, ${city}, ${province} (CP: ${cp})`,
          paymentMethod: paymentLabel
        });

        this.lastOrder = newOrder;
        this.currentStep = 3;
        this.render();

        if (window.app && window.app.showToast) {
          window.app.showToast(`¡Orden ${newOrder.id} generada con éxito!`, 'success');
        }
      });
    }
  }
};
