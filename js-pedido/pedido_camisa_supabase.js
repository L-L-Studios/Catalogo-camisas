// pedido_camisa_supabase.js - VERSIÓN MEJORADA CON VALIDACIÓN
document.addEventListener('DOMContentLoaded', function() {
  if (window.__pedido_registrado__) return;
  window.__pedido_registrado__ = true;

  const btnPedido = document.getElementById("btnPedidoCarrito") || 
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

    // Confirmación antes de enviar
    const confirm = await Swal.fire({
      title: "¿Confirmar pedido?",
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>${nombre}</strong></p>
          <p>📧 ${email}</p>
          <p>📱 ${whatsapp}</p>
          <p>📍 ${direccion}</p>
          <hr style="margin: 10px 0">
          <h4>Camisas:</h4>
          <ul style="margin-left: 20px; margin-bottom: 10px;">
            ${camisas.map(item => 
              `<li>${item.nombre} (${item.talla}, ${item.color}) x${item.cantidad}</li>`
            ).join('')}
          </ul>
          <p><strong>Total: $${total.toFixed(2)}</strong></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar pedido",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#CB2D2D",
      customClass: { popup: 'swal2-popup' }
    });

    if (!confirm.isConfirmed) return;

    // Mostrar loading
    Swal.fire({
      title: "Enviando pedido...",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Verificar que Supabase esté disponible
      if (!window.supabase) {
        throw new Error("Supabase no disponible");
      }

      const { error } = await window.supabase
        .from("pedidos_camisas")
        .insert({
          nombre,
          email: email.toLowerCase(),
          direccion,
          whatsapp,
          metodo_pago: metodoPago,
          camisas: JSON.stringify(camisas),
          total: total.toFixed(2),
          estado: "pendiente",
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "¡Pedido enviado!",
        text: "Te contactaremos pronto para confirmar",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'swal2-popup' }
      });

      // Limpiar carrito
      localStorage.removeItem("camisas_seleccionadas");
      window.dispatchEvent(new CustomEvent("camisas:update"));
      
      // Limpiar formulario
      if (document.getElementById("pedidoNombre")) document.getElementById("pedidoNombre").value = "";
      if (document.getElementById("pedidoEmail")) document.getElementById("pedidoEmail").value = "";
      if (document.getElementById("pedidoDireccion")) document.getElementById("pedidoDireccion").value = "";
      if (document.getElementById("pedidoWhatsapp")) document.getElementById("pedidoWhatsapp").value = "";
      
      // Cerrar carrito
      if (window.toggleCarrito) {
        toggleCarrito(false);
      }

    } catch (error) {
      console.error("Error enviando pedido:", error);
      
      let mensajeError = "No se pudo enviar el pedido. Intenta nuevamente.";
      if (error.message.includes("duplicate") || error.code === "23505") {
        mensajeError = "Ya tienes un pedido pendiente con este correo";
      }
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
        customClass: { popup: 'swal2-popup' }
      });
    }
  };
});