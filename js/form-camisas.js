(function () {

  const KEY = "camisas_seleccionadas";

  const get = () => JSON.parse(localStorage.getItem(KEY)) || [];

  function syncCard(id, checked) {
    const card = document.querySelector(
      `.card-camisa[data-id="${id}"]`
    );
    if (!card) return;

    card.classList.toggle("card-selected", checked);

    const checkbox = card.querySelector(".ui-bookmark input");
    if (checkbox) checkbox.checked = checked;
  }

  function init() {
    const contenedor = document.getElementById("camisasSeleccionadas");
    const inputHidden = document.getElementById("camisasInput");

    if (!contenedor || !inputHidden || !window.motor) return;

    function render() {
      const ids = get();
      contenedor.innerHTML = "";

      const nombres = [];

      ids.forEach(id => {
        const data = window.motor[id];
        if (!data) return;

        nombres.push(data.nombre);

        const chip = document.createElement("div");
        chip.className = "camisa-chip";
        chip.innerHTML = `
          <span>${data.nombre}</span>
          <button type="button">✕</button>
        `;

        chip.querySelector("button").addEventListener("click", () => {
          const nuevas = get().filter(x => x !== id);
          localStorage.setItem(KEY, JSON.stringify(nuevas));
          syncCard(id, false);
          window.dispatchEvent(new CustomEvent("camisas:update"));
        });

        contenedor.appendChild(chip);
      });

      inputHidden.value = nombres.join(", ");
    }

    //  EVENTO ÚNICO DE SINCRONIZACIÓN
    window.addEventListener("camisas:update", render);

    render();
  }

  // esperar DOM + fetch
  const wait = setInterval(() => {
    if (
      document.getElementById("camisasSeleccionadas") &&
      window.motor &&
      document.querySelector(".card-camisa")
    ) {
      clearInterval(wait);
      init();
    }
  }, 100);

})();
