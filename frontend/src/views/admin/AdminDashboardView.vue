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
            <PvButton label="Ir al Inicio" icon="pi pi-home" outlined @click="router.push('/')" />
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

    <div class="col-12">
      <div class="form-panels">
        <section class="form-panel surface-card border-round-2xl shadow-2 p-4 lg:p-5">
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

        <section class="form-panel surface-card border-round-2xl shadow-2 p-4 lg:p-5">
        <h2 class="text-xl font-semibold mb-3">Nuevo recurso</h2>
        <p class="text-600 mb-4">Publica contenidos para los estudiantes seleccionando la categoría adecuada.</p>
        <form class="grid" @submit.prevent="crearContenido">
          <div class="col-12 md:col-6 flex flex-column gap-2">
            <label for="contenido-titulo" class="text-sm text-600">Título</label>
            <PvInputText id="contenido-titulo" v-model="contenidoForm.titulo" required placeholder="Ej: ¿Cómo organizar tu tiempo?" />
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
          <div v-if="esInfografia" class="col-12 flex flex-column gap-2">
            <label class="text-sm text-600">Origen de la infografía</label>
            <PvSelectButton
              v-model="modoInfografia"
              :options="modoInfografiaOptions"
              option-label="label"
              option-value="value"
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
          <div v-if="!esInfografia || modoInfografia === 'url'" class="col-12 flex flex-column gap-2">
            <label for="contenido-enlace" class="text-sm text-600">Enlace</label>
            <PvInputText
              id="contenido-enlace"
              v-model="contenidoForm.enlace"
              :required="!esInfografia || modoInfografia === 'url'"
              placeholder="https://..."
            />
          </div>
          <div v-else class="col-12 flex flex-column gap-2">
            <label class="text-sm text-600" for="contenido-archivo">Archivo de infografía</label>
            <input
              id="contenido-archivo"
              ref="inputArchivoInfografia"
              type="file"
              accept="image/*"
              @change="onArchivoInfografiaSeleccionado"
            />
            <small class="text-600">Formatos de imagen hasta 10MB. Se almacenará la URL segura de Cloudinary.</small>
            <div v-if="archivoInfografia" class="text-600">
              Archivo seleccionado: <span class="font-semibold">{{ archivoInfografia?.name }}</span>
            </div>
            <div v-if="modoInfografia === 'upload' && contenidoForm.enlace" class="cloudinary-url">
              URL generada: <a :href="contenidoForm.enlace" target="_blank" rel="noopener">{{ contenidoForm.enlace }}</a>
            </div>
            <div class="flex gap-2">
              <PvButton
                type="button"
                label="Limpiar archivo"
                severity="secondary"
                text
                @click="limpiarArchivoInfografia"
              />
            </div>
            <div v-if="subiendoInfografia" class="text-600 flex align-items-center gap-2">
              <i class="pi pi-spin pi-spinner" /> Subiendo infografía...
            </div>
          </div>
          <div class="col-12">
            <PvButton type="submit" label="Publicar recurso" icon="pi pi-upload" :loading="enviandoContenido" />
          </div>
        </form>
        </section>
      </div>
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

    <div v-if="esSuperAdmin" class="col-12">
      <section class="surface-card border-round-2xl shadow-2 p-4 lg:p-5">
        <div class="flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h2 class="text-xl font-semibold mb-1">Solicitudes de administrador</h2>
            <p class="text-600 m-0">Aprueba a los usuarios que solicitaron acceso al panel.</p>
          </div>
          <PvButton
            label="Actualizar"
            icon="pi pi-refresh"
            severity="secondary"
            text
            :loading="solicitudesCargando"
            @click="fetchSolicitudesAdmin"
          />
        </div>

        <div v-if="solicitudesCargando" class="flex align-items-center gap-2 text-600">
          <i class="pi pi-spin pi-spinner" /> Cargando solicitudes...
        </div>

        <div v-else-if="solicitudesAdmin.length" class="grid">
          <div class="col-12 lg:col-6" v-for="usuario in solicitudesAdmin" :key="usuario._id">
            <PvCard class="approval-card h-full">
              <template #content>
                <div class="flex flex-column gap-2">
                  <div class="flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 class="m-0 text-lg font-semibold">{{ usuario.nombre }}</h3>
                      <p class="m-0 text-600">{{ usuario.correo }}</p>
                    </div>
                    <PvTag value="Solicitud de admin" severity="warning" rounded />
                  </div>
                  <p class="m-0 text-600">Registrado el {{ formatFecha(usuario.createdAt) }}</p>
                </div>
              </template>
              <template #footer>
                <div class="flex justify-content-end gap-2">
                  <PvButton
                    label="Eliminar solicitud"
                    icon="pi pi-times"
                    severity="danger"
                    text
                    :loading="cancelandoSolicitud === usuario._id"
                    @click="cancelarSolicitudAdmin(usuario._id)"
                  />
                  <PvButton
                    label="Aprobar"
                    icon="pi pi-check"
                    :loading="aprobandoSolicitud === usuario._id"
                    @click="aprobarSolicitudAdmin(usuario._id)"
                  />
                </div>
              </template>
            </PvCard>
          </div>
        </div>

        <div v-else class="empty-state border-round-xl p-3 text-center">
          No hay solicitudes de administrador pendientes.
        </div>
      </section>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import { useCatalogStore, type CategoriaPayload, type ContenidoPayload } from '@/stores/catalog';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const toast = useToast();
