// enviar-correo.js - VERSIÓN CORREGIDA FINAL
console.log('📧 Cargando sistema de correos...');

(function() {
  // === CONFIGURACIÓN EMAILJS ===
  const EMAILJS_USER_ID = '3OTktLhSaXJkgGTcX';
  const EMAILJS_SERVICE_ID = 'pedido_vrx_cliente';
  const EMAILJS_TEMPLATE_CONFIRMACION = 'template_x3ow6r4';
  
  // Estado de inicialización
  let emailjsReady = false;
  
  // Inicializar EmailJS
  function inicializarEmailJS() {
    if (typeof emailjs === 'undefined') {
      console.log('📧 Cargando librería EmailJS...');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.onload = () => {
        console.log('✅ EmailJS cargado, inicializando...');
        try {
          emailjs.init(EMAILJS_USER_ID);
          emailjsReady = true;
          console.log('✅ EmailJS inicializado correctamente');
        } catch (error) {
          console.error('❌ Error inicializando EmailJS:', error);
        }
      };
      document.head.appendChild(script);
    } else {
      emailjsReady = true;
    }
  }
  
  // Función para enviar correo de confirmación
  window.enviarCorreoConfirmacion = async function(datosPedido) {
    try {
      console.log('📤 Preparando envío de correo de confirmación...');
      
      // Validación crítica de todos los datos necesarios
      const datosRequeridos = ['email', 'nombre', 'whatsapp', 'direccion', 'link_confirmacion'];
      datosRequeridos.forEach(dato => {
        if (!datosPedido[dato] || datosPedido[dato].trim() === '') {
          throw new Error(`Falta el dato requerido: ${dato}`);
        }
      });
      
      if (!datosPedido.email.includes('@')) {
        throw new Error(`Email inválido: ${datosPedido.email}`);
      }
      
      // Esperar EmailJS
      if (!emailjsReady) {
        await new Promise(resolve => {
          const check = setInterval(() => {
            if (emailjsReady) {
              clearInterval(check);
              resolve();
            }
          }, 100);
        });
      }
      
      // Formatear productos para el HTML - MÁS SIMPLE Y SEGURO
      const productosHTML = datosPedido.camisas.map(item => {
        const subtotal = (item.precio * item.cantidad).toFixed(2);
        let extraHTML = '';
        if (item.costo_extra && item.costo_extra.trim() !== '') {
          extraHTML = `<div style="color: #e65100; font-style: italic; margin-top: 5px;">✏️ Extra: ${item.costo_extra}</div>`;
        }
        
        return `
          <div style="margin-bottom: 15px; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #CB2D2D;">
            <div style="font-weight: bold; color: #333; font-size: 16px;">${item.nombre}</div>
            <div style="color: #666; margin: 8px 0;">
              <span style="display: inline-block; margin-right: 10px;">📏 Talla: ${item.talla}</span>
              <span style="display: inline-block; margin-right: 10px;">🎨 Color: ${item.color}</span>
              <span style="display: inline-block;">📦 Cantidad: ${item.cantidad}</span>
            </div>
            ${extraHTML}
            <div style="text-align: right; font-weight: bold; color: #CB2D2D; font-size: 16px;">
              $${subtotal} USD
            </div>
          </div>
        `;
      }).join('');
      
      // Calcular total
      const total = datosPedido.camisas.reduce((sum, item) => 
        sum + (item.precio * item.cantidad), 0
      ).toFixed(2);
      
      // Fecha y hora
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString('es-ES');
      const hora = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      // Y ASEGÚRATE DE QUE ESTAS VARIABLES SIEMPRE TENGAN VALOR:
      const templateParams = {
        email: datosPedido.email,
        
        // VARIABLES PRINCIPALES - NUNCA VACÍAS
        order_id: datosPedido.token_confirmacion ? datosPedido.token_confirmacion.substring(0, 10) : 'VRX-' + Date.now(),
        customer_name: datosPedido.nombre || 'Cliente',
        customer_email: datosPedido.email || 'No especificado',
        customer_phone: datosPedido.whatsapp || 'No especificado',
        shipping_address: datosPedido.direccion || 'No especificada',
        payment_method: datosPedido.metodo_pago === 'efectivo' ? 'Pago en Efectivo' : datosPedido.metodo_pago || 'Transferencia',
        order_date: fecha,
        order_time: hora,
        order_items: productosHTML,
        order_total: `$${total} USD`,
        confirmation_link: datosPedido.link_confirmacion,
        
        // VARIABLES DE CONTACTO
        whatsapp_number: datosPedido.whatsapp || 'No disponible',
        whatsapp_contact: datosPedido.whatsapp ? `https://wa.me/${datosPedido.whatsapp.replace(/\D/g, '')}` : '#',
        
        // AÑO ACTUAL (SIEMPRE TIENE VALOR)
        year: new Date().getFullYear().toString()
      };
      
      console.log('📤 Enviando correo con TODAS las variables:', {
        emailDestino: templateParams.email,
        nombre: templateParams.customer_name,
        total: templateParams.order_total,
        linkConfirmacion: templateParams.confirmation_link,
        whatsapp: templateParams.customer_phone
      });
      
      // Validar que las variables críticas no estén vacías
      const variablesCriticas = ['email', 'customer_name', 'confirmation_link', 'order_total'];
      variablesCriticas.forEach(variable => {
        if (!templateParams[variable] || templateParams[variable].trim() === '') {
          throw new Error(`Variable crítica vacía: ${variable} = ${templateParams[variable]}`);
        }
      });
      
      // Enviar correo
      console.log('📤 Ejecutando emailjs.send...');
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_CONFIRMACION,
        templateParams
      );
      
      console.log('✅ ¡Correo enviado exitosamente! Estado:', response.status);
      return { 
        success: true, 
        message: 'Correo de confirmación enviado',
        response: response 
      };
      
    } catch (error) {
      console.error('❌ ERROR DETALLADO:', {
        status: error.status,
        text: error.text,
        message: error.message
      });
      
      return { 
        success: false, 
        error: error.text || 'Error al enviar correo',
        status: error.status
      };
    }
  };
  
  // Inicializar
  inicializarEmailJS();
  
  console.log('✅ Sistema de correos listo para usar');
})();