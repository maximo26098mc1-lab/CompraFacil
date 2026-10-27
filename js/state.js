/**
 * CompraFácil - Gestor de Estado Centralizado y Persistencia Reactiva
 * js/state.js
 */

const STORAGE_KEY = 'comprafacil_state_v1';

// Semillero Inicial de Datos (Contexto Mercado Argentino)
const DEFAULT_SEED = {
  currentUser: {
    id: 'u-comprador',
    name: 'Juan Pérez',
    email: 'comprador@ejemplo.com',
    role: 'buyer', // 'buyer' | 'seller' | 'police' | 'admin'
    location: 'CABA - Palermo',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
  },
  users: [
    {
      id: 'u-comprador',
      name: 'Juan Pérez',
      email: 'comprador@ejemplo.com',
      role: 'buyer',
      location: 'CABA - Palermo',
      phone: '+54 11 4821-9988'
    },
    {
      id: 'u-vendedor',
      name: 'Martín Gómez (Palermo Tech)',
      email: 'vendedor@ejemplo.com',
      role: 'seller',
      location: 'CABA - Villa Crespo',
      phone: '+54 11 5566-7788',
      reputation: '4.9 ★ (184 ventas)'
    },
    {
      id: 'u-policia',
      name: 'Oficial Inspector R. Benítez',
      email: 'oficial.investigador@policia.gob.ar',
      role: 'police',
      badgeNumber: 'DDI-SI-9924',
      jurisdiction: 'Superintendencia de Investigaciones / Ciberdelitos',
      phone: '+54 11 4370-5800'
    },
    {
      id: 'u-admin',
      name: 'Sofía Rossi (Administradora)',
      email: 'admin@comprafacil.com.ar',
      role: 'admin',
      location: 'Sede Central Buenos Aires'
    }
  ],
  categories: [
    'Celulares y Smartphones',
    'Bicicletas y Movilidad',
    'Computación y Laptops',
    'Herramientas y Construcción',
    'Consolas y Videojuegos',
    'Audio y Fotografía'
  ],
  provinces: [
    'CABA',
    'Buenos Aires - GBA Norte',
    'Buenos Aires - GBA Sur',
    'Buenos Aires - GBA Oeste',
    'Buenos Aires - Interior',
    'Córdoba',
    'Santa Fe',
    'Mendoza',
    'Tucumán',
    'Salta',
    'Entre Ríos',
    'Neuquén'
  ],
  products: [
    {
      id: 'prod-1',
      title: 'iPhone 14 Pro Max 256GB Deep Purple Batería 92%',
      category: 'Celulares y Smartphones',
      price: 1450000,
      condition: 'usado',
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      serialNumber: 'F2LXT909MD6R',
      imei: '354892110293847',
      stock: 1,
      freeShipping: true,
      installments: 6,
      province: 'CABA',
      city: 'Belgrano',
      sellerId: 'u-vendedor',
      sellerName: 'Palermo Tech',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
      description: 'Impecable estado general, libre de iCloud. Incluye cable USB-C a Lightning original. Muy leve detalle imperceptible en marco superior.',
      createdAt: '2026-10-20T10:30:00Z',
      isFrozen: false,
      frozenReason: null,
      questions: [
        {
          id: 'q-1',
          userId: 'u-comprador',
          userName: 'Juan Pérez',
          text: '¿Hola, hacés envíos a Microcentro en el día?',
          answer: '¡Hola Juan! Sí, con mensajería privada te llega en el transcurso de la tarde.',
          createdAt: '2026-10-21T14:15:00Z'
        }
      ]
    },
    {
      id: 'prod-2',
      title: 'Bicicleta Mountain Bike Venzo Rodado 29 Inferno Shimano',
      category: 'Bicicletas y Movilidad',
      price: 420000,
      condition: 'usado',
      brand: 'Venzo',
      model: 'Inferno 29',
      serialNumber: 'VNZ-2023-88419X',
      frameNumber: 'VNZ-2023-88419X',
      stock: 1,
      freeShipping: false,
      installments: 3,
      province: 'Buenos Aires - GBA Norte',
      city: 'Vicente López',
      sellerId: 'u-vendedor-2',
      sellerName: 'Ventas Rápidas Zona Norte',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
      description: 'Mountain bike rodado 29, cuadro talle L. Se entrega con asiento Velo y soporte caramañola fluo. Lista para andar.',
      createdAt: '2026-10-22T08:00:00Z',
      isFrozen: false,
      frozenReason: null,
      questions: []
    },
    {
      id: 'prod-3',
      title: 'Notebook Lenovo ThinkPad T14 Gen 3 Intel Core i7 16GB SSD 512GB',
      category: 'Computación y Laptops',
      price: 980000,
      condition: 'usado',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 3',
      serialNumber: 'PF3W9Q2L',
      stock: 2,
      freeShipping: true,
      installments: 12,
      province: 'Córdoba',
      city: 'Córdoba Capital',
      sellerId: 'u-vendedor',
      sellerName: 'Palermo Tech',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      description: 'Laptop empresarial de alto rendimiento. Batería con excelente autonomía. Cargador original 65W.',
      createdAt: '2026-10-18T16:00:00Z',
      isFrozen: false,
      frozenReason: null,
      questions: []
    },
    {
      id: 'prod-4',
      title: 'Samsung Galaxy S23 Ultra 512GB Phantom Black Sellado en Caja',
      category: 'Celulares y Smartphones',
      price: 1650000,
      condition: 'nuevo',
      brand: 'Samsung',
      model: 'Galaxy S23 Ultra',
      serialNumber: 'R5CW10X99PQ',
      imei: '359124098231456',
      stock: 3,
      freeShipping: true,
      installments: 6,
      province: 'Santa Fe',
      city: 'Rosario',
      sellerId: 'u-vendedor',
      sellerName: 'Palermo Tech',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
      description: 'Equipo nuevo de fábrica en caja precintada con garantía oficial de 12 meses. Incluye S-Pen original.',
      createdAt: '2026-10-19T12:00:00Z',
      isFrozen: false,
      frozenReason: null,
      questions: []
    },
    {
      id: 'prod-5',
      title: 'Sony PlayStation 5 Standard Edition con Lector de Discos + 2 Joysticks',
      category: 'Consolas y Videojuegos',
      price: 890000,
      condition: 'usado',
      brand: 'Sony',
      model: 'PlayStation 5',
      serialNumber: 'AK4729103841',
      stock: 1,
      freeShipping: true,
      installments: 6,
      province: 'Buenos Aires - GBA Sur',
      city: 'La Plata',
      sellerId: 'u-vendedor-3',
      sellerName: 'GamerStore Sur',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
      description: 'Consola con poquísimo uso. Incluye cables HDMI ultra speed, base de soporte y dos mandos DualSense.',
      createdAt: '2026-10-23T11:00:00Z',
      isFrozen: false,
      frozenReason: null,
      questions: []
    },
    {
      id: 'prod-6',
      title: 'Taladro Percutor Inalámbrico DeWalt 20V Max Brushless (Ocasión)',
      category: 'Herramientas y Construcción',
      price: 180000,
      condition: 'usado',
      brand: 'DeWalt',
      model: 'DCD796',
      serialNumber: 'DW-991823-AR',
      stock: 1,
      freeShipping: false,
      installments: 3,
      province: 'Buenos Aires - GBA Oeste',
      city: 'San Martín',
      sellerId: 'u-vendedor-4',
      sellerName: 'Remates y Oportunidades',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      description: 'Taladro DeWalt 20V funcionando perfecto. Se entrega solo la máquina sin valija plástica ni cargador por mudanza urgente.',
      createdAt: '2026-10-24T09:30:00Z',
      isFrozen: false,
      frozenReason: null,
      questions: []
    },
    {
      id: 'prod-7',
      title: 'Cámara Fotográfica Sony Alpha A7 III Mirrorless con Lente 28-70mm',
      category: 'Audio y Fotografía',
      price: 1850000,
      condition: 'usado',
      brand: 'Sony',
      model: 'Alpha A7 III',
      serialNumber: 'SN-4491028',
      stock: 1,
      freeShipping: true,
      installments: 12,
      province: 'Mendoza',
      city: 'Mendoza Capital',
      sellerId: 'u-vendedor',
      sellerName: 'Palermo Tech',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      description: 'Sensor full frame, 24MP, solo 18.000 disparos. Sensor limpio y calibrado. Incluye dos baterías.',
      createdAt: '2026-10-15T18:00:00Z',
      isFrozen: false,
      frozenReason: null,
      questions: []
    },
    {
      id: 'prod-8',
      title: 'Bicicleta Rodado 29 Raleigh Mojave 4.0 Frenos a Disco Shimano',
      category: 'Bicicletas y Movilidad',
      price: 620000,
      condition: 'nuevo',
      brand: 'Raleigh',
      model: 'Mojave 4.0',
      serialNumber: 'RAL-2024-55120M',
      frameNumber: 'RAL-2024-55120M',
      stock: 2,
      freeShipping: true,
      installments: 6,
      province: 'CABA',
      city: 'Caballito',
      sellerId: 'u-vendedor',
      sellerName: 'Palermo Tech',
      image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80',
      description: 'Bicicleta rodado 29 0km regulada y armada lista para rodar. Transmisión Shimano 24 velocidades.',
      createdAt: '2026-10-21T09:00:00Z',
      isFrozen: false,
      frozenReason: null,
      questions: []
    }
  ],
  securityReports: [
    {
      id: 'sec-rep-1',
      caseNumber: 'IPP-14-02-004921-26/00',
      court: 'UFI N° 2 Distrito Vicente López',
      policeStation: 'Comisaría Vicente López 1ra',
      incidentDate: '2026-10-12',
      victimName: 'Diego Morales',
      victimContact: '11-6677-8899',
      itemType: 'Bicicletas y Movilidad',
      brand: 'Venzo',
      model: 'Inferno 29',
      identifier: 'VNZ-2023-88419X', // Coincidencia exacta con prod-2
      identifierType: 'N° de Cuadro',
      province: 'Buenos Aires - GBA Norte',
      city: 'Vicente López',
      status: 'Búsqueda Activa', // 'Búsqueda Activa' | 'Bajo Investigación' | 'Recuperado'
      notes: 'Sustraída en bicisenda costanera. Asiento antiprostático Velo y portacaramañola color naranja fluo.',
      createdAt: '2026-10-13T11:20:00Z'
    },
    {
      id: 'sec-rep-2',
      caseNumber: 'EXP-88912/2026',
      court: 'Fiscalía Penal Correccional N° 7 CABA',
      policeStation: 'Comisaría Vecinal 14C (Palermo)',
      incidentDate: '2026-10-18',
      victimName: 'Construcciones del Sur SRL (Arq. Méndez)',
      victimContact: '11-4771-3322',
      itemType: 'Herramientas y Construcción',
      brand: 'DeWalt',
      model: 'DCD796',
      identifier: 'DW-991823-AR', // Coincidencia con prod-6
      identifierType: 'N° de Serie',
      province: 'CABA',
      city: 'Palermo',
      status: 'Búsqueda Activa',
      notes: 'Sustraído de baúl de camioneta. Se llevaron solo la máquina suelta sin su cargador ni valija plástica.',
      createdAt: '2026-10-19T09:40:00Z'
    },
    {
      id: 'sec-rep-3',
      caseNumber: 'IPP-09-01-002194-26/00',
      court: 'Juzgado Nacional en lo Criminal N° 5',
      policeStation: 'Comisaría Vecinal 13A (Belgrano)',
      incidentDate: '2026-10-05',
      victimName: 'Lucía Fernández',
      victimContact: '11-5491-0033',
      itemType: 'Celulares y Smartphones',
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      identifier: '354892110293847', // Coincide IMEI con prod-1
      identifierType: 'IMEI',
      province: 'CABA',
      city: 'Belgrano',
      status: 'Bajo Investigación',
      notes: 'Robo modalidad arrebato. Color Deep Purple. Pequeño detalle en marco superior derecho.',
      createdAt: '2026-10-06T15:10:00Z'
    }
  ],
  cart: [],
  orders: [
    {
      id: 'ORD-98210',
      date: '2026-10-25T14:30:00Z',
      items: [
        {
          productId: 'prod-8',
          title: 'Bicicleta Rodado 29 Raleigh Mojave 4.0',
          price: 620000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80'
        }
      ],
      total: 620000,
      paymentMethod: 'Mercado Pago (Transferencia)',
      shippingAddress: 'Av. Corrientes 3200, CABA',
      status: 'Aprobado - En camino'
    }
  ],
  auditLog: [
    {
      id: 'log-1',
      timestamp: '2026-10-26T18:00:00Z',
      user: 'Sistema',
      action: 'Inicialización de Base de Datos CompraFácil',
      details: 'Carga de datos semilla e inicialización del radar de seguridad.'
    }
  ]
};

