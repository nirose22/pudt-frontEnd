<template>
    <div class="grow register-bg-frame h-full">
        <div class="max-w-xl mx-auto my-20 p-6 rounded-xl space-y-6 shadow-xl bg-white">
            <h2 class="text-xl font-bold text-sky-600">註冊帳號</h2>
            <div class="flex flex-col gap-3">
                <Form v-slot="$form" @submit="onFormSubmit" :resolver="resolver" :initialValues="initialValues"
                    class="flex flex-col gap-4">
                    
                    <!-- 基本資料 -->
                    <div class="mb-2">
                        <h3 class="text-lg font-medium text-gray-700 mb-2">基本資料</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="name">
                                <FloatLabel>
                                    <InputText type="text" class="w-full" />
                                    <label>姓名</label>
                                </FloatLabel>
                                <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                                    {{ $form.name.error?.message }}
                                </Message>
                            </FormField>
                            
                            <FormField name="email">
                                <FloatLabel>
                                    <InputText type="email" class="w-full" />
                                    <label>電子郵件</label>
                                </FloatLabel>
                                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
                                    {{ $form.email.error?.message }}
                                </Message>
                            </FormField>
                            
                            <FormField name="password">
                                <FloatLabel>
                                    <Password class="w-full" :feedback="true" />
                                    <label>密碼</label>
                                </FloatLabel>
                                <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
                                    {{ $form.password.error?.message }}
                                </Message>
                            </FormField>
                            
                            <FormField name="confirmPassword">
                                <FloatLabel>
                                    <Password class="w-full" :feedback="false" />
                                    <label>確認密碼</label>
                                </FloatLabel>
                                <Message v-if="$form.confirmPassword?.invalid" severity="error" size="small" variant="simple">
                                    {{ $form.confirmPassword.error?.message }}
                                </Message>
                            </FormField>
                            
                            <FormField name="phone">
                                <FloatLabel>
                                    <InputText type="tel" class="w-full" />
                                    <label>手機號碼</label>
                                </FloatLabel>
                                <Message v-if="$form.phone?.invalid" severity="error" size="small" variant="simple">
                                    {{ $form.phone.error?.message }}
                                </Message>
                            </FormField>
                        </div>
                    </div>
                    
                    <Divider />
                    
                    <!-- 個人偏好 -->
                    <div class="mb-2">
                        <h3 class="text-lg font-medium text-gray-700 mb-2">個人偏好設定（選填）</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="gender">
                                <FloatLabel>
                                    <Select :options="genderOptions" optionLabel="name" optionValue="code" class="w-full" />
                                    <label>性別</label>
                                </FloatLabel>
                            </FormField>
                            
                            <FormField name="birthYear">
                                <FloatLabel>
                                    <InputNumber class="w-full" :min="1940" :max="2010" />
                                    <label>出生年份</label>
                                </FloatLabel>
                            </FormField>
                        </div>
                        
                        <div class="mt-4">
                            <FormField name="interests">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">興趣標籤（最多選5個）</label>
                                    <div class="flex flex-wrap gap-2 mb-2">
                                        <Chip 
                                            v-for="category in interestCategories" 
                                            :key="category" 
                                            :label="category" 
                                            :class="{ 'preference-selected': selectedInterests.includes(category) }"
                                            class="cursor-pointer"
                                            @click="toggleInterest(category)" 
                                        />
                                    </div>
                                </div>
                            </FormField>
                        </div>
                    </div>
                    
                    <Divider />
                    
                    <div class="flex items-center mb-2">
                        <FormField name="agreement" v-slot="field">
                            <div class="flex items-center">
                                <Checkbox v-model="field.value" :binary="true" />
                                <label class="ml-2 text-sm text-gray-600">我同意<a href="#" class="text-primary-500 hover:underline">服務條款</a>和<a href="#" class="text-primary-500 hover:underline">隱私政策</a></label>
                            </div>
                        </FormField>
                    </div>
                    <Message v-if="$form.agreement?.invalid" severity="error" size="small" variant="simple">
                        {{ $form.agreement.error?.message }}
                    </Message>
                    
                    <div class="flex flex-col gap-2">
                        <Button type="submit" label="註冊" size="large" rounded class="w-full"></Button>
                        <div class="text-center text-sm text-gray-600">
                            已有帳號？<a href="/login" class="text-primary-500 hover:underline">登入</a>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { ref, reactive } from 'vue';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Message from 'primevue/message';
