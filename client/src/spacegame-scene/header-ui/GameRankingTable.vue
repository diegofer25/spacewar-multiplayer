<template>
    <table style="border-collapse: collapse">
        <thead>
            <tr>
                <th>#</th>
                <th>Username</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="player in ranking" :key="player.userId">
                <td>{{ player.position }}</td>
                <td>{{ player.username }}</td>
                <td>{{ player.score }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts" setup>
import { RankingItem, useHeaderStore } from 'client/spacegame-scene/header-ui/use-header-store';
import { computed } from 'vue';

const { state } = useHeaderStore();
const ranking = computed(() => {
    const me = state.value.ranking.find(entry => entry.userId === state.value.options.userId);

    if (!me) {
        return state.value.ranking.slice(0, 4).map(addPosition);
    }

    const top3 = state.value.ranking.slice(0, 3);

    if (top3.some(entry => entry.userId === state.value.options.userId)) {
        return top3.map(addPosition);
    }

    return [...top3, me].map(addPosition);
});

function addPosition(player: RankingItem, index: number) {
    const place = index + 1;
    const isMe = player.userId === state.value.options.userId;
    const position =
        place === 4 && isMe
            ? state.value.ranking.findIndex(entry => entry.userId === state.value.options.userId) +
              1
            : place;
    return {
        ...player,
        position,
    };
}
</script>

<style lang="scss" scoped>
table {
    border: 1px solid white;
    border-collapse: collapse;
    width: 100%;
    th,
    td {
        border: 1px solid white;
        padding: 5px;
    }
}
</style>
