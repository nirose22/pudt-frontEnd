<template>
    <Dialog v-model:visible="dialogVisible" header="選擇您的興趣標籤" :modal="true" :closable="true"
        class="w-full md:w-4/5 lg:w-3/4" :draggable="false" :resizable="false">
        <div class="p-4">
            <!-- 統計和提示信息 -->
            <div class="bg-primary-50 p-3 rounded-lg mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <p class="font-medium">已選擇 <span class="text-primary-700">{{ interestsData.categories.length }}</span> 個類別，
                    <span class="text-primary-700">{{ interestsData.subCategories.length }}</span> 個標籤</p>
                    <p class="text-sm text-gray-600">選擇您喜歡的類別和標籤，系統將為您推薦相關課程</p>
                </div>
                <Button v-if="interestsData.categories.length > 0 || interestsData.subCategories.length > 0"
                    label="清空所有選擇" icon="pi pi-trash" text severity="danger" @click="clearAllInterests" />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- 左側：主分類選擇區 -->
                <div class="col-span-1 border rounded-lg p-3">
                    <h4 class="text-lg font-medium mb-3 pb-2 border-b">興趣類別</h4>
                    <div class="flex flex-wrap gap-2">
                        <Chip v-for="cat in mainCategoryOptions" :key="cat.value" :label="cat.label"
                            :class="{ 'chip-selected': interestsData.categories.includes(cat.value) }"
                            @click="toggleMainCategory(cat.value)" />
                    </div>
                </div>

                <!-- 中間：子分類選擇區 -->
                <div class="lg:col-span-2 border rounded-lg p-3">
                    <h4 class="text-lg font-medium mb-3 pb-2 border-b">詳細興趣標籤</h4>
                    
                    <div v-if="interestsData.categories.length === 0" class="text-center p-4">
                        <p class="text-gray-500">請先從左側選擇興趣類別</p>
                    </div>
                    
                    <Accordion v-else :multiple="true" class="interest-accordion">
                        <AccordionPanel v-for="mainCat in interestsData.categories" :key="mainCat" :value="mainCat">
                            <div class="flex justify-between items-center w-full" slot="header">
                                <span>{{ getMainCategoryLabel(mainCat) }}</span>
                                <Badge :value="getSubCategoriesCount(mainCat)" class="ml-2" severity="info" />
                            </div>
                            
                            <div class="flex flex-wrap gap-2 p-2">
                                <Chip v-for="subCat in getSubCategoriesForMainCategory(mainCat)" :key="subCat.value"
                                    :label="subCat.label"
                                    :class="{ 'chip-selected': interestsData.subCategories.includes(subCat.value) }"
                                    @click="toggleSubCategory(subCat.value)" />
                            </div>
                            
                            <div class="mt-2 flex justify-between">
                                <Button label="全選" icon="pi pi-check-circle" size="small" text
                                    @click="selectAllSubCategories(mainCat)" />
                                <Button label="取消全選" icon="pi pi-times-circle" size="small" text
                                    @click="deselectAllSubCategories(mainCat)" />
                            </div>
                        </AccordionPanel>
                    </Accordion>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between w-full">
                <small class="text-gray-500 self-center">
                    提示：選擇感興趣的標籤，系統將為您提供個人化的課程推薦
                </small>
                <div>
                    <Button label="取消" icon="pi pi-times" class="p-button-text" @click="cancel" />
                    <Button label="確認" icon="pi pi-check" @click="confirm" />
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionContent from 'primevue/accordioncontent';
import AccordionHeader from 'primevue/accordionheader';
import Badge from 'primevue/badge';
import { MainCategory, MainCategoryLabel, SubCategory, SubCategoryLabel } from '@/enums/CourseCategory';
import { showInfo } from '@/utils/toastHelper';

const props = defineProps<{
    modelValue: boolean;
    interests: {
        categories: string[];
        subCategories: string[];
    };
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'confirm', interests: { categories: string[], subCategories: string[] }): void;
    (e: 'cancel'): void;
}>();

// 對話框顯示狀態
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

// 存儲興趣數據的響應式對象
const interestsData = reactive({
    categories: [...props.interests.categories],
    subCategories: [...props.interests.subCategories]
});

