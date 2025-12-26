(function () {

  const form = document.getElementById("contactForm");
  if (!form) return;

  const camisasInput = document.getElementById("camisasInput");
  const emailInput = form.querySelector('input[name="email"]');
  const nameInput = form.querySelector('input[name="name"]');
  const messageInput = form.querySelector('textarea[name="message"]');

  /* =========================
     TOAST
  ========================== */
  function toast(icon, msg) {
    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon,
      title: msg,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  /* =========================
     HELPERS
  ========================== */
  function obtenerCamisas() {
    return camisasInput.value
      ? camisasInput.value.split(",").map(c => c.trim())
      : [];
  }

  function camposVacios() {
    return (
      !nameInput.value.trim() ||
      !emailInput.value.trim() ||
      !messageInput.value.trim()
    );
  }

  function calcularTotal() {
    const items = JSON.parse(
      localStorage.getItem("camisas_seleccionadas")
    ) || [];

    let total = 0;

    items.forEach(item => {
      const producto =
        window.motor[item.id] || window.anime?.[item.id];

      if (!producto) return;

      total += Number(producto.precio) * Number(item.cantidad);
    });

    return Number(total.toFixed(2));
  }


  /* =========================
     VALIDAR DOMINIO REAL (MX)
     Cloudflare DNS – GRATIS
  ========================== */
  async function dominioTieneMX(email) {
    const dominio = email.split("@")[1];
    if (!dominio) return false;

    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${dominio}&type=MX`,
        { headers: { accept: "application/dns-json" } }
      );

      const data = await res.json();
      return Array.isArray(data.Answer) && data.Answer.length > 0;
    } catch {
      return false;
    }
  }

  /* =========================
     SUBMIT
  ========================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const total = calcularTotal();

    /* 1️⃣ CAMPOS VACÍOS */
    if (camposVacios()) {
      toast("warning", "Completa todos los campos");
      return;
    }

    /* 2️⃣ VALIDACIONES VISUALES */
    if (document.querySelector(".error-msg.active")) {
      toast("error", "Corrige los errores del formulario");
      return;
    }

    /* 4️⃣ VALIDAR DOMINIO REAL */
    toast("info", "Verificando correo…");
    const mxOK = await dominioTieneMX(emailInput.value.trim());

    if (!mxOK) {
      toast("error", "El correo no existe o no recibe emails");
      return;
    }

    /* 5️⃣ CAMISAS */
    const camisas = obtenerCamisas();
    if (!camisas.length) {
      toast("warning", "No seleccionaste camisas");
      return;
    }

    /* 6️⃣ CONFIRMACIÓN */
    const confirm = await Swal.fire({
      title: "Confirmar pedido",
      html: `
        <p><strong>Camisas:</strong></p>
        <ul style="text-align:left; margin-left:1rem;">
          ${camisas.map(c => `<li>${c}</li>`).join("")}
        </ul>

        <hr style="margin:12px 0">

        <p style="font-size:1.1rem">
          <strong>Total:</strong>
          <span style="color:#CB2D2D; font-weight:600">
            $${total.toFixed(2)}
          </span>
        </p>

        <p style="font-size:.9rem; opacity:.8">
          📦 Tu pedido será revisado y te contactaremos por correo
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#CB2D2D"
    });


    if (!confirm.isConfirmed) return;

    /* 7️⃣ ENVÍO A SUPABASE */
    try {
      const total = calcularTotal();

      const { error } = await window.supabase
        .from("pedidos")
        .insert({
          email: emailInput.value.trim().toLowerCase(),
          nombre: nameInput.value.trim(),
          camisas: obtenerCamisas().join(", "),
          mensaje: messageInput.value.trim(),
          total: total
        });

      if (error) {
        if (error.code === "23505") {
          toast("error", "Ya enviaste un pedido hoy");
        } else {
          toast("error", "Error al registrar el pedido");
        }
        return;
      }

      toast(
        "success",
        "Pedido enviado correctamente"
      );

      form.reset();
      localStorage.removeItem("camisas_seleccionadas");
      window.dispatchEvent(new CustomEvent("camisas:update"));

    } catch {
      toast("error", "Error de conexión");
    }
  });

})();
