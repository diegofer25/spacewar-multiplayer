<template>
    <div class="menu-container">
        <GameIcon
            :icon="icon"
            :size="35"
            @click="toggleMenu"
            class="menu-container__icon"
            :class="isMenuOpen && '-is-open'"
        />
        <Transition name="slide">
            <div v-if="isMenuOpen" class="menu-container__menu">
                <GameChat />
                <div class="menu-container__options">
                    <GameToggle v-model="isSoundEnabled" label="Sound" />
                    <GameToggle v-model="isMusicEnabled" label="Music" />
                    <a href="https://github.com/diegofer25/spacewar-multiplayer" target="_blank">
                        <GameIcon icon="gitHub" :size="35" />
                    </a>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import GameChat from 'client/spacegame-scene/header-ui/GameChat.vue';
import GameIcon from 'client/spacegame-scene/header-ui/GameIcon.vue';
import GameToggle from 'client/spacegame-scene/header-ui/GameToggle.vue';
import { useHeaderStore } from 'client/spacegame-scene/header-ui/use-header-store';
import { computed, ref } from 'vue';

const { state, setMusicEnabled, setSoundEnabled } = useHeaderStore();
const isMenuOpen = ref(false);
const isSoundEnabled = computed({
    get: () => state.value.isSoundEnabled,
    set: value => setSoundEnabled(value),
});
const isMusicEnabled = computed({
    get: () => state.value.isMusicEnabled,
    set: value => setMusicEnabled(value),
});
const icon = computed(() => (isMenuOpen.value ? 'close' : 'menu'));

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}
</script>

<style lang="scss" scoped>
.menu-container {
    pointer-events: all;
    padding: 10px;

    &__menu {
        position: absolute;
        top: 0;
        left: 0;
        width: min(calc(100vw - 50px), 400px);
        height: min(30vh, 300px);
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        padding: 15px 10px;
    }

    &__options {
        display: flex;
        justify-content: center;
        gap: 20px;
    }

    &__icon {
        position: absolute;
        top: 10px;
        left: 10px;
        cursor: pointer;
        transition: all left 0.3s ease;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        padding: 5px;

        &.-is-open {
            left: calc(min(calc(100vw - 50px), 400px) + 20px);
        }
    }
}

.slide-enter-active {
    animation: slide-in 0.3s ease;
}

.slide-leave-active {
    animation: slide-out 0.3s ease;
}

@keyframes slide-in {
    from {
        left: -100%;
    }
    to {
        left: 10px;
    }
}

@keyframes slide-out {
    from {
        left: 10px;
    }
    to {
        left: -100%;
    }
}
</style>
