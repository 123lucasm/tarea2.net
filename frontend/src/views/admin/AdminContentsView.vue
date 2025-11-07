<template>
  <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5">
    <div class="flex flex-column gap-4">
      <header class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
        <div>
          <h1 class="text-3xl font-semibold mb-1">Gestión de recursos</h1>
          <p class="text-600 m-0">Actualiza o elimina recursos publicados.</p>
        </div>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <PvInputText v-model="filters.global.value" placeholder="Buscar..." />
        </span>
      </header>

      <PvDataTable
        :value="catalogStore.contenidos"
        :loading="catalogStore.contenidosStatus === 'loading'"
        data-key="_id"
        :filters="filters"
        filter-display="menu"
        :global-filter-fields="['titulo', 'tema', 'tipo', 'categoria']"
        paginator
        :rows="10"
        responsive-layout="stack"
        breakpoint="960px"
        empty-message="No se encontraron contenidos"
      >
        <PvColumn field="titulo" header="Título" sortable />
        <PvColumn field="tema" header="Tema" sortable />
        <PvColumn header="Tipo">
          <template #body="{ data }">
            <PvTag :value="tipoLabel(data.tipo)" :severity="tipoSeverity(data.tipo)" rounded />
          </template>
        </PvColumn>
        <PvColumn field="categoria" header="Categoría" sortable />
        <PvColumn header="Acciones" body-class="text-right">
          <template #body="{ data }">
            <div class="flex justify-content-end gap-2">
              <PvButton icon="pi pi-pencil" severity="info" text rounded @click="abrirEdicion(data)" />
              <PvButton icon="pi pi-trash" severity="danger" text rounded @click="confirmarEliminacion(data)" />
            </div>
          </template>
        </PvColumn>
      </PvDataTable>
    </div>

    <PvDialog v-model:visible="mostrarDialogo" header="Editar recurso" modal :style="{ width: 'min(520px, 95vw)' }">
      <form class="grid" @submit.prevent="guardarEdicion">
        <div class="col-12 flex flex-column gap-2">
          <label for="edit-titulo" class="text-sm text-600">Título</label>
          <PvInputText id="edit-titulo" v-model="formEdit.titulo" required />
        </div>
        <div class="col-12 md:col-6 flex flex-column gap-2">
          <label for="edit-tema" class="text-sm text-600">Tema</label>
          <PvInputText id="edit-tema" v-model="formEdit.tema" required />
        </div>
        <div class="col-12 md:col-6 flex flex-column gap-2">
          <label for="edit-tipo" class="text-sm text-600">Tipo</label>
          <PvDropdown
            id="edit-tipo"
            v-model="formEdit.tipo"
            :options="tipoOptions"
            option-label="label"
            option-value="value"
            required
          />
        </div>
        <div class="col-12 md:col-6 flex flex-column gap-2">
          <label for="edit-categoria" class="text-sm text-600">Categoría</label>
          <PvDropdown
            id="edit-categoria"
            v-model="formEdit.categoria"
            :options="categoriasOptions"
            option-label="nombre"
            option-value="nombre"
            :disabled="!categoriasOptions.length"
            required
          />
        </div>
        <div class="col-12 flex flex-column gap-2">
          <label for="edit-descripcion" class="text-sm text-600">Descripción</label>
          <PvTextarea id="edit-descripcion" v-model="formEdit.descripcion" rows="4" required />
        </div>
        <div class="col-12 flex flex-column gap-2">
          <label for="edit-enlace" class="text-sm text-600">Enlace</label>
          <PvInputText id="edit-enlace" v-model="formEdit.enlace" required />
        </div>
        <div class="col-12 flex justify-content-end gap-2 mt-2">
          <PvButton label="Cancelar" type="button" severity="secondary" text @click="mostrarDialogo = false" />
          <PvButton label="Guardar" type="submit" :loading="guardando" />
        </div>
      </form>
    </PvDialog>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import {
  useCatalogStore,
  type Contenido,
  type ContenidoPayload,
} from '@/stores/catalog';

const catalogStore = useCatalogStore();
const toast = useToast();
const confirm = useConfirm();

const filters = reactive({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS },
});

const mostrarDialogo = ref(false);
const guardando = ref(false);
const contenidoActual = ref<Contenido | null>(null);
const formEdit = reactive<ContenidoPayload>({
  titulo: '',
  tema: '',
  tipo: 'infografia',
  categoria: '',
  descripcion: '',
  enlace: '',
});

const tipoOptions = [
  { label: 'Infografía', value: 'infografia' },
  { label: 'Video', value: 'video' },
];

const categoriasOptions = computed(() => catalogStore.categorias);

function tipoLabel(tipo: Contenido['tipo']) {
  return tipo === 'video' ? 'Video' : tipo === 'infografia' ? 'Infografía' : tipo;
}

function tipoSeverity(tipo: Contenido['tipo']) {
  return tipo === 'video' ? 'danger' : tipo === 'infografia' ? 'info' : 'secondary';
}

function abrirEdicion(contenido: Contenido) {
  contenidoActual.value = contenido;
  formEdit.titulo = contenido.titulo;
  formEdit.tema = contenido.tema;
  formEdit.tipo = contenido.tipo;
  formEdit.categoria = contenido.categoria;
  formEdit.descripcion = contenido.descripcion;
  formEdit.enlace = contenido.enlace;
  mostrarDialogo.value = true;
}

async function guardarEdicion() {
  if (!contenidoActual.value) return;
  try {
    guardando.value = true;
    await catalogStore.updateContenido(contenidoActual.value._id, {
      titulo: formEdit.titulo.trim(),
      tema: formEdit.tema.trim(),
      tipo: formEdit.tipo,
      categoria: formEdit.categoria,
      descripcion: formEdit.descripcion.trim(),
      enlace: formEdit.enlace.trim(),
    });
    toast.add({ severity: 'success', summary: 'Recurso actualizado', life: 3000 });
    mostrarDialogo.value = false;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo actualizar el recurso',
      life: 4000,
    });
  } finally {
    guardando.value = false;
  }
}

function confirmarEliminacion(contenido: Contenido) {
  confirm.require({
    message: `¿Eliminar el recurso "${contenido.titulo}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await catalogStore.deleteContenido(contenido._id);
        toast.add({ severity: 'success', summary: 'Recurso eliminado', life: 3000 });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error instanceof Error ? error.message : 'No se pudo eliminar el recurso',
          life: 4000,
        });
      }
    },
  });
}

onMounted(() => {
  if (!catalogStore.contenidos.length) catalogStore.fetchContenidos();
  if (!catalogStore.categorias.length) catalogStore.fetchCategorias();
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

