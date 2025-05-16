<template>
    <div class="flex flex-col flex-1">
        <Toast position="top-center" />
        <h2 class="text-2xl font-bold mb-6">會員資料管理</h2>
        <Form v-slot="$form" :initialValues="form" @submit="saveProfile" :resolver="resolver"
        class="flex flex-col flex-1 justify-between">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 個人基本資料區 -->
                <div class="card p-4 shadow-sm rounded-lg">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b">個人基本資料</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="name" class="col-span-1">
                            <div class="form-label">姓名</div>
                            <InputText class="w-full" />
                            <Message v-if="$form.name?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.name?.error?.message }}
                            </Message>
                        </FormField>

                        <FormField name="gender" class="col-span-1">
                            <div class="form-label">性別</div>
                            <Select v-model="form.gender" :options="genderOptions" optionLabel="label" optionValue="value"
                                class="w-full" />
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
                <div class="card p-4 shadow-sm rounded-lg">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b">聯絡資訊</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="email" class="col-span-1">
                            <div class="form-label">電子郵件</div>
                            <InputText class="w-full" disabled />
                            <small class="text-gray-500">郵件地址無法修改</small>
                        </FormField>

                        <FormField name="phone" class="col-span-1">
                            <div class="form-label">手機號碼</div>
                            <InputText class="w-full" />
                            <Message v-if="$form.phone?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.phone?.error?.message }}
                            </Message>
                        </FormField>

                        <FormField name="address" class="col-span-2">
                            <div class="form-label">地址</div>
                            <InputText class="w-full" />
                            <Message v-if="$form.address?.invalid" severity="secondary" size="small" variant="simple">
                                {{ $form.address?.error?.message }}
                            </Message>
                        </FormField>
                    </div>
                </div>

                <!-- 帳號安全區 -->
                <div class="card p-4 shadow-sm rounded-lg">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b">帳號安全</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="col-span-1">
                            <div class="form-label">密碼管理</div>
                            <Button label="修改密碼" icon="pi pi-lock" class="w-full" @click="showPasswordModal = true" severity="info" />
                        </div>
                        
                        <div class="col-span-1">
                            <div class="form-label">雙重驗證</div>
                            <div class="flex items-center">
                                <ToggleButton v-model="form.twoFactorEnabled" onLabel="已啟用" offLabel="未啟用" class="w-full" />
                            </div>
                        </div>
                        
                        <div class="col-span-2">
                            <div class="form-label">綁定社群帳號</div>
                            <div class="flex flex-wrap gap-3 mt-2">
                                <Button icon="pi pi-facebook" class="p-button-rounded" :class="{'p-button-outlined': !form.socialAccounts.facebook}" @click="toggleSocialAccount('facebook')" />
                                <Button icon="pi pi-google" class="p-button-rounded" :class="{'p-button-outlined': !form.socialAccounts.google}" @click="toggleSocialAccount('google')" />
                                <Button icon="pi pi-twitter" class="p-button-rounded" :class="{'p-button-outlined': !form.socialAccounts.twitter}" @click="toggleSocialAccount('twitter')" />
                                <Button icon="pi pi-instagram" class="p-button-rounded" :class="{'p-button-outlined': !form.socialAccounts.instagram}" @click="toggleSocialAccount('instagram')" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 興趣偏好設定 -->
                <div class="card p-4 shadow-sm rounded-lg">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b">興趣偏好設定</h3>
                    <div class="grid grid-cols-1 gap-4">
                        <div class="col-span-1">
                            <div class="form-label">課程類別</div>
                            <MultiSelect v-model="form.interests.categories" :options="categoryOptions" optionLabel="label" 
                                placeholder="選擇您感興趣的課程類別" class="w-full" />
                        </div>
                        
                        <div class="col-span-1">
                            <div class="form-label">興趣標籤</div>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <Chip v-for="tag in interestTags" :key="tag.value" 
                                    :label="tag.label" 
                                    :class="{ 'bg-primary-100 text-primary-700': form.interests.tags.includes(tag.value) }"
                                    @click="toggleInterestTag(tag.value)" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 通知設定 -->
                <div class="card p-4 shadow-sm rounded-lg col-span-1 lg:col-span-2">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b">通知設定</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 class="font-medium">電子郵件通知</h4>
                                <p class="text-sm text-gray-500">接收系統重要通知</p>
                            </div>
                            <InputSwitch v-model="form.notifications.email" />
                        </div>
                        
                        <div class="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 class="font-medium">推播通知</h4>
                                <p class="text-sm text-gray-500">即時接收最新消息</p>
                            </div>
                            <InputSwitch v-model="form.notifications.push" />
                        </div>
                        
                        <div class="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 class="font-medium">活動提醒</h4>
                                <p class="text-sm text-gray-500">課程與活動開始前提醒</p>
                            </div>
                            <InputSwitch v-model="form.notifications.activity" />
                        </div>
                        
                        <div class="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 class="font-medium">優惠資訊</h4>
                                <p class="text-sm text-gray-500">最新優惠與促銷通知</p>
                            </div>
                            <InputSwitch v-model="form.notifications.promotion" />
                        </div>
                        
                        <div class="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 class="font-medium">新課程通知</h4>
                                <p class="text-sm text-gray-500">新課程上架時通知</p>
                            </div>
                            <InputSwitch v-model="form.notifications.newCourse" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 flex justify-end">
                <Button label="取消" icon="pi pi-times" class="p-button-text mr-2" @click="resetForm" size="large"/>
                <Button label="儲存修改" icon="pi pi-check" type="submit" size="large"/>
            </div>
        </Form>

        <!-- 密碼修改對話框 -->
        <Dialog v-model:visible="showPasswordModal" header="修改密碼" :modal="true" :draggable="false"
            class="w-xl" :resizable="false">
            <div class="space-y-4 p-4">
                <Form v-slot="$form" :initialValues="passwordForm" @submit="submitPasswordChange"
                    :resolver="passwordResolver">
                    <div class="flex flex-col gap-4">
                        <FormField name="password">
                            <div class="form-label">新密碼</div>
                            <InputText type="password" placeholder="新密碼" class="w-full" />
                            <Message v-if="$form.password?.invalid" severity="secondary" size="small"
                                variant="simple">
                                {{ $form.password?.error?.message }}
                            </Message>
                        </FormField>

                        <FormField name="confirmPassword">
                            <div class="form-label">確認新密碼</div>
                            <InputText type="password" placeholder="確認新密碼" class="w-full" />
                            <Message v-if="$form.confirmPassword?.invalid" severity="secondary"
                                size="small" variant="simple">
                                {{ $form.confirmPassword?.error?.message }}
                            </Message>
                        </FormField>
                    </div>
                    <div class="mt-10 flex justify-end">
                        <Button label="取消" icon="pi pi-times" class="p-button-text mr-2"
                            @click="showPasswordModal = false" />
                        <Button label="儲存修改" icon="pi pi-check" type="submit" />
                    </div>
                </Form>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { type PropType, ref, reactive } from 'vue';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import InputSwitch from 'primevue/inputswitch';
