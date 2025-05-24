<template>
    <Dialog v-model:visible="visible" :modal="true" :draggable="false" :resizable="false" :closable="true"
        :style="{ maxWidth: '90vw', width: '1200px' }" class="p-0 course-detail-dialog">
        <Toast />
        <template #header>
                <h1 class="text-xl font-medium text-gray-800">
                    課程詳情
                </h1>
        </template>
        
        <div class="overflow-y-auto">
            <div v-if="currentCourse" class="sm:p-3">
                <!-- 課程頂部信息 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- 左側 - 課程圖片 -->
                    <div class="overflow-hidden rounded-xl shadow-sm">
                        <Galleria :value="galleryImages" :responsiveOptions="responsiveOptions" :numVisible="4" :circular="true"
                            containerStyle="width: 100%" :showItemNavigatorsOnHover="true" :showItemNavigators="true">
                            <template #item="slotProps">
                                <img :src="slotProps.item.imageSrc" :alt="slotProps.item.alt" class="w-full h-full object-cover" />
                            </template>
                            <template #thumbnail="slotProps">
                                <img :src="slotProps.item.thumbnail" :alt="slotProps.item.alt" class="block" />
                            </template>
                        </Galleria>
                    </div>

                    <!-- 右側 - 課程信息 -->
                    <div class="flex flex-col space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div class="flex justify-between items-start gap-4">
                            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">{{ currentCourse.title }}</h1>
                            <!-- 收藏按鈕 -->
                            <Button rounded text 
                                :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" 
                                :class="{ 'text-red-500': isFavorite, 'hover:bg-red-50': !isFavorite, 'w-10 h-10': true }"
                                @click="toggleFavorite" :loading="favoriteLoading" aria-label="收藏課程" />
                        </div>
                        
                        <div class="flex items-center gap-2 bg-sky-50 p-3 rounded-lg">
                                <div class="flex items-center">
                                    <Rating :modelValue="merchantRating" readonly :cancel="false" 
                                        :pt="{ onIcon: { class: 'text-amber-400' } }" />
                                    <span class="ml-2 text-sky-700 font-medium">
                                        {{ merchantRating.toFixed(1) }}
                                    </span>
                                </div>
                                <span class="text-sm text-sky-600">
                                    {{ currentCourse.merchant?.reviewCount || 0 }} 則評價
                                </span>
                        </div>
                        
                        <div class="mt-4 flex-grow">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">課程介紹</h3>
                            <p class="text-gray-700 whitespace-pre-line p-4 ">
                                {{ currentCourse.description }}
                            </p>
                        </div>
                        
                        <div class="flex flex-wrap gap-2 mt-4">
                            <Chip label="即將開始" class="!bg-sky-100 !text-sky-700 !border-none" />
                            <Chip label="熱門活動" class="!bg-orange-100 !text-orange-700 !border-none" v-if="currentCourse.joinCount && currentCourse.joinCount > 10" />
                            <Chip label="新課程" class="!bg-green-100 !text-green-700 !border-none" v-if="isNewCourse" />
                        </div>
                        
                        <div v-if="userProfile" class="flex items-center justify-between p-4 rounded-lg bg-sky-50 border border-sky-100 mt-auto">
                            <div>
                                <p class="text-lg font-medium text-sky-700">
                                    點數: {{ currentCourse.points }} 點
                                </p>
                                <p class="text-sm text-sky-600">
                                    您目前有 {{ userPoints }} 點
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <Button icon="pi pi-share-alt" text rounded severity="secondary"
                                    @click="shareCourse" class="hover:bg-sky-100" />
                            </div>
                        </div>
                        <div v-else class="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                            <p class="text-gray-700">
                                請先<Button text class="p-0 underline text-sky-600 focus:shadow-none" @click="router.push('/login')">登入</Button>以查看點數
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 商家信息卡片 -->
                <div v-if="currentCourse?.merchant" class="mb-8 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div class="p-5 border-b border-gray-100 bg-sky-50">
                        <h2 class="text-xl font-semibold text-sky-700 flex items-center">
                            <i class="pi pi-building mr-2"></i>{{ currentCourse.merchant.name }}
                        </h2>
                    </div>
                    <div class="p-5">
                        <p class="text-gray-700 mb-4">{{ currentCourse.merchant.description }}</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <a :href="'https://maps.google.com/?q=' + currentCourse.merchant.address" target="_blank"
                                    class="flex items-center text-sky-600 hover:text-sky-800">
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
                                <span>{{ '營業時間：9:00-21:00' }}</span>
                            </div>
                            <div class="flex items-center">
                                <i class="pi pi-tag mr-2"></i>
                                <span>{{ currentCourse.merchant.description ? '商家服務' : '其他' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 預約區塊 -->
                <div v-if="currentCourse" class="bg-white rounded-xl shadow-sm p-6 1border border-gray-100">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h2 class="text-xl font-semibold text-sky-700 flex items-center">
                            <i class="pi pi-calendar mr-2"></i>選擇預約時間
                        </h2>
                        <!-- 日期選擇 -->
                        <div class="w-full md:w-auto">
                            <DatePicker v-model="selectedDate" inputId="date" showIcon iconDisplay="input"
                                variant="filled" class="w-full md:w-64" placeholder="選擇日期"
                                :pt="{
                                    input: { class: 'border border-gray-300 rounded-lg p-3 hover:border-sky-500 focus:border-sky-500' },
                                    root: { class: 'w-full' }
                                }" />
                        </div>
                    </div>
                    <Divider />
                    <!-- 時間選擇 -->
                    <div class="mt-4">
                        <h3 class="text-lg font-medium text-gray-700 mb-4">可預約時段</h3>
                        <template v-if="filteredTimeSlots.length === 0">
                            <div class="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-gray-100">
                                <i class="pi pi-calendar-times text-4xl text-gray-400 mb-4"></i>
                                <p class="text-gray-600 text-center">
                                    目前沒有可預約時段<br>
                                    <span class="text-sm text-gray-500">請選擇其他日期</span>
                                </p>
                            </div>
                        </template>
                        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            <button v-for="slot in filteredTimeSlots" :key="slot.id"
                                :class="['time-slot-btn', { 'time-slot-selected': selectedSession?.id === slot.id }]"
                                :disabled="slot.seatsLeft === 0" @click="selectTimeSlot(slot)">
                                <span class="text-base font-medium">{{ formatTimeSlot(slot) }}</span>
                                <span class="block text-xs mt-1">
                                    剩餘: {{ slot.seatsLeft }}/{{ slot.seats }}
                                </span>
                                <span v-if="slot.seatsLeft === 0" class="text-xs mt-1 font-medium text-red-500">
                                    已滿
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="w-full bg-white border-t border-gray-200 p-3">
                <div class="container mx-auto flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <Button text rounded 
                            :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" 
                            :class="{
                                'text-red-600': isFavorite,
                                'hover:bg-red-50': !isFavorite
                            }" @click="toggleFavorite" :loading="favoriteLoading" aria-label="收藏課程" />
                        <Button text rounded icon="pi pi-share-alt" class="hover:bg-sky-50"
                            @click="shareCourse" />
                    </div>
                    <div class="text-lg font-bold text-gray-800">
                        <p v-if="selectedSession">
                            已選擇: {{ selectedSession.date.toLocaleDateString() }} {{ formatTimeSlot(selectedSession) }}
                        </p>
                        <p v-else>
                            請選擇預約時段
                        </p>
                    </div>
                    <div>
                        <ConfirmDialog id="confirm" style="width: 450px;" />
                        <Button @click="handleBooking" :disabled="!canBook"
                            class="booking-btn px-6 py-2 text-white transition-all"
                            :class="{
                                'bg-sky-600 hover:bg-sky-700': canBook,
                                'bg-gray-400': !canBook
                            }">
                            <span class="font-medium">
                                {{
                                    !selectedSession
                                        ? '請選擇時段'
                                        : !currentCourse || userPoints < (currentCourse.points) ? '點數不足' : '立即預約' 
                                }}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCourseStore } from '@/stores/courseStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm';
