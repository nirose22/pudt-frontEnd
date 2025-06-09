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
import { useUserStore } from '@/stores/userStore'

const visible = defineModel<boolean>('visible', { required: true })

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
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
            const authRes = await authStore.login({
                ...e.values,
                rememberMe: rememberMe.value
            })
            if (authRes.success) {
                showSuccess('登入成功')
                visible.value = false
                router.push('/');
            } else {
                showError(authRes.message ?? '登入失敗')
            }
        } catch (error) {
            showError('登入失敗', error instanceof Error ? error.message : '未知錯誤')
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
    } catch (error) {
        showError('Google 登入失敗')
    }
}

const handleFacebookLogin = async () => {
    try {
        const res = await authStore.loginWithFacebook()
        if (res.success) {
            visible.value = false
        }
    } catch (error) {
        showError('Facebook 登入失敗')
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
</style>