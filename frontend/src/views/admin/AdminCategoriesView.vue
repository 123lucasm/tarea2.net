<template>
  <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5">
    <div class="flex flex-column gap-4">
      <header class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
        <div>
          <h1 class="text-3xl font-semibold mb-1">Gestión de categorías</h1>
          <p class="text-600 m-0">Edita, elimina y busca categorías del catálogo.</p>
        </div>
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <PvInputText v-model="filters.global.value" placeholder="Buscar..." />
        </span>
      </header>

      <PvDataTable
        :value="catalogStore.categorias"
        :loading="catalogStore.categoriasStatus === 'loading'"
        data-key="_id"
        :filters="filters"
        filter-display="menu"
        :global-filter-fields="['nombre', 'descripcion']"
        paginator
        :rows="10"
        responsive-layout="stack"
        breakpoint="960px"
        empty-message="No se encontraron categorías"
      >
        <PvColumn field="nombre" header="Nombre" sortable />
        <PvColumn field="descripcion" header="Descripción" />
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

    <PvDialog v-model:visible="mostrarDialogo" header="Editar categoría" modal :style="{ width: 'min(420px, 90vw)' }">
      <form class="flex flex-column gap-3" @submit.prevent="guardarEdicion">
        <div class="flex flex-column gap-2">
          <label for="edit-nombre" class="text-sm text-600">Nombre</label>
          <PvInputText id="edit-nombre" v-model="formEdit.nombre" required />
        </div>
        <div class="flex flex-column gap-2">
          <label for="edit-descripcion" class="text-sm text-600">Descripción</label>
          <PvTextarea id="edit-descripcion" v-model="formEdit.descripcion" required rows="4" />
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

import { useCatalogStore, type Categoria } from '@/stores/catalog';

const catalogStore = useCatalogStore();
const toast = useToast();
const confirm = useConfirm();

const filters = reactive({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS },
});

const mostrarDialogo = ref(false);
const guardando = ref(false);
const categoriaActual = ref<Categoria | null>(null);
const formEdit = reactive({ nombre: '', descripcion: '' });

function abrirEdicion(categoria: Categoria) {
  categoriaActual.value = categoria;
  formEdit.nombre = categoria.nombre;
  formEdit.descripcion = categoria.descripcion;
  mostrarDialogo.value = true;
}

async function guardarEdicion() {
  if (!categoriaActual.value) return;
  try {
    guardando.value = true;
    await catalogStore.updateCategoria(categoriaActual.value._id, {
      nombre: formEdit.nombre.trim(),
      descripcion: formEdit.descripcion.trim(),
    });
    toast.add({ severity: 'success', summary: 'Categoría actualizada', life: 3000 });
    mostrarDialogo.value = false;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo actualizar la categoría',
      life: 4000,
    });
  } finally {
    guardando.value = false;
  }
}

function confirmarEliminacion(categoria: Categoria) {
  confirm.require({
    message: `¿Eliminar la categoría "${categoria.nombre}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await catalogStore.deleteCategoria(categoria._id);
        toast.add({ severity: 'success', summary: 'Categoría eliminada', life: 3000 });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error instanceof Error ? error.message : 'No se pudo eliminar la categoría',
          life: 4000,
        });
      }
    },
  });
}

onMounted(() => {
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

