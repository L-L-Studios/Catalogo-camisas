// catalogo.js - VERSIÓN COMPLETA CON PAGINACIÓN
console.log("📦 catalogo.js cargado");

const contenedor = document.getElementById("section-catalogo-completo");
const paginacionContainer = document.getElementById("paginacion");
const navCategorias = document.querySelector('.nav-categorias');

// Variables globales
let CATALOGO = [];
let CATEGORIAS_DINAMICAS = new Set();
let PRODUCTOS_FILTRADOS = [];
let PAGINA_ACTUAL = 1;
let PRODUCTOS_POR_PAGINA = 9; // cantidad de tarjetas por página

/* ===========================
   CARGAR Y RENDERIZAR CATEGORÍAS DESDE SUPABASE
=========================== */
async function cargarYRenderizarCategorias() {
  try {
    // Obtener categorías únicas de la base de datos
    const { data, error } = await window.supabase
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
   INICIALIZAR EVENTOS DE CATEGORÍAS
=========================== */
function inicializarEventosCategorias() {
  const categoryButtons = navCategorias.querySelectorAll('.btn-cat');
  
  categoryButtons.forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function() {
      navCategorias.querySelectorAll('.btn-cat').forEach(btn => {
        btn.classList.remove('active');
      });
      
      this.classList.add('active');
      
      console.log(`🎯 Categoría activa: ${this.dataset.cat}`);
      
      // Scroll suave hacia el inicio del catálogo
      const catalogoSection = document.querySelector('.catalogo');
      if (catalogoSection) {
        window.scrollTo({
          top: catalogoSection.offsetTop - 100,
          behavior: 'smooth'
        });
      }
      
      // Aplicar filtro (con pequeño delay para que se vea el scroll)
      setTimeout(() => {
        filtrarCatalogo();
      }, 300);
    });
  });
  
  const todasBtn = navCategorias.querySelector('.btn-cat[data-cat="todas"]');
  if (todasBtn && !todasBtn.classList.contains('active')) {
    navCategorias.querySelectorAll('.btn-cat').forEach(btn => btn.classList.remove('active'));
    todasBtn.classList.add('active');
  }
}

