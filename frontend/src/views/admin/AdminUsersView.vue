<template>
  <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5 admin-users">
    <header class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">
      <div>
        <h1 class="text-3xl font-semibold mb-1">Usuarios administradores</h1>
        <p class="text-600 m-0">
          Gestiona quién tiene acceso al panel. Los administradores permanentes mantienen el rol <strong>admin</strong>;
          los temporales usan <strong>admin_t</strong>.
        </p>
      </div>
      <div class="flex align-items-center gap-2">
        <PvButton
          label="Actualizar"
          icon="pi pi-refresh"
          severity="secondary"
          text
          :loading="isLoading"
          @click="reload"
        />
        <PvButton
          label="Crear administrador temporal"
          icon="pi pi-user-plus"
          severity="primary"
          @click="abrirDialogoCrear"
        />
      </div>
    </header>

    <PvDataTable
      :value="administradores"
      data-key="_id"
      :loading="isLoading"
      responsive-layout="stack"
      breakpoint="960px"
      empty-message="No hay administradores registrados."
    >
      <PvColumn field="nombre" header="Nombre" sortable />
      <PvColumn field="correo" header="Correo" sortable />
      <PvColumn header="Rol">
        <template #body="{ data }">
          <PvTag
            :value="data.rol === 'admin' ? 'Permanente' : 'Temporal'"
            :severity="data.rol === 'admin' ? 'success' : 'info'"
            rounded
          />
        </template>
      </PvColumn>
      <PvColumn header="Creado" field="createdAt" sortable>
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </PvColumn>
      <PvColumn header="Acciones" body-class="text-right">
        <template #body="{ data }">
          <div class="flex justify-content-end gap-2">
            <PvButton
              label="Revocar acceso"
              icon="pi pi-trash"
              size="small"
              severity="danger"
              text
              :loading="accionEnCurso === `revocar-${data._id}`"
              @click="revocar(data._id)"
              :disabled="esSuperAdmin(data)"
            />
          </div>
        </template>
      </PvColumn>
    </PvDataTable>

    <PvDialog
      v-model:visible="dialogoCrear"
      header="Promover usuario"
      modal
      :style="{ width: 'min(480px, 95vw)' }"
      @hide="resetCrear"
    >
      <form class="flex flex-column gap-3" @submit.prevent="promoverManual">
        <div class="flex flex-column gap-2">
          <label for="usuario-correo" class="text-sm text-600">Correo del usuario</label>
          <PvInputText
            id="usuario-correo"
            v-model="formPromover.correo"
            type="email"
            required
            placeholder="usuario@correo.com"
          />
        </div>
        <small v-if="formError" class="text-red-500">{{ formError }}</small>
        <div class="flex justify-content-end gap-2">
          <PvButton type="button" label="Cancelar" severity="secondary" text @click="dialogoCrear = false" />
          <PvButton type="submit" label="Promover" :loading="promoviendo" />
        </div>
      </form>
    </PvDialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

import { useAdminUsersStore } from '@/stores/adminUsers';

const adminUsersStore = useAdminUsersStore();
const toast = useToast();

const accionEnCurso = ref<string | null>(null);
const dialogoCrear = ref(false);
const promoviendo = ref(false);
const formPromover = reactive({ correo: '' });
const formError = ref('');

const administradores = computed(() => adminUsersStore.administradores);
const isLoading = computed(() => adminUsersStore.status === 'loading');

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function esSuperAdmin(admin: { correo: string }) {
  return admin.correo?.toLowerCase() === 'admin@admin.com';
}

async function reload() {
  await adminUsersStore.fetchAdministradores(true);
}

async function revocar(id: string) {
  accionEnCurso.value = `revocar-${id}`;
  try {
    await adminUsersStore.revocar(id);
    toast.add({ severity: 'success', summary: 'Acceso revocado', life: 3000 });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo revocar el acceso',
      life: 4000,
    });
  } finally {
    accionEnCurso.value = null;
  }
}

function abrirDialogoCrear() {
  dialogoCrear.value = true;
}

function resetCrear() {
  formPromover.correo = '';
  formError.value = '';
}

async function promoverManual() {
  if (!formPromover.correo.trim()) {
    formError.value = 'Ingresa un correo válido';
    return;
  }

  formError.value = '';
  promoviendo.value = true;
  try {
    const response = await fetch('/api/admin/usuarios/promover-por-correo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: formPromover.correo.trim(),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo promover al usuario');
    }
    await adminUsersStore.fetchAdministradores(true);
    toast.add({ severity: 'success', summary: 'Usuario promovido', detail: data.mensaje, life: 3000 });
    dialogoCrear.value = false;
    resetCrear();
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'No se pudo promover al usuario';
  } finally {
    promoviendo.value = false;
  }
}

onMounted(() => {
  adminUsersStore.fetchAdministradores();
});
</script>

<style scoped>
.admin-users {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>


