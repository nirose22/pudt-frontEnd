import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import merchantRoutes from './merchantRoutes';
import { useAuthStore } from '@/stores/authStore';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/userManagement/UserProfileView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'management',
        name: 'ProfileManagement',
        component: () => import('@/views/user/userManagement/ProfileManagement.vue'),
        meta: { title: '會員資料管理' }
      },
      {
        path: 'inbox',
        name: 'InboxMessages',
        component: () => import('@/views/user/userManagement/InboxMessages.vue'),
        meta: { title: '站內收件夾' }
      },
      {
        path: 'points',
        name: 'UserPointsManagement',
        component: () => import('@/views/user/userManagement/PointsManagement.vue'),
        meta: { title: '點數管理' }
      },
      {
        path: 'bookings',
        name: 'BookingsManagement',
        component: () => import('@/views/user/userManagement/BookingsManagement.vue'),
        meta: { title: '預約行程管理' }
      },
      {
        path: 'history',
        name: 'ActivityHistory',
        component: () => import('@/views/user/userManagement/ActivityHistory.vue'),
        meta: { title: '活動紀錄' }
      },
      { 
        path: 'purchase',
        name: 'PurchaseHistory',
        component: () => import('@/views/user/userManagement/PurchaseHistory.vue'),
        meta: { title: '購買紀錄' }
      },
      {
        path: 'favorite',
        name: 'FavoriteCourses',
        component: () => import('@/views/user/userManagement/FavoriteCourses.vue'),
        meta: { title: '收藏課程' }
      }
    ]
  },
  { path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
  },

  { 
    path: '/register', 
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/user/SearchResultView.vue'),
  }
];

// 添加商家路由
const allRoutes = [...routes, ...merchantRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes: allRoutes,
});

// 添加路由守衛，處理商家認證
router.beforeEach((to, from, next) => {
  // 檢查是否需要商家認證
  if (to.meta.requiresMerchantAuth) {
    // 這裡可以添加檢查商家是否已登入的邏輯
    const isLoggedIn = useAuthStore().isLoggedIn;
    if (!isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    } else {
      to.name = 'MerchantLayout';
    }
  }
  
  next();
});

export default router
