<template>
  <div class="home-view">
    <!-- Hero -->
    <section id="inicio" class="hero border-round-3xl shadow-2">
      <div class="grid align-items-center">
        <div class="col-12 lg:col-7 flex flex-column gap-3">
          <h1 class="text-4xl lg:text-5xl font-bold line-height-2">Encuentra tu equilibrio académico y personal</h1>
          <p class="text-lg text-600">
            Explora recursos, comunidades y actividades diseñadas para acompañarte durante tu primer año universitario.
          </p>
          <div class="flex flex-wrap gap-2">
            <PvButton
              label="Explorar recursos"
              size="large"
              icon="pi pi-compass"
              severity="primary"
              @click="scrollToSection('contenidos')"
            />
            <PvButton
              v-if="showPublicSections"
              label="Únete a la comunidad"
              size="large"
              icon="pi pi-users"
              severity="secondary"
              outlined
              @click="scrollToSection('comunidad')"
            />
            <PvButton
              v-else
              label="Ir al panel"
              size="large"
              icon="pi pi-chart-bar"
              severity="secondary"
              outlined
              @click="router.push('/admin')"
            />
          </div>
        </div>
        <div class="col-12 lg:col-5">
          <div class="stats-card grid">
            <div class="col-12 md:col-4" v-for="stat in statistics" :key="stat.label">
              <div class="surface-card border-round-xl shadow-1 text-center py-4 px-2">
                <div class="text-3xl font-bold">{{ stat.value }}</div>
                <div class="text-sm text-600">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categorías -->
    <section id="categorias" class="surface-card border-round-3xl shadow-1 p-4 lg:p-5">
      <div class="flex align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="text-3xl font-semibold mb-1">Explora por categorías</h2>
          <p class="text-600 m-0">Descubre temas clave para organizar tu vida universitaria.</p>
        </div>
        <PvButton
          label="Ver todas"
          icon="pi pi-grid"
          severity="secondary"
          outlined
          @click="toggleAllCategories"
        />
      </div>

      <div v-if="categorias.length" class="mb-4">
        <PvCarousel
          :value="categorias"
          :circular="carouselCircular"
          :show-navigators="carouselShowNavigators"
          :show-indicators="carouselShowIndicators"
          :num-visible="3"
          :num-scroll="1"
          :responsive-options="carouselResponsiveOptions"
          :autoplay-interval="carouselAutoplayInterval"
        >
          <template #item="{ data }">
            <div class="p-2">
              <PvCard class="category-card" @click="handleCategoriaClick(data.nombre)">
                <template #content>
                  <div class="category-card__body">
                    <span class="category-card__icon"><i class="pi pi-star-fill" /></span>
                    <div>
                      <h3>{{ data.nombre }}</h3>
                      <p>{{ data.descripcion }}</p>
                    </div>
                  </div>
                </template>
              </PvCard>
            </div>
          </template>
        </PvCarousel>
      </div>

      <div v-else class="empty-state border-round-xl p-4 text-center">
        No hay categorías registradas todavía.
      </div>

      <transition name="fade">
        <div v-if="showAllCategories" class="grid mt-3">
          <div class="col-12 md:col-6 lg:col-4" v-for="cat in categorias" :key="cat._id">
            <PvCard class="category-card" @click="handleCategoriaClick(cat.nombre)">
              <template #content>
                <div class="category-card__body">
                  <span class="category-card__icon"><i class="pi pi-tag" /></span>
                  <div>
                    <h3>{{ cat.nombre }}</h3>
                    <p>{{ cat.descripcion }}</p>
                  </div>
                </div>
              </template>
            </PvCard>
          </div>
        </div>
      </transition>
    </section>

    <!-- Contenidos -->
    <section id="contenidos" class="surface-card border-round-3xl shadow-1 p-4 lg:p-5">
      <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">
        <div>
          <h2 class="text-3xl font-semibold mb-1">Recursos destacados</h2>
          <p class="text-600 m-0">Filtra por tipo, busca por tema o categoría y encuentra lo que necesitas.</p>
        </div>
        <div class="flex gap-2">
          <PvButton
            v-for="option in filterOptions"
            :key="option.value"
            :label="option.label"
            :icon="option.icon"
            :severity="selectedTipo === option.value ? 'primary' : 'secondary'"
            :outlined="selectedTipo !== option.value"
            size="small"
            @click="selectedTipo = option.value"
          />
        </div>
      </div>

      <div class="grid align-items-center mb-4">
        <div class="col-12 lg:col-6">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <PvInputText
              v-model="searchTerm"
              class="w-full"
              placeholder="Buscar por título, tema o categoría"
            />
          </span>
        </div>
        <div class="col-12 lg:col-6" v-if="selectedCategory">
          <div class="flex align-items-center gap-2">
            <PvTag value="Filtro por categoría" severity="info" rounded />
            <PvTag :value="selectedCategory" severity="primary" rounded />
            <PvButton icon="pi pi-times" text rounded aria-label="Limpiar" @click="clearCategoryFilter" />
          </div>
        </div>
      </div>

      <div v-if="filteredContenidos.length" class="grid">
        <div class="col-12 md:col-6 lg:col-4" v-for="contenido in filteredContenidos" :key="contenido._id">
          <PvCard class="content-card h-full">
            <template #content>
              <div class="resource-card">
                <header class="resource-card__header">
                  <div class="resource-card__icon">
                    <i :class="tipoIcon(contenido.tipo)" />
                  </div>
                  <div class="resource-card__title">
                    <h3>{{ contenido.titulo }}</h3>
                    <span>{{ contenido.tema }}</span>
                  </div>
                  <PvTag
                    class="resource-card__tag"
                    :value="tipoLabel(contenido.tipo)"
                    :severity="tipoSeverity(contenido.tipo)"
                    rounded
                  />
                </header>
                <p class="resource-card__description">{{ contenido.descripcion }}</p>
                <footer class="resource-card__footer">
                  <div class="resource-card__meta">
                    <span><i class="pi pi-tag" /> {{ contenido.categoria }}</span>
                  </div>
                  <PvButton
                    class="resource-card__action"
                    label="Ver recurso"
                    icon="pi pi-external-link"
                    severity="primary"
                    outlined
                    @click="abrirRecurso(contenido, $event)"
                  />
                </footer>
              </div>
            </template>
          </PvCard>
        </div>
      </div>
      <div v-else class="empty-state border-round-xl p-4 text-center">
        No se encontraron recursos con los filtros seleccionados.
      </div>
    </section>

    <!-- Comunidad y sugerencias para usuarios públicos -->
    <template v-if="showPublicSections">
      <section id="comunidad" class="surface-card border-round-3xl shadow-1 p-4 lg:p-5">
        <div class="text-center mb-4">
          <h2 class="text-3xl font-semibold">Únete a nuestra comunidad</h2>
          <p class="text-600">Comparte experiencias y recibe apoyo en espacios seguros para estudiantes.</p>
        </div>
        <div class="grid justify-content-center">
          <div class="col-12 md:col-8 lg:col-6">
            <PvCard class="community-card h-full">
              <template #content>
                <div class="community-card__content">
                  <span class="community-card__icon"><i class="pi pi-discord" /></span>
                  <h3>Servidor en Discord</h3>
                  <p>
                    Únete al servidor oficial para acceder a canales temáticos, sesiones de estudio en vivo y mentorías
                    con estudiantes avanzados.
                  </p>
                  <PvButton
                    label="Entrar al servidor"
                    icon="pi pi-sign-in"
                    severity="primary"
                    outlined
                    @click="abrirDiscord"
                  />
                </div>
              </template>
            </PvCard>
          </div>
        </div>
      </section>

      <section id="sugerencias" class="surface-card border-round-3xl shadow-1 p-4 lg:p-5">
        <div class="text-center mb-4">
          <h2 class="text-3xl font-semibold">Envíanos tus sugerencias</h2>
          <p class="text-600">Cuéntanos qué temas te gustaría ver o cómo mejorar la plataforma.</p>
        </div>

        <div class="grid justify-content-center">
          <div class="col-12 md:col-10 lg:col-8">
            <PvCard class="suggestion-card">
              <template #content>
                <form class="flex flex-column gap-3" @submit.prevent="enviarSugerencia">
                  <div class="grid">
                    <div class="col-12 md:col-6 flex flex-column gap-2">
                      <label for="nombre" class="text-sm text-600">Nombre (opcional)</label>
                      <PvInputText id="nombre" v-model="sugerencia.nombre" placeholder="Tu nombre" />
                    </div>
                    <div class="col-12 md:col-6 flex flex-column gap-2">
                      <label for="correo" class="text-sm text-600">Correo electrónico (opcional)</label>
                      <PvInputText id="correo" v-model="sugerencia.correo" type="email" placeholder="tu@correo.com" />
                    </div>
                  </div>
                  <div class="flex flex-column gap-2">
                    <label for="texto" class="text-sm text-600">Sugerencia *</label>
                    <PvTextarea
                      id="texto"
                      v-model="sugerencia.texto"
                      rows="5"
                      required
                      placeholder="Cuéntanos tu idea, sugerencia o tema que te gustaría ver..."
                    />
                  </div>
                  <PvButton
                    label="Enviar sugerencia"
                    type="submit"
                    icon="pi pi-send"
                    :loading="enviandoSugerencia"
                  />
                </form>
              </template>
            </PvCard>
          </div>
        </div>
      </section>
    </template>

    <PvDialog
      v-model:visible="recursoModalVisible"
      modal
      dismissableMask
      :header="recursoSeleccionado ? recursoSeleccionado.titulo : 'Recurso externo'"
      :style="{ width: 'min(90vw, 920px)' }"
      :contentStyle="{ padding: '0' }"
      @hide="cerrarRecurso"
    >
      <div v-if="recursoSeleccionado" class="resource-dialog">
        <div v-if="recursoSeleccionado.descripcion" class="resource-dialog__description">
          {{ recursoSeleccionado.descripcion }}
        </div>
        <div class="resource-dialog__viewer">
          <template v-if="recursoEmbed && recursoEmbed.type === 'iframe'">
            <iframe
              class="resource-dialog__iframe"
              :src="recursoEmbed.src"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
          </template>
          <template v-else-if="recursoEmbed && recursoEmbed.type === 'image'">
            <img :src="recursoEmbed.src" alt="Vista previa del recurso" class="resource-dialog__image" />
          </template>
          <template v-else>
            <div class="resource-dialog__fallback">
              <p>Este recurso se abrirá en una pestaña nueva.</p>
              <PvButton label="Abrir recurso" icon="pi pi-external-link" @click="abrirRecursoEnNuevaPestana" />
            </div>
          </template>
        </div>
        <div class="resource-comments">
          <div class="resource-comments__header">
            <h3>Comentarios</h3>
            <PvButton
              v-if="recursoSeleccionado"
              icon="pi pi-refresh"
              text
              severity="secondary"
              :loading="comentariosCargando"
              @click="catalogStore.fetchComentarios(recursoSeleccionado._id)"
            />
          </div>

          <div v-if="puedeComentar" class="comment-form">
            <PvTextarea
              v-model="comentarioTexto"
              rows="3"
              auto-resize
              placeholder="Comparte tu opinión o una pregunta sobre este recurso..."
              :maxlength="800"
            />
            <div class="comment-form__actions">
              <small class="text-600">{{ comentarioTexto.length }}/800 caracteres</small>
              <PvButton
                label="Publicar comentario"
                icon="pi pi-send"
                size="small"
                :loading="enviandoComentario"
                @click="enviarComentario"
              />
            </div>
            <small v-if="comentarioError" class="comment-form__error">{{ comentarioError }}</small>
          </div>
          <div v-else class="comment-login">
            <p class="m-0">Inicia sesión para dejar un comentario.</p>
          </div>

          <div v-if="comentariosCargando" class="comment-loading">
            <i class="pi pi-spin pi-spinner" />
            <span>Cargando comentarios...</span>
          </div>
          <div v-else-if="comentariosError" class="comment-error text-600">
            No pudimos cargar los comentarios. Intenta nuevamente.
          </div>
          <div v-else-if="comentariosActuales.length" class="comment-list">
            <article v-for="comentario in comentariosActuales" :key="comentario._id" class="comment-item">
              <header class="comment-item__header">
                <div>
                  <strong>{{ comentario.autorNombre }}</strong>
                  <span>{{ formatFechaComentario(comentario.createdAt) }}</span>
                </div>
                <PvButton
                  v-if="authStore.isAdmin"
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  aria-label="Eliminar comentario"
                  @click="eliminarComentario(comentario._id)"
                />
              </header>
              <p class="comment-item__text">{{ comentario.texto }}</p>
            </article>
          </div>
          <div v-else class="comment-empty text-600">
            Aún no hay comentarios. ¡Sé el primero en opinar!
          </div>
        </div>
      </div>
    </PvDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import { useAuthStore } from '@/stores/auth';
