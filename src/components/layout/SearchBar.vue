<template>
  <div class="searchbar-container max-w-6xl w-full">
    <div class="flex max-w-6xl w-full">
      <AutoComplete v-model="modelValue" :suggestions="suggestions" @complete="handleComplete" placeholder="搜尋課程或商家..."
        class="w-full" @keyup.enter="onSearch" />
      <Button v-if="showButton" icon="pi pi-search" label="搜尋" class="flex-shrink-0" @click="onSearch" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import AutoComplete from 'primevue/autocomplete';
import { SubCategoryLabelList } from '@/enums/CourseCategory';

const modelValue = defineModel<string>('modelValue');

const props = defineProps({
  showButton: {
    type: Boolean,
    default: true
  }
});

const suggestions = ref<string[]>([]);

const emit = defineEmits(['update:modelValue', 'search', 'complete']);

const onSearch = () => {
  // 不管是否有值，都执行搜索操作
  // 如果是空值，会搜索全部
  emit('search', modelValue.value?.trim() || '');
};

function handleComplete() {
  const query = modelValue.value?.trim();
  if (query) {
    suggestions.value = SubCategoryLabelList.filter(category => category.toLowerCase().includes(query.toLowerCase()));
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.searchbar-container {}

.searchbar-container :deep(.p-autocomplete) {
  @apply w-full;
}

.searchbar-container :deep(.p-autocomplete input) {
  @apply w-full rounded-full border-0 bg-white py-3 !px-5;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 4px 16px #00000014 !important;
}

:deep(.p-button) {
  border-radius: 0 20px 20px 0;
}
</style>