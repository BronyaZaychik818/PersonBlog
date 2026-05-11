import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
    children: [
      {
        path: '',
        name: 'BlogList',
        component: () => import('@/views/BlogList.vue'),
      },
      {
        path: 'blog/:id',
        name: 'BlogDetail',
        component: () => import('@/views/BlogDetail.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    meta: { requiresAuth: true },
    component: () => import('@/views/Admin.vue'),
  },
  {
    path: '/admin/blog/new',
    name: 'BlogNew',
    meta: { requiresAuth: true },
    component: () => import('@/views/BlogEdit.vue'),
  },
  {
    path: '/admin/blog/:id/edit',
    name: 'BlogEdit',
    meta: { requiresAuth: true },
    component: () => import('@/views/BlogEdit.vue'),
  },
  {
    path: '/admin/profile',
    name: 'ProfileEdit',
    meta: { requiresAuth: true },
    component: () => import('@/views/ProfileEdit.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      return next('/login')
    }
  }
  next()
})

export default router
