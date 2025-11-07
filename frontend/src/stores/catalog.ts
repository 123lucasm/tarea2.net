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
  tipo: 'infografia' | 'video' | string;
  categoria: string;
  descripcion: string;
  enlace: string;
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
    categoriasStatus: 'idle' as LoadingState,
    contenidosStatus: 'idle' as LoadingState,
    sugerenciasStatus: 'idle' as LoadingState,
  }),
  getters: {
    totalCategorias: (state) => state.categorias.length,
    totalContenidos: (state) => state.contenidos.length,
    totalSugerencias: (state) => state.sugerencias.length,
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
  },
});

