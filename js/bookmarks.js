// bookmarks.js - ACTUALIZADO CON LÍMITE DE 6 Y SIN DUPLICADOS
console.log('🔖 bookmarks.js cargado');

(function () {
  const KEY = "camisas_seleccionadas";
  let inicializado = false;

  function initBookmarks() {
    if (inicializado) {
      console.log('🔖 Bookmarks ya inicializados');
      return;
    }
    
    console.log('🔖 Inicializando bookmarks...');
    
    const get = () => JSON.parse(localStorage.getItem(KEY)) || [];
    
    function createBookmark(id, card) {
      // Verificar si ya tiene bookmark
      if (card.querySelector('.ui-bookmark')) {
        return;
      }

      const label = document.createElement("label");
      label.className = "ui-bookmark";
      label.setAttribute("data-tooltip", "Puedes quitarla del pedido");

      label.innerHTML = `
        <input type="checkbox">
        <div class="bookmark">
          <svg viewBox="0 0 512 512" aria-hidden="true">
            <path d="M499.453,116.763L343.871,59.708c-5.406-1.985-11.41-1.43-16.361,1.508
            c0,0-4.04,42.46-71.51,42.46s-71.51-42.46-71.51-42.46c-4.951-2.938-10.954-3.492-16.354-1.508
            l-155.59,57.056c-9.098,3.329-14.262,12.946-12.028,22.364l16.197,68.416
            c2.148,9.048,10.478,15.237,19.761,14.689l61.864-3.678v206.77
            c0,15.543,12.598,28.14,28.134,28.14h259.052
            c15.535,0,28.133-12.598,28.133-28.14v-206.77l61.865,3.678
            c9.283,0.548,17.612-5.641,19.761-14.689l16.197-68.416
            c2.234-9.418-2.93-19.035-12.028-22.364z"/>
          </svg>
        </div>
      `;

      const input = label.querySelector("input");
      const estaEnCarrito = () => get().some(item => item.id === id);

      if (estaEnCarrito()) {
        input.checked = true;
        card.classList.add("card-selected");
      }

      // Bookmark marca/desmarca del carrito
      label.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // ❌ Si NO está seleccionado, NO se puede agregar desde el index
        if (!input.checked) {
          Swal.fire({
            icon: "info",
            title: "Selecciona desde la tarjeta",
            text: "Abre la tarjeta y elige talla, color y cantidad.",
            toast: true,
            position: "top-end",   // 👉 esquina superior derecha
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            showCloseButton: true
          });
          return;
        }

        // ✔️ Si ya estaba seleccionado, entonces SÍ se puede quitar
        const nuevasCamisas = get().filter(item => item.id !== id);
        localStorage.setItem(KEY, JSON.stringify(nuevasCamisas));
        card.classList.remove("card-selected");
        input.checked = false;

        window.dispatchEvent(new CustomEvent("camisas:update"));
      });


      return label;
    }

    // Buscar tarjetas
    const cards = document.querySelectorAll('.card-camisa.card-index[data-id]');
    console.log(`🔖 Encontradas ${cards.length} tarjetas para bookmarks`);
    
    cards.forEach(card => {
      if (!card.querySelector('.ui-bookmark')) {
        const id = card.dataset.id;
        const bookmark = createBookmark(id, card);
        card.appendChild(bookmark);
      }
    });
    
    inicializado = true;
    console.log('✅ Bookmarks inicializados');
  }

  window.BookmarkInit = initBookmarks;

  // Escuchar evento de renderizado
  document.addEventListener('catalogo:renderizado', function() {
    console.log('🎯 Catálogo renderizado, inicializando bookmarks...');
    setTimeout(initBookmarks, 200);
  });

  // También intentar después de un tiempo
  setTimeout(() => {
    if (!inicializado) {
      const cards = document.querySelectorAll('.card-camisa[data-id]');
      if (cards.length > 0) {
        console.log('⏰ Timeout: inicializando bookmarks manualmente');
        initBookmarks();
      }
    }
  }, 2000);

})();