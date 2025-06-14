<template>
    <Card class="course-card rounded-lg overflow-hidden cursor-pointer m-1"
        :class="{ 'pointer-events-none': disabled || loading }">
        <!-- 加载状态覆盖层 -->
        <div v-if="loading"
            class="absolute inset-0 bg-gray-800 bg-opacity-30 rounded-lg flex items-center justify-center z-10">
            <ProgressSpinner style="width:40px;height:40px" strokeWidth="4" />
        </div>
        <template #header>
            <img v-if="course.coverUrl" :src="course.coverUrl" :alt="course.title"
                class="w-full h-full object-cover" />
        </template>
        <template #content>
            <h3 class="text-lg font-bold mt-2 line-clamp-1">{{ course.title }}</h3>
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
                <span class="border rounded-md px-2 py-1 text-xs text-primary-600 font-medium">{{ course.points
                    }} 點數</span>
                <Button label="預約" :disabled="disabled || loading" size="small" />
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { RegionCodeLabel } from '@/enums';
import type { Course } from '@/types/course';
import Card from 'primevue/card';
import ProgressSpinner from 'primevue/progressspinner';

defineProps<{
    course: Course;
    disabled?: boolean;
    loading?: boolean;
}>();
</script>
<style scoped>

.course-card :deep(.p-card) {
   background-color: #fdfdfd;
}

.course-card:hover :deep(.p-card img) {
    transform: scale(1.05);
}

:deep(.p-card img) {
    transition: transform 0.25s ease-in-out;
}

:deep(.p-card-header) {
    overflow: hidden;
}
</style>