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

    // Inicializar gestión desde tarjetas
    inicializarGestionEventos();
}

// Verificar sesión al cargar
function verificarSesion() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
    }
}

// Inicializar eventos de gestión (estadísticas rápidas)
function inicializarGestionEventos() {
    const cardCategorias = document.getElementById('cardCategorias');
    const cardContenidos = document.getElementById('cardContenidos');
    const cardSugerencias = document.getElementById('cardSugerencias');
    const btnCerrarGestion = document.getElementById('btnCerrarGestion');

    if (cardCategorias) cardCategorias.addEventListener('click', () => window.location.href = '/admin-categorias.html');
    if (cardContenidos) cardContenidos.addEventListener('click', () => window.location.href = '/admin-contenidos.html');
    if (cardSugerencias) cardSugerencias.addEventListener('click', () => window.location.href = '/admin-sugerencias.html');
    if (btnCerrarGestion) btnCerrarGestion.addEventListener('click', ocultarGestion);
}

function ocultarGestion() {
    const adminGestion = document.getElementById('adminGestion');
    if (adminGestion) adminGestion.style.display = 'none';
}

async function mostrarGestion(tipo) {
    const adminGestion = document.getElementById('adminGestion');
    const titulo = document.getElementById('gestionTitulo');
    const descripcion = document.getElementById('gestionDescripcion');
    const thead = document.getElementById('gestionThead');
    const tbody = document.getElementById('gestionTbody');

    if (!adminGestion || !titulo || !descripcion || !thead || !tbody) return;

    adminGestion.style.display = '';
    tbody.innerHTML = '';

    if (tipo === 'categorias') {
        titulo.textContent = 'Gestión de categorías';
        descripcion.textContent = 'Edita o elimina categorías existentes.';
        thead.innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="text-end">Acciones</th>
            </tr>
        `;
        const categorias = await (await fetch('/api/categorias')).json();
        categorias.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(cat.nombre)}</td>
                <td>${escapeHtml(cat.descripcion)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2" data-action="editar" data-id="${cat._id}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${cat._id}"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        tbody.addEventListener('click', (e) => manejarAccionTabla(e, 'categorias'));
    }

    if (tipo === 'contenidos') {
        titulo.textContent = 'Gestión de recursos';
        descripcion.textContent = 'Edita o elimina recursos (contenidos).';
        thead.innerHTML = `
            <tr>
                <th>Título</th>
                <th>Tema</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th class="text-end">Acciones</th>
            </tr>
        `;
        const contenidos = await (await fetch('/api/contenidos')).json();
        contenidos.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(c.titulo)}</td>
                <td>${escapeHtml(c.tema)}</td>
                <td>${escapeHtml(c.tipo)}</td>
                <td>${escapeHtml(c.categoria)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2" data-action="editar" data-id="${c._id}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${c._id}"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        tbody.addEventListener('click', (e) => manejarAccionTabla(e, 'contenidos'));
    }

    if (tipo === 'sugerencias') {
        titulo.textContent = 'Gestión de sugerencias';
        descripcion.textContent = 'Revisa, edita o elimina sugerencias.';
        thead.innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Texto</th>
                <th>Leída</th>
                <th class="text-end">Acciones</th>
            </tr>
        `;
        const sugerencias = await (await fetch('/api/sugerencias')).json();
        sugerencias.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(s.nombre || 'Anónimo')}</td>
                <td>${escapeHtml(s.correo || '')}</td>
                <td>${escapeHtml(s.texto)}</td>
                <td>${s.leida ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-success me-2" data-action="marcarLeida" data-id="${s._id}" ${s.leida ? 'disabled' : ''}><i class="bi bi-check2"></i></button>
                    <button class="btn btn-sm btn-outline-primary me-2" data-action="editar" data-id="${s._id}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${s._id}"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        tbody.addEventListener('click', (e) => manejarAccionTabla(e, 'sugerencias'));
    }
}

function manejarAccionTabla(event, tipo) {
    const btn = event.target.closest('button');
    if (!btn) return;
    const accion = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (!accion || !id) return;

    if (accion === 'eliminar') {
        eliminarElemento(tipo, id);
    } else if (accion === 'editar') {
        editarElemento(tipo, id);
    } else if (accion === 'marcarLeida') {
        marcarSugerenciaLeida(id);
    }
}

async function eliminarElemento(tipo, id) {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    try {
        let url = '';
        if (tipo === 'categorias') url = `/api/categorias/${id}`;
        if (tipo === 'contenidos') url = `/api/contenidos/${id}`;
        if (tipo === 'sugerencias') url = `/api/sugerencias/${id}`;
        const resp = await fetch(url, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Error al eliminar');
        mostrarToast('Eliminado correctamente', 'success');
        await actualizarEstadisticas();
        mostrarGestion(tipo);
    } catch (e) {
        console.error(e);
        mostrarToast('No se pudo eliminar', 'error');
    }
}

async function editarElemento(tipo, id) {
    try {
        if (tipo === 'categorias') {
            const nombre = prompt('Nuevo nombre de la categoría:');
            if (nombre === null) return;
            const descripcion = prompt('Nueva descripción:');
            if (descripcion === null) return;
            const resp = await fetch(`/api/categorias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, descripcion })
            });
            if (!resp.ok) throw new Error('Error al actualizar');
            mostrarToast('Categoría actualizada', 'success');
            await poblarSelectCategorias();
            mostrarGestion('categorias');
            return;
        }

        if (tipo === 'contenidos') {
            // Cargar actual para sugerir valores
            const actual = await (await fetch(`/api/contenidos/${id}`)).json();
            const titulo = prompt('Nuevo título:', actual.titulo);
            if (titulo === null) return;
            const tema = prompt('Nuevo tema:', actual.tema);
            if (tema === null) return;
            const tipoRecurso = prompt('Nuevo tipo (infografia|video):', actual.tipo);
            if (tipoRecurso === null) return;
            const categoria = prompt('Nueva categoría:', actual.categoria);
            if (categoria === null) return;
            const descripcion = prompt('Nueva descripción:', actual.descripcion);
            if (descripcion === null) return;
            const enlace = prompt('Nuevo enlace:', actual.enlace);
            if (enlace === null) return;
            const resp = await fetch(`/api/contenidos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, tema, tipo: tipoRecurso, categoria, descripcion, enlace })
            });
            if (!resp.ok) throw new Error('Error al actualizar');
            mostrarToast('Recurso actualizado', 'success');
            mostrarGestion('contenidos');
            return;
        }

        if (tipo === 'sugerencias') {
            const actual = await obtenerSugerencia(id);
            const texto = prompt('Editar texto de la sugerencia:', actual.texto);
            if (texto === null) return;
            const resp = await fetch(`/api/sugerencias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto })
            });
            if (!resp.ok) throw new Error('Error al actualizar');
            mostrarToast('Sugerencia actualizada', 'success');
            mostrarGestion('sugerencias');
            return;
        }
    } catch (e) {
        console.error(e);
        mostrarToast('No se pudo actualizar', 'error');
    }
}

async function marcarSugerenciaLeida(id) {
    try {
        const resp = await fetch(`/api/sugerencias/${id}/leida`, { method: 'PUT' });
        if (!resp.ok) throw new Error();
        mostrarToast('Sugerencia marcada como leída', 'success');
        mostrarGestion('sugerencias');
    } catch (e) {
        mostrarToast('No se pudo actualizar', 'error');
    }
}

async function obtenerSugerencia(id) {
    const lista = await (await fetch('/api/sugerencias')).json();
    return lista.find(s => s._id === id) || {};
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
