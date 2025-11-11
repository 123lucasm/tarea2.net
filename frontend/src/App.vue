<template>
  <div class="app-shell">
    <PvMenubar :model="menuItems" class="app-menubar">
      <template #start>
        <RouterLink to="/" class="brand">
          <i class="pi pi-compass" />
          <span class="brand-name">Equilibrio Universitario</span>
        </RouterLink>
      </template>
      <template #end>
        <div class="flex align-items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <span class="text-sm flex align-items-center gap-2">
              <i class="pi pi-user" />
              {{ authStore.user?.nombre }}
            </span>
            <PvButton label="Cerrar sesión" size="small" outlined @click="handleLogout" />
          </template>
          <template v-else>
            <PvButton
              label="Iniciar sesión"
              size="small"
              severity="primary"
              outlined
              @click="openAuth('login')"
            />
            <PvButton label="Registrarse" size="small" severity="primary" @click="openAuth('register')" />
          </template>
        </div>
      </template>
    </PvMenubar>

    <main class="app-content">
      <RouterView />
    </main>

    <PvToast position="top-right" />
    <PvConfirmDialog />

    <AuthDialog ref="authDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import AuthDialog from '@/components/AuthDialog.vue';

type AuthMode = 'login' | 'register';

const router = useRouter();
const authStore = useAuthStore();
const authDialogRef = ref<InstanceType<typeof AuthDialog> | null>(null);

onMounted(() => {
  authStore.hydrate();
});

const menuItems = computed(() => {
  const items = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      command: () => router.push('/'),
    },
  ];

  if (authStore.isAdmin) {
    items.push(
      {
        label: 'Panel',
        icon: 'pi pi-chart-bar',
        command: () => router.push('/admin'),
      },
      {
        label: 'Categorías',
        icon: 'pi pi-tags',
        command: () => router.push('/admin/categorias'),
      },
      {
        label: 'Contenidos',
        icon: 'pi pi-book',
        command: () => router.push('/admin/contenidos'),
      },
      {
        label: 'Sugerencias',
        icon: 'pi pi-comments',
        command: () => router.push('/admin/sugerencias'),
      }
    );
  }

  return items;
});

function handleLogout() {
  authStore.logout();
  router.push('/');
}

function openAuth(mode: AuthMode) {
  authDialogRef.value?.open(mode);
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(238, 242, 255, 0.7), rgba(248, 250, 255, 0.95));
  display: flex;
  flex-direction: column;
}

.app-menubar {
  border: none;
  border-radius: 0;
  padding-block: 0.75rem;
  padding-inline: clamp(1rem, 4vw, 3rem);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--app-outline);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--app-text-primary);
  font-weight: 600;
  font-size: 1.1rem;
}

.brand :deep(i) {
  font-size: 1.4rem;
  color: var(--app-primary);
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem);
}

@media (max-width: 768px) {
  .brand-name {
    display: none;
  }
}
</style>

