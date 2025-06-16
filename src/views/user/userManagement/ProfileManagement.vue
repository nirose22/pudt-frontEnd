<template>
    <div class="flex flex-col flex-1">
        <h2 class="text-2xl font-bold mb-6 text-sky-700 flex items-center">
            <i class="pi pi-user-edit mr-2"></i>會員資料管理
        </h2>
        <Form v-slot="$form" :initialValues="form" @submit="saveProfile" :resolver="resolver"
            class="flex flex-col flex-1 justify-between">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 個人基本資料區 -->
                <div class="card p-4 shadow-sm rounded-lg border border-sky-100">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-sky-100 text-sky-700">
                        <i class="pi pi-id-card mr-2"></i>個人基本資料
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="name" class="col-span-1">
                            <div class="form-label">姓名</div>
                            <InputText class="w-full border-sky-200 focus:border-sky-500" />
                            <Message v-if="$form.name?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.name?.error?.message }}
                            </Message>
                        </FormField>

                        <FormField name="gender" class="col-span-1">
                            <div class="form-label">性別</div>
                            <Select v-model="form.gender" :options="genderOptions" optionLabel="label"
                                optionValue="value" class="w-full" />
                        </FormField>

                        <FormField name="birthday" class="col-span-1">
                            <div class="form-label">生日</div>
                            <DatePicker v-model="form.birthday" dateFormat="yy-mm-dd" class="w-full" />
                            <Message v-if="$form.birthday?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.birthday?.error?.message }}
                            </Message>
                        </FormField>
                    </div>
                </div>

                <!-- 聯絡資訊區 -->
                <div class="card p-4 shadow-sm rounded-lg border border-sky-100">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-sky-100 text-sky-700">
                        <i class="pi pi-phone mr-2"></i>聯絡資訊
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="email" class="col-span-1">
                            <div class="form-label">電子郵件</div>
                            <InputText class="w-full bg-gray-50" disabled />
                            <small class="text-gray-500">郵件地址無法修改</small>
                        </FormField>

                        <FormField name="phone" class="col-span-1">
                            <div class="form-label">手機號碼</div>
                            <InputText class="w-full border-sky-200 focus:border-sky-500" />
                            <Message v-if="$form.phone?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.phone?.error?.message }}
                            </Message>
                        </FormField>

                        <FormField name="address" class="col-span-2">
                            <div class="form-label">地址</div>
                            <InputText class="w-full border-sky-200 focus:border-sky-500" />
                            <Message v-if="$form.address?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.address?.error?.message }}
                            </Message>
                        </FormField>
                    </div>
                </div>

                <!-- 帳號安全區 -->
                <div class="card p-4 shadow-sm rounded-lg border border-sky-100">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-sky-100 text-sky-700">
                        <i class="pi pi-shield mr-2"></i>帳號安全
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="col-span-1">
                            <div class="form-label">密碼管理</div>
                            <Button label="修改密碼" icon="pi pi-lock" class="w-full !bg-sky-500 !border-sky-500" 
                                @click="showPasswordModal = true" />
                        </div>

                        <div class="col-span-1">
                            <div class="form-label">雙重驗證</div>
                            <div class="flex items-center">
                                <ToggleButton v-model="form.twoFactorEnabled" onLabel="已啟用" offLabel="未啟用"
                                    class="w-full !bg-sky-500 !text-white" onIcon="pi pi-check" offIcon="pi pi-times" />
                            </div>
                        </div>

                        <div class="col-span-2">
                            <div class="form-label">綁定社群帳號</div>
                            <div class="flex flex-wrap gap-3 mt-2">
                                <Button icon="pi pi-facebook" class="p-button-rounded !bg-sky-500 !border-sky-500"
                                    :class="{ 'p-button-outlined !bg-white !text-sky-500': !form.socialAccounts.facebook }"
                                    @click="toggleSocialAccount('facebook')" />
                                <Button icon="pi pi-google" class="p-button-rounded !bg-sky-500 !border-sky-500"
                                    :class="{ 'p-button-outlined !bg-white !text-sky-500': !form.socialAccounts.google }"
                                    @click="toggleSocialAccount('google')" />
                                <Button icon="pi pi-twitter" class="p-button-rounded !bg-sky-500 !border-sky-500"
                                    :class="{ 'p-button-outlined !bg-white !text-sky-500': !form.socialAccounts.twitter }"
                                    @click="toggleSocialAccount('twitter')" />
                                <Button icon="pi pi-instagram" class="p-button-rounded !bg-sky-500 !border-sky-500"
                                    :class="{ 'p-button-outlined !bg-white !text-sky-500': !form.socialAccounts.instagram }"
                                    @click="toggleSocialAccount('instagram')" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 興趣偏好設定 -->
                <div class="card p-4 shadow-sm rounded-lg border border-sky-100">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-sky-100 flex justify-between items-center text-sky-700">
                        <span><i class="pi pi-heart mr-2"></i>興趣偏好設定</span>
                        <Button label="選擇興趣標籤" icon="pi pi-tags" size="small" @click="showInterestsModal = true" 
                            class="!bg-sky-500 !border-sky-500" />
                    </h3>
                    
                    <!-- 已選興趣標籤預覽區 -->
                    <div v-if="form.interests.subCategories.length > 0" class="mb-4">
                        <div class="form-label flex justify-between">
                            <span>已選擇的興趣標籤</span>
                            <span class="text-sm text-sky-600 font-medium">
                                {{ form.interests.subCategories.length }} 個標籤
                            </span>
                        </div>
                        <div class="flex flex-wrap gap-2 p-3 border rounded-lg bg-sky-50 border-sky-100">
                            <Chip v-for="subCat in form.interests.subCategories" :key="subCat"
                                :label="getSubCategoryLabel(subCat)" removable
                                @remove="removeSubCategory(subCat)" 
                                class="!bg-white border border-sky-100" />
                        </div>
                    </div>
                    
                    <!-- 摘要信息 -->
                    <div v-if="form.interests.categories.length > 0" class="mb-4">
                        <div class="form-label">興趣類別摘要</div>
                        <div class="flex flex-wrap gap-2">
                            <Chip v-for="cat in form.interests.categories" :key="cat" 
                                  :label="getMainCategoryLabel(cat)"
                                  class="!bg-sky-100 !text-sky-700" />
                        </div>
                    </div>
                    
                    <div v-if="form.interests.categories.length === 0" class="text-center p-4 border rounded-lg bg-sky-50 border-sky-100">
                        <p class="text-gray-600 mb-2">您尚未選擇任何興趣標籤</p>
                        <p class="text-gray-500 text-sm mb-4">設定您的興趣標籤可以獲得更精準的個人化推薦</p>
                        <Button label="選擇興趣標籤" icon="pi pi-plus" @click="showInterestsModal = true" 
                            class="!bg-sky-500 !border-sky-500" />
                    </div>
                </div>

                <!-- 通知設定 -->
                <div class="card p-4 shadow-sm rounded-lg col-span-1 lg:col-span-2 border border-sky-100">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-sky-100 text-sky-700">
                        <i class="pi pi-bell mr-2"></i>通知設定
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">電子郵件通知</h4>
                                <p class="text-sm text-gray-500">接收系統重要通知</p>
                            </div>
                            <InputSwitch v-model="form.notifications.email" class="!bg-sky-500" />
                        </div>

                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">推播通知</h4>
                                <p class="text-sm text-gray-500">即時接收最新消息</p>
                            </div>
                            <InputSwitch v-model="form.notifications.push" class="!bg-sky-500" />
                        </div>

                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">活動提醒</h4>
                                <p class="text-sm text-gray-500">課程與活動開始前提醒</p>
                            </div>
                            <InputSwitch v-model="form.notifications.activity" class="!bg-sky-500" />
                        </div>

                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">優惠資訊</h4>
                                <p class="text-sm text-gray-500">最新優惠與促銷通知</p>
                            </div>
                            <InputSwitch v-model="form.notifications.promotion" class="!bg-sky-500" />
                        </div>

                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">新課程通知</h4>
                                <p class="text-sm text-gray-500">新課程上架時通知</p>
                            </div>
                            <InputSwitch v-model="form.notifications.newCourse" class="!bg-sky-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 flex justify-end">
                <Button label="取消" icon="pi pi-times" class="p-button-text mr-2" @click="resetForm" size="large" />
                <Button label="儲存修改" icon="pi pi-check" type="submit" size="large" class="!bg-sky-500 !border-sky-500" />
            </div>
        </Form>

        <!-- 密碼修改對話框 -->
        <Dialog v-model:visible="showPasswordModal" header="修改密碼" :modal="true" :draggable="false" class="w-xl"
            :resizable="false" :contentStyle="{ 'background-color': '#f8fafc' }">
            <div class="space-y-4 p-4">
                <Form v-slot="$form" :initialValues="passwordForm" @submit="submitPasswordChange"
                    :resolver="passwordResolver">
                    <div class="flex flex-col gap-4">
                        <FormField name="password">
                            <div class="form-label">新密碼</div>
                            <InputText type="password" placeholder="新密碼" class="w-full border-sky-200 focus:border-sky-500" />
                            <Message v-if="$form.password?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.password?.error?.message }}
                            </Message>
                        </FormField>

                        <FormField name="confirmPassword">
                            <div class="form-label">確認新密碼</div>
                            <InputText type="password" placeholder="確認新密碼" class="w-full border-sky-200 focus:border-sky-500" />
                            <Message v-if="$form.confirmPassword?.invalid" severity="secondary" size="small"
                                variant="simple">
                                {{ $form.confirmPassword?.error?.message }}
                            </Message>
                        </FormField>
                    </div>
                    <div class="mt-10 flex justify-end">
                        <Button label="取消" icon="pi pi-times" class="p-button-text mr-2"
                            @click="showPasswordModal = false" />
                        <Button label="儲存修改" icon="pi pi-check" type="submit" class="!bg-sky-500 !border-sky-500" />
                    </div>
                </Form>
            </div>
        </Dialog>

        <!-- 興趣標籤選擇對話框 -->
        <Dialog v-model:visible="showInterestsModal" header="選擇您的興趣標籤" :modal="true" :closable="true"
            class="w-full md:w-4/5 lg:w-3/4" :draggable="false" :resizable="false" 
            :contentStyle="{ 'background-color': '#f8fafc' }">
            <div class="p-4">
                <!-- 統計和提示信息 -->
                <div class="bg-sky-50 p-3 rounded-lg mb-4 border border-sky-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <p class="font-medium">已選擇 <span class="text-sky-700">{{ form.interests.categories.length }}</span> 個類別，
                        <span class="text-sky-700">{{ form.interests.subCategories.length }}</span> 個標籤</p>
                        <p class="text-sm text-gray-600">選擇您喜歡的類別和標籤，系統將為您推薦相關課程</p>
                    </div>
                    <Button v-if="form.interests.categories.length > 0 || form.interests.subCategories.length > 0"
                        label="清空所有選擇" icon="pi pi-trash" text severity="danger" @click="clearAllInterests" />
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <!-- 左側：主分類選擇區 -->
                    <div class="col-span-1 border rounded-lg p-3 border-sky-100">
                        <h4 class="text-lg font-medium mb-3 pb-2 border-b border-sky-100 text-sky-700">興趣類別</h4>
                        <div class="flex flex-wrap gap-2">
                            <Chip v-for="cat in mainCategoryOptions" :key="cat.value" :label="cat.label"
                                :class="{ 'chip-selected': form.interests.categories.includes(cat.value as MainCategory), 'hover:!bg-sky-100': !form.interests.categories.includes(cat.value as MainCategory) }"
                                @click="toggleMainCategory(cat.value)" />
                        </div>
                    </div>

                    <!-- 中間：子分類選擇區 -->
                    <div class="lg:col-span-2 border rounded-lg p-3 border-sky-100">
                        <h4 class="text-lg font-medium mb-3 pb-2 border-b border-sky-100 text-sky-700">詳細興趣標籤</h4>
                        
                        <div v-if="form.interests.categories.length === 0" class="text-center p-4">
                            <p class="text-gray-500">請先從左側選擇興趣類別</p>
                        </div>
                        
                        <Accordion v-else :multiple="true" class="interest-accordion">
                            <AccordionPanel v-for="mainCat in form.interests.categories" :key="mainCat" :value="mainCat">
                                <div class="flex justify-between items-center w-full" slot="header">
                                    <span>{{ getMainCategoryLabel(mainCat) }}</span>
                                    <Badge :value="getSubCategoriesCount(mainCat)" class="ml-2" severity="info" />
                                </div>
                                
                                <div class="flex flex-wrap gap-2 p-2">
                                    <Chip v-for="subCat in getSubCategoriesForMainCategory(mainCat)" :key="subCat.value"
                                        :label="subCat.label"
                                        :class="{ 'chip-selected': form.interests.subCategories.includes(subCat.value), 'hover:!bg-sky-100': !form.interests.subCategories.includes(subCat.value) }"
                                        @click="toggleSubCategory(subCat.value)" />
                                </div>
                                
                                <div class="mt-2 flex justify-between">
                                    <Button label="全選" icon="pi pi-check-circle" size="small" text
                                        @click="selectAllSubCategories(mainCat)" class="!text-sky-600" />
                                    <Button label="取消全選" icon="pi pi-times-circle" size="small" text
                                        @click="deselectAllSubCategories(mainCat)" class="!text-sky-600" />
                                </div>
                            </AccordionPanel>
                        </Accordion>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between w-full">
                    <small class="text-gray-500 self-center">
                        提示：選擇感興趣的標籤，系統將為您提供個人化的課程推薦
                    </small>
                    <div>
                        <Button label="取消" icon="pi pi-times" class="p-button-text" @click="showInterestsModal = false" />
                        <Button label="確認" icon="pi pi-check" @click="confirmInterests" class="!bg-sky-500 !border-sky-500" />
                    </div>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { type PropType } from 'vue';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import InputSwitch from 'primevue/inputswitch';
