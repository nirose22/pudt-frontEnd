<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-800">
        <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900">管理員登入</h1>
                <p class="text-gray-600 mt-2">請輸入您的管理員憑證</p>
            </div>

            <form @submit.prevent="handleAdminLogin" class="space-y-6">
                <div>
                    <IftaLabel>
                        <InputText 
                            id="username" 
                            v-model="adminForm.username" 
                            class="w-full"
                            placeholder="請輸入管理員帳號"
                            :class="{ 'p-invalid': v$.username.$invalid && submitted }"
                        />
                        <label for="username">管理員帳號</label>
                    </IftaLabel>
                    <small v-if="v$.username.$invalid && submitted" class="p-error">
                        {{ v$.username.$errors[0].$message }}
                    </small>
                </div>
                
                <div>
                    <IftaLabel>
                        <Password 
                            id="password" 
                            v-model="adminForm.password" 
                            :feedback="false" 
                            :toggleMask="true"
                            inputClass="w-full" 
                            class="w-full"
                            placeholder="請輸入管理員密碼"
                            :class="{ 'p-invalid': v$.password.$invalid && submitted }"
                        />
                        <label for="password">管理員密碼</label>
                    </IftaLabel>
                    <small v-if="v$.password.$invalid && submitted" class="p-error">
                        {{ v$.password.$errors[0].$message }}
                    </small>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <Checkbox v-model="adminForm.rememberMe" id="rememberMe" />
                        <label for="rememberMe" class="ml-2 text-sm text-gray-700">記住我</label>
                    </div>
                    <div>
                        <a href="#" class="text-sm text-blue-600 hover:text-blue-800">
                            忘記密碼？
                        </a>
                    </div>
                </div>
                
                <Button type="submit" label="登入管理系統" severity="danger" class="w-full" :loading="loading" />
            </form>

            <div class="mt-6 text-center">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">
                            後台管理系統
                        </span>
                    </div>
                </div>
                
                <p class="mt-4 text-sm text-gray-600">
                    本系統僅限授權管理員使用。未經授權的登入嘗試將被記錄並可能受到法律追究。
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(false);
const submitted = ref(false);

// 管理員表單
const adminForm = reactive({
    username: '',
    password: '',
    rememberMe: false
});

// 表單驗證規則
const rules = {
    username: { required, minLength: minLength(4) },
    password: { required, minLength: minLength(6) }
};

const v$ = useVuelidate(rules, adminForm);

// 處理管理員登入
const handleAdminLogin = async () => {
    submitted.value = true;
    const isFormValid = await v$.value.$validate();
    
    if (!isFormValid) {
        return;
    }
    
    loading.value = true;
    
    try {
        const result = await authStore.loginAdmin({
            account: adminForm.username,
            password: adminForm.password,
            rememberMe: adminForm.rememberMe
        });
        
        if (result.success) {
            toast.add({
                severity: 'success',
                summary: '登入成功',
                detail: '歡迎回到管理系統',
                life: 3000
            });
            router.push('/admin/dashboard');
        } else {
            toast.add({
                severity: 'error',
                summary: '登入失敗',
                detail: result.message || '請檢查您的管理員帳號密碼',
                life: 3000
            });
        }
    } catch (error) {
        console.error('管理員登入錯誤:', error);
        toast.add({
            severity: 'error',
            summary: '登入錯誤',
            detail: '發生未知錯誤，請稍後再試',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* 自定義樣式 */
</style> 