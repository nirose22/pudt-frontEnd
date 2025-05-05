import { createRouter, createWebHistory } from 'vue-router';


const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/userManagement/UserProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorite',
    name: 'Favorite',
    component: () => import('@/views/user/userManagement/UserProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-card',
    name: 'MyCard',
    component: () => import('@/views/user/userManagement/UserProfileView.vue'),
    meta: { requiresAuth: true }
  },

  { path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },

  // { path: '/register', component: Register }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router
