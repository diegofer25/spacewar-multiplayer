import { MapSchema } from '@colyseus/schema';

import { ISpaceshipLaser, LaserUpdate } from './laser.types';
import { IPowerUp } from './power-up.types';
import { ISpaceship, SpaceshipStateToUpdate } from './spaceship.types';

export interface IGameState {
    spaceships: MapSchema<ISpaceship>;
    lasers: MapSchema<ISpaceshipLaser>;
    powerUps: MapSchema<IPowerUp>;
}

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
