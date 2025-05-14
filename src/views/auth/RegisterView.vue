<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-8">
        <div class="max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
            <div class="text-center mb-6">
                <div class="flex justify-center mb-4">
                    <router-link to="/" class="inline-block">
                        <img src="../../assets/image/pudt_logo-md.png" alt="PUDT Logo" class="h-16" />
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
                                <InputText 
                                    id="name" 
                                    v-model="formData.name" 
                                    class="w-full"
                                    placeholder="請輸入您的姓名"
                                    :class="{ 'p-invalid': errors.name }"
                                />
                                <label for="name">姓名</label>
                            </IftaLabel>
                            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                        </div>

                        <div>
                            <IftaLabel>
                                <InputText 
                                    id="email" 
                                    v-model="formData.email" 
                                    type="email" 
                                    class="w-full"
                                    placeholder="請輸入電子郵件"
                                    :class="{ 'p-invalid': errors.email }"
                                />
                                <label for="email">電子郵件</label>
                            </IftaLabel>
                            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                        </div>
                        
                        <div>
                            <IftaLabel>
                                <Password 
                                    id="password" 
                                    v-model="formData.password" 
                                    :feedback="true" 
                                    :toggleMask="true"
                                    inputClass="w-full" 
                                    class="w-full"
                                    placeholder="請設定密碼"
                                    :class="{ 'p-invalid': errors.password }"
                                />
                                <label for="password">密碼</label>
                            </IftaLabel>
                            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                            <small class="text-gray-500">密碼需至少包含 8 個字符，且包含字母和數字</small>
                        </div>
                        
                        <div>
                            <IftaLabel>
                                <Password 
                                    id="confirmPassword" 
                                    v-model="formData.confirmPassword" 
                                    :feedback="false" 
                                    :toggleMask="true"
                                    inputClass="w-full" 
                                    class="w-full"
                                    placeholder="請再次輸入密碼"
                                    :class="{ 'p-invalid': errors.confirmPassword }"
                                />
                                <label for="confirmPassword">確認密碼</label>
                            </IftaLabel>
                            <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
                        </div>

                        <div>
                            <IftaLabel>
                                <InputNumber 
                                    id="age" 
                                    v-model="formData.age" 
                                    class="w-full"
                                    placeholder="請輸入您的年齡"
                                    :min="1" 
                                    :max="120"
                                    :class="{ 'p-invalid': errors.age }"
                                />
                                <label for="age">年齡</label>
                            </IftaLabel>
                            <small v-if="errors.age" class="p-error">{{ errors.age }}</small>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <IftaLabel>
                                    <Dropdown 
                                        id="gender" 
                                        v-model="formData.gender" 
                                        :options="genderOptions" 
                                        optionLabel="name"
                                        optionValue="value"
                                        placeholder="請選擇性別（選填）" 
                                        class="w-full"
                                    />
                                    <label for="gender">性別</label>
                                </IftaLabel>
                            </div>
                            
                            <div>
                                <IftaLabel>
                                    <Dropdown 
                                        id="location" 
                                        v-model="formData.location" 
                                        :options="locationOptions" 
                                        optionLabel="name"
                                        optionValue="value"
                                        placeholder="請選擇地區（選填）" 
                                        class="w-full"
                                    />
                                    <label for="location">地區</label>
                                </IftaLabel>
                            </div>
                        </div>
                        
                        <div class="flex justify-end pt-4">
                            <Button type="submit" label="下一步" severity="info" icon="pi pi-arrow-right" iconPos="right" />
                        </div>
                    </div>
                </Form>
            </div>
            
            <!-- 步驟 2: 興趣選擇 -->
            <div v-else-if="currentStep === 1" class="mt-8">
                <h2 class="text-xl font-semibold mb-4">選擇您感興趣的類別</h2>
                <p class="text-gray-600 mb-6">這將幫助我們為您推薦更符合興趣的課程（最多選擇 4 個）</p>
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div v-for="(category, key) in MainCategoryLabel" :key="key"
                        class="p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md"
                        :class="{ 'bg-blue-50 border-blue-500': isInterestSelected(key) }"
                        @click="toggleInterestSelection(key)">
                        <div class="flex flex-col items-center text-center">
                            <i :class="categoryIcons[key]" class="text-2xl mb-2"></i>
                            <span>{{ category }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between pt-4">
                    <Button type="button" label="返回" outlined severity="secondary" icon="pi pi-arrow-left" @click="currentStep--" />
                    <Button type="button" label="完成註冊" severity="success" icon="pi pi-check" @click="submitRegistration" />
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
                    <Button type="button" label="開始探索" severity="success" @click="goToHomePage" />
                </div>
            </div>
            
            <div class="text-center mt-8">
                <p class="text-sm text-gray-600">
                    已有帳號？
                    <router-link to="/login" class="text-blue-600 hover:text-blue-800">
                        立即登入
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { MainCategory, MainCategoryLabel } from '@/enums/CourseCategory';
import { z } from 'zod';
import { Form } from '@primevue/forms';

import Steps from 'primevue/steps';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Password from 'primevue/password';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const errors = reactive<Record<string, string>>({});

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
    { name: '男', value: 'male' },
    { name: '女', value: 'female' },
    { name: '其他', value: 'other' },
    { name: '不願透露', value: 'notSpecified' }
];

