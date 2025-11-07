<template>
  <PvDialog
    v-model:visible="visible"
    :modal="true"
    :header="null"
    :style="{ width: 'min(460px, 90vw)' }"
    dismissable-mask
    @hide="resetForm"
  >
    <div class="auth-container">
      <div class="auth-heading">
        <span class="auth-logo">
          <i class="pi pi-compass" />
        </span>
        <div>
          <h2 class="auth-title">{{ headingTitle }}</h2>
          <p class="auth-subtitle">{{ headingSubtitle }}</p>
        </div>
      </div>

      <div class="auth-toggle">
        <PvButton
          label="Iniciar sesión"
          icon="pi pi-sign-in"
          :outlined="!isLogin"
          :severity="isLogin ? 'primary' : 'secondary'"
          size="small"
          @click="setMode('login')"
        />
        <PvButton
          label="Crear cuenta"
          icon="pi pi-user-plus"
          :outlined="isLogin"
          :severity="isLogin ? 'secondary' : 'primary'"
          size="small"
          @click="setMode('register')"
        />
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label for="correo">Correo electrónico</label>
          <PvInputText id="correo" v-model="form.correo" type="email" required autocomplete="email" placeholder="tu@correo.com" />
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <PvPassword
            id="password"
            v-model="form.contraseña"
            toggle-mask
            :feedback="false"
            autocomplete="current-password"
            :input-props="{ placeholder: '••••••••' }"
          />
        </div>

        <div v-if="!isLogin" class="field">
          <label for="nombre">Nombre completo</label>
          <PvInputText id="nombre" v-model="form.nombre" required autocomplete="name" placeholder="Tu nombre" />
        </div>

        <small v-if="error" class="auth-error">{{ error }}</small>

        <PvButton
          class="auth-submit"
          :label="primaryActionLabel"
          :loading="authStore.loading"
          type="submit"
          severity="primary"
          size="large"
        />

        <button class="auth-switch" type="button" @click="toggleMode">
          {{ secondaryActionLabel }}
        </button>
      </form>
    </div>
  </PvDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

import { useAuthStore } from '@/stores/auth';

type AuthMode = 'login' | 'register';

type AuthForm = {
  correo: string;
  contraseña: string;
  nombre?: string;
};

const authStore = useAuthStore();
const toast = useToast();

const visible = ref(false);
const mode = ref<AuthMode>('login');
const error = ref('');

const form = reactive<AuthForm>({
  correo: '',
  contraseña: '',
  nombre: '',
});

const isLogin = computed(() => mode.value === 'login');
const headingTitle = computed(() => (isLogin.value ? 'Bienvenido de vuelta' : 'Crear una cuenta'));
const headingSubtitle = computed(() =>
  isLogin.value ? 'Accede con tu correo y contraseña para continuar.' : 'Completa los datos y comienza a usar la plataforma.'
);
const primaryActionLabel = computed(() => (mode.value === 'login' ? 'Entrar' : 'Registrarme'));
const secondaryActionLabel = computed(() =>
  isLogin.value ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'
);

function resetForm() {
  form.correo = '';
  form.contraseña = '';
  form.nombre = '';
  error.value = '';
}

function setMode(next: AuthMode) {
  if (mode.value === next) return;
  mode.value = next;
  error.value = '';
}

function toggleMode() {
  setMode(isLogin.value ? 'register' : 'login');
}

async function handleSubmit() {
  error.value = '';
  try {
    if (mode.value === 'login') {
      await authStore.login({ correo: form.correo.trim(), contraseña: form.contraseña });
      toast.add({ severity: 'success', summary: 'Sesión iniciada', life: 3000 });
    } else {
      if (!form.nombre?.trim()) {
        error.value = 'Por favor ingresa tu nombre';
        return;
      }
      await authStore.register({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        contraseña: form.contraseña,
      });
      toast.add({ severity: 'success', summary: 'Cuenta creada', detail: 'Bienvenido/a', life: 3000 });
    }
    visible.value = false;
    resetForm();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
  }
}

function open(newMode: AuthMode) {
  setMode(newMode);
  visible.value = true;
}

defineExpose({ open });
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(180deg, rgba(79, 70, 229, 0.06), rgba(34, 211, 238, 0.04))
    var(--app-surface);
  border-radius: 1.5rem;
}

.auth-heading {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-logo {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.9rem;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.18), rgba(34, 211, 238, 0.18));
  color: var(--app-primary);
  font-size: 1.3rem;
}

.auth-title {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--app-text-primary);
}

.auth-subtitle {
  margin: 0;
  color: var(--app-text-secondary);
}

.auth-toggle {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.35rem;
  border-radius: 999px;
  border: 1px solid var(--app-outline);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-weight: 600;
  color: var(--app-text-secondary);
}

.auth-error {
  color: var(--p-red-500);
}

.auth-submit {
  width: 100%;
}

.auth-switch {
  border: none;
  background: transparent;
  color: var(--app-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  align-self: center;
}

.auth-switch:hover {
  text-decoration: underline;
}

</style>

