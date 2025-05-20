<template>
  <div>
    <!-- 設定頁面標籤頁 -->
    <TabView>
      <!-- 基本資料 -->
      <TabPanel header="基本資料" value="basic">
        <Card>
          <template #content>
            <form @submit.prevent="saveBasicInfo" class="p-fluid">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 商家名稱 -->
                <div class="md:col-span-2">
                  <label for="name" class="block mb-1 font-medium">商家名稱 <span class="text-red-500">*</span></label>
                  <InputText id="name" v-model="merchantInfo.name" :class="{ 'p-invalid': errors.name }" />
                  <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                </div>
                
                <!-- 聯絡電話 -->
                <div>
                  <label for="phone" class="block mb-1 font-medium">聯絡電話 <span class="text-red-500">*</span></label>
                  <InputText id="phone" v-model="merchantInfo.phone" :class="{ 'p-invalid': errors.phone }" />
                  <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                </div>
                
                <!-- 電子郵件 -->
                <div>
                  <label for="email" class="block mb-1 font-medium">電子郵件 <span class="text-red-500">*</span></label>
                  <InputText id="email" v-model="merchantInfo.email" :class="{ 'p-invalid': errors.email }" />
                  <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                </div>
                
                <!-- 商家地址 -->
                <div class="md:col-span-2">
                  <label for="address" class="block mb-1 font-medium">商家地址 <span class="text-red-500">*</span></label>
                  <InputText id="address" v-model="merchantInfo.address" :class="{ 'p-invalid': errors.address }" />
                  <small v-if="errors.address" class="p-error">{{ errors.address }}</small>
                </div>
                
                <!-- 商家類型 -->
                <div>
                  <label for="type" class="block mb-1 font-medium">商家類型 <span class="text-red-500">*</span></label>
                  <Dropdown id="type" v-model="merchantInfo.type" :options="merchantTypes" optionLabel="label" optionValue="value"
                    :class="{ 'p-invalid': errors.type }" />
                  <small v-if="errors.type" class="p-error">請選擇商家類型</small>
                </div>
                
                <!-- 營業時間 -->
                <div>
                  <label for="businessHours" class="block mb-1 font-medium">營業時間</label>
                  <InputText id="businessHours" v-model="merchantInfo.businessHours" placeholder="例如: 週一至週五 10:00-18:00" />
                </div>
                
                <!-- 商家網站 -->
                <div class="md:col-span-2">
                  <label for="website" class="block mb-1 font-medium">商家網站</label>
                  <InputText id="website" v-model="merchantInfo.website" placeholder="例如: https://www.example.com" />
                </div>
              </div>
              
              <!-- 地圖位置 -->
              <div class="mt-4">
                <label class="block mb-1 font-medium">地圖位置</label>
                <div class="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p class="text-gray-500">Google Maps 整合將在此顯示</p>
                </div>
              </div>
              
              <div class="flex justify-end mt-4">
                <Button label="儲存變更" icon="pi pi-save" type="submit" :loading="saving" />
              </div>
            </form>
          </template>
        </Card>
      </TabPanel>
      
      <!-- 品牌設定 -->
      <TabPanel header="品牌設定" value="brand">
        <Card>
          <template #content>
            <form @submit.prevent="saveBrandInfo" class="p-fluid">
              <!-- Logo 上傳 -->
              <div class="mb-4">
                <label class="block mb-1 font-medium">商家 Logo</label>
                <div class="flex items-center gap-4">
                  <div class="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img v-if="merchantInfo.logo" :src="merchantInfo.logo" alt="Logo" class="max-w-full max-h-full" />
                    <i v-else class="pi pi-image text-4xl text-gray-400"></i>
                  </div>
                  <div>
                    <Button type="button" label="上傳 Logo" icon="pi pi-upload" @click="uploadLogo" class="mb-2" />
                    <p class="text-sm text-gray-500">建議尺寸: 200x200px，支援 PNG、JPG 格式</p>
                  </div>
                </div>
              </div>
              
              <!-- 封面圖片上傳 -->
              <div class="mb-4">
                <label class="block mb-1 font-medium">封面圖片</label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  @click="uploadCoverImage">
                  <div v-if="!merchantInfo.coverImage">
                    <i class="pi pi-image text-3xl text-gray-400 mb-2"></i>
                    <p class="text-gray-500">點擊上傳封面圖片</p>
                    <p class="text-xs text-gray-400 mt-1">建議尺寸: 1200x400px</p>
                  </div>
                  <img v-else :src="merchantInfo.coverImage" alt="封面圖片" class="max-h-40 mx-auto" />
                </div>
              </div>
              
              <!-- 商家描述 -->
              <div class="mb-4">
                <label for="description" class="block mb-1 font-medium">商家描述</label>
                <Editor v-model="merchantInfo.description" editorStyle="height: 250px" />
              </div>
              
              <div class="flex justify-end mt-4">
                <Button label="儲存變更" icon="pi pi-save" type="submit" :loading="saving" />
              </div>
            </form>
          </template>
        </Card>
      </TabPanel>
      
      <!-- 帳號安全 -->
      <TabPanel header="帳號安全" value="security">
        <Card>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 變更密碼 -->
              <div>
                <h3 class="text-lg font-semibold mb-3">變更密碼</h3>
                <form @submit.prevent="changePassword" class="p-fluid">
                  <div class="mb-3">
                    <label for="currentPassword" class="block mb-1 font-medium">目前密碼 <span class="text-red-500">*</span></label>
                    <Password id="currentPassword" v-model="passwordForm.currentPassword" toggleMask :feedback="false" :class="{ 'p-invalid': passwordErrors.currentPassword }" />
                    <small v-if="passwordErrors.currentPassword" class="p-error">{{ passwordErrors.currentPassword }}</small>
                  </div>
                  
                  <div class="mb-3">
                    <label for="newPassword" class="block mb-1 font-medium">新密碼 <span class="text-red-500">*</span></label>
                    <Password id="newPassword" v-model="passwordForm.newPassword" toggleMask :class="{ 'p-invalid': passwordErrors.newPassword }" />
                    <small v-if="passwordErrors.newPassword" class="p-error">{{ passwordErrors.newPassword }}</small>
                  </div>
                  
                  <div class="mb-3">
                    <label for="confirmPassword" class="block mb-1 font-medium">確認新密碼 <span class="text-red-500">*</span></label>
                    <Password id="confirmPassword" v-model="passwordForm.confirmPassword" toggleMask :feedback="false" :class="{ 'p-invalid': passwordErrors.confirmPassword }" />
                    <small v-if="passwordErrors.confirmPassword" class="p-error">{{ passwordErrors.confirmPassword }}</small>
                  </div>
                  
                  <Button label="變更密碼" icon="pi pi-lock" type="submit" :loading="changingPassword" />
                </form>
              </div>
              
              <!-- 雙重驗證 -->
              <div>
                <h3 class="text-lg font-semibold mb-3">雙重驗證</h3>
                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <h4 class="font-medium">雙重驗證狀態</h4>
                      <p class="text-sm text-gray-500 mt-1">提高帳號安全性，登入時需要額外驗證</p>
                    </div>
                    <InputSwitch v-model="twoFactorEnabled" @change="toggleTwoFactor" />
                  </div>
                </div>
                
                <div v-if="twoFactorEnabled" class="bg-blue-50 p-4 rounded-lg">
                  <h4 class="font-medium text-blue-700">已啟用雙重驗證</h4>
                  <p class="text-sm text-blue-600 mt-1">登入時將透過簡訊或驗證器應用程式接收驗證碼</p>
                </div>
                
                <h3 class="text-lg font-semibold mt-6 mb-3">登入記錄</h3>
                <div class="border rounded-lg overflow-hidden">
                  <div v-for="(log, index) in loginLogs" :key="index" class="p-3 border-b last:border-b-0">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="font-medium">{{ log.location }}</div>
                        <div class="text-xs text-gray-500">{{ log.device }}</div>
                      </div>
                      <div class="text-sm text-gray-500">{{ formatDateTime(log.time) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>
      
      <!-- 通知設定 -->
      <TabPanel header="通知設定" value="notifications">
        <Card>
          <template #content>
            <form @submit.prevent="saveNotificationSettings" class="p-fluid">
              <h3 class="text-lg font-semibold mb-3">通知偏好設定</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 電子郵件通知 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium">電子郵件通知</h4>
                  <div class="mt-3 space-y-3">
                    <div class="flex items-center justify-between">
                      <label for="emailNewBooking" class="cursor-pointer">新預約通知</label>
                      <InputSwitch id="emailNewBooking" v-model="notificationSettings.email.newBooking" />
                    </div>
                    <div class="flex items-center justify-between">
                      <label for="emailCancelBooking" class="cursor-pointer">取消預約通知</label>
                      <InputSwitch id="emailCancelBooking" v-model="notificationSettings.email.cancelBooking" />
                    </div>
                    <div class="flex items-center justify-between">
                      <label for="emailSettlement" class="cursor-pointer">點數結算通知</label>
                      <InputSwitch id="emailSettlement" v-model="notificationSettings.email.settlement" />
                    </div>
                    <div class="flex items-center justify-between">
                      <label for="emailSystem" class="cursor-pointer">系統更新通知</label>
                      <InputSwitch id="emailSystem" v-model="notificationSettings.email.system" />
                    </div>
                  </div>
                </div>
                
                <!-- 簡訊通知 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium">簡訊通知</h4>
                  <div class="mt-3 space-y-3">
                    <div class="flex items-center justify-between">
                      <label for="smsNewBooking" class="cursor-pointer">新預約通知</label>
                      <InputSwitch id="smsNewBooking" v-model="notificationSettings.sms.newBooking" />
                    </div>
                    <div class="flex items-center justify-between">
                      <label for="smsCancelBooking" class="cursor-pointer">取消預約通知</label>
                      <InputSwitch id="smsCancelBooking" v-model="notificationSettings.sms.cancelBooking" />
                    </div>
                    <div class="flex items-center justify-between">
                      <label for="smsSettlement" class="cursor-pointer">點數結算通知</label>
                      <InputSwitch id="smsSettlement" v-model="notificationSettings.sms.settlement" />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 推播通知 -->
              <div class="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium">推播通知</h4>
                <div class="mt-3 space-y-3">
                  <div class="flex items-center justify-between">
                    <label for="pushNewBooking" class="cursor-pointer">新預約通知</label>
                    <InputSwitch id="pushNewBooking" v-model="notificationSettings.push.newBooking" />
                  </div>
                  <div class="flex items-center justify-between">
                    <label for="pushCancelBooking" class="cursor-pointer">取消預約通知</label>
                    <InputSwitch id="pushCancelBooking" v-model="notificationSettings.push.cancelBooking" />
                  </div>
                  <div class="flex items-center justify-between">
                    <label for="pushSettlement" class="cursor-pointer">點數結算通知</label>
                    <InputSwitch id="pushSettlement" v-model="notificationSettings.push.settlement" />
                  </div>
                  <div class="flex items-center justify-between">
                    <label for="pushSystem" class="cursor-pointer">系統更新通知</label>
                    <InputSwitch id="pushSystem" v-model="notificationSettings.push.system" />
                  </div>
                </div>
              </div>
              
              <div class="flex justify-end mt-4">
                <Button label="儲存變更" icon="pi pi-save" type="submit" :loading="saving" />
              </div>
            </form>
          </template>
        </Card>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { z } from 'zod';
import { useToast } from 'primevue/usetoast';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Editor from 'primevue/editor';
import Password from 'primevue/password';
import InputSwitch from 'primevue/inputswitch';

const toast = useToast();

// 商家資訊
const merchantInfo = reactive({
  name: '瑜珈生活館',
  phone: '02-2345-6789',
  email: 'yoga@example.com',
  address: '台北市信義區信義路五段100號',
  type: 'fitness',
  businessHours: '週一至週五 10:00-20:00，週六日 11:00-18:00',
  website: 'https://www.example.com',
  description: '<p>我們是一家專注於提供高品質瑜珈課程的場所，致力於幫助學員達到身心平衡。</p><p>我們的教練團隊擁有豐富的教學經驗，能夠根據不同學員的需求提供個性化的指導。</p>',
  logo: null as string | null,
  coverImage: null as string | null
});

// 定義 zod schema 進行表單驗證
const merchantInfoSchema = z.object({
  name: z.string().min(2, '商家名稱至少需要2個字符'),
  phone: z.string().min(1, '請輸入聯絡電話'),
  email: z.string().email('請輸入有效的電子郵件地址'),
  address: z.string().min(1, '請輸入商家地址'),
  type: z.string().min(1, '請選擇商家類型'),
  businessHours: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().nullable(),
  coverImage: z.string().nullable()
});

// 表單錯誤訊息
const errors = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  type: ''
});

