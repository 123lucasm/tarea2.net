import { defineStore } from 'pinia';

export type AdminUser = {
  _id: string;
  nombre: string;
  correo: string;
  rol: 'admin' | 'admin_t';
  createdAt: string;
  updatedAt: string;
};

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const useAdminUsersStore = defineStore('adminUsers', {
  state: () => ({
    administradores: [] as AdminUser[],
    status: 'idle' as LoadingState,
    lastError: '' as string | '',
  }),
  getters: {
    totalAdministradores: (state) => state.administradores.length,
  },
  actions: {
    async fetchAdministradores(force = false) {
      if (this.status === 'loading') return;
      if (this.administradores.length && !force) return;
      this.status = 'loading';
      this.lastError = '';
      try {
        const response = await fetch('/api/admin/usuarios');
        if (!response.ok) {
          throw new Error('No se pudieron cargar los administradores');
        }
        this.administradores = await response.json();
        this.status = 'success';
      } catch (error) {
        console.error(error);
        this.lastError = error instanceof Error ? error.message : 'Error inesperado';
        this.status = 'error';
      }
    },
    async promover(id: string) {
      const response = await fetch(`/api/admin/usuarios/${id}/promover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo promover al administrador');
      }
      await this.fetchAdministradores(true);
      return data as { mensaje: string };
    },
    async revocar(id: string) {
      const response = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo revocar el acceso de administrador');
      }
      await this.fetchAdministradores(true);
      return data as { mensaje: string };
    },
  },
});


