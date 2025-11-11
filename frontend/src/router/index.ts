import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/categorias',
    name: 'admin-categories',
    component: () => import('@/views/admin/AdminCategoriesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/contenidos',
    name: 'admin-contents',
    component: () => import('@/views/admin/AdminContentsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/sugerencias',
    name: 'admin-suggestions',
    component: () => import('@/views/admin/AdminSuggestionsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/usuarios',
    name: 'admin-users',
    component: () => import('@/views/admin/AdminUsersView.vue'),
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }

    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  authStore.hydrate();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  if (to.meta.requiresAdmin && !['admin', 'admin_t'].includes(authStore.user?.rol ?? '')) {
    next({ name: 'home' });
    return;
  }

  if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;

