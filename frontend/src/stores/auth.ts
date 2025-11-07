import { defineStore } from 'pinia';

type User = {
  _id: string;
  nombre: string;
  correo: string;
  rol?: string;
};

type LoginPayload = {
  correo: string;
  contraseña: string;
};

type RegisterPayload = {
  nombre: string;
  correo: string;
  contraseña: string;
};

const STORAGE_KEY = 'usuario';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    hydrate() {
      if (this.user) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        this.user = JSON.parse(raw) as User;
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
        this.user = data.usuario;
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

