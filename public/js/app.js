// Estado de la aplicación
let todosLosContenidos = [];
let contenidosFiltrados = [];
let filtroActual = 'todos';
let busquedaActual = '';
let usuarioActual = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

async function inicializarApp() {
    // Inicializar autenticación primero
    verificarSesion();
    actualizarUIUsuario();
    
    // Cargar datos
    await cargarCategorias();
    await cargarContenidos();
    await actualizarEstadisticas();
    
    // Inicializar filtros
    inicializarFiltros();
    
    // Inicializar buscador
    inicializarBuscador();
    
    // Inicializar formulario
    inicializarFormulario();
}

// Las funciones de navegación y smooth scroll ya están manejadas por Bootstrap

// Cargar categorías
async function cargarCategorias() {
    try {
        const response = await fetch('/api/categorias');
        const categorias = await response.json();
        
        const grid = document.getElementById('categoriasGrid');
        grid.innerHTML = '';
        
        const colores = [
            { bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', class: 'productividad' },
            { bg: 'linear-gradient(135deg, #ec4899, #f43f5e)', class: 'estudio' },
            { bg: 'linear-gradient(135deg, #10b981, #059669)', class: 'bienestar' }
        ];
        
        categorias.forEach((categoria, index) => {
            const colorInfo = colores[index % colores.length];
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="card categoria-card ${colorInfo.class}" style="background: ${colorInfo.bg};">
                    <div class="card-body">
                        <h3>${categoria.nombre}</h3>
                        <p class="mb-0">${categoria.descripcion}</p>
                    </div>
                </div>
            `;
            
            col.querySelector('.card').addEventListener('click', () => {
                filtrarPorCategoria(categoria.nombre);
            });
            
            grid.appendChild(col);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Cargar contenidos
async function cargarContenidos() {
    try {
        const response = await fetch('/api/contenidos');
        todosLosContenidos = await response.json();
        contenidosFiltrados = todosLosContenidos;
        renderizarContenidos();
    } catch (error) {
        console.error('Error al cargar contenidos:', error);
    }
}

// Renderizar contenidos
function renderizarContenidos() {
    const grid = document.getElementById('contenidosGrid');
    grid.innerHTML = '';
    
    if (contenidosFiltrados.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search" style="font-size: 4rem; color: #94a3b8;"></i>
                <h3 class="mt-3">No se encontraron recursos</h3>
                <p class="text-muted">Intenta con otros filtros o búsqueda.</p>
            </div>
        `;
        return;
    }
    
    contenidosFiltrados.forEach(contenido => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const icono = contenido.tipo === 'video' ? '🎥' : '📊';
        const badgeColor = contenido.tipo === 'video' ? 'bg-danger' : 'bg-info';
        const tipoTexto = contenido.tipo === 'video' ? 'Video' : 'Infografía';
        
        col.innerHTML = `
            <div class="card contenido-card h-100">
                <div class="card-body text-center">
                    <div class="contenido-icon">${icono}</div>
                    <span class="badge ${badgeColor} badge-tipo mb-3">${tipoTexto}</span>
                    <h5 class="card-title fw-bold">${contenido.titulo}</h5>
                    <p class="card-text text-muted">${contenido.descripcion}</p>
                </div>
                <div class="card-footer bg-white border-top-0">
                    <span class="badge bg-light text-dark">
                        <i class="bi bi-tag me-1"></i>${contenido.categoria}
                    </span>
                </div>
            </div>
        `;
        
        // Hacer click para ver el contenido
        col.querySelector('.card').addEventListener('click', () => {
            mostrarContenido(contenido);
        });
        
        grid.appendChild(col);
    });
}

// Mostrar contenido (modal simple)
function mostrarContenido(contenido) {
    if (contenido.tipo === 'video') {
        alert(`🎥 Video: ${contenido.titulo}\n\nEn una versión completa, aquí se abriría un modal con el video embebido.\n\nEnlace: ${contenido.enlace}`);
    } else {
        alert(`📊 Infografía: ${contenido.titulo}\n\nEn una versión completa, aquí se mostraría la infografía en tamaño completo.\n\nArchivo: ${contenido.enlace}`);
    }
}

// Filtros
function inicializarFiltros() {
    const botonesFiltro = document.querySelectorAll('.filtro-btn');
    
    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => {
            // Actualizar botones activos - Bootstrap usa diferentes clases
            botonesFiltro.forEach(b => {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-outline-primary');
            });
            boton.classList.remove('btn-outline-primary');
            boton.classList.add('active', 'btn-primary');
            
            // Aplicar filtro
            filtroActual = boton.dataset.filtro;
            aplicarFiltros();
        });
    });
}

