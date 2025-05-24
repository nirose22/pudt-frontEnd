<template>
    <div>
        <!-- 頂部操作區 -->
        <div class="flex justify-between items-center mb-6">
            <Button icon="pi pi-arrow-left" text @click="navigateBack" label="返回預約列表" />

            <div class="flex gap-2">
                <Button v-if="booking.status === BookingStatus.Pending" label="確認預約" icon="pi pi-check" @click="confirmBooking" />
                <Button v-if="[BookingStatus.Pending, BookingStatus.Confirmed].includes(booking.status)" label="取消預約" icon="pi pi-times"
                    severity="danger" outlined @click="cancelBooking" />
                <Button v-if="booking.status === BookingStatus.Confirmed" label="完成預約" icon="pi pi-check-circle" severity="success"
                    @click="completeBooking" />
            </div>
        </div>

        <!-- 主要內容區 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 左側：預約詳情 -->
            <div class="lg:col-span-2">
                <Card>
                    <template #title>
                        <div class="flex justify-between items-center">
                            <span>預約詳情</span>
                            <Tag :severity="getStatusSeverity(booking.status)"
                                :value="getStatusLabel(booking.status)" />
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- 預約編號 -->
                            <div>
                                <h3 class="text-sm text-gray-500 mb-1">預約編號</h3>
                                <p class="font-medium">{{ booking.id }}</p>
                            </div>

                            <!-- 預約時間 -->
                            <div>
                                <h3 class="text-sm text-gray-500 mb-1">預約時間</h3>
                                <p class="font-medium">{{ formatDate(booking.date) }} {{ formatTime(booking.start)
                                    }} - {{ formatTime(booking.end) }}</p>
                            </div>

                            <!-- 課程名稱 -->
                            <div>
                                <h3 class="text-sm text-gray-500 mb-1">課程名稱</h3>
                                <p class="font-medium">{{ booking.courseTitle }}</p>
                            </div>

                            <!-- 點數 -->
                            <div>
                                <h3 class="text-sm text-gray-500 mb-1">點數</h3>
                                <p class="font-medium">{{ booking.points }}</p>
                            </div>

                            <!-- 建立時間 -->
                            <div>
                                <h3 class="text-sm text-gray-500 mb-1">建立時間</h3>
                                <p class="font-medium">{{ formatDateTime(booking.createdAt) }}</p>
                            </div>

                            <!-- 最後更新 -->
                            <div>
                                <h3 class="text-sm text-gray-500 mb-1">最後更新</h3>
                                <p class="font-medium">{{ formatDateTime(booking.updatedAt ?? booking.createdAt) }}</p>
                            </div>
                        </div>

                        <!-- 備註 -->
                        <div class="mt-4">
                            <h3 class="text-sm text-gray-500 mb-1">客戶備註</h3>
                            <div class="p-3 bg-gray-50 rounded-lg">
                                <p v-if="booking.notes">{{ booking.notes }}</p>
                                <p v-else class="text-gray-400">無備註</p>
                            </div>
                        </div>

                        <!-- 商家備註 -->
                        <div class="mt-4">
                            <h3 class="text-sm text-gray-500 mb-1">商家備註</h3>
                            <div class="flex gap-2">
                                <InputText v-model="merchantNotes" placeholder="新增備註..." class="flex-grow" />
                                <Button label="儲存" icon="pi pi-save" @click="saveNotes" />
                            </div>
                            <div v-if="booking.notes" class="mt-2 p-3 bg-blue-50 rounded-lg">
                                <p>{{ booking.notes }}</p>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- 預約歷史 -->
                <Card class="mt-6">
                    <template #title>預約歷史</template>
                    <template #content>
                        <Timeline :value="booking.history" class="w-full">
                            <template #content="slotProps">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-medium">{{ slotProps.item.status }}</p>
                                        <p v-if="slotProps.item.note" class="text-sm text-gray-600 mt-1">{{
                                            slotProps.item.note }}</p>
                                    </div>
                                    <div class="text-sm text-gray-500">{{ formatDateTime(slotProps.item.time) }}</div>
                                </div>
                            </template>
                            <template #opposite="slotProps">
                                <div class="flex items-center justify-center w-8 h-8 rounded-full"
                                    :class="getHistoryIconBgClass(slotProps.item.status)">
                                    <i class="text-white" :class="getHistoryIcon(slotProps.item.status)"></i>
                                </div>
                            </template>
                        </Timeline>
                    </template>
                </Card>
            </div>

            <!-- 右側：客戶資訊和訊息 -->
            <div>
                <!-- 客戶資訊 -->
                <Card class="mb-6">
                    <template #title>客戶資訊</template>
                    <template #content>
                        <div class="flex items-center gap-3 mb-4">
                            <Avatar :label="getInitials(booking.customerName)" shape="circle" size="large"
                                class="bg-blue-100 text-blue-600" />
                            <div>
                                <h3 class="font-medium">{{ booking.customerName }}</h3>
                                <p class="text-sm text-gray-500">客戶 ID: {{ booking.customerId }}</p>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <!-- 聯絡電話 -->
                            <div class="flex items-center gap-2">
                                <i class="pi pi-phone text-gray-500"></i>
                                <div>
                                    <p class="text-sm text-gray-500">聯絡電話</p>
                                    <p>{{ booking.customerPhone }}</p>
                                </div>
                            </div>

                            <!-- 電子郵件 -->
                            <div class="flex items-center gap-2">
                                <i class="pi pi-envelope text-gray-500"></i>
                                <div>
                                    <p class="text-sm text-gray-500">電子郵件</p>
                                    <p>{{ booking.customerEmail }}</p>
                                </div>
                            </div>

                            <!-- 預約次數 -->
                            <div class="flex items-center gap-2">
                                <i class="pi pi-calendar text-gray-500"></i>
                                <div>
                                    <p class="text-sm text-gray-500">預約次數</p>
                                    <p>{{ booking.bookingCount }} 次</p>
                                </div>
                            </div>
                        </div>

                        <!-- 查看客戶歷史 -->
                        <Button label="查看客戶歷史" icon="pi pi-user" outlined class="w-full mt-4"
                            @click="viewCustomerHistory" />
                    </template>
                </Card>

                <!-- 訊息功能 -->
                <Card>
                    <template #title>聯絡客戶</template>
                    <template #content>
                        <!-- 訊息範本 -->
                        <div class="mb-4">
                            <label for="messageTemplate" class="block mb-1 font-medium">訊息範本</label>
                            <Select id="messageTemplate" v-model="selectedTemplate" :options="messageTemplates"
                                optionLabel="name" class="w-full" @change="applyTemplate" />
                        </div>

                        <!-- 訊息內容 -->
                        <div class="mb-4">
                            <label for="messageContent" class="block mb-1 font-medium">訊息內容</label>
                            <Textarea id="messageContent" v-model="messageContent" rows="5" class="w-full" />
                        </div>

                        <!-- 發送方式 -->
                        <div class="flex gap-4 mb-4">
                            <div class="flex items-center">
                                <Checkbox id="sendEmail" v-model="sendOptions.email" :binary="true" />
                                <label for="sendEmail" class="ml-2 cursor-pointer">電子郵件</label>
                            </div>
                            <div class="flex items-center">
                                <Checkbox id="sendSMS" v-model="sendOptions.sms" :binary="true" />
                                <label for="sendSMS" class="ml-2 cursor-pointer">簡訊</label>
                            </div>
                        </div>

                        <!-- 發送按鈕 -->
                        <Button label="發送訊息" icon="pi pi-send" class="w-full" @click="sendMessage"
                            :disabled="!canSendMessage" />
                    </template>
                </Card>
            </div>
        </div>

        <!-- 確認對話框 -->
        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Avatar from 'primevue/avatar';
