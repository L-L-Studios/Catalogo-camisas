// pedido_camisa_supabase.js - VERSIÓN CON ENVÍO DE CORREOS
document.addEventListener('DOMContentLoaded', function() {
  if (window.__pedido_registrado__) return;
  window.__pedido_registrado__ = true;

  const btnPedido = document.getElementById("btnPedido") || 
                    document.getElementById("btnPedidoCarrito");

  if (!btnPedido) return;

  // Configurar SweetAlert toast
  const toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
    customClass: { popup: "swal-toast-avenir" }
  });

  // Función para validar datos del carrito
  function validarDatosCarrito() {
    const nombre = document.getElementById("pedidoNombre")?.value.trim();
    const email = document.getElementById("pedidoEmail")?.value.trim();
    const direccion = document.getElementById("pedidoDireccion")?.value.trim();
    const whatsapp = document.getElementById("pedidoWhatsapp")?.value.trim();

    if (!nombre || !email || !direccion || !whatsapp) {
      return { valido: false, mensaje: "Completa todos los datos del pedido" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valido: false, mensaje: "Ingresa un email válido" };
    }

    return { valido: true, datos: { nombre, email, direccion, whatsapp } };
  }

  // Configurar evento del botón
  btnPedido.onclick = async () => {
    const camisas = JSON.parse(localStorage.getItem("camisas_seleccionadas")) || [];
    
    if (!camisas.length) {
      toast.fire({ 
        icon: "info", 
        title: "Selecciona al menos una camisa" 
      });
      return;
    }

    // Validar datos del formulario
    const validacion = validarDatosCarrito();
    if (!validacion.valido) {
      toast.fire({ 
        icon: "warning", 
        title: validacion.mensaje 
      });
      return;
    }

    const { nombre, email, direccion, whatsapp } = validacion.datos;
    const metodoPago = document.getElementById("pedidoPago")?.value || "efectivo";

    // Calcular total
    const total = camisas.reduce((sum, item) => {
      return sum + (item.precio * item.cantidad);
    }, 0);

    // Mostrar resumen del pedido
    const confirm = await Swal.fire({
      title: "¿Confirmar pedido?",
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>${nombre}</strong></p>
          <p>📧 ${email}</p>
          <p>📱 ${whatsapp}</p>
          <p>📍 ${direccion}</p>
          <p>💰 ${metodoPago === 'efectivo' ? 'Pago en efectivo' : 'Transferencia'}</p>
          <hr style="margin: 10px 0">
          <h4>Camisas (${camisas.reduce((sum, item) => sum + item.cantidad, 0)} unidades):</h4>
          <ul style="margin-left: 20px; margin-bottom: 10px;">
            ${camisas.map(item => {
              let extraInfo = '';
              if (item.costo_extra) {
                extraInfo = `<br><small><em>Extra: ${item.costo_extra}</em></small>`;
              }
              return `<li>${item.nombre} (${item.talla}, ${item.color}) x${item.cantidad}${extraInfo}</li>`;
            }).join('')}
          </ul>
          <p><strong>Total: $${total.toFixed(2)}</strong></p>
          <hr style="margin: 10px 0">
          <p style="font-size: 12px; color: #666;">
            Se enviará una confirmación a tu correo y al administrador.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar pedido",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#CB2D2D",
      cancelButtonColor: "#6c757d",
      customClass: { popup: 'swal2-popup' },
      width: '500px'
    });

    if (!confirm.isConfirmed) return;

    // Procesar pedido
    try {
      // 1. Guardar en Supabase
      if (!window.supabase) {
        throw new Error("Supabase no disponible");
      }

      // Generar número de pedido
      const numeroPedido = 'VRX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      
      // Insertar en Supabase CON el campo costo_extra
      const { error: supabaseError } = await window.supabase
        .from("pedidos_camisas")
        .insert({
          nombre,
          email: email.toLowerCase(),
          direccion,
          whatsapp,
          metodo_pago: metodoPago,
          camisas: JSON.stringify(camisas.map(item => ({
            ...item,
            costo_extra: item.costo_extra || null
          }))),
          total: total.toFixed(2),
          costo_extra: camisas.some(item => item.costo_extra) ? 
            "Este pedido contiene modificaciones adicionales" : null,
          estado: "pendiente",
          created_at: new Date().toISOString()
        });

      if (supabaseError) throw supabaseError;

      // 2. Enviar correos si la función existe
      let correoEnviado = false;
      if (window.enviarCorreosPedido && typeof window.enviarCorreosPedido === 'function') {
        const resultadoCorreo = await window.enviarCorreosPedido({
          nombre,
          email,
          direccion,
          whatsapp,
          metodo_pago: metodoPago,
          camisas,
          total: total.toFixed(2),
          numero_pedido: numeroPedido
        });
        
        correoEnviado = resultadoCorreo.success;
      }

      // 3. Mostrar confirmación
      Swal.fire({
        icon: "success",
        title: "¡Pedido realizado!",
        html: `
          <div style="text-align: left; font-size: 14px;">
            <p><strong>Número de pedido:</strong> ${numeroPedido}</p>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
            ${correoEnviado ? 
              '<p>✅ Se envió una confirmación a tu correo</p>' : 
              '<p>⚠️ El pedido se guardó, pero no se pudo enviar el correo</p>'}
            <p style="margin-top: 15px; font-size: 12px; color: #666;">
              Nos pondremos en contacto contigo dentro de las próximas 24 horas.
            </p>
          </div>
        `,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#CB2D2D",
        customClass: { popup: 'swal2-popup' },
        width: '500px'
      });

      // 4. Limpiar carrito
      localStorage.removeItem("camisas_seleccionadas");
      window.dispatchEvent(new CustomEvent("camisas:update"));
      
      // 5. Limpiar formulario
      const inputs = ["pedidoNombre", "pedidoEmail", "pedidoDireccion", "pedidoWhatsapp"];
      inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
      });
      
      // 6. Cerrar carrito
      if (window.toggleCarrito) {
        toggleCarrito(false);
      }

    } catch (error) {
      console.error("Error en el pedido:", error);
      
      let mensajeError = "No se pudo completar el pedido. Intenta nuevamente.";
      if (error.message.includes("duplicate") || error.code === "23505") {
        mensajeError = "Ya tienes un pedido pendiente con este correo";
      }
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#CB2D2D",
        customClass: { popup: 'swal2-popup' }
      });
    }
  };
});