import ToggleButton from 'primevue/togglebutton';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import type { User } from '@/types';
import { useToast } from 'primevue/usetoast';
import { Form, FormField } from '@primevue/forms';
import Dialog from 'primevue/dialog';
import { UserGender, UserGenderLabel, UserGenderLabelShort } from '@/enums/User';
import { MainCategory, MainCategoryLabel, SubCategory, SubCategoryLabel } from '@/enums/CourseCategory';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import Badge from 'primevue/badge';
import { showSuccess, showError, showInfo, initToastSafely } from '@/utils/toastHelper';

// 初始化 toast
const toast = useToast();

// 直接使用 stores
const userStore = useUserStore();
const authStore = useAuthStore();

// 計算屬性 - 用戶資料
const profile = computed(() => userStore.user);

// 業務方法 - 更新用戶資料
const updateProfile = async (updatedProfile: Partial<User>) => {
    const res = await userStore.updateProfile(updatedProfile);
    if (res.success) {
        showSuccess(res.message || '個人資料更新成功', '成功');
    } else {
        showError(res.message || '個人資料更新失敗', '失敗');
    }
};

// 初始化數據
onMounted(() => {
    if (authStore.isLoggedIn) {
        userStore.fetchProfile();
    }
});

// 擴展 User 類型，添加新的欄位
interface ExtendedUser extends Omit<User, 'birthday' | 'createdAt'> {
    birthday: Date;
    createdAt: Date;
    twoFactorEnabled: boolean;
    socialAccounts: {
        facebook: boolean;
        google: boolean;
        twitter: boolean;
        instagram: boolean;
    };
    interests: {
        categories: MainCategory[]; // 主分類
        subCategories: string[]; // 子分類
    };
    notifications: {
        email: boolean;
        push: boolean;
        activity: boolean;
        promotion: boolean;
        newCourse: boolean;
    };
}

