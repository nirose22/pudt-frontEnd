<template>
    <div>
        <h2 v-if="title" class="text-2xl font-semibold text-center mb-4">{{ title }}</h2>
        <div v-if="loading" class="flex justify-center p-4">
            <ProgressSpinner style="width:50px;height:50px" strokeWidth="3" />
        </div>
        <div v-else>
            <Carousel :value="items" :numScroll="numScroll" :numVisible="numVisible" :circular="circular"
                :responsiveOptions="responsiveOptions">
                <template #item="slotProps">
                    <slot name="item" :item="slotProps.data" />
                </template>
            </Carousel>
        </div>
    </div>
</template>

<script setup lang="ts">
import Carousel from 'primevue/carousel';
import type { CarouselResponsiveOptions } from 'primevue/carousel';
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    items: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    numScroll: {
        type: Number,
        default: 3
    },
    numVisible: {
        type: Number,
        default: 3
    },
    circular: {
        type: Boolean,
        default: true
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
    }
});
</script>