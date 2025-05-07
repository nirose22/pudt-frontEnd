<template>
    <div class="flex flex-col flex-1">
        <h2 class="text-2xl font-bold mb-6">活動記錄</h2>
        <Tabs value="courseHistory">
            <TabList :dt="tabListStyle">
                <Tab value="courseHistory">
                    <span>預約紀錄</span>
                </Tab>
                <Tab value="purchaseHistory">
                    <span>購買紀錄</span>
                </Tab>
                <Tab value="absenceRecords">
                    <span>缺席紀錄</span>
                </Tab>
                <Tab value="unpaidRecords">
                    <span>未付費項目</span>
                </Tab>
            </TabList>
            <TabPanels>
                <!-- 已參加課程歷史 -->
                <TabPanel value="courseHistory">
                    <DataTable :value="courseHistory" stripedRows>
                        <Column field="courseTitle" header="課程名稱" />
                        <Column field="date" header="日期">
                            <template #body="{ data }">
                                {{ formatDateString(data.date) }}
                            </template>
                        </Column>
                        <Column field="instructor.name" header="講師" />
                        <Column field="points" header="消費點數" />
                        <Column field="status" header="狀態">
                            <template #body="{ data }">
                                <Tag :severity="getStatusSeverity(data.status)" :value="getCourseStatus(data.status)" />
                            </template>
                        </Column>
                    </DataTable>
    
                    <div v-if="courseHistory.length === 0" class="text-center p-6 bg-gray-50 rounded-lg">
                        <p class="text-gray-500">尚無課程紀錄</p>
                    </div>
                </TabPanel>
    
                <!-- 購買課卡歷史 -->
                <TabPanel value="purchaseHistory">
                    <DataTable :value="purchaseHistory" stripedRows>
                        <Column field="package" header="課卡名稱" />
                        <Column field="points" header="點數" />
                        <Column field="amount" header="金額">
                            <template #body="{ data }">
                                NT$ {{ data.amount }}
                            </template>
                        </Column>
                        <Column field="date" header="購買日期">
                            <template #body="{ data }">
                                {{ formatDateString(data.date) }}
                            </template>
                        </Column>
                        <Column field="paymentMethod" header="付款方式" />
                    </DataTable>
    
                    <div v-if="purchaseHistory.length === 0" class="text-center p-6 bg-gray-50 rounded-lg">
                        <p class="text-gray-500">尚無購買紀錄</p>
                    </div>
                </TabPanel>
    
                <!-- 缺席紀錄 -->
                <TabPanel value="absenceRecords">
                    <DataTable :value="absenceRecords" stripedRows>
                        <Column field="courseTitle" header="課程名稱" />
                        <Column field="date" header="日期">
                            <template #body="{ data }">
                                {{ formatDateString(data.date) }}
                            </template>
                        </Column>
                        <Column field="time" header="時間" />
                        <Column field="points" header="扣除點數" />
                    </DataTable>
    
                    <div v-if="absenceRecords.length === 0" class="text-center p-6 bg-gray-50 rounded-lg">
                        <p class="text-gray-500">無缺席紀錄</p>
                    </div>
                </TabPanel>
    
                <!-- 未付費紀錄 -->
                <TabPanel value="unpaidRecords">
                    <DataTable :value="unpaidRecords" stripedRows>
                        <Column field="courseTitle" header="項目名稱" />
                        <Column field="date" header="使用日期">
                            <template #body="{ data }">
                                {{ formatDateString(data.date) }}
                            </template>
                        </Column>
                        <Column field="amount" header="應付金額">
                            <template #body="{ data }">
                                NT$ {{ data.amount }}
                            </template>
                        </Column>
                        <Column field="dueDate" header="繳款期限">
                            <template #body="{ data }">
                                {{ formatDateString(data.dueDate) }}
                            </template>
                        </Column>
                        <Column header="操作">
                            <template #body>
                                <Button label="立即付款" class="p-button-sm" />
                            </template>
                        </Column>
                    </DataTable>
    
                    <div v-if="unpaidRecords.length === 0" class="content-center block text-center p-6 bg-gray-50 flex-1">
                        <i class="pi pi-calendar-times text-4xl text-gray-400 mb-2"></i>
                        <p class="text-gray-500">無未付費項目</p>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import TabPanel from 'primevue/tabpanel';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import Tabs from 'primevue/tabs';
import TabPanels from 'primevue/tabpanels';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { ref } from 'vue';
import type { TabListPassThroughOptions } from 'primevue/tablist';
import { formatDateString } from '@/utils/common';
import { BookingStatus, BookingStatusLabel } from '@/enums/BookingStatus';
const props = defineProps({
    courseHistory: {
        type: Array,
        required: true
    },
    purchaseHistory: {
        type: Array,
        required: true
    },
    absenceRecords: {
        type: Array,
        required: true
    },
    unpaidRecords: {
        type: Array,
        required: true
    }
});

const tabListStyle = ref({
    root: {
    }
}) as TabListPassThroughOptions

const getCourseStatus = (status: BookingStatus) => {
    return BookingStatusLabel[status];
}

const getStatusSeverity = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Confirmed:
            return 'success';
        case BookingStatus.Canceled:
            return 'danger';
        case BookingStatus.Pending:
            return 'info';
        default:
            return 'secondary';
    }
};
</script>
<style scoped>
 @reference "tailwindcss";

::v-deep(.p-tab-active) {
   @apply !bg-blue-100;
}
</style>