// 將主分類轉換為選項格式
const mainCategoryOptions = Object.entries(MainCategoryLabel).map(([value, label]) => ({
    label,
    value
}));

// 獲取各種標籤名稱的函數
const getMainCategoryLabel = (code: string): string => {
    return MainCategoryLabel[code as MainCategory] || code;
};

const getSubCategoryLabel = (code: string): string => {
    return SubCategoryLabel[code as SubCategory] || code;
};

// 計算某主分類下已選擇的子分類數量
const getSubCategoriesCount = (mainCat: string): number => {
    return interestsData.subCategories.filter(subCat => subCat.startsWith(mainCat)).length;
};

// 根據主分類獲取相關子分類的選項
const getSubCategoriesForMainCategory = (mainCatCode: string) => {
    return Object.entries(SubCategoryLabel)
        .filter(([value]) => value.startsWith(mainCatCode))
        .map(([value, label]) => ({
            label,
            value
        }));
};

// 清空所有興趣選擇
const clearAllInterests = () => {
    interestsData.categories = [];
    interestsData.subCategories = [];
    showInfo('已清空所有興趣標籤', '標籤更新');
};

// 切換主分類
const toggleMainCategory = (category: string) => {
    const index = interestsData.categories.indexOf(category);
    if (index === -1) {
        // 添加主分類
        interestsData.categories.push(category);
        
        // 不自動選中該主分類下的所有子分類，讓用戶自己選擇
    } else {
        // 移除主分類
        interestsData.categories.splice(index, 1);
        
        // 同時移除該主分類下的所有子分類
        interestsData.subCategories = interestsData.subCategories.filter(
            subCat => !subCat.startsWith(category)
        );
    }
};

// 切換子分類
const toggleSubCategory = (subCategory: string) => {
    const index = interestsData.subCategories.indexOf(subCategory);
    if (index === -1) {
        // 添加子分類
        interestsData.subCategories.push(subCategory);
        
        // 確保主分類已選中
        const mainCat = subCategory.split('_')[0];
        if (!interestsData.categories.includes(mainCat)) {
            interestsData.categories.push(mainCat);
        }
    } else {
        // 移除子分類
        interestsData.subCategories.splice(index, 1);
    }
};

// 選擇某主分類下的所有子分類
const selectAllSubCategories = (mainCat: string) => {
    const allSubCats = Object.keys(SubCategoryLabel)
        .filter(key => key.startsWith(mainCat));
    
    // 添加尚未選中的子分類
    allSubCats.forEach(subCat => {
        if (!interestsData.subCategories.includes(subCat)) {
            interestsData.subCategories.push(subCat);
        }
    });
    
    showInfo(`已選擇「${getMainCategoryLabel(mainCat)}」下的所有標籤`, '標籤更新');
};

// 取消選擇某主分類下的所有子分類
const deselectAllSubCategories = (mainCat: string) => {
    interestsData.subCategories = interestsData.subCategories.filter(
        subCat => !subCat.startsWith(mainCat)
    );
    
    // 如果沒有該主分類下的子分類，可以選擇是否要移除主分類
    // 這裡選擇保留主分類，讓用戶能夠更方便地重新選擇
    
    showInfo(`已移除「${getMainCategoryLabel(mainCat)}」下的所有標籤`, '標籤更新');
};

// 確認按鈕處理
const confirm = () => {
    emit('confirm', {
        categories: [...interestsData.categories],
        subCategories: [...interestsData.subCategories]
    });
};

// 取消按鈕處理
const cancel = () => {
    emit('cancel');
    dialogVisible.value = false;
};
</script>

<style scoped>
@reference "tailwindcss";

:deep(.p-chip) {
    @apply cursor-pointer transition-colors;
}

:deep(.p-chip.chip-selected) {
    @apply !bg-sky-500 !text-white;
}

:deep(.p-chip.chip-selected:hover) {
    @apply !bg-sky-600;
}

:deep(.interest-accordion .p-accordion-header-link) {
    @apply py-3;
}

:deep(.interest-accordion .p-accordion-content) {
    @apply p-3;
}
</style> 