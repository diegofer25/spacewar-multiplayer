import { StartGameOptions, StateUpdateEvent } from 'server/rooms/game/game.room';
import { GameState } from 'server/rooms/game/schemas/game-state.schema';

import { Spaceship } from 'server/rooms/game/schemas/spaceship.schema';
import { PowerUp } from 'server/rooms/game/schemas/power-up.schema';
import { SpaceshipLaser } from 'server/rooms/game/schemas/spaceship-laser';
import { getRoomsManager } from 'client/colyseus/rooms-manager';

export class GameRoom {
    static lastMessageSentTimestamp = Date.now();
    static latency = 0;
    static shouldSendUpdate = true;

    static async join(options: StartGameOptions) {
        await getRoomsManager().joinRoom('game', options);

        const sendPing = () => {
            this.lastMessageSentTimestamp = Date.now();
            getRoomsManager().sendMessage('game', 'ping', {});
        };
        const onPong = async (timeToWaitUntilNextPing: number) => {
            this.latency = Date.now() - this.lastMessageSentTimestamp;

            await new Promise(resolve => setTimeout(resolve, timeToWaitUntilNextPing));

            sendPing();
        };

        getRoomsManager().onRoomMessage('game', 'pong', onPong);
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

    // PUBLISHERS
    static sendStateUpdate(payload: StateUpdateEvent) {
        getRoomsManager().sendMessage('game', 'state-update', payload);
    }

    static sendStartGame(options: StartGameOptions) {
        getRoomsManager().sendMessage('game', 'start-game', options);
    }
}
