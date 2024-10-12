<template>
    <div class="toggle" @click="toggle">
        <!-- Toggle button -->
        <div :class="['toggle__switch', { 'toggle__switch--on': modelValue }]"></div>
        <!-- Label text -->
        <span class="toggle__label">{{ label }}</span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean;
    label?: string;
}>();
const emit = defineEmits(['update:modelValue']);

function toggle() {
    emit('update:modelValue', !props.modelValue);
}
</script>

<style lang="scss" scoped>
/* BEM Style SCSS */
.toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;

    &__switch {
        width: 40px;
        height: 20px;
        background-color: #ccc;
        border-radius: 20px;
        position: relative;
        transition: background-color 0.3s ease;

        &:before {
            content: '';
            width: 18px;
            height: 18px;
            background-color: #fff;
            border-radius: 50%;
            position: absolute;
            top: 1px;
            left: 1px;
            transition: transform 0.3s ease;
        }

        &--on {
            background-color: #4caf50;

            &:before {
                transform: translateX(20px);
            }
        }
    }

    &__label {
        margin-left: 10px;
        font-size: 14px;
    }
}
</style>
