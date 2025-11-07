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
          circular
          :num-visible="3"
          :num-scroll="1"
          :responsive-options="carouselResponsiveOptions"
          :autoplay-interval="5000"
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
                <div class="resource-card__icon">
                  <i :class="tipoIcon(contenido.tipo)" />
                </div>
                <div class="resource-card__header">
                  <PvTag :value="tipoLabel(contenido.tipo)" :severity="tipoSeverity(contenido.tipo)" rounded />
                  <h3>{{ contenido.titulo }}</h3>
                </div>
                <p class="resource-card__description">{{ contenido.descripcion }}</p>
                <div class="resource-card__meta">
                  <span><i class="pi pi-tag" /> {{ contenido.categoria }}</span>
                  <span><i class="pi pi-bookmark" /> {{ contenido.tema }}</span>
                </div>
                <PvButton
                  class="resource-card__action"
                  label="Ver recurso"
                  icon="pi pi-external-link"
                  severity="primary"
                  outlined
                  @click="abrirRecurso(contenido)"
                />
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
                  <PvButton label="Entrar al servidor" icon="pi pi-sign-in" severity="primary" outlined />
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

const showPublicSections = computed(() => !authStore.isAuthenticated);

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

function abrirRecurso(contenido: Contenido) {
  window.open(contenido.enlace, '_blank', 'noopener');
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

onMounted(async () => {
  catalogStore.fetchCategorias();
  catalogStore.fetchContenidos();
  catalogStore.fetchSugerencias();
});

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (!isAuth) {
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
  background: linear-gradient(135deg, var(--app-gradient-start), var(--app-gradient-end));
  color: var(--app-text-primary);
}

.hero h1 {
  color: var(--app-text-primary);
  max-width: 32rem;
}

.hero p {
  color: var(--app-text-secondary);
  max-width: 28rem;
}

.hero :deep(.p-button) {
  border-radius: 999px;
}

.stats-card {
  gap: 1rem;
}

.stats-card .surface-card {
  border: 1px solid var(--app-outline);
  background: rgba(255, 255, 255, 0.8);
}

.empty-state {
  background: rgba(255, 255, 255, 0.65);
  color: var(--app-text-secondary);
  border: 1px solid var(--app-outline);
}

.category-card {
  min-height: 160px;
  background: linear-gradient(180deg, rgba(79, 70, 229, 0.12), rgba(79, 70, 229, 0.05));
  border: 1px solid rgba(79, 70, 229, 0.18);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 30px rgba(79, 70, 229, 0.15);
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
  background: rgba(79, 70, 229, 0.15);
  color: var(--app-primary);
  font-size: 1.2rem;
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
  border: 1px solid var(--app-outline);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
}

.resource-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100%;
}

.resource-card__icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.2rem;
  background: rgba(79, 70, 229, 0.12);
  color: var(--app-primary);
  display: grid;
  place-items: center;
  font-size: 1.4rem;
}

.resource-card__header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.resource-card__header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--app-text-primary);
}

.resource-card__description {
  margin: 0;
  color: var(--app-text-secondary);
  flex: 1;
}

.resource-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  color: var(--app-text-secondary);
}

.resource-card__meta i {
  margin-right: 0.4rem;
}

.resource-card__action {
  align-self: flex-start;
  margin-top: auto;
}

.community-card {
  border: 1px solid var(--app-outline);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
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
  background: rgba(79, 70, 229, 0.15);
  color: var(--app-primary);
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  margin: 0 auto;
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
  border: 1px solid var(--app-outline);
  background: rgba(255, 255, 255, 0.92);
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

