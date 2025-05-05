// stores/userStore.ts – Pinia + pinia-plugin-persistedstate version
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Course, CourseBooking } from '@/types'
import { UserRole } from '@/enums/UserRole';
import { BookingStatus } from '@/enums/bookingStatus';
// import * as userApi from '@/services/userApi'

export const useUserStore = defineStore('user', () => {
  /* ---------- state (auto‑persist) ---------- */
  const profile = ref<User | null>(null)
  const points = ref<number>(0)
  const favs = ref<Course[]>([])

  /* ---------- getters ---------- */
  const isLoggedIn = computed(() => !!profile.value)
  const displayName = computed(() => profile.value?.name ?? UserRole.Guest)
  const isFavorite = (id: number) => favs.value.some(c => c.courseId === id)

  /* ---------- actions ---------- */
  async function fetchProfile(id?: number) {
    // const { success, data } = await userApi.fetchProfile(id)

    const data: User = {
      id: 1, name: 'John', points: 100,
      email: 'john@example.com', phone: '1234567890',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: new Date(),
      lastLogin: new Date(),
    }

    if (data) {
      profile.value = data
      points.value = data.points ?? 0
    }
    return data
  }

  async function fetchBookings() {
    // const { success, data } = await userApi.fetchBookings(profile.value?.id)
    const data: CourseBooking[] = [
      {
        id: 1,
        userId: 1,
        courseId: 101,
        courseTitle: '初级瑜伽课程',
        date: '2025-05-01',
        time: '10:00-12:00',
        location: '和平瑜伽中心 - 信义店',
        instructor: {
          name: '李老师',
          avatar: 'https://via.placeholder.com/50',
        },
        status: BookingStatus.Confirmed,
      },
      {
        id: 2,
        userId: 1,
        courseId: 102,
        courseTitle: '冥想与放松',
        date: '2025-05-01',
        time: '14:00-16:00',
        location: '和平瑜伽中心 - 中山店',
        instructor: {
          name: '张老师',
          avatar: 'https://via.placeholder.com/50',
        },
        status: BookingStatus.Pending,
      },
      {
        id: 3,
        userId: 1,
        courseId: 103,
        courseTitle: '高级瑜伽课程',
        date: '2025-05-04',
        time: '18:00-20:00',
        location: '和平瑜伽中心 - 信义店',
        instructor: {
          name: '王老师',
          avatar: 'https://via.placeholder.com/50',
        },
        status: BookingStatus.Canceled,
      },
      {
        id: 4,
        userId: 1,
        courseId: 104,
        courseTitle: '瑜伽基础课程',
        date: '2025-05-05',
        time: '10:00-12:00',
        location: '和平瑜伽中心 - 中山店',
        instructor: {
          name: '赵老师',
          avatar: 'https://via.placeholder.com/50',
        },
        status: BookingStatus.Canceled
      },
    ]
    return data
  }

  // async function updateProfile(payload: Partial<User>) {
  //   if (!profile.value) return { success: false, message: '尚未載入' }
  //   const { success, data } = await userApi.updateProfile(profile.value.id, payload)
  //   if (success && data) profile.value = data
  //   return { success, data }
  // }

  function adjustPoints(amount: number) {
    if (!profile.value) return { success: false, message: '尚未載入' }
    if (points.value - amount < 0) return { success: false, message: '點數不足' }
    points.value -= amount
    return { success: true, data: points.value }
  }

  /* 收藏 */
  function addFavorite(course: Course) {
    if (!isFavorite(course.courseId)) favs.value.push(course)
    // api
    return { success: true, message: '已加入收藏' }
  }
  function removeFavorite(id: number) {
    favs.value = favs.value.filter(c => c.courseId !== id)
    // api
    return { success: true, message: '已從收藏中移除' }
  }

  return {
    // state
    profile,
    points,
    favs,
    // getters
    isLoggedIn,
    displayName,
    isFavorite,
    // actions
    fetchProfile,
    // updateProfile,
    adjustPoints,
    addFavorite,
    removeFavorite,
    fetchBookings
  }
},
  {
    // ---------- persist plugin options ----------
    persist: {
      key: 'user',                // localStorage key
      storage: localStorage,      // 可改 sessionStorage
      pick: ['profile', 'points', 'favs']
    }
  }
)
