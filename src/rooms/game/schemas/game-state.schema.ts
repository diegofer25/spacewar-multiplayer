import { Schema, type, MapSchema } from '@colyseus/schema';

import { PowerUp } from './power-up.schema';
import { SpaceshipLaser } from './spaceship-laser';
import { Spaceship } from './spaceship.schema';

export class GameState extends Schema {
    @type('number') serverTimestamp = Date.now();
    @type({ map: Spaceship }) spaceships = new MapSchema<Spaceship>();
    @type({ map: SpaceshipLaser }) lasers = new MapSchema<SpaceshipLaser>();
    @type({ map: PowerUp }) powerUps = new MapSchema<PowerUp>();
}
