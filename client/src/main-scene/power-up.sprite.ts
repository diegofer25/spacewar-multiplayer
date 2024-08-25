import { GameObjectLifeCycle } from "./main.scene";
import powerUpSprite from '../assets/images/power-ups-sprite.png';
import { SpaceshipSprite } from "./spaceship.sprite";

export enum PowerUpTypes {
    Shield,
    Fire,
    Speed,
}

export class PowerUpSprite extends Phaser.Physics.Arcade.Sprite implements GameObjectLifeCycle {

    static preload(scene: Phaser.Scene) {
        scene.load
            .spritesheet('power-ups', powerUpSprite, { frameWidth: 69.6, frameHeight: 69 })
            .once(Phaser.Loader.Events.COMPLETE, () => {
                scene.anims.create({
                    key: `power-up-${PowerUpTypes.Shield}`,
                    frames: scene.anims.generateFrameNumbers('power-ups', { frames: getFramesByType(PowerUpTypes.Shield) }),
                    frameRate: 12,
                    repeat: -1
                });
                scene.anims.create({
                    key: `power-up-${PowerUpTypes.Fire}`,
                    frames: scene.anims.generateFrameNumbers('power-ups', { frames: getFramesByType(PowerUpTypes.Fire) }),
                    frameRate: 12,
                    repeat: -1
                });
                scene.anims.create({
                    key: `power-up-${PowerUpTypes.Speed}`,
                    frames: scene.anims.generateFrameNumbers('power-ups', { frames: getFramesByType(PowerUpTypes.Speed) }),
                    frameRate: 12,
                    repeat: -1
                });
            });

        function getFramesByType(type: PowerUpTypes): number[] {
            switch (type) {
                case PowerUpTypes.Shield:
                    // array with frame 0 to 5
                    return Array.from({ length: 6 }, (_, i) => i);
                case PowerUpTypes.Fire:
                    // array with frame 6 to 12
                    return Array.from({ length: 6 }, (_, i) => i + 6);
                case PowerUpTypes.Speed:
                    // array with frame 13 to 18
                    return Array.from({ length: 6 }, (_, i) => i + 12);
                default:
                    return [];
            }
        }
    }

    constructor(scene: Phaser.Scene, type: PowerUpTypes, x: number, y: number) {
        super(scene, x, y, 'power-ups');

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(1);

        this.anims.play(`power-up-${type}`);

        // check if any spaceship got the power up
        const collider = this.scene.physics.add.overlap(this, this.scene.children.getChildren(), (_, spaceship) => {
            if (spaceship instanceof SpaceshipSprite) {
                spaceship.consumePowerUp(type);
                collider.destroy();
                this.destroy();
            }
        }, undefined, this);
    }

    runUpdates(): void {}
}