// 密碼表單
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密碼驗證規則
const passwordSchema = z.object({
  currentPassword: z.string().min(1, '請輸入目前密碼'),
  newPassword: z.string().min(8, '新密碼至少需要8個字符'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '新密碼與確認密碼不符',
  path: ['confirmPassword']
});

// 密碼表單錯誤訊息
const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 商家類型選項
const merchantTypes = [
  { label: '健身運動', value: 'fitness' },
  { label: '烹飪美食', value: 'cooking' },
  { label: '藝術創作', value: 'art' },
  { label: '語言學習', value: 'language' },
  { label: '專業技能', value: 'professional' }
];

// 雙重驗證
const twoFactorEnabled = ref(false);

// 登入記錄
const loginLogs = [
  { location: '台灣台北', device: 'Chrome on Windows', time: new Date(2023, 5, 15, 10, 30) },
  { location: '台灣台北', device: 'Safari on iPhone', time: new Date(2023, 5, 10, 15, 45) },
  { location: '台灣台中', device: 'Chrome on Android', time: new Date(2023, 5, 5, 9, 15) }
];

// 通知設定
const notificationSettings = reactive({
  email: {
    newBooking: true,
    cancelBooking: true,
    settlement: true,
    system: true
  },
  sms: {
    newBooking: true,
    cancelBooking: false,
    settlement: true
  },
  push: {
    newBooking: true,
    cancelBooking: true,
    settlement: true,
    system: false
  }
});

// 加載狀態
const saving = ref(false);
const changingPassword = ref(false);

// 清除所有錯誤訊息
function clearErrors() {
  errors.name = '';
  errors.phone = '';
  errors.email = '';
  errors.address = '';
  errors.type = '';
}

// 保存基本資料
async function saveBasicInfo(): Promise<void> {
  clearErrors();
  
  try {
    // 使用 zod 驗證表單
    merchantInfoSchema.parse(merchantInfo);
    
    saving.value = true;
    
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.add({
      severity: 'success',
      summary: '保存成功',
      detail: '商家基本資料已更新',
      life: 3000
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 處理驗證錯誤
      error.errors.forEach(err => {
        const path = err.path[0] as keyof typeof errors;
        if (path && path in errors) {
          errors[path] = err.message;
        }
      });
      
      toast.add({
        severity: 'error',
        summary: '驗證失敗',
        detail: '請檢查並填寫所有必填欄位',
        life: 3000
      });
    } else {
      console.error('保存基本資料失敗:', error);
      toast.add({
        severity: 'error',
        summary: '保存失敗',
        detail: '無法保存商家基本資料，請稍後再試',
        life: 3000
      });
    }
  } finally {
    saving.value = false;
  }
}

// 保存品牌資訊
async function saveBrandInfo(): Promise<void> {
  saving.value = true;
  
  try {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.add({
      severity: 'success',
      summary: '保存成功',
      detail: '商家品牌資訊已更新',
      life: 3000
    });
  } catch (error) {
    console.error('保存品牌資訊失敗:', error);
    toast.add({
      severity: 'error',
      summary: '保存失敗',
      detail: '無法保存商家品牌資訊，請稍後再試',
      life: 3000
    });
  } finally {
    saving.value = false;
  }
}

// 上傳 Logo
function uploadLogo(): void {
  // 實際應用中應該調用文件上傳 API
  // 這裡使用模擬數據
  merchantInfo.logo = 'https://via.placeholder.com/200x200?text=Logo';
}

// 上傳封面圖片
function uploadCoverImage(): void {
  // 實際應用中應該調用文件上傳 API
  // 這裡使用模擬數據
  merchantInfo.coverImage = 'https://via.placeholder.com/1200x400?text=Cover+Image';
}

// 清除密碼錯誤訊息
function clearPasswordErrors() {
  passwordErrors.currentPassword = '';
  passwordErrors.newPassword = '';
  passwordErrors.confirmPassword = '';
}

// 變更密碼
async function changePassword(): Promise<void> {
  clearPasswordErrors();
  
  try {
    // 使用 zod 驗證密碼表單
    passwordSchema.parse(passwordForm);
    
    changingPassword.value = true;
    
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.add({
      severity: 'success',
      summary: '變更成功',
      detail: '密碼已成功變更',
      life: 3000
    });
    
    // 重置表單
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 處理驗證錯誤
      error.errors.forEach(err => {
        const path = err.path[0] as keyof typeof passwordErrors;
        if (path && path in passwordErrors) {
          passwordErrors[path] = err.message;
        }
      });
    } else {
      console.error('變更密碼失敗:', error);
      toast.add({
        severity: 'error',
        summary: '變更失敗',
        detail: '無法變更密碼，請確認目前密碼是否正確',
        life: 3000
      });
    }
  } finally {
    changingPassword.value = false;
  }
}

// 切換雙重驗證
async function toggleTwoFactor(event: Event): Promise<void> {
  const enabled = (event.target as HTMLInputElement).checked;
  
  try {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.add({
      severity: 'success',
      summary: enabled ? '已啟用雙重驗證' : '已停用雙重驗證',
      detail: enabled ? '您的帳號現在受到雙重驗證保護' : '雙重驗證已停用，建議保持啟用以提高安全性',
      life: 3000
    });
  } catch (error) {
    console.error('切換雙重驗證失敗:', error);
    
    // 還原狀態
    twoFactorEnabled.value = !enabled;
    
    toast.add({
      severity: 'error',
      summary: '操作失敗',
      detail: '無法變更雙重驗證設定，請稍後再試',
      life: 3000
    });
  }
}

// 保存通知設定
async function saveNotificationSettings(): Promise<void> {
  saving.value = true;
  
  try {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.add({
      severity: 'success',
      summary: '保存成功',
      detail: '通知設定已更新',
      life: 3000
    });
  } catch (error) {
    console.error('保存通知設定失敗:', error);
    toast.add({
      severity: 'error',
      summary: '保存失敗',
      detail: '無法保存通知設定，請稍後再試',
      life: 3000
    });
  } finally {
    saving.value = false;
  }
}

// 格式化日期時間
function formatDateTime(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
</script> 