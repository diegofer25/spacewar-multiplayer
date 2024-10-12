<template>
    <div class="chat">
        <div class="chat__messages" ref="messageContainer">
            <div
                class="chat__message"
                v-for="item in messages"
                :key="item.userId"
                :class="checkIfItsMe(item.userId) && '-is-me'"
            >
                <strong>{{ item.username }}:</strong> {{ item.message }}
            </div>
        </div>

        <div class="chat__input">
            <input
                type="text"
                v-model="newMessage"
                @keydown.enter="sendMessage"
                placeholder="Type a message..."
                class="chat__input-field"
                @focus="setIsTyping(true)"
                @blur="setIsTyping(false)"
            />
            <button @click="sendMessage" class="chat__send-btn" :disabled="!newMessage">
                Send
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { GameRoom } from 'client/colyseus/game-room';
import { useHeaderStore } from 'client/spacegame-scene/header-ui/use-header-store';
import { ChatMessage } from 'server/rooms/game/game.room';
import { ref, onMounted, nextTick } from 'vue';

const { state, setIsTyping } = useHeaderStore();
const messages = ref<ChatMessage[]>([]);
const newMessage = ref('');
const messageContainer = ref<HTMLElement | null>(null);

onMounted(() => {
    scrollToBottom();
    GameRoom.listenChatMessage(message => {
        messages.value.push(message);
        scrollToBottom();
    });
});

function sendMessage() {
    if (newMessage.value.trim()) {
        GameRoom.sendChatMessage({
            userId: state.value.options.userId,
            username: state.value.options.username,
            message: newMessage.value,
        });
        newMessage.value = '';
        scrollToBottom();
    }
}

function scrollToBottom() {
    nextTick(() => {
        if (messageContainer.value) {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
        }
    });
}

function checkIfItsMe(id: string) {
    return id === state.value.options.userId;
}
</script>

<style lang="scss" scoped>
.chat {
    display: flex;
    flex-direction: column;
    height: 300px;

    &__messages {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
        border-bottom: 1px solid #ddd;
    }

    &__message {
        padding: 5px 10px;
        border-radius: 5px;
        background-color: #4caf50;
        margin-bottom: 10px;
        max-width: 80%;
        word-wrap: break-word;

        &.-is-me {
            background-color: blue;
            align-self: flex-end;
        }
    }

    &__input {
        display: flex;
        padding: 10px;
        border-top: 1px solid #ddd;
    }

    &__input-field {
        flex: 1;
        font-size: 16px;
        border-radius: 5px;
        margin-right: 10px;
        background-color: black;
        color: white;
        border: none;
        outline: none;
        padding: 0 5px;

        &::placeholder {
            font-family: 'Orbitron', sans-serif;
        }
    }

    &__send-btn {
        background-color: #4caf50;
        color: #fff;
        border: none;
        border-radius: 5px;
        padding: 10px 15px;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #45a049;
        }

        &:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
    }
}
</style>
