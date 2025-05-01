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
                <CourseCard v-for="course in courses" :key="course.id" :course="course"
                    @click="handleCourseClick(course.id)" />
            </div>
        </div>
        <CourseDetail v-model:visible="visible" />
    </div>
</template>

<script setup lang="ts">
import CourseCard from '@/components/modal/CourseCard.vue'
import CourseDetail from '@/views/user/course/CourseDetail.vue'
import { ref } from 'vue'
import Chip from 'primevue/chip';
import InputChips from 'primevue/inputchips';
import AutoComplete from 'primevue/autoComplete';
const tags = ref<string[]>([])

const suggestions = ['瑜珈', '滑板', '攝影', '烘焙', '游泳'];

function addChip(tag: string) {
  if (!tags.value.includes(tag)) {
    tags.value.push(tag)
  }
}
const visible = ref(false)
const courses = [
    {
        id: 1,
        title: '初學者瑜珈課程',
        instructor: '王老師',
        price: 1200
    },
    {
        id: 2,
        title: '進階攝影技巧',
        instructor: '李老師',
        price: 1500
    },
    {
        id: 3,
        title: '甜點烘焙入門',
        instructor: '張老師',
        price: 1800
    }
]

const handleCourseClick = (id: number) => {
    visible.value = true
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