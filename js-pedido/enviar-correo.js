// enviar-correo.js - Sistema de envío de correos con EmailJS
console.log('📧 Cargando sistema de correos...');

(function() {
  // Configuración de EmailJS (gratis)
  const EMAILJS_USER_ID = 'YOUR_USER_ID'; // Cambiar por tu User ID de EmailJS
  const EMAILJS_SERVICE_ID = 'service_vrx_pedidos'; // Crear este servicio en EmailJS
  const EMAILJS_TEMPLATE_ID = 'template_pedido_vrx'; // Crear este template en EmailJS
  
  // Verificar si EmailJS está disponible
  if (typeof emailjs === 'undefined') {
    console.log('📧 Cargando EmailJS...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      console.log('✅ EmailJS cargado');
      emailjs.init(EMAILJS_USER_ID);
    };
    document.head.appendChild(script);
  }
  
  // Función para enviar correo de confirmación al cliente
  window.enviarCorreoCliente = async function(datosPedido) {
    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID + '_cliente', // Template para cliente
        {
          nombre_cliente: datosPedido.nombre,
          email_cliente: datosPedido.email,
          numero_pedido: datosPedido.numero_pedido || Date.now(),
          fecha_pedido: new Date().toLocaleDateString('es-MX'),
          hora_pedido: new Date().toLocaleTimeString('es-MX'),
          total_pedido: `$${parseFloat(datosPedido.total).toFixed(2)}`,
          direccion_entrega: datosPedido.direccion,
          whatsapp_cliente: datosPedido.whatsapp,
          metodo_pago: datosPedido.metodo_pago,
          lista_camisas: datosPedido.camisas.map(item => 
            `• ${item.nombre} (Talla: ${item.talla}, Color: ${item.color}, Cantidad: ${item.cantidad})${item.costo_extra ? ` - Extra: ${item.costo_extra}` : ''}`
          ).join('<br>'),
          instrucciones_contacto: 'Nos pondremos en contacto contigo dentro de las próximas 24 horas para confirmar disponibilidad y detalles de pago.',
          link_contacto: 'https://wa.me/5211234567890' // Cambiar por tu WhatsApp
        }
      );
      
      console.log('✅ Correo enviado al cliente:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correo al cliente:', error);
      return false;
    }
  };
  
  // Función para enviar correo al administrador
  window.enviarCorreoAdmin = async function(datosPedido) {
    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID + '_admin', // Template para admin
        {
          numero_pedido: datosPedido.numero_pedido || Date.now(),
          fecha_hora: new Date().toLocaleString('es-MX'),
          cliente_nombre: datosPedido.nombre,
          cliente_email: datosPedido.email,
          cliente_whatsapp: datosPedido.whatsapp,
          cliente_direccion: datosPedido.direccion,
          total_pedido: `$${parseFloat(datosPedido.total).toFixed(2)}`,
          metodo_pago: datosPedido.metodo_pago,
          detalle_pedido: datosPedido.camisas.map(item => 
            `🛒 ${item.cantidad}x ${item.nombre} | Talla: ${item.talla} | Color: ${item.color}${item.costo_extra ? ` | Extra: ${item.costo_extra}` : ''} | $${(item.precio * item.cantidad).toFixed(2)}`
          ).join('<br><br>'),
          subtotal: `$${parseFloat(datosPedido.total).toFixed(2)}`,
          estado_pedido: 'PENDIENTE',
          link_panel: 'https://app.supabase.com' // Link al panel de Supabase
        }
      );
      
      console.log('✅ Correo enviado al admin:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correo al admin:', error);
      return false;
    }
  };
  
  // Función principal para enviar ambos correos
  window.enviarCorreosPedido = async function(datosPedido) {
    // Generar número de pedido único
    const numeroPedido = 'VRX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    datosPedido.numero_pedido = numeroPedido;
    
    // Mostrar loading
    Swal.fire({
      title: "Enviando confirmación...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      // Enviar correo al administrador
      const adminEnviado = await enviarCorreoAdmin(datosPedido);
      
      if (!adminEnviado) {
        throw new Error('No se pudo enviar el correo al administrador');
      }
      
      // Enviar correo al cliente
      const clienteEnviado = await enviarCorreoCliente(datosPedido);
      
      if (!clienteEnviado) {
        console.warn('⚠️ No se pudo enviar correo al cliente, pero el pedido se registró');
      }
      
      return {
        success: true,
        numero_pedido: numeroPedido,
        correo_cliente_enviado: clienteEnviado,
        correo_admin_enviado: adminEnviado
      };
      
    } catch (error) {
      console.error('❌ Error en envío de correos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  console.log('✅ Sistema de correos configurado');
})();