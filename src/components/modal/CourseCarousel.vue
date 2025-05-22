<template>
    <div>
        <h2 class="text-2xl font-semibold text-center mb-4">{{ title }}</h2>
        <div v-if="loading" class="flex justify-center p-4">
            <ProgressSpinner style="width:50px;height:50px" strokeWidth="3" />
        </div>
        <div v-else>
            <Carousel 
                :value="items" 
                :numScroll="3" 
                :numVisible="3" 
                :circular="true"
                :responsiveOptions="responsiveOptions"
            >
                <template #item="slotProps">
                    <CourseCard
                        :course="slotProps.data" 
                        @click="$emit('select-course', slotProps.data)"
                        :loading="isLoading(slotProps.data.courseId)" 
                    />
                </template>
            </Carousel>
        </div>
    </div>
</template>

<script setup lang="ts">
import Carousel from 'primevue/carousel';
import type { CarouselResponsiveOptions } from 'primevue/carousel';
import ProgressSpinner from 'primevue/progressspinner';
import CourseCard from '@/components/modal/CourseCard.vue';
import type { Course } from '@/types/course';

const props = defineProps({
    title: {
        type: String,
    },
    items: {
        type: Array as () => Course[],
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    responsiveOptions: {
        type: Array as () => CarouselResponsiveOptions[],
        default: () => [
            {
                breakpoint: '1199px',
                numVisible: 3,
                numScroll: 1
            },
            {
                breakpoint: '767px',
                numVisible: 2,
                numScroll: 1
            },
            {
                breakpoint: '575px',
                numVisible: 1,
                numScroll: 1
            }
        ]
    },
    isLoading: {
        type: Function,
        default: () => false
    }
});

defineEmits(['select-course']);
</script> 