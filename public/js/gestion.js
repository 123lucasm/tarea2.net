// Gestión común para páginas dedicadas (categorías, contenidos, sugerencias)
let usuarioActual = null;
let gestionTipo = null;
let items = [];
let filteredItems = [];
let currentPage = 1;
let pageSize = 10;

document.addEventListener('DOMContentLoaded', async () => {
    verificarSesion();
    if (!usuarioActual) {
        window.location.href = '/';
        return;
    }
    actualizarUIUsuario();
    await renderGestionDesdeMetas();
    inicializarBusqueda();
});

function verificarSesion() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) usuarioActual = JSON.parse(usuarioGuardado);
}

function actualizarUIUsuario() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;
    navAuth.innerHTML = `
        <div class="user-menu">
            <span class="user-name"><i class="bi bi-person-circle me-2"></i>${usuarioActual.nombre}</span>
            <button class="btn btn-outline-light btn-sm" id="btnLogout">
                <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
            </button>
        </div>
    `;
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.onclick = cerrarSesion;
}

function cerrarSesion() {
    if (confirm('¿Estás seguro/a que deseas cerrar sesión?')) {
        usuarioActual = null;
        localStorage.removeItem('usuario');
        window.location.href = '/';
    }
}

async function renderGestionDesdeMetas() {
    const metaTipo = document.querySelector('meta[name="gestion-tipo"]').content;
    const metaTitulo = document.querySelector('meta[name="gestion-titulo"]').content;
    const metaDescripcion = document.querySelector('meta[name="gestion-descripcion"]').content;
    const titulo = document.getElementById('gestionTitulo');
    const descripcion = document.getElementById('gestionDescripcion');
    const thead = document.getElementById('gestionThead');
    const tbody = document.getElementById('gestionTbody');

    if (titulo) titulo.textContent = metaTitulo;
    if (descripcion) descripcion.textContent = metaDescripcion;

    gestionTipo = metaTipo;
    tbody.innerHTML = '';

    if (metaTipo === 'categorias') {
        thead.innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="text-end">Acciones</th>
            </tr>
        `;
        items = await (await fetch('/api/categorias')).json();
        filteredItems = items;
        renderTabla();
    }

    if (metaTipo === 'contenidos') {
        thead.innerHTML = `
            <tr>
                <th>Título</th>
                <th>Tema</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th class="text-end">Acciones</th>
            </tr>
        `;
        items = await (await fetch('/api/contenidos')).json();
        filteredItems = items;
        renderTabla();
    }

    if (metaTipo === 'sugerencias') {
        thead.innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Texto</th>
                <th>Leída</th>
                <th class="text-end">Acciones</th>
            </tr>
        `;
        items = await (await fetch('/api/sugerencias')).json();
        filteredItems = items;
        renderTabla();
    }

    tbody.addEventListener('click', manejarAccionTabla);
}

function renderTabla() {
    const tbody = document.getElementById('gestionTbody');
    const pagination = document.getElementById('gestionPagination');
    if (!tbody || !pagination) return;
    tbody.innerHTML = '';
    const total = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filteredItems.slice(start, end);
    pageItems.forEach(item => tbody.appendChild(buildRow(item)));
    renderPaginacion(totalPages);
}

