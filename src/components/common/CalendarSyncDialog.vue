<template>
    <Dialog v-model:visible="dialogVisible" header="同步至行事曆" :style="{ width: '400px' }"
        :contentStyle="{ 'background-color': '#f8fafc' }">
        <div class="p-4">
            <p class="mb-4 text-gray-700">選擇您要同步的行事曆平台：</p>
            <div class="grid grid-cols-1 gap-3">
                <Button label="Google 行事曆" icon="pi pi-google" variant="secondary"
                    class="p-button-raised"
                    @click="syncToCalendar('google')" />
                <Button label="Apple 行事曆" icon="pi pi-apple" variant="secondary"
                    class="p-button-raised"
                    @click="syncToCalendar('apple')" />
                <Button label="Outlook 行事曆" icon="pi pi-microsoft" variant="secondary"
                    class="p-button-raised"
                    @click="syncToCalendar('outlook')" />
                <Button label="下載 .ics 檔案" icon="pi pi-download" variant="secondary"
                    class="p-button-raised"
                    @click="downloadIcsFile()" />
            </div>
        </div>
        <template #footer>
            <Button label="關閉" icon="pi pi-times" @click="closeDialog" outlined
                class="!border-gray-300 !text-gray-700 hover:!bg-gray-50" />
        </template>
        
        <!-- 載入中狀態 -->
        <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div class="flex flex-col items-center gap-2">
                <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
                <p class="text-sm text-gray-600">{{ loadingMessage }}</p>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { showSuccess, showError } from '@/utils/toastHelper';

// 定義預約資料類型
interface BookingData {
    id?: number;
    courseTitle: string;
    start: string;
    end: string;
    merchantName: string;
}

// 組件屬性
const props = defineProps<{
    visible: boolean;
    bookingData: BookingData | null;
}>();

// 組件事件
const emit = defineEmits<{
    'update:visible': [value: boolean];
}>();

// 響應式狀態
const isLoading = ref(false);
const loadingMessage = ref('');

// 計算屬性
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

// 關閉對話框
const closeDialog = () => {
    dialogVisible.value = false;
};

// 格式化日期時間
const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 格式化時間
const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 生成 ICS 檔案內容
const generateIcsContent = (booking: BookingData): string => {
    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);
    
    // 轉換為 ICS 格式的日期時間
    const formatIcsDateTime = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PUDT//PUDT Course Booking//TW',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:pudt-booking-${booking.id || Date.now()}@pudt.com`,
        `DTSTART:${formatIcsDateTime(startDate)}`,
        `DTEND:${formatIcsDateTime(endDate)}`,
        `SUMMARY:${booking.courseTitle}`,
        `DESCRIPTION:課程：${booking.courseTitle}${booking.merchantName ? `\\n商家：${booking.merchantName}` : ''}`,
        `STATUS:CONFIRMED`,
        `SEQUENCE:0`,
        `CREATED:${formatIcsDateTime(new Date())}`,
        `LAST-MODIFIED:${formatIcsDateTime(new Date())}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
    
    return icsContent;
};

// 下載 ICS 檔案
const downloadIcsFile = () => {
    if (!props.bookingData) {
        showError('無法取得預約資料', '錯誤');
        return;
    }

    try {
        isLoading.value = true;
        loadingMessage.value = '正在生成行事曆檔案...';

        const icsContent = generateIcsContent(props.bookingData);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        
        link.href = URL.createObjectURL(blob);
        link.download = `PUDT-${props.bookingData.courseTitle}-${new Date(props.bookingData.start).toLocaleDateString('zh-TW')}.ics`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
        
        showSuccess('行事曆檔案已下載成功', '成功');
        closeDialog();
    } catch (error) {
        console.error('下載 ICS 檔案失敗:', error);
        showError('下載檔案失敗，請稍後再試', '錯誤');
    } finally {
        isLoading.value = false;
        loadingMessage.value = '';
    }
};

// 同步到指定行事曆平台
const syncToCalendar = (platform: 'google' | 'apple' | 'outlook') => {
    if (!props.bookingData) {
        showError('無法取得預約資料', '錯誤');
        return;
    }

    try {
        isLoading.value = true;
        loadingMessage.value = `正在同步至 ${platform === 'google' ? 'Google' : platform === 'apple' ? 'Apple' : 'Outlook'} 行事曆...`;

        const booking = props.bookingData;
        const startDate = new Date(booking.start);
        const endDate = new Date(booking.end);
        
        let url = '';
        
        switch (platform) {
            case 'google':
                // Google Calendar URL
                const googleParams = new URLSearchParams({
                    action: 'TEMPLATE',
                    text: booking.courseTitle,
                    dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                    details: `課程：${booking.courseTitle}${booking.merchantName ? `\n商家：${booking.merchantName}` : ''}`,
                    sprop: 'website:pudt.com'
                });
                url = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;
                break;
                
            case 'apple':
                // Apple Calendar 使用 data URL 下載 ICS
                const icsContent = generateIcsContent(booking);
                const dataUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `PUDT-${booking.courseTitle}.ics`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showSuccess('已為您下載 ICS 檔案，請在 Apple 行事曆中開啟', '成功');
                closeDialog();
                return;
                
            case 'outlook':
                // Outlook Web URL
                const outlookParams = new URLSearchParams({
                    path: '/calendar/action/compose',
                    rru: 'addevent',
                    subject: booking.courseTitle,
                    startdt: startDate.toISOString(),
                    enddt: endDate.toISOString(),
                    body: `課程：${booking.courseTitle}${booking.merchantName ? `\n商家：${booking.merchantName}` : ''}`,
                });
                url = `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;
                break;
        }
        
        if (url) {
            // 開啟新視窗
            const newWindow = window.open(url, '_blank', 'width=800,height=600');
            
            if (newWindow) {
                showSuccess(`已開啟 ${platform === 'google' ? 'Google' : 'Outlook'} 行事曆`, '成功');
                closeDialog();
            } else {
                showError('無法開啟行事曆，請檢查瀏覽器的彈出視窗設定', '錯誤');
            }
        }
        
    } catch (error) {
        console.error('同步行事曆失敗:', error);
        showError('同步失敗，請稍後再試', '錯誤');
    } finally {
        isLoading.value = false;
        loadingMessage.value = '';
    }
};

// 監聽對話框關閉，重置載入狀態
watch(dialogVisible, (newValue) => {
    if (!newValue) {
        isLoading.value = false;
        loadingMessage.value = '';
    }
});
</script>

<style scoped>
/* 自定義按鈕 hover 效果 */
:deep(.p-button:hover) {
    transform: translateY(-1px);
    transition: all 0.2s ease;
}

/* 載入中遮罩 */
.absolute.inset-0 {
    border-radius: 8px;
}
</style> 