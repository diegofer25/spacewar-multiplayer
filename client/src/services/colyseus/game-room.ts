import { StartGameOptions, StateUpdateEvent } from 'server/rooms/game/game.room';
import { GameState } from 'server/rooms/game/schemas/game-state.schema';

import { getRoomsManager } from 'client/services/colyseus/rooms-manager';
import { Spaceship } from 'server/rooms/game/schemas/spaceship.schema';
import { PowerUp } from 'server/rooms/game/schemas/power-up.schema';
import { SpaceshipLaser } from 'server/rooms/game/schemas/spaceship-laser';

export class GameRoom {
    static lastMessageSentTimestamp = Date.now();
    static latency = 0;
    static shouldSendUpdate = true;

    static async join(options: StartGameOptions) {
        return getRoomsManager().joinRoom('game', options);
    }

    static listenStateUpdate(callback: (state: GameState) => void) {
        getRoomsManager().onRoomStateChange<GameState>('game', state => {
            this.latency = Date.now() - this.lastMessageSentTimestamp;
            callback(state);
        });
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

    static sendStateUpdate(payload: StateUpdateEvent) {
        this.lastMessageSentTimestamp = Date.now();
        getRoomsManager().sendMessage('game', 'state-update', payload);
    }

    static sendStartGame(options: StartGameOptions) {
        this.lastMessageSentTimestamp = Date.now();
        getRoomsManager().sendMessage('game', 'start-game', options);
    }
}
