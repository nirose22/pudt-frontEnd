import { createRouter, createWebHistory } from 'vue-router';


const routes = [
  { path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue') 
  },
  { path: '/course/:id',
    name: 'CourseDetail',
    component: () => import('@/views/user/course/CourseDetail.vue') 
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/userManagement/UserProfileView.vue'),
    meta: { requiresAuth: true }
  }
  // { path: '/history', component: BookingHistory, meta: { requiresAuth: true, role: 'user' } },
  // { path: '/merchant/dashboard', component: MerchantDashboard, meta: { requiresAuth: true, role: 'merchant' } },
  // { path: '/merchant/courses', component: ManageCourses, meta: { requiresAuth: true, role: 'merchant' } },
  // { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
  // { path: '/admin/system', component: SystemManagement, meta: { requiresAuth: true, role: 'admin' } },
  // { path: '/login', component: Login },
  // { path: '/register', component: Register }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router
