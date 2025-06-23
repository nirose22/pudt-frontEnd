<template>
    <Dialog v-model:visible="showDetailDialog" :header="selectedBooking?.courseTitle || '預約詳情'" :modal="true"
        :closable="true" :style="{ width: '500px' }" :contentStyle="{ 'background-color': '#f8fafc' }">
        <div v-if="selectedBooking" class="space-y-4">
            <div class="p-3 border rounded-lg bg-white border-sky-100">
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">課程名稱：</span>
                    <span class="font-medium text-sky-700">{{ selectedBooking.courseTitle }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">日期：</span>
                    <span>{{ selectedBooking.date }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">時間：</span>
                    <span>{{ selectedBooking.start }} - {{ selectedBooking.end }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">地點：</span>
                    <span>{{ selectedBooking.merchantName }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">講師：</span>
                    <span>{{ selectedBooking.instructor?.name }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">點數：</span>
                    <span class="font-bold text-sky-600">{{ selectedBooking.points }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">狀態：</span>
                    <Tag :severity="getBookingStatusSeverity(selectedBooking.status)"
                        :value="getBookingStatusLabel(selectedBooking.status)" />
                </div>
            </div>

            <!-- 講師資訊 -->
            <div v-if="selectedBooking.instructor" class="p-3 border rounded-lg border-sky-100 bg-white">
                <h3 class="font-medium mb-2 text-sky-700">講師資訊</h3>
                <div class="flex items-center gap-3">
                    <Avatar v-if="selectedBooking.instructor.avatar" :image="selectedBooking.instructor.avatar"
                        shape="circle" size="large" class="!bg-sky-100 !text-sky-700" />
                    <Avatar v-else :label="selectedBooking.instructor.name.charAt(0)" shape="circle" size="large"
                        class="!bg-sky-100 !text-sky-700" />
                    <div>
                        <div class="font-medium">{{ selectedBooking.instructor.name }}</div>
                    </div>
                </div>
            </div>

            <!-- 注意事項 -->
            <div class="p-3 border rounded-lg bg-sky-50 border-sky-100">
                <h3 class="font-medium mb-2 flex items-center text-sky-700">
                    <i class="pi pi-info-circle mr-2 text-sky-500"></i>
                    課程注意事項
                </h3>
                <ul class="list-disc pl-5 text-sm text-gray-600">
                    <li>請提前 15 分鐘到達教室</li>
                    <li>請攜帶個人用品（如瑜珈墊、毛巾等）</li>
                    <li>如需取消預約，請至少提前 24 小時</li>
                    <li>遲到超過 15 分鐘將無法參與課程</li>
                </ul>
            </div>
        </div>
        <template #footer>
            <Button label="關閉" icon="pi pi-times" @click="showDetailDialog = false" outlined
                class="!border-gray-300 !text-gray-700" />
            <Button v-if="selectedBooking && canCancel(selectedBooking)" label="取消預約" icon="pi pi-times"
                severity="danger" @click="confirmCancelSelectedBooking" />
            <Button v-if="selectedBooking && canCancel(selectedBooking)" label="加入行事曆" icon="pi pi-calendar-plus"
                @click="addToCalendar" class="!bg-sky-500 !border-sky-500" />
        </template>
    </Dialog>
    <CancelBookingDialog v-model:showCancelDialog="showCancelDialog" v-model:selectedBooking="selectedBooking"
        @cancel="cancelBooking" />
    <!-- 行事曆同步對話框 -->
    <CalendarSyncDialog v-model:visible="showCalendarSyncDialog" :booking-data="selectedBookingForCalendar" />
</template>

<script setup lang="ts">
import type { Booking } from '@/types';
import { BookingStatus } from '@/enums';
import { getBookingStatusSeverity, getBookingStatusLabel } from '@/utils/statusUtil';
import Avatar from 'primevue/avatar';
import CancelBookingDialog from '@/components/user/CancelBookingDialog.vue';
import Tag from 'primevue/tag';
import { ref } from 'vue';
import CalendarSyncDialog from '@/components/common/CalendarSyncDialog.vue';

const showDetailDialog = defineModel<boolean>('showDetailDialog', { required: true });
const selectedBooking = defineModel<Booking>('selectedBooking', { required: true });
const showCancelDialog = ref(false);
const showCalendarSyncDialog = ref(false);
const selectedBookingForCalendar = ref<any>(null);
const emit = defineEmits(['addToCalendar', 'refresh']);

// 是否可以取消预约
const canCancel = (booking: Booking) => {
    return booking.status === BookingStatus.Pending ||
        booking.status === BookingStatus.Confirmed;
};

// 确认取消选中的预约
function confirmCancelSelectedBooking(): void {
    if (selectedBooking.value) {
        showCancelDialog.value = true;
    }
}

const cancelBooking = () => {
    emit('refresh');
}

// 添加到行事曆
function addToCalendar(): void {
    if (selectedBooking.value) {
        selectedBookingForCalendar.value = {
            id: selectedBooking.value.id,
            courseTitle: selectedBooking.value.courseTitle || `預約 #${selectedBooking.value.id}`,
            start: `${selectedBooking.value.date || selectedBooking.value.createdAt}T${selectedBooking.value.start || '09:00'}:00`,
            end: `${selectedBooking.value.date || selectedBooking.value.createdAt}T${selectedBooking.value.end || '10:00'}:00`,
            merchantName: selectedBooking.value.merchantName
        };
        showCalendarSyncDialog.value = true;
    }
}

</script>
