<template>
    <div class="flex flex-col flex-1 overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">預約行程管理</h2>

        <!-- 視圖切換按鈕 -->
        <div class="flex">
            <ButtonGroup class="h-10">
                <Button :class="{ 'p-button-outlined': viewMode !== 'list' }" icon="pi pi-list" label="列表"
                    @click="viewMode = 'list'" />
                <Button :class="{ 'p-button-outlined': viewMode !== 'calendar' }" icon="pi pi-calendar" label="日曆"
                    @click="viewMode = 'calendar'" />
            </ButtonGroup>
        </div>

        <Divider></Divider>
        <!-- 列表視圖 -->
        <div v-if="viewMode === 'list'" class="flex flex-col flex-1 overflow-hidden">
            <DataTable :value="bookings" stripedRows responsiveLayout="scroll" class="">
                <Column field="courseTitle" header="課程名稱" />
                <Column field="date" header="日期">
                    <template #body="{ data }">
                        {{ formatDateString(data.date) }}
                    </template>
                </Column>
                <Column field="time" header="時間" />
                <Column field="location" header="地點" />
                <Column header="操作">
                    <template #body="{ data }">
                        <Button icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text"
                            @click="confirmCancelBooking(data.id)" />
                    </template>
                </Column>
            </DataTable>
            <div v-if="bookings.length === 0" class="content-center block text-center p-6 bg-gray-50 flex-1">
                <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">您目前沒有任何預約</p>
            </div>
        </div>

        <!-- 日曆視圖 -->
        <template v-else-if="viewMode === 'calendar'" class="flex-1 rounded-lg">
            <FullCalendar :options="calendarOptions" class="w-full h-full">
                <template v-slot:eventContent='arg'>
                    <div class="fc-content rounded-md p-1 whitespace-normal cursor-pointer">
                        <div class="fc-title text-sm text-sky-600"> {{ arg.event.title }}</div>
                        <div class="text-xs text-gray-500"> {{ arg.event.extendedProps.location }}</div>
                    </div>
                </template>
            </FullCalendar>
        </template>

        <!-- 取消預約確認對話框 -->
        <Dialog v-model:visible="showCancelDialog" header="取消預約" :style="{ width: '450px' }">
            <div class="p-4">
                <p>您確定要取消這個預約嗎？取消可能會影響您的上課權益。</p>
            </div>
            <template #footer>
                <Button label="取消" class="p-button-text" @click="showCancelDialog = false" />
                <Button label="確認取消預約" class="p-button-danger" @click="cancelBooking()" />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef, type PropType } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ButtonGroup from 'primevue/buttongroup';
import Divider from 'primevue/divider';
import { formatDateString } from '@/utils/common';
import type { CalendarOptions, EventClickArg, EventInput, EventApi } from '@fullcalendar/core';
import type { CourseBooking } from '@/types';

const props = defineProps({
    bookings: {
        type: Array as PropType<CourseBooking[]>,
        required: true
    }
});

const bookings = toRef(props, 'bookings');
const emit = defineEmits(['cancel-booking']);

const viewMode = ref('list');
const showCancelDialog = ref(false);
const selectedBookingId = ref<number | null>(null);

// 日曆事件
// watch(bookings, (newVal) => {
//     calendarEvents.value = newVal.map((booking: CourseBooking) => ({
//         id: booking.id.toString(),
//         title: booking.courseTitle,
//         start: booking.date,
//         end: booking.date + booking.time,
//         extendedProps: {
//             location: booking.location
//         }
//     }));
//     console.log(calendarEvents.value);

// }, { immediate: true });


const events = computed(() =>
    bookings.value.map((booking: CourseBooking) => ({
        id: booking.id.toString(),
        title: booking.courseTitle,
        start: booking.date,
        end: booking.date + booking.time,
        extendedProps: {
            location: booking.location
        }
    }))
)

const eventInfo = ref<EventClickArg | null>(null);

// 日曆配置
const calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: events.value,
    headerToolbar: {
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    eventClick: (info: EventClickArg) => {
        eventInfo.value = info;
        selectedBookingId.value = parseInt(info.event.id);
        showCancelDialog.value = true;
    },
    eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    },
    locale: 'zh-tw',
};


const confirmCancelBooking = (bookingId: number) => {
    selectedBookingId.value = bookingId;
    showCancelDialog.value = true;
};

const cancelBooking = () => {
    emit('cancel-booking', selectedBookingId.value);
    showCancelDialog.value = false;

    eventInfo.value?.event.remove();
    bookings.value = bookings.value.filter((booking: CourseBooking) => booking.id !== selectedBookingId.value);
};


</script>
<style scoped>
 
::v-deep(a.fc-event) {
    @apply bg-blue-50 rounded-md p-2 overflow-hidden;
}

::v-deep(.fc-event):hover {
    @apply bg-blue-200;
}
</style>