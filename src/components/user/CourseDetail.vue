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
                        <Galleria :value="galleryImages" :responsiveOptions="responsiveOptions" :numVisible="4"
                            :circular="true" containerStyle="width: 100%" :showItemNavigatorsOnHover="true"
                            :showItemNavigators="true">
                            <template #item="slotProps">
                                <img :src="slotProps.item.url" :alt="slotProps.item.alt"
                                    class="w-full h-full object-cover" />
                            </template>
                            <template #thumbnail="slotProps">
                                <img :src="slotProps.item.thumbnailUrl" :alt="slotProps.item.alt" class="block" />
                            </template>
                        </Galleria>
                    </div>

                    <!-- 右側 - 課程信息 -->
                    <div class="flex flex-col space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div class="flex justify-between items-start gap-4">
                            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">{{
                                currentCourse.title }}
                            </h1>
                            <!-- 收藏按鈕 -->
                            <Button rounded text :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
                                :class="{ 'text-red-400!': isFavorite, 'hover:bg-red-50': !isFavorite, 'w-10 h-10': true }"
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
                            <Chip label="熱門活動" class="!bg-orange-100 !text-orange-700 !border-none"
                                v-if="currentCourse.joinCount && currentCourse.joinCount > 10" />
                            <Chip label="新課程" class="!bg-green-100 !text-green-700 !border-none" v-if="isNewCourse" />
                        </div>

                        <div
                            class="flex items-center justify-between p-4 rounded-lg bg-sky-50 border border-sky-100 mt-auto">
                            <div>
                                <p class="text-lg font-medium text-sky-700">
                                    點數: {{ currentCourse.points }} 點
                                </p>
                                <template v-if="useAuthStore().isLoggedIn">
                                    <p class="text-sm text-sky-600">
                                        您目前有 {{ userProfile.points }} 點
                                    </p>
                                </template>
                                <template v-else>
                                    <p class="text-sm text-sky-600">
                                        請先<Button text class="p-0 underline text-sky-600 focus:shadow-none"
                                            @click="showLoginDialog = true">登入</Button>以查看點數
                                    </p>
                                </template>
                            </div>
                            <div class="flex items-center gap-2">
                                <Button icon="pi pi-share-alt" text rounded severity="secondary" @click="shareCourse"
                                    class="hover:bg-sky-100" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 商家信息卡片 -->
                <div v-if="currentCourse?.merchant"
                    class="mb-8 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div class="p-5 border-b border-gray-100 bg-sky-50">
                        <h2 class="text-xl font-semibold text-sky-700 flex items-center">
                            <i class="pi pi-building mr-2"></i>{{ currentCourse.merchant.name }}
                        </h2>
                    </div>
                    <div class="p-5">
                        <p class="text-gray-700 mb-4">{{ currentCourse.merchant.description }}</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <a :href="'https://maps.google.com/?q=' + currentCourse.merchant.address"
                                    target="_blank" class="flex items-center text-sky-600 hover:text-sky-800">
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
                                <span>{{ currentCourse.merchant.bizHours }}</span>
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
                        <!-- 日期範圍選擇 -->
                        <div class="w-full md:w-auto">
                            <DateRangeFilter v-model:startDate="startDate" v-model:endDate="endDate"
                                :showControls="false" :autoApply="true" :defaultRangeDays="7"
                                @change="handleDateRangeChange" />
                        </div>
                    </div>
                    <Divider />

                    <!-- 時間選擇 -->
                    <div class="mt-4">
                        <h3 class="text-lg font-medium text-gray-700 mb-4">可預約時段</h3>
                        <template v-if="groupedTimeSlots.length === 0">
                            <div
                                class="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-gray-100">
                                <i class="pi pi-calendar-times text-4xl text-gray-400 mb-4"></i>
                                <p class="text-gray-600 text-center">
                                    目前沒有可預約時段<br>
                                    <span class="text-sm text-gray-500">請選擇其他日期範圍</span>
                                </p>
                            </div>
                        </template>

                        <!-- 按日期分組顯示時段 -->
                        <div v-else class="space-y-6">
                            <div v-for="group in groupedTimeSlots" :key="group.date" class="bg-gray-50 rounded-lg p-4">
                                <div class="flex items-center mb-4">
                                    <div class="bg-sky-100 rounded-full px-3 py-1 mr-3">
                                        <i class="pi pi-calendar text-sky-600 mr-1"></i>
                                        <span class="text-sky-700 font-medium text-sm">
                                            {{ formatDateHeader(group.date) }}
                                        </span>
                                    </div>
                                    <div class="text-gray-500 text-sm">
                                        {{ group.slots.length }} 個時段可預約
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div v-for="slot in group.slots" :key="slot.id" :class="[
                                        'time-slot-card relative transition-all duration-200',
                                        {
                                            'time-slot-card-selected': selectedSession?.id === slot.id && !isSessionBooked(slot.id),
                                            'time-slot-card-booked': isSessionBooked(slot.id),
                                            'time-slot-card-disabled': slot.seatsLeft === 0 && !isSessionBooked(slot.id),
                                            'cursor-not-allowed': slot.seatsLeft === 0 && !isSessionBooked(slot.id),
                                            'cursor-pointer': slot.seatsLeft > 0 || isSessionBooked(slot.id)
                                        }
                                    ]"
                                        @click="slot.seatsLeft > 0 && !isSessionBooked(slot.id) ? selectTimeSlot(slot) : null">

                                        <!-- 講師頭像區域 -->
                                        <div class="flex items-center gap-3 mb-2">
                                            <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                                <img v-if="getInstructorInfo(slot).avatarUrl && getInstructorInfo(slot).avatarUrl?.trim() !== ''"
                                                    :src="getInstructorInfo(slot).avatarUrl"
                                                    :alt="getInstructorInfo(slot).name"
                                                    class="w-full h-full object-cover bg-gray-200"
                                                    @error="(e) => handleImageError(e, slot.id)">
                                                <div v-else
                                                    class="w-full h-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
                                                    <i class="pi pi-user text-white text-sm"></i>
                                                </div>
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <div class="font-medium text-gray-800 text-sm truncate">
                                                    {{ getInstructorInfo(slot).name }}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 時間資訊 -->
                                        <div class="bg-white p-2 mb-1 rounded-lg">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-clock text-sky-600 text-sm"></i>
                                                    <span class="font-medium text-gray-800">
                                                        {{ formatTime(slot.start) }}
                                                    </span>
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    {{ calculateDuration(slot.start, slot.end) }} 分鐘
                                                </div>
                                            </div>
                                            <div class="text-xs text-gray-500 mt-1">
                                                至 {{ formatTime(slot.end) }}
                                            </div>
                                        </div>

                                        <!-- 座位資訊 -->
                                        <div class="flex items-center justify-between mb-3">
                                            <div class="flex items-center gap-2">
                                                <i class="pi pi-users text-gray-500 text-sm"></i>
                                                <span class="text-sm text-gray-600">
                                                    {{ slot.seats - slot.seatsLeft }}/{{ slot.seats }}
                                                </span>
                                            </div>
                                            <!-- 狀態標籤 -->
                                            <div v-if="isSessionBooked(slot.id)"
                                                class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                                已預約
                                            </div>
                                            <div v-else-if="slot.seatsLeft === 0"
                                                class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                                                已滿
                                            </div>
                                            <div v-else-if="slot.seatsLeft <= 3"
                                                class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                                                即將額滿
                                            </div>
                                        </div>

                                        <!-- 已預約時顯示取消預約按鈕 -->
                                        <div v-if="isSessionBooked(slot.id)" class="mt-2">
                                            <Button label="取消預約" icon="pi pi-times" size="small" severity="danger"
                                                outlined @click.stop="confirmCancelBooking(getSessionBooking(slot.id))"
                                                class="w-full text-xs py-1" :loading="bookingStore.loading" />
                                        </div>

                                        <!-- 選中狀態指示器 -->
                                        <div v-if="selectedSession?.id === slot.id && !isSessionBooked(slot.id)"
                                            class="absolute top-2 right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                                            <i class="pi pi-check text-white text-xs"></i>
                                        </div>

                                        <!-- 已預約狀態指示器 -->
                                        <div v-if="isSessionBooked(slot.id)"
                                            class="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <i class="pi pi-bookmark text-white text-xs"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="w-full bg-white border-t border-gray-200 p-3">
                <div class="container mx-auto flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <Button text rounded :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" :class="{
                            'text-red-400!': isFavorite,
                            'hover:bg-red-50': !isFavorite
                        }" @click="toggleFavorite" :loading="favoriteLoading" aria-label="收藏課程" />
                        <Button text rounded icon="pi pi-share-alt" class="hover:bg-sky-50" @click="shareCourse" />
                    </div>
                    <div class="text-lg font-bold text-gray-800">
                        <p v-if="selectedSession">
                            已選擇: {{ formatDate(selectedSession.date) }} {{ formatTimeSlot(selectedSession) }}
                        </p>
                        <p v-else>
                            請選擇預約時段
                        </p>
                    </div>
                    <div>
                        <ConfirmDialog id="confirm" style="width: 450px;" />
                        <Button @click="handleBooking" :disabled="!canBook"
                            class="booking-btn px-6 py-2 text-white transition-all" :class="{
                                'bg-sky-600 hover:bg-sky-700': canBook,
                                'bg-gray-400': !canBook
                            }">
                            <span class="font-medium">
                                {{ bookingButtonText }}
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
import Divider from 'primevue/divider';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { useUserStore } from '@/stores/userStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import type { CourseSession } from '@/types';
import { useRouter } from 'vue-router';
import { UserRole } from '@/enums/User';
import { showSuccess, showError, showInfo, initToast } from '@/utils/toastHelper';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';
import { inject, type Ref } from 'vue';
import { BookingStatus } from '@/enums';
import type { Booking } from '@/types';
import { formatDate, formatTime } from '@/utils/dateUtils';

