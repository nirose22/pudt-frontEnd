import type { RouteRecordRaw } from 'vue-router';
import { UserRole } from '@/enums/User';

// 商家管理系統路由配置
const merchantRoutes: RouteRecordRaw[] = [
  {
    path: '/merchant',
    name: 'MerchantLayout',
    component: () => import('@/views/merchant/MerchantLayout.vue'),
    meta: { requiresMerchantAuth: true, role: UserRole.Merchant },
    children: [
      {
        path: '',
        redirect: { name: 'MerchantDashboard' }
      },
      {
        path: 'dashboard',
        name: 'MerchantDashboard',
        component: () => import('@/views/merchant/dashboard/MerchantDashboard.vue'),
        meta: { title: '商家儀表板', role: UserRole.Merchant }
      },
      // 課程管理相關路由
      {
        path: 'courses',
        name: 'CourseList',
        component: () => import('@/views/merchant/courses/CourseList.vue'),
        meta: { title: '課程管理', role: UserRole.Merchant }
      },
      {
        path: 'courses/create',
        name: 'CourseCreate',
        component: () => import('@/views/merchant/courses/CourseForm.vue'),
        meta: { title: '新增課程', role: UserRole.Merchant }
      },
      {
        path: 'courses/edit/:id',
        name: 'CourseEdit',
        component: () => import('@/views/merchant/courses/CourseForm.vue'),
        meta: { title: '編輯課程', role: UserRole.Merchant }
      },
      // 預約管理相關路由
      {
        path: 'bookings',
        name: 'BookingList',
        component: () => import('@/views/merchant/bookings/BookingList.vue'),
        meta: { title: '預約管理', role: UserRole.Merchant }
      },
      {
        path: 'bookings/:id',
        name: 'BookingDetail',
        component: () => import('@/views/merchant/bookings/BookingDetail.vue'),
        meta: { title: '預約詳情', role: UserRole.Merchant }
      },
      // 點數管理相關路由
      {
        path: 'points',
        name: 'MerchantPointsManagement',
        component: () => import('@/views/merchant/points/PointsManagement.vue'),
        meta: { title: '點數管理', role: UserRole.Merchant }
      },
      // 商家設定相關路由
      {
        path: 'settings',
        name: 'MerchantSettings',
        component: () => import('@/views/merchant/settings/MerchantSettings.vue'),
        meta: { title: '商家設定', role: UserRole.Merchant }
      },
      // 通知中心
      {
        path: 'notifications',
        name: 'MerchantNotifications',
        component: () => import('@/views/merchant/notifications/NotificationCenter.vue'),
        meta: { title: '通知中心', role: UserRole.Merchant }
      }
    ]
  },
];

export default merchantRoutes; 