<template>
    <div class="flex flex-col flex-1 gap-4">
        <h2 class="text-2xl font-bold text-sky-700 flex items-center">
            <i class="pi pi-envelope mr-2"></i>站內收件夾
        </h2>

        <div class="bg-white rounded-lg shadow-md border border-gray-100 h-full flex flex-col gap-4">
            <!-- 頂部操作區 -->
            <div class="flex flex-wrap justify-between items-center gap-3 p-3 border-b border-gray-100 bg-sky-50">
                <div class="flex gap-2">
                    <Button icon="pi pi-refresh" outlined aria-label="刷新" @click="refreshMessages"
                        class="!border-sky-500 !text-sky-500 hover:!bg-sky-50" />
                    <Button icon="pi pi-trash" outlined severity="danger" aria-label="刪除" 
                        :disabled="selectedMessages.length === 0" @click="confirmDeleteMessages" />
                    <Button icon="pi pi-envelope" outlined 
                        class="!border-green-500 !text-green-500 hover:!bg-green-50"
                        :disabled="selectedMessages.length === 0" @click="markAsRead" />
                    <Button icon="pi pi-envelope-open" outlined 
                        class="!border-yellow-500 !text-yellow-500 hover:!bg-yellow-50"
                        :disabled="selectedMessages.length === 0" @click="markAsUnread" />
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm bg-sky-100 text-sky-600 px-2 py-1 rounded-full font-medium">
                        {{ unreadCount }} 封未讀
                    </span>
                    <div class="relative">
                        <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <InputText v-model="filters.search" placeholder="搜尋訊息..." 
                            class="w-full md:w-auto pl-8 border-sky-200 focus:border-sky-500" />
                    </div>
                </div>
            </div>

            <!-- 分類標籤列 -->
            <div class="flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
                <Button v-for="category in categories" :key="category.value"
                    :label="category.label" 
                    :badge="category.count > 0 ? category.count.toString() : undefined"
                    :badgeClass="'bg-sky-100 text-sky-600'"
                    :outlined="filters.category !== category.value"
                    :class="{'p-button-text': true, 'bg-sky-50 !border-b-2 !border-sky-500': filters.category === category.value}"
                    @click="filters.category = category.value" />
            </div>

            <!-- 訊息列表 -->
            <DataTable v-model:selection="selectedMessages" :value="filteredMessages" 
                stripedRows selectionMode="multiple" dataKey="id" 
                :loading="loading" class="flex-1" paginator :rows="10"
                :rowsPerPageOptions="[5, 10, 20]" 
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                :rowHover="true"
                emptyMessage="無訊息"
                responsiveLayout="stack">
                
                <Column selectionMode="multiple" headerStyle="width: 3rem" headerClass="bg-sky-50 text-sky-700"></Column>
                
                <Column field="isRead" header="狀態" style="width: 4rem" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <div class="flex justify-center">
                            <i :class="['pi', data.isRead ? 'pi-envelope-open text-gray-400' : 'pi-envelope text-sky-500']"></i>
                        </div>
                    </template>
                </Column>
                
                <Column field="type" header="類型" style="width: 6rem" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <Tag :value="getMessageTypeLabel(data.type)" :severity="getMessageTypeSeverity(data.type)" />
                    </template>
                </Column>
                
                <Column field="sender" header="發送者" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <Avatar :image="data.senderAvatar" :label="data.sender.charAt(0)" 
                                shape="circle" size="small" class="!bg-sky-100 !text-sky-700" />
                            <span>{{ data.sender }}</span>
                        </div>
                    </template>
                </Column>
                
                <Column field="title" header="標題" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <div class="cursor-pointer hover:text-sky-600" @click="openMessage(data)"
                            :class="{'font-bold': !data.isRead}">
                            {{ data.title }}
                        </div>
                    </template>
                </Column>
                
                <Column field="createdAt" header="時間" sortable headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <div class="text-sm text-gray-600">
                            {{ formatMessageDate(data.createdAt) }}
                        </div>
                    </template>
                </Column>
                
                <Column style="width: 5rem" headerClass="bg-sky-50 text-sky-700">
                    <template #body="{ data }">
                        <div class="flex gap-1">
                            <Button icon="pi pi-eye" text rounded aria-label="查看" 
                                class="text-sky-500 hover:bg-sky-50" @click="openMessage(data)" />
                            <Button icon="pi pi-trash" text rounded severity="danger" 
                                aria-label="刪除" @click="confirmDeleteMessage(data)" />
                        </div>
                    </template>
                </Column>
                
                <template #empty>
                    <div class="text-center p-8 bg-sky-50/50 rounded-lg">
                        <i class="pi pi-inbox text-5xl text-sky-200 mb-3"></i>
                        <p class="text-sky-600">沒有訊息</p>
                    </div>
                </template>
            </DataTable>
        </div>

        <!-- 訊息詳情對話框 -->
        <Dialog v-model:visible="messageDetailVisible" :header="selectedMessage?.title || '訊息詳情'" 
            :modal="true" :closable="true" :style="{ width: '50vw' }"
            :contentStyle="{ 'background-color': '#f8fafc' }">
            <div v-if="selectedMessage" class="space-y-4">
                <div class="flex justify-between items-center border-b border-sky-100 pb-3">
                    <div class="flex items-center gap-3">
                        <Avatar :image="selectedMessage.senderAvatar" :label="selectedMessage.sender.charAt(0)" 
                            shape="circle" size="large" class="!bg-sky-100 !text-sky-700" />
                        <div>
                            <div class="font-medium text-sky-700">{{ selectedMessage.sender }}</div>
                            <div class="text-sm text-gray-500">{{ formatMessageDate(selectedMessage.createdAt) }}</div>
                        </div>
                    </div>
                    <Tag :value="getMessageTypeLabel(selectedMessage.type)" 
                        :severity="getMessageTypeSeverity(selectedMessage.type)" />
                </div>
                
                <div class="py-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div class="whitespace-pre-wrap text-gray-700">{{ selectedMessage.content }}</div>
                </div>
                
                <!-- 附件區 -->
                <div v-if="selectedMessage.attachments && selectedMessage.attachments.length > 0" class="border-t border-sky-100 pt-3">
                    <h3 class="font-medium mb-2 text-sky-700">附件</h3>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="(attachment, index) in selectedMessage.attachments" :key="index"
                            class="flex items-center gap-2 p-2 border border-sky-100 rounded-md bg-white hover:bg-sky-50 cursor-pointer transition-colors">
                            <i class="pi pi-file text-sky-500"></i>
                            <span>{{ attachment.name }}</span>
                            <span class="text-xs text-gray-500">({{ formatFileSize(attachment.size) }})</span>
                        </div>
                    </div>
                </div>
                
                <!-- 相關操作按鈕 -->
                <div v-if="selectedMessage.actions && selectedMessage.actions.length > 0" class="border-t border-sky-100 pt-3">
                    <div class="flex flex-wrap gap-2">
                        <Button v-for="(action, index) in selectedMessage.actions" :key="index"
                            :label="action.label" :icon="action.icon" @click="handleMessageAction(action)" 
                            class="p-button-outlined p-button-sm" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="關閉" icon="pi pi-times" @click="messageDetailVisible = false" outlined 
                    class="!border-gray-300 !text-gray-700" />
                <Button v-if="selectedMessage && !selectedMessage.isRead" 
                    label="標記為已讀" icon="pi pi-check" @click="markMessageAsRead(selectedMessage)" 
                    class="!bg-green-500 !border-green-500" />
                <Button v-if="selectedMessage && selectedMessage.canReply" 
                    label="回覆" icon="pi pi-reply" @click="replyToMessage" 
                    class="!bg-sky-500 !border-sky-500" />
            </template>
        </Dialog>
        
        <!-- 回覆訊息對話框 -->
        <Dialog v-model:visible="replyDialogVisible" header="回覆訊息" :modal="true" :style="{ width: '40vw' }"
            :contentStyle="{ 'background-color': '#f8fafc' }">
            <div class="flex flex-col gap-4 p-3">
                <div class="flex items-center gap-2 p-3 bg-sky-50 rounded-md border border-sky-100">
                    <span class="font-medium text-sky-700">回覆給:</span>
                    <div class="flex items-center gap-2">
                        <Avatar :image="selectedMessage?.senderAvatar" :label="selectedMessage?.sender.charAt(0)" 
                            shape="circle" size="small" class="!bg-sky-100 !text-sky-700" />
                        <span>{{ selectedMessage?.sender }}</span>
                    </div>
                </div>
                
                <div class="flex flex-col gap-2">
                    <label for="replyContent" class="font-medium text-sky-700">訊息內容</label>
                    <Textarea id="replyContent" v-model="replyContent" rows="5" class="w-full border-sky-200 focus:border-sky-500" 
                        placeholder="請輸入回覆內容..." />
                </div>
            </div>
            <template #footer>
                <Button label="取消" icon="pi pi-times" @click="replyDialogVisible = false" outlined 
                    class="!border-gray-300 !text-gray-700" />
                <Button label="發送" icon="pi pi-send" @click="sendReply" :loading="sendingReply" 
                    class="!bg-sky-500 !border-sky-500" />
            </template>
        </Dialog>
        
        <!-- 確認刪除對話框 -->
        <ConfirmDialog>
            <template #message="{ message }">
                <div class="flex items-start gap-3 p-3">
                    <i class="pi pi-exclamation-triangle text-yellow-500 text-xl mt-1"></i>
                    <div>
                        <h3 class="font-bold text-gray-800 mb-2">確認刪除</h3>
                        <p class="text-gray-600">{{ message }}</p>
                    </div>
                </div>
            </template>
        </ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, defineProps, onMounted, watch } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import TextArea from 'primevue/textarea';
