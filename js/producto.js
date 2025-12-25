/* =====================================================
   producto.js — COMPATIBLE CON motor + anime
===================================================== */

// 🔹 Unimos todas las categorías
const data = {
  ...window.motor,
  ...window.anime
};

// 🔹 ID desde URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// 🔹 Validación fuerte
if (!id || !data[id]) {
  document.getElementById("producto-container").innerHTML =
    "<p style='text-align:center'>Producto no encontrado</p>";
  throw new Error("Producto no encontrado");
}

const p = data[id];

const precio = typeof p.precio === "string"
  ? parseFloat(p.precio.replace("$", ""))
  : Number(p.precio);

function formatPrice(value) {
  const num = Number(value);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
}

document.getElementById("producto-container").innerHTML = `
<div class="card-camisa card-producto">
  <span class="categoria-camisa" id="categoriaProducto">${p.categoria}</span>

  <!-- ================= CARRUSEL MÓVIL (BOOTSTRAP) ================= -->
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
          <img src="${img}" class="img-card" alt="${p.nombre}">
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

  <!-- ================= CARRUSEL DESKTOP ================= -->
  <div class="carousel-simple d-none d-lg-block">
    <div class="carousel-simple-inner">
      ${p.imagenes.map((img, i) => `
        <div class="carousel-simple-item ${i === 0 ? 'active' : ''}">
          <img src="${img}" class="img-card" alt="${p.nombre} ${i + 1}">
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

  <!-- ================= INFO ================= -->
  <section class="section-camisa">
    <h2 class="lbl-nombre-camisa">${p.nombre}</h2>
    <p class="lbl-descripcion">${p.descripcion}</p>
    <h2 class="price-camisa">${formatPrice(p.precio)}</h2>


    <p class="lbl-tallas">Tallas: <span class="tallas"><strong>Selecciona</strong></span> </p>
    <div class="tallas-camisa">
      ${p.tallas.map(t => `<div class="tag talla">${t}</div>`).join("")}
    </div>

    <p class="lbl-color-elg">Color: <span class="color-nombre"><strong>Selecciona</strong></span></p>
    <div class="colores-camisa">
      ${(p.colores || []).slice(0, 4).map(c => `
        <div class="color-dot" 
             style="background:${c.hex}" 
             data-color="${c.name}"></div>
      `).join("")}
    </div>

    <div class="cantidad-box">
      <button class="btn-menos">−</button>
      <span class="cantidad">1</span>
      <button class="btn-mas">+</button>
    </div>

    <p class="subtotal">Subtotal: $<span id="subtotal">${precio.toFixed(2)}</span></p>

    <button class="btn-seleccionar">Seleccionar</button>

  </section>
</div>
`;

/* =====================================================
   CARRUSEL SIMPLE DESKTOP (INIT DESPUÉS DE RENDER)
===================================================== */

initCarouselSimple();

function initCarouselSimple() {
  const carousel = document.querySelector(".carousel-simple");
  if (!carousel || window.innerWidth < 992) return;

  const items = carousel.querySelectorAll(".carousel-simple-item");
  const indicators = carousel.querySelectorAll(".carousel-simple-indicator");
  const btnPrev = carousel.querySelector(".carousel-simple-btn.prev");
  const btnNext = carousel.querySelector(".carousel-simple-btn.next");

  let index = 0;
  const total = items.length;

  function showSlide(i) {
    items.forEach(el => el.classList.remove("active"));
    indicators.forEach(el => el.classList.remove("active"));

    items[i].classList.add("active");
    indicators[i].classList.add("active");
    index = i;
  }

  btnNext.addEventListener("click", () => {
    showSlide((index + 1) % total);
  });

  btnPrev.addEventListener("click", () => {
    showSlide((index - 1 + total) % total);
  });

  indicators.forEach((ind, i) => {
    ind.addEventListener("click", () => showSlide(i));
  });
}

let cantidad = 1;
const maxCantidad = 10;
const subtotalEl = document.getElementById("subtotal");

// 👉 TALLAS (unica)
const tallaTexto = document.querySelector(".tallas strong");

document.querySelectorAll(".tag.talla").forEach(btn => {
  btn.addEventListener("click", () => {
    // quitar active a todas
    document.querySelectorAll(".tag.talla")
      .forEach(b => b.classList.remove("active"));

    // activar solo la seleccionada
    btn.classList.add("active");

    // mostrar talla elegida
    tallaTexto.textContent = btn.textContent;
  });
});

// 👉 COLORES (single)
const colorNombre = document.querySelector(".color-nombre strong");

document.querySelectorAll(".color-dot").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-dot")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    colorNombre.textContent = btn.dataset.color;
  });
});

// 👉 CONTADOR
document.querySelector(".btn-mas").onclick = () => {
  if (cantidad < maxCantidad) {
    cantidad++;
    actualizarCantidad();
  }
};

document.querySelector(".btn-menos").onclick = () => {
  if (cantidad > 1) {
    cantidad--;
    actualizarCantidad();
  }
};

function actualizarCantidad() {
  document.querySelector(".cantidad").textContent = cantidad;
  subtotalEl.textContent = (cantidad * Number(p.precio)).toFixed(2);
}
