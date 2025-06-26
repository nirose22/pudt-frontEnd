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
                            <div v-for="(cat, index) in form.interests.categories" :key="`interest-${cat}-${index}`"
                                class="flex items-center justify-between p-2 bg-white rounded border border-sky-100">
                                <div class="flex items-center gap-3">
                                    <span class="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {{ index + 1 }}
                                    </span>
                                    <span class="font-medium text-sky-700">{{ getMainCategoryLabel(cat) }}</span>
                                    <span class="text-xs text-gray-400">優先級: {{ index + 1 }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Button icon="pi pi-chevron-up" size="small" text @click="moveInterestUp(index)" 
                                        :disabled="index === 0" class="!text-sky-600" 
                                        v-tooltip.top="'提高優先級'" />
                                    <Button icon="pi pi-chevron-down" size="small" text @click="moveInterestDown(index)" 
                                        :disabled="index === form.interests.categories.length - 1" class="!text-sky-600" 
                                        v-tooltip.top="'降低優先級'" />
                                    <Button icon="pi pi-times" size="small" text severity="danger" 
                                        @click="removeInterestCategory(cat)" class="!text-red-500" 
                                        v-tooltip.top="'移除'" />
                                </div>
                            </div>
                        </div>
                        <small class="text-gray-500 mt-2 block">
                            <i class="pi pi-info-circle mr-1"></i>
                            排序越前面的興趣，推薦權重越高。第1位權重100%，往後遞減。
                        </small>
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
                        <div v-for="(cat, index) in form.interests.categories" :key="`modal-interest-${cat}-${index}`"
                            class="flex items-center justify-between p-2 bg-white rounded border border-sky-100">
                            <div class="flex items-center gap-3">
                                <span class="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {{ index + 1 }}
                                </span>
                                <span class="font-medium text-sky-700">{{ getMainCategoryLabel(cat) }}</span>
                                <span class="text-xs text-gray-400">推薦權重: {{ ((form.interests.categories.length - index) / form.interests.categories.length * 100).toFixed(0) }}%</span>
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
                    <small class="text-gray-500 mt-2 block">
                        <i class="pi pi-info-circle mr-1"></i>
                        使用箭頭調整順序，排序越前面推薦權重越高，確保個人化推薦的準確性
                    </small>
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
import { ref, computed, reactive, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
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
import { debounce } from '@/utils/cmmonUtils';


// 定義擴展的用戶類型
interface ExtendedUser extends Omit<User, 'birthday' | 'createdAt'> {
    birthday?: Date;
    createdAt?: Date;
    twoFactorEnabled: boolean;
    socialAccounts: Record<string, boolean>;
    interests: { categories: MainCategory[] };
    notifications: Record<string, boolean>;
    preferences: { preferredRegions: string[] };
}

// Stores
const userStore = useUserStore();
const authStore = useAuthStore();

// 計算屬性
const profile = computed(() => userStore.user);
const behaviorProfile = computed(() => userStore.profile);
const isLoggedIn = computed(() => authStore.isLoggedIn && userStore.user.id);

// 對話框狀態
const modals = reactive({
    password: false,
    interests: false,
    regions: false
});

// 選項數據
const options = {
    gender: [
        { label: UserGenderLabelShort.M, value: UserGender.Male },
        { label: UserGenderLabelShort.F, value: UserGender.Female },
        { label: UserGenderLabelShort.O, value: UserGender.Other },
        { label: UserGenderLabelShort.ND, value: UserGender.NotDisclosed }
    ],
    mainCategory: Object.entries(MainCategoryLabel).map(([value, label]) => ({ label, value })),
    region: Object.entries(RegionCodeLabel).map(([value, label]) => ({ label, value }))
};

// 工具函數
const getLabel = {
    mainCategory: (code: string) => MainCategoryLabel[code as MainCategory] || code,
    region: (code: string) => RegionCodeLabel[code as RegionCode] || code
};

// 表單數據初始化
const createInitialForm = (): ExtendedUser => ({
    id: 0,
    name: '',
    email: '',
    phone: '',
    points: 0,
    gender: UserGender.Other,
    birthday: undefined,
    address: '',
    avatarUrl: undefined,
    regionCode: undefined,
    role: undefined,
    lastLogin: undefined,
    token: undefined,
    createdAt: undefined,
    twoFactorEnabled: false,
    socialAccounts: {
        facebook: false,
        google: false,
        twitter: false,
        instagram: false
    },
    interests: { categories: [] },
    notifications: {
        email: true,
        push: true,
        activity: true,
        promotion: false,
        newCourse: true
    },
    preferences: { preferredRegions: [] }
});

const form = reactive<ExtendedUser>(createInitialForm());

// 密碼表單
const passwordForm = reactive({
    password: '',
    confirmPassword: ''
});

// 數據同步 - 確保順序一致性
const syncFormWithStore = () => {
    if (profile.value) {
        Object.assign(form, {
            ...profile.value,
            birthday: profile.value.birthday ? new Date(profile.value.birthday) : undefined,
            createdAt: profile.value.createdAt ? new Date(profile.value.createdAt) : undefined
        });
    }
    
    if (behaviorProfile.value) {
        // 確保興趣順序與後端保持一致 - 直接複製陣列保持順序
        const oldInterests = [...form.interests.categories];
        form.interests.categories = [...(behaviorProfile.value.interests || [])];
        
        // 地區偏好同步 - 添加調試和更嚴格的同步邏輯
        const oldRegions = [...form.preferences.preferredRegions];
        const newRegions = behaviorProfile.value.preferredRegions?.map(String) || [];
        form.preferences.preferredRegions = newRegions;
        
        console.log('🔄 [syncFormWithStore] 數據同步:', {
            興趣偏好: {
                舊: oldInterests,
                新: form.interests.categories,
                變更: oldInterests.length !== form.interests.categories.length
            },
            地區偏好: {
                舊: oldRegions,
                新: form.preferences.preferredRegions,
                變更: oldRegions.length !== form.preferences.preferredRegions.length,
                後端原始資料: behaviorProfile.value.preferredRegions
            }
        });
    }
};

// 通用保存處理
const handleSave = async (
    saveFunction: () => Promise<any>,
    successMessage: string,
    errorMessage: string
) => {
    if (!isLoggedIn.value) {
        showError('用戶未登入', '錯誤');
        return false;
    }

    try {
        const result = await saveFunction();
        if (result.success) {
            showSuccess(successMessage, '成功');
            return true;
        } else {
            showError(result.message || errorMessage, '失敗');
            return false;
        }
    } catch (error) {
        console.error('保存失敗:', error);
        showError('網路錯誤，請稍後再試', '錯誤');
        return false;
    }
};

// 通用切換邏輯
const createToggleHandler = <T>(
    array: T[],
    updateMessage: (item: T, action: 'add' | 'remove') => string
) => (item: T) => {
    const index = array.indexOf(item);
    if (index === -1) {
        array.push(item);
        showInfo(updateMessage(item, 'add'), '更新');
    } else {
        array.splice(index, 1);
        showInfo(updateMessage(item, 'remove'), '更新');
    }
};

// 興趣偏好管理 - 即時更新優化
const interestHandlers = {
    // 即時響應式更新
    updateAndSync: async (updateFn: () => void, autoSave: boolean = true) => {
        updateFn();
        
        // 強制觸發響應式更新
        await nextTick();
        form.interests.categories = [...form.interests.categories];
        
        // 可選的自動保存
        if (autoSave) {
            debouncedSave(); // 使用預設的 800ms 防抖
        }
    },
    
    // 專門的切換邏輯，立即更新
    toggle: async (category: MainCategory) => {
        await interestHandlers.updateAndSync(() => {
            const index = form.interests.categories.indexOf(category);
            if (index === -1) {
                // 新增到末尾，用戶可以稍後調整順序
                form.interests.categories.push(category);
            } else {
                // 移除
                form.interests.categories.splice(index, 1);
            }
        });
    },
    
    // 精確的移動邏輯，立即更新
    move: async (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const categories = form.interests.categories;
        
        if (targetIndex < 0 || targetIndex >= categories.length) return;
        
        await interestHandlers.updateAndSync(() => {
            // 交換位置，確保順序準確
            [categories[index], categories[targetIndex]] = [categories[targetIndex], categories[index]];
        });
    },
    
    // 移除單個興趣，立即更新
    remove: async (category: MainCategory) => {
        await interestHandlers.updateAndSync(() => {
            const index = form.interests.categories.indexOf(category);
            if (index !== -1) {
                form.interests.categories.splice(index, 1);
            }
        });
    },
    
    // 清空所有興趣，立即更新
    clear: async () => {
        await interestHandlers.updateAndSync(() => {
            form.interests.categories = [];
        });
        showInfo('已清空所有興趣偏好', '偏好更新');
    },
    
    // 手動保存 - 增加詳細調試
    save: async () => {
        // 清除防抖計時器，執行立即保存
        debouncedSave.cancel();
        
        const categoriesData = [...form.interests.categories];
        
        const result = await handleSave(
            () => userStore.updateInterests(categoriesData), // 使用副本確保順序
            '興趣偏好已保存',
            '保存興趣偏好失敗'
        );
        
        if (result) {
            // 保存成功後重新同步，確保順序一致
            await userStore.fetchBehaviorProfile(userStore.user.id);
            // 重新同步表單數據
            await nextTick();
            syncFormWithStore();
        }
        
        return result;
    },
    
    // 確認並關閉對話框
    confirm: async () => {
        const success = await interestHandlers.save();
        if (success) {
            modals.interests = false;
        }
    }
};



// 地區偏好管理 - 即時更新優化
const regionHandlers = {
    // 即時響應式更新
    updateAndSync: async (updateFn: () => void, autoSave: boolean = true) => {
        const oldRegions = [...form.preferences.preferredRegions];
        updateFn();
        
        // 強制觸發響應式更新
        await nextTick();
        form.preferences.preferredRegions = [...form.preferences.preferredRegions];
        
        // 調試日誌
        console.log('🗺️ [regionHandlers] 數據變更:', {
            舊資料: oldRegions,
            新資料: form.preferences.preferredRegions,
            操作: form.preferences.preferredRegions.length === 0 ? '清空' : 
                  form.preferences.preferredRegions.length > oldRegions.length ? '新增' : '移除'
        });
        
        // 可選的自動保存
        if (autoSave) {
            debouncedRegionSave(); // 使用預設的 800ms 防抖
        }
    },
    
    // 切換地區偏好，立即更新
    toggle: async (region: string) => {
        await regionHandlers.updateAndSync(() => {
            const index = form.preferences.preferredRegions.indexOf(region);
            if (index === -1) {
                form.preferences.preferredRegions.push(region);
            } else {
                form.preferences.preferredRegions.splice(index, 1);
            }
        });
    },
    
    // 移除地區偏好，立即更新
    remove: async (region: string) => {
        console.log('🗺️ [regionHandlers] 準備移除地區:', region);
        await regionHandlers.updateAndSync(() => {
            form.preferences.preferredRegions = form.preferences.preferredRegions.filter(r => r !== region);
        });
        console.log('🗺️ [regionHandlers] 移除後剩餘地區:', form.preferences.preferredRegions);
    },
    
    // 清空地區偏好，立即更新
    clear: async () => {
        console.log('🗺️ [regionHandlers] 準備清空所有地區偏好');
        console.log('🗺️ [regionHandlers] 清空前:', form.preferences.preferredRegions);
        
        await regionHandlers.updateAndSync(() => {
            form.preferences.preferredRegions.length = 0; // 清空陣列引用
            form.preferences.preferredRegions.splice(0); // 再次確保清空
        }, false); // 不自動保存，手動觸發
        
        console.log('🗺️ [regionHandlers] 清空後:', form.preferences.preferredRegions);
        
        // 立即手動保存
        const success = await regionHandlers.save();
        if (success) {
            showInfo('已清空所有偏好地區', '地區偏好設定');
        }
    },
    
    // 手動保存 - 增加詳細調試
    save: async () => {
        // 清除防抖計時器，執行立即保存
        debouncedRegionSave.cancel();
        
        const regionsData = [...form.preferences.preferredRegions];
        console.log('🗺️ [regionHandlers] 準備保存地區偏好:', {
            資料: regionsData,
            數量: regionsData.length,
            是否為空: regionsData.length === 0
        });
        
        const result = await handleSave(
            () => userStore.updatePreferredRegions(
                regionsData.map(region => region as RegionCode)
            ),
            '地區偏好已保存',
            '保存地區偏好失敗'
        );
        
        console.log('🗺️ [regionHandlers] 保存結果:', result);
        
        if (result) {
            // 保存成功後重新同步，但要確保清空狀態正確傳遞
            console.log('🗺️ [regionHandlers] 保存成功，重新獲取資料...');
            await userStore.fetchBehaviorProfile(userStore.user.id);
            await nextTick();
            
            // 如果我們剛才保存的是空陣列，確保同步後也是空陣列
            if (regionsData.length === 0) {
                console.log('🗺️ [regionHandlers] 確保清空狀態...');
                form.preferences.preferredRegions = [];
            } else {
                syncFormWithStore();
            }
        } else {
            console.error('🗺️ [regionHandlers] 保存失敗，不同步數據');
        }
        
        return result;
    },
    
    // 確認並關閉對話框
    confirm: async () => {
        const success = await regionHandlers.save();
        if (success) {
            modals.regions = false;
        }
    }
};

// 社群帳號切換
const toggleSocialAccount = (platform: string) => {
    form.socialAccounts[platform] = !form.socialAccounts[platform];
    const action = form.socialAccounts[platform] ? '連接' : '解除';
    showInfo(`已${action} ${platform} 帳號`, '社群帳號設定');
};

// 表單驗證
const validators = {
    profile: zodResolver(z.object({
        name: z.string({ required_error: '姓名為必填欄位' }).min(1, { message: '姓名不能為空' }),
        birthday: z.date().max(new Date(), { message: '生日不能早於今天' }).optional(),
        gender: z.nativeEnum(UserGender).optional()
    })),
    
    password: zodResolver(z.object({
        password: z.string().min(6, { message: '密碼不能少於6個字' }),
        confirmPassword: z.string().min(6, { message: '密碼不能少於6個字' }),
    }).refine(
        ({ confirmPassword, password }) => confirmPassword === password,
        { path: ["confirmPassword"], message: "密碼不一致" }
    ))
};

// 主要業務邏輯
const profileActions = {
    update: async (updatedProfile: UserUpdateRequest) => 
        handleSave(
            () => userService.updateProfile(userStore.user.id, updatedProfile),
            '個人資料更新成功',
            '個人資料更新失敗'
        ),
    
    save: async (values: any) => {
        const profileData: UserUpdateRequest = {
            name: values.name,
            avatarUrl: values.avatarUrl,
            address: values.address,
            birthday: values.birthday?.toISOString(),
            gender: values.gender,
            regionCode: values.regionCode
        };
        await profileActions.update(profileData);
    },
    
    reset: () => {
        syncFormWithStore();
        showInfo('表單已重置為原始資料', '已重置');
    }
};

const passwordActions = {
    submit: ({ valid }: any) => {
        if (!valid) {
            showError('請檢查輸入資料');
            return;
        }
        
        // 模擬 API 調用
        setTimeout(() => {
            showSuccess('密碼已修改');
            modals.password = false;
            Object.assign(passwordForm, { password: '', confirmPassword: '' });
        }, 1000);
    }
};

// 初始化和數據監聽
onMounted(async () => {
    if (isLoggedIn.value) {
        await userStore.fetchUserProfile(userStore.user.id);
        await userStore.fetchBehaviorProfile(userStore.user.id);
        syncFormWithStore();
    }
});

// 監聽 store 數據變化，同步到表單
watch([profile, behaviorProfile], syncFormWithStore, { deep: true });

// 監聽表單興趣變化，即時響應
watch(
    () => form.interests.categories,
    (newCategories, oldCategories) => {
        // 避免初始化時觸發
        if (oldCategories && newCategories.length !== oldCategories.length) {
            console.log('🎯 興趣偏好變更:', {
                新增: newCategories.filter(cat => !oldCategories.includes(cat)),
                移除: oldCategories.filter(cat => !newCategories.includes(cat)),
                當前順序: newCategories.map((cat, index) => `${index + 1}. ${getLabel.mainCategory(cat)}`)
            });
        }
    },
    { deep: true }
);


const debouncedSave = debounce(interestHandlers.save, 800);

const debouncedRegionSave = debounce(regionHandlers.save, 800);

// 組件卸載時清理計時器
onBeforeUnmount(() => {
    // 取消所有防抖函數的計時器
    debouncedSave.cancel();
    debouncedRegionSave.cancel();
});

// 模板引用 - 簡化變量名
const showPasswordModal = computed({
    get: () => modals.password,
    set: (value) => modals.password = value
});

const showInterestsModal = computed({
    get: () => modals.interests,
    set: (value) => modals.interests = value
});

const showRegionsModal = computed({
    get: () => modals.regions,
    set: (value) => modals.regions = value
});

// 暴露給模板的函數 - 使用更簡潔的名稱
const resolver = validators.profile;
const passwordResolver = validators.password;
const genderOptions = options.gender;
const mainCategoryOptions = options.mainCategory;
const regionOptions = options.region;
const getMainCategoryLabel = getLabel.mainCategory;
const getRegionLabel = getLabel.region;

// 興趣管理函數 - 即時更新
const toggleMainCategory = async (category: string) => await interestHandlers.toggle(category as MainCategory);
const moveInterestUp = async (index: number) => await interestHandlers.move(index, 'up');
const moveInterestDown = async (index: number) => await interestHandlers.move(index, 'down');
const removeInterestCategory = interestHandlers.remove;
const clearAllInterests = interestHandlers.clear;
const confirmInterests = interestHandlers.confirm;

// 地區管理函數 - 即時更新
const togglePreferredRegion = regionHandlers.toggle;
const removePreferredRegion = regionHandlers.remove;
const clearAllRegions = regionHandlers.clear;
const confirmRegions = regionHandlers.confirm;

// 其他動作
const saveProfile = profileActions.save;
const resetForm = profileActions.reset;
const submitPasswordChange = passwordActions.submit;
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