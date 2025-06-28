<template>
    <Toast />
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-8">
        <div class="max-w-2xl w-full p-6 bg-white rounded-lg shadow-lg">
            <div class="text-center mb-6">
                <div class="flex justify-center mb-4">
                    <router-link to="/" class="inline-block">
                        <img src="@/assets/image/pudt_logo-sm.png" alt="PUDT Logo" class="h-16" />
                    </router-link>
                </div>
                <h1 class="text-3xl font-bold text-gray-800">創建帳號</h1>
                <p class="text-gray-600 mt-2">加入 PUDT，探索更多符合您喜好的課程</p>
            </div>

            <Steps :model="steps" :activeIndex="currentStep" />

            <!-- 步驟 1: 基本資料 -->
            <div v-if="currentStep === 0" class="mt-8">
                <h2 class="text-xl font-semibold mb-4">基本資料</h2>
                <Form @submit="nextStep" :validation-schema="registerSchema">
                    <div class="space-y-4">
                        <div>
                            <IftaLabel>
                                <InputText id="name" v-model="formData.name" class="w-full" placeholder="請輸入您的姓名"
                                    :class="{ 'p-invalid': errors.name }" />
                                <label for="name">名稱</label>
                            </IftaLabel>
                            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                        </div>
                        <div>
                            <IftaLabel>
                                <InputText id="email" v-model="formData.email" type="email" class="w-full"
                                    placeholder="請輸入電子郵件" :class="{ 'p-invalid': errors.email }" />
                                <label for="email">電子郵件</label>
                            </IftaLabel>
                            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                        </div>
                        <div>
                            <IftaLabel>
                                <Password id="password" v-model="formData.password" :feedback="true" :toggleMask="true"
                                    inputClass="w-full" class="w-full" placeholder="請設定密碼"
                                    :class="{ 'p-invalid': errors.password }" />
                                <label for="password">密碼</label>
                            </IftaLabel>
                            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                            <small class="text-gray-500">密碼需至少包含 8 個字符，且包含字母和數字</small>
                        </div>

                        <div>
                            <IftaLabel>
                                <Password id="confirmPassword" v-model="formData.confirmPassword" :feedback="false"
                                    :toggleMask="true" inputClass="w-full" class="w-full" placeholder="請再次輸入密碼"
                                    :class="{ 'p-invalid': errors.confirmPassword }" />
                                <label for="confirmPassword">確認密碼</label>
                            </IftaLabel>
                            <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
                        </div>

                        <div>
                            <IftaLabel>
                                <Calendar id="birthday" v-model="formData.birthday" class="w-full" placeholder="請選擇您的生日"
                                    :maxDate="new Date()" yearRange="1900:2024" showIcon dateFormat="yy/mm/dd"
                                    :class="{ 'p-invalid': errors.birthday }" />
                                <label for="birthday">生日</label>
                            </IftaLabel>
                            <small v-if="errors.birthday" class="p-error">{{ errors.birthday }}</small>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <IftaLabel>
                                    <Select id="gender" v-model="formData.gender" :options="genderOptions"
                                        optionLabel="name" optionValue="value" placeholder="請選擇性別（選填）" class="w-full" />
                                    <label for="gender">性別</label>
                                </IftaLabel>
                            </div>

                            <div>
                                <IftaLabel>
                                    <Select id="region" v-model="formData.region" :options="locationOptions"
                                        optionLabel="name" optionValue="value" placeholder="請選擇地區（選填）" class="w-full" />
                                    <label for="region">地區</label>
                                </IftaLabel>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4">
                            <Button type="submit" label="下一步" severity="info" icon="pi pi-arrow-right"
                                iconPos="right" />
                        </div>
                    </div>
                </Form>
            </div>

            <!-- 步驟 2: 興趣選擇 -->
            <div v-else-if="currentStep === 1" class="mt-8">
                <div class="text-center mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-3">✨ 選擇您感興趣的類別</h2>
                    <p class="text-gray-600 mb-2">這將幫助我們為您推薦更符合興趣的課程</p>
                    <div class="flex items-center justify-center gap-2 text-sm">
                        <span class="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-3 py-1 rounded-full font-medium">
                            已選擇 {{ formData.interests.length }}/4
                        </span>
                        <span class="text-gray-500">最多選擇 4 個</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div v-for="(category, key) in MainCategoryLabel" :key="key"
                        class="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105"
                        :class="[
                            isInterestSelected(key) 
                                ? 'bg-gradient-to-br from-sky-400 to-sky-600 shadow-xl shadow-sky-300/50 border-2 border-sky-300' 
                                : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300'
                        ]"
                        @click="toggleInterestSelection(key)">
                        
                        <!-- 背景裝飾 -->
                        <div class="absolute inset-0 bg-gradient-to-br from-transparent to-black/5"></div>
                        
                        <!-- 選中狀態的動畫背景 -->
                        <div v-if="isInterestSelected(key)" 
                             class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
                        
                        <!-- 內容區域 -->
                        <div class="relative p-6 flex flex-col items-center text-center h-full">
                            <!-- 圖標容器 -->
                            <div class="mb-4 relative">
                                <div class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                                     :class="[
                                         isInterestSelected(key) 
                                             ? 'bg-white/20 backdrop-blur-sm' 
                                             : 'bg-gradient-to-br from-sky-100 to-sky-200 group-hover:from-sky-200 group-hover:to-sky-300'
                                     ]">
                                    <i :class="[
                                           categoryIcons[key], 
                                           'text-3xl transition-all duration-300',
                                           isInterestSelected(key) ? 'text-white' : 'text-sky-600 group-hover:text-sky-700'
                                       ]"></i>
                                </div>
                                
                                <!-- 選中狀態的勾選標記 -->
                                <div v-if="isInterestSelected(key)" 
                                     class="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <i class="pi pi-check text-sky-600 text-sm font-bold"></i>
                                </div>
                            </div>
                            
                            <!-- 類別名稱 -->
                            <h3 class="font-bold text-base transition-all duration-300"
                                :class="isInterestSelected(key) ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'">
                                {{ category }}
                            </h3>
                            
                            <!-- 描述文字 -->
                            <p class="text-xs mt-2 transition-all duration-300"
                               :class="isInterestSelected(key) ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-600'">
                                {{ getCategoryDescription(key) }}
                            </p>
                        </div>
                        
                        <!-- 選中狀態的邊框光效 -->
                        <div v-if="isInterestSelected(key)" 
                             class="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pulse"></div>
                    </div>
                </div>

                <!-- 提示訊息 -->
                <div v-if="formData.interests.length === 0" 
                     class="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                    <i class="pi pi-info-circle text-amber-500 mr-2"></i>
                    <span class="text-amber-700">請至少選擇一個興趣類別以獲得個人化推薦</span>
                </div>

                <div class="flex justify-between pt-6">
                    <Button type="button" label="返回" outlined severity="secondary" icon="pi pi-arrow-left"
                        class="px-6 py-3" @click="currentStep--" />
                    <Button type="button" label="完成註冊" severity="success" icon="pi pi-check"
                        class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        :disabled="formData.interests.length === 0"
                        @click="submitRegistration" />
                </div>
            </div>

            <!-- 步驟 3: 註冊完成 -->
            <div v-else class="mt-8 text-center">
                <div class="mb-6">
                    <i class="pi pi-check-circle text-6xl text-green-500"></i>
                </div>
                <h2 class="text-2xl font-semibold mb-2">註冊成功！</h2>
                <p class="text-gray-600 mb-6">感謝您的註冊，即將為您跳轉到首頁並顯示推薦課程</p>
                <div class="flex justify-center">
                    <Button type="button" label="開始探索" severity="success" @click="router.push('/')" />
                </div>
            </div>

            <div class="text-center mt-8">
                <p class="text-sm text-gray-600">
                    已有帳號？
                    <a @click="showLoginDialog = true" class="text-blue-600 hover:text-blue-800">
                        立即登入
                    </a>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { MainCategory, MainCategoryLabel } from '@/enums/CourseCategory';
