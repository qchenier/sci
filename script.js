/**
 * @file script.js
 * @description Script principal para el sitio web de SCI (Soluciones Corporativas para Internet).
 *              Gestiona la carga de componentes reutilizables (header, footer),
 *              la interactividad de los menús, el envío de formularios y la carga
 *              de contenido dinámico como feeds de noticias.
 * @version 2.1.0 - Corregida lógica de clic en menús para tablet/escritorio.
 * @author Chénier Quintero (con asistencia de IA)
 * @date 2025-07-18
 */

// Se ejecuta una vez que toda la estructura HTML de la página ha sido cargada y parseada.
document.addEventListener('DOMContentLoaded', () => {

    /**
     * @function loadReusableComponents
     * @description Carga componentes HTML reutilizables (cabecera y pie de página) en sus placeholders.
     */
    function loadReusableComponents() {
        // --- Carga de la Cabecera ---
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            fetch('header.html')
                .then(response => {
                    if (!response.ok) throw new Error(`Error al cargar header.html: ${response.status}`);
                    return response.text();
                })
                .then(data => {
                    headerPlaceholder.innerHTML = data;
                    initializeHeaderScripts(); // Inicializar scripts del header
                })
                .catch(error => {
                    console.error("Fallo crítico: No se pudo cargar la cabecera del sitio.", error);
                    headerPlaceholder.innerHTML = "<p style='text-align:center; color:red;'>Error al cargar el menú.</p>";
                });
        } else {
            initializeHeaderScripts(); // Si no hay placeholder, inicializar directamente
        }

        // --- NUEVO: Carga del Pie de Página ---
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            fetch('footer.html')
                .then(response => {
                    if (!response.ok) throw new Error(`Error al cargar footer.html: ${response.status}`);
                    return response.text();
                })
                .then(data => {
                    footerPlaceholder.innerHTML = data;
                    initFooter(); // Inicializar scripts del footer DESPUÉS de cargarlo
                })
                .catch(error => {
                    console.error("Fallo crítico: No se pudo cargar el pie de página.", error);
                    footerPlaceholder.innerHTML = "<p style='text-align:center; color:red;'>Error al cargar el pie de página.</p>";
                });
        }
    }

    /**
     * @function initFooter
     * @description Funciones relacionadas con el pie de página. AHORA es llamada por loadReusableComponents.
     */
    function initFooter() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    /**
     * @function initializeHeaderScripts
     * @description Inicializa todos los scripts que dependen de la existencia del header.
     */
    function initializeHeaderScripts() {
        setActiveNavLink();
        initMobileMenuToggle();
        initMegaMenu();
    }
    
    /**
     * @function setActiveNavLink
     * @description Identifica la página actual y añade la clase 'active' al enlace de navegación correspondiente.
     */
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.main-navigation a');

        navLinks.forEach(link => {
            const linkPage = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
            link.classList.remove('active');
            if (currentPage === linkPage && link.getAttribute('href') !== '#') {
                link.classList.add('active');
                const parentMegaMenuItem = link.closest('.menu-item-has-children');
                if (parentMegaMenuItem) {
                    const mainServiceLink = document.querySelector('.main-navigation > ul > .menu-item-has-children > a');
                    if (mainServiceLink) mainServiceLink.classList.add('active');
                }
            }
        });
    }

    /**
     * @function initMobileMenuToggle
     * @description Gestiona la funcionalidad de abrir/cerrar el menú móvil y los submenús anidados.
     */
    function initMobileMenuToggle() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('.main-navigation');
        if (!menuToggle || !mainNav) return;

        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            menuToggle.innerHTML = isExpanded ? '✕' : '☰';
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Toggle para submenús en móvil
        const parentMenuItems = document.querySelectorAll('.main-navigation .menu-item-has-children > a');
        parentMenuItems.forEach(link => {
            link.addEventListener('click', function(event) {
                // Solo activar el toggle si estamos en vista móvil (el menú hamburguesa es visible)
                if (window.getComputedStyle(menuToggle).display === 'block') {
                    event.preventDefault();
                    this.parentElement.classList.toggle('submenu-open');
                }
            });
        });
    }

    /**
     * @function initMegaMenu
     * @description Gestiona la interactividad del mega menú de "Servicios" EN VISTA DE ESCRITORIO.
     */
    function initMegaMenu() {
        const menuServiceItem = document.querySelector('.menu-item-has-children');
        const megaMenuPanel = document.querySelector('.mega-menu-panel');
        const menuToggle = document.querySelector('.menu-toggle');
        if (!menuServiceItem || !megaMenuPanel || !menuToggle) return;

        const serviceLink = menuServiceItem.querySelector('a');

        // Abrir/Cerrar el menú al hacer CLIC en "Servicios"
        serviceLink.addEventListener('click', (event) => {
            // CORRECCIÓN: SOLO ejecutar esta lógica si estamos en vista de escritorio
            if (window.getComputedStyle(menuToggle).display === 'none') {
                event.preventDefault();
                event.stopPropagation();
                menuServiceItem.classList.toggle('mega-menu-open');
            }
        });

        // Cambiar paneles internos al pasar el RATÓN (mouseenter)
        const megaMenuItems = document.querySelectorAll('.primary-nav-item');
        const secondaryPanels = document.querySelectorAll('.secondary-content-panel');

        megaMenuItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                megaMenuItems.forEach(i => i.classList.remove('is-active'));
                secondaryPanels.forEach(p => p.classList.remove('is-active'));
                this.classList.add('is-active');
                const targetId = this.querySelector('a').getAttribute('data-target');
                const targetPanel = document.querySelector(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('is-active');
                }
            });
        });

        // Cerrar el menú si se hace CLIC fuera de él
        document.addEventListener('click', (event) => {
            if (menuServiceItem.classList.contains('mega-menu-open') && !menuServiceItem.contains(event.target)) {
                menuServiceItem.classList.remove('mega-menu-open');
            }
        });
        
        // Evitar que un clic DENTRO del panel del menú lo cierre
        megaMenuPanel.addEventListener('click', (event) => event.stopPropagation());
    }

    /**
     * @function initFooter
     * @description Actualiza el año en el pie de página.
     */
    function initFooter() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }

    /**
     * @function initContactForm
     * @description Gestiona el envío asíncrono del formulario de contacto.
     */
    function initContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        const formStatus = document.getElementById('form-status');
        const formspreeEndpoint = 'https://formspree.io/f/xgvkozwe';

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            submitButton.disabled = true;
            submitButton.innerHTML = 'Enviando...';
            formStatus.innerHTML = '';
            formStatus.className = '';

            fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    formStatus.innerHTML = "¡Mensaje enviado con éxito! Gracias por contactarnos.";
                    formStatus.className = 'success';
                    contactForm.reset();
                } else {
                    return response.json().then(data => {
                        const errorMessage = data.errors ? data.errors.map(e => e.message).join(', ') : "Error desconocido.";
                        throw new Error(errorMessage);
                    });
                }
            })
            .catch(error => {
                formStatus.innerHTML = `Error al enviar el mensaje. Por favor, inténtelo de nuevo.`;
                formStatus.className = 'error';
                console.error('Error en envío de Formspree:', error);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
        });
    }

    /**
     * @function loadNewsFeed
     * @description Carga noticias desde un feed RSS externo.
     */
    function loadNewsFeed() {
        const newsList = document.getElementById('news-list');
        const loadingStatus = document.getElementById('news-loading-status');
        if (!newsList || !loadingStatus) return;

        const rssToJsonApiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.elpais.com%2Fmrss-s%2Fpages%2Fep%2Fsite%2Felpais.com%2Fsection%2Ftecnologia%2Fportada';
        const maxNewsItems = 3;

        fetch(rssToJsonApiUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    loadingStatus.style.display = 'none';
                    newsList.innerHTML = '';
                    const itemsToShow = data.items.slice(0, maxNewsItems);
                    itemsToShow.forEach(item => {
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = item.link;
                        link.textContent = item.title;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        listItem.appendChild(link);
                        newsList.appendChild(listItem);
                    });
                } else {
                    throw new Error("El feed no contiene items válidos.");
                }
            })
            .catch(error => {
                loadingStatus.textContent = 'Error al cargar noticias.';
                console.error('Error fetching RSS feed:', error);
                newsList.innerHTML = `<li>Error al conectar con la fuente de noticias.</li>`;
            });
    }

    // --- PUNTO DE ENTRADA PRINCIPAL ---
    loadReusableComponents();
    initFooter();
    initContactForm();
    loadNewsFeed();
    
    console.log("SCI Website Script Initialized");
});