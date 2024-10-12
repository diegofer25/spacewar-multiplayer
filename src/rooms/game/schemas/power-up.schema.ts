import { Schema, type } from '@colyseus/schema';

import { IPowerUp } from 'sharedTypes';

export class PowerUp extends Schema implements IPowerUp {
    @type('int8') type: number;
    @type('number') x: number;
    @type('number') y: number;
    @type('number') lifeTime: number;
}
