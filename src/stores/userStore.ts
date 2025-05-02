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
  const userPoints = ref(50);

  // 收藏的課程列表
  const favoriteCourses = ref<Course[]>([]);

  // 計算屬性：檢查課程是否已收藏
  const isFavorite = computed(() => {
    return (courseId: number) => favoriteCourses.value.some(course => course.courseId === courseId);
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
      await axios.post(`/api/users/${userId.value}/favorites`, { courseId: course.courseId });

      // 更新本地狀態
      // 避免重複添加
      if (!isFavorite.value(course.courseId)) {
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
      favoriteCourses.value = favoriteCourses.value.filter(course => course.courseId !== courseId);

      return { success: true };
    } catch (error) {
      console.error('移除收藏失敗:', error);
      return { success: false, error };
    }
  };

  // 獲取用戶點數
  const fetchUserPoints = async () => {
    try {
      // 實際應用中，應該從後端 API 獲取最新點數
      // const response = await axios.get(`/api/users/${userId.value}/points`);
      // userPoints.value = response.data.points;
      console.log('獲取用戶點數');
      return { success: true, points: userPoints.value };
    } catch (error) {
      console.error('獲取用戶點數失敗:', error);
      return { success: false, error };
    }
  };

  // 添加點數
  const addPoints = async (points: number) => {
    try {
      // 實際應用中，應該呼叫後端 API 添加點數
      // const response = await axios.post(`/api/users/${userId.value}/points/add`, { points });
      userPoints.value += points;
      return { success: true, newPoints: userPoints.value };
    } catch (error) {
      console.error('添加點數失敗:', error);
      return { success: false, error };
    }
  };

  // 扣除點數
  const deductPoints = async (points: number) => {
    try {
      if (userPoints.value < points) {
        return { success: false, reason: '點數不足' };
      }

      // 實際應用中，應該呼叫後端 API 扣除點數
      // const response = await axios.post(`/api/users/${userId.value}/points/deduct`, { points });
      userPoints.value -= points;
      return { success: true, remainingPoints: userPoints.value };
    } catch (error) {
      console.error('扣除點數失敗:', error);
      return { success: false, error };
    }
  };

  // 檢查點數是否足夠
  const hasEnoughPoints = (requiredPoints: number) => {
    return userPoints.value >= requiredPoints;
  };

  // 用戶登入後初始化數據
  const initUserData = async (id: number) => {
    userId.value = id;
    await fetchFavoriteCourses();
    await fetchUserPoints();
    // 其他用戶數據初始化...
  };

  return {
    userId,
    userInfo,
    userPoints,
    favoriteCourses,
    isFavorite,
    fetchFavoriteCourses,
    addToFavorites,
    removeFromFavorites,
    fetchUserPoints,
    addPoints,
    deductPoints,
    hasEnoughPoints,
    initUserData
  };
});