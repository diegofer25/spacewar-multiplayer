export interface ISpaceshipLaser {
    spaceshipName: string;
    x: number;
    y: number;
    rotation: number;
    lifeTime: number;
}

export interface LaserUpdate {
    x: number;
    y: number;
    key: string;
}
