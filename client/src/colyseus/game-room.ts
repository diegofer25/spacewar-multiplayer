import { ChatMessage, StartGameOptions, StateUpdateEvent } from 'server/rooms/game/game.room';
import { GameState } from 'server/rooms/game/schemas/game-state.schema';

import { Spaceship } from 'server/rooms/game/schemas/spaceship.schema';
import { PowerUp } from 'server/rooms/game/schemas/power-up.schema';
import { SpaceshipLaser } from 'server/rooms/game/schemas/spaceship-laser';
import { getRoomsManager } from 'client/colyseus/rooms-manager';

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
    static listenStateUpdate(callback: (state: GameState) => void) {
        getRoomsManager().onRoomStateChange<GameState>('game', callback);
    }

    static listenAddSpaceship(callback: (item: Spaceship, key: string) => void) {
        getRoomsManager().getRoom<GameState>('game').state.spaceships.onAdd(callback);
    }

    static listenRemoveSpaceship(callback: (item: Spaceship, key: string) => void) {
        getRoomsManager().getRoom<GameState>('game').state.spaceships.onRemove(callback);
    }

    static listenPowerUpAdd(callback: (item: PowerUp, key: string) => void) {
        getRoomsManager().getRoom<GameState>('game').state.powerUps.onAdd(callback);
    }

    static listenPowerUpRemove(callback: (item: PowerUp, key: string) => void) {
        getRoomsManager().getRoom<GameState>('game').state.powerUps.onRemove(callback);
    }

    static listenSpaceshipLaserAdd(callback: (item: SpaceshipLaser, key: string) => void) {
        getRoomsManager().getRoom<GameState>('game').state.lasers.onAdd(callback);
    }

    static listenSpaceshipLaserRemove(callback: (item: SpaceshipLaser, key: string) => void) {
        getRoomsManager().getRoom<GameState>('game').state.lasers.onRemove(callback);
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
