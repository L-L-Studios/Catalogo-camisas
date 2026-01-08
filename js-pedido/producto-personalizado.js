/* =====================================================
   producto-personalizado.js 
   - Envía pedidos con imágenes a Supabase
   - Validaciones mejoradas
   - Límite de 1 pedido por correo cada 24 horas
   - Selección de tallas
===================================================== */

document.addEventListener('DOMContentLoaded', function() {
  // Elementos del formulario
  const form = document.getElementById("contactForm");
  if (!form) return;

  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const messageInput = form.querySelector('textarea[name="message"]');
  const btnEnviar = document.getElementById("btn-enviar");
  const inputImg = document.getElementById("input-img");
  const previewImg = document.getElementById("preview-img");
  const imgBox = document.getElementById("img-box");
  const tallaInput = document.getElementById("talla-input");
  const tallaError = document.getElementById("talla-error");
  const tallaSeleccionadaDisplay = document.getElementById("talla-seleccionada-display");
  const tallaSeleccionadaText = document.getElementById("talla-seleccionada-text");
  const cambiarTallaBtn = document.getElementById("cambiar-talla");
  
  let imagenSeleccionada = null;
  let tallaSeleccionada = '';
  let tallaTouched = false;

  // Configuración
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const LIMITE_HORAS = 24;
  const TALLAS_DISPONIBLES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  // Validaciones Regex
  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Variables para controlar si el usuario ya interactuó con los campos
  let nameTouched = false;
  let emailTouched = false;
  let messageTouched = false;
  let imageTouched = false;

  // Inicializar sistema de tallas
  function inicializarTallas() {
    // Seleccionar todos los elementos de talla
    const tallas = document.querySelectorAll('.talla');
    
    tallas.forEach(talla => {
      talla.addEventListener('click', function() {
        const nuevaTalla = this.getAttribute('data-talla');
        
        // Si ya está seleccionada, deseleccionar
        if (tallaSeleccionada === nuevaTalla) {
          deseleccionarTalla();
          tallaTouched = true;
          validateTalla();
          return;
        }
        
        // Deseleccionar todas las tallas
        tallas.forEach(t => t.classList.remove('seleccionada'));
        
        // Seleccionar la nueva talla
        this.classList.add('seleccionada');
        tallaSeleccionada = nuevaTalla;
        tallaInput.value = nuevaTalla;
        
        // Actualizar display
        tallaSeleccionadaText.textContent = nuevaTalla;
        tallaSeleccionadaDisplay.classList.add('visible');
        
        // Validar
        tallaTouched = true;
        validateTalla();
      });
    });
    
    // Botón para cambiar talla
    if (cambiarTallaBtn) {
      cambiarTallaBtn.addEventListener('click', function() {
        deseleccionarTalla();
        tallaTouched = true;
        validateTalla();
      });
    }
  }
  
  // Deseleccionar talla
  function deseleccionarTalla() {
    const tallas = document.querySelectorAll('.talla');
    tallas.forEach(t => t.classList.remove('seleccionada'));
    tallaSeleccionada = '';
    tallaInput.value = '';
    tallaSeleccionadaDisplay.classList.remove('visible');
  }

  // Validación de talla
  function validateTalla() {
    if (!tallaSeleccionada) {
      setError(tallaError, "Por favor, selecciona una talla");
      return false;
    }
    setValid(tallaError);
    return true;
  }

  // Generar UUID único
  function generarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Obtener hora actual de El Salvador (UTC-6)
  function obtenerHoraElSalvador() {
    const ahora = new Date();
    const offset = -6 * 60;
    const horaLocal = new Date(ahora.getTime() + offset * 60000);
    return horaLocal;
  }

  // Formatear fecha para mostrar al usuario
  function formatearFechaHora(date) {
    return date.toLocaleString('es-SV', {
      timeZone: 'America/El_Salvador',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Verificar si el correo puede enviar otro pedido
  async function verificarLimiteCorreo(email) {
    try {
      if (!window.supabase) {
        throw new Error('Error de conexión. Recarga la página.');
      }

      const ahoraElSalvador = obtenerHoraElSalvador();
      const limiteFecha = new Date(ahoraElSalvador);
      limiteFecha.setHours(limiteFecha.getHours() - LIMITE_HORAS);

      const { data, error } = await window.supabase
        .from('pedidos_personalizados')
        .select('created_at')
        .eq('email', email.toLowerCase())
        .gte('created_at', limiteFecha.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const ultimoPedido = new Date(data[0].created_at);
        const horasTranscurridas = Math.floor((ahoraElSalvador - ultimoPedido) / (1000 * 60 * 60));
        const horasRestantes = LIMITE_HORAS - horasTranscurridas;

        const siguientePedido = new Date(ultimoPedido);
        siguientePedido.setHours(siguientePedido.getHours() + LIMITE_HORAS);

        return {
          puedeEnviar: false,
          ultimoPedido: ultimoPedido,
          siguientePedido: siguientePedido,
          horasRestantes: horasRestantes,
          mensaje: `Ya has enviado un pedido recientemente. Podrás enviar otro en ${horasRestantes} hora${horasRestantes !== 1 ? 's' : ''}.`
        };
      }

      return {
        puedeEnviar: true,
        mensaje: 'Puede enviar el pedido.'
      };

    } catch (error) {
      console.error('Error verificando límite:', error);
      return {
        puedeEnviar: true,
        error: error.message
      };
    }
  }

  // Vista previa de imagen
  inputImg.addEventListener("change", function() {
    const file = inputImg.files[0];
    imageTouched = true;
    
    if (!file) {
      validateImage();
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      mostrarToast('error', 'La imagen debe ser menor a 5MB');
      resetImagen();
      validateImage();
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      mostrarToast('error', 'Formato no válido. Use JPG, PNG o GIF');
      resetImagen();
      validateImage();
      return;
    }

    imagenSeleccionada = file;
    const objectURL = URL.createObjectURL(file);
    previewImg.src = objectURL;
    previewImg.style.display = 'block';
    previewImg.hidden = false;
    imgBox.classList.add("has-img");

    previewImg.onload = function() {
      URL.revokeObjectURL(objectURL);
      previewImg.style.width = '100%';
      previewImg.style.height = 'auto';
      previewImg.style.maxHeight = '200px';
      previewImg.style.objectFit = 'contain';
      previewImg.style.borderRadius = '5px';
    };
    
    validateImage();
  });

  // Resetear imagen
  function resetImagen() {
    inputImg.value = '';
    imagenSeleccionada = null;
    previewImg.src = '';
    previewImg.style.display = 'none';
    previewImg.hidden = true;
    imgBox.classList.remove("has-img");
  }

  // Función para mostrar toast
  function mostrarToast(icon, msg) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title: msg,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  // Validaciones de formulario
  function setError(element, msg) {
    if (element.id === 'talla-error') {
      // Manejo especial para el error de talla
      element.textContent = msg;
      element.classList.add("active");
      return;
    }
    
    const error = element.nextElementSibling;
    if (error && error.classList.contains('error-msg')) {
      error.textContent = msg;
      element.classList.add("error");
      element.classList.remove("valid");
      
      if (element === nameInput && nameTouched) error.classList.add("active");
      if (element === emailInput && emailTouched) error.classList.add("active");
      if (element === messageInput && messageTouched) error.classList.add("active");
      if (element === inputImg && imageTouched) error.classList.add("active");
    }
  }

  function setValid(element) {
    if (element.id === 'talla-error') {
      element.textContent = "";
      element.classList.remove("active");
      return;
    }
    
    const error = element.nextElementSibling;
    if (error && error.classList.contains('error-msg')) {
      error.textContent = "";
      error.classList.remove("active");
      element.classList.remove("error");
      element.classList.add("valid");
    }
  }

  // Validaciones individuales
  function validateName() {
    const val = nameInput.value.trim();
    if (!val) {
      setError(nameInput, "El nombre es obligatorio");
      return false;
    }
    if (!regexNombre.test(val)) {
      setError(nameInput, "Nombre no válido (2-50 letras)");
      return false;
    }
    setValid(nameInput);
    return true;
  }

  function validateEmail() {
    const val = emailInput.value.trim();
    if (!val) {
      setError(emailInput, "El correo es obligatorio");
      return false;
    }
    if (!regexEmail.test(val)) {
      setError(emailInput, "Correo electrónico no válido");
      return false;
    }
    setValid(emailInput);
    return true;
  }

  function validateMessage() {
    const val = messageInput.value.trim();
    if (val.length < 10) {
      setError(messageInput, "El mensaje debe tener al menos 10 caracteres");
      return false;
    }
    if (val.length > 1000) {
      setError(messageInput, "El mensaje es demasiado largo (máx. 1000 caracteres)");
      return false;
    }
    setValid(messageInput);
    return true;
  }

  function validateImage() {
    if (!imagenSeleccionada) {
      setError(inputImg, "La imagen de referencia es obligatoria");
      return false;
    }
    setValid(inputImg);
    return true;
  }

  // Validar todo el formulario (para submit)
  function validateForm() {
    nameTouched = true;
    emailTouched = true;
    messageTouched = true;
    imageTouched = true;
    tallaTouched = true;
    
    const nameOk = validateName();
    const emailOk = validateEmail();
    const messageOk = validateMessage();
    const imageOk = validateImage();
    const tallaOk = validateTalla();
    
    return nameOk && emailOk && messageOk && imageOk && tallaOk;
  }

  // Eventos de validación en tiempo real
  nameInput.addEventListener("input", function() {
    nameTouched = true;
    validateName();
  });
  
  emailInput.addEventListener("input", function() {
    emailTouched = true;
    validateEmail();
  });
  
  messageInput.addEventListener("input", function() {
    messageTouched = true;
    validateMessage();
  });
  
  inputImg.addEventListener("change", function() {
    imageTouched = true;
    if (imagenSeleccionada) {
      setValid(inputImg);
    } else {
      validateImage();
    }
  });

  nameInput.addEventListener("blur", function() {
    nameTouched = true;
    validateName();
  });
  
  emailInput.addEventListener("blur", function() {
    emailTouched = true;
    validateEmail();
  });
  
  messageInput.addEventListener("blur", function() {
    messageTouched = true;
    validateMessage();
  });

  // Subir imagen a Supabase Storage
  async function subirImagenSupabase(file, pedidoUUID) {
    try {
      if (!window.supabase || !window.supabase.storage) {
        throw new Error('Error de conexión. Recarga la página.');
      }

      const fileExtension = file.name.split('.').pop().toLowerCase();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${pedidoUUID}_${safeName}`;

      const { data, error } = await window.supabase.storage
        .from('pedidos-personalizados')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: signedData } = await window.supabase.storage
        .from('pedidos-personalizados')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7);

      return {
        success: true,
        url: signedData.signedUrl,
        fileName: fileName
      };

    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Enviar datos del pedido a Supabase
  async function enviarPedidoSupabase(pedidoData) {
    try {
      const { data, error } = await window.supabase
        .from('pedidos_personalizados')
        .insert([pedidoData])
        .select();

      if (error) throw error;
      
      return {
        success: true,
        data: data[0]
      };
    } catch (error) {
      console.error('Error guardando pedido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Manejar envío del formulario
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      mostrarToast('warning', 'Por favor, completa todos los campos correctamente');
      return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = "Verificando...";

    try {
      const nombre = nameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      const mensaje = messageInput.value.trim();
      const talla = tallaSeleccionada;

      // VERIFICAR LÍMITE DE 24 HORAS
      btnEnviar.textContent = "Verificando límite...";
      const verificacion = await verificarLimiteCorreo(email);
      
      if (!verificacion.puedeEnviar) {
        const ahora = obtenerHoraElSalvador();
        const siguiente = verificacion.siguientePedido;
        const diferenciaMs = siguiente - ahora;
        const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
        const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
        
        Swal.fire({
          icon: 'warning',
          title: 'Límite de pedidos alcanzado',
          html: `
            <div style="text-align: left;">
              <p><strong>⚠️ Ya tienes un pedido reciente</strong></p>
              <p>Para evitar spam, solo se permite 1 pedido por correo cada 24 horas.</p>
              <hr>
              <p><strong>Último pedido:</strong> ${formatearFechaHora(verificacion.ultimoPedido)}</p>
              <p><strong>Podrás enviar otro:</strong> ${formatearFechaHora(siguiente)}</p>
              <p><strong>Tiempo restante:</strong> ${horas}h ${minutos}m</p>
              <hr>
              <p style="font-size: 0.9em; color: #666;">
                <i class="ph ph-info"></i> Esta restricción ayuda a mantener la calidad del servicio.
              </p>
            </div>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3085d6',
          width: 500
        });
        
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar";
        return;
      }

      // Si pasa la verificación, continuar con el proceso
      const pedidoUUID = generarUUID();

      // 1. Subir imagen
      let imagenUrl = null;
      
      btnEnviar.textContent = "Subiendo imagen...";
      const uploadResult = await subirImagenSupabase(imagenSeleccionada, pedidoUUID);
      
      if (!uploadResult.success) {
        throw new Error(`Error al subir imagen: ${uploadResult.error}`);
      }
      
      imagenUrl = uploadResult.url;

      // 2. Guardar pedido en la base de datos
      btnEnviar.textContent = "Guardando pedido...";
      
      const pedidoData = {
        uuid: pedidoUUID,
        nombre: nombre,
        email: email,
        mensaje: mensaje,
        talla: talla, // <-- NUEVO CAMPO
        status: 'pendiente',
        imagen_url: imagenUrl,
        created_at: obtenerHoraElSalvador().toISOString()
      };

      const saveResult = await enviarPedidoSupabase(pedidoData);
      
      if (!saveResult.success) {
        throw new Error(`Error al guardar pedido: ${saveResult.error}`);
      }

      // ÉXITO - Mostrar confirmación con hora local
      const horaActual = obtenerHoraElSalvador();
      
      Swal.fire({
        icon: 'success',
        title: '¡Pedido Enviado con Éxito!',
        html: `
          <div style="text-align: left;">
            <p><strong>✓ Pedido registrado correctamente</strong></p>
            <p><strong>ID del pedido:</strong> ${pedidoUUID.substring(0, 8)}...</p>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Talla seleccionada:</strong> ${talla}</p>
            <p><strong>Hora de envío:</strong> ${formatearFechaHora(horaActual)}</p>
            <p><strong>Estado:</strong> Pendiente de revisión</p>
            <hr>
            <p style="font-size: 0.9em; color: #666;">
              <i class="ph ph-info"></i> Nos pondremos en contacto contigo en las próximas 24-48 horas.
            </p>
            <p style="font-size: 0.8em; color: #888;">
              <strong>Nota:</strong> Podrás enviar otro pedido después de 24 horas.
            </p>
            <p style="font-size: 0.8em; color: #888;">
              ID de referencia: <code>${pedidoUUID}</code>
            </p>
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6',
        width: 500
      });

      // Resetear formulario y estados
      form.reset();
      resetImagen();
      deseleccionarTalla();
      
      [nameInput, emailInput, messageInput, inputImg].forEach(input => {
        input.classList.remove("valid", "error");
        const error = input.nextElementSibling;
        if (error) {
          error.textContent = "";
          error.classList.remove("active");
        }
      });
      
      // Limpiar error de talla
      tallaError.textContent = "";
      tallaError.classList.remove("active");
      
      // Resetear estados de "touched"
      nameTouched = false;
      emailTouched = false;
      messageTouched = false;
      imageTouched = false;
      tallaTouched = false;

    } catch (error) {
      console.error('Error completo:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al Enviar',
        html: `
          <p>${error.message || 'Hubo un problema al procesar tu pedido.'}</p>
          <p style="font-size: 0.9em; color: #666;">
            Por favor, intenta de nuevo o contacta con soporte.
          </p>
        `,
        confirmButtonText: 'Reintentar'
      });
    } finally {
      // Restaurar botón
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar";
    }
  });

  // Inicializar sistema de tallas
  inicializarTallas();

  // Inicializar campos sin errores visibles
  [nameInput, emailInput, messageInput, inputImg].forEach(input => {
    input.classList.remove("valid", "error");
    const error = input.nextElementSibling;
    if (error) {
      error.textContent = "";
      error.classList.remove("active");
    }
  });
  
  // Inicializar error de talla
  tallaError.textContent = "";
  tallaError.classList.remove("active");
});