import { useCatalogStore, type Contenido } from '@/stores/catalog';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const catalogStore = useCatalogStore();

const showAllCategories = ref(false);
const selectedTipo = ref<'todos' | 'infografia' | 'video'>('todos');
const searchTerm = ref('');
const selectedCategory = ref<string | null>(null);
const enviandoSugerencia = ref(false);
const recursoModalVisible = ref(false);
const recursoSeleccionado = ref<Contenido | null>(null);
const comentarioTexto = ref('');
const enviandoComentario = ref(false);
const comentarioError = ref('');

const sugerencia = ref({ nombre: '', correo: '', texto: '' });

const carouselResponsiveOptions = [
  {
    breakpoint: '1200px',
    numVisible: 3,
    numScroll: 1,
  },
  {
    breakpoint: '992px',
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: '768px',
    numVisible: 1,
    numScroll: 1,
  },
];

const filterOptions = [
  { label: 'Todos', value: 'todos' as const, icon: 'pi pi-grid' },
  { label: 'Infografías', value: 'infografia' as const, icon: 'pi pi-chart-bar' },
  { label: 'Videos', value: 'video' as const, icon: 'pi pi-video' },
];

const categorias = computed(() => catalogStore.categorias);

const statistics = computed(() => [
  { label: 'Contenidos publicados', value: catalogStore.totalContenidos },
  { label: 'Categorías activas', value: catalogStore.totalCategorias },
  { label: 'Sugerencias recibidas', value: catalogStore.totalSugerencias },
]);