import Timeline from 'primevue/timeline';
import ConfirmDialog from 'primevue/confirmdialog';
import { formatDate, formatTime, formatDateTime, getBookingStatusSeverity } from '@/utils/dateUtils';
import type { MerchantBookingDetail, BookingHistory } from '@/types/booking';
import { BookingStatus, BookingStatusLabel } from '@/enums/BookingStatus';
import { useMerchantBookingStore } from '@/stores/merchantBookingStore';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const merchantBookingStore = useMerchantBookingStore();
const userStore = useUserStore();

// 預約 ID
const bookingId = computed(() => parseInt(route.params.id as string));

// 預約數據
const booking = ref<MerchantBookingDetail>({
    id: 0,
    customerId: 0,
    sessionId: 0,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingCount: 0,
    courseId: 0,
    courseTitle: '',
    date: new Date(),
    start: new Date(),
    end: new Date(),
    points: 0,
    status: BookingStatus.Pending,
    history: [],
    createdAt: new Date(),
    updatedAt: new Date()
});

// 商家備註
const merchantNotes = ref('');

// 訊息相關
const messageTemplates = [
    { name: '選擇範本...', value: '' },
    { name: '預約確認', value: '您好，您的預約已確認。我們期待在 {{date}} {{time}} 見到您。如有任何問題，請隨時聯絡我們。' },
    { name: '預約提醒', value: '提醒您，您預約的課程將於明天 {{time}} 開始。請準時到達，謝謝！' },
    { name: '預約取消', value: '很遺憾通知您，由於特殊原因，我們需要取消您的預約。我們將全額退還您的點數。如需重新安排，請與我們聯絡。' }
];
const selectedTemplate = ref(messageTemplates[0]);
const messageContent = ref('');
const sendOptions = ref({
    email: true,
    sms: false
});

