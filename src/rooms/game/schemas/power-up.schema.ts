import { Schema, type } from '@colyseus/schema';

export class PowerUp extends Schema implements IPowerUp {
    @type('int8') type: number;
    @type('number') x: number;
    @type('number') y: number;
    @type('number') lifeTime: number;
}

export interface IPowerUp {
    type: number;
    x: number;
    y: number;
    lifeTime: number;
}
