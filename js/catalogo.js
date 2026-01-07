// catalogo.js - VERSIÓN CORREGIDA CON CATEGORÍAS DINÁMICAS
console.log("📦 catalogo.js cargado");

const contenedor = document.getElementById("section-catalogo-completo");
const navCategorias = document.querySelector('.nav-categorias');
let CATALOGO = [];
let CATEGORIAS_DINAMICAS = new Set();

/* ===========================
   CARGAR Y RENDERIZAR CATEGORÍAS DESDE SUPABASE
=========================== */
async function cargarYRenderizarCategorias() {
  try {
    // Obtener categorías únicas de la base de datos
    const { data, error } = await supabase
      .from("catalogo_camisas")
      .select("categoria");

    if (error) throw error;

    // Extraer categorías únicas y válidas
    const categoriasUnicas = [...new Set(data
      .map(item => item.categoria)
      .filter(categoria => categoria && categoria.trim() !== '')
    )];

    console.log(`🏷️ Categorías encontradas:`, categoriasUnicas);
    
    // Guardar categorías para uso posterior
    CATEGORIAS_DINAMICAS = new Set(categoriasUnicas);
    
    // Limpiar botones existentes (excepto "Todas")
    const botonesExistentes = navCategorias.querySelectorAll('.btn-cat:not([data-cat="todas"])');
    botonesExistentes.forEach(btn => btn.remove());
    
    // Crear botón para cada categoría única
    categoriasUnicas.forEach(categoria => {
      const button = document.createElement('button');
      button.className = 'btn-cat';
      // IMPORTANTE: Usar el formato 'cat-nombre' para mantener compatibilidad
      button.dataset.cat = 'cat-' + categoria.toLowerCase().replace(/\s+/g, '-');
      button.textContent = categoria;
      
      // Insertar después del botón "Todas"
      const todasBtn = navCategorias.querySelector('.btn-cat[data-cat="todas"]');
      if (todasBtn) {
        todasBtn.insertAdjacentElement('afterend', button);
      } else {
        navCategorias.appendChild(button);
      }
    });
    
    // Re-inicializar eventos de categorías
    inicializarEventosCategorias();
    
  } catch (error) {
    console.error("❌ Error cargando categorías:", error);
  }
}

/* ===========================
   INICIALIZAR EVENTOS DE CATEGORÍAS (VERSIÓN SIMPLIFICADA Y CORREGIDA)
=========================== */
function inicializarEventosCategorias() {
  const categoryButtons = navCategorias.querySelectorAll('.btn-cat');
  
  // SOLUCIÓN: No clonar, solo agregar listeners nuevos
  categoryButtons.forEach(button => {
    // Remover cualquier event listener previo (opcional, pero seguro)
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Agregar nuevo listener al nuevo botón
    newButton.addEventListener('click', function() {
      // Remover active de TODOS los botones
      navCategorias.querySelectorAll('.btn-cat').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Agregar active SOLO al botón clickeado
      this.classList.add('active');
      
      console.log(`🎯 Categoría activa: ${this.dataset.cat}`);
      
      // Aplicar filtro
      filtrarCatalogo();
    });
  });
  
  // Asegurar que "Todas" esté activa por defecto
  const todasBtn = navCategorias.querySelector('.btn-cat[data-cat="todas"]');
  if (todasBtn && !todasBtn.classList.contains('active')) {
    navCategorias.querySelectorAll('.btn-cat').forEach(btn => btn.classList.remove('active'));
    todasBtn.classList.add('active');
  }
}

/* ===========================
   PINTAR TARJETAS CON EL DISEÑO CORRECTO
=========================== */
function renderCatalogo(data) {
  if (!contenedor) return;
  
  console.log(`🎨 Renderizando ${data.length} productos`);
  
  CATALOGO = data || [];
  contenedor.innerHTML = "";

  if (!CATALOGO.length) {
    contenedor.innerHTML = '<p class="text-center text-white">No hay productos disponibles</p>';
    return;
  }

  // Crear grid principal
  const grid = document.createElement("div");
  grid.className = "grid-catalogo";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(22rem, 1fr))";
  grid.style.gap = "2rem";
  grid.style.justifyContent = "center";

  CATALOGO.forEach(camisa => {
    // IMPORTANTE: Usar el mismo formato 'cat-nombre' para mantener compatibilidad
    const categoriaSlug = camisa.categoria 
      ? 'cat-' + camisa.categoria.toLowerCase().replace(/\s+/g, '-')
      : 'cat-general';

    // Crear ENLACE que envuelve la tarjeta
    const link = document.createElement("a");
    link.href = `producto.html?id=${camisa.id}`;
    link.className = "link-card";
    link.style.textDecoration = "none";
    link.style.display = "block";

    // Crear tarjeta CON EL DISEÑO CORRECTO
    const card = document.createElement("div");
    card.className = "card-camisa card-index";
    card.dataset.id = camisa.id;
    card.dataset.categoria = categoriaSlug;

    // Usar la primera imagen si existe
    const imagen = camisa.imagenes && camisa.imagenes.length > 0 
      ? camisa.imagenes[0] 
      : 'images/color.png';

    // HTML EXACTO QUE RESPETA TU CSS
    card.innerHTML = `
      <span class="categoria-camisa">${camisa.categoria || 'General'}</span>
      
      <img src="${imagen}" 
           alt="${camisa.titulo || camisa.nombre}" 
           class="img-card"
           loading="lazy"
           onerror="this.src='images/color.png'">
      
      <section class="section-camisa">
        <h2 class="lbl-nombre-camisa">${camisa.titulo || camisa.nombre}</h2>
        <h2 class="price-camisa">$${Number(camisa.precio || 0).toFixed(2)}</h2>
      </section>
    `;

    // Agregar tarjeta al enlace
    link.appendChild(card);
    // Agregar enlace al grid
    grid.appendChild(link);
  });

  contenedor.appendChild(grid);
  
  // Inicializar bookmarks DESPUÉS de renderizar
  setTimeout(() => {
    if (window.BookmarkInit && typeof window.BookmarkInit === 'function') {
      console.log('📌 Inicializando bookmarks...');
      window.BookmarkInit();
    }
    
    document.dispatchEvent(new CustomEvent("catalogo:renderizado"));
    console.log("✅ Catálogo renderizado");
  }, 300);
}

