<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- 頂部個人信息區 -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- 大頭照 -->
          <div class="relative">
            <Avatar :image="userProfile.avatar" size="xlarge" shape="circle" class="h-24 w-24" />
            <Button icon="pi pi-camera" class="absolute bottom-0 right-0 p-1 !w-8 !h-8" 
                   rounded text @click="handlePhotoUpload" />
          </div>
          
          <!-- 個人基本信息 -->
          <div class="text-center md:text-left text-white">
            <h1 class="text-2xl font-bold">{{ userProfile.name }}</h1>
            <p class="mt-1">{{ userProfile.email }}</p>
            <div class="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              <Chip :label="`會員等級: ${userProfile.level}`" class="bg-blue-400" />
              <Chip :label="`點數: ${userProfile.points}`" class="bg-blue-400" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 主要內容區域 -->
      <div class="flex flex-col md:flex-row">
        <!-- 左側菜單 -->
        <div class="w-full md:w-1/4 border-r border-gray-200">
          <ul class="py-2">
            <li v-for="(menuItem, index) in menuItems" :key="index" 
                @click="activeTab = menuItem.id"
                :class="['p-3 cursor-pointer flex items-center', 
                        activeTab === menuItem.id ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'hover:bg-gray-50']">
              <i :class="['pi mr-2', menuItem.icon]"></i>
              {{ menuItem.label }}
            </li>
            <li class="p-3 cursor-pointer flex items-center text-red-500 hover:bg-gray-50" @click="handleLogout">
              <i class="pi pi-sign-out mr-2"></i>
              登出
            </li>
          </ul>
        </div>
        
        <!-- 右側內容 -->
        <div class="w-full md:w-3/4 p-6">
          <!-- 1. 個人資料管理 -->
          <div v-if="activeTab === 'profile'">
            <ProfileManagement :profile="userProfile" @update-profile="updateProfile" />
          </div>
          
          <!-- 2. 點數管理與課卡購買 -->
          <div v-if="activeTab === 'points'">
            <PointsManagement :points="userProfile.points" :packages="pointsPackages" @purchase="handlePurchase" />
          </div>
          
          <!-- 3. 預約行程管理 -->
          <div v-if="activeTab === 'bookings'">
            <BookingsManagement :bookings="userBookings" @cancel-booking="cancelBooking" />
          </div>
          
          <!-- 4. 活動紀錄 -->
          <div v-if="activeTab === 'history'">
            <ActivityHistory 
              :courseHistory="courseHistory" 
              :purchaseHistory="purchaseHistory"
              :absenceRecords="absenceRecords"
              :unpaidRecords="unpaidRecords"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 頭像上傳對話框 -->
  <Dialog v-model:visible="showPhotoDialog" header="更新頭像" :style="{ width: '450px' }">
    <div class="flex flex-col items-center gap-4">
      <div class="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
        <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
        <p>拖拽照片到此處或點擊上傳</p>
        <input type="file" accept="image/*" class="hidden" ref="fileInput" @change="onPhotoSelected">
        <Button label="選擇照片" class="mt-3" @click="$refs.fileInput.click()" />
      </div>
      <div class="flex justify-end w-full mt-4">
        <Button label="取消" class="p-button-text" @click="showPhotoDialog = false" />
        <Button label="確定上傳" @click="confirmPhotoUpload" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Dialog from 'primevue/dialog';

// 子組件導入
import ProfileManagement from '@/components/profile/ProfileManagement.vue';
import PointsManagement from '@/components/profile/PointsManagement.vue';
import BookingsManagement from '@/components/profile/BookingsManagement.vue';
import ActivityHistory from '@/components/profile/ActivityHistory.vue';

const toast = useToast();
const activeTab = ref('profile');
const showPhotoDialog = ref(false);
const fileInput = ref(null);
const selectedPhoto = ref(null);

// 用戶資料
const userProfile = reactive({
  id: 1,
  name: '王小明',
  email: 'ming@example.com',
  phone: '0912-345-678',
  avatar: 'https://via.placeholder.com/150',
  level: '黃金會員',
  points: 120,
  address: '台北市信義區忠孝東路五段123號',
  birthday: '1990-01-01',
  gender: '男'
});

