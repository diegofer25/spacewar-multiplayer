import configs from 'shared-configs';
import Phaser from 'phaser';

import laserShot from 'client/assets/audios/laser-shot.wav';
import basicLaserSprite from 'client/assets/images/basic-laser-sprite.png';
import { SpaceGameScene } from 'client/spacegame-scene/spacegame.scene';
import { SpaceshipSprite } from 'client/spacegame-scene/spaceship/spaceship.sprite';

export class SpaceshipLaser extends Phaser.Physics.Arcade.Sprite {
    private _particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private _LIFE_SPAN = 1500;

    public wasDestroyCalled = false;

    static preload(scene: Phaser.Scene) {
        scene.load
            .spritesheet('basic-laser', basicLaserSprite, {
                frameWidth: configs.laser.frameWidth,
                frameHeight: configs.laser.frameHeight,
            })
            .audio('laser-shot', laserShot)
            .once(Phaser.Loader.Events.COMPLETE, () => {
                scene.anims.create({
                    key: 'basic-laser',
                    frames: scene.anims.generateFrameNumbers('basic-laser', {
                        frames: Array.from({ length: 8 }, (_, i) => i),
                    }),
                    frameRate: 16,
                    repeat: -1,
                });
            });
    }

    constructor(
        scene: SpaceGameScene,
        x: number,
        y: number,
        rotation: number,
        public laserOwnerName: string,
    ) {
        super(scene, x, y, 'basic-laser');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.anims.play('basic-laser', true);
        const laserX = x + Math.cos(rotation) * 30;
        const laserY = y + Math.sin(rotation) * 30;
        this.setPosition(laserX, laserY);
        this.setRotation(rotation);
        scene.physics.velocityFromRotation(rotation, 1200, this.body?.velocity);
        scene.sound.play('laser-shot', { volume: 0.1 });

        // destroy laser after some time
        this.scene.time.delayedCall(this._LIFE_SPAN, this.destroyLaser, undefined, this);

        this._particleEmitter = scene.add
            .particles(0, 0, 'flares-particles', {
                blendMode: Phaser.BlendModes.ADD,
                scale: { start: 0.15, end: 0.1 },
                speed: 150,
                quantity: 2,
                frequency: 20,
                lifespan: 1000,
                // adjust the angle to match the laser rotation
                angle: { min: (rotation * 180) / Math.PI - 5, max: (rotation * 180) / Math.PI + 5 },
            })
            .startFollow(this);
    }

    public destroyLaser() {
        if (this.wasDestroyCalled) {
            return;
        }
        this.wasDestroyCalled = true;
        this.scene.children.remove(this);
        this._particleEmitter.stop();
        this._particleEmitter.destroy();
        this.destroy();
    }
}
