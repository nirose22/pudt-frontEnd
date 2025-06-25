import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import merchantRoutes from './merchantRoutes';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/enums/User';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'UserLayout',
    component: () => import('@/views/user/UserLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/user/SearchResultView.vue'),
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/userManagement/UserProfileView.vue'),
        meta: { title: '會員中心', allowedRoles: [UserRole.User, UserRole.Admin] },
        children: [
          {
            path: 'management',
            name: 'ProfileManagement',
            component: () => import('@/views/user/userManagement/ProfileManagement.vue'),
          },
          {
            path: 'inbox',
            name: 'InboxMessages',
            component: () => import('@/views/user/userManagement/InboxMessages.vue'),
          },
          {
            path: 'points',
            name: 'UserPointsManagement',
            component: () => import('@/views/user/userManagement/PointsManagement.vue'),
          },
          {
            path: 'bookings',
            name: 'BookingsManagement',
            component: () => import('@/views/user/userManagement/BookingsManagement.vue'),
          },
          {
            path: 'history',
            name: 'ActivityHistory',
            component: () => import('@/views/user/userManagement/ActivityHistory.vue'),
          },
          {
            path: 'purchase',
            name: 'PurchaseHistory',
            component: () => import('@/views/user/userManagement/PurchaseHistory.vue'),
          },
          {
            path: 'favorite',
            name: 'FavoriteCourses',
            component: () => import('@/views/user/userManagement/FavoriteCourses.vue'),
          }
        ]
      },
    ]
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/RegisterView.vue')
  },
  {
    path: '/auth/line/callback',
    name: 'LineCallback',
    component: () => import('@/views/auth/LineCallback.vue')
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
  const isMerchant = authStore.isMerchant;
  const userRole = authStore.role;
  
  // 檢查是否需要認證
  if (to.meta.requiresAuth && !isLoggedIn) {
    // 不再重定向到登录页面，而是返回当前页面
    next(false);
    return;
  }
  
  // 檢查商家權限
  if (to.meta.requiresMerchantAuth) {
    if (!isMerchant) {
      next({ name: 'MerchantLogin' });
      return;
    }
    
    // 使用新的 allowedRoles 檢查機制
    const allowedRoles = to.meta.allowedRoles as UserRole[] | undefined;
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      next({ name: 'Home' });
      return;
    }
  }
  
  // 檢查用戶角色權限 - 使用新的 allowedRoles 機制
  const allowedRoles = to.meta.allowedRoles as UserRole[] | undefined;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // 根據用戶角色重定向到適當的頁面
    switch (userRole) {
      case UserRole.Merchant:
        next({ name: 'MerchantDashboard' });
        break;
      case UserRole.Admin:
      case UserRole.User:
      default:
        next({ name: 'Home' });
        break;
    }
    return;
  }
  
  next();
});

export default router