function buildRow(item) {
    const tr = document.createElement('tr');
    if (gestionTipo === 'categorias') {
        tr.innerHTML = `
            <td>${escapeHtml(item.nombre)}</td>
            <td>${escapeHtml(item.descripcion)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" data-action="editar" data-id="${item._id}" data-tipo="categorias"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item._id}" data-tipo="categorias"><i class="bi bi-trash"></i></button>
            </td>
        `;
        return tr;
    }
    if (gestionTipo === 'contenidos') {
        tr.innerHTML = `
            <td>${escapeHtml(item.titulo)}</td>
            <td>${escapeHtml(item.tema)}</td>
            <td>${escapeHtml(item.tipo)}</td>
            <td>${escapeHtml(item.categoria)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" data-action="editar" data-id="${item._id}" data-tipo="contenidos"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item._id}" data-tipo="contenidos"><i class="bi bi-trash"></i></button>
            </td>
        `;
        return tr;
    }
    tr.innerHTML = `
        <td>${escapeHtml(item.nombre || 'Anónimo')}</td>
        <td>${escapeHtml(item.correo || '')}</td>
        <td>${escapeHtml(item.texto)}</td>
        <td>${item.leida ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>'}</td>
        <td class="text-end">
            <button class="btn btn-sm btn-outline-success me-2" data-action="marcarLeida" data-id="${item._id}" data-tipo="sugerencias" ${item.leida ? 'disabled' : ''}><i class="bi bi-check2"></i></button>
            <button class="btn btn-sm btn-outline-primary me-2" data-action="editar" data-id="${item._id}" data-tipo="sugerencias"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item._id}" data-tipo="sugerencias"><i class="bi bi-trash"></i></button>
        </td>
    `;
    return tr;
}

function renderPaginacion(totalPages) {
    const pagination = document.getElementById('gestionPagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    const prev = document.createElement('li');
    prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prev.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
    prev.onclick = (e) => { e.preventDefault(); if (currentPage > 1) { currentPage--; renderTabla(); } };
    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = (e) => { e.preventDefault(); currentPage = i; renderTabla(); };
        pagination.appendChild(li);
    }

    const next = document.createElement('li');
    next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    next.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
    next.onclick = (e) => { e.preventDefault(); if (currentPage < totalPages) { currentPage++; renderTabla(); } };
    pagination.appendChild(next);
}

function inicializarBusqueda() {
    const search = document.getElementById('gestionSearch');
    if (!search) return;
    search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        if (!q) {
            filteredItems = items;
        } else {
            filteredItems = items.filter(item => filtraItem(item, q));
        }
        currentPage = 1;
        renderTabla();
    });
}

function filtraItem(item, q) {
    if (gestionTipo === 'categorias') {
        return (item.nombre || '').toLowerCase().includes(q) || (item.descripcion || '').toLowerCase().includes(q);
    }
    if (gestionTipo === 'contenidos') {
        return (item.titulo || '').toLowerCase().includes(q) || (item.tema || '').toLowerCase().includes(q) || (item.tipo || '').toLowerCase().includes(q) || (item.categoria || '').toLowerCase().includes(q);
    }
    return (item.nombre || '').toLowerCase().includes(q) || (item.correo || '').toLowerCase().includes(q) || (item.texto || '').toLowerCase().includes(q);
}

async function manejarAccionTabla(event) {
    const btn = event.target.closest('button');
    if (!btn) return;
    const accion = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    const tipo = btn.getAttribute('data-tipo');
    if (!accion || !id || !tipo) return;

    if (accion === 'eliminar') return eliminarElemento(tipo, id);
    if (accion === 'editar') return abrirModalEdicion(tipo, id);
    if (accion === 'marcarLeida') return marcarSugerenciaLeida(id);
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
        await renderGestionDesdeMetas();
    } catch (e) {
        console.error(e);
        mostrarToast('No se pudo eliminar', 'error');
    }
}

async function abrirModalEdicion(tipo, id) {
    try {
        let data = null;
        if (tipo === 'categorias') {
            data = items.find(i => i._id === id);
        } else if (tipo === 'contenidos') {
            data = await (await fetch(`/api/contenidos/${id}`)).json();
        } else if (tipo === 'sugerencias') {
            data = items.find(i => i._id === id) || {};
        }

        construirFormularioEdicion(tipo, data);
        const modalEl = document.getElementById('editModal');
        const modal = new bootstrap.Modal(modalEl);
        const saveBtn = document.getElementById('editSaveBtn');
        saveBtn.onclick = async () => {
            await guardarEdicion(tipo, id);
            modal.hide();
        };
        modal.show();
    } catch (e) {
        console.error(e);
        mostrarToast('No se pudo abrir el editor', 'error');
    }
}