import ToggleButton from 'primevue/togglebutton';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import type { Result, User } from '@/types';
import { useToast } from 'primevue/usetoast';
import { Form, FormField } from '@primevue/forms';
import Dialog from 'primevue/dialog';
import { UserGender, UserGenderLabel } from '@/enums/User';

// 擴展 User 類型，添加新的欄位
interface ExtendedUser extends User {
    twoFactorEnabled: boolean;
    socialAccounts: {
        facebook: boolean;
        google: boolean;
        twitter: boolean;
        instagram: boolean;
    };
    interests: {
        categories: { label: string; value: string }[];
        tags: string[];
    };
    notifications: {
        email: boolean;
        push: boolean;
        activity: boolean;
        promotion: boolean;
        newCourse: boolean;
    };
}

const props = defineProps({
    profile: {
        type: Object as PropType<User | null>,
        required: true
    }
});

const emit = defineEmits(['update-profile']);
const toast = useToast();
const showPasswordModal = ref(false);

// 課程類別選項
const categoryOptions = [
    { label: '瑜珈', value: 'yoga' },
    { label: '健身', value: 'fitness' },
    { label: '舞蹈', value: 'dance' },
    { label: '烹飪', value: 'cooking' },
    { label: '繪畫', value: 'painting' },
    { label: '音樂', value: 'music' },
    { label: '攝影', value: 'photography' },
    { label: '語言', value: 'language' },
    { label: '手作', value: 'handcraft' },
    { label: '科技', value: 'technology' }
];

