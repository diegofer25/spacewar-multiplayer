import GameHeader from 'client/spacegame-scene/header-ui/GameHeader.vue';
import { StartGameOptions } from 'sharedTypes';
import { computed, createApp, reactive, watch } from 'vue';

const state = reactive({
    ranking: [] as RankingItem[],
    latency: 0,
    options: {
        userId: '',
        username: '',
    } as StartGameOptions,
    isSoundEnabled: localStorage.getItem('isSoundEnabled') !== 'false',
    isMusicEnabled: localStorage.getItem('isMusicEnabled') !== 'false',
    isTyping: false,
});

export function useHeaderStore(onMusicChange?: (isMusicEnabled: boolean) => void) {
    if (onMusicChange) {
        watch(() => state.isMusicEnabled, onMusicChange, { immediate: true });
    }

    return {
        state: computed(() => state),
        setSoundEnabled,
        setMusicEnabled,
        setOptions,
        updateRanking,
        updateLatency,
        render,
        setIsTyping,
    };

    function setSoundEnabled(isSoundEnabled: boolean) {
        state.isSoundEnabled = isSoundEnabled;
        localStorage.setItem('isSoundEnabled', isSoundEnabled.toString());
    }

    function setMusicEnabled(isMusicEnabled: boolean) {
        state.isMusicEnabled = isMusicEnabled;
        localStorage.setItem('isMusicEnabled', isMusicEnabled.toString());
    }

    function updateRanking(ranking: RankingItem[]) {
        state.ranking = ranking;
    }

    function updateLatency(latency: number) {
        state.latency = latency;
    }

    function setOptions(options: StartGameOptions) {
        state.options = options;
    }

    function render() {
        createApp(GameHeader).mount('#app');
    }

    function setIsTyping(isTyping: boolean) {
        state.isTyping = isTyping;
    }
}

export interface RankingItem {
    username: string;
    score: number;
    userId: string;
}