import { number, z } from 'zod';
import { Form } from '@primevue/forms';

import Steps from 'primevue/steps';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Password from 'primevue/password';
import Select from 'primevue/select';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import { useAuthStore } from '@/stores/authStore';
import { UserGender, UserGenderLabel } from '@/enums/User';
import { RegionCode, RegionCodeLabel } from '@/enums/RegionCode';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const userStore = useUserStore();
const errors = reactive<Record<string, string>>({});
const showLoginDialog = inject('showLoginDialog');

// 步驟
const steps = [
    { label: '基本資料' },
    { label: '興趣選擇' },
    { label: '完成註冊' }
];
const currentStep = ref(0);
const loading = ref(false);

// 性別選項
const genderOptions = [
    { name: UserGenderLabel[UserGender.Male], value: UserGender.Male },
    { name: UserGenderLabel[UserGender.Female], value: UserGender.Female },
    { name: UserGenderLabel[UserGender.Other], value: UserGender.Other },
]

// 地區選項
const locationOptions = [
    { name: RegionCodeLabel.TPE, value: RegionCode.TPE },
    { name: RegionCodeLabel.KHH, value: RegionCode.KHH },
    { name: RegionCodeLabel.TNN, value: RegionCode.TNN },
    { name: RegionCodeLabel.TCH, value: RegionCode.TCH },
    { name: RegionCodeLabel.HSZ, value: RegionCode.HSZ },
    { name: RegionCodeLabel.TAO, value: RegionCode.TAO },
    { name: RegionCodeLabel.ILA, value: RegionCode.ILA },
    { name: RegionCodeLabel.HUA, value: RegionCode.HUA },
    { name: RegionCodeLabel.TTT, value: RegionCode.TTT },
    { name: RegionCodeLabel.PIF, value: RegionCode.PIF },
];