// 菜單項目
const menuItems = [
  { id: 'profile', label: '會員資料管理', icon: 'pi-user' },
  { id: 'points', label: '點數與課卡', icon: 'pi-wallet' },
  { id: 'bookings', label: '預約行程管理', icon: 'pi-calendar' },
  { id: 'history', label: '活動紀錄', icon: 'pi-history' }
];

// 點數套餐
const pointsPackages = ref([
  { id: 1, name: '基本課卡', points: 10, price: 1000, description: '適合偶爾上課的學員' },
  { id: 2, name: '進階課卡', points: 20, price: 1800, description: '適合每週上課的學員', discount: '9折優惠' },
  { id: 3, name: '專業課卡', points: 50, price: 4000, description: '適合頻繁上課的學員', discount: '8折優惠' }
]);

// 預約記錄
const userBookings = ref([
  { id: 1, courseTitle: '初學者瑜珈課程', date: '2025-05-01', time: '10:00-12:00', location: '和平瑜珈中心' },
  { id: 2, courseTitle: '進階瑜珈課程', date: '2025-05-03', time: '14:00-16:00', location: '和平瑜珈中心' },
  { id: 3, courseTitle: '冥想與放鬆', date: '2025-05-10', time: '18:00-19:30', location: '和平瑜珈中心' }
]);

// 課程歷史
const courseHistory = ref([
  { id: 1, courseTitle: '基礎瑜珈', date: '2025-04-20', instructor: '李老師', points: 12, status: '已完成' },
  { id: 2, courseTitle: '冥想課程', date: '2025-04-15', instructor: '張老師', points: 8, status: '已完成' }
]);

// 購買歷史
const purchaseHistory = ref([
  { id: 1, package: '進階課卡', points: 20, amount: 1800, date: '2025-04-01', paymentMethod: '信用卡' },
  { id: 2, package: '基本課卡', points: 10, amount: 1000, date: '2025-03-15', paymentMethod: 'LINE Pay' }
]);

// 缺席記錄
const absenceRecords = ref([
  { id: 1, courseTitle: '高級瑜珈', date: '2025-04-10', time: '14:00-16:00', points: 12 }
]);

// 未付費記錄
const unpaidRecords = ref([
  { id: 1, courseTitle: '特殊活動課程', date: '2025-05-15', amount: 500, dueDate: '2025-05-10' }
]);

// 方法
const handlePhotoUpload = () => {
  showPhotoDialog.value = true;
};

const onPhotoSelected = (event) => {
  selectedPhoto.value = event.target.files[0];
};

const confirmPhotoUpload = () => {
  if (selectedPhoto.value) {
    // 在實際應用中，這裡應該上傳照片到服務器
    const reader = new FileReader();
    reader.onload = (e) => {
      userProfile.avatar = e.target.result;
      showPhotoDialog.value = false;
      toast.add({ severity: 'success', summary: '成功', detail: '頭像已更新', life: 3000 });
    };
    reader.readAsDataURL(selectedPhoto.value);
  }
};

const updateProfile = (updatedProfile) => {
  Object.assign(userProfile, updatedProfile);
  toast.add({ severity: 'success', summary: '成功', detail: '個人資料已更新', life: 3000 });
};

const handlePurchase = (packageId) => {
  const selectedPackage = pointsPackages.value.find(pkg => pkg.id === packageId);
  if (selectedPackage) {
    userProfile.points += selectedPackage.points;
    purchaseHistory.value.unshift({
      id: purchaseHistory.value.length + 1,
      package: selectedPackage.name,
      points: selectedPackage.points,
      amount: selectedPackage.price,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: '信用卡'
    });
    toast.add({ severity: 'success', summary: '成功', detail: `已購買 ${selectedPackage.name}`, life: 3000 });
  }
};

const cancelBooking = (bookingId) => {
  const index = userBookings.value.findIndex(booking => booking.id === bookingId);
  if (index !== -1) {
    userBookings.value.splice(index, 1);
    toast.add({ severity: 'success', summary: '成功', detail: '預約已取消', life: 3000 });
  }
};

const handleLogout = () => {
  // 在實際應用中，這裡應該調用登出 API
  toast.add({ severity: 'info', summary: '登出', detail: '您已成功登出', life: 3000 });
  // 導航到登入頁面
  // router.push('/login');
};
</script>