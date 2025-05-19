<template>
    <Dialog v-model:visible="visible" :modal="true" :draggable="false" :resizable="false" :closable="true"
        :dt="courseDlg">
        <template #header>
            <p> </p>
        </template>
        <div v-if="currentCourse" class="max-w-6xl mx-auto p-6 sm:px-2">
            <Toast />
            <!-- 課程頂部信息 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
                <!-- 左側 - 課程圖片 -->
                <Galleria :value="currentCourse.images" :responsiveOptions="responsiveOptions" :numVisible="5"
                    :circular="true" containerStyle="width: 100%" :showItemNavigators="true"
                    :showItemNavigatorsOnHover="true">
                    <template #item="slotProps">
                        <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" class="w-full" />
                    </template>
                    <template #thumbnail="slotProps">
                        <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" class="block" />
                    </template>
                </Galleria>

                <!-- 右側 - 課程信息 -->
                <div class="flex flex-col space-y-6 overflow-hidden">
                    <div class="flex justify-between items-start">
                        <h1 class="text-3xl font-bold">{{ currentCourse.title }}</h1>
                        <!-- 收藏按鈕 -->
                        <Button rounded size="large" severity="secondary"
                            :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" :class="{
                                'text-red-600': isFavorite,
                            }" @click="toggleFavorite" :loading="favoriteLoading" aria-label="收藏課程" />
                    </div>
                    <div class="flex items-center gap-2">
                        <Rating v-model="currentCourse.merchant.rating" readonly />
                        <span class="text-gray-600">
                            {{ currentCourse.merchant.rating }} ({{ currentCourse.merchant.reviewCount }} 評價)
                        </span>
                    </div>
                    <ScrollPanel style="width: 100%; height: 100%">
                        <p>
                            {{ currentCourse.description }}
                        </p>
                    </ScrollPanel>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-lg text-blue-700">
                            點數: {{ currentCourse.pointsRequired }} 點
                        </p>
                        <p class="text-sm text-blue-600">
                            您目前有 {{ userPoints }} 點
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 商家信息卡片 -->
        <Card v-if="currentCourse?.merchant" class="mb-8">
            <template #title>{{ currentCourse.merchant.name }}</template>
            <template #content>
                <p class="text-gray-700 mb-4">{{ currentCourse.merchant.description }}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                        <a :href="currentCourse.merchant.googleMapUrl" target="_blank"
                            class="flex items-center text-blue-600 hover:text-blue-800">
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
            </template>
        </Card>

        <!-- 預約區塊 -->
        <div v-if="currentCourse" class=" bg-gray-50 rounded-lg p-4">
            <div class="form-field-frame flex-col">
                <h2 class="form-field-label">選擇預約時間</h2>
                <!-- 日期選擇 -->
                <IftaLabel class="w-1/3">
                    <DatePicker class="w-full" v-model="selectedDate" inputId="date" showIcon iconDisplay="input"
                        variant="filled" />
                    <label for="date">Date</label>
                </IftaLabel>
            </div>
            <Divider />
            <!-- 時間選擇 -->
            <div class="">
                <div class="form-field-frame text-center gap-2.5">
                    <h3 class="form-field-label">可預約時段</h3>
                </div>
                <template v-if="filteredTimeSlots.length === 0">
                    <p class="text-center p-5">
                        目前沒有可預約時段
                    </p>
                </template>
                <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    <button v-for="slot in filteredTimeSlots" :key="slot.id"
                        :class="['avaliable-btn', { 'avaliable-btn-selected': selectedSlot?.id === slot.id }]"
                        :disabled="slot.availableSeats === 0" @click="selectTimeSlot(slot)">
                        <span>{{ slot.time }}</span>
                        <span class="block text-xs">
                            剩餘: {{ slot.availableSeats }}/{{ slot.totalSeats }}
                        </span>
                        <span v-if="slot.availableSeats === 0" class="">
                            已滿
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <template #footer class="bg-sky-300">
            <Toolbar class="w-full bg-amber-100">
                <template #start>
                    <Button text rounded size="large" severity="secondary"
                        :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" :class="{
                            'text-red-600': isFavorite,
                        }" @click="toggleFavorite" :loading="favoriteLoading" aria-label="收藏課程" />
                    <Button text rounded size="large" icon="pi pi-share-alt" severity="secondary"
                        @click="shareCourse" />
                </template>
                <template #center>
                    <div class="!text-lg font-bold !text-gray-800">
                        <p v-if="selectedSlot">
                            已選擇: {{ selectedSlot.date.toLocaleDateString() }} {{ formatTimeSlot(selectedSlot) }}
                        </p>
                        <p v-else class="">
                            請選擇預約時段
                        </p>
                    </div>
                </template>
                <template #end>
                    <ConfirmDialog id="confirm" style="width: 450px;" />
                    <Button size="large" @click="handleBooking" :disabled="!canBook">
                        <span class="text-lg font-medium">
                            {{
                                !selectedSlot
                                    ? '請選擇時段'
                                    : !currentCourse || userPoints < (currentCourse.pointsRequired) ? '點數不足' : '立即預約' }} </span>
                    </Button>
                </template>
            </Toolbar>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCourseStore } from '@/stores/courseStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm';