const showPublicSections = computed(() => !authStore.isAdmin);

const carouselCircular = computed(() => categorias.value.length > 3);
const carouselShowNavigators = computed(() => categorias.value.length > 3);
const carouselShowIndicators = computed(() => categorias.value.length > 1);
const carouselAutoplayInterval = computed(() => (categorias.value.length > 1 ? 5000 : 0));

const filteredContenidos = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  const tipo = selectedTipo.value;
  const categoriaFiltro = selectedCategory.value?.toLowerCase();

  return catalogStore.contenidos.filter((contenido) => {
    const coincideTipo = tipo === 'todos' || contenido.tipo === tipo;
    const coincideCategoria = !categoriaFiltro || contenido.categoria.toLowerCase() === categoriaFiltro;
    const coincideBusqueda =
      !term ||
      contenido.titulo.toLowerCase().includes(term) ||
      contenido.descripcion.toLowerCase().includes(term) ||
      contenido.tema.toLowerCase().includes(term) ||
      contenido.categoria.toLowerCase().includes(term);

    return coincideTipo && coincideCategoria && coincideBusqueda;
  });
});

type RecursoEmbed =
  | { type: 'iframe'; src: string }
  | { type: 'image'; src: string }
  | { type: 'external'; src: string };

const recursoEmbed = computed<RecursoEmbed | null>(() => {
  if (!recursoSeleccionado.value) return null;
  return obtenerEmbed(recursoSeleccionado.value.enlace);
});

