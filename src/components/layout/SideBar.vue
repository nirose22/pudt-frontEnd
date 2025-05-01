<template>
    <Drawer v-model:visible="visibleMenu" header="Drawer" :pt="menuDt">
        <template #header>
            <BaseLogo class="h-full w-25" />
        </template>
        <template #contanier="{ closeCallback }">
            <Button label="Close" @click="closeCallback" />
        </template>
        <div class="flex flex-col justify-between h-full">
            <div class="flex flex-col">
                <div class="menu-item">
                    <i class="pi pi-home"></i>
                    <span>探索</span>
                </div>
                <div class="menu-item">
                    <i class="pi pi-home"></i>
                    <span>我的最愛</span>
                </div>
                <div class="menu-item">
                    <i class="pi pi-home"></i>
                    <span>我的課卡</span>
                </div>
            </div>
            <div class="flex flex-col">
                <Divider />
                <div class="menu-item">
                    <i class="pi pi-user"></i>
                    <span>登入</span>
                </div>
                <div class="menu-item">
                    <i class="pi pi-user"></i>
                    <span>註冊</span>
                </div>
            </div>
        </div>
    </Drawer>
</template>
<script setup lang="ts">
import Drawer from 'primevue/drawer';
import Divider from 'primevue/divider';
import BaseLogo from '@/components/layout/BaseLogo.vue';
import { ref } from 'vue';

const visibleMenu = ref(false);
const menuDt = ref({
    mask: {
        class: ' bg-primary  !bg-transparent'
    },
    root: {
        class: '!bg-white !text-primary !border-0'
    },
    closeButton: {
        class: 'text-red-500 hover:text-red-700'
    }
})
</script>
<style scoped>
@reference "tailwindcss";

.menu-item {
    @apply flex items-center text-base font-normal rounded-md p-2 gap-2 cursor-pointer
}

.menu-item>i {
    @apply text-xl;
}

.menu-item>span {
    line-height: 1.5;
}

.menu-item:hover {
    @apply bg-sky-100;
}
</style>