const showPasswordModal = ref(false);
const showInterestsModal = ref(false);

// 將主分類轉換為選項格式
const mainCategoryOptions = Object.entries(MainCategoryLabel).map(([value, label]) => ({
    label,
    value
}));

// 獲取各種標籤名稱的函數
const getMainCategoryLabel = (code: string): string => {
    return MainCategoryLabel[code as MainCategory] || code;
};

const getSubCategoryLabel = (code: string): string => {
    return SubCategoryLabel[code as SubCategory] || code;
};

// 計算某主分類下已選擇的子分類數量
const getSubCategoriesCount = (mainCat: string): number => {
    return form.interests.subCategories.filter(subCat => subCat.startsWith(mainCat)).length;
};

// 根據主分類獲取相關子分類的選項
const getSubCategoriesForMainCategory = (mainCatCode: string) => {
    return Object.entries(SubCategoryLabel)
        .filter(([value]) => value.startsWith(mainCatCode))
        .map(([value, label]) => ({
            label,
            value
        }));
};

// 表單數據
const form = reactive<ExtendedUser>({
    ...profile.value as User,
    id: profile.value?.id ?? 0,
    name: profile.value?.name ?? '',
    gender: profile.value?.gender ?? UserGender.Other,
    birthday: profile.value?.birthday ? new Date(profile.value.birthday) : new Date(),
    address: profile.value?.address ?? '',
    email: profile.value?.email ?? '',
    phone: profile.value?.phone ?? '',
    points: profile.value?.points ?? 0,
    createdAt: profile.value?.createdAt ? new Date(profile.value.createdAt) : new Date(),
    // 新增欄位的默認值
    twoFactorEnabled: false,
    socialAccounts: {
        facebook: false,
        google: false,
        twitter: false,
        instagram: false
    },
    interests: {
        categories: [],  // 主分類
        subCategories: [] // 子分類
    },
    notifications: {
        email: true,
        push: true,
        activity: true,
        promotion: false,
        newCourse: true
    }
});

