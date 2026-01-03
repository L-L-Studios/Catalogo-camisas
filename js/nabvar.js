// =========================================
// NAVBAR CON POPUP
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const navbarToggler = document.getElementById('navbarToggler');
    const navPopup = document.getElementById('navPopup');
    const navbar = document.getElementById('navbar');
    const popupLinks = document.querySelectorAll('.popup-link, .popup-contacto');
    const desktopLinks = document.querySelectorAll('.nav-links-desktop a, .cta-contacto, .popup-carrito');
    
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
                    document.getElementById('contact')?.scrollIntoView({
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
    // REVEAL ON SCROLL (tu código original)
    // =========================================
    const io = new IntersectionObserver((entries)=> {
        entries.forEach(en => {
            if(en.isIntersecting) en.target.classList.add('show');
        });
    }, {threshold: 0.12});
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});