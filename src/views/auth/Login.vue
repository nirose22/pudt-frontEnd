<template>
    <div class="grow login-bg-frame h-full">
        <!-- <div class="login-bg-frame"></div> -->
        <div class="max-w-md mx-auto my-40 p-6 rounded-xl space-y-8 shadow-xl bg-white">
            <h2 class="text-xl font-bold text-sky-600">登入</h2>
            <div class="flex flex-col gap-3">
                <Form v-slot="$form" @submit="onFormSubmit" :resolver :initialValues="initialValues"
                    class="flex flex-col gap-3">
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
                            <Password type="password" placeholder="密碼" :feedback="false" toggleMask fluid
                                variant="filled" class="w-full" />
                        </IconField>
                        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
                            {{ $form.password.error?.message }}
                        </Message>
                    </FormField>
                    <Divider />
                    <FormField name="role">
                        <FloatLabel class="w-full md:w-56">
                            <Select :options="roles" optionLabel="name" optionValue="code"
                                class="w-full" />
                            <label for="on_label">登入模式</label>
                        </FloatLabel>
                    </FormField>
                    <div class="flex gap-3 mt-10">
                        <Button type="button" label="註冊" size="large" variant="outlined" rounded class="w-full" @click="router.push('/register')"></Button>
                        <Button type="submit" label="登入" size="large" rounded class="w-full"></Button>
                    </div>
                </Form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'
import Password from 'primevue/password';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Select from 'primevue/select';
import Message from 'primevue/message';
import FloatLabel from 'primevue/floatlabel';
import { Form, FormField } from '@primevue/forms';
import { UserRole, UserRoleLabel } from '@/enums/User';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';

// const role = ref(UserRole.User)
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const roles = ref([
    { name: UserRoleLabel[UserRole.Admin], code: UserRole.Admin },
    { name: UserRoleLabel[UserRole.Merchant], code: UserRole.Merchant },
    { name: UserRoleLabel[UserRole.User], code: UserRole.User },
    { name: UserRoleLabel[UserRole.Guest], code: UserRole.Guest }
])

const initialValues = ref({
    account: '',
    password: '',
    role: UserRole.User
});

const resolver = zodResolver(
    z.object({
        account: z.string().min(1, { message: '帳號或 E-mail 不能為空' }),
        password: z.string().min(1, { message: '密碼不能為空' }),
        role: z.string().min(1, { message: '登入模式不能為空' })
    })
);

const onFormSubmit = async (e) => {
    if (e.valid) {
        const authRes = await authStore.login(e.values);
        if (authRes.success) {
            if (authRes.data === UserRole.Merchant) {
                router.push('/merchant')
            } else {
                router.push('/')
            }
        } else {
            toast.add({ severity: 'error', summary: res.message, life: 3000 });
        }
    }
};


</script>
<style scoped>
.login-bg-frame {
    background-image: url('@/assets/image/pudt_logo-xl.png');
    background-repeat: no-repeat;
    background-position: bottom;
    background-size: 40%;
}

input {
    width: 100% !important;
}
</style>@/enums/User