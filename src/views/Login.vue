<template>
    <div class="max-w-md mx-auto mt-10 p-6 border rounded space-y-4">
        <h2 class="text-xl font-bold">登入</h2>
        <input v-model="email" placeholder="Email" class="w-full p-2 border rounded" />
        <input v-model="password" type="password" placeholder="密碼" class="w-full p-2 border rounded" />
        <select v-model="role" class="w-full p-2 border rounded">
            <option disabled value="">請選擇角色</option>
            <option value="user">使用者</option>
            <option value="merchant">商家</option>
            <option value="admin">管理員</option>
        </select>
        <Button variant="default" size="lg" @click="handleLogin">登入</Button>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const role = ref('')
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = () => {
    authStore.login({
        user: { email: email.value },
        role: role.value,
        token: 'fake-token'
    })
    router.push('/')
}
</script>