// catalogo.js - VERSIÓN QUE RESPETA EL DISEÑO
console.log("📦 catalogo.js cargado");

const contenedor = document.getElementById("section-catalogo-completo");
let CATALOGO = [];

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
    // Crear ENLACE que envuelve la tarjeta (para hacer click en toda la tarjeta)
    const link = document.createElement("a");
    link.href = `producto.html?id=${camisa.id}`;
    link.className = "link-card";
    link.style.textDecoration = "none";
    link.style.display = "block";

    // Crear tarjeta CON EL DISEÑO CORRECTO
    const card = document.createElement("div");
    card.className = "card-camisa card-index";
    card.dataset.id = camisa.id;

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
    console.log("✅ Catálogo renderizado CON DISEÑO CORRECTO");
  }, 300);
}

/* ===========================
   CARGAR DESDE SUPABASE
=========================== */
async function cargarCatalogo() {
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

  } catch (error) {
    console.error("❌ Error:", error);
    contenedor.innerHTML = '<p class="text-center text-white">Error cargando catálogo</p>';
  }
}

/* ===========================
   INICIAR CUANDO SUPABASE ESTÉ LISTO
=========================== */
if (window.supabase) {
  // Si ya está cargado
  cargarCatalogo();
} else {
  // Esperar a que cargue
  document.addEventListener('supabase:ready', function() {
    cargarCatalogo();
  }, { once: true });
}

// Timeout de seguridad
setTimeout(() => {
  if (contenedor && contenedor.innerHTML === '') {
    console.log('⏰ Timeout - cargando catálogo...');
    cargarCatalogo();
  }
}, 2000);