const comentariosActuales = computed(() => {
  if (!recursoSeleccionado.value) return [];
  return catalogStore.getComentariosPorRecurso(recursoSeleccionado.value._id);
});

const comentariosStatus = computed(() => {
  if (!recursoSeleccionado.value) return 'idle';
  return catalogStore.getComentariosStatus(recursoSeleccionado.value._id);
});

const comentariosCargando = computed(() => comentariosStatus.value === 'loading');
const comentariosError = computed(() => comentariosStatus.value === 'error');
const puedeComentar = computed(() => authStore.isAuthenticated);

const tipoLabel = (tipo: Contenido['tipo']) => {
  if (tipo === 'video') return 'Video';
  if (tipo === 'infografia') return 'Infografía';
  return tipo;
};

const tipoSeverity = (tipo: Contenido['tipo']) => {
  if (tipo === 'video') return 'danger';
  if (tipo === 'infografia') return 'info';
  return 'secondary';
};

const tipoIcon = (tipo: Contenido['tipo']) => {
  if (tipo === 'video') return 'pi pi-video';
  if (tipo === 'infografia') return 'pi pi-chart-bar';
  return 'pi pi-folder';
};

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function abrirDiscord() {
  window.open('https://discord.gg/Uq3362QY', '_blank', 'noopener');
}

