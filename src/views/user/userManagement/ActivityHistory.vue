<template>
    <div>
      <h2 class="text-2xl font-bold mb-6">活動記錄</h2>
      
      <TabView>
        <!-- 已參加課程歷史 -->
        <TabPanel header="課程歷史">
          <DataTable :value="courseHistory" stripedRows>
            <Column field="courseTitle" header="課程名稱" />
            <Column field="date" header="日期">
              <template #body="{ data }">
                {{ formatDate(data.date) }}
              </template>
            </Column>
            <Column field="instructor" header="講師" />
            <Column field="points" header="消費點數" />
            <Column field="status" header="狀態">
              <template #body="{ data }">
                <Tag :severity="getStatusSeverity(data.status)" :value="data.status" />
              </template>
            </Column>
          </DataTable>
          
          <div v-if="courseHistory.length === 0" class="text-center p-6 bg-gray-50 rounded-lg">
            <p class="text-gray-500">尚無課程紀錄</p>
          </div>
        </TabPanel>
        
        <!-- 購買課卡歷史 -->
        <TabPanel header="購買歷史">
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
                {{ formatDate(data.date) }}
              </template>
            </Column>
            <Column field="paymentMethod" header="付款方式" />
          </DataTable>
          
          <div v-if="purchaseHistory.length === 0" class="text-center p-6 bg-gray-50 rounded-lg">
            <p class="text-gray-500">尚無購買紀錄</p>
          </div>
        </TabPanel>
        
        <!-- 缺席紀錄 -->
        <TabPanel header="缺席紀錄">
          <DataTable :value="absenceRecords" stripedRows>
            <Column field="courseTitle" header="課程名稱" />
            <Column field="date" header="日期">
              <template #body="{ data }">
                {{ formatDate(data.date) }}
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
        <TabPanel header="未付費項目">
          <DataTable :value="unpaidRecords" stripedRows>
            <Column field="courseTitle" header="項目名稱" />
            <Column field="date" header="使用日期">
              <template #body="{ data }">
                {{ formatDate(data.date) }}
              </template>
            </Column>
            <Column field="amount" header="應付金額">
              <template #body="{ data }">
                NT$ {{ data.amount }}
              </template>
            </Column>
            <Column field="dueDate" header="繳款期限">
              <template #body="{ data }">
                {{ formatDate(data.dueDate) }}
              </template>
            </Column>
            <Column header="操作">
              <template #body>
                <Button label="立即付款" class="p-button-sm" />
              </template>
            </Column>
          </DataTable>
          
          <div v-if="unpaidRecords.length === 0" class="text-center p-6 bg-gray-50 rounded-lg">
            <p class="text-gray-500">無未付費項目</p>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Tag from 'primevue/tag';
  import Button from 'primevue/button';
  
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
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
  };
  
  const getStatusSeverity = (status) => {
    switch (status) {
      case '已完成':
        return 'success';
      case '已取消':
        return 'danger';
      case '已預約':
        return 'info';
      default:
        return 'secondary';
    }
  };
  </script>