import Avatar from 'primevue/avatar';
import ConfirmDialog from 'primevue/confirmdialog';
import Tag from 'primevue/tag';
import ButtonGroup from 'primevue/buttongroup';
import InputText from 'primevue/inputtext';
import { MessageType } from '@/enums/Message';
import type { Message } from '@/types/message';
import { showSuccess, showError, showInfo, initToast } from '@/utils/toastHelper';


const toast = useToast();
const confirm = useConfirm();

// 狀態
const loading = ref(false);
const messages = ref<Message[]>([]);
const selectedMessages = ref<Message[]>([]);
const selectedMessage = ref<Message | null>(null);
const messageDetailVisible = ref(false);
const replyDialogVisible = ref(false);
const replyContent = ref('');
const sendingReply = ref(false);

// 篩選條件
const filters = ref({
    category: 'all',
    search: ''
});

// 分類標籤
const categories = computed(() => [
    { label: '全部訊息', value: 'all', count: messages.value.length },
    { label: '未讀訊息', value: 'unread', count: messages.value.filter(m => !m.isRead).length },
    { label: '系統通知', value: 'system', count: messages.value.filter(m => m.type === MessageType.System).length },
    { label: '個人訊息', value: 'personal', count: messages.value.filter(m => m.type === MessageType.Personal).length },
    { label: '活動通知', value: 'notification', count: messages.value.filter(m => m.type === MessageType.Notification).length },
    { label: '優惠訊息', value: 'promotion', count: messages.value.filter(m => m.type === MessageType.Promotion).length }
]);