function toggleAllCategories() {
  showAllCategories.value = !showAllCategories.value;
}

function handleCategoriaClick(nombre: string) {
  selectedCategory.value = nombre;
  searchTerm.value = nombre;
  scrollToSection('contenidos');
}

function clearCategoryFilter() {
  selectedCategory.value = null;
}

function abrirRecurso(contenido: Contenido, event?: MouseEvent) {
  event?.preventDefault();
  event?.stopPropagation();
  recursoSeleccionado.value = contenido;
  recursoModalVisible.value = true;
  comentarioTexto.value = '';
  comentarioError.value = '';
  comentariosStatus.value === 'idle' && catalogStore.fetchComentarios(contenido._id);
}

function cerrarRecurso() {
  recursoModalVisible.value = false;
  recursoSeleccionado.value = null;
  comentarioTexto.value = '';
  comentarioError.value = '';
}

function abrirRecursoEnNuevaPestana() {
  if (!recursoSeleccionado.value) return;
  window.open(recursoSeleccionado.value.enlace, '_blank', 'noopener');
}

function obtenerEmbed(enlace: string): RecursoEmbed {
  try {
    const url = new URL(enlace);
    const hostname = url.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      const videoId = url.pathname.split('/')[1];
      if (videoId) {
        return {
          type: 'iframe',
          src: `https://www.youtube.com/embed/${videoId}`,
        };
      }
    }

    if (hostname.endsWith('youtube.com')) {
      const videoId = url.searchParams.get('v') || extraerYoutubeIdDesdePath(url.pathname);
      if (videoId) {
        const params = new URLSearchParams();
        if (url.searchParams.get('t')) {
          params.set('start', convertirTiempoSegundos(url.searchParams.get('t')!));
        }
        const search = params.toString();
        return {
          type: 'iframe',
          src: `https://www.youtube.com/embed/${videoId}${search ? `?${search}` : ''}`,
        };
      }
    }

    if (hostname.endsWith('drive.google.com')) {
      const fileId = extraerGoogleDriveId(url.pathname, url.searchParams);
      if (fileId) {
        return { type: 'iframe', src: `https://drive.google.com/file/d/${fileId}/preview` };
      }
    }

    if (esImagen(url.pathname)) {
      return { type: 'image', src: enlace };
    }

    return { type: 'external', src: enlace };
  } catch (error) {
    return { type: 'external', src: enlace };
  }
}

function extraerYoutubeIdDesdePath(pathname: string) {
  if (pathname.startsWith('/embed/')) {
    return pathname.split('/')[2];
  }
  if (pathname.startsWith('/shorts/')) {
    return pathname.split('/')[2];
  }
  return null;
}

function convertirTiempoSegundos(valor: string) {
  const segundosRegex = /^(\d+)$/;
  const formatoRegex = /^(\d+h)?(\d+m)?(\d+s)?$/;

  if (segundosRegex.test(valor)) {
    return valor;
  }

  const coincidencia = formatoRegex.exec(valor);
  if (!coincidencia) {
    return '0';
  }

  const horas = coincidencia[1] ? parseInt(coincidencia[1].replace('h', ''), 10) : 0;
  const minutos = coincidencia[2] ? parseInt(coincidencia[2].replace('m', ''), 10) : 0;
  const segundos = coincidencia[3] ? parseInt(coincidencia[3].replace('s', ''), 10) : 0;

  return String(horas * 3600 + minutos * 60 + segundos);
}

function extraerGoogleDriveId(pathname: string, searchParams: URLSearchParams) {
  const match = pathname.match(/\/d\/([^/]+)/);
  if (match?.[1]) {
    return match[1];
  }

  const id = searchParams.get('id');
  if (id) {
    return id;
  }

  return null;
}

function esImagen(pathname: string) {
  return /(\.png|\.jpe?g|\.gif|\.webp|\.svg)$/i.test(pathname);
}

function formatFechaComentario(fecha: string) {
  return new Date(fecha).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function enviarSugerencia() {
  if (!sugerencia.value.texto.trim()) {
    toast.add({ severity: 'warn', summary: 'Completa la sugerencia', life: 3000 });
    return;
  }

  try {
    enviandoSugerencia.value = true;
    const response = await fetch('/api/sugerencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: sugerencia.value.nombre,
        correo: sugerencia.value.correo,
        texto: sugerencia.value.texto,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo enviar la sugerencia');
    }
    sugerencia.value = { nombre: '', correo: '', texto: '' };
    toast.add({ severity: 'success', summary: '¡Gracias!', detail: 'Tu sugerencia fue enviada', life: 4000 });
    await catalogStore.fetchSugerencias();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      life: 4000,
    });
  } finally {
    enviandoSugerencia.value = false;
  }
}