const catalogStore = useCatalogStore();
const authStore = useAuthStore();

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
const modoInfografia = ref<'url' | 'upload'>('url');
const modoInfografiaOptions = [
  { label: 'URL externa', value: 'url' },
  { label: 'Subir archivo', value: 'upload' },
];
const archivoInfografia = ref<File | null>(null);
const subiendoInfografia = ref(false);
const inputArchivoInfografia = ref<HTMLInputElement | null>(null);
const aprobandoSolicitud = ref<string | null>(null);
const cancelandoSolicitud = ref<string | null>(null);

const tipoOptions = [
  { label: 'Infografía', value: 'infografia' },
  { label: 'Video', value: 'video' },
  { label: 'Herramienta', value: 'herramienta' },
];

const categoriasOptions = computed(() => catalogStore.categorias);
const esInfografia = computed(() => contenidoForm.tipo === 'infografia');
const esSuperAdmin = computed(() => authStore.isSuperAdmin);
const solicitudesAdmin = computed(() => (esSuperAdmin.value ? catalogStore.solicitudesAdmin : []));
const solicitudesStatus = computed(() => catalogStore.solicitudesAdminStatus);
const solicitudesCargando = computed(() => esSuperAdmin.value && solicitudesStatus.value === 'loading');

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

watch(
  () => contenidoForm.tipo,
  (tipo) => {
    if (tipo !== 'infografia') {
      modoInfografia.value = 'url';
      limpiarArchivoInfografia();
    } else {
      modoInfografia.value = 'url';
      contenidoForm.enlace = '';
    }
  }
);

