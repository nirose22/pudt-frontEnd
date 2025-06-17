<template>
  <div class="flex min-h-screen bg-gray-100">
    <div class="m-auto w-full max-w-md p-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <Toast />

        <!-- Logo 和標題 -->
        <div class="flex flex-col items-center mb-6">
          <img src="@/assets/image/pudt_logo-sm.png" alt="PUDT Logo" class="h-16 mb-4" />
          <h2 class="text-xl font-bold text-sky-600">商家登入</h2>
        </div>

        <Form v-slot="$form" @submit="onFormSubmit" :resolver="resolver" :initialValues="initialValues"
          class="flex flex-col gap-4">
          <FormField name="account">
            <IconField>
              <InputIcon class="pi pi-envelope" />
              <InputText placeholder="請輸入您的電子郵件" type="email" class="w-full" fluid />
            </IconField>
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
              {{ $form.email.error?.message }}
            </Message>
          </FormField>

          <FormField name="password">
            <IconField>
              <InputIcon class="pi pi-lock" />
              <Password type="password" placeholder="請輸入您的密碼" :feedback="false" toggleMask fluid variant="filled"
                class="w-full" />
            </IconField>
            <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
              {{ $form.password.error?.message }}
            </Message>
          </FormField>

          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <Checkbox v-model="rememberMe" :binary="true" />
              <span class="text-sm text-gray-600 ml-2">記住我</span>
            </div>
            <RouterLink to="/merchant/forgot-password" class="text-sm text-sky-600 hover:text-sky-800">忘記密碼？
            </RouterLink>
          </div>

          <Button type="submit" label="登入" size="large" rounded class="w-full" :loading="loading" />

          <Divider>
            <span class="text-sm text-gray-500">或使用以下方式登入</span>
          </Divider>

          <div class="flex gap-4 justify-center">
            <Button type="button" icon="pi pi-google" class="p-button-rounded p-button-outlined"
              @click="handleGoogleLogin" />
            <Button type="button" icon="pi pi-facebook" class="p-button-rounded p-button-outlined"
              @click="handleFacebookLogin" />
          </div>
        </Form>

        <!-- 聯絡客服 -->
        <div class="text-center mt-4">
          <p class="text-sm text-gray-600">
            還沒有商家帳號？
            <Button link @click="contactSupport" class="p-0">聯絡客服申請</Button>
          </p>
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
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Form, FormField } from '@primevue/forms';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Message from 'primevue/message';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import { showSuccess, showError, showInfo } from '@/utils/toastHelper';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const rememberMe = ref(false);

const initialValues = ref({
  account: '',
  password: ''
});

const resolver = zodResolver(
  z.object({
    account: z.string().email({ message: '請輸入有效的電子郵件' }),
    password: z.string().min(6, { message: '密碼至少需要6個字符' })
  })
);

const onFormSubmit = async (e: any) => {
  if (e.valid) {
    loading.value = true;
    try {
      const res = await authStore.login({
        ...e.values,
        rememberMe: rememberMe.value
      })
      if (res.success) {
        console.log(1111);
        
        showSuccess(res.message || '登入成功')
        router.push('/merchant/dashboard')
      } else {
        showError(res.message || '登入失敗')
      }
    } finally {
      loading.value = false
    }
  }
}

const handleGoogleLogin = async () => {
  showInfo('Google 登入功能開發中', 'Google 登入');
}

const handleFacebookLogin = async () => {
  showInfo('Facebook 登入功能開發中', 'Facebook 登入');
}

function contactSupport() {
  showInfo('請聯絡我們的客服人員以申請商家帳號', '聯絡客服');
}
</script>