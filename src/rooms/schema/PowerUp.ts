import { Schema, type } from '@colyseus/schema';

export enum PowerUpTypes {
    Shield,
    Fire,
    Speed,
}

export class PowerUp extends Schema implements IPowerUp {
    @type('int8') type: PowerUpTypes;
    @type('number') x: number;
    @type('number') y: number;
    @type('number') lifeTime: number;
}

export interface IPowerUp {
    type: PowerUpTypes;
    x: number;
    y: number;
    lifeTime: number;
}