import Rating from 'primevue/rating';
import Card from 'primevue/card';
import Galleria from 'primevue/galleria';
import DatePicker from 'primevue/datepicker';
import IftaLabel from 'primevue/iftalabel';
import Divider from 'primevue/divider';
import Dialog from 'primevue/dialog';
import { isSameDate } from '@/utils/date';
import Toolbar from 'primevue/toolbar';
import ScrollPanel from 'primevue/scrollpanel';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useUserStore } from '@/stores/userStore';
import { useBookingStore } from '@/stores/bookingStore';
import type { CourseSession } from '@/types';
import { useRouter } from 'vue-router';
import { UserRole } from '@/enums/User';

// 在 script setup 顶部获取 props
const props = defineProps<{
    courseId: number
}>();

const visible = defineModel<boolean>('visible', { required: true });

const router = useRouter();
const courseStore = useCourseStore();
const userStore = useUserStore();
const bookingStore = useBookingStore();

const toast = useToast();
const confirm = useConfirm();

// 使用 computed 确保 currentCourse 有值
const currentCourse = computed(() => courseStore.currentCourse);
const selectedSlot = computed(() => courseStore.selectedSlot);
const courseSession = computed(() => courseStore.courseSession);
const userPoints = userStore.points;
const userProfile = userStore.profile;

// 监听 visible 和 courseId 属性变化，加载课程详情
watch(
    [() => visible.value, () => props.courseId],
    async ([newVisible, newCourseId]) => {
        if (newVisible && newCourseId && (!currentCourse.value || currentCourse.value.courseId !== newCourseId)) {
            try {
                // 使用新的 bookingStore.loadCourseBookingDetail 方法
                const result = await bookingStore.loadCourseBookingDetail(newCourseId);
                if (!result.success) {
                    toast.add({ 
                        severity: 'error', 
                        summary: '加载失败', 
                        detail: result.message || '加载课程详情失败', 
                        life: 3000 
                    });
                }
            } catch (error) {
                console.error('加载课程详情错误:', error);
                toast.add({ 
                    severity: 'error', 
                    summary: '错误', 
                    detail: '加载课程详情时发生错误',
                    life: 3000 
                });
            }
        }
    },
    { immediate: true }
);

const courseDlg = ref({
    header: {
        padding: '0.5rem 0.5rem 0 0.5rem',
    }
});

// 商家信息展示控制
const responsiveOptions = ref([
    {
        breakpoint: '1300px',
        numVisible: 4
    },
    {
        breakpoint: '575px',
        numVisible: 1
    }
]);

// 日期時間選擇
const selectedDate = ref(new Date());

// 监听 courseSession 变化，设置初始日期
watch(() => courseStore.courseSession, (newVal) => {
    if (newVal && newVal.length > 0) {
        selectedDate.value = newVal[0].date || new Date();
    }
}, { immediate: true });

const filteredTimeSlots = computed(() => {
    if (!courseSession.value || courseSession.value.length === 0) return [];
    return courseSession.value.filter(slot => isSameDate(slot.date, selectedDate.value));
});

// 選擇時段
const selectTimeSlot = (slot: CourseSession) => {
    if (slot.seatsLeft === 0) return;
    console.log(slot);
    
    courseStore.selectSession(slot.id);
};

// 新增計算屬性，檢查是否可以預約
const canBook = computed(() => {
    if (!selectedSlot.value || !currentCourse.value) return false;
    
    if (selectedSlot.value.seatsLeft <= 0) return false;
    
    if (userPoints < currentCourse.value.points) return false;
    
    return true;
});