import FloatLabel from 'primevue/floatlabel';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import { Form, FormField } from '@primevue/forms';
import { UserGender, UserGenderLabel } from '@/enums/User';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import Divider from 'primevue/divider';

const router = useRouter();
const userStore = useUserStore();
const toast = useToast();
const selectedInterests = ref<string[]>([]);

// 性別選項
const genderOptions = ref([
    { name: UserGenderLabel[UserGender.Male], code: UserGender.Male },
    { name: UserGenderLabel[UserGender.Female], code: UserGender.Female },
    { name: UserGenderLabel[UserGender.Other], code: UserGender.Other },
    { name: UserGenderLabel[UserGender.NotDisclosed], code: UserGender.NotDisclosed }
]);

// 興趣類別
const interestCategories = ['瑜珈', '滑板', '攝影', '烘焙', '游泳', '繪畫', '舞蹈', '語言', '音樂', '手作', '冥想', '健身', '廚藝', '旅遊', '閱讀'];

// 表單初始值
const initialValues = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: UserGender.NotDisclosed,
    birthYear: 2000,
    interests: [] as string[],
    agreement: false
});

// Zod 表單驗證
const resolver = zodResolver(
    z.object({
        name: z.string().min(2, { message: '姓名至少需要2個字元' }),
        email: z.string().email({ message: '請輸入有效的電子郵件地址' }),
        password: z.string().min(6, { message: '密碼至少需要6個字元' }),
        confirmPassword: z.string(),
        phone: z.string().min(10, { message: '請輸入有效的手機號碼' }),
        gender: z.string().optional(),
        birthYear: z.number().optional(),
        interests: z.array(z.string()).optional(),
        agreement: z.literal(true, {
            errorMap: () => ({ message: '您必須同意服務條款和隱私政策才能註冊' })
        })
    }).refine(data => data.password === data.confirmPassword, {
        message: "密碼與確認密碼不符",
        path: ["confirmPassword"],
    })
);

// 切換興趣標籤
function toggleInterest(category: string) {
    const index = selectedInterests.value.indexOf(category);
    if (index >= 0) {
        selectedInterests.value.splice(index, 1);
    } else {
        if (selectedInterests.value.length < 5) {
            selectedInterests.value.push(category);
        } else {
            toast.add({ severity: 'warn', summary: '最多只能選擇5個興趣標籤', life: 3000 });
        }
    }
    // 同步到表單值
    initialValues.value.interests = [...selectedInterests.value];
}

// 表單提交
const onFormSubmit = async (e: any) => {
    if (e.valid) {
        try {
            // 在實際應用中，這裡應該是調用註冊API
            const userData = {
                ...e.values,
                birthday: e.values.birthYear ? new Date(e.values.birthYear, 0, 1) : undefined,
            };
            
            // 模擬成功註冊
            toast.add({ severity: 'success', summary: '註冊成功', detail: '歡迎加入PUDT', life: 3000 });
            
            // 註冊成功後跳轉到登入頁面
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error) {
            toast.add({ severity: 'error', summary: '註冊失敗', detail: '請稍後再試', life: 3000 });
        }
    }
};
</script>

<style scoped>
.register-bg-frame {
    background-image: url('@/assets/image/pudt_logo-xl.png');
    background-size: 300px;
    background-repeat: no-repeat;
    background-position: center;
    background-position-y: 95%;
    background-opacity: 0.5;
}

.preference-selected {
    background-color: var(--primary-color);
    color: white;
}

::v-deep .p-inputtext,
::v-deep .p-password-input {
    width: 100% !important;
}

::v-deep .p-inputnumber {
    width: 100%;
}

::v-deep .p-inputnumber-input {
    width: 100% !important;
}
</style>