// 未讀訊息數量
const unreadCount = computed(() => messages.value.filter(m => !m.isRead).length);

// 篩選後的訊息
const filteredMessages = computed(() => {
    return messages.value.filter(message => {
        // 分類篩選
        if (filters.value.category === 'unread' && message.isRead) {
            return false;
        }
        
        if (filters.value.category !== 'all' && filters.value.category !== 'unread' && message.type !== filters.value.category) {
            return false;
        }
        
        // 搜尋篩選
        if (filters.value.search && !message.title.toLowerCase().includes(filters.value.search.toLowerCase()) && 
            !message.content.toLowerCase().includes(filters.value.search.toLowerCase()) &&
            !message.sender.toLowerCase().includes(filters.value.search.toLowerCase())) {
            return false;
        }
        
        return true;
    });
});

// 獲取訊息類型標籤
function getMessageTypeLabel(type: MessageType): string {
    switch (type) {
        case MessageType.System:
            return '系統';
        case MessageType.Personal:
            return '個人';
        case MessageType.Notification:
            return '通知';
        case MessageType.Promotion:
            return '優惠';
        default:
            return '其他';
    }
}

// 獲取訊息類型嚴重性
function getMessageTypeSeverity(type: MessageType): string {
    switch (type) {
        case MessageType.System:
            return 'info';
        case MessageType.Personal:
            return 'success';
        case MessageType.Notification:
            return 'warning';
        case MessageType.Promotion:
            return 'help';
        default:
            return 'secondary';
    }
}

// 格式化訊息日期
function formatMessageDate(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return `今天 ${messageDate.getHours().toString().padStart(2, '0')}:${messageDate.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
        return `昨天 ${messageDate.getHours().toString().padStart(2, '0')}:${messageDate.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return `${messageDate.getFullYear()}/${(messageDate.getMonth() + 1).toString().padStart(2, '0')}/${messageDate.getDate().toString().padStart(2, '0')}`;
    }
}