// Filtrar por categoría
function filtrarPorCategoria(categoria) {
    // Scroll a la sección de contenidos
    document.getElementById('contenidos').scrollIntoView({ behavior: 'smooth' });
    
    // Aplicar filtro de búsqueda por categoría
    setTimeout(() => {
        document.getElementById('searchInput').value = categoria;
        busquedaActual = categoria.toLowerCase();
        aplicarFiltros();
    }, 500);
}

// Buscador
function inicializarBuscador() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        busquedaActual = e.target.value.toLowerCase();
        aplicarFiltros();
    });
}

// Aplicar todos los filtros
function aplicarFiltros() {
    contenidosFiltrados = todosLosContenidos.filter(contenido => {
        // Filtro por tipo
        const cumpleTipo = filtroActual === 'todos' || contenido.tipo === filtroActual;
        
        // Filtro por búsqueda
        const cumpleBusqueda = busquedaActual === '' || 
            contenido.titulo.toLowerCase().includes(busquedaActual) ||
            contenido.descripcion.toLowerCase().includes(busquedaActual) ||
            contenido.tema.toLowerCase().includes(busquedaActual) ||
            contenido.categoria.toLowerCase().includes(busquedaActual);
        
        return cumpleTipo && cumpleBusqueda;
    });
    
    renderizarContenidos();
}

// Formulario de sugerencias
function inicializarFormulario() {
    const form = document.getElementById('sugerenciasForm');
    const mensajeExito = document.getElementById('mensajeExito');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            nombre: document.getElementById('nombre').value,
            correo: document.getElementById('correo').value,
            texto: document.getElementById('texto').value
        };
        
        try {
            const response = await fetch('/api/sugerencias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Mostrar mensaje de éxito con Bootstrap
                mensajeExito.style.display = 'block';
                form.reset();
                
                // Actualizar estadísticas
                await actualizarEstadisticas();
                
                // También mostrar toast
                mostrarToast('¡Gracias por tu sugerencia! La revisaremos pronto.', 'success');
                
                // Ocultar mensaje después de 5 segundos
                setTimeout(() => {
                    mensajeExito.style.display = 'none';
                }, 5000);
            } else {
                mostrarToast('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error al enviar sugerencia:', error);
            mostrarToast('Hubo un error al enviar tu sugerencia. Por favor intenta de nuevo.', 'error');
        }
    });
}

// Actualizar estadísticas
async function actualizarEstadisticas() {
    try {
        // Total de contenidos
        const contenidosResponse = await fetch('/api/contenidos');
        const contenidos = await contenidosResponse.json();
        document.getElementById('totalContenidos').textContent = contenidos.length;
        
        // Total de sugerencias
        const sugerenciasResponse = await fetch('/api/sugerencias');
        const sugerencias = await sugerenciasResponse.json();
        document.getElementById('totalSugerencias').textContent = sugerencias.length;
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
    }
}

// ==================== SISTEMA DE AUTENTICACIÓN ====================

// Verificar sesión al cargar
function verificarSesion() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
    }
}

// Actualizar UI según estado de sesión
function actualizarUIUsuario() {
    const navAuth = document.getElementById('navAuth');
    
    if (!navAuth) {
        console.error('Elemento navAuth no encontrado');
        return;
    }
    
    if (usuarioActual) {
        // Usuario logueado - Estilos Bootstrap
        navAuth.innerHTML = `
            <div class="user-menu">
                <span class="user-name"><i class="bi bi-person-circle me-2"></i>${usuarioActual.nombre}</span>
                <button class="btn btn-outline-light btn-sm" id="btnLogout">
                    <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                </button>
            </div>
        `;
        
        // Evento de cerrar sesión
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.onclick = cerrarSesion;
        }
    } else {
        // Usuario no logueado - Estilos Bootstrap
        navAuth.innerHTML = `
            <button class="btn btn-outline-light me-2" id="btnLogin">
                <i class="bi bi-person-circle me-1"></i>Iniciar Sesión
            </button>
            <button class="btn btn-light" id="btnRegister">
                <i class="bi bi-person-plus-fill me-1"></i>Registrarse
            </button>
        `;
        
        // Eventos de login y registro
        const btnLogin = document.getElementById('btnLogin');
        const btnRegister = document.getElementById('btnRegister');
        
        if (btnLogin) {
            btnLogin.onclick = function() {
                abrirModal('modalLogin');
            };
        }
        
        if (btnRegister) {
            btnRegister.onclick = function() {
                abrirModal('modalRegistro');
            };
        }
    }
    
    // Inicializar modales después de actualizar la UI
    setTimeout(inicializarModales, 100);
}

