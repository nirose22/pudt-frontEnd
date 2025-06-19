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
                    <div class="grid grid-cols-1 gap-4">
                        <FormField name="email" class="col-span-1">
                            <div class="form-label">電子郵件</div>
                            <InputText class="w-full bg-gray-50" disabled />
                            <small class="text-gray-500">郵件地址無法修改</small>
                        </FormField>

                        <!-- <FormField name="phone" class="col-span-1">
                            <div class="form-label">手機號碼</div>
                            <InputText class="w-full border-sky-200 focus:border-sky-500" />
                            <Message v-if="$form.phone?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.phone?.error?.message }}
                            </Message>
                        </FormField> -->

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
                        <Button label="設定興趣偏好" icon="pi pi-tags" size="small" @click="showInterestsModal = true" 
                            class="!bg-sky-500 !border-sky-500" />
                    </h3>
                    
                    <!-- 已選興趣偏好預覽區 -->
                    <div v-if="form.interests.categories.length > 0" class="mb-4">
                        <div class="form-label flex justify-between">
                            <span>您的興趣偏好順序</span>
                            <span class="text-sm text-sky-600 font-medium">
                                {{ form.interests.categories.length }} 個興趣類別
                            </span>
                        </div>
                        <div class="space-y-2 p-3 border rounded-lg bg-sky-50 border-sky-100">
                            <div v-for="(cat, index) in form.interests.categories" :key="cat"
                                class="flex items-center justify-between p-2 bg-white rounded border border-sky-100">
                                <div class="flex items-center gap-3">
                                    <span class="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {{ index + 1 }}
                                    </span>
                                    <span class="font-medium text-sky-700">{{ getMainCategoryLabel(cat) }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Button icon="pi pi-chevron-up" size="small" text @click="moveInterestUp(index)" 
                                        :disabled="index === 0" class="!text-sky-600" />
                                    <Button icon="pi pi-chevron-down" size="small" text @click="moveInterestDown(index)" 
                                        :disabled="index === form.interests.categories.length - 1" class="!text-sky-600" />
                                    <Button icon="pi pi-times" size="small" text severity="danger" 
                                        @click="removeInterestCategory(cat)" class="!text-red-500" />
                                </div>
                            </div>
                        </div>
                        <small class="text-gray-500 mt-2 block">排序越前面的興趣，推薦權重越高</small>
                    </div>
                    
                    <div v-if="form.interests.categories.length === 0" class="text-center p-4 border rounded-lg bg-sky-50 border-sky-100">
                        <p class="text-gray-600 mb-2">您尚未設定興趣偏好</p>
                        <p class="text-gray-500 text-sm mb-4">設定您的興趣偏好順序可以獲得更精準的個人化推薦</p>
                        <Button label="設定興趣偏好" icon="pi pi-plus" @click="showInterestsModal = true" 
                            class="!bg-sky-500 !border-sky-500" />
                    </div>
                </div>

                <!-- 地區偏好設定 -->
                <div class="card p-4 shadow-sm rounded-lg border border-sky-100">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-sky-100 flex justify-between items-center text-sky-700">
                        <span><i class="pi pi-map-marker mr-2"></i>地區偏好設定</span>
                        <Button label="選擇偏好地區" icon="pi pi-map" size="small" @click="showRegionsModal = true" 
                            class="!bg-sky-500 !border-sky-500" />
                    </h3>
                    
                    <!-- 已選地區偏好預覽區 -->
                    <div v-if="form.preferences.preferredRegions.length > 0" class="mb-4">
                        <div class="form-label flex justify-between">
                            <span>已選擇的偏好地區</span>
                            <span class="text-sm text-sky-600 font-medium">
                                {{ form.preferences.preferredRegions.length }} 個地區
                            </span>
                        </div>
                        <div class="flex flex-wrap gap-2 p-3 border rounded-lg bg-sky-50 border-sky-100">
                            <Chip v-for="region in form.preferences.preferredRegions" :key="region"
                                :label="getRegionLabel(region)" removable
                                @remove="removePreferredRegion(region)" 
                                class="!bg-white border border-sky-100" />
                        </div>
                    </div>
                    
                    <div v-if="form.preferences.preferredRegions.length === 0" class="text-center p-4 border rounded-lg bg-sky-50 border-sky-100">
                        <p class="text-gray-600 mb-2">您尚未設定偏好地區</p>
                        <p class="text-gray-500 text-sm mb-4">設定偏好地區可以優先推薦您附近的課程</p>
                        <Button label="選擇偏好地區" icon="pi pi-plus" @click="showRegionsModal = true" 
                            class="!bg-sky-500 !border-sky-500" />
                    </div>
                </div>

                <!-- 通知設定 -->
                <div class="card p-4 shadow-sm rounded-lg border border-sky-100">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b border-sky-100 text-sky-700">
                        <i class="pi pi-bell mr-2"></i>通知設定
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2  gap-4">
                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">電子郵件通知</h4>
                                <p class="text-sm text-gray-500">接收系統重要通知</p>
                            </div>
                            <InputSwitch v-model="form.notifications.email"/>
                        </div>

                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">推播通知</h4>
                                <p class="text-sm text-gray-500">即時接收最新消息</p>
                            </div>
                            <InputSwitch v-model="form.notifications.push"/>
                        </div>

                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">活動提醒</h4>
                                <p class="text-sm text-gray-500">課程與活動開始前提醒</p>
                            </div>
                            <InputSwitch v-model="form.notifications.activity"/>
                        </div>


                        <div class="flex items-center justify-between p-3 border rounded-lg border-sky-100 bg-white hover:bg-sky-50 transition-colors">
                            <div>
                                <h4 class="font-medium text-sky-700">新課程通知</h4>
                                <p class="text-sm text-gray-500">新課程上架時通知</p>
                            </div>
                            <InputSwitch v-model="form.notifications.newCourse"/>
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

        <!-- 興趣偏好選擇對話框 -->
        <Dialog v-model:visible="showInterestsModal" header="設定您的興趣偏好順序" :modal="true" :closable="true"
            class="w-full md:w-3/5 lg:w-1/2" :draggable="false" :resizable="false" 
            :contentStyle="{ 'background-color': '#f8fafc' }">
            <div class="p-4">
                <!-- 統計和提示信息 -->
                <div class="bg-sky-50 p-3 rounded-lg mb-4 border border-sky-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <p class="font-medium">已選擇 <span class="text-sky-700">{{ form.interests.categories.length }}</span> 個興趣類別</p>
                        <p class="text-sm text-gray-600">選擇您喜歡的興趣類別，排序前面的類別將獲得更高的推薦權重</p>
                    </div>
                    <Button v-if="form.interests.categories.length > 0"
                        label="清空所有選擇" icon="pi pi-trash" text severity="danger" @click="clearAllInterests" />
                </div>

                <!-- 主分類選擇區 -->
                <div class="border rounded-lg p-4 border-sky-100 mb-4">
                    <h4 class="text-lg font-medium mb-3 pb-2 border-b border-sky-100 text-sky-700">
                        <i class="pi pi-heart mr-2"></i>興趣類別
                    </h4>
                        <div class="flex flex-wrap gap-2">
                            <Chip v-for="cat in mainCategoryOptions" :key="cat.value" :label="cat.label"
                                :class="{ 'chip-selected': form.interests.categories.includes(cat.value as MainCategory), 'hover:!bg-sky-100': !form.interests.categories.includes(cat.value as MainCategory) }"
                                @click="toggleMainCategory(cat.value)" />
                        </div>
                    </div>

                <!-- 已選興趣排序區 -->
                <div v-if="form.interests.categories.length > 0" class="border rounded-lg p-4 border-sky-100">
                    <h4 class="text-lg font-medium mb-3 pb-2 border-b border-sky-100 text-sky-700">
                        <i class="pi pi-sort mr-2"></i>偏好順序
                    </h4>
                    <div class="space-y-2">
                        <div v-for="(cat, index) in form.interests.categories" :key="cat"
                            class="flex items-center justify-between p-2 bg-white rounded border border-sky-100">
                            <div class="flex items-center gap-3">
                                <span class="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {{ index + 1 }}
                                </span>
                                <span class="font-medium text-sky-700">{{ getMainCategoryLabel(cat) }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <Button icon="pi pi-chevron-up" size="small" text @click="moveInterestUp(index)" 
                                    :disabled="index === 0" class="!text-sky-600" />
                                <Button icon="pi pi-chevron-down" size="small" text @click="moveInterestDown(index)" 
                                    :disabled="index === form.interests.categories.length - 1" class="!text-sky-600" />
                                <Button icon="pi pi-times" size="small" text severity="danger" 
                                    @click="removeInterestCategory(cat)" class="!text-red-500" />
                            </div>
                        </div>
                    </div>
                    <small class="text-gray-500 mt-2 block">拖拽或使用箭頭調整順序，排序越前面推薦權重越高</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between w-full">
                    <small class="text-gray-500 self-center">
                        提示：選擇並排序您的興趣偏好，系統將提供個人化的課程推薦
                    </small>
                    <div>
                        <Button label="取消" icon="pi pi-times" class="p-button-text" @click="showInterestsModal = false" />
                        <Button label="確認" icon="pi pi-check" @click="confirmInterests" class="!bg-sky-500 !border-sky-500" />
                    </div>
                </div>
            </template>
        </Dialog>

        <!-- 地區偏好選擇對話框 -->
        <Dialog v-model:visible="showRegionsModal" header="選擇您的偏好地區" :modal="true" :closable="true"
            class="w-full md:w-3/5 lg:w-1/2" :draggable="false" :resizable="false" 
            :contentStyle="{ 'background-color': '#f8fafc' }">
            <div class="p-4">
                <!-- 統計和提示信息 -->
                <div class="bg-sky-50 p-3 rounded-lg mb-4 border border-sky-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <p class="font-medium">已選擇 <span class="text-sky-700">{{ form.preferences.preferredRegions.length }}</span> 個偏好地區</p>
                        <p class="text-sm text-gray-600">選擇您偏好的地區，系統將優先推薦這些地區的課程</p>
                    </div>
                    <Button v-if="form.preferences.preferredRegions.length > 0"
                        label="清空所有選擇" icon="pi pi-trash" text severity="danger" @click="clearAllRegions" />
                </div>

                <!-- 地區選擇區 -->
                <div class="border rounded-lg p-4 border-sky-100">
                    <h4 class="text-lg font-medium mb-3 pb-2 border-b border-sky-100 text-sky-700">
                        <i class="pi pi-map mr-2"></i>台灣地區
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        <Chip v-for="region in regionOptions" :key="region.value" :label="region.label"
                            :class="{ 'chip-selected': form.preferences.preferredRegions.includes(region.value), 'hover:!bg-sky-100': !form.preferences.preferredRegions.includes(region.value) }"
                            @click="togglePreferredRegion(region.value)" />
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between w-full">
                    <small class="text-gray-500 self-center">
                        提示：選擇您經常活動或偏好的地區，系統將優先推薦這些地區的課程
                    </small>
                    <div>
                        <Button label="取消" icon="pi pi-times" class="p-button-text" @click="showRegionsModal = false" />
                        <Button label="確認" icon="pi pi-check" @click="confirmRegions" class="!bg-sky-500 !border-sky-500" />
                    </div>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
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
import type { User, UserUpdateRequest } from '@/types';
import { Form, FormField } from '@primevue/forms';
import Dialog from 'primevue/dialog';
import { UserGender, UserGenderLabelShort } from '@/enums/User';
import { MainCategory, MainCategoryLabel } from '@/enums/CourseCategory';
import { RegionCode, RegionCodeLabel } from '@/enums/RegionCode';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/UserService';
import { showSuccess, showError, showInfo } from '@/utils/toastHelper';

// 直接使用 stores
const userStore = useUserStore();
const authStore = useAuthStore();

// 計算屬性 - 用戶資料
const profile = computed(() => userStore.user);
const behaviorProfile = computed(() => userStore.profile);

// 業務方法 - 更新用戶資料
const updateProfile = async (updatedProfile: UserUpdateRequest) => {
    if (!userStore.user.id) {
        showError('用戶未登入', '錯誤')
        return { success: false, message: '用戶未登入' }
    }

    try {
        const res = await userService.updateProfile(userStore.user.id, updatedProfile)
        
        if (res.success && res.data) {
            // 更新本地用戶資料
            await userStore.fetchUserProfile(userStore.user.id)
            showSuccess(res.message || '個人資料更新成功', '成功')
            return { success: true, message: res.message || '個人資料更新成功' }
        } else {
            showError(res.message || '個人資料更新失敗', '失敗')
            return { success: false, message: res.message || '個人資料更新失敗' }
        }
    } catch (error) {
        console.error('更新用戶資料時發生錯誤:', error)
        showError('網路錯誤，請稍後再試', '錯誤')
        return { success: false, message: '網路錯誤，請稍後再試' }
    }
};

// 初始化數據
onMounted(async () => {
    if (authStore.isLoggedIn && userStore.user.id) {
        await userStore.fetchUserProfile(userStore.user.id);
        await userStore.fetchBehaviorProfile(userStore.user.id);
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
        categories: MainCategory[]; // 主分類（按偏好順序排列）
    };
    notifications: {
        email: boolean;
        push: boolean;
        activity: boolean;
        promotion: boolean;
        newCourse: boolean;
    };
    preferences: {
        preferredRegions: string[];
    };
}

const showPasswordModal = ref(false);
const showInterestsModal = ref(false);
const showRegionsModal = ref(false);

// 將主分類轉換為選項格式
const mainCategoryOptions = Object.entries(MainCategoryLabel).map(([value, label]) => ({
    label,
    value
}));

// 獲取各種標籤名稱的函數
const getMainCategoryLabel = (code: string): string => {
    return MainCategoryLabel[code as MainCategory] || code;
};

// 獲取地區標籤名稱
const getRegionLabel = (code: string): string => {
    return RegionCodeLabel[code as RegionCode] || code;
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
        categories: behaviorProfile.value.interests || []  // 只保留主分類
    },
    notifications: {
        email: true,
        push: true,
        activity: true,
        promotion: false,
        newCourse: true
    },
    preferences: {
        preferredRegions: behaviorProfile.value.preferredRegions || []
    }
});

// 保存用户兴趣到後端
const saveUserInterests = async () => {
    try {
        if (!userStore.user.id) {
            showError('用戶未登入', '保存失敗');
            return;
        }
        
        const interestsRequest = {
            categories: form.interests.categories
        };
        const result = await userService.updateUserInterestsAndRegions(userStore.user.id, interestsRequest);
        
        if (result.success) {
            // 更新userStore
            userStore.updateInterests(form.interests.categories);
            
            showSuccess('興趣偏好已保存', '保存成功');
        } else {
            showError(result.message || '保存興趣偏好失敗', '保存失敗');
        }
    } catch (error) {
        console.error('保存興趣偏好失敗:', error);
        showError('保存興趣偏好時出錯', '保存失敗');
    }
};


// 興趣偏好順序管理方法
const moveInterestUp = (index: number) => {
    if (index > 0) {
        const temp = form.interests.categories[index];
        form.interests.categories[index] = form.interests.categories[index - 1];
        form.interests.categories[index - 1] = temp;
        showInfo('已調整偏好順序', '順序更新');
    }
};

const moveInterestDown = (index: number) => {
    if (index < form.interests.categories.length - 1) {
        const temp = form.interests.categories[index];
        form.interests.categories[index] = form.interests.categories[index + 1];
        form.interests.categories[index + 1] = temp;
        showInfo('已調整偏好順序', '順序更新');
    }
};

const removeInterestCategory = (category: MainCategory) => {
    const index = form.interests.categories.indexOf(category);
    if (index !== -1) {
        form.interests.categories.splice(index, 1);
        showInfo(`已移除興趣類別: ${getMainCategoryLabel(category)}`, '興趣更新');
    }
};

// 確認興趣選擇
const confirmInterests = async () => {
    // 保存興趣到後端
    await saveUserInterests();
    showInterestsModal.value = false;
};

// 切換主分類
const toggleMainCategory = (category: string) => {
    const mainCat = category as MainCategory;
    const index = form.interests.categories.indexOf(mainCat);
    if (index === -1) {
        // 添加主分類
        form.interests.categories.push(mainCat);
    } else {
        // 移除主分類
        form.interests.categories.splice(index, 1);
    }
};

// 清空所有興趣選擇
const clearAllInterests = () => {
    form.interests.categories = [];
    showInfo('已清空所有興趣偏好', '偏好更新');
};

// 表單驗證
const resolver = zodResolver(
    z.object({
        name: z.string({ required_error: '姓名為必填欄位' })
            .min(1, { message: '姓名不能為空' }),
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

// 地區偏好選擇相關邏輯
const regionOptions = Object.entries(RegionCodeLabel).map(([value, label]) => ({
    label,
    value
}));

const togglePreferredRegion = (region: string) => {
    if (form.preferences.preferredRegions.includes(region)) {
        form.preferences.preferredRegions = form.preferences.preferredRegions.filter(r => r !== region);
    } else {
        form.preferences.preferredRegions.push(region);
    }
};

const clearAllRegions = () => {
    form.preferences.preferredRegions = [];
    showInfo('已清空所有偏好地區', '地區偏好設定');
};

// 移除偏好地區
const removePreferredRegion = (region: string) => {
    form.preferences.preferredRegions = form.preferences.preferredRegions.filter(r => r !== region);
    showInfo(`已移除偏好地區: ${region}`, '地區偏好設定');
};

// 確認地區選擇
const confirmRegions = async () => {
    // 保存地區偏好到後端
    await saveUserRegions();
    showRegionsModal.value = false;
    showSuccess('偏好地區已更新', '地區偏好設定');
};

const passwordForm = reactive({
    password: '',
    confirmPassword: ''
});

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

// 保存用戶地區偏好到後端
const saveUserRegions = async () => {
    try {
        if (!userStore.user.id) {
            showError('用戶未登入', '保存失敗');
            return;
        }
        const regions = form.preferences.preferredRegions.map(region => region as RegionCode);
        const result = await userService.updateUserRegions(userStore.user.id, regions);
        
        if (result.success) {
            showSuccess('地區偏好已保存', '保存成功');
        } else {
            showError(result.message || '保存地區偏好失敗', '保存失敗');
        }
    } catch (error) {
        console.error('保存地區偏好失敗:', error);
        showError('保存地區偏好時出錯', '保存失敗');
    }
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
const saveProfile = async (values: any) => {
    if (!updateProfile) return;
    
    // 構建符合 UserUpdateRequest 格式的數據
    const profileData: UserUpdateRequest = {
        name: values.name,
        avatarUrl: values.avatarUrl,
        address: values.address,
        birthday: values.birthday ? values.birthday.toISOString() : undefined,
        gender: values.gender,
        regionCode: values.regionCode
    };
    
    // 保存基本資料到用戶表
    await updateProfile(profileData);
    
    // 保存偏好設定到行為檔案表
    // await saveCompletePreferences();
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