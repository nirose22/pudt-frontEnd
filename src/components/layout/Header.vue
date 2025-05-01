<template>
    <header class="w-full fixed top-0 left-0 z-50">
        <nav class="flex justify-between items-center py-1 px-3 h-14 overflow-hidden">
            <!-- Logo -->
            <div class="flex flex-row h-full gap-3 overflow-hidden">
                <Sidebar v-model:visible="visibleMenu" />
                <Button rounded variant="text" class=" !text-gray-500 !text-xl w-12" @click="visibleMenu = true">
                    <i class="pi pi-bars !text-xl"></i>
                </Button>
                <BaseLogo class="h-full w-25 cursor-pointer" @click="router.push('/')" />
            </div>
            <Button class="mr-2  w-11" text rounded @click="visibleScheduleBar = true">
                <OverlayBadge severity="danger" class="text-red-600" :unstyled="!hasNewSchedule">
                    <i class="pi pi-calendar !text-[1.7rem]"></i>
                </OverlayBadge>
            </Button>
            <ScheduleBar v-model:visible="visibleScheduleBar"></ScheduleBar>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseLogo from '@/components/layout/BaseLogo.vue';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/layout/SideBar.vue';
import ScheduleBar from '@/components/layout/ScheduleBar.vue';
import OverlayBadge from 'primevue/overlaybadge';

const visibleMenu = ref(false);
const visibleScheduleBar = ref(false);
const router = useRouter();
const hasNewSchedule = ref(false);
</script>
<style scoped></style>