async function enviarComentario() {
  if (!recursoSeleccionado.value) return;
  if (!authStore.isAuthenticated || !authStore.user?._id) {
    toast.add({ severity: 'warn', summary: 'Inicia sesión para comentar', life: 3000 });
    return;
  }
  const texto = comentarioTexto.value.trim();
  if (texto.length < 3) {
    comentarioError.value = 'El comentario debe tener al menos 3 caracteres.';
    return;
  }
  if (texto.length > 800) {
    comentarioError.value = 'El comentario no puede exceder 800 caracteres.';
    return;
  }

  try {
    comentarioError.value = '';
    enviandoComentario.value = true;
    await catalogStore.crearComentario(recursoSeleccionado.value._id, {
      autorId: authStore.user._id,
      texto,
    });
    comentarioTexto.value = '';
    toast.add({ severity: 'success', summary: 'Comentario publicado', life: 3000 });
  } catch (error) {
    comentarioError.value =
      error instanceof Error ? error.message : 'No se pudo publicar el comentario';
  } finally {
    enviandoComentario.value = false;
  }
}

async function eliminarComentario(comentarioId: string) {
  if (!authStore.isAdmin || !recursoSeleccionado.value) return;
  try {
    await catalogStore.eliminarComentario(comentarioId, recursoSeleccionado.value._id);
    toast.add({ severity: 'success', summary: 'Comentario eliminado', life: 3000 });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo eliminar el comentario',
      life: 4000,
    });
  }
}

onMounted(async () => {
  catalogStore.fetchCategorias();
  catalogStore.fetchContenidos();
  catalogStore.fetchSugerencias();
});

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (!isAuth || !authStore.isAdmin) {
      selectedCategory.value = null;
    }
  }
);
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 5vw, 3rem);
}

.hero {
  padding: clamp(2.5rem, 7vw, 4.5rem);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(124, 58, 237, 0.26)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.28), transparent 50%);
  color: var(--app-text-primary);
  border: 1px solid rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.hero h1 {
  color: var(--app-text-primary);
  max-width: 32rem;
}

.hero p {
  color: rgba(17, 24, 39, 0.68);
  max-width: 28rem;
}

.hero :deep(.p-button) {
  border-radius: 999px;
}

.stats-card {
  gap: 1rem;
}

section.surface-card {
  background: linear-gradient(160deg, rgba(248, 250, 255, 0.95), rgba(224, 242, 254, 0.72));
  border: 1px solid rgba(99, 102, 241, 0.26);
  box-shadow: 0 22px 50px rgba(99, 102, 241, 0.15);
}

.stats-card .surface-card {
  border: 1px solid rgba(99, 102, 241, 0.28);
  background: rgba(248, 250, 255, 0.92);
  box-shadow: 0 24px 52px rgba(99, 102, 241, 0.12);
}

.empty-state {
  background: rgba(248, 250, 255, 0.88);
  color: var(--app-text-secondary);
  border: 1px solid var(--app-outline);
}

.category-card {
  min-height: 160px;
  background: linear-gradient(160deg, rgba(99, 102, 241, 0.18), rgba(165, 180, 252, 0.14));
  border: 1px solid rgba(99, 102, 241, 0.32);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 52px rgba(124, 58, 237, 0.2);
}

.category-card__body {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.category-card__icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 1.2rem;
  box-shadow: 0 16px 32px rgba(99, 102, 241, 0.24);
}

.category-card__body h3 {
  margin: 0 0 0.3rem;
  font-size: 1.1rem;
  color: var(--app-text-primary);
}

.category-card__body p {
  margin: 0;
  color: var(--app-text-secondary);
}

.content-card {
  border: 1px solid rgba(99, 102, 241, 0.3);
  background: linear-gradient(150deg, rgba(248, 250, 255, 0.96), rgba(224, 242, 254, 0.7));
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease;
  height: 100%;
}

