function cargarCatalogoMotor() {

    if (!window.motor) {
        console.error("Objeto motor no encontrado");
        return;
    }

    document.querySelectorAll(".card-camisa[data-id]").forEach(card => {

        const id = card.dataset.id;
        const data = window.motor[id];

        if (!data) {
            console.warn("No hay datos para:", id);
            return;
        }

        card.querySelector(".categoria-camisa").textContent = data.categoria;
        card.querySelector(".lbl-nombre-camisa").textContent = data.nombre;
        card.querySelector(".price-camisa").textContent = data.precio;

        const img = card.querySelector(".img-card");
        if (data.imagenes?.length) {
            img.src = data.imagenes[0];
            img.alt = data.nombre;
        }
    });
}