// 格式化檔案大小
function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// 開啟訊息詳情
function openMessage(message: Message): void {
    selectedMessage.value = message;
    messageDetailVisible.value = true;
    
    // 如果訊息未讀，標記為已讀
    if (!message.isRead) {
        markMessageAsRead(message);
    }
}

// 標記訊息為已讀
function markMessageAsRead(message: Message): void {
    const index = messages.value.findIndex(m => m.id === message.id);
    if (index !== -1) {
        messages.value[index].isRead = true;
    }
}

// 標記訊息為未讀
function markMessageAsUnread(message: Message): void {
    const index = messages.value.findIndex(m => m.id === message.id);
    if (index !== -1) {
        messages.value[index].isRead = false;
    }
}

// 標記選中訊息為已讀
function markAsRead(): void {
    selectedMessages.value.forEach(message => {
        const index = messages.value.findIndex(m => m.id === message.id);
        if (index !== -1) {
            messages.value[index].isRead = true;
        }
    });
    showSuccess(`已將 ${selectedMessages.value.length} 則訊息標記為已讀`, '成功');
    selectedMessages.value = [];
}

// 標記選中訊息為未讀
function markAsUnread(): void {
    selectedMessages.value.forEach(message => {
        const index = messages.value.findIndex(m => m.id === message.id);
        if (index !== -1) {
            messages.value[index].isRead = false;
        }
    });
    showSuccess(`已將 ${selectedMessages.value.length} 則訊息標記為未讀`, '成功');
    selectedMessages.value = [];
}

// 確認刪除單個訊息
function confirmDeleteMessage(message: Message): void {
    confirm.require({
        message: '確定要刪除此訊息嗎？',
        header: '刪除確認',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
            deleteMessage(message);
        }
    });
}

// 確認刪除多個訊息
function confirmDeleteMessages(): void {
    confirm.require({
        message: `確定要刪除選中的 ${selectedMessages.value.length} 則訊息嗎？`,
        header: '刪除確認',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
            deleteMessages();
        }
    });
}

// 刪除單個訊息
function deleteMessage(message: Message): void {
    messages.value = messages.value.filter(m => m.id !== message.id);
    showSuccess('訊息已刪除', '成功');
}

// 刪除多個訊息
function deleteMessages(): void {
    const deletedCount = selectedMessages.value.length;
    messages.value = messages.value.filter(message => !selectedMessages.value.some(selected => selected.id === message.id));
    showSuccess(`已刪除 ${deletedCount} 則訊息`, '成功');
    selectedMessages.value = [];
}

// 回覆訊息
function replyToMessage(): void {
    replyDialogVisible.value = true;
    replyContent.value = '';
}

// 發送回覆
function sendReply(): void {
    if (!replyContent.value.trim()) {
        showError('請輸入回覆內容', '錯誤');
        return;
    }
    
    sendingReply.value = true;
    
    // 模擬發送回覆
    setTimeout(() => {
        sendingReply.value = false;
        replyDialogVisible.value = false;
        messageDetailVisible.value = false;
        
        showSuccess('回覆已發送', '成功');
        
        // 添加一條新訊息（模擬回覆）
        const newMessage: Message = {
            id: Math.max(...messages.value.map(m => m.id)) + 1,
            type: MessageType.Personal,
            sender: '我',
            title: `回覆: ${selectedMessage.value?.title || ''}`,
            content: replyContent.value,
            createdAt: new Date(),
            isRead: true,
            canReply: false
        };
        
        messages.value.unshift(newMessage);
    }, 1000);
}

// 處理訊息操作
function handleMessageAction(action: any): void {
    showInfo(`執行操作: ${action.label}`, '操作');
    
    // 根據不同的操作類型執行不同的操作
    switch (action.action) {
        case 'view_course':
            // 導航到課程頁面
            break;
        case 'confirm_booking':
            // 確認預約
            break;
        case 'cancel_booking':
            // 取消預約
            break;
        default:
            break;
    }
}

// 刷新訊息
function refreshMessages(): void {
    loading.value = true;
    
    // 模擬加載數據
    setTimeout(() => {
        loadMessages();
        loading.value = false;
        showSuccess('訊息已更新', '成功');
    }, 1000);
}

