const data = {
  ...window.motor,
  ...window.anime
};

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!data[id]) {
  document.getElementById("producto-container").innerHTML =
    "<p style='text-align:center'>Producto no encontrado</p>";
  throw new Error("Producto no encontrado");
}

const p = data[id];

document.getElementById("producto-container").innerHTML = `
<div class="card-camisa card-producto">
<span class="categoria-camisa" id="categoriaProducto">${p.categoria}</span>
  
  <!-- Carrusel Bootstrap normal (para móvil) -->
  <div id="carouselBootstrap" class="carousel slide">
    <div class="carousel-indicators">
      ${p.imagenes.map((_, i) => `
        <button 
          type="button"
          data-bs-target="#carouselBootstrap"
          data-bs-slide-to="${i}"
          class="${i === 0 ? 'active' : ''}"
          ${i === 0 ? 'aria-current="true"' : ''}
          aria-label="Slide ${i + 1}">
        </button>
      `).join("")}
    </div>

    <div class="carousel-inner">
      ${p.imagenes.map((img,i)=>`
        <div class="carousel-item ${i===0?'active':''}">
          <img src="${img}" class="img-card">
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
  
  <!-- Carrusel simple sin zoom (para desktop) -->
  <div class="carousel-simple">
    <div class="carousel-simple-inner">
      ${p.imagenes.map((img, i) => `
        <div class="carousel-simple-item ${i === 0 ? 'active' : ''}">
          <img src="${img}" class="img-card" alt="${p.nombre} ${i + 1}">
        </div>
      `).join("")}
    </div>
    
    <!-- Botones de navegación con iconos Phosphor -->
    <button class="carousel-simple-btn prev">
      <i class="ph ph-caret-left"></i>
    </button>
    <button class="carousel-simple-btn next">
      <i class="ph ph-caret-right"></i>
    </button>
    
    <!-- Indicadores -->
    <div class="carousel-simple-controls">
      ${p.imagenes.map((_, i) => `
        <div class="carousel-simple-indicator ${i === 0 ? 'active' : ''}" 
             data-index="${i}"></div>
      `).join("")}
    </div>
  </div>

  <section class="section-camisa">
    <h2 class="lbl-nombre-camisa">${p.nombre}</h2>
    <p class="lbl-descripcion">${p.descripcion}</p>
    <h2 class="price-camisa">${p.precio}</h2>

    <p class="lbl-tallas">Tallas:</p>
    <div class="tallas-camisa">
      ${p.tallas.map(t => `<div class="tag talla">${t}</div>`).join("")}
    </div>

    <div class="color">
      <p class="lbl-color-elg">Puedes elegir el color</p>
      <img src="${p.colorImg}" class="img-color-camisa" alt="Color ${p.nombre}">
    </div>
  </section>
</div>
`;

// Script para el carrusel simple (solo se activa en desktop)
document.addEventListener('DOMContentLoaded', function() {
  const carouselSimple = document.querySelector('.carousel-simple');
  
  // Solo inicializar si estamos en desktop (el carrusel simple es visible)
  if (carouselSimple && window.innerWidth >= 992) {
    const items = carouselSimple.querySelectorAll('.carousel-simple-item');
    const indicators = carouselSimple.querySelectorAll('.carousel-simple-indicator');
    const prevBtn = carouselSimple.querySelector('.carousel-simple-btn.prev');
    const nextBtn = carouselSimple.querySelector('.carousel-simple-btn.next');
    
    let currentIndex = 0;
    const totalItems = items.length;
    
    function showSlide(index) {
      // Ocultar todos
      items.forEach(item => item.classList.remove('active'));
      indicators.forEach(indicator => indicator.classList.remove('active'));
      
      // Mostrar el actual
      items[index].classList.add('active');
      indicators[index].classList.add('active');
      
      currentIndex = index;
    }
    
    function nextSlide() {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= totalItems) nextIndex = 0;
      showSlide(nextIndex);
    }
    
    function prevSlide() {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = totalItems - 1;
      showSlide(prevIndex);
    }
    
    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Indicadores
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => showSlide(index));
    });
  }
});