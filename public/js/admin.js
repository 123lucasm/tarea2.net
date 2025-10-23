// Estado de la aplicación para admin
let usuarioActual = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarAdmin();
});

async function inicializarAdmin() {
    // Verificar sesión
    verificarSesion();
    
    // Si no hay sesión, redirigir al inicio
    if (!usuarioActual) {
        window.location.href = '/';
        return;
    }
    
    // Actualizar UI de usuario
    actualizarUIUsuario();
    
    // Cargar datos y poblar formularios
    await poblarSelectCategorias();
    await actualizarEstadisticas();
    
    // Inicializar formularios
    inicializarFormularios();
}

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
        // Usuario logueado
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
        // Usuario no logueado - redirigir
        window.location.href = '/';
    }
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro/a que deseas cerrar sesión?')) {
        usuarioActual = null;
        localStorage.removeItem('usuario');
        window.location.href = '/';
    }
}

// Inicializar formularios
function inicializarFormularios() {
    // Formulario de categorías
    const formCategoria = document.getElementById('formCategoria');
    if (formCategoria) {
        formCategoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            await crearCategoria();
        });
    }

    // Formulario de contenidos
    const formContenido = document.getElementById('formContenido');
    if (formContenido) {
        formContenido.addEventListener('submit', async (e) => {
            e.preventDefault();
            await crearContenido();
        });
    }
}

// Crear categoría
async function crearCategoria() {
    const nombre = document.getElementById('catNombre').value.trim();
    const descripcion = document.getElementById('catDescripcion').value.trim();
    
    if (!nombre || !descripcion) {
        mostrarToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/categorias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, descripcion })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarToast('Categoría creada correctamente', 'success');
            document.getElementById('formCategoria').reset();
            await poblarSelectCategorias();
            await actualizarEstadisticas();
        } else {
            mostrarToast('Error: ' + (data.error || 'Error al crear categoría'), 'error');
        }
    } catch (error) {
        console.error('Error al crear categoría:', error);
        mostrarToast('Error de conexión. Por favor intenta de nuevo.', 'error');
    }
}

// Crear contenido
async function crearContenido() {
    const titulo = document.getElementById('conTitulo').value.trim();
    const tema = document.getElementById('conTema').value.trim();
    const tipo = document.getElementById('conTipo').value;
    const categoria = document.getElementById('conCategoria').value;
    const descripcion = document.getElementById('conDescripcion').value.trim();
    const enlace = document.getElementById('conEnlace').value.trim();
    
    if (!titulo || !tema || !tipo || !categoria || !descripcion || !enlace) {
        mostrarToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/contenidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, tema, tipo, categoria, descripcion, enlace })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarToast('Recurso creado correctamente', 'success');
            document.getElementById('formContenido').reset();
            await actualizarEstadisticas();
        } else {
            mostrarToast('Error: ' + (data.error || 'Error al crear recurso'), 'error');
        }
    } catch (error) {
        console.error('Error al crear contenido:', error);
        mostrarToast('Error de conexión. Por favor intenta de nuevo.', 'error');
    }
}

// Poblar select de categorías
async function poblarSelectCategorias() {
    try {
        const response = await fetch('/api/categorias');
        const categorias = await response.json();
        const select = document.getElementById('conCategoria');
        
        if (!select) return;
        
        // Limpiar opciones existentes (excepto la primera)
        select.innerHTML = '<option value="">Selecciona una categoría</option>';
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.nombre;
            option.textContent = categoria.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Actualizar estadísticas
async function actualizarEstadisticas() {
    try {
        // Total de categorías
        const categoriasResponse = await fetch('/api/categorias');
        const categorias = await categoriasResponse.json();
        const totalCategoriasEl = document.getElementById('totalCategorias');
        if (totalCategoriasEl) totalCategoriasEl.textContent = categorias.length;
        
        // Total de contenidos
        const contenidosResponse = await fetch('/api/contenidos');
        const contenidos = await contenidosResponse.json();
        const totalContenidosEl = document.getElementById('totalContenidos');
        if (totalContenidosEl) totalContenidosEl.textContent = contenidos.length;
        
        // Total de sugerencias
        const sugerenciasResponse = await fetch('/api/sugerencias');
        const sugerencias = await sugerenciasResponse.json();
        const totalSugerenciasEl = document.getElementById('totalSugerencias');
        if (totalSugerenciasEl) totalSugerenciasEl.textContent = sugerencias.length;
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
    }
}

// Función para mostrar mensajes toast
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