class StateManager {
  constructor() {
    this.state = this._loadState();
    this._setupStorageSync();
  }

  _loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SEED, ...parsed };
      }
    } catch (e) {
      console.warn('Error leyendo localStorage, restableciendo estado semilla:', e);
    }
    this._persist(DEFAULT_SEED);
    return JSON.parse(JSON.stringify(DEFAULT_SEED));
  }

  _persist(newState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  _notify(action, payload) {
    this._persist(this.state);
    const event = new CustomEvent('comprafacil:statechange', {
      detail: {
        action,
        payload,
        state: this.state
      }
    });
    window.dispatchEvent(event);
  }

  _setupStorageSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          this.state = JSON.parse(e.newValue);
          window.dispatchEvent(new CustomEvent('comprafacil:statechange', {
            detail: { action: 'STORAGE_SYNC', state: this.state }
          }));
        } catch (err) {
          console.error('Error sincronizando pestañas:', err);
        }
      }
    });
  }

  // Lectura del Estado
  getState() {
    return this.state;
  }

  getCurrentUser() {
    return this.state.currentUser;
  }

  setCurrentUser(userOrRole) {
    if (typeof userOrRole === 'string') {
      const matched = this.state.users.find(u => u.role === userOrRole);
      if (matched) {
        this.state.currentUser = { ...matched };
      }
    } else if (userOrRole && userOrRole.id) {
      this.state.currentUser = { ...userOrRole };
    }
    this.addAuditLog('CAMBIO_USUARIO_ACTIVO', `Sesión cambiada a ${this.state.currentUser.name} (${this.state.currentUser.role})`);
    this._notify('USER_CHANGED', this.state.currentUser);
  }

  // Productos
  getProducts(includeFrozen = false) {
    if (includeFrozen) return this.state.products;
    return this.state.products.filter(p => !p.isFrozen);
  }

  getProductById(id) {
    return this.state.products.find(p => p.id === id);
  }

  addProduct(productData) {
    const newProduct = {
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
      isFrozen: false,
      frozenReason: null,
      stock: 1,
      questions: [],
      ...productData
    };
    this.state.products.unshift(newProduct);
    this.addAuditLog('PRODUCTO_PUBLICADO', `Publicación: "${newProduct.title}" (ID: ${newProduct.id}) por ${newProduct.sellerName}`);
    this._notify('PRODUCT_ADDED', newProduct);
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.products[idx] = { ...this.state.products[idx], ...updates };
      this.addAuditLog('PRODUCTO_MODIFICADO', `Modificación de producto ID: ${id}`);
      this._notify('PRODUCT_UPDATED', this.state.products[idx]);
      return this.state.products[idx];
    }
    return null;
  }

  deleteProduct(id) {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = this.state.products.splice(idx, 1)[0];
      this.addAuditLog('PRODUCTO_ELIMINADO', `Eliminado: "${deleted.title}" (ID: ${id})`);
      this._notify('PRODUCT_DELETED', { id });
      return true;
    }
    return false;
  }

  // Medida Cautelar Policial
  freezeProduct(id, reason, reportId = null) {
    const product = this.getProductById(id);
    if (product) {
      product.isFrozen = true;
      product.frozenReason = reason || 'Medida cautelar judicial por presunta coincidencia con objeto sustraído.';
      product.frozenAt = new Date().toISOString();
      product.frozenBy = this.state.currentUser.name;
      product.linkedReportId = reportId;

      this.addAuditLog(
        'MEDIDA_CAUTELAR_POLICIAL',
        `BLOQUEO JUDICIAL del producto "${product.title}" (ID: ${id}) por orden de: ${this.state.currentUser.name}. Causa: ${reason}`
      );
      this._notify('PRODUCT_FROZEN', product);
      return product;
    }
    return null;
  }

  unfreezeProduct(id) {
    const product = this.getProductById(id);
    if (product) {
      product.isFrozen = false;
      product.frozenReason = null;
      product.unfrozenAt = new Date().toISOString();
      this.addAuditLog('DESBLOQUEO_PRODUCTO', `Levantamiento de medida cautelar en producto ID: ${id}`);
      this._notify('PRODUCT_UNFROZEN', product);
      return product;
    }
    return null;
  }

  // Reportes y Denuncias de Seguridad
  getSecurityReports() {
    return this.state.securityReports;
  }

  addSecurityReport(reportData) {
    const newReport = {
      id: 'sec-rep-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Búsqueda Activa',
      ...reportData
    };
    this.state.securityReports.unshift(newReport);
    this.addAuditLog(
      'DENUNCIA_POLICIAL_INGRESADA',
      `Expediente Judicial: ${newReport.caseNumber} - Fiscalia: ${newReport.court}. Bien: ${newReport.brand} ${newReport.model} (${newReport.identifier})`
    );
    this._notify('REPORT_ADDED', newReport);
    return newReport;
  }

  updateSecurityReport(id, updates) {
    const idx = this.state.securityReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.state.securityReports[idx] = { ...this.state.securityReports[idx], ...updates };
      this.addAuditLog('DENUNCIA_POLICIAL_ACTUALIZADA', `Actualizado expediente ID: ${id}`);
      this._notify('REPORT_UPDATED', this.state.securityReports[idx]);
      return this.state.securityReports[idx];
    }
    return null;
  }

  // Carrito de Compras
  getCart() {
    return this.state.cart;
  }

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product || product.isFrozen) return false;

    const existingIndex = this.state.cart.findIndex(item => item.productId === productId);
    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += quantity;
    } else {
      this.state.cart.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity,
        sellerName: product.sellerName
      });
    }
    this._notify('CART_UPDATED', this.state.cart);
    return true;
  }

  updateCartQuantity(productId, quantity) {
    const item = this.state.cart.find(i => i.productId === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this._notify('CART_UPDATED', this.state.cart);
      }
    }
  }

  removeFromCart(productId) {
    this.state.cart = this.state.cart.filter(i => i.productId !== productId);
    this._notify('CART_UPDATED', this.state.cart);
  }

  clearCart() {
    this.state.cart = [];
    this._notify('CART_UPDATED', this.state.cart);
  }

  // Órdenes y Checkout
  createOrder(orderData) {
    const order = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      items: [...this.state.cart],
      total: this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'Aprobado - En preparación',
      buyer: this.state.currentUser,
      ...orderData
    };

    // Descontar stock
    order.items.forEach(item => {
      const prod = this.getProductById(item.productId);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    this.state.orders.unshift(order);
    this.clearCart();
    this.addAuditLog('COMPRA_CONCRETADA', `Nueva orden ${order.id} por un total de $${order.total}`);
    this._notify('ORDER_CREATED', order);
    return order;
  }

  // Preguntas y Respuestas
  addQuestion(productId, questionText) {
    const product = this.getProductById(productId);
    if (!product) return null;

    const newQuestion = {
      id: 'q-' + Date.now(),
      userId: this.state.currentUser.id,
      userName: this.state.currentUser.name,
      text: questionText,
      answer: null,
      createdAt: new Date().toISOString()
    };

    if (!product.questions) product.questions = [];
    product.questions.push(newQuestion);
    this._notify('QUESTION_ADDED', { productId, question: newQuestion });
    return newQuestion;
  }

  addAnswer(productId, questionId, answerText) {
    const product = this.getProductById(productId);
    if (!product || !product.questions) return null;

    const q = product.questions.find(item => item.id === questionId);
    if (q) {
      q.answer = answerText;
      q.answeredAt = new Date().toISOString();
      this._notify('ANSWER_ADDED', { productId, questionId, answer: answerText });
      return q;
    }
    return null;
  }

  // Auditoría
  addAuditLog(action, details, user = null) {
    const logEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: user || (this.state.currentUser ? this.state.currentUser.name : 'Anónimo'),
      action,
      details
    };
    if (!this.state.auditLog) this.state.auditLog = [];
    this.state.auditLog.unshift(logEntry);
    if (this.state.auditLog.length > 150) {
      this.state.auditLog.pop();
    }
  }

  // Restablecer Demo
  resetToDefaultSeed() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_SEED));
    this._persist(this.state);
    this._notify('STATE_RESET', this.state);
  }

  // Utilidades de Formato Argentino
  formatARS(amount) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export const state = new StateManager();
