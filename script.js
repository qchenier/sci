document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Actualizar Año en Footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 2. Toggle para Menú Móvil ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-navigation');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active'); // Añade o quita la clase 'active'
            // Opcional: Cambiar icono hamburguesa a 'X'
            if (mainNav.classList.contains('active')) {
                menuToggle.innerHTML = '✕'; // O un icono de 'X'
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                menuToggle.innerHTML = '☰';
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    } else {
        if (!menuToggle) console.warn("Botón del menú (.menu-toggle) no encontrado.");
        if (!mainNav) console.warn("Navegación principal (.main-navigation) no encontrada.");
    }

    // --- 3. Manejo del Formulario de Contacto (usando Formspree) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const formspreeEndpoint = 'https://formspree.io/f/xgvkozwe'; // Tu URL de Formspree

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevenir el envío normal del formulario

            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            // Deshabilitar botón y mostrar "Enviando..."
            submitButton.disabled = true;
            submitButton.innerHTML = 'Enviando...';
            formStatus.innerHTML = ''; // Limpiar mensajes anteriores
            formStatus.className = ''; // Limpiar clases anteriores

            fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                submitButton.disabled = false; // Rehabilitar botón
                submitButton.innerHTML = originalButtonText; // Restaurar texto

                if (response.ok) {
                    // Éxito
                    formStatus.innerHTML = "¡Mensaje enviado con éxito! Gracias por contactarnos.";
                    formStatus.className = 'success'; // Añadir clase CSS para estilo de éxito
                    contactForm.reset(); // Limpiar el formulario
                } else {
                    // Intentar obtener detalles del error si Formspree los envía
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                             formStatus.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                        } else {
                            formStatus.innerHTML = "Error al enviar el mensaje. Por favor, inténtelo de nuevo más tarde o use otro método de contacto.";
                        }
                        formStatus.className = 'error'; // Añadir clase CSS para estilo de error
                    }).catch(error => {
                         formStatus.innerHTML = "Error al enviar el mensaje. Por favor, inténtelo de nuevo más tarde.";
                         formStatus.className = 'error';
                         console.error('Error parsing Formspree error response:', error);
                    });
                }
            }).catch(error => {
                // Error de red u otro
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                formStatus.innerHTML = "Error de red al enviar el mensaje. Verifique su conexión e inténtelo de nuevo.";
                formStatus.className = 'error';
                console.error('Network error or other fetch error:', error);
            });
        });
    } else {
        // console.warn("Formulario de contacto (#contact-form) no encontrado en esta página.");
    }

    // --- 4. Cargar Noticias desde Feed RSS (vía rss2json) ---
    const newsList = document.getElementById('news-list');
    const loadingStatus = document.getElementById('news-loading-status');
    // URL del feed RSS de El País (Tecnología) - ¡FUNCIONA!
    const rssToJsonApiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.elpais.com%2Fmrss-s%2Fpages%2Fep%2Fsite%2Felpais.com%2Fsection%2Ftecnologia%2Fportada';
    const maxNewsItems = 3; // Número máximo de noticias a mostrar

    if (newsList && loadingStatus) {
        fetch(rssToJsonApiUrl)
            .then(response => {
                if (!response.ok) {
                    // Si hay un error HTTP, lo capturamos aquí para tener más contexto.
                    throw new Error(`Error HTTP! status: ${response.status}, al intentar obtener el feed: ${rssToJsonApiUrl}`);
                }
                return response.json();
            })
            .then(data => {
                loadingStatus.style.display = 'none'; // Ocultar mensaje de carga

                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    newsList.innerHTML = ''; // Limpiar lista por si acaso
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
                    newsList.innerHTML = '<li>No se pudieron cargar las noticias en este momento.</li>';
                    console.error("Respuesta de rss2json no fue 'ok' o no hay items:", data);
                    loadingStatus.textContent = 'No hay noticias disponibles.';
                    loadingStatus.style.display = 'block';
                }
            })
            .catch(error => {
                loadingStatus.textContent = 'Error al cargar noticias.';
                console.error('Error fetching RSS feed:', error);
                newsList.innerHTML = `<li>Error al conectar con la fuente de noticias. Detalle: ${error.message}</li>`;
            });
    } else {
        // Esto es normal si estás en una página que no tiene el widget de noticias.
        // console.warn("Elementos del widget de noticias no encontrados en esta página.");
    }

    console.log("SCI Website Script Loaded Correctly"); // Mensaje para verificar que carga

}); // FIN del ÚNICO addEventListener 'DOMContentLoaded'