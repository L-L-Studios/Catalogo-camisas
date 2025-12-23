(function () {

  const LIMIT = 1; // 🔒 máximo de envíos por día
  const FORM_KEY = "form_envios";
  const EMAIL_KEY = "emails_usados";

  const form = document.getElementById("contactForm");
  const btn = document.getElementById("btn-enviar");
  const status = document.getElementById("formStatus");
  const emailInput = form?.querySelector('input[name="email"]');

  if (!form || !btn || !status || !emailInput) return;

  // 📅 fecha actual YYYY-MM-DD
  const hoy = () => new Date().toISOString().split("T")[0];

  const getData = () =>
    JSON.parse(localStorage.getItem(FORM_KEY)) || { date: hoy(), count: 0 };

  const getEmails = () =>
    JSON.parse(localStorage.getItem(EMAIL_KEY)) || {};

  function guardarEnvio(email) {
    const data = getData();
    localStorage.setItem(
      FORM_KEY,
      JSON.stringify({ date: hoy(), count: data.count + 1 })
    );

    const emails = getEmails();
    emails[email] = hoy();
    localStorage.setItem(EMAIL_KEY, JSON.stringify(emails));
  }

  function tiempoRestante() {
    const ahora = new Date();
    const finDia = new Date();
    finDia.setHours(24, 0, 0, 0);
    const diff = finDia - ahora;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  function bloquear(msg) {
    btn.disabled = true;
    status.textContent = msg;
    status.style.display = "block";
    status.classList.remove("ok");
  }

  function desbloquear() {
    btn.disabled = false;
    status.style.display = "none";
  }

  // 🔄 reset diario automático
  const data = getData();
  if (data.date !== hoy()) {
    localStorage.removeItem(FORM_KEY);
    localStorage.removeItem(EMAIL_KEY);
    desbloquear();
  } else if (data.count >= LIMIT) {
    bloquear(`Límite diario alcanzado. Intenta en ${tiempoRestante()}`);
  }

  // 🌐 API GLOBAL para form-notif.js
  window.FormLimit = {
    puedeEnviar() {
      const data = getData();
      const email = emailInput.value.trim().toLowerCase();
      const emails = getEmails();

      // honeypot
      if (form._gotcha?.value) {
        return { ok: false, msg: "Spam detectado" };
      }

      if (emails[email] === hoy()) {
        return { ok: false, msg: "Este correo ya envió un mensaje hoy." };
      }

      if (data.count >= LIMIT) {
        return {
          ok: false,
          msg: `Límite diario alcanzado. Intenta en ${tiempoRestante()}`
        };
      }

      return { ok: true };
    },

    registrarEnvio() {
      const email = emailInput.value.trim().toLowerCase();
      guardarEnvio(email);
      status.textContent = "Mensaje enviado correctamente ✔";
      status.classList.add("ok");
      status.style.display = "block";
    }
  };

})();
