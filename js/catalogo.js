// js/catalogo.js - VERSIÓN CORREGIDA PARA FILTRADO Y BÚSQUEDA
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que se cargue el contenido dinámico
    setTimeout(() => {
        // Elementos del DOM
        const searchInput = document.querySelector('.input__search');
        const categoryButtons = document.querySelectorAll('.btn-cat');
        const categorySections = document.querySelectorAll('.section-cat');
        const contenedorCatalogo = document.querySelector('.contenedor-catalogo');
        
        // Función para activar la categoría "Todas" por defecto
        function activateDefaultCategory() {
            const todasBtn = document.querySelector('.btn-cat[data-cat="todas"]');
            if (todasBtn && !todasBtn.classList.contains('active')) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                todasBtn.classList.add('active');
            }
        }
        
        // Llamar a la función al inicio
        activateDefaultCategory();
        
        // Función de búsqueda flexible
        function busquedaFlexible(textoBusqueda, textoProducto) {
            if (!textoBusqueda) return true;
            
            const busqueda = textoBusqueda.toLowerCase().trim();
            const producto = textoProducto.toLowerCase().trim();
            
            // Búsqueda exacta
            if (producto.includes(busqueda)) {
                return true;
            }
            
            // Búsqueda por palabras
            const palabrasBusqueda = busqueda.split(/\s+/).filter(p => p.length > 0);
            const palabrasProducto = producto.split(/\s+/).filter(p => p.length > 0);
            
            if (palabrasBusqueda.length === 1) {
                const palabra = palabrasBusqueda[0];
                return palabrasProducto.some(palabraProd => 
                    palabraProd.includes(palabra) || palabra.includes(palabraProd)
                );
            }
            
            if (palabrasBusqueda.length > 1) {
                return palabrasBusqueda.some(palabra => 
                    palabrasProducto.some(palabraProd => 
                        palabraProd.includes(palabra) || palabra.includes(palabraProd)
                    )
                );
            }
            
            return false;
        }
        
        // Función principal de filtrado
        function filtrarCatalogo() {
            const searchText = searchInput ? searchInput.value.trim() : '';
            const activeCategory = document.querySelector('.btn-cat.active').dataset.cat;
            
            // Remover mensaje anterior si existe
            const oldMsg = document.querySelector('.tarjeta-recip');
            if (oldMsg) oldMsg.remove();
            
            let foundAny = false;
            
            // Iterar sobre todas las secciones de categorías
            categorySections.forEach(section => {
                const sectionId = section.id;
                
                // Determinar si esta sección debe mostrarse según la categoría activa
                const showByCategory = activeCategory === 'todas' || sectionId === activeCategory;
                
                if (showByCategory) {
                    let foundInSection = false;
                    const products = section.querySelectorAll('.card-camisa');
                    
                    // Filtrar productos dentro de la sección
                    products.forEach(product => {
                        const title = product.querySelector('.lbl-nombre-camisa')?.textContent || '';
                        const description = product.querySelector('.lbl-descripcion')?.textContent || '';
                        const categoria = product.querySelector('.categoria-camisa')?.textContent || '';
                        
                        // Determinar si el producto coincide con la búsqueda
                        const matchesSearch = !searchText || 
                            busquedaFlexible(searchText, title) || 
                            busquedaFlexible(searchText, description) ||
                            busquedaFlexible(searchText, categoria);
                        
                        // Mostrar/ocultar producto
                        if (matchesSearch) {
                            product.style.display = 'block';
                            foundInSection = true;
                            foundAny = true;
                        } else {
                            product.style.display = 'none';
                        }
                    });
                    
                    // Mostrar/ocultar sección completa
                    section.style.display = foundInSection ? 'grid' : 'none';
                } else {
                    section.style.display = 'none';
                }
            });
            
            // Mostrar mensaje si no hay resultados
            if (!foundAny && searchText !== '') {
                mostrarMensajeNoEncontrado(searchText);
            }
        }
        
        // Función para mostrar mensaje de no encontrado
        function mostrarMensajeNoEncontrado(searchTerm) {
            const msg = document.createElement('div');
            msg.className = 'tarjeta-recip';
            msg.innerHTML = `
                <div class="imagen-superior">
                    <img src="images/camisa-not-found.jpg" alt="Camisa no encontrada">
                    <div class="icono-error">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2"/>
                            <line x1="12" y1="7" x2="12" y2="13" stroke="#fff" stroke-width="2"/>
                            <circle cx="12" cy="17" r="1.5" fill="#fff"/>
                        </svg>
                    </div>
                </div>
                <div class="contenido-recip">
                    <h2 class="titulo-recip">Camisa no encontrada</h2>
                    <p class="desc-recip">
                        No pudimos encontrar "<strong>${searchTerm}</strong>"<br><br>
                        Intenta con otras palabras o revisa la ortografía.
                    </p>
                </div>
            `;
            
            // Insertar el mensaje en el contenedor
            if (contenedorCatalogo) {
                contenedorCatalogo.appendChild(msg);
            }
        }
        
        // =========================================
        // EVENT LISTENERS
        // =========================================
        
        // Evento para botones de categoría
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remover active de todos
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                // Agregar active al clickeado
                this.classList.add('active');
                
                // Limpiar búsqueda al cambiar categoría
                if (searchInput) {
                    searchInput.value = '';
                }
                
                // Aplicar filtro
                filtrarCatalogo();
            });
        });
        
        // Evento para búsqueda (con debounce para mejor rendimiento)
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    filtrarCatalogo();
                }, 300);
            });
            
            // También filtrar al presionar Enter
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    clearTimeout(searchTimeout);
                    filtrarCatalogo();
                }
            });
        }
        
        // =========================================
        // INICIALIZACIÓN
        // =========================================
        
        // Asegurar que todas las secciones se muestren al inicio
        if (categorySections.length > 0) {
            categorySections.forEach(section => {
                section.style.display = 'grid';
            });
            
            // Mostrar todos los productos al inicio
            document.querySelectorAll('.card-camisa').forEach(product => {
                product.style.display = 'block';
            });
        }
        
        // Aplicar filtro inicial
        filtrarCatalogo();
        
        // También filtrar cuando se haga clic en "Catálogo" desde el menú
        document.querySelectorAll('[href="#catalogo"]').forEach(link => {
            link.addEventListener('click', function(e) {
                // Si es un enlace interno, prevenir comportamiento por defecto
                if (this.getAttribute('href') === '#catalogo') {
                    e.preventDefault();
                    // Activar categoría "Todas"
                    const todasBtn = document.querySelector('.btn-cat[data-cat="todas"]');
                    if (todasBtn) {
                        categoryButtons.forEach(btn => btn.classList.remove('active'));
                        todasBtn.classList.add('active');
                        if (searchInput) searchInput.value = '';
                        filtrarCatalogo();
                    }
                    // Scroll suave hacia el catálogo
                    document.getElementById('catalogo')?.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
        
    }, 500); // Delay mayor para asegurar carga de contenido dinámico
});