// 興趣標籤
const interestTags = [
    { label: '戶外活動', value: 'outdoor' },
    { label: '室內活動', value: 'indoor' },
    { label: '團體課程', value: 'group' },
    { label: '個人課程', value: 'individual' },
    { label: '初學者', value: 'beginner' },
    { label: '進階', value: 'advanced' },
    { label: '週末課程', value: 'weekend' },
    { label: '晚間課程', value: 'evening' },
    { label: '親子活動', value: 'family' },
    { label: '專業認證', value: 'certification' }
];

// 表單數據
const form = reactive<ExtendedUser>({
    ...props.profile as User,
    id: props.profile?.id ?? 0,
    name: props.profile?.name ?? '',
    gender: props.profile?.gender ?? UserGender.Other,
    birthday: new Date(props.profile?.birthday ?? new Date()),
    address: props.profile?.address ?? '',
    email: props.profile?.email ?? '',
    phone: props.profile?.phone ?? '',
    points: props.profile?.points ?? 0,
    createdAt: new Date(props.profile?.createdAt ?? new Date()),
    // 新增欄位的默認值
    twoFactorEnabled: false,
    socialAccounts: {
        facebook: false,
        google: false,
        twitter: false,
        instagram: false
    },
    interests: {
        categories: [],
        tags: []
    },
    notifications: {
        email: true,
        push: true,
        activity: true,
        promotion: false,
        newCourse: true
    }
});

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
    { label: UserGenderLabel.M, value: UserGender.Male },
    { label: UserGenderLabel.F, value: UserGender.Female },
    { label: UserGenderLabel.O, value: UserGender.Other },
    { label: UserGenderLabel.ND, value: UserGender.NotDisclosed }
];

// 切換社群帳號綁定狀態
const toggleSocialAccount = (platform: keyof typeof form.socialAccounts) => {
    form.socialAccounts[platform] = !form.socialAccounts[platform];
    
    if (form.socialAccounts[platform]) {
        // 模擬綁定社群帳號的流程
        toast.add({ 
            severity: 'info', 
            summary: '社群帳號綁定', 
            detail: `正在連接 ${platform} 帳號...`, 
            life: 3000 
        });
    } else {
        // 模擬解除綁定社群帳號的流程
        toast.add({ 
            severity: 'info', 
            summary: '社群帳號解除綁定', 
            detail: `已解除 ${platform} 帳號綁定`, 
            life: 3000 
        });
    }
};

// 切換興趣標籤
const toggleInterestTag = (tagValue: string) => {
    const index = form.interests.tags.indexOf(tagValue);
    if (index === -1) {
        form.interests.tags.push(tagValue);
    } else {
        form.interests.tags.splice(index, 1);
    }
};

// 提交密碼變更
const submitPasswordChange = ({ valid }: any) => {
    if (!valid) {
        toast.add({ severity: 'error', summary: '請檢查輸入資料', life: 3000 });
        return;
    }
    
    // 模擬 API 調用
    setTimeout(() => {
        toast.add({ severity: 'success', summary: '成功', detail: '密碼已修改', life: 3000 });
        showPasswordModal.value = false;
        passwordForm.password = '';
        passwordForm.confirmPassword = '';
    }, 1000);
};

// 重置表單
const resetForm = () => {
    // 只重置基本資料，保留其他設定
    if (props.profile) {
        form.name = props.profile.name || '';
        form.gender = props.profile.gender || UserGender.Other;
        form.birthday = new Date(props.profile.birthday || new Date());
        form.address = props.profile.address || '';
        form.phone = props.profile.phone || '';
    }
    
    toast.add({ severity: 'info', summary: '已重置', detail: '表單已重置為原始資料', life: 3000 });
};

// 儲存個人資料
const saveProfile = ({ valid, values }: any) => {
    if (!valid) {
        toast.add({ severity: 'error', summary: '請檢查輸入資料', life: 3000 });
        return;
    }
    
    // 合併基本資料和擴展資料
    const profileData = {
        ...values,
        twoFactorEnabled: form.twoFactorEnabled,
        socialAccounts: form.socialAccounts,
        interests: form.interests,
        notifications: form.notifications
    };
    
    // 模擬 API 調用
    setTimeout(() => {
        emit('update-profile', profileData);
        toast.add({ severity: 'success', summary: '成功', detail: '會員資料已更新', life: 3000 });
    }, 1000);
};
</script>

<style scoped>
@reference "tailwindcss";
 
.form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
}

.card {
    @apply bg-white border border-gray-100;
}

:deep(.p-chip) {
    @apply cursor-pointer transition-colors;
}
</style>