(function () {

  const KEY = "camisas_seleccionadas";

  const get = () => JSON.parse(localStorage.getItem(KEY)) || [];
  const set = data => localStorage.setItem(KEY, JSON.stringify(data));

  function toast(icon, msg) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title: msg,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        popup: "swal-toast-avenir"
      }
    });
  }

  function createBookmark(id, card) {
    const label = document.createElement("label");
    label.className = "ui-bookmark";
    label.setAttribute("data-tooltip", "Elegir");

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

    function estaConfigurada() {
      return get().some(item => item.id === id);
    }

    // estado inicial
    if (estaConfigurada()) {
      input.checked = true;
      card.classList.add("card-selected");
    }

    label.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      // ❌ no configurada
      if (!estaConfigurada()) {
        toast("info", "Configura talla, color y cantidad");
        return;
      }

      // ✅ quitar
      const data = get().filter(item => item.id !== id);
      set(data);

      input.checked = false;
      card.classList.remove("card-selected");

      window.dispatchEvent(new CustomEvent("camisas:update"));
    });

    return label;
  }

  window.BookmarkInit = () => {
    document.querySelectorAll(".card-camisa[data-id]").forEach(card => {
      if (card.querySelector(".ui-bookmark")) return;

      const id = card.dataset.id;
      card.appendChild(createBookmark(id, card));
    });
  };

})();
