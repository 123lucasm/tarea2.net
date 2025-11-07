<template>
  <div class="dashboard grid">
    <div class="col-12">
      <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5">
        <div class="flex flex-column gap-3">
          <div class="flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 class="text-3xl font-semibold mb-1">Panel de administración</h1>
              <p class="text-600 m-0">Gestiona categorías, recursos y sugerencias desde un solo lugar.</p>
            </div>
            <PvButton label="Ir al sitio público" icon="pi pi-home" outlined @click="router.push('/')" />
          </div>

          <div class="grid">
            <div class="col-12 md:col-4" v-for="stat in statistics" :key="stat.label">
              <PvCard class="stat-card h-full">
                <template #content>
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <div class="text-2xl font-bold">{{ stat.value }}</div>
                      <p class="text-600 m-0">{{ stat.label }}</p>
                    </div>
                    <span :class="['stat-icon pi', stat.icon]" />
                  </div>
                </template>
              </PvCard>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="col-12 lg:col-4">
      <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5 h-full">
        <h2 class="text-xl font-semibold mb-3">Nueva categoría</h2>
        <p class="text-600 mb-4">Organiza tus contenidos creando categorías temáticas.</p>
        <form class="flex flex-column gap-3" @submit.prevent="crearCategoria">
          <div class="flex flex-column gap-2">
            <label for="categoria-nombre" class="text-sm text-600">Nombre</label>
            <PvInputText id="categoria-nombre" v-model="categoriaForm.nombre" required placeholder="Ej: Técnicas de estudio" />
          </div>
          <div class="flex flex-column gap-2">
            <label for="categoria-descripcion" class="text-sm text-600">Descripción</label>
            <PvTextarea
              id="categoria-descripcion"
              v-model="categoriaForm.descripcion"
              rows="4"
              required
              placeholder="Describe brevemente para qué sirve esta categoría"
            />
          </div>
          <PvButton type="submit" label="Crear categoría" icon="pi pi-check" :loading="enviandoCategoria" />
        </form>
      </section>
    </div>

    <div class="col-12 lg:col-8">
      <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5 h-full">
        <h2 class="text-xl font-semibold mb-3">Nuevo recurso</h2>
        <p class="text-600 mb-4">Publica contenidos para los estudiantes seleccionando la categoría adecuada.</p>
        <form class="grid" @submit.prevent="crearContenido">
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label for="contenido-titulo" class="text-sm text-600">Título</label>
            <PvInputText id="contenido-titulo" v-model="contenidoForm.titulo" required placeholder="Ej: Guía de pomodoro" />
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label for="contenido-tema" class="text-sm text-600">Tema</label>
            <PvInputText id="contenido-tema" v-model="contenidoForm.tema" required placeholder="Ej: Gestión del tiempo" />
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label for="contenido-tipo" class="text-sm text-600">Tipo de recurso</label>
            <PvDropdown
              id="contenido-tipo"
              v-model="contenidoForm.tipo"
              :options="tipoOptions"
              option-label="label"
              option-value="value"
              placeholder="Selecciona un tipo"
              required
            />
          </div>
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label for="contenido-categoria" class="text-sm text-600">Categoría</label>
            <PvDropdown
              id="contenido-categoria"
              v-model="contenidoForm.categoria"
              :options="categoriasOptions"
              option-label="nombre"
              option-value="nombre"
              placeholder="Selecciona una categoría"
              :disabled="!categoriasOptions.length"
              required
            />
          </div>
          <div class="col-12 flex flex-column gap-2">
            <label for="contenido-descripcion" class="text-sm text-600">Descripción</label>
            <PvTextarea
              id="contenido-descripcion"
              v-model="contenidoForm.descripcion"
              rows="3"
              required
              placeholder="Describe el recurso para que sea fácil de identificar"
            />
          </div>
          <div class="col-12 flex flex-column gap-2">
            <label for="contenido-enlace" class="text-sm text-600">Enlace o archivo</label>
            <PvInputText
              id="contenido-enlace"
              v-model="contenidoForm.enlace"
              required
              placeholder="URL del recurso o ruta del archivo"
            />
          </div>
          <div class="col-12">
            <PvButton type="submit" label="Publicar recurso" icon="pi pi-upload" :loading="enviandoContenido" />
          </div>
        </form>
      </section>
    </div>

    <div class="col-12">
      <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5">
        <h2 class="text-xl font-semibold mb-4">Gestión rápida</h2>
        <div class="grid">
          <div
            v-for="link in managementLinks"
            :key="link.label"
            class="col-12 md:col-4"
          >
            <PvCard class="quick-card h-full" @click="router.push(link.to)">
              <template #content>
                <div class="flex align-items-center justify-content-between">
                  <div>
                    <span class="text-lg font-semibold">{{ link.label }}</span>
                    <p class="text-600 m-0">{{ link.description }}</p>
                  </div>
                  <span :class="['quick-icon pi', link.icon]" />
                </div>
              </template>
              <template #footer>
                <div class="flex align-items-center justify-content-between">
                  <span class="text-600">Total: {{ link.total }}</span>
                  <PvButton label="Gestionar" icon="pi pi-arrow-right" text />
                </div>
              </template>
            </PvCard>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import {
  useCatalogStore,
  type CategoriaPayload,
  type ContenidoPayload,
} from '@/stores/catalog';

