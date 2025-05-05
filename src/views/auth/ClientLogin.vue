<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">歡迎回來</h1>
                <p class="text-gray-600 mt-2">請登入您的帳號以繼續</p>
            </div>

            <!-- 用戶類型選擇 -->
            <div class="mb-6">
                <TabView v-model:activeIndex="activeTabIndex">
                    <TabPanel header="一般用戶" value="user">
                        <div class="p-2">
                            <form @submit.prevent="handleUserLogin" class="space-y-4">
                                <div>
                                    <IftaLabel>
                                        <InputText 
                                            id="email" 
                                            v-model="userForm.email" 
                                            type="email" 
                                            class="w-full"
                                            placeholder="請輸入電子郵件"
                                            :class="{ 'p-invalid': v$.userForm.email.$invalid && submitted }"
                                        />
                                        <label for="email">電子郵件</label>
                                    </IftaLabel>
                                    <small v-if="v$.userForm.email.$invalid && submitted" class="p-error">
                                        {{ v$.userForm.email.$errors[0].$message }}
                                    </small>
                                </div>
                                
                                <div>
                                    <IftaLabel>
                                        <Password 
                                            id="password" 
                                            v-model="userForm.password" 
                                            :feedback="false" 
                                            :toggleMask="true"
                                            inputClass="w-full" 
                                            class="w-full"
                                            placeholder="請輸入密碼"
                                            :class="{ 'p-invalid': v$.userForm.password.$invalid && submitted }"
                                        />
                                        <label for="password">密碼</label>
                                    </IftaLabel>
                                    <small v-if="v$.userForm.password.$invalid && submitted" class="p-error">
                                        {{ v$.userForm.password.$errors[0].$message }}
                                    </small>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <Checkbox v-model="userForm.rememberMe" id="rememberMe" />
                                        <label for="rememberMe" class="ml-2 text-sm text-gray-600">記住我</label>
                                    </div>
                                    <div>
                                        <router-link to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-800">
                                            忘記密碼？
                                        </router-link>
                                    </div>
                                </div>
                                
                                <Button type="submit" label="登入" class="w-full" :loading="loading" />
                                
                                <div class="text-center mt-4">
                                    <p class="text-sm text-gray-600">
                                        還沒有帳號？
                                        <router-link to="/register" class="text-blue-600 hover:text-blue-800">
                                            立即註冊
                                        </router-link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </TabPanel>
                    
                    <TabPanel header="商家" value="merchant">
                        <div class="p-2">
                            <form @submit.prevent="handleMerchantLogin" class="space-y-4">
                                <div>
                                    <IftaLabel>
                                        <InputText 
                                            id="merchantEmail" 
                                            v-model="merchantForm.email" 
                                            type="email" 
                                            class="w-full"
                                            placeholder="請輸入商家電子郵件"
                                            :class="{ 'p-invalid': v$.merchantForm.email.$invalid && submitted }"
                                        />
                                        <label for="merchantEmail">商家電子郵件</label>
                                    </IftaLabel>
                                    <small v-if="v$.merchantForm.email.$invalid && submitted" class="p-error">
                                        {{ v$.merchantForm.email.$errors[0].$message }}
                                    </small>
                                </div>
                                
                                <div>
                                    <IftaLabel>
                                        <Password 
                                            id="merchantPassword" 
                                            v-model="merchantForm.password" 
                                            :feedback="false" 
                                            :toggleMask="true"
                                            inputClass="w-full" 
                                            class="w-full"
                                            placeholder="請輸入商家密碼"
                                            :class="{ 'p-invalid': v$.merchantForm.password.$invalid && submitted }"
                                        />
                                        <label for="merchantPassword">商家密碼</label>
                                    </IftaLabel>
                                    <small v-if="v$.merchantForm.password.$invalid && submitted" class="p-error">
                                        {{ v$.merchantForm.password.$errors[0].$message }}
                                    </small>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <Checkbox v-model="merchantForm.rememberMe" id="merchantRememberMe" />
                                        <label for="merchantRememberMe" class="ml-2 text-sm text-gray-600">記住我</label>
                                    </div>
                                    <div>
                                        <router-link to="/merchant/forgot-password" class="text-sm text-blue-600 hover:text-blue-800">
                                            忘記密碼？
                                        </router-link>
                                    </div>
                                </div>
                                
                                <Button type="submit" label="商家登入" severity="warning" class="w-full" :loading="loading" />
                                
                                <div class="text-center mt-4">
                                    <p class="text-sm text-gray-600">
                                        還未註冊商家帳號？
                                        <router-link to="/merchant/register" class="text-blue-600 hover:text-blue-800">
                                            申請成為商家
                                        </router-link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const activeTabIndex = ref(0);
const loading = ref(false);
const submitted = ref(false);

// 用戶表單
const userForm = reactive({
    email: '',
    password: '',
    rememberMe: false
});

// 商家表單
const merchantForm = reactive({
    email: '',
    password: '',
    rememberMe: false
});

// 表單驗證規則
const rules = computed(() => {
    return {
        userForm: {
            email: { required, email },
            password: { required, minLength: minLength(6) }
        },
        merchantForm: {
            email: { required, email },
            password: { required, minLength: minLength(6) }
        }
    };
});

const v$ = useVuelidate(rules, { userForm, merchantForm });

// 處理用戶登入
const handleUserLogin = async () => {
    submitted.value = true;
    const isFormValid = await v$.value.userForm.$validate();
    
    if (!isFormValid) {
        return;
    }
    
    loading.value = true;
    
    try {
        const result = await authStore.loginUser({
            email: userForm.email,
            password: userForm.password,
            rememberMe: userForm.rememberMe
        });
        
        if (result.success) {
            toast.add({
                severity: 'success',
                summary: '登入成功',
                detail: '歡迎回來！',
                life: 3000
            });
            router.push('/user/dashboard');
        } else {
            toast.add({
                severity: 'error',
                summary: '登入失敗',
                detail: result.message || '請檢查您的帳號密碼',
                life: 3000
            });
        }
    } catch (error) {
        console.error('登入錯誤:', error);
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

// 處理商家登入
const handleMerchantLogin = async () => {
    submitted.value = true;
    const isFormValid = await v$.value.merchantForm.$validate();
    
    if (!isFormValid) {
        return;
    }
    
    loading.value = true;
    
    try {
        const result = await authStore.loginMerchant({
            email: merchantForm.email,
            password: merchantForm.password,
            rememberMe: merchantForm.rememberMe
        });
        
        if (result.success) {
            toast.add({
                severity: 'success',
                summary: '商家登入成功',
                detail: '歡迎回到商家後台！',
                life: 3000
            });
            router.push('/merchant/dashboard');
        } else {
            toast.add({
                severity: 'error',
                summary: '商家登入失敗',
                detail: result.message || '請檢查您的商家帳號密碼',
                life: 3000
            });
        }
    } catch (error) {
        console.error('商家登入錯誤:', error);
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
:deep(.p-tabview-nav) {
    justify-content: center;
    margin-bottom: 1.5rem;
}

:deep(.p-tabview-nav li) {
    flex: 1;
    max-width: 200px;
}

:deep(.p-tabview-nav li .p-tabview-nav-link) {
    justify-content: center;
}
</style> 