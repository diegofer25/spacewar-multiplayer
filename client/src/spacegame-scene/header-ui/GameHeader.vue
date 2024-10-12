<template>
    <div class="game-header" v-if="state.isConnected">
        <GameOptions />
        <div class="game-header__ranking">
            <GameRankingTable />
            <small style="margin-top: 5px">{{ state.latency }}ms</small>
        </div>
    </div>
</template>

<script lang="ts" setup>
import GameOptions from 'client/spacegame-scene/header-ui/GameOptions.vue';
import GameRankingTable from 'client/spacegame-scene/header-ui/GameRankingTable.vue';
import { useHeaderStore } from 'client/spacegame-scene/header-ui/use-header-store';

const { state } = useHeaderStore();
</script>

<style lang="scss" scoped>
.game-header {
    display: flex;
    justify-content: space-between;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    pointer-events: none;
    user-select: none;

    &__ranking {
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 5px;
        margin: 5px;
        border-radius: 5px;
    }
}
</style>
