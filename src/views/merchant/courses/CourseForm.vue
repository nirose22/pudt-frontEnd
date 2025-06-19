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
                <Select id="mainCategory" v-model="selectedMainCategory" :options="mainCategories" optionLabel="name"
                  optionValue="code" placeholder="選擇主分類" class="w-full" :class="{ 'p-invalid': errors.categories }" />
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
                <label for="points" class="block mb-1 font-medium">點數價格 <span
                    class="text-red-500">*</span></label>
                <InputNumber id="points" v-model="course.points" class="w-full" :min="0" :max="1000"
                  :class="{ 'p-invalid': errors.points }" />
                <small v-if="errors.points" class="p-error">
                  {{ errors.points }}
                </small>
              </div>

              <!-- 地區 -->
              <div>
                <label for="region" class="block mb-1 font-medium">地區 <span class="text-red-500">*</span></label>
                <Select id="region" v-model="course.region" :options="regions" optionLabel="name" optionValue="code"
                  placeholder="選擇地區" class="w-full" :class="{ 'p-invalid': errors.region }" />
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
              <Editor v-model="course.description" editorStyle="height: 250px"
                :class="{ 'p-invalid': errors.description }" />
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
            <div v-if="course.sessions.length === 0" class="text-center p-4 bg-gray-50 rounded-lg">
              <i class="pi pi-calendar text-3xl text-gray-400 mb-2"></i>
              <p class="text-gray-500">尚未設定課程時段</p>
              <Button label="新增時段" icon="pi pi-plus" @click="addTimeSlot" class="mt-2" size="small" />
            </div>

            <div v-for="(slot, index) in course.sessions" :key="index" class="mb-4 p-4 border rounded-lg">
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
                    <label :for="`start-${index}`" class="block mb-1 font-medium">開始時間</label>
                    <Calendar :id="`start-${index}`" v-model="slot.start as Date" timeOnly showTime hourFormat="24"
                      class="w-full" />
                  </div>
                  <span class="mt-6">至</span>
                  <div class="flex-grow">
                    <label :for="`end-${index}`" class="block mb-1 font-medium">結束時間</label>
                    <Calendar :id="`end-${index}`" v-model="slot.end as Date" timeOnly showTime hourFormat="24"
                      class="w-full" />
                  </div>
                </div>

                <!-- 席位數 -->
                <div>
                  <label :for="`seats-${index}`" class="block mb-1 font-medium">席位數</label>
                  <InputNumber :id="`seats-${index}`" v-model="slot.seats" class="w-full" :min="1" :max="100" />
                </div>
              </div>
            </div>

            <small v-if="errors.sessions" class="p-error block mt-2">{{ errors.sessions }}</small>
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
              <Select id="status" v-model="course.status" :options="statusOptions" optionLabel="label"
                optionValue="value" class="w-full" />
            </div>

            <div v-if="course.status === 'scheduled'">
              <label for="publishDate" class="block mb-1 font-medium">預定上架時間</label>
              <Calendar id="publishDate" v-model="course.publishDate" dateFormat="yy/mm/dd" showTime hourFormat="24"
                class="w-full" />
            </div>
          </template>
        </Card>

        <!-- 課程圖片 -->
        <Card class="mb-6">
          <template #title>課程圖片</template>
          <template #content>
            <div class="mb-4">
              <label class="block mb-1 font-medium">主圖 <span class="text-red-500">*</span></label>
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                @click="uploadMainImage">
                <div v-if="!course.coverUrl">
                  <i class="pi pi-image text-3xl text-gray-400 mb-2"></i>
                  <p class="text-gray-500">點擊上傳主圖</p>
                  <p class="text-xs text-gray-400 mt-1">建議尺寸: 800x600px</p>
                </div>
                <img v-else :src="course.coverUrl" alt="主圖" class="max-h-40 mx-auto" />
              </div>
              <small v-if="errors.coverUrl" class="p-error">{{ errors.coverUrl }}</small>
            </div>

            <div>
              <label class="block mb-1 font-medium">其他圖片 (最多 5 張)</label>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="(img, index) in course.images" :key="index" class="relative">
                  <img :src="img.url" alt="課程圖片" class="w-full h-20 object-cover rounded-lg" />
                  <Button icon="pi pi-times" class="absolute top-1 right-1 w-6 h-6 p-0" text severity="danger"
                    @click="removeImage(index)" />
                </div>

                <div v-if="course.images.length < 5"
                  class="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-20"
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
          <img :src="course.coverUrl || 'https://via.placeholder.com/400x300?text=課程圖片'" alt="課程圖片"
            class="w-full rounded-lg shadow-sm" />

          <div class="grid grid-cols-5 gap-2 mt-2">
            <img v-for="(img, index) in course.images" :key="index" :src="img.url" alt="課程圖片"
              class="w-full h-16 object-cover rounded-lg cursor-pointer" />
          </div>
        </div>

        <!-- 右側內容 -->
        <div class="md:col-span-2">
          <h2 class="text-2xl font-bold mb-2">{{ course.title || '課程標題' }}</h2>
          <div class="flex items-center gap-2 mb-4">
            <Tag :severity="getStatusSeverity(course.status || '')" :value="getStatusLabel(course.status || '')" />
            <span class="text-gray-500">|</span>
            <span>{{ getRegionName(course.region || '') }}</span>
          </div>

          <div class="bg-blue-50 p-3 rounded-lg mb-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600">點數價格</div>
                <div class="text-2xl font-bold text-blue-600">{{ course.points || 0 }} 點</div>
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
            <div v-if="course.sessions.length === 0" class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500">尚未設定課程時段</p>
            </div>
            <div v-else>
              <div v-for="(slot, index) in course.sessions" :key="index" class="p-3 border-b last:border-b-0">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium">{{ formatDate(slot.date) }}</div>
                    <div class="text-sm text-gray-500">
                      {{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}
                    </div>
                  </div>
                  <div class="text-sm">
                    剩餘席位: <span class="font-medium">{{ slot.seatsLeft }}</span>
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
import { showSuccess, showError, showInfo } from '@/utils/toastHelper';
import { useMerchantStore } from '@/stores/merchantStore';
import type { Course, CourseDetailDTO } from '@/types/course';
import { CourseStatus, CourseStatusLabel } from '@/enums/Course';
import { MainCategory, MainCategoryLabel, SubCategory, SubCategoryLabel } from '@/enums/CourseCategory';
import { formatDate, formatTime } from '@/utils/dateUtils';
import {
    Card, InputText, InputNumber, Select, MultiSelect,
    Calendar, Button, Dialog, Tag
} from 'primevue';
import Editor from 'primevue/editor';
import { mockRegions } from '@/services/MockService';
import { useCourseStore } from '@/stores/courseStore';
import { RegionCode } from '@/enums';
import { CourseService } from '@/services/CourseService';

const route = useRoute();
const router = useRouter();
const merchantStore = useMerchantStore();
const courseStore = useCourseStore();

// 狀態
const showPreview = ref(false);
const saving = ref(false);

// 判斷是否為編輯模式
const isEditMode = computed(() => route.name === 'CourseEdit');
const courseId = computed(() => route.params.id ? parseInt(route.params.id as string) : 0);

// 課程數據
const course = ref<CourseDetailDTO>({
    id: 0,
    title: '',
    description: '',
    status: CourseStatus.ACTIVE,
    points: 0,
    region: '' as RegionCode,
    coverUrl: '',
    images: [],
    sessions: [],
    merchantId: 0,
    createdAt: new Date(),
    merchant: {
        id: 0,
        name: '',
        email: '',
        phone: '',
        address: '',
        createdAt: new Date(),
    }
});

// 表單錯誤訊息
const errors = reactive({
  title: '',
  description: '',
  points: '',
  coverUrl: '',
  region: '',
  categories: '',
  sessions: ''
});

// 分類選擇狀態
const selectedMainCategory = ref<string>('');
const selectedSubCategories = ref<string[]>([]);

// 狀態選項
const statusOptions = [
  { label: CourseStatusLabel[CourseStatus.DRAFT], value: CourseStatus.DRAFT },
  { label: CourseStatusLabel[CourseStatus.ACTIVE], value: CourseStatus.ACTIVE },
  { label: CourseStatusLabel[CourseStatus.INACTIVE], value: CourseStatus.INACTIVE },
  { label: CourseStatusLabel[CourseStatus.SCHEDULED], value: CourseStatus.SCHEDULED },
  
];

// 主分類列表
const mainCategories = [
  { name: MainCategoryLabel[MainCategory.SportsFitness], code: MainCategory.SportsFitness },
  { name: MainCategoryLabel[MainCategory.CookingCuisine], code: MainCategory.CookingCuisine },
  { name: MainCategoryLabel[MainCategory.ArtDesign], code: MainCategory.ArtDesign },
  { name: MainCategoryLabel[MainCategory.PerformingArts], code: MainCategory.PerformingArts },
  { name: MainCategoryLabel[MainCategory.Lifestyle], code: MainCategory.Lifestyle },
  { name: MainCategoryLabel[MainCategory.TechDigital], code: MainCategory.TechDigital },
  { name: MainCategoryLabel[MainCategory.OutdoorAdventure], code: MainCategory.OutdoorAdventure }
];

// 子分類列表
const subCategories = {
  [MainCategory.SportsFitness]: [
    { name: SubCategoryLabel[SubCategory.GroundYoga], code: SubCategory.GroundYoga },
    { name: SubCategoryLabel[SubCategory.GymTraining], code: SubCategory.GymTraining },
    { name: SubCategoryLabel[SubCategory.Swimming], code: SubCategory.Swimming },
    { name: SubCategoryLabel[SubCategory.Skateboarding], code: SubCategory.Skateboarding }
  ],
  [MainCategory.CookingCuisine]: [
    { name: SubCategoryLabel[SubCategory.BakingDessert], code: SubCategory.BakingDessert },
    { name: SubCategoryLabel[SubCategory.EthnicCuisine], code: SubCategory.EthnicCuisine },
    { name: SubCategoryLabel[SubCategory.HomeCooking], code: SubCategory.HomeCooking }
  ],
  [MainCategory.ArtDesign]: [
    { name: SubCategoryLabel[SubCategory.Photography], code: SubCategory.Photography },
    { name: SubCategoryLabel[SubCategory.Illustration], code: SubCategory.Illustration },
    { name: SubCategoryLabel[SubCategory.Ceramics], code: SubCategory.Ceramics },
    { name: SubCategoryLabel[SubCategory.FloralDesign], code: SubCategory.FloralDesign }
  ],
  [MainCategory.PerformingArts]: [
    { name: SubCategoryLabel[SubCategory.Dance], code: SubCategory.Dance },
    { name: SubCategoryLabel[SubCategory.Theatre], code: SubCategory.Theatre },
    { name: SubCategoryLabel[SubCategory.Instrument], code: SubCategory.Instrument },
    { name: SubCategoryLabel[SubCategory.Vocal], code: SubCategory.Vocal },
    { name: SubCategoryLabel[SubCategory.MusicProduction], code: SubCategory.MusicProduction }
  ],
  [MainCategory.Lifestyle]: [
    { name: SubCategoryLabel[SubCategory.FinanceInvest], code: SubCategory.FinanceInvest },
    { name: SubCategoryLabel[SubCategory.LanguageLearning], code: SubCategory.LanguageLearning }
  ],
  [MainCategory.TechDigital]: [
    { name: SubCategoryLabel[SubCategory.FrontendDev], code: SubCategory.FrontendDev },
    { name: SubCategoryLabel[SubCategory.BackendDev], code: SubCategory.BackendDev },
    { name: SubCategoryLabel[SubCategory.DigitalMarketing], code: SubCategory.DigitalMarketing },
    { name: SubCategoryLabel[SubCategory.UIUXDesign], code: SubCategory.UIUXDesign },
    { name: SubCategoryLabel[SubCategory.VideoEditing], code: SubCategory.VideoEditing }
  ],
  [MainCategory.OutdoorAdventure]: [
    { name: SubCategoryLabel[SubCategory.Bouldering], code: SubCategory.Bouldering }
  ]
};

// 地區列表
const regions = mockRegions;

// zod 表單驗證 schema
const courseSchema = z.object({
  title: z.string().min(3, '課程名稱至少需要3個字符').max(100, '課程名稱最多100個字符'),
  description: z.string().min(1, '請填寫課程描述'),
  points: z.number().min(1, '點數價格必須大於0'),
  coverUrl: z.string().min(1, '請上傳課程主圖'),
  region: z.string().min(1, '請選擇地區'),
  categories: z.array(z.string()).min(1, '請選擇至少一個分類'),
  sessions: z.array(
    z.object({
      date: z.instanceof(Date, { message: '請選擇日期' }),
      start: z.instanceof(Date, { message: '請選擇開始時間' }),
      end: z.instanceof(Date, { message: '請選擇結束時間' }),
      totalSeats: z.number().min(1, '席位數至少為1')
    })
  ).min(1, '請至少添加一個課程時段')
});

// 根據選擇的主分類過濾子分類
const filteredSubCategories = computed(() => {
  if (!selectedMainCategory.value) return [];
  return subCategories[selectedMainCategory.value as MainCategory] || [];
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

// 清除所有錯誤訊息
function clearErrors(): void {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
}

// 驗證並提取錯誤
function validateForm(data: any): { success: boolean; errors: Record<string, string> } {
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
}

// 獲取狀態標籤
function getStatusLabel(status: string): string {
  return CourseStatusLabel[status as CourseStatus];
}

// 獲取狀態嚴重性
function getStatusSeverity(status: string): string {
  const severityMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'secondary',
    'draft': 'info',
    'scheduled': 'warning'
  };
  return severityMap[status] || 'info';
}

// 獲取地區名稱
function getRegionName(code: string): string {
  const region = regions.find(r => r.code === code);
  return region ? region.name : '未指定地區';
}

// 添加時段
function addTimeSlot(): void {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  course.value.sessions.push({
    id: 0,
    courseId: course.value.id,
    date: new Date(),
    start: now.toISOString(),
    end: oneHourLater.toISOString(),
    seats: 10,
    seatsLeft: 10
  });
}

// 移除時段
function removeTimeSlot(index: number): void {
  course.value.sessions.splice(index, 1);
}

// 上傳主圖
async function uploadMainImage(): Promise<void> {
  try {
    // 模擬上傳
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新圖片 URL
    course.value.coverUrl = 'https://via.placeholder.com/800x600?text=課程主圖';
    
    showSuccess('主圖已成功上傳', '上傳成功');
  } catch (error) {
    console.error('上傳主圖失敗:', error);
    showError('無法上傳主圖，請稍後再試', '上傳失敗');
  }
}

// 上傳圖片
async function uploadImage(): Promise<void> {
  try {
    // 模擬上傳
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 添加新圖片
    course.value.images.push({
      id: 0,
      courseId: course.value.id,
      url: 'https://via.placeholder.com/400x300?text=課程圖片',
      thumbnailUrl: 'https://via.placeholder.com/400x300?text=課程圖片',
      alt: '課程圖片'
    });
    
    showSuccess('圖片已成功上傳', '上傳成功');
  } catch (error) {
    console.error('上傳圖片失敗:', error);
    showError('無法上傳圖片，請稍後再試', '上傳失敗');
  }
}

// 移除圖片
function removeImage(index: number): void {
  course.value.images.splice(index, 1);
  showInfo('圖片已移除', '已移除');
}

// 保存課程
async function saveCourse(): Promise<void> {
  if (!validateForm(course.value)) {
    return;
  }

  saving.value = true;
  try {
    if (isEditMode.value) {
      const result = await CourseService.updateCourse(courseId.value, course.value);
      if (result.success) {
        showSuccess('課程已成功更新', '更新成功');
        router.push('/merchant/courses');
      }
    } else {
      const result = await CourseService.createCourse(course.value);
      if (result.success) {
        showSuccess('課程已成功建立', '建立成功');
        router.push('/merchant/courses');
      }
    }
  } catch (error) {
    console.error('儲存課程失敗:', error);
    showError('無法儲存課程，請稍後再試', '儲存失敗');
  } finally {
    saving.value = false;
  }
}

// 返回上一頁
function navigateBack(): void {
  router.push('/merchant/courses');
}

// 載入課程數據
async function loadCourseData(): Promise<void> {
  if (!isEditMode.value) {
    return;
  }

  try {
    const result = await courseStore.loadCourseDetail(courseId.value);
    if (result.success && result.data) {
      course.value = result.data;
    }
  } catch (error) {
    console.error('加載課程數據失敗:', error);
    showError('無法加載課程數據，請稍後再試', '加載失敗');
  }
}

// 初始化
onMounted(() => loadCourseData());
</script>

<style scoped>
/* Add your scoped styles here */
</style>