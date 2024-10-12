<template>
    <component :is="ICONS[icon]" class="game-icon" />
</template>

<script lang="ts" setup>
import menuIcon from 'client/assets/images/icons/menu.svg';
import closeIcon from 'client/assets/images/icons/close.svg';
import gitHubIcon from 'client/assets/images/icons/github.svg';
import { computed } from 'vue';

const ICONS = {
    menu: menuIcon,
    close: closeIcon,
    gitHub: gitHubIcon,
};

type Icon = keyof typeof ICONS;

const props = defineProps<{ icon: Icon; size?: number }>();
const size = computed(() => `${props.size || 24}px`);
</script>

<style lang="scss" scoped>
.game-icon {
    width: v-bind(size);
    height: v-bind(size);
    cursor: pointer;

    :deep(path) {
        stroke: white;
    }
}
</style>