/* ===========================
   FUNCIÓN DE BÚSQUEDA FLEXIBLE
=========================== */
function busquedaFlexible(textoBusqueda, textoProducto) {
  if (!textoBusqueda) return true;
  
  const busqueda = textoBusqueda.toLowerCase().trim();
  const producto = textoProducto.toLowerCase().trim();
  
  // Si la búsqueda exacta coincide
  if (producto.includes(busqueda)) {
    return true;
  }
  
  // Dividir la búsqueda en palabras individuales
  const palabrasBusqueda = busqueda.split(/\s+/).filter(palabra => palabra.length > 0);
  const palabrasProducto = producto.split(/\s+/).filter(palabra => palabra.length > 0);
  
  // Si hay una sola palabra, buscar coincidencias parciales
  if (palabrasBusqueda.length === 1) {
    const palabra = palabrasBusqueda[0];
    return palabrasProducto.some(palabraProd => 
      palabraProd.includes(palabra) || palabra.includes(palabraProd)
    );
  }
  
  // Para múltiples palabras, verificar que al menos una coincida
  if (palabrasBusqueda.length > 1) {
    return palabrasBusqueda.some(palabra => 
      palabrasProducto.some(palabraProd => 
        palabraProd.includes(palabra) || palabra.includes(palabraProd)
      )
    );
  }
  
  return false;
}

/* ===========================
   FILTRAR Y BUSCAR PRODUCTOS (VERSIÓN MEJORADA)
=========================== */
function filtrarCatalogo() {
  if (!contenedor || CATALOGO.length === 0) return;
  
  const searchInput = document.querySelector('.input__search');
  const searchText = searchInput ? searchInput.value.trim() : '';
  const activeButton = document.querySelector('.btn-cat.active');
  const activeCategory = activeButton ? activeButton.dataset.cat : 'todas';
  
  console.log(`🔍 Buscando: "${searchText}" en categoría: ${activeCategory}`);
  
  // Remover tarjeta "not found" anterior si existe
  const oldCard = document.querySelector('.tarjeta-wrapper-3d');
  if (oldCard) oldCard.remove();
  
  // Obtener todas las tarjetas
  const cards = contenedor.querySelectorAll('.card-camisa');
  let foundAny = false;
  
  cards.forEach(card => {
    const titulo = card.querySelector('.lbl-nombre-camisa').textContent;
    const categoria = card.dataset.categoria;
    const categoriaTexto = card.querySelector('.categoria-camisa').textContent;
    
    // Verificar categoría
    const categoriaMatch = activeCategory === 'todas' || 
                          categoria === activeCategory;
    
    // Verificar búsqueda
    let busquedaMatch = false;
    if (searchText) {
      busquedaMatch = busquedaFlexible(searchText, titulo) || 
                     busquedaFlexible(searchText, categoriaTexto);
    } else {
      busquedaMatch = true;
    }
    
    // Mostrar/ocultar tarjeta
    const shouldShow = categoriaMatch && busquedaMatch;
    card.parentElement.style.display = shouldShow ? 'block' : 'none';
    
    if (shouldShow) {
      foundAny = true;
    }
  });
  
  // Mostrar tarjeta "not found" si no hay resultados
  if (!foundAny && (searchText || activeCategory !== 'todas')) {
    mostrarMensajeNoEncontrado(searchText || activeCategory);
  }
}

