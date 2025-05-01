// stores/userStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';  // 假設使用 axios 進行 API 請求
import type { Course } from '@/types/course';
import type { User } from '@/types/user';

export const useUserStore = defineStore('user', () => {
  // 用戶基本資料
  const userId = ref<number | null>(null);
  const userInfo = ref<User | null>(null);

  // 收藏的課程列表
    const favoriteCourses = ref<Course[]>([]);

  // 計算屬性：檢查課程是否已收藏
  const isFavorite = computed(() => {
    return (courseId: number) => favoriteCourses.value.some(course => course.classuid === courseId);
  });

  // 初始化：從後端獲取用戶收藏課程
  const fetchFavoriteCourses = async () => {
    try {
      // 假設 API 端點：/api/users/{userId}/favorites
      const response = await axios.get(`/api/users/${userId.value}/favorites`);
      favoriteCourses.value = response.data;
    } catch (error) {
      console.error('獲取收藏課程失敗:', error);
    }
  };

  // 添加課程到收藏
  const addToFavorites = async (course: Course) => {
    try {
      // 向後端 API 發送添加收藏請求
      await axios.post(`/api/users/${userId.value}/favorites`, { courseId: course.id });

      // 更新本地狀態
      // 避免重複添加
      if (!isFavorite.value(course.classuid)) {
        favoriteCourses.value.push(course);
      }

      return { success: true };
    } catch (error) {
      console.error('添加收藏失敗:', error);
      return { success: false, error };
    }
  };

  // 從收藏中移除課程
  const removeFromFavorites = async (courseId: number) => {
    try {
      // 向後端 API 發送移除收藏請求
      await axios.delete(`/api/users/${userId.value}/favorites/${courseId}`);

      // 更新本地狀態
      favoriteCourses.value = favoriteCourses.value.filter(course => course.classuid !== courseId);

      return { success: true };
    } catch (error) {
      console.error('移除收藏失敗:', error);
      return { success: false, error };
    }
  };

  // 用戶登入後初始化數據
  const initUserData = async (id: number) => {
    userId.value = id;
    await fetchFavoriteCourses();
    // 其他用戶數據初始化...
  };

  return {
    userId,
    userInfo,
    favoriteCourses,
    isFavorite,
    fetchFavoriteCourses,
    addToFavorites,
    removeFromFavorites,
    initUserData
  };
});