.content-card:hover {
  border-color: rgba(124, 58, 237, 0.45);
  box-shadow: 0 28px 56px rgba(124, 58, 237, 0.22);
  transform: translateY(-4px);
  background: linear-gradient(150deg, rgba(237, 233, 254, 0.98), rgba(224, 242, 254, 0.88));
}

.content-card :deep(.p-card-body) {
  height: 100%;
  display: flex;
  padding: 1.5rem;
}

.resource-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  width: 100%;
}

.resource-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.resource-card__icon {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 1.35rem;
  box-shadow: 0 18px 34px rgba(99, 102, 241, 0.24);
}

.resource-card__title {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.resource-card__title h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--app-text-primary);
  line-height: 1.4;
}

.resource-card__title span {
  color: rgba(56, 189, 248, 0.96);
  font-size: 0.95rem;
  font-weight: 500;
}

.resource-card__tag {
  font-weight: 600;
  background: rgba(124, 58, 237, 0.18);
  color: rgba(63, 81, 181, 0.96);
  border: none;
}

.resource-card__description {
  margin: 0;
  color: rgba(76, 81, 191, 0.7);
  line-height: 1.7;
  flex: 1;
}

.resource-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  margin-top: auto;
}

.resource-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  color: rgba(79, 70, 229, 0.65);
  font-size: 0.95rem;
}

.resource-card__meta i {
  margin-right: 0.4rem;
}

.resource-card__action {
  margin-left: auto;
}

.resource-card__action :deep(.p-button) {
  border-color: rgba(99, 102, 241, 0.5);
  color: rgba(76, 81, 191, 0.96);
  font-weight: 600;
  transition: all 0.25s ease;
}

.resource-card__action :deep(.p-button:hover) {
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 14px 26px rgba(124, 58, 237, 0.28);
}

.resource-card:hover .resource-card__icon {
  box-shadow: 0 22px 44px rgba(124, 58, 237, 0.32);
}

@media (max-width: 719px) {
  .resource-card__footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .resource-card__action {
    margin-left: 0;
    width: 100%;
  }
}

.community-card {
  border: 1px solid rgba(99, 102, 241, 0.32);
  background: linear-gradient(160deg, rgba(248, 250, 255, 0.94), rgba(224, 242, 254, 0.68));
  box-shadow: 0 20px 46px rgba(99, 102, 241, 0.16);
}

.community-card__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.community-card__icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.5rem;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  margin: 0 auto;
  box-shadow: 0 18px 36px rgba(124, 58, 237, 0.28);
}

.community-card__content h3 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--app-text-primary);
}

.community-card__content p {
  margin: 0;
  color: var(--app-text-secondary);
}

.suggestion-card {
  border: 1px solid rgba(99, 102, 241, 0.32);
  background: linear-gradient(160deg, rgba(248, 250, 255, 0.95), rgba(224, 242, 254, 0.74));
  box-shadow: 0 20px 46px rgba(99, 102, 241, 0.17);
}

.resource-dialog {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.resource-dialog__description {
  margin: 0;
  color: rgba(79, 70, 229, 0.74);
}


.resource-dialog__viewer {
  width: 100%;
  background: rgba(248, 250, 255, 0.92);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.resource-dialog__iframe {
  width: 100%;
  min-height: clamp(260px, 60vh, 540px);
  border: 0;
}

.resource-dialog__image {
  display: block;
  width: 100%;
  height: auto;
}

.resource-dialog__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.resource-comments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-comments__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.resource-comments__header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--app-text-primary);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgba(248, 250, 255, 0.9);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1rem;
  padding: 1rem;
}

.comment-form__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-form__error {
  color: var(--p-red-500);
}

.comment-login {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed rgba(99, 102, 241, 0.35);
  background: rgba(248, 250, 255, 0.7);
}

.comment-loading,
.comment-error,
.comment-empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(248, 250, 255, 0.75);
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-item {
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.comment-item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.comment-item__header strong {
  display: block;
  color: var(--app-text-primary);
}

.comment-item__header span {
  display: block;
  font-size: 0.85rem;
  color: var(--app-text-secondary);
}

.comment-item__text {
  margin: 0;
  color: var(--app-text-primary);
  line-height: 1.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

label {
  font-weight: 600;
}

@media (max-width: 768px) {
  .hero {
    text-align: center;
  }

  .hero h1,
  .hero p {
    margin-inline: auto;
  }

  .hero :deep(.p-button) {
    width: 100%;
  }
}
</style>

