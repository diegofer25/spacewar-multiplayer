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
    userId: string;
    username: string;
    fireRate: number;
    nextFireTimestamp: number;
    reviveTimestamp: number;
    powerUpExpiryTimestamp: number;
    isBot: boolean;
    sessionId: string;
}

export type SpaceshipStateToUpdate = Pick<
    ISpaceship,
    | 'isShooting'
    | 'isTurningLeft'
    | 'isTurningRight'
    | 'isAccelerating'
    | 'x'
    | 'y'
    | 'speedY'
    | 'speedX'
    | 'rotation'
    | 'isBot'
    | 'userId'
>;
