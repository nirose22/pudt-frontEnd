<template>
    <header class="w-full z-10">
        <nav class="flex justify-between items-center py-4 px-3 overflow-hidden gap-4 ">
            <!-- Logo -->
            <div class="flex flex-row h-full gap-3 overflow-hidden">
                <Sidebar v-model:visible="visibleMenu" />
                <Button rounded variant="text" class=" !text-gray-500 !text-xl w-12" @click="visibleMenu = true">
                    <i class="pi pi-bars !text-xl"></i>
                </Button>
                <BaseLogo class="h-full w-25 cursor-pointer" @click="router.push('/')" />
            </div>
            <!-- 搜索栏 - 仅在搜索页面显示 -->
            <SearchBar v-if="route.name === 'Search'" v-model="keyword" placeholder="搜尋課程、教師或地點..."
                @search="searchAgain" />
            <!-- 課程行程表 -->
            <Button class="mr-2 w-11" text rounded @click="visibleScheduleBar = true">
                <OverlayBadge severity="danger" class="text-red-600" :unstyled="!hasNewSchedule">
                    <i class="pi pi-calendar !text-[1.7rem]"></i>
                </OverlayBadge>
            </Button>
            <Drawer v-model:visible="visibleScheduleBar" position="right" header="課程行程表" :pt="menuPt">
                <ScheduleManagement />
            </Drawer>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseLogo from '@/components/layout/BaseLogo.vue';
import Sidebar from '@/components/layout/SideBar.vue';
import SearchBar from '@/components/layout/SearchBar.vue';
import ScheduleManagement from '@/views/user/userManagement/ScheduleManagement.vue';
import OverlayBadge from 'primevue/overlaybadge';
import Drawer from 'primevue/drawer';
import { useAuthStore } from '@/stores/authStore';
import { useCourseFilters } from '@/composables/useCourseFilters';
const visibleMenu = ref(false);
const visibleScheduleBar = ref(false);
const router = useRouter();
const route = useRoute();
const hasNewSchedule = ref(false);
const authStore = useAuthStore();
const role = authStore.role;
const { searchRequest } = useCourseFilters(route, router);

const keyword = ref('');
const menuPt = ref({
    header: {
        class: '!text-sky-600 !text-xl'
    },
    mask: {
        class: '!bg-gray-500/10'
    },
    root: {
        class: '!bg-white !text-primary !border-0 !min-w-[25rem]'
    },
    closeButton: {
        class: 'text-red-500 hover:text-red-700'
    }
});

// 搜索功能
const searchAgain = (keyword: string) => {
    console.log('searchAgain', keyword);
    
    // 如果已經在搜尋頁面，直接更新 URL 參數
    if (route.name === 'Search') {
        router.replace({
            name: 'Search',
            query: { 
                ...route.query, // 保留其他查詢參數
                keyword: keyword.trim(),
                pageNum: undefined // 重置頁碼
            }
        });
    } else {
        // 如果不在搜尋頁面，則跳轉到搜尋頁面
        router.push({
            name: 'Search',
            query: { keyword: keyword.trim() }
        });
    }
};

// 当路由变化时，更新搜索关键词
watchEffect(() => {
    if (route.name === 'Search' && route.query.keyword) {
        keyword.value = route.query.keyword as string;
    }
});
</script>