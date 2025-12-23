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

    /* 3️⃣ LÍMITE POR CORREO + DÍA */
    if (window.FormLimit) {
      const r = window.FormLimit.puedeEnviar();
      if (!r.ok) {
        toast("error", r.msg);
        return;
      }
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
        <ul>
          ${camisas.map(c => `<li>${c}</li>`).join("")}
        </ul>
        <p>📧 Se enviará un correo de confirmación</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#CB2D2D"
    });

    if (!confirm.isConfirmed) return;

    /* 7️⃣ ENVÍO */
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!res.ok) throw new Error();

      /* REGISTRAR ENVÍO */
      if (window.FormLimit) {
        window.FormLimit.registrarEnvio();
      }

      toast(
        "success",
        "Te enviamos un correo de confirmación. Debes confirmarlo para completar el pedido."
      );

      form.reset();
      window.dispatchEvent(new CustomEvent("camisas:update"));

    } catch {
      toast("error", "Error al enviar. Intenta nuevamente.");
    }
  });

})();
