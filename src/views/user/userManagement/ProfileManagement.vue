<template>
    <div class="flex flex-col flex-1">
        <Toast position="top-center" />
        <h2 class="text-2xl font-bold mb-6">會員資料管理</h2>
        <Form v-slot="$form" :initialValues="form" @submit="saveProfile" :resolver="resolver"
        class="flex flex-col flex-1 justify-between">
            <div class="grid grid-cols-2 sm:grid-col-1 gap-3">
                <FormField name="name" class="col-span-1">
                    <div class="form-label">姓名</div>
                    <InputText class="w-full" />
                    <Message v-if="$form.name?.invalid" severity="secondary" size="small" variant="simple">
                        {{ $form.name?.error?.message }}
                    </Message>
                </FormField>

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

                <FormField name="gender" class="col-span-1">
                    <div class="form-label">性別</div>
                    <Select v-model="form.gender" :options="genderOptions" optionLabel="label" optionValue="value"
                        class="w-full" />
                    <!-- <Message v-if="$form.gender?.invalid" severity="secondary" size="small" variant="simple"></Message> -->
                </FormField>

                <FormField name="birthday" class="col-span-1">
                    <div class="form-label">生日</div>
                    <DatePicker v-model="form.birthday" dateFormat="yy-mm-dd" class="w-full" />
                    <Message v-if="$form.birthday?.invalid" severity="secondary" size="small" variant="simple">
                        {{ $form.birthday?.error?.message }}
                    </Message>
                </FormField>

                <FormField name="address" class="col-span-2">
                    <div class="form-label">地址</div>
                    <InputText class="w-full" />
                    <Message v-if="$form.address?.invalid" severity="secondary" size="small" variant="simple">
                        {{ $form.address?.error?.message }}
                    </Message>
                </FormField>

                <div class="col-span-1">
                    <div class="form-label">修改密碼</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button label="修改密碼" class="w-full" @click="showPasswordModal = true" severity="info" />
                        <Dialog v-model:visible="showPasswordModal" :header="`修改密碼`" :modal="true" :draggable="false"
                            class="w-xl " :resizable="false">
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
                                        <Button label="取消" class="p-button-text mr-2"
                                            @click="showPasswordModal = false" />
                                        <Button label="儲存修改" type="submit" />
                                    </div>
                                </Form>
                            </div>
                        </Dialog>

                    </div>
                </div>
            </div>
            <div class="mt-8 flex justify-end ">
                <Button label="取消" class="p-button-text mr-2" @click="resetForm" size="large"/>
                <Button label="儲存修改" type="submit" size="large"/>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { type PropType, ref, reactive } from 'vue';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import {z } from 'zod';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import type { Result, User } from '@/types';
import { useToast } from 'primevue/usetoast';
import { Form, FormField } from '@primevue/forms';
import Dialog from 'primevue/dialog';
import { UserGender, UserGenderLabel } from '@/enums/User';

const props = defineProps({
    profile: {
        type: Object as PropType<User | null>,
        required: true
    }
});

const emit = defineEmits(['update-profile']);
const toast = useToast();
const form = reactive<User>({ 
    ...props.profile,
    id: props.profile?.id ?? 0,
    name: props.profile?.name ?? '',
    gender: props.profile?.gender ?? UserGender.Other,
    birthday: new Date(props.profile?.birthday ?? new Date()),
    address: props.profile?.address ?? '',
    email: props.profile?.email ?? '',
    phone: props.profile?.phone ?? '',
    points: props.profile?.points ?? 0,
    createdAt: new Date(props.profile?.createdAt ?? new Date())
})
const showPasswordModal = ref(false);

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

const passwordForm = reactive({
    password: '',
    confirmPassword: ''
})

const submitPasswordChange = ({ valid }: any) => {
    if (!valid) {
        toast.add({ severity: 'error', summary: '請檢查輸入資料', life: 3000 })
        return
    }
    // api 修改密碼
    // const res = await api.post('/users/change-password', {
    //   currentPassword: passwordForm.currentPassword,
    //   newPassword: passwordForm.newPassword
    // })
    const res: Result = {
        success: true,
        message: '密碼已修改'
    }

    if (res.success) {
        toast.add({ severity: 'success', summary: res.message, life: 3000 })
        showPasswordModal.value = false
    } else {
        toast.add({ severity: 'error', summary: res.message, life: 3000 })
    }
}


const resetForm = () => {
    Object.assign(form, props.profile)
};

const saveProfile = ({ valid, values }: any) => {
    if (!valid) {
        toast.add({ severity: 'error', summary: '請檢查輸入資料', life: 3000 })
        return
    }
    const profileData = values;
    const res: Result = {
        success: true,
        message: '會員資料已更新'
    }

    if (res.success) {
        emit('update-profile', profileData, res.message);

    } else {
        toast.add({ severity: 'error', summary: res.message, life: 3000 })
    }
    // 發送更新事件
};
</script>
<style scoped>
@reference "tailwindcss";
 
.form-label {
    @apply block text-sm font-medium text-gray-700 mb-1
}
</style>