function construirFormularioEdicion(tipo, data) {
    const form = document.getElementById('editForm');
    const title = document.getElementById('editModalTitle');
    if (!form || !title) return;
    form.innerHTML = '';
    if (tipo === 'categorias') {
        title.textContent = 'Editar categoría';
        form.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-control" id="edit_nombre" value="${escapeHtml(data.nombre)}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" id="edit_descripcion" rows="3" required>${escapeHtml(data.descripcion)}</textarea>
            </div>
        `;
        return;
    }
    if (tipo === 'contenidos') {
        title.textContent = 'Editar recurso';
        form.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Título</label>
                <input type="text" class="form-control" id="edit_titulo" value="${escapeHtml(data.titulo)}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Tema</label>
                <input type="text" class="form-control" id="edit_tema" value="${escapeHtml(data.tema)}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Tipo (infografia|video)</label>
                <input type="text" class="form-control" id="edit_tipo" value="${escapeHtml(data.tipo)}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Categoría</label>
                <input type="text" class="form-control" id="edit_categoria" value="${escapeHtml(data.categoria)}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" id="edit_descripcion" rows="3" required>${escapeHtml(data.descripcion)}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Enlace</label>
                <input type="text" class="form-control" id="edit_enlace" value="${escapeHtml(data.enlace)}" required>
            </div>
        `;
        return;
    }
    title.textContent = 'Editar sugerencia';
    form.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" id="edit_nombre" value="${escapeHtml(data.nombre || '')}">
        </div>
        <div class="mb-3">
            <label class="form-label">Correo</label>
            <input type="email" class="form-control" id="edit_correo" value="${escapeHtml(data.correo || '')}">
        </div>
        <div class="mb-3">
            <label class="form-label">Texto</label>
            <textarea class="form-control" id="edit_texto" rows="4" required>${escapeHtml(data.texto || '')}</textarea>
        </div>
    `;
}

async function guardarEdicion(tipo, id) {
    try {
        if (tipo === 'categorias') {
            const nombre = document.getElementById('edit_nombre').value.trim();
            const descripcion = document.getElementById('edit_descripcion').value.trim();
            const resp = await fetch(`/api/categorias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, descripcion })
            });
            if (!resp.ok) throw new Error();
            mostrarToast('Categoría actualizada', 'success');
            await renderGestionDesdeMetas();
            return;
        }
        if (tipo === 'contenidos') {
            const titulo = document.getElementById('edit_titulo').value.trim();
            const tema = document.getElementById('edit_tema').value.trim();
            const tipoRecurso = document.getElementById('edit_tipo').value.trim();
            const categoria = document.getElementById('edit_categoria').value.trim();
            const descripcion = document.getElementById('edit_descripcion').value.trim();
            const enlace = document.getElementById('edit_enlace').value.trim();
            const resp = await fetch(`/api/contenidos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, tema, tipo: tipoRecurso, categoria, descripcion, enlace })
            });
            if (!resp.ok) throw new Error();
            mostrarToast('Recurso actualizado', 'success');
            await renderGestionDesdeMetas();
            return;
        }
        // sugerencias
        const nombre = document.getElementById('edit_nombre').value.trim();
        const correo = document.getElementById('edit_correo').value.trim();
        const texto = document.getElementById('edit_texto').value.trim();
        const resp = await fetch(`/api/sugerencias/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, texto })
        });
        if (!resp.ok) throw new Error();
        mostrarToast('Sugerencia actualizada', 'success');
        await renderGestionDesdeMetas();
    } catch (e) {
        console.error(e);
        mostrarToast('No se pudo guardar', 'error');
    }
}

async function marcarSugerenciaLeida(id) {
    try {
        const resp = await fetch(`/api/sugerencias/${id}/leida`, { method: 'PUT' });
        if (!resp.ok) throw new Error();
        mostrarToast('Sugerencia marcada como leída', 'success');
        await renderGestionDesdeMetas();
    } catch (e) {
        mostrarToast('No se pudo actualizar', 'error');
    }
}

function mostrarToast(mensaje, tipo = 'success') {
    const iconos = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
    const colores = { success: 'success', error: 'danger', info: 'info' };
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '11';
        document.body.appendChild(toastContainer);
    }
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
    toastElement.addEventListener('hidden.bs.toast', function () { toastElement.remove(); });
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


