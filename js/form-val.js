(function () {

    const form = document.getElementById("contactForm");
    if (!form) return;

    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const messageInput = form.querySelector('textarea[name="message"]');
    const btn = document.getElementById("btn-enviar");

    const fields = [
        { input: nameInput, validate: validateName },
        { input: emailInput, validate: validateEmail },
        { input: messageInput, validate: validateMessage }
    ];

    // REGEX
    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const regexEmail = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail|yahoo|icloud|protonmail)\.(com|es|net)$/;

    const malasPalabras = [
    "puta","puto","putita","putero",
    "idiota","imbecil","estupido",
    "verga","culero","mierda",
    "pendejo","pendeja","cabron",
    "chingar","cerote","maricon",
    "pedo","tetas","pito","miado"
    ];

    function contieneGroserias(texto) {
        const t = texto.toLowerCase();
        return malasPalabras.some(p => t.includes(p));
    }

    function setError(input, msg) {
        const error = input.nextElementSibling;
        error.textContent = msg;
        error.classList.add("active");
        input.classList.add("error");
        input.classList.remove("valid");
    }

    function setValid(input) {
        const error = input.nextElementSibling;
        error.textContent = "";
        error.classList.remove("active");
        input.classList.remove("error");
        input.classList.add("valid");
    }

    function validateName() {
        const val = nameInput.value.trim();
        if (!val) return setError(nameInput, "El nombre es obligatorio"), false;
        if (!regexNombre.test(val))
        return setError(nameInput, "Solo letras, espacios y acentos"), false;
        setValid(nameInput);
        return true;
    }

    function validateEmail() {
        const val = emailInput.value.trim();
        if (!val) return setError(emailInput, "El correo es obligatorio"), false;
        if (!regexEmail.test(val))
        return setError(emailInput, "Correo no válido"), false;
        setValid(emailInput);
        return true;
    }

    function validateMessage() {
        const val = messageInput.value.trim();
        if (val.length < 5)
        return setError(messageInput, "Mensaje demasiado corto"), false;
        if (contieneGroserias(val))
        return setError(messageInput, "Lenguaje inapropiado"), false;
        setValid(messageInput);
        return true;
    }

    function checkForm() {
        return fields.every(f => f.validate());
    }


    // VALIDACIÓN EN TIEMPO REAL
    fields.forEach(f => {
        f.input.addEventListener("input", () => {
        f.validate();
        checkForm();
        });
    });

    // 🔒 BLOQUEO FINAL
    form.addEventListener("submit", e => {
        if (!checkForm()) {
            e.preventDefault();
        }
    });

})();
