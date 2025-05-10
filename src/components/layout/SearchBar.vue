<template>
  <div class="searchbar-container">
    <div class="relative flex w-full">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3">
        <i class="pi pi-search text-gray-500"></i>
      </span>
      <InputText 
        v-model="modelValue" 
        :placeholder="placeholder" 
        class="w-full pl-10 rounded-full border-0 bg-gray-100 py-3"
      />
      <!-- @keyup.enter="onSearch" -->

      <Button 
        v-if="showButton" 
        icon="pi pi-search" 
        label="搜尋" 
        class="ml-2"
        @click="onSearch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, defineModel } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const modelValue = defineModel<string>('modelValue');

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜尋課程、教師或地點...'
  },
  showButton: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'search']);

const onSearch = () => {
  if (modelValue.value && modelValue.value.trim()) {
    emit('search', modelValue.value);
  }
};
</script>

<style scoped>
</style> 