// 臨時保存興趣數據，用於對話框操作
const tempInterests = reactive({
    categories: [] as string[],
    subCategories: [] as string[]
});

// 當對話框開啟時保存當前選擇
const openInterestsModal = () => {
    tempInterests.categories = [...form.interests.categories];
    tempInterests.subCategories = [...form.interests.subCategories];
    showInterestsModal.value = true;
};

// 確認興趣選擇
const confirmInterests = () => {
    // 已經在操作中直接修改了form.interests，所以此處只要保存即可
    saveUserInterests();
    showInterestsModal.value = false;
    showSuccess('興趣標籤已更新', '偏好設定');
};

// 選擇某主分類下的所有子分類
const selectAllSubCategories = (mainCat: string) => {
    const allSubCats = Object.keys(SubCategoryLabel)
        .filter(key => key.startsWith(mainCat));
    
    // 添加尚未選中的子分類
    allSubCats.forEach(subCat => {
        if (!form.interests.subCategories.includes(subCat)) {
            form.interests.subCategories.push(subCat);
        }
    });
    
    showInfo(`已選擇「${getMainCategoryLabel(mainCat)}」下的所有標籤`, '標籤更新');
};

// 取消選擇某主分類下的所有子分類
const deselectAllSubCategories = (mainCat: string) => {
    form.interests.subCategories = form.interests.subCategories.filter(
        subCat => !subCat.startsWith(mainCat)
    );
    
    // 如果沒有該主分類下的子分類，可以選擇是否要移除主分類
    // 這裡選擇保留主分類，讓用戶能夠更方便地重新選擇
    
    showInfo(`已移除「${getMainCategoryLabel(mainCat)}」下的所有標籤`, '標籤更新');
};

