import { LaserUpdate } from './laser.types';
import { SpaceshipStateToUpdate } from './spaceship.types';

export interface StartGameOptions {
    userId: string;
    username: string;
}

export interface StateUpdateEvent {
    spaceship: SpaceshipStateToUpdate;
    lasers: LaserUpdate[];
}

export interface ChatMessage {
    userId: string;
    message: string;
    username: string;
}
