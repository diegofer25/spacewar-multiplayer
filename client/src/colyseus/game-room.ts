import { MapSchema } from '@colyseus/schema';
import { getRoomsManager } from 'client/colyseus/rooms-manager';
import { useHeaderStore } from 'client/spacegame-scene/header-ui/use-header-store';
import {
    ChatMessage,
    IPowerUp,
    ISpaceship,
    ISpaceshipLaser,
    StartGameOptions,
    StateUpdateEvent,
} from 'sharedTypes';

export class GameRoom {
    static lastPingSentTimestamp = Date.now();
    static latency = 0;
    static shouldSendUpdate = true;
    static lastPlayerUpdateMessageSentTimestamp = Date.now();
    static lastBotUpdateMessageSentTimestamp = Date.now();

    static async join(options: StartGameOptions) {
        await getRoomsManager().joinRoom('game', options);

        useHeaderStore().setConnected(true);

        const sendPing = () => {
            this.lastPingSentTimestamp = Date.now();
            getRoomsManager().sendMessage('game', 'ping', {});
        };
        getRoomsManager().onRoomMessage('game', 'pong', async (timeToWaitUntilNextPing: number) => {
            this.latency = Date.now() - this.lastPingSentTimestamp;

            await new Promise(resolve => setTimeout(resolve, timeToWaitUntilNextPing));

            sendPing();
        });
        sendPing();
    }

    // SUBSCRIBERS
    static listenStateUpdate(callback: (state: IGameState) => void) {
        getRoomsManager().onRoomStateChange<IGameState>('game', callback);
    }

    static listenAddSpaceship(callback: (item: ISpaceship, key: string) => void) {
        getRoomsManager().getRoom<IGameState>('game').state.spaceships.onAdd(callback);
    }

    static listenRemoveSpaceship(callback: (item: ISpaceship, key: string) => void) {
        getRoomsManager().getRoom<IGameState>('game').state.spaceships.onRemove(callback);
    }

    static listenPowerUpAdd(callback: (item: IPowerUp, key: string) => void) {
        getRoomsManager().getRoom<IGameState>('game').state.powerUps.onAdd(callback);
    }

    static listenPowerUpRemove(callback: (item: IPowerUp, key: string) => void) {
        getRoomsManager().getRoom<IGameState>('game').state.powerUps.onRemove(callback);
    }

    static listenSpaceshipLaserAdd(callback: (item: ISpaceshipLaser, key: string) => void) {
        getRoomsManager().getRoom<IGameState>('game').state.lasers.onAdd(callback);
    }

    static listenSpaceshipLaserRemove(callback: (item: ISpaceshipLaser, key: string) => void) {
        getRoomsManager().getRoom<IGameState>('game').state.lasers.onRemove(callback);
    }

    static listenChatMessage(callback: (message: ChatMessage) => void) {
        getRoomsManager().onRoomMessage('game', 'chat-message', callback);
    }

    // PUBLISHERS
    static sendStateUpdate(payload: StateUpdateEvent) {
        if (this.lastPlayerUpdateMessageSentTimestamp + 50 > Date.now()) {
            return;
        }
        getRoomsManager().sendMessage('game', 'state-update', payload);
        this.lastPlayerUpdateMessageSentTimestamp = Date.now();
    }

    static sendBotStateUpdate(payload: StateUpdateEvent) {
        if (this.lastBotUpdateMessageSentTimestamp + 50 > Date.now()) {
            return;
        }
        getRoomsManager().sendMessage('game', 'state-update', payload);
        this.lastBotUpdateMessageSentTimestamp = Date.now();
    }

    static sendStartGame(options: StartGameOptions) {
        getRoomsManager().sendMessage('game', 'start-game', options);
    }

    static sendChatMessage(message: ChatMessage) {
        getRoomsManager().sendMessage('game', 'chat-message', message);
    }
}

export interface IGameState {
    spaceships: MapSchema<ISpaceship>;
    lasers: MapSchema<ISpaceshipLaser>;
    powerUps: MapSchema<IPowerUp>;
}