// 清空所有興趣選擇
const clearAllInterests = () => {
    form.interests.categories = [];
    form.interests.subCategories = [];
    showInfo('已清空所有興趣標籤', '標籤更新');
};

const passwordForm = reactive({
    password: '',
    confirmPassword: ''
});

// 表單驗證
const resolver = zodResolver(
    z.object({
        name: z.string({ required_error: '姓名為必填欄位' })
            .regex(
                /^[a-zA-Z0-9_]*$/,
                '只能包含英文、數字及底線，不可包含空白及特殊符號'
            ),
        phone: z.string().min(1, { message: '手機號碼不能為空' }),
        birthday: z.date().max(new Date(), { message: '生日不能早於今天' }).optional(),
        address: z.string().min(1, { message: '地址不能為空' }).optional(),
        gender: z.nativeEnum(UserGender).optional()
    })
);

const passwordResolver = zodResolver(
    z.object({
        password: z.string().min(6, { message: '密碼不能少於6個字' }),
        confirmPassword: z.string().min(6, { message: '密碼不能少於6個字' }),
    }).refine(
        ({ confirmPassword, password }) => {
            return confirmPassword === password
        },
        {
            path: ["confirmPassword"],
            message: "密碼不一致",
        }
    )
);

const genderOptions = [
    { label: UserGenderLabelShort.M, value: UserGender.Male },
    { label: UserGenderLabelShort.F, value: UserGender.Female },
    { label: UserGenderLabelShort.O, value: UserGender.Other },
    { label: UserGenderLabelShort.ND, value: UserGender.NotDisclosed }
];

// 切換社群帳號綁定狀態
const toggleSocialAccount = (platform: keyof typeof form.socialAccounts) => {
    form.socialAccounts[platform] = !form.socialAccounts[platform];

    if (form.socialAccounts[platform]) {
        // 模擬綁定社群帳號的流程
        showInfo(`正在連接 ${platform} 帳號...`, '社群帳號綁定');
    } else {
        // 模擬解除綁定社群帳號的流程
        showInfo(`已解除 ${platform} 帳號綁定`, '社群帳號解除綁定');
    }
};

// 切換主分類
const toggleMainCategory = (category: string) => {
    const index = form.interests.categories.indexOf(category as MainCategory);
    if (index === -1) {
        // 添加主分類
        form.interests.categories.push(category as MainCategory);
        
        // 不自動選中該主分類下的所有子分類，讓用戶自己選擇
    } else {
        // 移除主分類
        form.interests.categories.splice(index, 1);
        
        // 同時移除該主分類下的所有子分類
        form.interests.subCategories = form.interests.subCategories.filter(
            subCat => !subCat.startsWith(category)
        );
    }
};