// Inicializar modales y sus eventos
function inicializarModales() {
    // Cambiar entre modales usando Bootstrap
    const linkRegistro = document.getElementById('linkRegistro');
    const linkLogin = document.getElementById('linkLogin');
    
    if (linkRegistro) {
        linkRegistro.onclick = function(e) {
            e.preventDefault();
            cerrarModal('modalLogin');
            setTimeout(() => abrirModal('modalRegistro'), 300);
        };
    }
    
    if (linkLogin) {
        linkLogin.onclick = function(e) {
            e.preventDefault();
            cerrarModal('modalRegistro');
            setTimeout(() => abrirModal('modalLogin'), 300);
        };
    }
    
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = manejarLogin;
    }
    
    // Formulario de registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.onsubmit = manejarRegistro;
    }
    
    // Limpiar errores al cerrar modales
    document.getElementById('modalLogin')?.addEventListener('hidden.bs.modal', function () {
        const loginError = document.getElementById('loginError');
        if (loginError) loginError.style.display = 'none';
    });
    
    document.getElementById('modalRegistro')?.addEventListener('hidden.bs.modal', function () {
        const registroError = document.getElementById('registroError');
        if (registroError) registroError.style.display = 'none';
    });
}

// Abrir modal usando Bootstrap
function abrirModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        console.error('Modal no encontrado:', modalId);
    }
}

// Cerrar modal usando Bootstrap
function cerrarModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
}

// Manejar login
async function manejarLogin(e) {
    e.preventDefault();
    
    const correo = document.getElementById('loginCorreo').value;
    const contraseña = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch('/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, contraseña })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login exitoso
            usuarioActual = data.usuario;
            localStorage.setItem('usuario', JSON.stringify(usuarioActual));
            
            // Cerrar modal
            cerrarModal('modalLogin');
            
            // Limpiar formulario
            document.getElementById('loginForm').reset();
            errorDiv.style.display = 'none';
            
            // Actualizar UI
            actualizarUIUsuario();
            
            // Mensaje de bienvenida con toast de Bootstrap
            mostrarToast(`¡Bienvenido/a, ${usuarioActual.nombre}! 🎉`, 'success');
        } else {
            // Error de login
            errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${data.error || 'Error al iniciar sesión'}`;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error en login:', error);
        errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>Error de conexión. Por favor intenta de nuevo.`;
        errorDiv.style.display = 'block';
    }
}

// Manejar registro
async function manejarRegistro(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('registroNombre').value;
    const correo = document.getElementById('registroCorreo').value;
    const contraseña = document.getElementById('registroPassword').value;
    const contraseñaConfirm = document.getElementById('registroPasswordConfirm').value;
    const errorDiv = document.getElementById('registroError');
    
    // Validar que las contraseñas coincidan
    if (contraseña !== contraseñaConfirm) {
        errorDiv.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Las contraseñas no coinciden';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, correo, contraseña })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registro exitoso
            usuarioActual = data;
            localStorage.setItem('usuario', JSON.stringify(usuarioActual));
            
            // Cerrar modal
            cerrarModal('modalRegistro');
            
            // Limpiar formulario
            document.getElementById('registroForm').reset();
            errorDiv.style.display = 'none';
            
            // Actualizar UI
            actualizarUIUsuario();
            
            // Mensaje de bienvenida
            mostrarToast(`¡Cuenta creada exitosamente! Bienvenido/a, ${usuarioActual.nombre}! 🎉`, 'success');
        } else {
            // Error de registro
            errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${data.error || 'Error al crear cuenta'}`;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error en registro:', error);
        errorDiv.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Error de conexión. Por favor intenta de nuevo.';
        errorDiv.style.display = 'block';
    }
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro/a que deseas cerrar sesión?')) {
        usuarioActual = null;
        localStorage.removeItem('usuario');
        actualizarUIUsuario();
        mostrarToast('Sesión cerrada correctamente. ¡Hasta pronto! 👋', 'info');
    }
}

// Función para mostrar mensajes toast (simple)
function mostrarToast(mensaje, tipo = 'success') {
    const iconos = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        info: 'bi-info-circle-fill'
    };
    
    const colores = {
        success: 'success',
        error: 'danger',
        info: 'info'
    };
    
    // Crear toast container si no existe
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '11';
        document.body.appendChild(toastContainer);
    }
    
    // Crear toast
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${colores[tipo]} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${iconos[tipo]} me-2"></i>${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Eliminar toast después de que se oculte
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