const router = useRouter();
const toast = useToast();
const catalogStore = useCatalogStore();

const categoriaForm = reactive<CategoriaPayload>({ nombre: '', descripcion: '' });
const contenidoForm = reactive<ContenidoPayload>({
  titulo: '',
  tema: '',
  tipo: '' as ContenidoPayload['tipo'],
  categoria: '',
  descripcion: '',
  enlace: '',
});

const enviandoCategoria = ref(false);
const enviandoContenido = ref(false);

const tipoOptions = [
  { label: 'Infografía', value: 'infografia' },
  { label: 'Video', value: 'video' },
];

const categoriasOptions = computed(() => catalogStore.categorias);

const statistics = computed(() => [
  { label: 'Contenidos publicados', value: catalogStore.totalContenidos, icon: 'pi-book' },
  { label: 'Categorías activas', value: catalogStore.totalCategorias, icon: 'pi-sitemap' },
  { label: 'Sugerencias pendientes', value: catalogStore.totalSugerencias, icon: 'pi-comments' },
]);

const managementLinks = computed(() => [
  {
    label: 'Categorías',
    description: 'Edita o elimina categorías existentes',
    to: '/admin/categorias',
    total: catalogStore.totalCategorias,
    icon: 'pi-tags',
  },
  {
    label: 'Contenidos',
    description: 'Revisa y publica nuevos recursos',
    to: '/admin/contenidos',
    total: catalogStore.totalContenidos,
    icon: 'pi-file-edit',
  },
  {
    label: 'Sugerencias',
    description: 'Responde y marca como atendidas',
    to: '/admin/sugerencias',
    total: catalogStore.totalSugerencias,
    icon: 'pi-envelope',
  },
]);

async function crearCategoria() {
  if (!categoriaForm.nombre.trim() || !categoriaForm.descripcion.trim()) {
    toast.add({ severity: 'warn', summary: 'Completa todos los campos', life: 3000 });
    return;
  }
  try {
    enviandoCategoria.value = true;
    await catalogStore.createCategoria({
      nombre: categoriaForm.nombre.trim(),
      descripcion: categoriaForm.descripcion.trim(),
    });
    categoriaForm.nombre = '';
    categoriaForm.descripcion = '';
    toast.add({ severity: 'success', summary: 'Categoría creada', life: 3000 });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo crear la categoría',
      life: 4000,
    });
  } finally {
    enviandoCategoria.value = false;
  }
}

async function crearContenido() {
  const campos = ['titulo', 'tema', 'tipo', 'categoria', 'descripcion', 'enlace'] as const;
  const vacios = campos.some((campo) => !(contenidoForm[campo] as string)?.toString().trim());
  if (vacios) {
    toast.add({ severity: 'warn', summary: 'Completa todos los campos', life: 3000 });
    return;
  }

  try {
    enviandoContenido.value = true;
    await catalogStore.createContenido({
      titulo: contenidoForm.titulo.trim(),
      tema: contenidoForm.tema.trim(),
      tipo: contenidoForm.tipo,
      categoria: contenidoForm.categoria,
      descripcion: contenidoForm.descripcion.trim(),
      enlace: contenidoForm.enlace.trim(),
    });
    contenidoForm.titulo = '';
    contenidoForm.tema = '';
    contenidoForm.tipo = '' as ContenidoPayload['tipo'];
    contenidoForm.categoria = '';
    contenidoForm.descripcion = '';
    contenidoForm.enlace = '';
    toast.add({ severity: 'success', summary: 'Recurso publicado', life: 3000 });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo crear el recurso',
      life: 4000,
    });
  } finally {
    enviandoContenido.value = false;
  }
}

onMounted(() => {
  if (!catalogStore.categorias.length) catalogStore.fetchCategorias();
  if (!catalogStore.contenidos.length) catalogStore.fetchContenidos();
  if (!catalogStore.sugerencias.length) catalogStore.fetchSugerencias();
});
</script>

<style scoped>
.dashboard {
  gap: 1.5rem;
}

.stat-card {
  border: 1px solid var(--app-outline);
  background: rgba(255, 255, 255, 0.9);
}

.stat-icon {
  font-size: 2rem;
  color: var(--app-primary);
}

.quick-card {
  border: 1px solid var(--app-outline);
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 30px rgba(79, 70, 229, 0.16);
}

.quick-icon {
  font-size: 1.8rem;
  color: var(--app-primary);
}

label {
  font-weight: 600;
}
</style>

