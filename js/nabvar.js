// =========================================
// NAVBAR CON POPUP
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const navbarToggler = document.getElementById('navbarToggler');
    const navPopup = document.getElementById('navPopup');
    const navbar = document.getElementById('navbar');
    const btnCats = document.querySelectorAll('.btn-cat');
    const popupLinks = document.querySelectorAll('.popup-link, .popup-contacto');
    const desktopLinks = document.querySelectorAll('.nav-links-desktop a, .cta-contacto');
    
    // =========================================
    // TOGGLE POPUP (MÓVIL)
    // =========================================
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se cierre inmediatamente
            this.classList.toggle('opened');
            navPopup.classList.toggle('active');
        });
        
        // Cerrar popup al hacer clic en un enlace
        popupLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarToggler.classList.remove('opened');
                navPopup.classList.remove('active');
                
                // Si es el botón Contacto, hacer scroll suave
                if (this.classList.contains('popup-contacto')) {
                    document.getElementById('contacto')?.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Cerrar popup al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!navbarToggler.contains(e.target) && !navPopup.contains(e.target)) {
                navbarToggler.classList.remove('opened');
                navPopup.classList.remove('active');
            }
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                navbarToggler.classList.remove('opened');
                navPopup.classList.remove('active');
            }
        });
    }
    
    // =========================================
    // FUNCIONALIDAD DESKTOP
    // =========================================
    desktopLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#contacto' || 
                this.classList.contains('cta-contacto')) {
                e.preventDefault();
                document.getElementById('contacto')?.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // =========================================
    // FILTRADO CATEGORÍAS
    // =========================================
    btnCats.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos
            btnCats.forEach(b => b.classList.remove('active'));
            // Agregar al clickeado
            this.classList.add('active');
            
            // Tu lógica de filtrado
            const cat = this.getAttribute('data-cat');
            console.log('Categoría seleccionada:', cat);
            // FiltraCamisas(cat); // Tu función de filtrado
        });
    });
    
    // =========================================
    // NAVBAR SCROLL EFFECT (tu código original)
    // =========================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight * 0.15) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // =========================================
    // BÚSQUEDA
    // =========================================
    const inputSearch = document.querySelector('.input__search');
    if (inputSearch) {
        inputSearch.addEventListener('input', function() {
            const term = this.value.toLowerCase().trim();
            if (term.length >= 2) {
                console.log('Buscando:', term);
                // buscarCamisas(term); // Tu función de búsqueda
            }
        });
        
        inputSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                console.log('Búsqueda con Enter:', this.value);
                // buscarCamisas(this.value); // Tu función de búsqueda
            }
        });
    }
    
    // =========================================
    // REVEAL ON SCROLL (tu código original)
    // =========================================
    const io = new IntersectionObserver((entries)=> {
        entries.forEach(en => {
            if(en.isIntersecting) en.target.classList.add('show');
        });
    }, {threshold: 0.12});
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});