// 切換子分類
const toggleSubCategory = (subCategory: string) => {
    const index = form.interests.subCategories.indexOf(subCategory);
    if (index === -1) {
        // 添加子分類
        form.interests.subCategories.push(subCategory);
        
        // 確保主分類已選中
        const mainCat = subCategory.split('_')[0];
        if (!form.interests.categories.includes(mainCat)) {
            form.interests.categories.push(mainCat);
        }
    } else {
        // 移除子分類
        form.interests.subCategories.splice(index, 1);
    }
};

// 直接移除子分類
const removeSubCategory = (subCategory: string) => {
    const index = form.interests.subCategories.indexOf(subCategory);
    if (index !== -1) {
        form.interests.subCategories.splice(index, 1);
        
        // 檢查是否需要移除主分類（如果該主分類下的所有子分類都被移除）
        const mainCat = subCategory.split('_')[0];
        const hasOtherSubCats = form.interests.subCategories.some(
            sc => sc.startsWith(mainCat)
        );
        
        if (!hasOtherSubCats) {
            // 提示用戶這個主分類下沒有選擇任何子分類
            showInfo(`您已移除「${getMainCategoryLabel(mainCat)}」分類下的所有標籤`, '提示');
        }
        
        // 保存到localStorage和userStore
        saveUserInterests();
    }
};

// 保存用户兴趣到localStorage和userStore
const saveUserInterests = () => {
    // 使用userStore更新用户兴趣
    userStore.updateInterests(form.interests.categories);
    // 將子分類儲存到localStorage (userStore目前只保存主分類)
    localStorage.setItem('userInterestsTags', JSON.stringify(form.interests.subCategories));
};

// 提交密碼變更
const submitPasswordChange = ({ valid }: any) => {
    if (!valid) {
        showError('請檢查輸入資料');
        return;
    }

    // 模擬 API 調用
    setTimeout(() => {
        showSuccess('密碼已修改');
        showPasswordModal.value = false;
        passwordForm.password = '';
        passwordForm.confirmPassword = '';
    }, 1000);
};

// 重置表單
const resetForm = () => {
    // 只重置基本資料，保留其他設定
    if (profile.value) {
        form.name = profile.value.name || '';
        form.gender = profile.value.gender || UserGender.Other;
        form.birthday = profile.value.birthday ? new Date(profile.value.birthday) : new Date();
        form.address = profile.value.address || '';
        form.phone = profile.value.phone || '';
    }

    showInfo('表單已重置為原始資料', '已重置');
};

// 儲存個人資料
const saveProfile = (values: any) => {
    if (!updateProfile) return;
    
    // 合併基本資料和擴展資料
    const profileData = {
        ...values,
        twoFactorEnabled: form.twoFactorEnabled,
        socialAccounts: form.socialAccounts,
        interests: form.interests,
        notifications: form.notifications
    };
    
    // 保存兴趣标签到localStorage和userStore
    saveUserInterests();
    
    updateProfile(profileData);
};
</script>

<style scoped>
@reference "tailwindcss";

.form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
}

.card {
    @apply bg-white;
}

:deep(.p-chip) {
    @apply cursor-pointer transition-colors;
}

.chip-selected {
    @apply bg-sky-500 text-white;
}

:deep(.p-chip.chip-selected .p-chip-text) {
    @apply text-white;
}

:deep(.p-chip.p-chip-removable:not(.chip-selected)) {
    @apply bg-gray-100 hover:bg-gray-200;
}

:deep(.p-chip.p-chip-removable.chip-selected) {
    @apply hover:bg-sky-600;
}

:deep(.interest-accordion .p-accordion-header-link) {
    @apply py-3;
}

:deep(.interest-accordion .p-accordion-content) {
    @apply p-3;
}

:deep(.p-accordion-header-link) {
    @apply border-sky-100;
}

:deep(.p-accordion-header-link:focus) {
    @apply shadow-none ring-sky-200;
}

:deep(.p-accordion-header-link.p-highlight) {
    @apply bg-sky-50 border-sky-200;
}

:deep(.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
    @apply bg-sky-500 border-sky-500;
}

:deep(.p-togglebutton.p-highlight) {
    @apply bg-sky-500 border-sky-500 text-white;
}

:deep(.p-inputtext:enabled:focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}

:deep(.p-datepicker:not(.p-disabled):focus) {
    @apply border-sky-500 shadow-none ring-1 ring-sky-200;
}
</style>