import Rating from 'primevue/rating';
import Chip from 'primevue/chip';
import Galleria from 'primevue/galleria';
import DatePicker from 'primevue/datepicker';
import Divider from 'primevue/divider';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { isSameDate } from '@/utils/dateUtils';
import { useUserStore } from '@/stores/userStore';
import { useBookingStore } from '@/stores/bookingStore';
import type { CourseSession, Result } from '@/types';
import { useRouter } from 'vue-router';
import { UserRole } from '@/enums/User';
import { showSuccess, showError, showInfo, initToast } from '@/utils/toastHelper';

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
const { currentCourse, selectedSession, courseSession } = storeToRefs(courseStore);
const { points: userPoints, profile: userProfile } = storeToRefs(userStore);

// 添加一個新的計算屬性來安全處理商家評分
const merchantRating = computed(() => {
    return currentCourse.value?.merchant?.rating || 0;
});

// 處理圖片格式以適配 Galleria 組件
const galleryImages = computed(() => {
    if (!currentCourse.value || !currentCourse.value.images) return [];

    return currentCourse.value.images
});

// 监听 visible 和 courseId 属性变化，加载课程详情
watch(
    [() => visible.value, () => props.courseId],
    async ([newVisible, newCourseId]) => {
        if (newVisible && newCourseId && (!currentCourse.value || currentCourse.value.id !== newCourseId)) {
            try {
                // 使用新的 bookingStore.loadCourseBookingDetail 方法
                const result = await bookingStore.loadCourseBookingDetail(newCourseId);
                if (!result.success) {
                    showError(result.message || '加载课程详情失败', '加载失败');
                }
            } catch (error) {
                console.error('加载课程详情错误:', error);
                showError('加载课程详情时发生错误', '错误');
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
        numVisible: 3
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

    return courseSession.value.filter(slot => {
        if (!slot.date || !selectedDate.value) return false;
        return isSameDate(
            slot.date instanceof Date ? slot.date : new Date(slot.date),
            selectedDate.value
        );
    });
});

// 選擇時段
const selectTimeSlot = (slot: CourseSession) => {
    if (slot.seatsLeft === 0) return;
    console.log(slot);

    courseStore.selectSession(slot.id);
};

// 新增計算屬性，檢查是否可以預約
const canBook = computed(() => {
    if (!selectedSession.value || !currentCourse.value) return false;

    if (selectedSession.value.seatsLeft <= 0) return false;

    if (userPoints.value < currentCourse.value.points) return false;

    return true;
});

// 處理預約
const handleBooking = async () => {
    if (!canBook.value || !selectedSession.value || !selectedDate.value || !currentCourse.value) return;

    if (userPoints.value < currentCourse.value.points) {
        showError('請先購買點數', '點數不足');
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
                if (!currentCourse.value || !selectedSession.value) return;

                const result = await bookingStore.book(
                    currentCourse.value.id,
                    selectedSession.value.id
                );

                if (result && 'success' in result && result.success) {
                    showSuccess('已成功預約一門課程', '預約成功！');
                    courseStore.selectSession(0);
                } else {
                    // 確保傳遞的是字串型別
                    const errorMessage = result && 'reason' in result && typeof result.reason === 'string'
                        ? result.reason
                        : '預約失敗，請稍後再試';
                    showError(errorMessage, '預約失敗');
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
    return courseStore.isFavorite(currentCourse.value.id);
});

// 切換收藏狀態
const toggleFavorite = async () => {
    if (!currentCourse.value) return;
    
    if (userStore.displayName === UserRole.Guest) {
        // 用戶未登入時的處理
        showInfo('請先登入以使用收藏功能', '提示');
        return;
    }

    const userId = userStore.userId;
    if (!userId) {
        showError('用戶資料未載入', '錯誤');
        return;
    }

    favoriteLoading.value = true;
    try {
        if (isFavorite.value) {
            // 取消收藏
            await courseStore.removeFavoriteCourse(currentCourse.value.id, userId);
            showSuccess('已從收藏中移除', '成功');
        } else {
            // 添加收藏
            await courseStore.addFavoriteCourse(currentCourse.value.id, userId);
            showSuccess('已加入收藏', '成功');
        }
    } catch (error) {
        showError('操作失敗，請稍後再試', '錯誤');
        console.error('收藏操作失敗:', error);
    } finally {
        favoriteLoading.value = false;
    }
};

// 在组件挂载时，如果有 courseId 并且当前没有加载课程或者课程ID与传入ID不同，则加载课程详情
onMounted(async () => {
    // 初始化 toast
    initToast(toast);

    if (props.courseId && (!currentCourse.value || currentCourse.value.id !== props.courseId)) {
        try {
            // 使用新的 bookingStore.loadCourseBookingDetail 方法
            const result = await bookingStore.loadCourseBookingDetail(props.courseId);
            if (!result.success) {
                showError(result.message || '加载课程详情失败', '加载失败');
            }
        } catch (error) {
            console.error('加载课程详情错误:', error);
            showError('加载课程详情时发生错误', '错误');
        }
    }
});

const shareCourse = () => {
    // navigator.clipboard.writeText(window.location.href);
    showSuccess('已成功分享課程', '分享成功！');
};

// 格式化时间槽显示
const formatTimeSlot = (slot: CourseSession) => {
    if (!slot) return '';

    // 處理不同類型的時間格式
    const formatTime = (time: Date | string) => {
        if (typeof time === 'string') {
            // 尝试将字符串解析为日期
            try {
                // 检查是否只有时间部分（例如 "14:30"）
                if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
                    // 如果是时间字符串，直接返回
                    return time;
                }

                const date = new Date(time);
                if (isNaN(date.getTime())) {
                    console.error('无效时间字符串:', time);
                    return time; // 返回原始字符串
                }
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (error) {
                console.error('时间格式化错误:', error);
                return time; // 返回原始字符串
            }
        }
        if (time instanceof Date) {
            if (isNaN(time.getTime())) {
                console.error('无效时间对象:', time);
                return '时间无效';
            }
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return '';
    };

    return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
};

const isNewCourse = computed(() => {
    if (!currentCourse.value?.createdAt) return false;
    const now = new Date();
    const createdDate = new Date(currentCourse.value.createdAt);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // 7天內的新課程
});
</script>

<style>
@reference "tailwindcss";

.time-slot-btn {
    @apply px-4 py-3 rounded-lg border cursor-pointer border-gray-300 transition-all 
           flex flex-col items-center justify-center bg-white hover:shadow-md;
}

.time-slot-btn:disabled {
    @apply bg-gray-50 text-gray-400 cursor-not-allowed hover:shadow-none border-gray-200;
}

.time-slot-selected {
    @apply bg-sky-500 text-white border-sky-500;
}

.time-slot-selected:hover:not(:disabled) {
    @apply bg-sky-600 border-sky-600 shadow-lg;
}

.time-slot-btn:hover:not(.time-slot-selected):not(:disabled) {
    @apply bg-sky-50 border-sky-300;
}

.fixed-booking-bar {
    @apply fixed bottom-0 left-0 right-0 bg-white z-10 py-4 border-t border-gray-200 shadow-lg;
}

.booking-btn {
    @apply min-w-[140px] transition-all;
}

.booking-btn:not(:disabled):hover {
    @apply transform -translate-y-1;
}


</style>