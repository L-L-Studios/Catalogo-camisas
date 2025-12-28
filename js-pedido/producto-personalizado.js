/* =====================================================
   producto_personalizado.js — CONTACTO / PEDIDOS PERSONALIZADOS
===================================================== */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  // Configurar SweetAlert toast no invasivo
  const toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
    customClass: { popup: "swal-toast-avenir" }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const btnEnviar = document.getElementById("btn-enviar");
    const nombre = form.name.value.trim();
    const email = form.email.value.trim();
    const mensaje = form.message.value.trim();

    // Validación básica
    if (!nombre || !email || !mensaje) {
      toast.fire({ 
        icon: "info", 
        title: "Todos los campos son obligatorios" 
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.fire({ 
        icon: "warning", 
        title: "Por favor ingresa un email válido" 
      });
      return;
    }

    // Validar longitud del mensaje
    if (mensaje.length < 10) {
      toast.fire({ 
        icon: "info", 
        title: "El mensaje debe tener al menos 10 caracteres" 
      });
      return;
    }

    // Deshabilitar botón durante el envío
    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    try {
      const { error } = await window.supabase
        .from("pedidos_personalizados")
        .insert([
          {
            nombre,
            email: email.toLowerCase(),
            mensaje,
            status: "pendiente"
          }
        ]);

      if (error) throw error;

      toast.fire({ 
        icon: "success", 
        title: "Mensaje enviado correctamente" 
      });

      form.reset();

    } catch (err) {
      console.error("Error enviando mensaje:", err);
      toast.fire({ 
        icon: "error", 
        title: "Error al enviar el mensaje" 
      });
    } finally {
      // Restaurar botón
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar";
    }
  });
});
