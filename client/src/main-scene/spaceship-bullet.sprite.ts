import Phaser from 'phaser';
import basicBulletSprite from '../assets/images/basic-bullet-sprite.png';
import bulletShot from '../assets/audios/bullet-shot.wav';
import { GameObjectLifeCycle } from './main.scene';
import { SpaceshipSprite } from './spaceship.sprite';

export class SpaceshipBullet extends Phaser.Physics.Arcade.Sprite implements GameObjectLifeCycle {
    public wasDestroyCalled = false;
    static preload(scene: Phaser.Scene) {
        scene.load
            .spritesheet('basic-bullet', basicBulletSprite, { frameWidth: 35, frameHeight: 23.5 })
            .audio('bullet-shot', bulletShot)
            .once(Phaser.Loader.Events.COMPLETE, () => {
                scene.anims.create({
                    key: 'basic-bullet',
                    frames: scene.anims.generateFrameNumbers('basic-bullet', { frames: Array.from({ length: 8 }, (_, i) => i) }),
                    frameRate: 16,
                    repeat: -1
                });
            });
    }
    
    constructor(scene: Phaser.Scene, x: number, y: number, rotation: number, private _bulletOwnerName: string) {
        super(scene, x, y, 'basic-bullet');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.anims.play('basic-bullet', true);
        this.setActive(true);
        this.setVisible(true);
        // fire from the front of spaceship
        const bulletX = x + Math.cos(rotation) * 30;
        const bulletY = y + Math.sin(rotation) * 30;
        this.setPosition(bulletX, bulletY);
        this.setRotation(rotation);
        this.scene.physics.velocityFromRotation(rotation, 600, this.body?.velocity);

        const collider = this.scene.physics.add.overlap(this, this.scene.children.getChildren(), (_, spaceship) => {
            if (this.x < 0 || this.x > this.scene.physics.world.bounds.width || this.y < 0 || this.y > this.scene.physics.world.bounds.height) {
                this.destroyBullet(collider);
            } else if (spaceship instanceof SpaceshipSprite) {
                const spaceshipSprite = spaceship as SpaceshipSprite;
                if (spaceshipSprite.name !== this._bulletOwnerName) {
                    const bulletOwner = this.scene.children.list.find((child) => child.name === this._bulletOwnerName) as SpaceshipSprite;                    
                    bulletOwner?.addScore();
                    spaceshipSprite.destroySpaceship();
                    this.destroyBullet(collider);
                }
            }
        }, undefined, this);

        // destroy bullet after 1.2 seconds
        this.scene.time.delayedCall(1200, () => {
            this.destroyBullet(collider);
        });
    }

    runUpdates(): void {
    }

    destroyBullet(collider: Phaser.Physics.Arcade.Collider) {
        if (this.wasDestroyCalled) {
            return;
        }
        this.wasDestroyCalled = true;
        this.scene.children.remove(this);
        this.destroy();
        collider.destroy();
    }
}