watch(modoInfografia, (modo) => {
  if (modo === 'url') {
    limpiarArchivoInfografia();
  } else {
    contenidoForm.enlace = '';
  }
});

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
  const camposBase = ['titulo', 'tema', 'tipo', 'categoria', 'descripcion'] as const;
  const vaciosBase = camposBase.some((campo) => !(contenidoForm[campo] as string)?.toString().trim());
  if (vaciosBase) {
    toast.add({ severity: 'warn', summary: 'Completa todos los campos obligatorios', life: 3000 });
    return;
  }

  if (!esInfografia.value || modoInfografia.value === 'url') {
    if (!contenidoForm.enlace.trim()) {
      toast.add({ severity: 'warn', summary: 'Ingresa el enlace del recurso', life: 3000 });
      return;
    }
  }

  try {
    enviandoContenido.value = true;
    let enlaceFinal = contenidoForm.enlace.trim();

    if (esInfografia.value && modoInfografia.value === 'upload') {
      if (!archivoInfografia.value) {
        toast.add({ severity: 'warn', summary: 'Selecciona un archivo de infografía', life: 3000 });
        return;
      }

      enlaceFinal = await subirInfografiaArchivo(archivoInfografia.value);
      contenidoForm.enlace = enlaceFinal;
    }

    await catalogStore.createContenido({
      titulo: contenidoForm.titulo.trim(),
      tema: contenidoForm.tema.trim(),
      tipo: contenidoForm.tipo,
      categoria: contenidoForm.categoria,
      descripcion: contenidoForm.descripcion.trim(),
      enlace: enlaceFinal,
    });
    contenidoForm.titulo = '';
    contenidoForm.tema = '';
    contenidoForm.tipo = '' as ContenidoPayload['tipo'];
    contenidoForm.categoria = '';
    contenidoForm.descripcion = '';
    contenidoForm.enlace = '';
    modoInfografia.value = 'url';
    limpiarArchivoInfografia();
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

function onArchivoInfografiaSeleccionado(event: Event) {
  const input = event.target as HTMLInputElement;
  const [file] = input.files || [];
  if (!file) {
    archivoInfografia.value = null;
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.add({ severity: 'warn', summary: 'El archivo excede 10MB', life: 3000 });
    input.value = '';
    return;
  }
  archivoInfografia.value = file;
}

function limpiarArchivoInfografia() {
  archivoInfografia.value = null;
  if (inputArchivoInfografia.value) {
    inputArchivoInfografia.value.value = '';
  }
  if (modoInfografia.value === 'upload') {
    contenidoForm.enlace = '';
  }
}

async function subirInfografiaArchivo(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  subiendoInfografia.value = true;
  try {
    const response = await fetch('/api/uploads/infografia', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo subir la infografía');
    }
    return data.url as string;
  } finally {
    subiendoInfografia.value = false;
  }
}

async function fetchSolicitudesAdmin() {
  if (!esSuperAdmin.value) return;
  await catalogStore.fetchSolicitudesAdmin(true);
}

async function cancelarSolicitudAdmin(id: string) {
  if (!esSuperAdmin.value) return;
  if (cancelandoSolicitud.value) return;
  cancelandoSolicitud.value = id;
  try {
    await catalogStore.cancelarSolicitudAdmin(id);
    toast.add({ severity: 'success', summary: 'Solicitud eliminada', life: 3000 });
  } catch (error) {
    console.error(error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo eliminar la solicitud',
      life: 4000,
    });
  } finally {
    cancelandoSolicitud.value = null;
  }
}

async function aprobarSolicitudAdmin(id: string) {
  if (!esSuperAdmin.value) return;
  if (aprobandoSolicitud.value) return;
  aprobandoSolicitud.value = id;
  try {
    const response = await fetch(`/api/usuarios/${id}/aprobar-admin`, { method: 'PUT' });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo aprobar la solicitud');
    }
    await catalogStore.fetchSolicitudesAdmin(true);
    toast.add({ severity: 'success', summary: 'Administrador aprobado', life: 3000 });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo aprobar la solicitud',
      life: 4000,
    });
  } finally {
    aprobandoSolicitud.value = null;
  }
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

onMounted(() => {
  if (!catalogStore.categorias.length) catalogStore.fetchCategorias();
  if (!catalogStore.contenidos.length) catalogStore.fetchContenidos();
  if (!catalogStore.sugerencias.length) catalogStore.fetchSugerencias();
  if (esSuperAdmin.value) {
    catalogStore.fetchSolicitudesAdmin();
  }
});

watch(esSuperAdmin, (value) => {
  if (value) {
    catalogStore.fetchSolicitudesAdmin(true);
  }
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

.form-panels {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 992px) {
  .form-panels {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
    align-items: stretch;
  }
}

.form-panel {
  height: 100%;
}

.approval-card {
  border: 1px solid var(--app-outline);
  background: rgba(255, 255, 255, 0.92);
}

label {
  font-weight: 600;
}

.cloudinary-url {
  font-size: 0.85rem;
  color: var(--app-primary);
  word-break: break-all;
}
</style>