/* ===========================
   FUNCIÓN DE BÚSQUEDA FLEXIBLE
=========================== */
function busquedaFlexible(textoBusqueda, textoProducto) {
  if (!textoBusqueda) return true;
  
  const busqueda = textoBusqueda.toLowerCase().trim();
  const producto = textoProducto.toLowerCase().trim();
  
  if (producto.includes(busqueda)) {
    return true;
  }
  
  const palabrasBusqueda = busqueda.split(/\s+/).filter(palabra => palabra.length > 0);
  const palabrasProducto = producto.split(/\s+/).filter(palabra => palabra.length > 0);
  
  if (palabrasBusqueda.length === 1) {
    const palabra = palabrasBusqueda[0];
    return palabrasProducto.some(palabraProd => 
      palabraProd.includes(palabra) || palabra.includes(palabraProd)
    );
  }
  
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
   FUNCIONES DE PAGINACIÓN
=========================== */
function actualizarProductosFiltrados() {
    const searchInput = document.querySelector('.input__search');
    const searchText = searchInput ? searchInput.value.trim() : '';
    const activeButton = document.querySelector('.btn-cat.active');
    const activeCategory = activeButton ? activeButton.dataset.cat : 'todas';
    
    PRODUCTOS_FILTRADOS = CATALOGO.filter(producto => {
        const categoriaSlug = producto.categoria 
            ? 'cat-' + producto.categoria.toLowerCase().replace(/\s+/g, '-')
            : 'cat-general';
        
        const categoriaMatch = activeCategory === 'todas' || 
                              categoriaSlug === activeCategory;
        
        let busquedaMatch = true;
        if (searchText) {
            const titulo = producto.titulo || producto.nombre || '';
            const categoriaTexto = producto.categoria || '';
            busquedaMatch = busquedaFlexible(searchText, titulo) || 
                           busquedaFlexible(searchText, categoriaTexto);
        }
        
        return categoriaMatch && busquedaMatch;
    });
    
    return PRODUCTOS_FILTRADOS;
}

function renderizarPaginacion() {
    if (!paginacionContainer) return;
    
    const totalProductos = PRODUCTOS_FILTRADOS.length;
    const totalPaginas = Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA);
    
    paginacionContainer.innerHTML = '';
    
    if (totalPaginas <= 1) {
        paginacionContainer.style.display = 'none';
        return;
    }
    
    paginacionContainer.style.display = 'flex';
    
    // Botón Anterior
    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${PAGINA_ACTUAL === 1 ? 'disabled' : ''}`;
    liPrev.innerHTML = `
        <a class="page-link" href="#" aria-label="Anterior">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    if (PAGINA_ACTUAL > 1) {
        liPrev.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarPagina(PAGINA_ACTUAL - 1);
        });
    }
    paginacionContainer.appendChild(liPrev);
    
    // Botones de páginas
    const maxBotones = window.innerWidth < 768 ? 3 : 5;
    let inicio = Math.max(1, PAGINA_ACTUAL - Math.floor(maxBotones / 2));
    let fin = Math.min(totalPaginas, inicio + maxBotones - 1);
    
    if (fin - inicio + 1 < maxBotones) {
        inicio = Math.max(1, fin - maxBotones + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === PAGINA_ACTUAL ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        
        li.addEventListener('click', (e) => {
            e.preventDefault();
            if (i !== PAGINA_ACTUAL) {
                cambiarPagina(i);
            }
        });
        
        paginacionContainer.appendChild(li);
    }
    
    // Botón Siguiente
    const liNext = document.createElement('li');
    liNext.className = `page-item ${PAGINA_ACTUAL === totalPaginas ? 'disabled' : ''}`;
    liNext.innerHTML = `
        <a class="page-link" href="#" aria-label="Siguiente">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    if (PAGINA_ACTUAL < totalPaginas) {
        liNext.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarPagina(PAGINA_ACTUAL + 1);
        });
    }
    paginacionContainer.appendChild(liNext);
}

function cambiarPagina(nuevaPagina) {
    PAGINA_ACTUAL = nuevaPagina;
    renderizarProductosPagina();
    renderizarPaginacion();
    
    const catalogoSection = document.querySelector('.catalogo');
    if (catalogoSection) {
        window.scrollTo({
            top: catalogoSection.offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

function renderizarProductosPagina() {
    if (!contenedor || PRODUCTOS_FILTRADOS.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-white">No hay productos disponibles</p>';
        return;
    }
    
    const inicio = (PAGINA_ACTUAL - 1) * PRODUCTOS_POR_PAGINA;
    const fin = inicio + PRODUCTOS_POR_PAGINA;
    const productosPagina = PRODUCTOS_FILTRADOS.slice(inicio, fin);
    
    contenedor.innerHTML = "";
    
    const grid = document.createElement("div");
    grid.className = "grid-catalogo";
    
    const updateGridLayout = () => {
        if (window.innerWidth >= 1024) {
            grid.style.gridTemplateColumns = "repeat(3, 1fr)";
        } else if (window.innerWidth >= 768) {
            grid.style.gridTemplateColumns = "repeat(2, 1fr)";
        } else {
            grid.style.gridTemplateColumns = "1fr";
        }
    };
    
    grid.style.display = "grid";
    grid.style.gap = "2rem";
    grid.style.justifyContent = "center";
    updateGridLayout();
    
    window.addEventListener('resize', updateGridLayout);
    
    productosPagina.forEach(camisa => {
        const categoriaSlug = camisa.categoria 
            ? 'cat-' + camisa.categoria.toLowerCase().replace(/\s+/g, '-')
            : 'cat-general';

        const link = document.createElement("a");
        link.href = `producto.html?id=${camisa.id}`;
        link.className = "link-card";
        link.style.textDecoration = "none";
        link.style.display = "block";

        const card = document.createElement("div");
        card.className = "card-camisa card-index";
        card.dataset.id = camisa.id;
        card.dataset.categoria = categoriaSlug;

        const imagen = camisa.imagenes && camisa.imagenes.length > 0 
            ? camisa.imagenes[0] 
            : 'images/color.png';

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

        link.appendChild(card);
        grid.appendChild(link);
    });

    contenedor.appendChild(grid);
    
    setTimeout(() => {
        if (window.BookmarkInit && typeof window.BookmarkInit === 'function') {
            window.BookmarkInit();
        }
        
        mostrarInfoPaginacion(PRODUCTOS_FILTRADOS.length);
        
        document.dispatchEvent(new CustomEvent("catalogo:renderizado"));
        console.log(`✅ Página ${PAGINA_ACTUAL} renderizada (${productosPagina.length} productos)`);
    }, 300);
}

function mostrarInfoPaginacion(totalProductos) {
    const infoContainer = document.querySelector('.row-info-catalogo');
    if (!infoContainer) return;
    
    const oldInfo = document.querySelector('.paginacion-info');
    if (oldInfo) oldInfo.remove();
    
    const inicio = (PAGINA_ACTUAL - 1) * PRODUCTOS_POR_PAGINA + 1;
    const fin = Math.min(PAGINA_ACTUAL * PRODUCTOS_POR_PAGINA, totalProductos);
    const totalPaginas = Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA);
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'paginacion-info mt-2 text-center text-white opacity-75';
    infoDiv.style.fontSize = '0.9rem';
    infoDiv.innerHTML = `
        Mostrando ${inicio}-${fin} de ${totalProductos} camisas
        (Página ${PAGINA_ACTUAL} de ${totalPaginas})
    `;
    
    const pagContainer = document.querySelector('.pagination-container');
    if (pagContainer) {
        pagContainer.insertAdjacentElement('beforebegin', infoDiv);
    }
}

/* ===========================
   FILTRAR CATÁLOGO
=========================== */
function filtrarCatalogo() {
    console.log('🔍 Aplicando filtros...');
    
    PAGINA_ACTUAL = 1;
    actualizarProductosFiltrados();
    renderizarProductosPagina();
    renderizarPaginacion();
    
    if (PRODUCTOS_FILTRADOS.length === 0) {
        const searchInput = document.querySelector('.input__search');
        const searchText = searchInput ? searchInput.value.trim() : '';
        const activeButton = document.querySelector('.btn-cat.active');
        const activeCategory = activeButton ? activeButton.dataset.cat : 'todas';
        
        mostrarMensajeNoEncontrado(searchText || activeCategory);
    }
}

/* ===========================
   MOSTRAR TARJETA "NOT FOUND"
=========================== */
function mostrarMensajeNoEncontrado(searchTerm) {
    const grid = contenedor.querySelector('.grid-catalogo');
    if (grid) grid.style.display = 'none';
    
    const msg = document.createElement('div');
    msg.className = 'tarjeta-wrapper-3d';
    msg.innerHTML = `
        <div class="tarjeta-back"></div>
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
    
    contenedor.appendChild(msg);
    inicializarMovimiento3D();
    
    // Ocultar paginación cuando no hay resultados
    if (paginacionContainer) {
        paginacionContainer.style.display = 'none';
    }
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
    
    card.addEventListener('mousemove', manejarMovimiento);
    card.addEventListener('mouseleave', resetMovimiento);
}