const props = defineProps<{
    courseId: number
}>();

const visible = defineModel<boolean>('visible', { required: true });
const showLoginDialog = inject('showLoginDialog') as Ref<boolean>;
const router = useRouter();
const courseStore = useCourseStore();
const userStore = useUserStore();
const bookingStore = useBookingStore();
const toast = useToast();
const confirm = useConfirm();
const selectedSession = ref<CourseSession | null>(null);

// 使用 computed 確保 currentCourse 有值
const { currentCourse, courseSession } = storeToRefs(courseStore);
const { user: userProfile } = storeToRefs(userStore);
const selectedDate = ref(new Date());

// 日期範圍
const startDate = ref(new Date(Date.now()));
const endDate = ref(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 默认7天后


// 在組件掛載時，如果有 courseId 并且當前沒有加載課程或者課程ID與傳入ID不同，則加載課程詳情
onMounted(async () => {
    initToast(toast);
});

// 用戶預約狀態管理
const userBookings = computed(() => bookingStore.bookings);

// 檢查特定時段是否已被用戶預約
const isSessionBooked = (sessionId: number): boolean => {
    if (!userBookings.value || userBookings.value.length === 0) return false;
    return userBookings.value.some((booking: Booking) =>
        booking.sessionId === sessionId
    );
};

// 獲取特定時段的預約信息
const getSessionBooking = (sessionId: number): Booking | undefined => {
    return userBookings.value.find((booking: Booking) =>
        booking.sessionId === sessionId
    );
};

// 加載用戶預約狀態
const loadUserBookings = async () => {
    if (!useAuthStore().isLoggedIn || !userProfile.value?.id) {
        return;
    }
    const dateRange = startDate.value.toISOString() + '~' + endDate.value.toISOString();
    const result = await bookingStore.fetchBookings({ status: BookingStatus.Confirmed, courseId: props.courseId.toString(), dateRange: dateRange });
    if (!result.success) {
        showError(result.message || '載入預約狀態失敗', '載入失敗');
    }
};

// 取消預約
const cancelBooking = async (booking: Booking) => {
    if (!booking) return;
    try {
        const result = await bookingStore.cancel(booking.id);
        if (result && 'success' in result && result.success) {
            showSuccess(result.message || '預約已成功取消', '取消成功');
            // 重新載入預約狀態
            await loadUserBookings();
            // 如果當前選中的是被取消的時段，清除選擇
            if (selectedSession.value?.id === booking.sessionId) {
                selectedSession.value = null;
            }
        } else {
            showError(result.message || '取消預約失敗，請稍後再試', '取消失敗');
        }
    } catch (error) {
        console.error('取消預約錯誤:', error);
        showError('取消預約時發生錯誤', '錯誤');
    }
};

// 確認取消預約
const confirmCancelBooking = (booking: any) => {
    confirm.require({
        message: `確定要取消此預約嗎？\n時間：${formatTimeSlot(booking)}`,
        header: '確認取消預約',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: '確認取消',
        rejectLabel: '保留預約',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary',
        accept: () => {
            cancelBooking(booking);
        }
    });
};

// 添加一個新的計算屬性來安全處理商家評分
const merchantRating = computed(() => {
    return currentCourse.value?.merchant?.rating || 0;
});

// 處理圖片格式以適配 Galleria 組件
const galleryImages = computed(() => {
    if (!currentCourse.value || !currentCourse.value.images) return [];

    return currentCourse.value.images
});

// 監聽 visible 和 courseId 屬性變化
watch(
    [() => visible.value, () => props.courseId],
    async ([newVisible, newCourseId]) => {
        if (newVisible && newCourseId && (!currentCourse.value || currentCourse.value.id !== newCourseId)) {
            try {
                const result = await courseStore.loadCourseDetail(newCourseId);
                if (result.success) {
                    // 課程載入成功後，載入用戶預約狀態
                    await loadUserBookings();
                } else {
                    showError(result.message || '加載課程詳情失敗', '加載失敗');
                }
            } catch (error) {
                console.error('加載課程詳情錯誤:', error);
                showError('加載課程詳情時發生錯誤', '錯誤');
            }
        } else if (newVisible && newCourseId && currentCourse.value && currentCourse.value.id === newCourseId) {
            // 如果課程已經載入，只需要載入預約狀態
            await loadUserBookings();
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
        breakpoint: '1200px',
        numVisible: 3
    },
    {
        breakpoint: '575px',
        numVisible: 2
    }
]);


// 處理日期範圍變更
const handleDateRangeChange = (dateRange: { start: Date; end: Date }) => {
    startDate.value = dateRange.start;
    endDate.value = dateRange.end;
};

// 計算課程時長
const calculateDuration = (start: Date | string, end: Date | string): number => {
    const parseTime = (time: Date | string): Date => {
        if (time instanceof Date) return time;
        return new Date(time);
    };
    const startTime = parseTime(start);
    const endTime = parseTime(end);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return 60; // 默认60分钟
    }
    const diffTime = Math.abs(endTime.getTime() - startTime.getTime());
    return Math.ceil(diffTime / (1000 * 60));
};

