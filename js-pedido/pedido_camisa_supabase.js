// pedido_camisa_supabase.js - VERSIÓN CORREGIDA
document.addEventListener('DOMContentLoaded', function() {
  if (window.__pedido_registrado__) return;
  window.__pedido_registrado__ = true;

  const btnPedido = document.getElementById("btnPedidoCarrito");
  
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

  // Generar token único para confirmación
  function generarTokenConfirmacion() {
    return 'VRX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
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
      title: "Confirmar pedido",
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>${nombre}</strong></p>
          <p>📧 ${email}</p>
          <p>📱 ${whatsapp}</p>
          <p>📍 ${direccion}</p>
          <p>💰 ${metodoPago === 'efectivo' ? 'Pago en efectivo' : 'Transferencia'}</p>
          <hr style="margin: 10px 0">
          <h5>Camisas (${camisas.reduce((sum, item) => sum + item.cantidad, 0)} unidades):</h5>
          <div style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;">
            ${camisas.map(item => {
              let extraInfo = '';
              if (item.costo_extra) {
                extraInfo = `<br><small><em>Extra: ${item.costo_extra}</em></small>`;
              }
              return `<p style="margin: 5px 0;">• ${item.nombre} (${item.talla}, ${item.color}) x${item.cantidad}${extraInfo}</p>`;
            }).join('')}
          </div>
          <p><strong>Total: $${total.toFixed(2)} USD</strong></p>
          <hr style="margin: 10px 0">
          <p style="font-size: 12px; color: #666;">
            Se enviará un correo de confirmación a ${email}
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Enviar confirmación",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#CB2D2D",
      cancelButtonColor: "#6c757d",
      customClass: { popup: 'swal2-popup' },
      width: '500px'
    });

    if (!confirm.isConfirmed) return;

    // Mostrar loading
    Swal.fire({
      title: "Preparando confirmación...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Generar token de confirmación
      const tokenConfirmacion = generarTokenConfirmacion();
      
      // Crear URL de confirmación
      const linkConfirmacion = `${window.location.origin}/confirmar-pedido.html?token=${tokenConfirmacion}`;
      
      // Preparar datos para el correo
      const datosCorreo = {
        nombre,
        email,
        direccion,
        whatsapp,
        metodo_pago: metodoPago,
        camisas,
        total: total.toFixed(2),
        token_confirmacion: tokenConfirmacion,
        link_confirmacion: linkConfirmacion
      };
      
      // Guardar pedido temporalmente en localStorage
      const pedidoTemporal = {
        ...datosCorreo,
        fecha_creacion: new Date().toISOString(),
        expira: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };
      
      localStorage.setItem('pedido_pendiente_confirmacion', JSON.stringify(pedidoTemporal));
      
      // Enviar correo de confirmación
      if (window.enviarCorreoConfirmacion && typeof window.enviarCorreoConfirmacion === 'function') {
        const resultadoCorreo = await window.enviarCorreoConfirmacion(datosCorreo);
        
        if (!resultadoCorreo.success) {
          throw new Error('No se pudo enviar el correo de confirmación');
        }

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "¡Correo enviado!",
          html: `
            <div style="text-align: left; font-size: 14px;">
              <p>Se ha enviado un correo a <strong>${email}</strong> con el enlace de confirmación.</p>
              <p><strong>Instrucciones:</strong></p>
              <ol style="text-align: left; margin-left: 20px;">
                <li>Revisa tu bandeja de entrada (y spam/correo no deseado)</li>
                <li>Haz clic en el botón "Confirmar Pedido" del correo</li>
                <li>Tu pedido se registrará automáticamente</li>
              </ol>
              <p style="margin-top: 15px; font-size: 12px; color: #666;">
                ⚠️ El pedido expirará en 24 horas si no se confirma.
              </p>
            </div>
          `,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#CB2D2D",
          customClass: { popup: 'swal2-popup' },
          width: '500px'
        });

        // Limpiar carrito y formulario
        localStorage.removeItem("camisas_seleccionadas");
        window.dispatchEvent(new CustomEvent("camisas:update"));
        
        // Limpiar formulario
        const inputs = ["pedidoNombre", "pedidoEmail", "pedidoDireccion", "pedidoWhatsapp"];
        inputs.forEach(id => {
          const input = document.getElementById(id);
          if (input) input.value = "";
        });
        
        // Cerrar carrito
        if (window.toggleCarrito) {
          toggleCarrito(false);
        }

      } else {
        throw new Error('Función de envío de correo no disponible');
      }

    } catch (error) {
      console.error("Error en el proceso de confirmación:", error);
      
      // Eliminar pedido temporal si hubo error
      localStorage.removeItem('pedido_pendiente_confirmacion');
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar la confirmación. Intenta nuevamente.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#CB2D2D",
        customClass: { popup: 'swal2-popup' }
      });
    }
  };
});