// 加載訊息數據
function loadMessages(): void {
    // 模擬數據
    messages.value = [
        {
            id: 1,
            type: MessageType.System,
            sender: '系統管理員',
            senderAvatar: '',
            title: '歡迎加入 PUDT 平台',
            content: '親愛的用戶，歡迎您加入 PUDT 平台！\n\n我們提供多樣化的課程和活動，希望您能在這裡找到適合自己的學習資源。如有任何問題，請隨時聯繫客服。',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
            isRead: false,
            canReply: false
        },
        {
            id: 2,
            type: MessageType.Personal,
            sender: '客服人員',
            senderAvatar: '',
            title: '關於您的課程諮詢',
            content: '您好，感謝您對瑜珈初階班的諮詢。\n\n課程將於下週一開始，請提前 15 分鐘到達教室。請穿著舒適的運動服裝，並自備瑜珈墊。\n\n期待您的參與！',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
            isRead: true,
            canReply: true
        },
        {
            id: 3,
            type: MessageType.Notification,
            sender: '預約系統',
            senderAvatar: '',
            title: '課程預約確認通知',
            content: '您已成功預約「攝影基礎課程」，上課時間為 2023/12/15 14:00-16:00，地點為攝影工作室 A。\n\n請準時到達，如需取消請提前 24 小時通知。',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
            isRead: true,
            canReply: false,
            actions: [
                { label: '查看課程', icon: 'pi pi-eye', action: 'view_course', data: { courseId: 123 } },
                { label: '取消預約', icon: 'pi pi-times', action: 'cancel_booking', data: { bookingId: 456 } }
            ]
        },
        {
            id: 4,
            type: MessageType.Promotion,
            sender: '行銷團隊',
            senderAvatar: '',
            title: '限時優惠：點數卡 85 折',
            content: '親愛的會員，即日起至 12/31 止，購買任何點數卡享 85 折優惠！\n\n現在是儲值的好時機，趕快行動吧！',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
            isRead: false,
            canReply: false
        },
        {
            id: 5,
            type: MessageType.System,
            sender: '系統管理員',
            senderAvatar: '',
            title: '系統維護通知',
            content: '親愛的用戶，我們將於 2023/12/10 凌晨 2:00-5:00 進行系統維護，期間網站可能無法正常訪問。\n\n造成不便，敬請見諒。',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
            isRead: true,
            canReply: false
        },
        {
            id: 6,
            type: MessageType.Personal,
            sender: '講師 王小明',
            senderAvatar: '',
            title: '關於您的課程作業',
            content: '您好，我已收到您的攝影作業，整體表現不錯！\n\n關於構圖部分有幾點建議：\n1. 可以嘗試運用三分法則\n2. 注意前景與背景的層次感\n3. 光線運用可以更加豐富\n\n期待您的進步！',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
            isRead: true,
            canReply: true,
            attachments: [
                { name: '評分表.pdf', url: '#', size: 1024 * 512 },
                { name: '參考作品.jpg', url: '#', size: 1024 * 1024 * 2.5 }
            ]
        },
        {
            id: 7,
            type: MessageType.Notification,
            sender: '活動通知',
            senderAvatar: '',
            title: '您報名的活動即將開始',
            content: '提醒您，您報名的「攝影外拍工作坊」將於明天上午 9:00 在中央公園入口處集合。\n\n請攜帶您的相機設備，並穿著舒適的鞋子，活動預計持續 3 小時。',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 12)),
            isRead: false,
            canReply: false,
            actions: [
                { label: '查看活動詳情', icon: 'pi pi-calendar', action: 'view_event', data: { eventId: 789 } }
            ]
        },
        {
            id: 8,
            type: MessageType.System,
            sender: '帳務系統',
            senderAvatar: '',
            title: '點數購買成功',
            content: '您已成功購買 500 點，交易金額 NT$4,500。\n\n點數已加入您的帳戶，可立即使用。感謝您的支持！',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
            isRead: true,
            canReply: false
        }
    ];
}

// 初始化
onMounted(() => {
    initToast(toast);
    loadMessages();
});
</script>

<style scoped>
@reference "tailwindcss";

:deep(.p-datatable-wrapper) {
    @apply flex-1 h-full overflow-auto;
}

:deep(.p-datatable > .p-datatable-table-container) {
    flex: 1;
}

:deep(.p-datatable-tbody > tr:hover) {
    @apply bg-sky-50/50;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
    @apply py-2 px-3 text-sm font-semibold;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    @apply py-2 px-3 text-sm;
}

:deep(.p-button.p-button-text:not(.p-disabled):hover) {
    background: rgba(var(--primary-color-rgb), 0.04);
    color: var(--primary-color);
}

:deep(.p-button.p-button-text:not(.p-disabled).active) {
    background: rgba(var(--primary-color-rgb), 0.16);
    color: var(--primary-color);
}

:deep(.p-avatar) {
    @apply flex items-center justify-center;
}
</style> 