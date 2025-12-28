// carrito-sidebar.js - VERSIÓN COMPLETA CON LÍMITE DE 6 Y SIN DUPLICADOS
console.log('🛒 carrito-sidebar.js cargado');

(function() {
  // Verificar si estamos en una página con carrito
  const sidebar = document.getElementById('carritoSidebar');
  const overlay = document.getElementById('carritoOverlay');
  const btnCerrar = document.getElementById('cerrarCarrito');
  const btnCarrito = document.querySelector('.btn-carrito');
  const btnPedidoCarrito = document.getElementById('btnPedidoCarrito');
  
  if (!sidebar || !overlay) return;
  
  const KEY = "camisas_seleccionadas";
  const MAX_CAMISAS = 6;
  
  // Función para obtener datos del carrito
  const getCarrito = () => {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  };
  
  // Función para guardar en carrito
  const saveCarrito = (carrito) => {
    localStorage.setItem(KEY, JSON.stringify(carrito));
    window.dispatchEvent(new CustomEvent("camisas:update"));
  };
  
  // Función global para abrir/cerrar carrito
  window.toggleCarrito = function(show) {
    if (show === undefined) {
      show = !sidebar.classList.contains('active');
    }
    
    if (show) {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      actualizarVistaCarrito();
    } else {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
  
  // Función para verificar límite de 6 camisas
  window.verificarLimiteCarrito = function() {
    const carrito = getCarrito();
    return carrito.length >= MAX_CAMISAS;
  };
  
  // Función para agregar camisa (con verificación de duplicados y límite)
  window.agregarAlCarrito = function(producto) {
    const carrito = getCarrito();
    
    // 1. Verificar límite
    if (carrito.length >= MAX_CAMISAS) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: `Máximo ${MAX_CAMISAS} camisas por pedido. Elimina algunas para agregar más.`,
        timer: 2000
      });
      return false;
    }
    
    // 2. Verificar si ya existe (por ID, talla y color)
    const existe = carrito.some(item => 
      item.id === producto.id && 
      item.talla === producto.talla && 
      item.color === producto.color
    );
    
    if (existe) {
      Swal.fire({
        icon: 'info',
        title: 'Ya está en el carrito',
        text: 'Esta camisa ya está en tu carrito',
        timer: 1500
      });
      return false;
    }
    
    // 3. Agregar al carrito
    carrito.push(producto);
    saveCarrito(carrito);
    
    // 4. Actualizar vista del carrito si está abierto
    if (sidebar.classList.contains('active')) {
      actualizarVistaCarrito();
    }
    
    // 5. Mostrar notificación
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Camisa agregada',
      text: `(${carrito.length}/${MAX_CAMISAS} camisas)`,
      showConfirmButton: false,
      timer: 1500
    });
    
    return true;
  };
  
  // Función para eliminar del carrito
  window.eliminarDelCarrito = function(index) {
    const carrito = getCarrito();
    
    if (index >= 0 && index < carrito.length) {
      Swal.fire({
        title: '¿Eliminar del carrito?',
        text: `¿Quieres eliminar "${carrito[index].nombre}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#CB2D2D',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          carrito.splice(index, 1);
          saveCarrito(carrito);
          actualizarVistaCarrito();
          
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Eliminado del carrito',
            showConfirmButton: false,
            timer: 1500
          });
        }
      });
    }
  };
  
  // Actualizar vista del carrito
  function actualizarVistaCarrito() {
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const totalCarrito2 = document.getElementById('totalCarrito'); // para producto.html
    
    if (!listaCarrito) return;
    
    const carrito = getCarrito();
    
    if (carrito.length === 0) {
      listaCarrito.innerHTML = `
        <div class="carrito-vacio">
          <i class="ph ph-shopping-cart-simple" style="font-size: 48px; opacity: 0.3;"></i>
          <p>No hay camisas en el carrito</p>
        </div>
      `;
      
      if (totalCarrito) totalCarrito.textContent = '0.00';
      return;
    }
    
    // Calcular total
    let total = 0;
    let html = '';
    
    carrito.forEach((item, index) => {
      const subtotal = (item.precio || 0) * (item.cantidad || 1);
      total += subtotal;
      
      html += `
        <div class="carrito-item">
          <img src="${item.imagen || 'images/color.png'}" 
               alt="${item.nombre}"
               onerror="this.src='images/color.png'">
          <div class="carrito-item-info">
            <div class="carrito-item-titulo">${item.nombre}</div>
            <div class="carrito-item-desc">
              Talla: ${item.talla || 'No especificada'} | 
              Color: ${item.color || 'No especificado'}
            </div>
            <div class="carrito-item-cantidad">
              Cantidad: ${item.cantidad || 1}
            </div>
            <div class="carrito-item-subtotal">$${subtotal.toFixed(2)}</div>
          </div>
          <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${index})">
            &times;
          </button>
        </div>
      `;
    });
    
    listaCarrito.innerHTML = html;
    
    // Actualizar total
    if (totalCarrito) totalCarrito.textContent = total.toFixed(2);
  }
  
  // Configurar botones
  if (btnCarrito) {
    btnCarrito.addEventListener('click', () => toggleCarrito(true));
  }
  
  if (btnCerrar) {
    btnCerrar.addEventListener('click', () => toggleCarrito(false));
  }
  
  if (overlay) {
    overlay.addEventListener('click', () => toggleCarrito(false));
  }
  
  // ESC para cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      toggleCarrito(false);
    }
  });
  
  // Evento para actualizar vista cuando cambie el carrito
  window.addEventListener('camisas:update', () => {
    if (sidebar.classList.contains('active')) {
      actualizarVistaCarrito();
    }
  });
  
  // Inicializar vista del carrito
  actualizarVistaCarrito();
  
  console.log('✅ carrito-sidebar.js configurado');
})();