// 是否可以發送訊息
const canSendMessage = computed(() => {
    return messageContent.value.trim() !== '' && (sendOptions.value.email || sendOptions.value.sms);
});

// 獲取狀態標籤
function getStatusLabel(status: BookingStatus): string {
    return BookingStatusLabel[status];
}

// 獲取狀態嚴重性
function getStatusSeverity(status: BookingStatus): string {
    return getBookingStatusSeverity(status);
}

// 獲取歷史記錄圖標
function getHistoryIcon(status: string): string {
    const iconMap: Record<string, string> = {
        [BookingStatus.Pending]: 'pi pi-plus',
        [BookingStatus.Confirmed]: 'pi pi-check',
        [BookingStatus.Completed]: 'pi pi-check-circle',
        [BookingStatus.Cancelled]: 'pi pi-times',
        [BookingStatus.NoShow]: 'pi pi-times-circle'
    };
    return iconMap[status] || 'pi pi-circle';
}

// 獲取歷史記錄圖標背景顏色
function getHistoryIconBgClass(status: string): string {
    const bgMap: Record<string, string> = {
        [BookingStatus.Pending]: 'bg-blue-500',
        [BookingStatus.Confirmed]: 'bg-green-500',
        [BookingStatus.Completed]: 'bg-blue-500',
        [BookingStatus.Cancelled]: 'bg-gray-500',
        [BookingStatus.NoShow]: 'bg-red-500'
    };
    return bgMap[status] || 'bg-gray-500';
}

// 獲取姓名縮寫
function getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
}

// 返回上一頁
function navigateBack(): void {
    router.back();
}

// 確認預約
function confirmBooking(): void {
    confirm.require({
        message: `確定要確認 ${merchantBookingStore.selectedBooking?.customerName} 的預約嗎？`,
        header: '確認預約',
        icon: 'pi pi-check-circle',
        acceptLabel: '確認',
        rejectLabel: '取消',
        accept: async () => {
            if (merchantBookingStore.selectedBooking) {
                await merchantBookingStore.updateBookingStatus(
                    merchantBookingStore.selectedBooking.id,
                    BookingStatus.Confirmed
                );
            }
        }
    });
}

// 取消預約
function cancelBooking(): void {
    confirm.require({
        message: `確定要取消 ${merchantBookingStore.selectedBooking?.customerName} 的預約嗎？`,
        header: '取消預約',
        icon: 'pi pi-times-circle',
        acceptLabel: '確認取消',
        rejectLabel: '返回',
        accept: async () => {
            if (merchantBookingStore.selectedBooking) {
                await merchantBookingStore.updateBookingStatus(
                    merchantBookingStore.selectedBooking.id,
                    BookingStatus.Cancelled
                );
            }
        }
    });
}