/* ===========================
   INICIALIZAR EVENTOS DE BÚSQUEDA
=========================== */
function inicializarBusqueda() {
    const searchInput = document.querySelector('.input__search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filtrarCatalogo();
            }, 300);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                filtrarCatalogo();
            }
        });
        
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

        const idsVistos = new Set();
        CATALOGO = data.filter(item => {
            if (idsVistos.has(item.id)) {
                console.warn(`⚠️ Duplicado omitido: ${item.id}`);
                return false;
            }
            idsVistos.add(item.id);
            return true;
        });

        console.log(`✅ ${CATALOGO.length} catálogo de camisas únicas cargadas`);
        
        PRODUCTOS_FILTRADOS = [...CATALOGO];
        renderizarProductosPagina();
        await cargarYRenderizarCategorias();
        renderizarPaginacion();
        
        setTimeout(() => {
            inicializarBusqueda();
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
    const searchInput = document.querySelector('.input__search');
    if (searchInput) {
        searchInput.value = '';
    }
    
    const todasBtn = navCategorias.querySelector('.btn-cat[data-cat="todas"]');
    if (todasBtn) {
        navCategorias.querySelectorAll('.btn-cat').forEach(btn => {
            btn.classList.remove('active');
        });
        todasBtn.classList.add('active');
    }
    
    PAGINA_ACTUAL = 1;
    filtrarCatalogo();
}

/* ===========================
   INICIALIZACIÓN
=========================== */
function iniciarCatalogo() {
    console.log('🏁 Iniciando catálogo con paginación...');
    
    if (window.supabase) {
        cargarCatalogoCompleto();
    } else {
        document.addEventListener('supabase:ready', function() {
            cargarCatalogoCompleto();
        }, { once: true });
    }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
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