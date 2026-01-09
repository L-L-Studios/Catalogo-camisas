// producto.js — ACTUALIZADO CON LÍMITE DE 6
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const navbar_producto = document.querySelector('.navbar-producto');


  window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight * 0.08) {
          navbar_producto.classList.add('scrolled');
      } else {
          navbar_producto.classList.remove('scrolled');
      }
  });


if (!id) {
  document.getElementById("producto-container").innerHTML = 
    "<p style='text-align:center'>Producto no encontrado</p>";
  throw new Error("Producto no encontrado");
}

// Esperar a que Supabase esté disponible
async function cargarProducto() {
  const container = document.getElementById("producto-container");
  
  if (!window.supabase) {
    container.innerHTML = "<p>Cargando...</p>";
    setTimeout(cargarProducto, 100);
    return;
  }

  try {
    const { data, error } = await window.supabase
      .from('catalogo_camisas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw error || new Error("Producto no encontrado");

    renderizarProducto(data);
    inicializarEventos(data);

  } catch (error) {
    container.innerHTML = "<p style='text-align:center'>Producto no encontrado</p>";
    console.error("Error cargando producto:", error);
  }
}

function renderizarProducto(p) {
  const precio = parseFloat(p.precio);
  
  document.getElementById("producto-container").innerHTML = `
  <div class="card-camisa card-producto">
    <span class="categoria-camisa">${p.categoria}</span>

    <!-- Carrusel Móvil -->
    <div id="carouselBootstrap" class="carousel slide d-lg-none">
      <div class="carousel-indicators">
        ${p.imagenes.map((_, i) => `
          <button type="button"
            data-bs-target="#carouselBootstrap"
            data-bs-slide-to="${i}"
            class="${i === 0 ? 'active' : ''}"
            ${i === 0 ? 'aria-current="true"' : ''}
            aria-label="Slide ${i + 1}">
          </button>
        `).join("")}
      </div>

      <div class="carousel-inner">
        ${p.imagenes.map((img, i) => `
          <div class="carousel-item ${i === 0 ? 'active' : ''}">
            <img src="${img}" class="img-card" alt="${p.titulo}">
          </div>
        `).join("")}
      </div>

      <button class="carousel-control-prev" type="button"
        data-bs-target="#carouselBootstrap" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>

      <button class="carousel-control-next" type="button"
        data-bs-target="#carouselBootstrap" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>

    <!-- Carrusel Desktop -->
    <div class="carousel-simple d-none d-lg-block">
      <div class="carousel-simple-inner">
        ${p.imagenes.map((img, i) => `
          <div class="carousel-simple-item ${i === 0 ? 'active' : ''}">
            <img src="${img}" class="img-card" alt="${p.titulo} ${i + 1}">
          </div>
        `).join("")}
      </div>

      <button class="carousel-simple-btn prev">
        <i class="ph ph-caret-left"></i>
      </button>
      <button class="carousel-simple-btn next">
        <i class="ph ph-caret-right"></i>
      </button>

      <div class="carousel-simple-controls">
        ${p.imagenes.map((_, i) => `
          <div class="carousel-simple-indicator ${i === 0 ? 'active' : ''}"
               data-index="${i}"></div>
        `).join("")}
      </div>
    </div>

    <!-- Info del producto -->
    <section class="section-camisa">
      <h2>${p.titulo}</h2>
      <p>${p.descripcion}</p>
      <h2 class="price-camisa">$${precio.toFixed(2)}</h2>

      <p>Tallas: <strong class="talla-txt">Selecciona</strong></p>
      <div class="tallas-camisa">
        ${p.tallas.map(t => `<div class="tag talla">${t}</div>`).join("")}
      </div>

      <p class="color-lbl"> Color: <strong class="color-txt">Selecciona</strong></p>
      <div class="colores-camisa">
        ${(p.colores || []).map(c => `
          <div class="color-dot" style="background:${c.hex}" data-color="${c.name}" title="${c.name}"></div>
        `).join("")}
      </div>

      <div class="cantidad-box">
        <button class="menos">-</button>
        <span class="cantidad">1</span>
        <button class="mas">+</button>
      </div>

      <p>Puedes añadir elementos adicionales a tu camisa, <br> con gusto podemos hacerlo por un <strong class="coste-txt">costo extra</strong>. <strong class="lbl-opcional">(opcional)</strong> </p>

      <textarea class="costo-extra" name="costo-extra" placeholder="Escribe lo que deseas agregar extra o cambio a tu pedido" rows="3"></textarea>
        

      <p>Subtotal: $<span id="subtotal">${precio.toFixed(2)}</span></p>

      <button class="btn-seleccionar">Agregar al carrito</button>
    </section>
  </div>
  `;
}

function inicializarEventos(p) {
  let cantidad = 1;
  let talla = null;
  let color = null;
  const precio = parseFloat(p.precio);
  const subtotal = document.getElementById("subtotal");

  // Toast
  const toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
    customClass: { popup: "swal-toast-avenir" }
  });

  // ---------- CARRUSEL DE ESCRITORIO (NUEVO CÓDIGO) ----------
  // Espera a que se renderice el DOM antes de inicializar
  setTimeout(() => {
    const carruselItems = document.querySelectorAll('.carousel-simple-item');
    const prevBtn = document.querySelector('.carousel-simple-btn.prev');
    const nextBtn = document.querySelector('.carousel-simple-btn.next');
    const indicators = document.querySelectorAll('.carousel-simple-indicator');
    
    if (carruselItems.length > 0) {
      let currentIndex = 0;

      function updateCarousel() {
        // Remover clase 'active' de todos los items e indicadores
        carruselItems.forEach(item => item.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        // Agregar 'active' al item e indicador actual
        carruselItems[currentIndex].classList.add('active');
        indicators[currentIndex].classList.add('active');
      }

      // Botón siguiente
      if (nextBtn) {
        nextBtn.onclick = () => {
          currentIndex = (currentIndex + 1) % carruselItems.length;
          updateCarousel();
        };
      }

      // Botón anterior
      if (prevBtn) {
        prevBtn.onclick = () => {
          currentIndex = (currentIndex - 1 + carruselItems.length) % carruselItems.length;
          updateCarousel();
        };
      }

      // Eventos para los indicadores (hacer clic en los puntos)
      indicators.forEach((indicator, index) => {
        indicator.onclick = () => {
          currentIndex = index;
          updateCarousel();
        };
      });
    }
  }, 50); // Pequeño retraso para asegurar que el DOM está listo
  // ---------- FIN CARRUSEL DE ESCRITORIO ----------

  // Tallas
  document.querySelectorAll(".tag.talla").forEach(t => {
    t.onclick = () => {
      document.querySelectorAll(".tag.talla").forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      talla = t.textContent;
      document.querySelector(".talla-txt").textContent = talla;
    };
  });

  // Colores
  document.querySelectorAll(".color-dot").forEach(c => {
    c.onclick = () => {
      document.querySelectorAll(".color-dot").forEach(x => x.classList.remove("active"));
      c.classList.add("active");
      color = c.dataset.color;
      document.querySelector(".color-txt").textContent = color;
    };
  });

  // Cantidad
  document.querySelector(".mas").onclick = () => {
    cantidad++;
    actualizar();
  };
  
  document.querySelector(".menos").onclick = () => {
    if (cantidad > 1) cantidad--;
    actualizar();
  };

  function actualizar() {
    document.querySelector(".cantidad").textContent = cantidad;
    subtotal.textContent = (cantidad * precio).toFixed(2);
  }

  // Agregar al carrito
  document.querySelector(".btn-seleccionar").onclick = () => {
    if (!talla || !color) {
      toast.fire({ icon: "info", title: "Selecciona talla y color" });
      return;
    }

    // Capturar el texto del costo extra (NUEVO)
    const costoExtra = document.querySelector(".costo-extra")?.value.trim() || "";

    const producto = {
      id: p.id,
      nombre: p.titulo,
      precio: precio,
      talla,
      color,
      cantidad,
      imagen: p.imagenes[0],
      costo_extra: costoExtra  // ← NUEVO CAMPO AGREGADO
    };

    // Usar la nueva función que verifica límite y duplicados
    if (window.agregarAlCarrito && typeof window.agregarAlCarrito === 'function') {
      const agregado = window.agregarAlCarrito(producto);
      
      if (agregado) {
        toast.fire({ 
          icon: "success", 
          title: "Camisa agregada al carrito"
        });
      }
    } else {
      // Fallback si la función no existe
      const KEY = "camisas_seleccionadas";
      const lista = JSON.parse(localStorage.getItem(KEY)) || [];

      const camisasActuales = lista.reduce((total, item) => total + (item.cantidad || 1), 0);
      
      // Verificar límite de 10 camisas
      if ((camisasActuales + cantidad) > 10) {
        toast.fire({ 
          icon: "warning", 
          title: "Límite alcanzado",
          text: `Máximo 10 camisas por pedido. Tienes ${camisasActuales} y quieres agregar ${cantidad} más.`
        });
        return;
      }

      // Verificar duplicados
      const existe = lista.some(item => 
        item.id === p.id && 
        item.talla === talla && 
        item.color === color
      );
      
      if (existe) {
        toast.fire({ 
          icon: "info", 
          title: "Ya está en el carrito"
        });
        return;
      }

      lista.push(producto);
      localStorage.setItem(KEY, JSON.stringify(lista));
      window.dispatchEvent(new CustomEvent("camisas:update"));

      const nuevoTotal = lista.reduce((total, item) => total + (item.cantidad || 1), 0);

      toast.fire({ 
        icon: "success", 
        title: "Camisa agregada al carrito",
        text: `(${nuevoTotal.length}/10 camisas)`
      });
    }
  };
}

// Iniciar carga
cargarProducto();