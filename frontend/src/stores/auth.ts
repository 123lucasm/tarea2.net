import { defineStore } from 'pinia';

type Role = 'admin' | 'estudiante';

type User = {
  _id: string;
  nombre: string;
  correo: string;
  rol: Role;
  rolSolicitado?: Role | null;
  requiereAprobacionAdmin?: boolean;
};

type LoginPayload = {
  correo: string;
  contraseña: string;
};

type RegisterPayload = {
  nombre: string;
  correo: string;
  contraseña: string;
  rol: Role;
};

const STORAGE_KEY = 'usuario';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.rol === 'admin',
  },
  actions: {
    hydrate() {
      if (this.user) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const stored = JSON.parse(raw) as User;
        if (!stored.rol) {
          stored.rol = 'estudiante';
        }
        if (stored.rolSolicitado && stored.rol !== 'admin') {
          stored.requiereAprobacionAdmin = true;
        }
        this.user = stored;
      } catch (error) {
        console.warn('No se pudo hidratar la sesión', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    async login(payload: LoginPayload) {
      try {
        this.loading = true;
        const response = await fetch('/api/usuarios/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al iniciar sesión');
        }
        const usuario = {
          ...data.usuario,
          rol: data.usuario?.rol ?? 'estudiante',
          rolSolicitado: data.usuario?.rolSolicitado ?? null,
          requiereAprobacionAdmin: data.usuario?.requiereAprobacionAdmin ?? false,
        } as User;
        this.user = usuario;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
        return data;
      } finally {
        this.loading = false;
      }
    },
    async register(payload: RegisterPayload) {
      try {
        this.loading = true;
        const response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al crear la cuenta');
        }
        if (!data.rol) {
          data.rol = 'estudiante';
        }
        if (data.rolSolicitado && data.rol !== 'admin') {
          data.requiereAprobacionAdmin = true;
        }
        this.user = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
        return data;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