// 處理預約
const handleBooking = async () => {
    if (!canBook.value || !selectedSlot.value || !selectedDate.value || !currentCourse.value) return;
    
    if (userPoints < currentCourse.value.points) {
        toast.add({ severity: 'error', summary: '點數不足', detail: '請先購買點數', life: 3000 });
        return;
    }

    if (!userProfile?.id) {
        confirm.require({
            message: '請先登入',
            header: '提示',
            acceptLabel: '我要登入',
            rejectLabel: '稍後登入',
            rejectClass: 'p-button-secondary',
            accept: () => {
                router.push('/login')
            },
            reject: () => {
                console.log('reject');
            }
        })
    } else {
        confirm.require({
            message: '確認預約嗎?',
            header: '確認',
            acceptLabel: '確認',
            rejectLabel: '取消',
            rejectClass: 'p-button-secondary',
            accept: async () => {
                if (!currentCourse.value || !selectedSlot.value) return;
                
                const result = await bookingStore.book(
                    currentCourse.value.id,
                    selectedSlot.value.id
                );

                if (result && 'success' in result && result.success) {
                    toast.add({ severity: 'success', summary: '預約成功！', detail: '已成功預約一門課程', life: 3000 });
                    courseStore.selectSession(0);
                } else {
                    toast.add({
                        severity: 'error',
                        summary: '預約失敗',
                        detail: 'reason' in result ? result.reason : '預約失敗，請稍後再試',
                        life: 3000
                    });
                }
            },
            reject: () => {
                console.log('reject');
            }
        });
    }
};

// 收藏相關
const favoriteLoading = ref(false);
const isFavorite = computed(() => {
    if (!currentCourse.value) return false;
    return userStore.isFavorite(currentCourse.value.courseId);
});

// 切換收藏狀態
const toggleFavorite = async () => {
    if (userStore.displayName == UserRole.Guest) {
        // 用戶未登入時的處理
        toast.add({
            severity: 'info',
            summary: '提示',
            detail: '請先登入以使用收藏功能',
            life: 3000
        });
        // 可以選擇導向登入頁面
        // router.push('/login');
        return;
    }

    if (!currentCourse.value) {
        toast.add({
            severity: 'error',
            summary: '錯誤',
            detail: '課程信息不完整，無法收藏',
            life: 3000
        });
        return;
    }

    favoriteLoading.value = true;

    try {
        if (isFavorite.value) {
            // 取消收藏
            const result = await userStore.removeFavorite(currentCourse.value.courseId);
            if (result.success) {
                toast.add({
                    severity: 'success',
                    summary: '成功',
                    detail: result.message,
                    life: 3000
                });
            }
        } else {
            // 添加收藏
            const result = await userStore.addFavorite(currentCourse.value);
            if (result.success) {
                toast.add({
                    severity: 'success',
                    summary: '成功',
                    detail: result.message,
                    life: 3000
                });
            }
        }
    } catch (error) {
        console.error('處理收藏操作時出錯:', error);
        toast.add({
            severity: 'error',
            summary: '錯誤',
            detail: '處理收藏請求時發生錯誤',
            life: 3000
        });
    } finally {
        favoriteLoading.value = false;
    }
};

// 在组件挂载时，如果有 courseId 并且当前没有加载课程或者课程ID与传入ID不同，则加载课程详情
onMounted(async () => {
    if (props.courseId && (!currentCourse.value || currentCourse.value.courseId !== props.courseId)) {
        try {
            // 使用新的 bookingStore.loadCourseBookingDetail 方法
            const result = await bookingStore.loadCourseBookingDetail(props.courseId);
            if (!result.success) {
                toast.add({ 
                    severity: 'error', 
                    summary: '加载失败', 
                    detail: result.message || '加载课程详情失败', 
                    life: 3000 
                });
            }
        } catch (error) {
            console.error('加载课程详情错误:', error);
            toast.add({ 
                severity: 'error', 
                summary: '错误', 
                detail: '加载课程详情时发生错误',
                life: 3000 
            });
        }
    }
});

const shareCourse = () => {
    // navigator.clipboard.writeText(window.location.href);
    toast.add({ severity: 'success', summary: '分享成功！', detail: '已成功分享課程', life: 3000 });
};

// 格式化时间槽显示
const formatTimeSlot = (slot: CourseSession) => {
  return `${slot.start} - ${slot.end}`;
};
</script>
<style>
@reference "tailwindcss";
 
.avaliable-btn {
    @apply px-4 py-3 rounded-lg border cursor-pointer border-gray-300 transition-colors;
}

.avaliable-btn:disabled {
    @apply bg-gray-100 text-gray-500 cursor-not-allowed;
}

.avaliable-btn-selected {
    @apply bg-blue-400 text-white;
}

.avaliable-btn-selected:hover:not(:disabled) {
    @apply bg-blue-500
}

.avaliable-btn:hover:not(.avaliable-btn-selected):not(:disabled) {
    @apply bg-blue-200;
}
</style>@/enums/User