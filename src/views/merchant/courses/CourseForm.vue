<template>
  <div>
    <!-- 頂部操作區 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">{{ isEditMode ? '編輯課程' : '新增課程' }}</h2>
      <div class="flex gap-2">
        <Button label="預覽" icon="pi pi-eye" outlined @click="showPreview = true" />
        <Button label="取消" icon="pi pi-times" outlined @click="navigateBack" />
        <Button label="儲存" icon="pi pi-save" @click="saveCourse" :loading="saving" />
      </div>
    </div>
    
    <!-- 表單區域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左側表單 -->
      <div class="lg:col-span-2">
        <Card class="mb-6">
          <template #title>基本資訊</template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 課程名稱 -->
              <div class="md:col-span-2">
                <label for="title" class="block mb-1 font-medium">課程名稱 <span class="text-red-500">*</span></label>
                <InputText id="title" v-model="course.title" class="w-full" :class="{ 'p-invalid': errors.title }" />
                <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
              </div>
              
              <!-- 課程分類 -->
              <div>
                <label for="mainCategory" class="block mb-1 font-medium">主分類 <span class="text-red-500">*</span></label>
                <Dropdown id="mainCategory" v-model="selectedMainCategory" :options="mainCategories"
                  optionLabel="name" optionValue="code" placeholder="選擇主分類" class="w-full"
                  :class="{ 'p-invalid': errors.categories }" />
              </div>
              
              <div>
                <label for="subCategory" class="block mb-1 font-medium">子分類 <span class="text-red-500">*</span></label>
                <MultiSelect id="subCategory" v-model="selectedSubCategories" :options="filteredSubCategories"
                  optionLabel="name" optionValue="code" placeholder="選擇子分類" class="w-full"
                  :class="{ 'p-invalid': errors.categories }" />
                <small v-if="errors.categories" class="p-error block mt-1">{{ errors.categories }}</small>
              </div>
              
              <!-- 點數價格 -->
              <div>
                <label for="pointsRequired" class="block mb-1 font-medium">點數價格 <span class="text-red-500">*</span></label>
                <InputNumber id="pointsRequired" v-model="course.pointsRequired" class="w-full" :min="0" :max="1000"
                  :class="{ 'p-invalid': errors.pointsRequired }" />
                <small v-if="errors.pointsRequired" class="p-error">
                  {{ errors.pointsRequired }}
                </small>
              </div>
              
              <!-- 地區 -->
              <div>
                <label for="region" class="block mb-1 font-medium">地區 <span class="text-red-500">*</span></label>
                <Dropdown id="region" v-model="course.region" :options="regions"
                  optionLabel="name" optionValue="code" placeholder="選擇地區" class="w-full"
                  :class="{ 'p-invalid': errors.region }" />
                <small v-if="errors.region" class="p-error">{{ errors.region }}</small>
              </div>
            </div>
          </template>
        </Card>
        
        <!-- 課程描述 -->
        <Card class="mb-6">
          <template #title>課程描述</template>
          <template #content>
            <div>
              <label for="description" class="block mb-1 font-medium">課程詳細描述 <span class="text-red-500">*</span></label>
              <Editor v-model="course.description" editorStyle="height: 250px" :class="{ 'p-invalid': errors.description }" />
              <small v-if="errors.description" class="p-error">
                {{ errors.description }}
              </small>
            </div>
          </template>
        </Card>
        
        <!-- 課程時段 -->
        <Card class="mb-6">
          <template #title>
            <div class="flex justify-between items-center">
              <span>課程時段</span>
              <Button icon="pi pi-plus" label="新增時段" @click="addTimeSlot" size="small" />
            </div>
          </template>
          <template #content>
            <div v-if="course.schedule.length === 0" class="text-center p-4 bg-gray-50 rounded-lg">
              <i class="pi pi-calendar text-3xl text-gray-400 mb-2"></i>
              <p class="text-gray-500">尚未設定課程時段</p>
              <Button label="新增時段" icon="pi pi-plus" @click="addTimeSlot" class="mt-2" size="small" />
            </div>
            
            <div v-for="(slot, index) in course.schedule" :key="index" class="mb-4 p-4 border rounded-lg">
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-lg font-medium">時段 {{ index + 1 }}</h4>
                <Button icon="pi pi-trash" text severity="danger" @click="removeTimeSlot(index)" />
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 日期 -->
                <div>
                  <label :for="`date-${index}`" class="block mb-1 font-medium">日期</label>
                  <Calendar :id="`date-${index}`" v-model="slot.date" dateFormat="yy/mm/dd" class="w-full" />
                </div>
                
                <!-- 時間範圍 -->
                <div class="flex gap-2 items-center">
                  <div class="flex-grow">
                    <label :for="`startTime-${index}`" class="block mb-1 font-medium">開始時間</label>
                    <Calendar :id="`startTime-${index}`" v-model="slot.startTime" timeOnly showTime hourFormat="24" class="w-full" />
                  </div>
                  <span class="mt-6">至</span>
                  <div class="flex-grow">
                    <label :for="`endTime-${index}`" class="block mb-1 font-medium">結束時間</label>
                    <Calendar :id="`endTime-${index}`" v-model="slot.endTime" timeOnly showTime hourFormat="24" class="w-full" />
                  </div>
                </div>
                
                <!-- 席位數 -->
                <div>
                  <label :for="`seats-${index}`" class="block mb-1 font-medium">席位數</label>
                  <InputNumber :id="`seats-${index}`" v-model="slot.totalSeats" class="w-full" :min="1" :max="100" />
                </div>
              </div>
            </div>
            
            <small v-if="errors.schedule" class="p-error block mt-2">{{ errors.schedule }}</small>
          </template>
        </Card>
      </div>
      
      <!-- 右側側邊欄 -->
      <div>
        <!-- 發布狀態 -->
        <Card class="mb-6">
          <template #title>發布狀態</template>
          <template #content>
            <div class="mb-4">
              <label for="status" class="block mb-1 font-medium">狀態</label>
              <Dropdown id="status" v-model="course.status" :options="statusOptions"
                optionLabel="label" optionValue="value" class="w-full" />
            </div>
            
            <div v-if="course.status === 'scheduled'">
              <label for="publishDate" class="block mb-1 font-medium">預定上架時間</label>
              <Calendar id="publishDate" v-model="course.publishDate" dateFormat="yy/mm/dd" showTime hourFormat="24" class="w-full" />
            </div>
          </template>
        </Card>
        
        <!-- 課程圖片 -->
        <Card class="mb-6">
          <template #title>課程圖片</template>
          <template #content>
            <div class="mb-4">
              <label class="block mb-1 font-medium">主圖 <span class="text-red-500">*</span></label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                @click="uploadMainImage">
                <div v-if="!course.mainImage">
                  <i class="pi pi-image text-3xl text-gray-400 mb-2"></i>
                  <p class="text-gray-500">點擊上傳主圖</p>
                  <p class="text-xs text-gray-400 mt-1">建議尺寸: 800x600px</p>
                </div>
                <img v-else :src="course.mainImage" alt="主圖" class="max-h-40 mx-auto" />
              </div>
              <small v-if="errors.mainImage" class="p-error">{{ errors.mainImage }}</small>
            </div>
            
            <div>
              <label class="block mb-1 font-medium">其他圖片 (最多 5 張)</label>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="(img, index) in course.images" :key="index" class="relative">
                  <img :src="img" alt="課程圖片" class="w-full h-20 object-cover rounded-lg" />
                  <Button icon="pi pi-times" class="absolute top-1 right-1 w-6 h-6 p-0" text severity="danger"
                    @click="removeImage(index)" />
                </div>
                
                <div v-if="course.images.length < 5" class="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-20"
                  @click="uploadImage">
                  <i class="pi pi-plus text-gray-400"></i>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
    
    <!-- 課程預覽對話框 -->
    <Dialog v-model:visible="showPreview" modal header="課程預覽" :style="{ width: '80vw' }" :maximizable="true">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 左側圖片 -->
        <div>
          <img :src="course.mainImage || 'https://via.placeholder.com/400x300?text=課程圖片'" alt="課程圖片" class="w-full rounded-lg shadow-sm" />
          
          <div class="grid grid-cols-5 gap-2 mt-2">
            <img v-for="(img, index) in course.images" :key="index" :src="img" alt="課程圖片" class="w-full h-16 object-cover rounded-lg cursor-pointer" />
          </div>
        </div>
        
        <!-- 右側內容 -->
        <div class="md:col-span-2">
          <h2 class="text-2xl font-bold mb-2">{{ course.title || '課程標題' }}</h2>
          
          <div class="flex items-center gap-2 mb-4">
            <Tag :severity="getStatusSeverity(course.status)" :value="getStatusLabel(course.status)" />
            <span class="text-gray-500">|</span>
            <span>{{ getRegionName(course.region) }}</span>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg mb-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600">點數價格</div>
                <div class="text-2xl font-bold text-blue-600">{{ course.pointsRequired || 0 }} 點</div>
              </div>
              
              <Button label="立即報名" icon="pi pi-calendar-plus" disabled />
            </div>
          </div>
          
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2">課程描述</h3>
            <div class="p-3 bg-gray-50 rounded-lg" v-html="course.description || '尚未填寫課程描述'"></div>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-2">可選時段</h3>
            <div v-if="course.schedule.length === 0" class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500">尚未設定課程時段</p>
            </div>
            <div v-else>
              <div v-for="(slot, index) in course.schedule" :key="index" class="p-3 border-b last:border-b-0">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium">{{ formatDate(slot.date) }}</div>
                    <div class="text-sm text-gray-500">
                      {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
                    </div>
                  </div>
                  <div class="text-sm">
                    剩餘席位: <span class="font-medium">{{ slot.totalSeats }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Calendar from 'primevue/calendar';
import Editor from 'primevue/editor';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import { mockRegions } from '@/service/MockService';
import type { CourseFormData, CourseScheduleItem, CourseMainCategory, SubCategoryCode } from '@/types/course';

// 通用狀態與工具
const route = useRoute();
const router = useRouter();
const toast = useToast();
const showPreview = ref(false);
const saving = ref(false);

// 判斷是否為編輯模式
const isEditMode = computed(() => route.name === 'CourseEdit');
const courseId = computed(() => route.params.id ? parseInt(route.params.id as string) : 0);

// 課程數據
const course = ref<CourseFormData>({
  id: 0,
  title: '',
  description: '',
  mainImage: '',
  images: [],
  status: 'draft',
  pointsRequired: 0,
  region: '',
  categories: [],
  publishDate: null,
  schedule: []
});

// 表單錯誤訊息
const errors = reactive({
  title: '',
  description: '',
  pointsRequired: '',
  mainImage: '',
  region: '',
  categories: '',
  schedule: ''
});

// 分類選擇狀態
const selectedMainCategory = ref<string>('');
const selectedSubCategories = ref<string[]>([]);

// 狀態選項
const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已上架', value: 'active' },
  { label: '已下架', value: 'inactive' },
  { label: '定時上架', value: 'scheduled' }
];

// 主分類列表
const mainCategories = [
  { name: '運動健身', code: 'SPORT' },
  { name: '烹飪美食', code: 'COOKING' },
  { name: '藝術創作', code: 'ART' },
  { name: '語言學習', code: 'LANGUAGE' },
  { name: '專業技能', code: 'PROFESSIONAL' }
];

// 子分類列表
const subCategories: Record<CourseMainCategory, { name: string; code: SubCategoryCode }[]> = {
  SPORT: [
    { name: '瑜珈', code: 'SPORT_YOGA' },
    { name: '健身', code: 'SPORT_FITNESS' },
    { name: '舞蹈', code: 'SPORT_DANCE' },
    { name: '游泳', code: 'SPORT_SWIMMING' }
  ],
  COOKING: [
    { name: '中式料理', code: 'COOKING_CHINESE' },
    { name: '西式料理', code: 'COOKING_WESTERN' },
    { name: '日式料理', code: 'COOKING_JAPANESE' },
    { name: '烘焙', code: 'COOKING_BAKING' }
  ],
  ART: [
    { name: '繪畫', code: 'ART_PAINTING' },
    { name: '手工藝', code: 'ART_CRAFT' },
    { name: '攝影', code: 'ART_PHOTO' },
    { name: '音樂', code: 'ART_MUSIC' }
  ],
  LANGUAGE: [
    { name: '英語', code: 'LANGUAGE_ENGLISH' },
    { name: '日語', code: 'LANGUAGE_JAPANESE' },
    { name: '韓語', code: 'LANGUAGE_KOREAN' },
    { name: '法語', code: 'LANGUAGE_FRENCH' }
  ],
  PROFESSIONAL: [
    { name: '程式設計', code: 'PROFESSIONAL_CODING' },
    { name: '設計', code: 'PROFESSIONAL_DESIGN' },
    { name: '行銷', code: 'PROFESSIONAL_MARKETING' },
    { name: '財務', code: 'PROFESSIONAL_FINANCE' }
  ]
};

// 地區列表
const regions = mockRegions;

// zod 表單驗證 schema
const courseSchema = z.object({
  title: z.string().min(3, '課程名稱至少需要3個字符').max(100, '課程名稱最多100個字符'),
  description: z.string().min(1, '請填寫課程描述'),
  pointsRequired: z.number().min(1, '點數價格必須大於0'),
  mainImage: z.string().min(1, '請上傳課程主圖'),
  region: z.string().min(1, '請選擇地區'),
  categories: z.array(z.string()).min(1, '請選擇至少一個分類'),
  schedule: z.array(
    z.object({
      date: z.instanceof(Date, { message: '請選擇日期' }),
      startTime: z.instanceof(Date, { message: '請選擇開始時間' }),
      endTime: z.instanceof(Date, { message: '請選擇結束時間' }),
      totalSeats: z.number().min(1, '席位數至少為1')
    })
  ).min(1, '請至少添加一個課程時段')
});

// 根據選擇的主分類過濾子分類
const filteredSubCategories = computed(() => {
  if (!selectedMainCategory.value) return [];
  return subCategories[selectedMainCategory.value as CourseMainCategory] || [];
});

// 監聽分類選擇變化，更新課程分類
watch([selectedMainCategory, selectedSubCategories], () => {
  // 將選中的主分類和子分類合併為課程分類
  const categories = [...selectedSubCategories.value];
  if (selectedMainCategory.value && !categories.includes(selectedMainCategory.value)) {
    categories.push(selectedMainCategory.value);
  }
  course.value.categories = categories;
});

// 公共方法定義
const methods = {
  // 清除所有錯誤訊息
  clearErrors() {
    Object.keys(errors).forEach(key => {
      errors[key as keyof typeof errors] = '';
    });
  },
  
  // 驗證並提取錯誤
  validateForm(data: any): { success: boolean; errors: Record<string, string> } {
    try {
      courseSchema.parse(data);
      return { success: true, errors: {} };
    } catch (error) {
      const errorMessages: Record<string, string> = {};
      
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            const field = err.path[0].toString();
            errorMessages[field] = err.message;
          }
        });
      }
      
      return { success: false, errors: errorMessages };
    }
  },
  
  // 獲取狀態標籤
  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'active': '已上架',
      'inactive': '已下架',
      'draft': '草稿',
      'scheduled': '定時上架'
    };
    return statusMap[status] || status;
  },
  
  // 獲取狀態嚴重性
  getStatusSeverity(status: string): string {
    const severityMap: Record<string, string> = {
      'active': 'success',
      'inactive': 'secondary',
      'draft': 'info',
      'scheduled': 'warning'
    };
    return severityMap[status] || 'info';
  },
  
  // 獲取地區名稱
  getRegionName(code: string): string {
    const region = regions.find(r => r.code === code);
    return region ? region.name : '未指定地區';
  },
  
  // 格式化日期
  formatDate(date: Date): string {
    if (!date) return '';
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  },
  
  // 格式化時間
  formatTime(date: Date): string {
    if (!date) return '';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },
  
  // 添加時段
  addTimeSlot(): void {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    course.value.schedule.push({
      date: new Date(),
      startTime: now,
      endTime: oneHourLater,
      totalSeats: 10
    });
  },
  
  // 移除時段
  removeTimeSlot(index: number): void {
    course.value.schedule.splice(index, 1);
  },
  
  // 上傳主圖
  uploadMainImage(): void {
    // 實際應用中應該調用文件上傳 API
    // 這裡使用模擬數據
    course.value.mainImage = 'https://via.placeholder.com/800x600?text=主圖';
  },
  
  // 上傳圖片
  uploadImage(): void {
    // 實際應用中應該調用文件上傳 API
    // 這裡使用模擬數據
    if (course.value.images.length < 5) {
      course.value.images.push(`https://via.placeholder.com/400x300?text=圖片${course.value.images.length + 1}`);
    }
  },
  
  // 移除圖片
  removeImage(index: number): void {
    course.value.images.splice(index, 1);
  },
  
  // 保存課程
  async saveCourse(): Promise<void> {
    methods.clearErrors();
    
    const validation = methods.validateForm(course.value);
    
    if (!validation.success) {
      // 更新錯誤狀態
      Object.entries(validation.errors).forEach(([field, message]) => {
        if (field in errors) {
          errors[field as keyof typeof errors] = message;
        }
      });
      
      toast.add({
        severity: 'error',
        summary: '表單驗證失敗',
        detail: '請檢查並填寫所有必填欄位',
        life: 3000
      });
      return;
    }
    
    saving.value = true;
    
    try {
      // 模擬 API 請求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 實際應用中應該調用 API 保存課程
      toast.add({
        severity: 'success',
        summary: '保存成功',
        detail: isEditMode.value ? '課程已更新' : '課程已創建',
        life: 3000
      });
      
      // 返回課程列表頁
      router.push('/merchant/courses');
    } catch (error) {
      console.error('保存課程失敗:', error);
      toast.add({
        severity: 'error',
        summary: '保存失敗',
        detail: '無法保存課程，請稍後再試',
        life: 3000
      });
    } finally {
      saving.value = false;
    }
  },
  
  // 返回上一頁
  navigateBack(): void {
    router.back();
  },
  
  // 載入課程數據
  async loadCourseData(): Promise<void> {
    if (!isEditMode.value) return;
    
    try {
      // 模擬 API 請求
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模擬課程數據
      if (courseId.value === 1) {
        course.value = {
          id: 1,
          title: '瑜珈初階班',
          description: '<p>適合初學者的瑜珈課程，從基礎姿勢開始學習。</p><p>本課程包含：</p><ul><li>基本瑜珈姿勢</li><li>呼吸技巧</li><li>放鬆練習</li></ul>',
          mainImage: 'https://via.placeholder.com/800x600?text=瑜珈課程',
          images: [
            'https://via.placeholder.com/400x300?text=瑜珈1',
            'https://via.placeholder.com/400x300?text=瑜珈2'
          ],
          status: 'active',
          pointsRequired: 25,
          region: 'TPE',
          categories: ['SPORT', 'SPORT_YOGA'],
          publishDate: null,
          schedule: [
            {
              id: 1,
              date: new Date(2023, 5, 15),
              startTime: new Date(2023, 5, 15, 10, 0),
              endTime: new Date(2023, 5, 15, 12, 0),
              totalSeats: 10
            },
            {
              id: 2,
              date: new Date(2023, 5, 22),
              startTime: new Date(2023, 5, 22, 10, 0),
              endTime: new Date(2023, 5, 22, 12, 0),
              totalSeats: 10
            }
          ]
        };
        
        // 設置分類選擇
        selectedMainCategory.value = 'SPORT';
        selectedSubCategories.value = ['SPORT_YOGA'];
      }
    } catch (error) {
      console.error('加載課程失敗:', error);
      toast.add({
        severity: 'error',
        summary: '加載失敗',
        detail: '無法加載課程數據，請稍後再試',
        life: 3000
      });
    }
  }
};

// 從 methods 中提取出常用函數，方便在模板中使用
const { 
  getStatusLabel, getStatusSeverity, getRegionName, 
  formatDate, formatTime, addTimeSlot, removeTimeSlot,
  uploadMainImage, uploadImage, removeImage, saveCourse, navigateBack
} = methods;

// 初始化
onMounted(() => methods.loadCourseData());
</script>

<style scoped>
/* Add your scoped styles here */
</style>