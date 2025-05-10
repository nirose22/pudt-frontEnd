<template>
    <div class="shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer bg-white">
        <div class="p-4">
            <div class="aspect-video bg-gray-200 rounded-lg" />
            <h3 class="text-lg font-bold mt-2">{{ course.title }}</h3>
            <div class="flex items-center text-sm text-gray-600 mb-1">
                <i class="pi pi-map-marker icon-class"></i>
                <span>{{ course.merchantName }}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="border rounded-md px-2 py-1 text-xs text-blue-500 font-medium">{{ course.pointsRequired }}
                    點</span>
                <Button variant="outline" size="sm">預約</Button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { CourseDTO } from '@/types/course';

defineProps<{
    course: CourseDTO
}>()
</script>