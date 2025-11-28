// js/catalogo.js - VERSIÓN MEJORADA CON BÚSQUEDA FLEXIBLE
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que el DOM esté listo
    setTimeout(() => {
        const search = document.querySelector('.input__search');
        const buttons = document.querySelectorAll('.btn-cat');
        const sections = document.querySelectorAll('.section-cat');

        // Función mejorada de búsqueda flexible
        function busquedaFlexible(textoBusqueda, textoProducto) {
            if (!textoBusqueda) return true;
            
            const busqueda = textoBusqueda.toLowerCase().trim();
            const producto = textoProducto.toLowerCase().trim();
            
            // Si la búsqueda exacta coincide
            if (producto.includes(busqueda)) {
                return true;
            }
            
            // Dividir la búsqueda en palabras individuales
            const palabrasBusqueda = busqueda.split(/\s+/).filter(palabra => palabra.length > 0);
            const palabrasProducto = producto.split(/\s+/).filter(palabra => palabra.length > 0);
            
            // Si hay una sola palabra, buscar coincidencias parciales
            if (palabrasBusqueda.length === 1) {
                const palabra = palabrasBusqueda[0];
                return palabrasProducto.some(palabraProd => 
                    palabraProd.includes(palabra) || palabra.includes(palabraProd)
                );
            }
            
            // Para múltiples palabras, verificar que al menos una coincida
            if (palabrasBusqueda.length > 1) {
                return palabrasBusqueda.some(palabra => 
                    palabrasProducto.some(palabraProd => 
                        palabraProd.includes(palabra) || palabra.includes(palabraProd)
                    )
                );
            }
            
            return false;
        }

        function filter() {
            const searchText = search.value.trim();
            const activeCategory = document.querySelector('.btn-cat.btn-active').dataset.cat;
            
            // Remover mensaje anterior
            const oldMsg = document.querySelector('.tarjeta-recip');
            if (oldMsg) oldMsg.remove();
            
            let foundAny = false;
            
            sections.forEach(section => {
                const sectionId = section.id;
                const showSection = activeCategory === 'todas' || sectionId === activeCategory;
                
                if (showSection) {
                    let foundInSection = false;
                    const products = section.querySelectorAll('.card-camisa');
                    
                    products.forEach(product => {
                        const title = product.querySelector('.lbl-nombre-camisa').textContent;
                        const description = product.querySelector('.lbl-descripcion').textContent;
                        
                        // Buscar en título y descripción
                        const matchesTitle = busquedaFlexible(searchText, title);
                        const matchesDescription = busquedaFlexible(searchText, description);
                        const showProduct = searchText === '' || matchesTitle || matchesDescription;
                        
                        product.style.display = showProduct ? 'block' : 'none';
                        if (showProduct) {
                            foundInSection = true;
                            foundAny = true;
                            
                            // Resaltar texto coincidente (opcional)
                            if (searchText && matchesTitle) {
                                resaltarTexto(product.querySelector('.lbl-nombre-camisa'), searchText);
                            }
                        } else {
                            // Remover resaltado si no coincide
                                removerResaltado(product.querySelector('.lbl-nombre-camisa'));
                        }
                    });
                    
                    section.style.display = foundInSection || searchText === '' ? 'grid' : 'none';
                } else {
                    section.style.display = 'none';
                }
            });
            
            // Mostrar mensaje si no hay resultados
            if (!foundAny && searchText !== '') {
                const msg = document.createElement('div');
                msg.className = 'tarjeta-recip';
                msg.innerHTML = `
                    <div class="imagen-superior">
                        <img src="images/card_not_found0.jpg" alt="Camisa no encontrada">
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
                            No pudimos encontrar "<strong>${searchText}</strong>"<br><br>
                            Intenta con otras palabras o revisa la ortografía.
                        </p>
                    </div>
                `;
                // Insertar después del título
                const titulo = document.querySelector('.lbl-catalogo');
                if (titulo && titulo.nextSibling) {
                    document.querySelector('.contenedor-catalogo').insertBefore(msg, titulo.nextSibling);
                } else {
                    document.querySelector('.contenedor-catalogo').appendChild(msg);
                }
            } else {
                // Remover resaltado de todos los productos cuando no hay búsqueda
                if (searchText === '') {
                    document.querySelectorAll('.lbl-nombre-camisa').forEach(element => {
                        removerResaltado(element);
                    });
                }
            }
        }

        // Función para resaltar texto (opcional)
        function resaltarTexto(elemento, texto) {
            const textoOriginal = elemento.textContent;
            const regex = new RegExp(`(${texto})`, 'gi');
            const textoResaltado = textoOriginal.replace(regex, '<mark class="resaltado-busqueda">$1</mark>');
            elemento.innerHTML = textoResaltado;
        }

        // Función para remover resaltado
        function removerResaltado(elemento) {
            if (elemento.innerHTML !== elemento.textContent) {
                elemento.innerHTML = elemento.textContent;
            }
        }

        // Eventos
        search.addEventListener('input', function() {
            // Pequeño delay para mejorar rendimiento en búsquedas rápidas
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                filter();
            }, 300);
        });

        // También filtrar al presionar Enter
        search.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(this.timer);
                filter();
            }
        });
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('btn-active'));
                this.classList.add('btn-active');
                search.value = '';
                filter();
            });
        });

        // Iniciar
        filter();
    }, 200);
});