import { defineStore } from 'pinia';

export type Categoria = {
  _id: string;
  nombre: string;
  descripcion: string;
};

export type Contenido = {
  _id: string;
  titulo: string;
  tema: string;
  tipo: 'infografia' | 'video' | 'herramienta' | string;
  categoria: string;
  descripcion: string;
  enlace: string;
};

export type Comentario = {
  _id: string;
  recurso: string;
  autor: string;
  autorNombre: string;
  autorCorreo: string;
  texto: string;
  createdAt: string;
  updatedAt: string;
};

export type UsuarioResumen = {
  _id: string;
  nombre: string;
  correo: string;
  rol: 'admin' | 'admin_t' | 'estudiante';
  rolSolicitado?: 'admin' | null;
  requiereAprobacionAdmin?: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoriaPayload = Pick<Categoria, 'nombre' | 'descripcion'>;

export type ContenidoPayload = Pick<Contenido, 'titulo' | 'tema' | 'tipo' | 'categoria' | 'descripcion' | 'enlace'>;

export type SugerenciaPayload = Partial<Pick<Sugerencia, 'nombre' | 'correo' | 'texto'>>;

export type Sugerencia = {
  _id: string;
  nombre?: string;
  correo?: string;
  texto: string;
  leida: boolean;
};

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    categorias: [] as Categoria[],
    contenidos: [] as Contenido[],
    sugerencias: [] as Sugerencia[],
    comentariosPorRecurso: new Map<string, Comentario[]>(),
    categoriasStatus: 'idle' as LoadingState,
    contenidosStatus: 'idle' as LoadingState,
    sugerenciasStatus: 'idle' as LoadingState,
    comentariosStatus: new Map<string, LoadingState>(),
    solicitudesAdmin: [] as UsuarioResumen[],
    solicitudesAdminStatus: 'idle' as LoadingState,
    administradores: [] as UsuarioResumen[],
    administradoresStatus: 'idle' as LoadingState,
  }),
  getters: {
    totalCategorias: (state) => state.categorias.length,
    totalContenidos: (state) => state.contenidos.length,
    totalSugerencias: (state) => state.sugerencias.length,
    getComentariosPorRecurso: (state) => {
      return (recursoId: string) => state.comentariosPorRecurso.get(recursoId) ?? [];
    },
    getComentariosStatus: (state) => {
      return (recursoId: string) => state.comentariosStatus.get(recursoId) ?? 'idle';
    },
  },
  actions: {
    async fetchCategorias() {
      if (this.categoriasStatus === 'loading') return;
      this.categoriasStatus = 'loading';
      try {
        const response = await fetch('/api/categorias');
        if (!response.ok) throw new Error('No se pudieron cargar las categorías');
        this.categorias = await response.json();
        this.categoriasStatus = 'success';
      } catch (error) {
        console.error(error);
        this.categoriasStatus = 'error';
      }
    },
    async fetchContenidos() {
      if (this.contenidosStatus === 'loading') return;
      this.contenidosStatus = 'loading';
      try {
        const response = await fetch('/api/contenidos');
        if (!response.ok) throw new Error('No se pudieron cargar los contenidos');
        this.contenidos = await response.json();
        this.contenidosStatus = 'success';
      } catch (error) {
        console.error(error);
        this.contenidosStatus = 'error';
      }
    },
    async fetchSugerencias() {
      if (this.sugerenciasStatus === 'loading') return;
      this.sugerenciasStatus = 'loading';
      try {
        const response = await fetch('/api/sugerencias');
        if (!response.ok) throw new Error('No se pudieron cargar las sugerencias');
        this.sugerencias = await response.json();
        this.sugerenciasStatus = 'success';
      } catch (error) {
        console.error(error);
        this.sugerenciasStatus = 'error';
      }
    },
    async fetchSolicitudesAdmin(force = false) {
      if (this.solicitudesAdminStatus === 'loading') return;
      if (this.solicitudesAdmin.length && !force) return;
      this.solicitudesAdminStatus = 'loading';
      try {
        const response = await fetch('/api/usuarios/admin/pendientes');
        if (!response.ok) throw new Error('No se pudieron cargar las solicitudes de administrador');
        this.solicitudesAdmin = await response.json();
        this.solicitudesAdminStatus = 'success';
      } catch (error) {
        console.error(error);
        this.solicitudesAdminStatus = 'error';
      }
    },
    async cancelarSolicitudAdmin(id: string) {
      const response = await fetch(`/api/usuarios/${id}/solicitud-admin`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo cancelar la solicitud');
      }
      this.solicitudesAdmin = this.solicitudesAdmin.filter((solicitud) => solicitud._id !== id);
      return data as { mensaje: string };
    },
    async fetchAdministradores(force = false) {
      if (this.administradoresStatus === 'loading') return;
      if (this.administradores.length && !force) return;
      this.administradoresStatus = 'loading';
      try {
        const response = await fetch('/api/usuarios/administradores');
        if (!response.ok) throw new Error('No se pudieron cargar los administradores');
        this.administradores = await response.json();
        this.administradoresStatus = 'success';
      } catch (error) {
        console.error(error);
        this.administradoresStatus = 'error';
      }
    },
    async removerAdministrador(id: string) {
      const response = await fetch(`/api/usuarios/${id}/admin`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo remover al administrador');
      }
      this.administradores = this.administradores.filter((admin) => admin._id !== id);
      return data as { mensaje: string };
    },
    async actualizarAdministrador(id: string, payload: Partial<Pick<UsuarioResumen, 'nombre' | 'correo'>>) {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar el administrador');
      }
      this.administradores = this.administradores.map((admin) => (admin._id === id ? (data as UsuarioResumen) : admin));
      return data as UsuarioResumen;
    },
    async createCategoria(payload: CategoriaPayload) {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear la categoría');
      }
      this.categorias.push(data);
      return data as Categoria;
    },
    async updateCategoria(id: string, payload: CategoriaPayload) {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar la categoría');
      }
      this.categorias = this.categorias.map((categoria) => (categoria._id === id ? data : categoria));
      return data as Categoria;
    },
    async deleteCategoria(id: string) {
      const response = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo eliminar la categoría');
      }
      this.categorias = this.categorias.filter((categoria) => categoria._id !== id);
    },
    async createContenido(payload: ContenidoPayload) {
      const response = await fetch('/api/contenidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear el contenido');
      }
      this.contenidos.unshift(data);
      return data as Contenido;
    },
    async updateContenido(id: string, payload: ContenidoPayload) {
      const response = await fetch(`/api/contenidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar el contenido');
      }
      this.contenidos = this.contenidos.map((contenido) => (contenido._id === id ? data : contenido));
      return data as Contenido;
    },
    async deleteContenido(id: string) {
      const response = await fetch(`/api/contenidos/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo eliminar el contenido');
      }
      this.contenidos = this.contenidos.filter((contenido) => contenido._id !== id);
    },
    async updateSugerencia(id: string, payload: SugerenciaPayload) {
      const response = await fetch(`/api/sugerencias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar la sugerencia');
      }
      this.sugerencias = this.sugerencias.map((sugerencia) => (sugerencia._id === id ? data : sugerencia));
      return data as Sugerencia;
    },
    async marcarSugerenciaLeida(id: string) {
      const response = await fetch(`/api/sugerencias/${id}/leida`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar la sugerencia');
      }
      this.sugerencias = this.sugerencias.map((sugerencia) => (sugerencia._id === id ? data : sugerencia));
      return data as Sugerencia;
    },
    async deleteSugerencia(id: string) {
      const response = await fetch(`/api/sugerencias/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo eliminar la sugerencia');
      }
      this.sugerencias = this.sugerencias.filter((sugerencia) => sugerencia._id !== id);
    },
    async fetchComentarios(recursoId: string) {
      if (this.comentariosStatus.get(recursoId) === 'loading') return;
      this.comentariosStatus = new Map(this.comentariosStatus).set(recursoId, 'loading');
      try {
        const response = await fetch(`/api/contenidos/${recursoId}/comentarios`);
        if (!response.ok) throw new Error('No se pudieron cargar los comentarios');
        const comentarios = (await response.json()) as Comentario[];
        this.comentariosPorRecurso = new Map(this.comentariosPorRecurso).set(recursoId, comentarios);
        this.comentariosStatus = new Map(this.comentariosStatus).set(recursoId, 'success');
      } catch (error) {
        console.error(error);
        this.comentariosStatus = new Map(this.comentariosStatus).set(recursoId, 'error');
      }
    },
    async crearComentario(recursoId: string, payload: { autorId: string; texto: string }) {
      const response = await fetch(`/api/contenidos/${recursoId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear el comentario');
      }
      const existentes = this.comentariosPorRecurso.get(recursoId) ?? [];
      this.comentariosPorRecurso = new Map(this.comentariosPorRecurso).set(recursoId, [
        data as Comentario,
        ...existentes,
      ]);
      return data as Comentario;
    },
    async eliminarComentario(id: string, recursoId: string) {
      const response = await fetch(`/api/comentarios/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo eliminar el comentario');
      }
      const existentes = this.comentariosPorRecurso.get(recursoId) ?? [];
      this.comentariosPorRecurso = new Map(this.comentariosPorRecurso).set(
        recursoId,
        existentes.filter((comentario) => comentario._id !== id)
      );
    },
  },
});

