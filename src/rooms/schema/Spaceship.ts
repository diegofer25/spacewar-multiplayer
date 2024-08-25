import { Schema, type } from '@colyseus/schema';

export class Spaceship extends Schema implements ISpaceship {
    @type('boolean') connected = true;
    @type('string') sessionId: string;
    @type('string') username: string;
    @type('boolean') isShooting: boolean;
    @type('boolean') isTurningLeft: boolean;
    @type('boolean') isTurningRight: boolean;
    @type('boolean') isAccelerating: boolean;
    @type('number') x: number;
    @type('number') y: number;
    @type('number') speedY: number;
    @type('number') speedX: number;
    @type('number') rotation: number;
    @type('boolean') isExploding: boolean;
    @type('boolean') isDestroyed: boolean;
    @type('number') score: number;

    constructor (sessionId: string, username: string) {
        super();
        this.sessionId = sessionId;
        this.username = username;
    }
}

export interface ISpaceship {
    connected: boolean;
    sessionId: string;
    username: string;
    isShooting: boolean;
    isTurningLeft: boolean;
    isTurningRight: boolean;
    isAccelerating: boolean;
    x: number;
    y: number;
    speedY: number;
    speedX: number;
    rotation: number;
    isExploding: boolean;
    isDestroyed: boolean;
    score: number;
}