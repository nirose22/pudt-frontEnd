import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import merchantRoutes from './merchantRoutes';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/enums/User';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'UserLayout',
    component: () => import('@/views/user/userLayout.vue'),
    meta: { requiresAuth: true, role: UserRole.User },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true, role: UserRole.User },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/user/SearchResultView.vue'),
        meta: { role: UserRole.User },
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/userManagement/UserProfileView.vue'),
        meta: { requiresAuth: true, role: UserRole.User },
        children: [
          {
            path: 'management',
            name: 'ProfileManagement',
            component: () => import('@/views/user/userManagement/ProfileManagement.vue'),
            meta: { title: '會員資料管理', role: UserRole.User }
          },
          {
            path: 'inbox',
            name: 'InboxMessages',
            component: () => import('@/views/user/userManagement/InboxMessages.vue'),
            meta: { title: '站內收件夾', role: UserRole.User }
          },
          {
            path: 'points',
            name: 'UserPointsManagement',
            component: () => import('@/views/user/userManagement/PointsManagement.vue'),
            meta: { title: '點數管理', role: UserRole.User }
          },
          {
            path: 'bookings',
            name: 'BookingsManagement',
            component: () => import('@/views/user/userManagement/BookingsManagement.vue'),
            meta: { title: '預約行程管理', role: UserRole.User }
          },
          {
            path: 'history',
            name: 'ActivityHistory',
            component: () => import('@/views/user/userManagement/ActivityHistory.vue'),
            meta: { title: '活動紀錄', role: UserRole.User }
          },
          {
            path: 'purchase',
            name: 'PurchaseHistory',
            component: () => import('@/views/user/userManagement/PurchaseHistory.vue'),
            meta: { title: '購買紀錄', role: UserRole.User }
          },
          {
            path: 'favorite',
            name: 'FavoriteCourses',
            component: () => import('@/views/user/userManagement/FavoriteCourses.vue'),
            meta: { title: '收藏課程', role: UserRole.User }
          }
        ]
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue')
  },
];

// 添加商家路由
const allRoutes = [...routes, ...merchantRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes: allRoutes,
});

// 添加路由守衛，處理權限認證
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isLoggedIn;
  const userRole = authStore.role;
  
  // 檢查是否需要認證
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }
  
  // 檢查商家權限
  if (to.meta.requiresMerchantAuth) {
    if (!isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }
    
    if (userRole !== UserRole.Merchant) {
      // 如果用戶不是商家，則跳轉到首頁
      next({ name: 'Home' });
      return;
    }
  }
  
  // 檢查用戶角色權限
  if (to.meta.role && userRole !== to.meta.role) {
    // 如果是商家帳號訪問用戶頁面，則跳轉到商家首頁
    if (userRole === UserRole.Merchant) {
      next({ name: 'MerchantDashboard' });
      return;
    }
    
    // 如果是普通用戶訪問商家頁面，則跳轉到用戶首頁
    if (userRole === UserRole.User) {
      next({ name: 'Home' });
      return;
    }
  }
  
  // 其他情況正常導航
  next();
});

export default router