// 類別圖標映射
const categoryIcons = {
    [MainCategory.SportsFitness]: 'pi pi-bolt',
    [MainCategory.CookingCuisine]: 'pi pi-shopping-bag',
    [MainCategory.ArtDesign]: 'pi pi-palette',
    [MainCategory.PerformingArts]: 'pi pi-volume-up',
    [MainCategory.Lifestyle]: 'pi pi-heart',
    [MainCategory.TechDigital]: 'pi pi-desktop',
    [MainCategory.OutdoorAdventure]: 'pi pi-map'
};

// 類別描述映射
const getCategoryDescription = (key: string) => {
    const descriptions = {
        [MainCategory.SportsFitness]: '健身、瑜珈、運動訓練',
        [MainCategory.CookingCuisine]: '烹飪、烘焙、美食體驗',
        [MainCategory.ArtDesign]: '繪畫、攝影、手作藝術',
        [MainCategory.PerformingArts]: '音樂、舞蹈、戲劇表演',
        [MainCategory.Lifestyle]: '理財、語言、生活技能',
        [MainCategory.TechDigital]: '程式設計、數位技能',
        [MainCategory.OutdoorAdventure]: '登山、攀岩、戶外活動'
    };
    return descriptions[key as MainCategory] || '';
};

// 表單數據
const formData = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: null as Date | null,
    gender: '',
    region: '',
    interests: [] as string[]
});

// 使用 Zod 定義驗證模式
const registerSchema = z.object({
    name: z.string()
        .min(1, '請輸入您的姓名'),
    email: z.string()
        .min(1, '請輸入電子郵件')
        .email('請輸入有效的電子郵件地址'), password: z.string()
            .min(8, '密碼至少需要 8 個字符')
            .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密碼需包含字母和數字'),
    confirmPassword: z.string()
        .min(1, '請確認您的密碼'),
    birthday: z.date({
        required_error: '請選擇您的生日',
        invalid_type_error: '請輸入有效的日期'
    }).refine(date => date <= new Date(), '生日不能是未來日期')
}).refine(data => data.password === data.confirmPassword, {
    message: '密碼不匹配',
    path: ['confirmPassword']
});

