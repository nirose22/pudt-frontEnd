<template>
    <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :placeholder="placeholder"
        class="rounded-lg border border-gray-300 px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
</template>

<script setup>
defineProps({
    modelValue: String,
    placeholder: String
})

defineEmits(['update:modelValue'])
</script>