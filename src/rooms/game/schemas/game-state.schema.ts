import { Schema, type, MapSchema } from '@colyseus/schema';

import { IPowerUp, ISpaceship, ISpaceshipLaser } from 'sharedTypes';
import { PowerUp } from 'src/rooms/game/schemas/power-up.schema';
import { SpaceshipLaser } from 'src/rooms/game/schemas/spaceship-laser';
import { Spaceship } from 'src/rooms/game/schemas/spaceship.schema';

export class GameState extends Schema {
    @type({ map: Spaceship }) spaceships = new MapSchema<ISpaceship>();
    @type({ map: SpaceshipLaser }) lasers = new MapSchema<ISpaceshipLaser>();
    @type({ map: PowerUp }) powerUps = new MapSchema<IPowerUp>();
}
