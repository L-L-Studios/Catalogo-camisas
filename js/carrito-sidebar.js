// carrito-sidebar.js - ACTUALIZADO CON LÍMITE DE 10 CAMISAS TOTALES
console.log('🛒 carrito-sidebar.js cargado');

(function() {
  const sidebar = document.getElementById('carritoSidebar');
  const overlay = document.getElementById('carritoOverlay');
  const btnCerrar = document.getElementById('cerrarCarrito');
  const btnCarrito = document.querySelector('.btn-carrito');
  const btnPedido = document.querySelector('.popup-carrito');
  const btnPedidoCarrito = document.getElementById('btnPedidoCarrito');
  
  if (!sidebar || !overlay) return;
  
  const KEY = "camisas_seleccionadas";
  const MAX_CAMISAS_TOTALES = 10; // ← CAMBIADO DE 6 A 10
  
  // Función para obtener datos del carrito
  const getCarrito = () => {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  };
  
  // Función para guardar en carrito
  const saveCarrito = (carrito) => {
    localStorage.setItem(KEY, JSON.stringify(carrito));
    window.dispatchEvent(new CustomEvent("camisas:update"));
  };
  
  // Función para calcular camisas totales (considerando cantidad)
  const calcularTotalCamisas = (carrito) => {
    return carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
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
  
  // Función para verificar límite de 10 camisas totales
  window.verificarLimiteCarrito = function(producto) {
    const carrito = getCarrito();
    const camisasActuales = calcularTotalCamisas(carrito);
    const cantidadProducto = producto.cantidad || 1;
    
    return (camisasActuales + cantidadProducto) > MAX_CAMISAS_TOTALES;
  };
  
  // Función para agregar camisa (con verificación de duplicados y límite)
  window.agregarAlCarrito = function(producto) {
    const carrito = getCarrito();
    const camisasActuales = calcularTotalCamisas(carrito);
    const cantidadProducto = producto.cantidad || 1;
    
    // 1. Verificar límite total de camisas
    if ((camisasActuales + cantidadProducto) > MAX_CAMISAS_TOTALES) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: `Máximo ${MAX_CAMISAS_TOTALES} camisas por pedido. Tienes ${camisasActuales} y quieres agregar ${cantidadProducto} más.`,
        timer: 3000,
        customClass: { popup: 'swal2-popup' }
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
        title: 'Ya está en el pedido',
        text: 'Esta camisa ya está en tu carrito de pedido',
        timer: 1500,
        customClass: { popup: 'swal2-popup' }
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
    const nuevoTotal = calcularTotalCamisas(carrito);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Camisa agregada',
      text: `(${nuevoTotal}/${MAX_CAMISAS_TOTALES} camisas totales)`,
      showConfirmButton: false,
      timer: 1500,
      customClass: { popup: 'swal-toast-avenir' }
    });
    
    return true;
  };
  
  // Función para eliminar del carrito
  window.eliminarDelCarrito = function(index) {
    const carrito = getCarrito();
    
    if (index >= 0 && index < carrito.length) {
      Swal.fire({
        title: '¿Eliminar del pedido?',
        text: `¿Quieres eliminar "${carrito[index].nombre}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#CB2D2D',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        customClass: { popup: 'swal2-popup' }
      }).then((result) => {
        if (result.isConfirmed) {
          carrito.splice(index, 1);
          saveCarrito(carrito);
          actualizarVistaCarrito();
          
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Eliminado del pedido',
            showConfirmButton: false,
            timer: 1500,
            customClass: { popup: 'swal-toast-avenir' }
          });
        }
      });
    }
  };
  
  // Actualizar vista del carrito
  function actualizarVistaCarrito() {
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    
    if (!listaCarrito) return;
    
    const carrito = getCarrito();
    const totalCamisas = calcularTotalCamisas(carrito);
    
    if (carrito.length === 0) {
      listaCarrito.innerHTML = `
        <div class="carrito-vacio">
          <i class="ph ph-shopping-cart-simple" style="font-size: 48px; opacity: 0.3;"></i>
          <p>No hay camisas en el carrito de pedido</p>
        </div>
      `;
      
      if (totalCarrito) totalCarrito.textContent = '0.00';
      
      // Actualizar contador en el botón del carrito
      const btnCarritoContador = document.querySelector('.btn-carrito .contador');
      if (btnCarritoContador) {
        btnCarritoContador.textContent = '0';
      }

      // Actualizar contador en el botón del carrito en producto
      const btnPedido = document.querySelector('.btn-carrito-producto .contador');
      if (btnPedido) {
        btnPedido.textContent = '0';
      }
      
      return;
    }
    
    // Calcular total monetario
    let totalMonetario = 0;
    let html = '';
    
    carrito.forEach((item, index) => {
      const subtotal = (item.precio || 0) * (item.cantidad || 1);
      totalMonetario += subtotal;
      
      // Mostrar nota de costo extra si existe
      const costoExtraHtml = item.costo_extra ? 
        `<div class="carrito-item-costo-extra">
           <small><strong>Extra:</strong> ${item.costo_extra}</small>
         </div>` : '';
      
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
            ${costoExtraHtml}
            <div class="carrito-item-subtotal">$${subtotal.toFixed(2)}</div>
          </div>
          <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${index})">
            &times;
          </button>
        </div>
      `;
    });
    
    listaCarrito.innerHTML = html;
    
    // Mostrar contador de camisas totales
    const contadorInfo = document.createElement('div');
    contadorInfo.className = 'carrito-contador-info';
    contadorInfo.innerHTML = `<small>Total de camisas: ${totalCamisas}/${MAX_CAMISAS_TOTALES}</small>`;
    listaCarrito.insertBefore(contadorInfo, listaCarrito.firstChild);
    
    // Actualizar total monetario
    if (totalCarrito) totalCarrito.textContent = totalMonetario.toFixed(2);
    
    // Actualizar contador en el botón del carrito
    const btnCarritoContador = document.querySelector('.btn-carrito .contador');
    if (btnCarritoContador) {
      btnCarritoContador.textContent = totalCamisas;
    }

     // Actualizar contador en el botón del carrito
    const btnPedido = document.querySelector('.btn-carrito-producto .contador');
    if (btnPedido) {
      btnPedido.textContent = totalCamisas;
    }
  }
  
  // Configurar botones
  if (btnCarrito) {
    btnCarrito.addEventListener('click', () => toggleCarrito(true));
  }

  if (btnPedido) {
    btnPedido.addEventListener('click', () => toggleCarrito(true));
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
    } else {
      // Solo actualizar contador
      const carrito = getCarrito();
      const totalCamisas = calcularTotalCamisas(carrito);
      const btnCarritoContador = document.querySelector('.btn-carrito .contador');
      if (btnCarritoContador) {
        btnCarritoContador.textContent = totalCamisas;
      }

      const btnPedido = document.querySelector('.btn-carrito-producto .contador');
      if (btnPedido) {
        btnPedido.textContent = totalCamisas;
      }
    }
  });
  
  // Inicializar vista del carrito
  actualizarVistaCarrito();
  
  console.log('✅ carrito-sidebar.js configurado (límite: 10 camisas)');
})();