<template>
    <Toast position="top-right" group="global" />
    <Dialog v-model:visible="visible" modal :style="{ width: '450px' }" :closable="true" class="login-dialog"
        @hide="onHide">
        <template #header>
            <div class="grow"></div>
        </template>
        <div class="flex flex-col items-center">
            <img src="@/assets/image/pudt_logo-sm.png" alt="PUDT Logo" class="h-16 mb-4" />
            <h2 class="text-xl font-bold text-sky-600">登入</h2>
        </div>
        <div class="flex flex-col gap-4">
            <Form v-slot="$form" @submit="onFormSubmit" :resolver="resolver" :initialValues="initialValues"
                class="flex flex-col gap-4">
                <FormField name="account">
                    <IconField>
                        <InputIcon class="pi pi-user" />
                        <InputText placeholder="帳號或 E-mail" type="text" class="w-full" fluid />
                    </IconField>
                    <Message v-if="$form.account?.invalid" severity="error" size="small" variant="simple">
                        {{ $form.account.error?.message }}
                    </Message>
                </FormField>
                <FormField name="password">
                    <IconField>
                        <InputIcon class="pi pi-lock" />
                        <Password type="password" placeholder="密碼" :feedback="false" toggleMask fluid variant="filled"
                            class="w-full" />
                    </IconField>
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
                        {{ $form.password.error?.message }}
                    </Message>
                </FormField>

                <div class="flex justify-between items-center">
                    <Checkbox v-model="rememberMe" :binary="true" />
                    <span class="text-sm text-gray-600">記住我</span>
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
                    <Button type="button" class="p-button-rounded p-button-outlined line-login-btn"
                        @click="handleLineLogin">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                        </svg>
                    </Button>
                </div>
            </Form>
        </div>

        <template #footer>
            <div class="text-center">
                <p class="text-sm text-gray-600">
                    還沒有帳號？
                    <Button link @click="goToRegister" class="p-0">立即註冊</Button>
                </p>
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Message from 'primevue/message'
import { Form, FormField } from '@primevue/forms'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Divider from 'primevue/divider'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { showError, showSuccess } from '@/utils/toastHelper'
import { lineService } from '@/services/lineService'

const visible = defineModel<boolean>('visible', { required: true })

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const rememberMe = ref(false)

const initialValues = ref({
    account: '',
    password: ''
})

const resolver = zodResolver(
    z.object({
        account: z.string().min(1, { message: '帳號或 E-mail 不能為空' }),
        password: z.string().min(1, { message: '密碼不能為空' })
    })
)

const onFormSubmit = async (e: any) => {
    if (e.valid) {
        loading.value = true
        try {
            const res = await authStore.login({
                ...e.values,
                rememberMe: rememberMe.value
            })
            if (res.success) {
                showSuccess(res.message || '登入成功')
                visible.value = false
                setTimeout(() => {
                    router.go(0)
                }, 500)
            } else {
                showError(res.message || '登入失敗')
            }
        } finally {
            loading.value = false
        }
    }
}

const handleGoogleLogin = async () => {
    try {
        const res = await authStore.loginWithGoogle()
        if (res.success) {
            visible.value = false
        }
    } catch {
        showError('Google 登入失敗')
    }
}

const handleFacebookLogin = async () => {
    try {
        const res = await authStore.loginWithFacebook()
        if (res.success) {
            visible.value = false
        }
    } catch {
        showError('Facebook 登入失敗')
    }
}

const handleLineLogin = async () => {
    try {
        await lineService.startLineLogin();
        // LINE登入會重定向，所以不關閉對話框
    } catch (error: any) {
        console.error('LINE登入錯誤:', error)
        showError(error.message || 'LINE登入失敗')
    }
}

const goToRegister = () => {
    visible.value = false
    router.push('/register')
}

const onHide = () => {
    visible.value = false
}
</script>

<style scoped>
.login-dialog :deep(.p-dialog-header) {
    padding: 1.5rem;
}

.login-dialog :deep(.p-dialog-content) {
    padding: 1.5rem;
}

.login-dialog :deep(.p-dialog-footer) {
    padding: 1rem 1.5rem;
}

.line-login-btn {
    color: #06C755 !important;
    border-color: #06C755 !important;
}

.line-login-btn:hover {
    background-color: #06C755 !important;
    color: white !important;
}
</style>