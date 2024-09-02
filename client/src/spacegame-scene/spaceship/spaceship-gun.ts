import { ShootButtonImage } from 'client/spacegame-scene/shoot-button.image';
import { SpaceGameScene } from 'client/spacegame-scene/spacegame.scene';
import { SpaceshipLaser } from 'client/spacegame-scene/spaceship/spaceship-laser.sprite';
import { SpaceshipSprite } from 'client/spacegame-scene/spaceship/spaceship.sprite';

export class SpaceshipLaserGun {
    private _lasers: Map<string, SpaceshipLaser> = new Map();

    static preload(scene: Phaser.Scene, spaceship: SpaceshipSprite) {
        ShootButtonImage.preload(scene);
    }

    constructor(
        private scene: SpaceGameScene,
        private spaceship: SpaceshipSprite,
    ) {}

    public get lasers() {
        return this._lasers;
    }

    public fire(id: string, x: number, y: number, rotation: number) {
        this._lasers.set(id, new SpaceshipLaser(this.scene, x, y, rotation, this.spaceship.name));
    }

    public removeLaser(id: string) {
        const laser = this._lasers.get(id);
        if (laser) {
            laser.destroyLaser();
            this._lasers.delete(id);
        }
    }
}
