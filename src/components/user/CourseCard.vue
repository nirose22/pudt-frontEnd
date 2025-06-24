<template>
    <Card class="course-card rounded-lg overflow-hidden cursor-pointer m-2"
        :class="{ 'pointer-events-none': disabled || loading }">
        <!-- 加载状态覆盖层 -->
        <div v-if="loading"
            class="absolute inset-0 bg-gray-800 bg-opacity-30 rounded-lg flex items-center justify-center z-10">
            <ProgressSpinner style="width:40px;height:40px" strokeWidth="4" />
        </div>
        <template #header>
            <div class="relative w-full h-48 bg-gray-100 overflow-hidden">
                <!-- 图片加载状态 -->
                <div v-if="imageLoading" 
                     class="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div class="text-center space-y-3">
                        <ProgressSpinner style="width:32px;height:32px" strokeWidth="3" class="text-sky-500" />
                        <p class="text-xs text-gray-500">載入圖片中...</p>
                    </div>
                </div>
                
                <!-- 图片加载失败显示占位图 -->
                <div v-else-if="imageError && !course.coverUrl" 
                     class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div class="text-center space-y-2">
                        <i class="pi pi-image text-3xl text-gray-400"></i>
                        <p class="text-xs text-gray-500">暫無圖片</p>
                    </div>
                </div>
                
                <!-- 实际图片 -->
                <img v-if="course.coverUrl" 
                     :src="course.coverUrl" 
                     :alt="course.title"
                     class="w-full h-full object-cover transition-opacity duration-300"
                     :class="{ 'opacity-0': imageLoading, 'opacity-100': !imageLoading }"
                     @load="handleImageLoad"
                     @error="handleImageError" />
                     
                <!-- 默认占位图 -->
                <img v-else 
                     src="@/assets/image/course-placeholder.jpg" 
                     :alt="course.title"
                     class="w-full h-full object-cover transition-opacity duration-300"
                     :class="{ 'opacity-0': placeholderLoading, 'opacity-100': !placeholderLoading }"
                     @load="handlePlaceholderLoad"
                     @error="handlePlaceholderError" />
            </div>
        </template>
        <template #content>
            <h3 class="text-lg font-bold line-clamp-1">{{ course.title }}</h3>
            <div class="flex items-center text-sm text-gray-600 mb-1">
                <i class="pi pi-map-marker mr-1"></i>
                <span class="line-clamp-1">{{ RegionCodeLabel[course.region] }}</span>
            </div>
            <div class="h-10">
                <p class="text-sm text-gray-500 mb-2 line-clamp-2">{{ course.description }}</p>
            </div>
        </template>
        <template #footer>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="bg-sky-50 border border-sky-200 rounded-md px-2 py-1 text-xs text-sky-600 font-medium">
                        {{ course.points }} 點數
                    </span>
                    <span v-if="course.mainCategory && MainCategoryLabel[course.mainCategory as MainCategory]" class="bg-purple-50 border border-purple-200 rounded-md px-2 py-1 text-xs text-purple-600 font-medium">
                        {{ MainCategoryLabel[course.mainCategory as MainCategory] }}
                    </span>
                </div>
                <Button label="預約" :disabled="disabled || loading" size="small" 
                        class="bg-sky-500 hover:bg-sky-600 border-sky-500 hover:border-sky-600" />
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RegionCodeLabel } from '@/enums';
import { MainCategory, MainCategoryLabel } from '@/enums/CourseCategory';
import type { Course } from '@/types/course';
import Card from 'primevue/card';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';

const props = defineProps<{
    course: Course;
    disabled?: boolean;
    loading?: boolean;
}>();

// 图片加载状态管理
const imageLoading = ref(true);
const imageError = ref(false);
const placeholderLoading = ref(true);
const placeholderError = ref(false);

// 处理主图片加载完成
const handleImageLoad = () => {
    imageLoading.value = false;
    imageError.value = false;
};

// 处理主图片加载失败
const handleImageError = () => {
    imageLoading.value = false;
    imageError.value = true;
};

// 处理占位图加载完成
const handlePlaceholderLoad = () => {
    placeholderLoading.value = false;
    placeholderError.value = false;
};

// 处理占位图加载失败
const handlePlaceholderError = () => {
    placeholderLoading.value = false;
    placeholderError.value = true;
};

// 监听课程变化，重置加载状态
watch(() => props.course.coverUrl, () => {
    if (props.course.coverUrl) {
        imageLoading.value = true;
        imageError.value = false;
    }
}, { immediate: true });

// 组件挂载时初始化状态
onMounted(() => {
    if (props.course.coverUrl) {
        imageLoading.value = true;
    } else {
        placeholderLoading.value = true;
    }
});
</script>

<style scoped>
.course-card {
    background-color: #fdfdfd;
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
}

.course-card :deep(.p-card-body) {
    padding: 4px;
}

.course-card:hover {
    background-color: #e5f3f8;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
}

.course-card:hover img {
    transform: scale(1.05);
}

img {
    transition: transform 0.3s ease-in-out;
}

:deep(.p-card-header) {
    overflow: hidden;
    padding: 0;
}

:deep(.p-card-content) {
    padding: 1rem;
}

:deep(.p-card-footer) {
    padding: 0 1rem 1rem 1rem;
}

/* Loading spinner 样式优化 */
:deep(.p-progress-spinner-circle) {
    stroke: #0ea5e9;
}

/* 优化按钮样式 */
:deep(.p-button-small) {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
}
</style>