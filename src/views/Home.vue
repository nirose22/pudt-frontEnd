<template>
    <div class="min-h-screen space-y-8">
        <div class="space-y-4 banner-container">
            <!-- Logo & Branding -->
            <div class="flex flex-col items-center">
                <div class="inline-flex w-130 text-center">
                    <img src="../assets/image/pudt_logo-xl.png" alt="logo">
                </div>
                <p class="text-3xl">Put Your Dots Together</p>
            </div>
            <!-- Hero Section -->
            <div class="text-center space-y-4">
                <h1 class="text-4xl font-bold">整合你的學習生活</h1>
                <p class="text-lg">
                    多元課程・點數預約・個人化行事曆
                </p>
                <div class="flex justify-center space-x-4">
                    <Button>登入</Button>
                    <Button variant="outline">註冊</Button>
                </div>
            </div>
            <!-- Search Bar -->
            <div class="flex flex-col md:flex-row items-center gap-4 justify-center">
                <InputChips v-model="tags" :allowDuplicate="false" placeholder="搜尋課程或商家..." class="w-full max-w-md">
                </InputChips>
                <Button>搜尋</Button>
            </div>
            <!-- Quick suggestions -->
            <div class="flex flex-wrap justify-center gap-2">
                <Chip v-for="tag in suggestions" :label="tag" :key="tag" @click="addChip(tag)" class="cursor-pointer  "/>
            </div>
        </div>
        <!-- Featured Courses -->
        <div class="">
            <h2 class="text-2xl font-semibold text-center">熱門課程推薦</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <CourseCard v-for="course in courses" :key="course.courseId" :course="course"
                    @click="handleCourseClick()" />
            </div>
        </div>
        <CourseDetail ref="courseDetailRef" />
    </div>
</template>

<script setup lang="ts">
import CourseCard from '@/components/modal/CourseCard.vue'
import CourseDetail from '@/views/user/course/CourseDetail.vue'
import { ref } from 'vue'
import Chip from 'primevue/chip';
import InputChips from 'primevue/inputchips';
import type { CourseDTO } from '@/types/course';
const tags = ref<string[]>([])
const courseDetailRef = ref<InstanceType<typeof CourseDetail> | null>(null)
    
const suggestions = ['瑜珈', '滑板', '攝影', '烘焙', '游泳'];

function addChip(tag: string) {
  if (!tags.value.includes(tag)) {
    tags.value.push(tag)
  }
}
const courses: CourseDTO[] = [
    {
        courseId: 1,
        title: '初學者瑜珈課程',
        pointsRequired: 10,
        image: {
            imageSrc: 'https://via.placeholder.com/150',
            alt: '瑜珈課程圖片'
        },
        merchantName: '瑜珈教室'
    },
    {
        courseId: 2,
        title: '進階攝影技巧',
        pointsRequired: 5,
        image: {
            imageSrc: 'https://via.placeholder.com/150',
            alt: '攝影課程圖片'
        },
        merchantName: '攝影教室'
    },
    {
        courseId: 3,
        title: '甜點烘焙入門',
        pointsRequired: 5,
        image: {
            imageSrc: 'https://via.placeholder.com/150',
            alt: '烘焙課程圖片'
        },
        merchantName: '烘焙教室'
    }
]

const handleCourseClick = () => {
    if (courseDetailRef.value) {
        courseDetailRef.value.visible = true
    }
}
</script>
<style scoped>
.banner-container {
    background-image: url('../assets/image/pudt_bg.png');
    background-size: 85%;
    background-position: center;
    background-repeat: no-repeat;
    background-position-y: 180px;
}
</style>