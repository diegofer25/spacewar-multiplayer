import { Schema, type } from '@colyseus/schema';

import configs from '../../../../shared-configs.json';

export class Spaceship extends Schema implements ISpaceship {
    @type('boolean') connected = true;
    @type('boolean') isShooting = false;
    @type('boolean') isTurningLeft = false;
    @type('boolean') isTurningRight = false;
    @type('boolean') isAccelerating = false;
    @type('boolean') isExploding = false;
    @type('number') speedY = 0;
    @type('number') speedX = 0;
    @type('number') rotation = 0;
    @type('number') score = 0;
    @type('number') maxVelocity = configs.spaceship.initialMaxVelocity;
    @type('number') angularVelocity = configs.spaceship.initialAngularVelocity;
    @type('number') x: number;
    @type('number') y: number;
    @type('number') powerUp: number;
    @type('string') sessionId: string;
    @type('string') username: string;
    @type('number') nextFireTimestamp = 0;
    @type('number') powerUpExpiryTimestamp = 0;
    @type('number') fireRate = configs.spaceship.initialFireRate;
    @type('number') reviveTimestamp: number;

    constructor(sessionId: string, username: string) {
        super();
        this.sessionId = sessionId;
        this.username = username;
        this.x = Math.random() * configs.global.mapSize;
        this.y = Math.random() * configs.global.mapSize;
    }
}

export interface ISpaceship {
    connected: boolean;
    isShooting: boolean;
    isTurningLeft: boolean;
    isTurningRight: boolean;
    isAccelerating: boolean;
    isExploding: boolean;
    x: number;
    y: number;
    speedY: number;
    speedX: number;
    rotation: number;
    score: number;
    powerUp: number;
    maxVelocity: number;
    angularVelocity: number;
    sessionId: string;
    username: string;
    fireRate: number;
    nextFireTimestamp: number;
    reviveTimestamp: number;
    powerUpExpiryTimestamp: number;
}
