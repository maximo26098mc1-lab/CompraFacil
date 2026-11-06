/**
 * CompraFácil v2 - Módulo de Autenticación con Supabase Auth Oficial
 * js/modules/auth.js
 */

import { state } from '../state.js';
import { getSupabase } from '../supabaseClient.js';

export const auth = {
  initialized: false,

  async init() {
    if (this.initialized) return;
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase no inicializado aún.');
      return;
    }

    try {
      // 1. Obtener sesión activa persistida
      const { data: { session } } = await supabase.auth.getSession();
      state.setCurrentUser(session?.user || null);

      // 2. Suscribirse a cambios de estado de autenticación
      supabase.auth.onAuthStateChange((event, session) => {
        state.setCurrentUser(session?.user || null);
        this.renderAuthUI('header-role-switcher');

        if (event === 'PASSWORD_RECOVERY') {
          this.openUpdatePasswordModal();
        } else if (event === 'SIGNED_IN') {
          if (window.app && window.app.showToast) {
            window.app.showToast('Sesión iniciada correctamente', 'success');
          }
        } else if (event === 'SIGNED_OUT') {
          if (window.app && window.app.showToast) {
            window.app.showToast('Sesión cerrada', 'info');
          }
        }
      });

      this.initialized = true;
    } catch (err) {
      console.error('Error inicializando Supabase Auth:', err);
    }
  },

  getCurrentUser() {
    return state.getCurrentUser();
  },

  isAuthenticated() {
    return Boolean(state.getCurrentUser());
  },

  // Los módulos de seguridad y administración permanecen estrictamente bloqueados para usuarios comunes
  canAccessSecurity() {
    return false;
  },

  canAccessAdmin() {
    return false;
  },

  canAccessSeller() {
    return Boolean(state.getCurrentUser());
  },

  // Registro de usuario común (sin asignación de roles privilegiados)
  async signUp(email, password, fullName, phone) {
    if (!password || password.length < 12) {
      return { error: { message: 'La contraseña debe contener un mínimo de 12 caracteres.' } };
    }
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Servicio de autenticación no disponible.' } };

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          phone: phone || ''
        },
        emailRedirectTo: 'http://localhost:8000'
      }
    });
  },

  // Inicio de sesión
  async signIn(email, password) {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Servicio de autenticación no disponible.' } };

    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  // Cierre de sesión
  async signOut() {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    state.setCurrentUser(null);
    this.renderAuthUI('header-role-switcher');
  },

  // Solicitud de recuperación de contraseña
  async resetPassword(email) {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Servicio de autenticación no disponible.' } };

    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8000'
    });
  },

  // Actualización de contraseña (tras enlace de recuperación)
  async updatePassword(newPassword) {
    if (!newPassword || newPassword.length < 12) {
      return { error: { message: 'La nueva contraseña debe tener al menos 12 caracteres.' } };
    }
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Servicio de autenticación no disponible.' } };

    return await supabase.auth.updateUser({
      password: newPassword
    });
  },

  // Renderizado del botón/estado en el encabezado
  renderAuthUI(containerId = 'header-role-switcher') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = this.getCurrentUser();

    if (user) {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem;">
          <span style="color: #ffffff; font-weight: 600; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${user.email}">
            👤 ${user.name}
          </span>
          <button id="btn-auth-logout" class="btn btn-sm btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
            Cerrar Sesión
          </button>
        </div>
      `;

      const btnLogout = container.querySelector('#btn-auth-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => this.signOut());
      }
    } else {
      container.innerHTML = `
        <button id="btn-auth-open" class="btn btn-sm btn-outline" style="color: #ffffff; border-color: rgba(255, 255, 255, 0.7); padding: 0.25rem 0.75rem; font-size: 0.82rem;">
          🔑 Iniciar Sesión / Registrarse
        </button>
      `;

      const btnOpen = container.querySelector('#btn-auth-open');
      if (btnOpen) {
        btnOpen.addEventListener('click', () => this.openAuthModal('login'));
      }
    }
  },

  // Modal interactivo de Inicio de Sesión / Registro / Recuperación
  openAuthModal(initialView = 'login') {
    let currentView = initialView;

    const renderContent = () => {
      if (currentView === 'login') {
        return `
          <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem;">
            <button id="tab-login" class="btn btn-sm btn-primary" style="flex: 1;">Iniciar Sesión</button>
            <button id="tab-signup" class="btn btn-sm btn-secondary" style="flex: 1;">Crear Cuenta</button>
          </div>

          <form id="form-auth-login">
            <div class="form-group">
              <label class="form-label">Correo Electrónico <span class="required">*</span></label>
              <input type="email" id="auth-login-email" class="form-input" placeholder="usuario@correo.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña <span class="required">*</span></label>
              <input type="password" id="auth-login-password" class="form-input" placeholder="Tu contraseña" required />
            </div>
            <div style="text-align: right; margin-bottom: 1rem;">
              <a href="javascript:void(0)" id="link-goto-recovery" style="font-size: 0.82rem; color: var(--primary);">¿Olvidaste tu contraseña?</a>
            </div>
            <div id="auth-login-error" style="color: var(--danger); font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
            <button type="submit" id="btn-submit-login" class="btn btn-primary btn-block">Ingresar</button>
          </form>
        `;
      } else if (currentView === 'signup') {
        return `
          <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem;">
            <button id="tab-login" class="btn btn-sm btn-secondary" style="flex: 1;">Iniciar Sesión</button>
            <button id="tab-signup" class="btn btn-sm btn-primary" style="flex: 1;">Crear Cuenta</button>
          </div>

          <form id="form-auth-signup">
            <div class="form-group">
              <label class="form-label">Nombre y Apellido <span class="required">*</span></label>
              <input type="text" id="auth-signup-name" class="form-input" placeholder="Ej: Juan Pérez" required />
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono / WhatsApp <span class="required">*</span></label>
              <input type="tel" id="auth-signup-phone" class="form-input" placeholder="Ej: +54 9 11 5566-7788" required />
              <div class="form-help">Utilizado para tus publicaciones de compra/venta.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Correo Electrónico <span class="required">*</span></label>
              <input type="email" id="auth-signup-email" class="form-input" placeholder="usuario@correo.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña (Mínimo 12 caracteres) <span class="required">*</span></label>
              <input type="password" id="auth-signup-password" class="form-input" minlength="12" placeholder="Al menos 12 caracteres" required />
              <div class="form-help">Por seguridad del sitio se exige un mínimo de 12 caracteres.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar Contraseña <span class="required">*</span></label>
              <input type="password" id="auth-signup-confirm" class="form-input" minlength="12" placeholder="Repetí tu contraseña" required />
            </div>
            <div style="background: #f8fafc; border: 1px solid var(--border-color); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem;">
              ℹ️ Todos los registros corresponden a usuarios comunes. Nadie puede asignarse roles administrativos. Al registrarte te enviaremos un correo para confirmar tu dirección antes de iniciar sesión.
            </div>
            <div id="auth-signup-error" style="color: var(--danger); font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
            <button type="submit" id="btn-submit-signup" class="btn btn-primary btn-block">Registrarse</button>
          </form>
        `;
      } else if (currentView === 'recovery') {
        return `
          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 1.1rem; margin: 0 0 0.25rem;">Recuperar Contraseña</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
              Ingresá tu correo electrónico registrado y te enviaremos un enlace oficial para restablecer tu contraseña.
            </p>
          </div>

          <form id="form-auth-recovery">
            <div class="form-group">
              <label class="form-label">Correo Electrónico <span class="required">*</span></label>
              <input type="email" id="auth-recovery-email" class="form-input" placeholder="usuario@correo.com" required />
            </div>
            <div id="auth-recovery-error" style="color: var(--danger); font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
            <div id="auth-recovery-success" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.88rem; margin-bottom: 1rem; display: none;"></div>
            <button type="submit" id="btn-submit-recovery" class="btn btn-primary btn-block">Enviar Enlace de Recuperación</button>
            <div style="text-align: center; margin-top: 1rem;">
              <a href="javascript:void(0)" id="link-back-login" style="font-size: 0.85rem; color: var(--primary);">← Volver a Iniciar Sesión</a>
            </div>
          </form>
        `;
      }
    };

    const attachModalEvents = () => {
      const tabLogin = document.getElementById('tab-login');
      const tabSignup = document.getElementById('tab-signup');
      const linkRecovery = document.getElementById('link-goto-recovery');
      const linkBack = document.getElementById('link-back-login');

      if (tabLogin) tabLogin.addEventListener('click', () => { currentView = 'login'; refresh(); });
      if (tabSignup) tabSignup.addEventListener('click', () => { currentView = 'signup'; refresh(); });
      if (linkRecovery) linkRecovery.addEventListener('click', () => { currentView = 'recovery'; refresh(); });
      if (linkBack) linkBack.addEventListener('click', () => { currentView = 'login'; refresh(); });

      // Handler Login
      const formLogin = document.getElementById('form-auth-login');
      if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('auth-login-email').value.trim();
          const password = document.getElementById('auth-login-password').value;
          const errDiv = document.getElementById('auth-login-error');
          const submitBtn = document.getElementById('btn-submit-login');

          errDiv.style.display = 'none';
          submitBtn.disabled = true;
          submitBtn.textContent = 'Ingresando...';

          const { data, error } = await this.signIn(email, password);

          submitBtn.disabled = false;
          submitBtn.textContent = 'Ingresar';

          if (error) {
            let msg = error.message;
            if (msg.includes('Email not confirmed')) {
              msg = 'Tu correo aún no fue confirmado. Por favor revisá tu casilla de correo y hacé clic en el enlace de confirmación.';
            } else if (msg.includes('Invalid login credentials')) {
              msg = 'Correo electrónico o contraseña incorrectos.';
            }
            errDiv.textContent = msg;
            errDiv.style.display = 'block';
          } else {
            if (window.app && window.app.closeModal) window.app.closeModal();
          }
        });
      }

      // Handler Signup
      const formSignup = document.getElementById('form-auth-signup');
      if (formSignup) {
        formSignup.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('auth-signup-name').value.trim();
          const phone = document.getElementById('auth-signup-phone').value.trim();
          const email = document.getElementById('auth-signup-email').value.trim();
          const password = document.getElementById('auth-signup-password').value;
          const confirm = document.getElementById('auth-signup-confirm').value;
          const errDiv = document.getElementById('auth-signup-error');
          const submitBtn = document.getElementById('btn-submit-signup');

          errDiv.style.display = 'none';

          if (password !== confirm) {
            errDiv.textContent = 'Las contraseñas no coinciden.';
            errDiv.style.display = 'block';
            return;
          }

          if (password.length < 12) {
            errDiv.textContent = 'La contraseña debe tener al menos 12 caracteres.';
            errDiv.style.display = 'block';
            return;
          }

          submitBtn.disabled = true;
          submitBtn.textContent = 'Registrando...';

          const { data, error } = await this.signUp(email, password, name, phone);

          submitBtn.disabled = false;
          submitBtn.textContent = 'Registrarse';

          if (error) {
            errDiv.textContent = error.message;
            errDiv.style.display = 'block';
          } else {
            if (window.app && window.app.openModal) {
              window.app.openModal(
                'Confirmación Requerida',
                `
                <div style="text-align: center; padding: 1rem 0;">
                  <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📧</div>
                  <h4 style="margin-bottom: 0.5rem;">¡Cuenta Creada con Éxito!</h4>
                  <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">
                    Te enviamos un correo a <strong>${email}</strong>.<br>
                    Por favor hacé clic en el enlace para confirmar tu cuenta y luego podrás iniciar sesión.
                  </p>
                </div>
                `
              );
            }
          }
        });
      }

      // Handler Recovery
      const formRecovery = document.getElementById('form-auth-recovery');
      if (formRecovery) {
        formRecovery.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('auth-recovery-email').value.trim();
          const errDiv = document.getElementById('auth-recovery-error');
          const succDiv = document.getElementById('auth-recovery-success');
          const submitBtn = document.getElementById('btn-submit-recovery');

          errDiv.style.display = 'none';
          succDiv.style.display = 'none';
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando...';

          const { data, error } = await this.resetPassword(email);

          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar Enlace de Recuperación';

          if (error) {
            errDiv.textContent = error.message;
            errDiv.style.display = 'block';
          } else {
            succDiv.textContent = `Enviamos las instrucciones a ${email}. Revisá tu casilla de correo.`;
            succDiv.style.display = 'block';
          }
        });
      }
    };

    const refresh = () => {
      if (window.app && window.app.openModal) {
        window.app.openModal('Acceso a CompraFácil', renderContent());
        attachModalEvents();
      }
    };

    refresh();
  },

  // Modal para actualizar contraseña tras enlace de recuperación
  openUpdatePasswordModal() {
    if (!window.app || !window.app.openModal) return;

    const content = `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.15rem; margin: 0 0 0.25rem;">Establecer Nueva Contraseña</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
          Ingresá tu nueva contraseña de al menos 12 caracteres para actualizar tu cuenta.
        </p>
      </div>

      <form id="form-auth-update-password">
        <div class="form-group">
          <label class="form-label">Nueva Contraseña (Mínimo 12 caracteres) <span class="required">*</span></label>
          <input type="password" id="auth-new-password" class="form-input" minlength="12" placeholder="Al menos 12 caracteres" required />
        </div>
        <div class="form-group">
          <label class="form-label">Confirmar Nueva Contraseña <span class="required">*</span></label>
          <input type="password" id="auth-new-confirm" class="form-input" minlength="12" placeholder="Repetí tu nueva contraseña" required />
        </div>
        <div id="auth-update-error" style="color: var(--danger); font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
        <button type="submit" id="btn-submit-update-pwd" class="btn btn-primary btn-block">Actualizar Contraseña</button>
      </form>
    `;

    window.app.openModal('Actualización de Contraseña', content);

    const form = document.getElementById('form-auth-update-password');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = document.getElementById('auth-new-password').value;
        const confirm = document.getElementById('auth-new-confirm').value;
        const errDiv = document.getElementById('auth-update-error');
        const submitBtn = document.getElementById('btn-submit-update-pwd');

        errDiv.style.display = 'none';

        if (pwd !== confirm) {
          errDiv.textContent = 'Las contraseñas no coinciden.';
          errDiv.style.display = 'block';
          return;
        }

        if (pwd.length < 12) {
          errDiv.textContent = 'La contraseña debe tener al menos 12 caracteres.';
          errDiv.style.display = 'block';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Actualizando...';

        const { data, error } = await this.updatePassword(pwd);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Actualizar Contraseña';

        if (error) {
          errDiv.textContent = error.message;
          errDiv.style.display = 'block';
        } else {
          if (window.app && window.app.closeModal) window.app.closeModal();
          if (window.app && window.app.showToast) {
            window.app.showToast('Contraseña actualizada con éxito.', 'success');
          }
          window.location.hash = '#/catalog';
        }
      });
    }
  }
};