// 處理下一步
const nextStep = () => {
    try {
        // 手動驗證表單數據
        registerSchema.parse(formData);
        // 驗證通過，清空錯誤並前進到下一步
        Object.keys(errors).forEach(key => delete errors[key]);
        currentStep.value++;
    } catch (validationError: any) {

        // 處理驗證錯誤
        if (validationError.errors) {
            validationError.errors.forEach((err: any) => {
                if (err.path && err.path.length > 0) {
                    errors[err.path[0]] = err.message;
                }
            });
        }
    }
};

// 興趣選擇相關方法
const isInterestSelected = (interest: string) => {
    return formData.interests.includes(interest);
};

const toggleInterestSelection = (interest: string) => {
    const index = formData.interests.indexOf(interest);
    if (index >= 0) {
        formData.interests.splice(index, 1);
    } else if (formData.interests.length < 4) {
        formData.interests.push(interest);
    } else {
        toast.add({
            severity: 'warn',
            summary: '已達上限',
            detail: '您最多只能選擇 4 個興趣類別',
            life: 3000
        });
    }

};

// 提交註冊
const submitRegistration = async () => {
    if (formData.interests.length === 0) {
        toast.add({
            severity: 'warn',
            summary: '未選擇興趣',
            detail: '請至少選擇一個興趣類別',
            life: 3000
        });
        return;
    }

    loading.value = true;

    try {
        // 註冊用戶資料
        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            birthday: formData.birthday || null,
            gender: formData.gender || undefined,
            regionCode: formData.region || undefined,
            interests: formData.interests
        };

        const result = await authStore.register(userData);

        if (result.success) {
            // 進入完成步驟
            currentStep.value++;
            toast.add({
                severity: 'success',
                summary: '註冊成功',
                detail: '歡迎加入 PUDT！',
                life: 3000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: '註冊失敗',
                detail: result.message || '請檢查您的註冊資料',
                life: 3000
            });
        }
    } catch (error) {
        console.error('註冊錯誤:', error);
        toast.add({
            severity: 'error',
            summary: '註冊錯誤',
            detail: '發生未知錯誤，請稍後再試',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

</script>

<style scoped>
:deep(.p-inputnumber-input) {
    width: 100%;
}

:deep(.p-inputtext.p-invalid) {
    border-color: var(--red-500);
}

/* 興趣類別卡片動畫 */
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
    70% {
        transform: scale(0.95);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.group {
    animation: slideInUp 0.6s ease-out forwards;
}

.group:nth-child(1) { animation-delay: 0.1s; }
.group:nth-child(2) { animation-delay: 0.2s; }
.group:nth-child(3) { animation-delay: 0.3s; }
.group:nth-child(4) { animation-delay: 0.4s; }
.group:nth-child(5) { animation-delay: 0.5s; }
.group:nth-child(6) { animation-delay: 0.6s; }
.group:nth-child(7) { animation-delay: 0.7s; }

/* 選中狀態的動畫 */
.group.selected {
    animation: bounceIn 0.5s ease-out forwards;
}

/* hover 效果增強 */
.group:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 漸層按鈕增強 */
:deep(.p-button.bg-gradient-to-r) {
    background-image: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    transition: all 0.3s ease;
}

:deep(.p-button.bg-gradient-to-r:hover) {
    background-image: linear-gradient(135deg, #059669 0%, #047857 100%);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    transform: translateY(-2px);
}

/* 計數器徽章樣式 */
.bg-gradient-to-r.from-sky-500 {
    background-image: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    box-shadow: 0 2px 10px rgba(14, 165, 233, 0.3);
}

/* 響應式優化 */
@media (max-width: 640px) {
    .group {
        padding: 1rem;
    }
    
    .group:hover {
        transform: translateY(-4px) scale(1.02);
    }
}
</style>