// 完成預約
function completeBooking(): void {
    confirm.require({
        message: `確定要將 ${merchantBookingStore.selectedBooking?.customerName} 的預約標記為已完成嗎？`,
        header: '完成預約',
        icon: 'pi pi-check-square',
        acceptLabel: '確認完成',
        rejectLabel: '取消',
        accept: async () => {
            if (merchantBookingStore.selectedBooking) {
                await merchantBookingStore.updateBookingStatus(
                    merchantBookingStore.selectedBooking.id,
                    BookingStatus.Completed
                );
            }
        }
    });
}

// 保存商家備註
async function saveNotes(): Promise<void> {
    if (merchantNotes.value.trim() === '') {
        toast.add({
            severity: 'error',
            summary: '儲存失敗',
            detail: '備註內容不能為空',
            life: 3000
        });
        return;
    }

    if (merchantBookingStore.selectedBooking) {
        try {
            await merchantBookingStore.updateBookingNotes(
                merchantBookingStore.selectedBooking.id,
                merchantNotes.value
            );
            toast.add({
                severity: 'success',
                summary: '備註已儲存',
                detail: '商家備註已成功儲存',
                life: 3000
            });
        } catch (error) {
            console.error('保存備註失敗:', error);
            toast.add({
                severity: 'error',
                summary: '儲存失敗',
                detail: '無法保存備註，請稍後再試',
                life: 3000
            });
        }
    }
}

// 應用訊息範本
function applyTemplate(): void {
    if (selectedTemplate.value.value && merchantBookingStore.selectedBooking) {
        let content = selectedTemplate.value.value;
        content = content.replace('{{date}}', formatDate(merchantBookingStore.selectedBooking.date));
        content = content.replace('{{time}}', formatTime(merchantBookingStore.selectedBooking.start));
        messageContent.value = content;
    }
}

// 發送訊息
async function sendMessage(): Promise<void> {
    if (!canSendMessage.value || !merchantBookingStore.selectedBooking) return;

    try {
        await merchantBookingStore.sendMessage(
            merchantBookingStore.selectedBooking.id,
            messageContent.value,
            sendOptions.value
        );

        // 重置訊息表單
        messageContent.value = '';
        selectedTemplate.value = messageTemplates[0];
        sendOptions.value = { email: true, sms: false };

        toast.add({
            severity: 'success',
            summary: '訊息已發送',
            detail: `已透過 ${sendOptions.value.email ? '電子郵件' : ''} ${sendOptions.value.sms ? '簡訊' : ''} 發送訊息給 ${merchantBookingStore.selectedBooking.customerName}`,
            life: 3000
        });
    } catch (error) {
        console.error('發送訊息失敗:', error);
        toast.add({
            severity: 'error',
            summary: '發送失敗',
            detail: '無法發送訊息，請稍後再試',
            life: 3000
        });
    }
}

// 查看客戶歷史
function viewCustomerHistory(): void {
    if (merchantBookingStore.selectedBooking) {
        router.push(`/merchant/customers/${merchantBookingStore.selectedBooking.customerId}`);
    }
}

// 加載預約數據
async function loadBooking(): Promise<void> {
    try {
        await merchantBookingStore.loadBookingDetail(bookingId.value);
        if (merchantBookingStore.selectedBooking) {
            merchantNotes.value = merchantBookingStore.selectedBooking.notes || '';
        } else {
            toast.add({
                severity: 'error',
                summary: '找不到預約',
                detail: `找不到 ID 為 ${bookingId.value} 的預約`,
                life: 3000
            });
            router.push('/merchant/bookings');
        }
    } catch (error) {
        console.error('加載預約失敗:', error);
        toast.add({
            severity: 'error',
            summary: '加載失敗',
            detail: '無法加載預約數據，請稍後再試',
            life: 3000
        });
    }
}

// 初始化
onMounted(() => {
    loadBooking();
});
</script>
