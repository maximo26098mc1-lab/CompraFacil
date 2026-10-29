/**
 * CompraFácil v2 - Módulo Legal y Prevención
 * js/modules/legal.js
 *
 * Contiene Términos de Uso, Política de Privacidad y Formulario de Reporte de Publicaciones.
 */

import { state } from '../state.js';

export const legal = {
  renderTerms(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="container" style="max-width: 860px; padding: 2rem 1rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-sm);">
          
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div>
              <span class="badge badge-warning" style="margin-bottom: 0.5rem;">Borrador sujeto a revisión legal antes del lanzamiento</span>
              <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin: 0;">
                Términos de Uso y Responsabilidad
              </h1>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.25rem;">
                Versión: <strong>v2.0-draft</strong> • Última actualización: Octubre 2026
              </div>
            </div>
            <a href="#/catalog" class="btn btn-sm btn-outline">← Volver al Catálogo</a>
          </div>

          <!-- Declaración Fundamental Obligatoria -->
          <div style="background: #f8fafc; border-left: 4px solid var(--primary); padding: 1.25rem; border-radius: var(--radius-md); font-size: 0.95rem; line-height: 1.6; color: #1e293b; margin-bottom: 2rem;">
            <strong>Declaración del Servicio:</strong><br>
            “CompraFácil facilita la publicación de anuncios y el contacto entre vendedores y compradores. No recibe pagos ni gestiona envíos. Cada anunciante es responsable de la veracidad de la información, de las imágenes que publica y de contar con la titularidad o autorización necesaria para ofrecer el bien. Se prohíbe publicar bienes robados, de procedencia ilícita o cuya comercialización esté prohibida. Las partes acuerdan directamente las condiciones de la operación. CompraFácil podrá revisar reportes y retirar publicaciones conforme a sus reglas y obligaciones legales. Estas condiciones no excluyen responsabilidades legalmente exigibles ni limitan derechos irrenunciables.”
          </div>

          <div style="font-size: 0.92rem; line-height: 1.7; color: var(--text-main); display: flex; flex-direction: column; gap: 1.5rem;">
            <section>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
                1. Alcance y Naturaleza de la Plataforma
              </h3>
              <p>
                CompraFácil opera exclusivamente como un tablón virtual de anuncios clasificados. La plataforma <strong>no interviene</strong> en las transacciones comerciales, <strong>no procesa cobros ni pagos</strong>, <strong>no ofrece servicios de custodia de fondos</strong> ni coordina traslados o envíos de mercaderías. Todo acuerdo comercial se celebra de manera directa y privada entre comprador y vendedor a través de los canales de contacto (como WhatsApp) que las partes elijan utilizar.
              </p>
            </section>

            <section>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
                2. Responsabilidad de los Anunciantes
              </h3>
              <p>
                Cada usuario que publica un aviso manifiesta bajo declaración jurada ser el titular legítimo del bien ofrecido o contar con la debida autorización para su enajenación. Se prohíbe de manera terminante publicar objetos sustraídos, falsificados o sujetos a medidas cautelares judiciales.
              </p>
            </section>

            <section>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
                3. Transparencia del Contacto por WhatsApp
              </h3>
              <p>
                Al publicar un anuncio, el anunciante autoriza expresamente que el número telefónico de WhatsApp proporcionado sea visible públicamente en la ficha del producto a fin de permitir que potenciales interesados o autoridades que consulten el aviso puedan comunicarse directamente.
              </p>
            </section>

            <section>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
                4. Canal de Reportes y Colaboración
              </h3>
              <p>
                Cualquier usuario o autoridad puede señalar publicaciones que infrinjan estas reglas mediante el canal <a href="#/report">Reportar Publicación</a>. CompraFácil se reserva la facultad de suspender o retirar preventivamente cualquier anuncio denunciado o con indicios fundados de irregularidad.
              </p>
            </section>
          </div>
        </div>
      </div>
    `;
  },

  renderPrivacy(containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="container" style="max-width: 860px; padding: 2rem 1rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-sm);">
          
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div>
              <span class="badge badge-secondary" style="margin-bottom: 0.5rem;">Transparencia y Protección de Datos</span>
              <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin: 0;">
                Política de Privacidad
              </h1>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.25rem;">
                Conforme a la Ley 25.326 de Protección de Datos Personales (República Argentina)
              </div>
            </div>
            <a href="#/catalog" class="btn btn-sm btn-outline">← Volver al Catálogo</a>
          </div>

          <div style="font-size: 0.92rem; line-height: 1.7; color: var(--text-main); display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 1rem; border-radius: var(--radius-md); font-size: 0.88rem; color: #92400e;">
              <strong>Datos del Responsable del Tratamiento:</strong><br>
              • <strong>Responsable:</strong> [Razón Social / Titular: Pendiente de designación legal antes del lanzamiento]<br>
              • <strong>Domicilio de Notificaciones:</strong> [Domicilio Legal en Argentina: A designar]<br>
              • <strong>Canal de Contacto de Privacidad:</strong> [Correo: privacidad@comprafacil.ejemplo]
            </div>

            <section>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
                1. Finalidad del Tratamiento de Datos
              </h3>
              <p>
                Los datos solicitados al publicar un aviso (título, descripción, fotografía, ubicación general de provincia/localidad y número de WhatsApp) tienen por <strong>única finalidad</strong> permitir la visualización del anuncio y habilitar la comunicación directa entre comprador y anunciante. No solicitamos domicilios particulares exactos ni datos financieros.
              </p>
            </section>

            <section>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
                2. Visibilidad Pública del Número de WhatsApp
              </h3>
              <p>
                El número de WhatsApp ingresado por el vendedor se publica de forma explícita en el anuncio mediante un enlace de tipo <code>https://wa.me/...</code>. Todo usuario que navegue el sitio, así como autoridades competentes que auditen publicaciones, podrán acceder a este dato de contacto. Si no desea que su número sea visible, no debe publicar anuncios en la plataforma.
              </p>
            </section>

            <section>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
                3. Plazo de Conservación y Derechos de los Titulares
              </h3>
              <p>
                Los datos se conservan mientras la publicación permanezca activa. El titular puede en cualquier momento marcar el anuncio como vendido o retirarlo definitivamente desde su panel, eliminándolo del catálogo público. Asimismo, puede ejercer sus derechos de acceso, rectificación y supresión enviando un correo al canal de privacidad indicado.
              </p>
            </section>
          </div>
        </div>
      </div>
    `;
  },

  renderReportForm(adId = '', containerId = 'app-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const ads = state.getProducts(true);
    const targetAd = adId ? ads.find(a => a.id === adId) : null;

    container.innerHTML = `
      <div class="container" style="max-width: 680px; padding: 2rem 1rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-sm);">
          
          <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <h1 style="font-size: 1.4rem; font-weight: 800; color: #991b1b; margin: 0 0 0.25rem;">
              🚩 Reportar una Publicación
            </h1>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
              Si detectás un anuncio con presunta procedencia ilícita, datos engañosos o infracciones a las normas, podés informarlo para revisión.
            </p>
          </div>

          <form id="form-report-ad">
            <div class="form-group">
              <label class="form-label">Publicación a Reportar <span class="required">*</span></label>
              ${targetAd ? `
                <div style="background: #f8fafc; border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.9rem;">
                  <strong>${targetAd.title}</strong><br>
                  <span style="color: var(--text-muted); font-size: 0.82rem;">ID: ${targetAd.id} • Precio: ${state.formatARS(targetAd.price)}</span>
                </div>
                <input type="hidden" id="report-ad-id" value="${targetAd.id}" />
              ` : `
                <select id="report-ad-id" class="form-select" required>
                  <option value="">-- Seleccionar anuncio a reportar --</option>
                  ${ads.map(a => `
                    <option value="${a.id}">${a.title} (${state.formatARS(a.price)})</option>
                  `).join('')}
                </select>
              `}
            </div>

            <div class="form-group">
              <label class="form-label">Motivo del Reporte <span class="required">*</span></label>
              <select id="report-reason" class="form-select" required>
                <option value="">-- Seleccionar motivo principal --</option>
                <option value="bien_sospechoso">Presunto bien sustraído / procedencia dudosa</option>
                <option value="datos_falsos">Información, fotos o número de contacto engañoso</option>
                <option value="estafa_previa">Intento de estafa o conducta abusiva en WhatsApp</option>
                <option value="otro">Otro motivo justificado</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Detalles y Fundamento <span class="required">*</span></label>
              <textarea id="report-details" class="form-textarea" placeholder="Explicá de forma clara por qué se reporta este anuncio. Si contás con referencias concretas o números de serie, aportalos aquí..." required minlength="10"></textarea>
              <div class="form-help">Mínimo 10 caracteres. Aportá la mayor cantidad de datos comprobables.</div>
            </div>

            <div class="form-group">
              <label class="form-label">Tu Correo Electrónico (Opcional)</label>
              <input type="email" id="report-email" class="form-input" placeholder="ejemplo@correo.com" />
              <div class="form-help">Para contactarte en caso de requerir aclaraciones adicionales.</div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
              <a href="#/catalog" class="btn btn-secondary">Cancelar</a>
              <button type="submit" class="btn btn-danger">Enviar Reporte para Revisión</button>
            </div>
          </form>

        </div>
      </div>
    `;

    const form = container.querySelector('#form-report-ad');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const adIdVal = container.querySelector('#report-ad-id').value;
        const reason = container.querySelector('#report-reason').value;
        const details = container.querySelector('#report-details').value.trim();
        const email = container.querySelector('#report-email').value.trim();

        if (!adIdVal || !reason || details.length < 10) {
          alert('Por favor complete todos los campos requeridos con al menos 10 caracteres en la descripción.');
          return;
        }

        state.addAdReport({
          adId: adIdVal,
          reason,
          details,
          reporterEmail: email
        });

        if (window.app && window.app.showToast) {
          window.app.showToast('Reporte recibido con éxito. Será evaluado por el equipo.', 'success');
        }

        window.location.hash = '#/catalog';
      });
    }
  }
};
