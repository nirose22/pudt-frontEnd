<template>
    <div class="shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer">
        <div class="p-4 space-y-3">
            <div class="aspect-video bg-gray-200 rounded-lg" />
            <h3 class="text-lg font-medium">{{ course.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ course.instructor }}</p>
            <div class="flex items-center justify-between">
                <span class="text-blue-500 font-medium">${{ course.price }}</span>
                <Button variant="outline" size="sm">預約</Button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    course: {
        title: string
        instructor: string
        price: number
    }
}>()
</script>