<template>
    <div>
      <h2 class="text-2xl font-bold mb-6">會員資料管理</h2>
      
      <form @submit.prevent="saveProfile">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <InputText v-model="form.name" class="w-full" />
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
            <InputText v-model="form.email" class="w-full" disabled />
            <small class="text-gray-500">郵件地址無法修改</small>
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">手機號碼</label>
            <InputText v-model="form.phone" class="w-full" />
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">性別</label>
            <Dropdown v-model="form.gender" :options="genderOptions" optionLabel="label" optionValue="value" class="w-full" />
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">生日</label>
            <Calendar v-model="form.birthday" dateFormat="yy-mm-dd" class="w-full" />
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <InputText v-model="form.address" class="w-full" />
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">修改密碼</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputText v-model="form.password" type="password" placeholder="新密碼" class="w-full" />
              </div>
              <div>
                <InputText v-model="form.confirmPassword" type="password" placeholder="確認新密碼" class="w-full" />
              </div>
            </div>
            <small class="text-gray-500">如果不修改密碼，請留空</small>
          </div>
        </div>
        
        <div class="mt-8 flex justify-end">
          <Button label="取消" class="p-button-text mr-2" @click="resetForm" />
          <Button label="儲存修改" type="submit" />
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  
  const props = defineProps({
    profile: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['update-profile']);
  
  const form = reactive({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birthday: null,
    address: '',
    password: '',
    confirmPassword: ''
  });
  
  const genderOptions = [
    { label: '男', value: '男' },
    { label: '女', value: '女' },
    { label: '其他', value: '其他' },
    { label: '不願透露', value: '不願透露' }
  ];
  
  onMounted(() => {
    // 初始化表單數據
    form.name = props.profile.name;
    form.email = props.profile.email;
    form.phone = props.profile.phone;
    form.gender = props.profile.gender;
    form.birthday = props.profile.birthday ? new Date(props.profile.birthday) : null;
    form.address = props.profile.address;
  });
  
  const resetForm = () => {
    // 重置表單數據
    form.name = props.profile.name;
    form.email = props.profile.email;
    form.phone = props.profile.phone;
    form.gender = props.profile.gender;
    form.birthday = props.profile.birthday ? new Date(props.profile.birthday) : null;
    form.address = props.profile.address;
    form.password = '';
    form.confirmPassword = '';
  };
  
  const saveProfile = () => {
    // 密碼驗證
    if (form.password && form.password !== form.confirmPassword) {
      // 在實際應用中，這裡應顯示錯誤訊息
      alert('密碼不匹配');
      return;
    }
    
    // 準備要提交的數據
    const profileData = {
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      birthday: form.birthday ? form.birthday.toISOString().split('T')[0] : null,
      address: form.address
    };
    
    // 密碼更新（僅當有輸入時）
    if (form.password) {
      profileData.password = form.password;
    }
    
    // 發送更新事件
    emit('update-profile', profileData);
    
    // 清空密碼欄位
    form.password = '';
    form.confirmPassword = '';
  };
  </script>