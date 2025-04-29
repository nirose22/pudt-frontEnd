<template>
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <!-- 課程頂部信息 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- 左側 - 課程圖片 -->
            <div class="relative">
                <img :src="currentCourse.images[currentImageIndex]" alt="課程圖片"
                    class="w-full h-96 object-cover rounded-lg">
                <!-- 圖片導航 -->
                <div class="mt-4 flex space-x-2">
                    <button v-for="(_, index) in currentCourse.images" :key="index" :class="[
                        'w-3 h-3 rounded-full',
                        index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                    ]" @click="currentImageIndex = index" />
                </div>
            </div>

            <!-- 右側 - 課程信息 -->
            <div class="space-y-6">
                <h1 class="text-3xl font-bold">{{ currentCourse.title }}</h1>

                <div class="flex items-center space-x-2">
                    <Rating v-model="currentCourse.rating" readonly />

                    <span class="text-gray-600">
                        {{ currentCourse.rating }} ({{ currentCourse.reviewCount }} 評價)
                    </span>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-lg font-semibold text-blue-700">
                        點數: {{ currentCourse.pointsRequired }} 點
                    </p>
                    <p class="text-sm text-blue-600">
                        您目前有 {{ courseStore.userPoints }} 點
                    </p>
                </div>

                <div>
                    <h2 class="text-xl font-semibold mb-2">課程介紹</h2>
                    <p class="text-gray-700">{{ currentCourse.description }}</p>
                </div>
            </div>
        </div>

        <!-- 商家信息卡片 -->
        <Card class="mb-8">
            <template #title>{{ currentCourse.merchant.name }}</template>
            <template #content>
                <p class="m-0">
                    <p class="text-gray-700 mb-4">{{ currentCourse.merchant.description }}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <a :href="currentCourse.merchant.googleMapUrl" target="_blank" class="flex items-center text-blue-600 hover:text-blue-800">
                                <i class="pi pi-map-marker mr-2"></i>
                                <span>{{ currentCourse.merchant.address }}</span>
                            </a>
                        </div>
                        <div class="flex items-center">
                            <i class="pi pi-phone mr-2"></i>
                            <span>{{ currentCourse.merchant.phone }}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="pi pi-clock mr-2"></i>
                            <span>{{ currentCourse.merchant.businessHours }}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="pi pi-tag mr-2"></i>
                            <span>{{ currentCourse.merchant.type }}</span>
                        </div>
                    </div>
                </p>
            </template>
        </Card>

        <!-- 預約區塊 -->
        <div class="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">選擇預約時間</h2>

            <!-- 日期選擇 -->
            <div class="mb-6">
                <div class="flex flex-wrap gap-2">
                    <button v-for="date in availableDates" :key="date" :class="[
                        'px-4 py-2 rounded-lg border',
                        selectedDate === date ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                    ]" @click="selectedDate = date">
                        {{ formatDate(date) }}
                    </button>
                </div>
            </div>

            <!-- 時間選擇 -->
            <div class="mb-6">
                <h3 class="font-medium mb-2">可用時段</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    <button v-for="slot in filteredTimeSlots" :key="slot.id" :class="[
                        'px-4 py-3 rounded-lg border relative',
                        selectedSlot?.id === slot.id ? 'bg-blue-500 text-white' : '',
                        slot.availableSeats === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'hover:bg-gray-100'
                    ]" :disabled="slot.availableSeats === 0" @click="selectTimeSlot(slot)">
                        <span>{{ slot.time }}</span>
                        <span class="block text-xs"
                            :class="selectedSlot?.id === slot.id ? 'text-blue-100' : 'text-gray-500'">
                            剩餘: {{ slot.availableSeats }}/{{ slot.totalSeats }}
                        </span>
                        <span v-if="slot.availableSeats === 0"
                            class="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70 rounded-lg">
                            已滿
                        </span>
                    </button>
                </div>
            </div>

            <!-- 預約按鈕 -->
            <div class="flex justify-between items-center">
                <div>
                    <p v-if="selectedSlot" class="text-sm text-gray-600">
                        已選擇: {{ formatDate(selectedSlot.date) }} {{ selectedSlot.time }}
                    </p>
                    <p v-else class="text-sm text-gray-600">
                        請選擇預約時段
                    </p>
                </div>

                <Button :disabled="!courseStore.canBook" @click="handleBooking"
                    :variant="courseStore.canBook ? 'default' : 'outline'">
                    {{
                        !selectedSlot
                            ? '請選擇時段'
                            : userPoints < (currentCourse.pointsRequired) ? '點數不足' : '立即預約' }} </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { useCourseStore } from '@/stores/courseStore'
import { useToast } from 'primevue/usetoast'
import Rating from 'primevue/rating';
import Card from 'primevue/card';
const courseStore = useCourseStore();
const toast = useToast();
// 圖片展示
const currentImageIndex = ref(0)
const currentCourse = toRef(courseStore, 'currentCourse');
const selectedSlot = toRef(courseStore, 'selectedSlot');
const courseSlots = toRef(courseStore, 'courseSlots');
const userPoints = toRef(courseStore, 'userPoints');

// 商家信息展示控制
const showMerchantInfo = ref(false)
const toggleMerchantInfo = () => {
    showMerchantInfo.value = !showMerchantInfo.value
}

// 日期時間選擇
const selectedDate = ref(courseSlots.value[0]?.date || '')

// 獲取可用日期
const availableDates = computed(() => {
    return [...new Set(courseSlots.value.map(slot => slot.date))]
})

// 根據選擇的日期過濾時段
const filteredTimeSlots = computed(() => {
    return courseSlots.value.filter(slot => slot.date === selectedDate.value)
})

// 選擇時段
const selectTimeSlot = (slot: any) => {
    if (slot.availableSeats === 0) return
    courseStore.selectedSlot = slot
}

// 處理預約
const handleBooking = async () => {
    if (!courseStore.canBook) return

    const success = courseStore.bookCourse()

    if (success) {
        // 顯示成功消息，實際應用中可使用toast組件
        toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
    }
}

// 格式化日期
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>