<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">我的收藏課程</h2>
    
    <div v-if="loading" class="flex justify-center p-6">
      <ProgressSpinner />
    </div>
    
    <div v-else-if="userStore.favoriteCourses.length === 0" class="text-center p-12 bg-gray-50 rounded-lg">
      <i class="pi pi-heart-fill text-4xl text-gray-300 mb-4"></i>
      <h3 class="text-xl font-semibold text-gray-500 mb-2">尚未收藏任何課程</h3>
      <p class="text-gray-400 mb-6">瀏覽課程並點擊心形圖標將它們添加到收藏</p>
      <Button label="瀏覽課程" icon="pi pi-search" @click="router.push('/courses')" />
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="course in userStore.favoriteCourses" :key="course.id" 
           class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <img :src="course.images[0]" :alt="course.title" class="w-full h-48 object-cover">
        <div class="p-4">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold mb-2">{{ course.title }}</h3>
            <Button icon="pi pi-heart-fill" class="p-button-rounded p-button-text text-red-500" 
                   @click="removeFavorite(course.id)" />
          </div>
          <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ course.description }}</p>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-blue-600">{{ course.pointsRequired }} 點</span>
            <Button label="查看詳情" size="small" @click="viewCourseDetails(course.id)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

const userStore = useUserStore();
const router = useRouter();
const toast = useToast();
const loading = ref(false);

// 在組件掛載時加載收藏課程
onMounted(async () => {
  if (userStore.userId && userStore.favoriteCourses.length === 0) {
    loading.value = true;
    await userStore.fetchFavoriteCourses();
    loading.value = false;
  }
});

// 移除收藏課程
const removeFavorite = async (courseId) => {
  const result = await userStore.removeFromFavorites(courseId);
  if (result.success) {
    toast.add({
      severity: 'success',
      summary: '成功',
      detail: '課程已從收藏中移除',
      life: 3000
    });
  }
};

// 查看課程詳情
const viewCourseDetails = (courseId) => {
  router.push(`/courses/${courseId}`);
};
</script>
