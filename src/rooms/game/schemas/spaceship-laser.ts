import { Schema, type } from '@colyseus/schema';

import { ISpaceshipLaser } from 'sharedTypes';

export class SpaceshipLaser extends Schema implements ISpaceshipLaser {
    @type('number') x: number;
    @type('number') y: number;
    @type('number') lifeTime: number;
    @type('number') rotation: number;
    @type('string') spaceshipName: string;

    constructor(x: number, y: number, rotation: number, spaceshipName: string) {
        super();
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.spaceshipName = spaceshipName;
    }
}