// 地區選項
const locationOptions = [
    { name: '台北市', value: 'taipei' },
    { name: '新北市', value: 'newTaipei' },
    { name: '桃園市', value: 'taoyuan' },
    { name: '台中市', value: 'taichung' },
    { name: '台南市', value: 'tainan' },
    { name: '高雄市', value: 'kaohsiung' },
    { name: '新竹縣/市', value: 'hsinchu' },
    { name: '其他', value: 'other' }
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

// 表單數據
const formData = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: null as number | null,
    gender: '',
    location: '',
    interests: [] as string[]
});

// 使用 Zod 定義驗證模式
const registerSchema = z.object({
    name: z.string()
        .min(1, '請輸入您的姓名'),
    email: z.string()
        .min(1, '請輸入電子郵件')
        .email('請輸入有效的電子郵件地址'),    password: z.string()
        .min(8, '密碼至少需要 8 個字符')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密碼需包含字母和數字'),
    confirmPassword: z.string()
        .min(1, '請確認您的密碼'),
    age: z.number({
        required_error: '請輸入您的年齡',
        invalid_type_error: '年齡必須是數字'
    }).min(1, '年齡必須大於或等於 1').max(120, '年齡必須小於或等於 120')
}).refine(data => data.password === data.confirmPassword, {
    message: '密碼不匹配',
    path: ['confirmPassword']
});

// 處理下一步
const nextStep = (event: any) => {
    event.preventDefault();
    
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
    } else {
        if (formData.interests.length < 4) {
            formData.interests.push(interest);
        } else {
            toast.add({
                severity: 'warn',
                summary: '已達上限',
                detail: '您最多只能選擇 4 個興趣類別',
                life: 3000
            });
        }
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
            age: formData.age,
            gender: formData.gender || undefined,
            location: formData.location || undefined,
            interests: formData.interests
        };
        
        // 在實際應用中直接調用 authStore.register
        const result = await authStore.register(userData);
        
        if (result.success) {
            // 保存用戶偏好到本地存儲，以便在首頁使用
            localStorage.setItem('userInterests', JSON.stringify(formData.interests));
            localStorage.setItem('userAge', formData.age?.toString() || '');
            
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

// 完成註冊，前往首頁
const goToHomePage = () => {
    router.push('/');
};
</script>

<style scoped>
:deep(.p-inputnumber-input) {
    width: 100%;
}

:deep(.p-inputtext:is(.p-invalid)) {
    border-color: var(--red-500);
}
</style> 