// 過濾在日期範圍內的時段
const groupedTimeSlots = computed(() => {
    if (!courseSession.value || courseSession.value.length === 0) return [];

    // 过滤在日期范围内的时段
    const filteredSlots = courseSession.value.filter(slot => {
        if (!slot.date || !startDate.value || !endDate.value) return false;

        const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
        return slotDate >= startDate.value && slotDate <= endDate.value;
    });

    // 按日期分组
    const grouped: { [date: string]: CourseSession[] } = {};

    filteredSlots.forEach(slot => {
        const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
        const dateKey = slotDate.toDateString(); // 使用 toDateString 作为 key

        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(slot);
    });

    // 转换为数组并排序
    return Object.entries(grouped)
        .map(([dateKey, slots]) => ({
            date: dateKey,
            slots: slots.sort((a, b) => {
                const aStart = typeof a.start === 'string' ? new Date(a.start).getTime() : a.start;
                const bStart = typeof b.start === 'string' ? new Date(b.start).getTime() : b.start;
                return aStart < bStart ? -1 : 1;
            })
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

// 默認講師信息
const getInstructorInfo = (slot: CourseSession) => {
    // 默认讲师信息
    const defaultInfo = {
        name: '專業講師',
        avatarUrl: undefined as string | undefined,
        bio: undefined as string | undefined
    };

    if (!currentCourse.value || !slot.instructorId) {
        return defaultInfo;
    }

    return {
        name: slot.instructorName,
        avatarUrl: slot.instructorAvatar,
        bio: undefined as string | undefined
    };
};

const handleImageError = (event: Event, slotId: number) => {
    const target = event.target as HTMLImageElement;
    if (target?.parentNode) {
        // 隐藏图片并显示默认图标
        target.style.display = 'none';
        console.warn(`講師頭像載入失敗，時段ID: ${slotId}`);
    }
};

// 格式化時間槽顯示（用於底部顯示）
const formatTimeSlot = (slot: CourseSession): string => {
    if (!slot) return '';
    if (slot.start.includes('T')) {
        return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
    }
    return `${slot.start} - ${slot.end}`;
};

const isNewCourse = computed(() => {
    if (!currentCourse.value?.createdAt) return false;
    const now = new Date();
    const createdDate = new Date(currentCourse.value.createdAt);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // 7天內的新課程
});


// 新增計算屬性，檢查是否可以預約
const canBook = computed(() => {
    if (!selectedSession.value || !currentCourse.value) return false;

    // 檢查是否已經預約了該時段
    if (isSessionBooked(selectedSession.value.id)) return false;

    if (selectedSession.value.seatsLeft <= 0) return false;


    if (userProfile.value?.points < currentCourse.value.points) return false;

    return true;
});

// 預約按鈕文字
const bookingButtonText = computed(() => {
    if (!selectedSession.value) {
        return '請選擇時段';
    }

    if (isSessionBooked(selectedSession.value.id)) {
        return '已預約此時段';
    }

    if (selectedSession.value.seatsLeft <= 0) {
        return '該時段已滿';
    }

    if (!useAuthStore().isLoggedIn) {
        return '請先登入';
    }

    if (!currentCourse.value || userProfile.value?.points < currentCourse.value.points) {
        return '點數不足';
    }

    return '立即預約';
});

// 處理預約
const handleBooking = async () => {
    if (!canBook.value || !selectedSession.value || !selectedDate.value || !currentCourse.value) return;

    if (userProfile.value?.points < currentCourse.value.points) {
        showError('請先購買點數', '點數不足');
        return;
    }

    if (!userProfile.value?.id) {
        confirm.require({
            message: '請先登入',
            header: '提示',
            acceptLabel: '我要登入',
            rejectLabel: '稍後登入',
            rejectClass: 'p-button-secondary',
            accept: () => {
                showLoginDialog.value = true;
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
                    selectedSession.value = null;
                    // 重新載入用戶預約狀態
                    await loadUserBookings();
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

const isFavorite = computed(() => currentCourse.value?.isFavorite || false);

// 切換收藏狀態
const toggleFavorite = async () => {
    if (!currentCourse.value) {
        console.error('toggleFavorite: currentCourse 為空');
        showError('課程資料未載入', '錯誤');
        return;
    }

    if (!currentCourse.value.id) {
        console.error('toggleFavorite: currentCourse.id 為空', currentCourse.value);
        showError('課程ID無效', '錯誤');
        return;
    }

    if (userStore.user.role === UserRole.Guest) {
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
        const result = await courseStore.toggleFavoriteCourse(currentCourse.value.id);
        if (result) {
            if (isFavorite.value) {
                showSuccess(result.message || '已從收藏中移除', '成功');
                currentCourse.value.isFavorite = false;
            } else {
                showSuccess(result.message || '已加入收藏', '成功');
                currentCourse.value.isFavorite = true;
            }
        }
    } catch (error) {
        showError('操作失敗，請稍後再試', '錯誤');
        console.error('收藏操作失敗:', error);
    } finally {
        favoriteLoading.value = false;
    }
};


const shareCourse = () => {
    showSuccess('已成功分享課程', '分享成功！');
};

// 格式化日期標題
const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
};

// 選擇時段
const selectTimeSlot = (slot: CourseSession) => {
    // 如果時段已滿或已被預約，不允許選擇
    if (slot.seatsLeft === 0 || isSessionBooked(slot.id)) return;

    // 直接使用傳入的 slot，而不是重新查找
    selectedSession.value = slot;
};
</script>

<style>
@reference "tailwindcss";

.time-slot-btn {
    @apply px-4 py-3 rounded-lg border cursor-pointer border-gray-300 transition-all flex flex-col items-center justify-center bg-white hover:shadow-md;
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

/* 新的時段卡片樣式 */
.time-slot-card {
    @apply relative bg-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-sky-300;
}

.time-slot-card:hover {
    @apply transform -translate-y-1;
}

.time-slot-card:disabled,
.time-slot-card[disabled] {
    @apply bg-gray-50 text-gray-400 cursor-not-allowed hover:shadow-none border-gray-200 hover:transform-none;
}

.time-slot-card-selected {
    @apply bg-sky-50 border-sky-500 shadow-lg;
}

.time-slot-card-selected:hover {
    @apply bg-sky-100 border-sky-600;
}

/* 已預約時段樣式 */
.time-slot-card-booked {
    @apply bg-green-50 border-green-300 shadow-md cursor-default;
}

.time-slot-card-booked:hover {
    @apply bg-green-100 border-green-400 transform-none;
}

/* 已滿/禁用時段樣式 */
.time-slot-card-disabled {
    @apply bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed;
}

.time-slot-card-disabled:hover {
    @apply transform-none shadow-none border-gray-200;
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