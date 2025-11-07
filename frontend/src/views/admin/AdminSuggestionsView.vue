<template>
  <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5">
    <div class="flex flex-column gap-4">
      <header class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
        <div>
          <h1 class="text-3xl font-semibold mb-1">Gestión de sugerencias</h1>
          <p class="text-600 m-0">Revisa, responde y marca como atendidas las sugerencias.</p>
        </div>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <PvInputText v-model="filters.global.value" placeholder="Buscar..." />
        </span>
      </header>

      <PvDataTable
        :value="catalogStore.sugerencias"
        :loading="catalogStore.sugerenciasStatus === 'loading'"
        data-key="_id"
        :filters="filters"
        filter-display="menu"
        :global-filter-fields="['nombre', 'correo', 'texto']"
        paginator
        :rows="10"
        responsive-layout="stack"
        breakpoint="960px"
        empty-message="No hay sugerencias registradas"
      >
        <PvColumn field="nombre" header="Nombre" />
        <PvColumn field="correo" header="Correo" />
        <PvColumn field="texto" header="Texto" />
        <PvColumn header="Estado">
          <template #body="{ data }">
            <PvTag :value="data.leida ? 'Leída' : 'Pendiente'" :severity="data.leida ? 'success' : 'warning'" rounded />
          </template>
        </PvColumn>
        <PvColumn header="Acciones" body-class="text-right">
          <template #body="{ data }">
            <div class="flex justify-content-end gap-2">
              <PvButton
                icon="pi pi-check"
                severity="success"
                text
                rounded
                :disabled="data.leida"
                @click="marcarLeida(data)"
              />
              <PvButton icon="pi pi-pencil" severity="info" text rounded @click="abrirEdicion(data)" />
              <PvButton icon="pi pi-trash" severity="danger" text rounded @click="confirmarEliminacion(data)" />
            </div>
          </template>
        </PvColumn>
      </PvDataTable>
    </div>

    <PvDialog v-model:visible="mostrarDialogo" header="Editar sugerencia" modal :style="{ width: 'min(520px, 95vw)' }">
      <form class="flex flex-column gap-3" @submit.prevent="guardarEdicion">
        <div class="flex flex-column gap-2">
          <label for="edit-nombre" class="text-sm text-600">Nombre</label>
          <PvInputText id="edit-nombre" v-model="formEdit.nombre" placeholder="Anónimo" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="edit-correo" class="text-sm text-600">Correo</label>
          <PvInputText id="edit-correo" v-model="formEdit.correo" type="email" placeholder="correo@ejemplo.com" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="edit-texto" class="text-sm text-600">Texto</label>
          <PvTextarea id="edit-texto" v-model="formEdit.texto" rows="5" required />
        </div>
        <div class="flex justify-content-end gap-2 mt-2">
          <PvButton label="Cancelar" type="button" severity="secondary" text @click="mostrarDialogo = false" />
          <PvButton label="Guardar" type="submit" :loading="guardando" />
        </div>
      </form>
    </PvDialog>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import {
  useCatalogStore,
  type Sugerencia,
  type SugerenciaPayload,
} from '@/stores/catalog';

const catalogStore = useCatalogStore();
const toast = useToast();
const confirm = useConfirm();

const filters = reactive({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS },
});

const mostrarDialogo = ref(false);
const guardando = ref(false);
const sugerenciaActual = ref<Sugerencia | null>(null);
const formEdit = reactive<SugerenciaPayload>({ nombre: '', correo: '', texto: '' });

function abrirEdicion(sugerencia: Sugerencia) {
  sugerenciaActual.value = sugerencia;
  formEdit.nombre = sugerencia.nombre || '';
  formEdit.correo = sugerencia.correo || '';
  formEdit.texto = sugerencia.texto;
  mostrarDialogo.value = true;
}

async function guardarEdicion() {
  if (!sugerenciaActual.value) return;
  if (!formEdit.texto?.trim()) {
    toast.add({ severity: 'warn', summary: 'El texto es obligatorio', life: 3000 });
    return;
  }
  try {
    guardando.value = true;
    await catalogStore.updateSugerencia(sugerenciaActual.value._id, {
      nombre: formEdit.nombre?.trim(),
      correo: formEdit.correo?.trim(),
      texto: formEdit.texto.trim(),
    });
    toast.add({ severity: 'success', summary: 'Sugerencia actualizada', life: 3000 });
    mostrarDialogo.value = false;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo actualizar la sugerencia',
      life: 4000,
    });
  } finally {
    guardando.value = false;
  }
}

async function marcarLeida(sugerencia: Sugerencia) {
  try {
    await catalogStore.marcarSugerenciaLeida(sugerencia._id);
    toast.add({ severity: 'success', summary: 'Marcada como leída', life: 3000 });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo actualizar la sugerencia',
      life: 4000,
    });
  }
}

function confirmarEliminacion(sugerencia: Sugerencia) {
  confirm.require({
    message: '¿Eliminar esta sugerencia?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await catalogStore.deleteSugerencia(sugerencia._id);
        toast.add({ severity: 'success', summary: 'Sugerencia eliminada', life: 3000 });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error instanceof Error ? error.message : 'No se pudo eliminar la sugerencia',
          life: 4000,
        });
      }
    },
  });
}

onMounted(() => {
  if (!catalogStore.sugerencias.length) catalogStore.fetchSugerencias();
});
</script>

<style scoped>
section {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--app-outline);
}

:deep(.p-datatable) {
  background: transparent;
  border: 1px solid var(--app-outline);
  border-radius: 1rem;
}

:deep(.p-datatable .p-column-header) {
  background: var(--app-surface-alt);
  color: var(--app-text-secondary);
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background: rgba(255, 255, 255, 0.85);
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: rgba(79, 70, 229, 0.08);
}

label {
  font-weight: 600;
}
</style>