/* ===========================
   MOSTRAR TARJETA "NOT FOUND"
=========================== */
function mostrarMensajeNoEncontrado(searchTerm) {
  const msg = document.createElement('div');
  msg.className = 'tarjeta-wrapper-3d';
  msg.innerHTML = `
    <!-- Tarjeta decorativa trasera -->
    <div class="tarjeta-back"></div>

    <!-- Tarjeta principal -->
    <div class="tarjeta-recip">
      <div class="imagen-superior">
        <img src="images/camisa-not-found2.png" alt="Camisa no encontrada">
        <div class="icono-error">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2"/>
            <line x1="12" y1="7" x2="12" y2="13" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="17" r="1.5" fill="#fff"/>
          </svg>
        </div>
      </div>

      <div class="contenido-recip">
        <h2 class="titulo-recip">Camisa no encontrada</h2>
        <p class="desc-recip">
          ${searchTerm ? `No pudimos encontrar "<strong>${searchTerm}</strong>"` : 'No hay productos en esta categoría'}<br><br>
          Intenta con otras palabras o revisa la ortografía.
        </p>
      </div>
    </div>
  `;
  
  // Insertar después del grid de productos
  const grid = contenedor.querySelector('.grid-catalogo');
  if (grid) {
    contenedor.appendChild(msg);
  } else {
    contenedor.appendChild(msg);
  }
  
  // Inicializar movimiento 3D para la tarjeta
  inicializarMovimiento3D();
}

/* ===========================
   MOVIMIENTO 3D PARA TARJETA NOT FOUND
=========================== */
function inicializarMovimiento3D() {
  const card = document.querySelector(".tarjeta-recip");
  if (!card) return;
  
  const manejarMovimiento = function(e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = (-y / rect.height) * 6;
    const rotateY = (x / rect.width) * 6;
    
    card.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  };
  
  const resetMovimiento = function() {
    if (card) card.style.transform = "rotateX(0) rotateY(0)";
  };
  
  // Agregar event listeners
  card.addEventListener('mousemove', manejarMovimiento);
  card.addEventListener('mouseleave', resetMovimiento);
}

/* ===========================
   INICIALIZAR EVENTOS DE BÚSQUEDA
=========================== */
function inicializarBusqueda() {
  // Evento para el input de búsqueda
  const searchInput = document.querySelector('.input__search');
  if (searchInput) {
    // Búsqueda en tiempo real con debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filtrarCatalogo();
      }, 300);
    });
    
    // También filtrar al presionar Enter
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        filtrarCatalogo();
      }
    });
    
    // Limpiar búsqueda al hacer clic en la "X" (si tiene)
    searchInput.addEventListener('search', function() {
      clearTimeout(searchTimeout);
      setTimeout(() => {
        filtrarCatalogo();
      }, 100);
    });
  }
}

/* ===========================
   CARGAR CATÁLOGO COMPLETO DESDE SUPABASE
=========================== */
async function cargarCatalogoCompleto() {
  console.log('🔄 Cargando catálogo...');
  
  if (!window.supabase) {
    console.error('❌ Supabase no disponible');
    return;
  }

  try {
    const { data, error } = await window.supabase
      .from("catalogo_camisas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filtrar duplicados por ID
    const idsVistos = new Set();
    const productosUnicos = data.filter(item => {
      if (idsVistos.has(item.id)) {
        console.warn(`⚠️ Duplicado omitido: ${item.id}`);
        return false;
      }
      idsVistos.add(item.id);
      return true;
    });

    console.log(`✅ ${productosUnicos.length} productos únicos`);
    renderCatalogo(productosUnicos);
    
    // Cargar categorías dinámicas
    await cargarYRenderizarCategorias();
    
    // Inicializar búsqueda después de renderizar
    setTimeout(() => {
      inicializarBusqueda();
      // Aplicar filtro inicial
      filtrarCatalogo();
    }, 100);

  } catch (error) {
    console.error("❌ Error:", error);
    if (contenedor) {
      contenedor.innerHTML = '<p class="text-center text-white">Error cargando catálogo</p>';
    }
  }
}

/* ===========================
   FUNCIÓN PARA LIMPIAR Y RESETEAR
=========================== */
function limpiarFiltros() {
  // Limpiar búsqueda
  const searchInput = document.querySelector('.input__search');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Activar solo "Todas"
  const todasBtn = navCategorias.querySelector('.btn-cat[data-cat="todas"]');
  if (todasBtn) {
    navCategorias.querySelectorAll('.btn-cat').forEach(btn => {
      btn.classList.remove('active');
    });
    todasBtn.classList.add('active');
  }
  
  // Aplicar filtro (mostrar todo)
  filtrarCatalogo();
}

/* ===========================
   INICIAR CUANDO SUPABASE ESTÉ LISTO
=========================== */
function iniciarCatalogo() {
  console.log('🏁 Iniciando catálogo...');
  
  if (window.supabase) {
    // Si ya está cargado
    cargarCatalogoCompleto();
  } else {
    // Esperar a que cargue
    document.addEventListener('supabase:ready', function() {
      cargarCatalogoCompleto();
    }, { once: true });
  }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('🏁 DOM cargado, iniciando catálogo...');
  
  // Pequeño delay para asegurar que todos los elementos estén disponibles
  setTimeout(() => {
    iniciarCatalogo();
  }, 100);
});

// Timeout de seguridad
setTimeout(() => {
  if (contenedor && contenedor.innerHTML === '') {
    console.log('⏰ Timeout - cargando catálogo...');
    iniciarCatalogo();
  }
}, 3000);