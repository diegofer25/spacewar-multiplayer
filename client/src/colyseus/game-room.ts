import { getRoomsManager } from 'client/colyseus/rooms-manager';
import {
    ChatMessage,
    IGameState,
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
    static lastUpdateMessageSentTimestamp = Date.now();

    static async join(options: StartGameOptions) {
        await getRoomsManager().joinRoom('game', options);

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
        if (this.lastUpdateMessageSentTimestamp + 50 > Date.now()) {
            return;
        }
        getRoomsManager().sendMessage('game', 'state-update', payload);
        this.lastUpdateMessageSentTimestamp = Date.now();
    }

    static sendStartGame(options: StartGameOptions) {
        getRoomsManager().sendMessage('game', 'start-game', options);
    }

    static sendChatMessage(message: ChatMessage) {
        getRoomsManager().sendMessage('game', 'chat-message', message);
    }
}
