<template>
  <div class="flex min-h-screen bg-gray-100">
    <div class="m-auto w-full max-w-md p-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <!-- Logo 和標題 -->
        <div class="text-center mb-6">
          <img src="../../../assets/image/pudt_logo.png" alt="PUDT Logo" class="h-16 mx-auto mb-2" />
          <h1 class="text-2xl font-bold text-gray-800">商家管理系統</h1>
          <p class="text-gray-500">登入您的商家帳號</p>
        </div>
        
        <form @submit.prevent="login">
          <!-- 電子郵件 -->
          <div class="mb-4">
            <label for="email" class="block mb-1 font-medium">電子郵件</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-envelope"></i>
              <InputText id="email" v-model="loginForm.email" type="email" class="w-full" placeholder="請輸入您的電子郵件" />
            </span>
            <!-- <small v-if="v$.email.$invalid && v$.email.$dirty" class="p-error">{{ v$.email.$errors[0].$message }}</small> -->
          </div>
          
          <!-- 密碼 -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-1">
              <label for="password" class="font-medium">密碼</label>
              <RouterLink to="/merchant/forgot-password" class="text-sm text-blue-600 hover:text-blue-800">忘記密碼？</RouterLink>
            </div>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-lock"></i>
              <Password id="password" v-model="loginForm.password" toggleMask :feedback="false" class="w-full" placeholder="請輸入您的密碼" />
            </span>
            <!-- <small v-if="v$.password.$invalid && v$.password.$dirty" class="p-error">{{ v$.password.$errors[0].$message }}</small> -->
          </div>
          
          <!-- 記住我 -->
          <div class="mb-4 flex items-center">
            <Checkbox id="rememberMe" v-model="loginForm.rememberMe" :binary="true" />
            <label for="rememberMe" class="ml-2 cursor-pointer">記住我</label>
          </div>
          
          <!-- 登入按鈕 -->
          <Button type="submit" label="登入" icon="pi pi-sign-in" class="w-full" :loading="loading" />
          
          <!-- 錯誤訊息 -->
          <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-center">
            {{ errorMessage }}
          </div>
        </form>
        
        <!-- 分隔線 -->
        <div class="my-4 flex items-center">
          <div class="flex-grow border-t border-gray-300"></div>
          <span class="px-3 text-gray-500 text-sm">或</span>
          <div class="flex-grow border-t border-gray-300"></div>
        </div>
        
        <!-- 聯絡客服 -->
        <div class="text-center">
          <p class="text-gray-600 text-sm mb-2">還沒有商家帳號？</p>
          <Button label="聯絡客服申請" icon="pi pi-envelope" outlined class="w-full" @click="contactSupport" />
        </div>
      </div>
      
      <!-- 頁腳 -->
      <div class="mt-4 text-center text-gray-500 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} PUDT. 保留所有權利。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// import { useVuelidate } from '@vuelidate/core';
// import { required, email, minLength } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// 登入表單
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
});

// 驗證規則
const rules = {
  // email: { required, email },
  // password: { required, minLength: minLength(6) }
};

// const v$ = useVuelidate(rules, loginForm);

// 狀態
const loading = ref(false);
const errorMessage = ref('');

// 登入
async function login() {
  errorMessage.value = '';
  // const isValid = await v$.value.$validate();
  
  // if (!isValid) {
  //   return;
  // }
  
  loading.value = true;
  
  try {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模擬登入成功
    if (loginForm.email === 'merchant@example.com' && loginForm.password === 'password123') {
      // 儲存 token
      localStorage.setItem('merchantToken', 'mock-token-123456');
      
      // 導向重定向頁面或儀表板
      const redirectPath = route.query.redirect as string || '/merchant';
      router.push(redirectPath);
      
      toast.add({
        severity: 'success',
        summary: '登入成功',
        detail: '歡迎回來！',
        life: 3000
      });
    } else {
      // 登入失敗
      errorMessage.value = '電子郵件或密碼錯誤，請重試。';
    }
  } catch (error) {
    console.error('登入失敗:', error);
    errorMessage.value = '登入時發生錯誤，請稍後再試。';
  } finally {
    loading.value = false;
  }
}

// 聯絡客服
function contactSupport() {
  toast.add({
    severity: 'info',
    summary: '聯絡客服',
    detail: '請聯絡我們的客服人員以申請商家帳號',
    life: 3000
  });
  
  // 實際應用中可以導向聯絡頁面或顯示聯絡資訊
  // router.push('/contact');
}
</script> 