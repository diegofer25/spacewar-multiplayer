import powerUpSprite from 'client/assets/images/power-ups-sprite.png';
import { GameObjectLifeCycle } from 'client/spacegame-scene/spacegame.scene';
import configs from 'shared-configs';

export class PowerUpSprite extends Phaser.Physics.Arcade.Sprite implements GameObjectLifeCycle {
    static preload(scene: Phaser.Scene) {
        scene.load
            .spritesheet('power-ups', powerUpSprite, {
                frameWidth: configs.powerUp.frameWidth,
                frameHeight: configs.powerUp.frameHeight,
            })
            .once(Phaser.Loader.Events.COMPLETE, () => {
                scene.anims.create({
                    key: `power-up-${configs.powerUp.types.shield}`,
                    frames: scene.anims.generateFrameNumbers('power-ups', {
                        frames: getFramesByType(configs.powerUp.types.shield),
                    }),
                    frameRate: 12,
                    repeat: -1,
                });
                scene.anims.create({
                    key: `power-up-${configs.powerUp.types.fire}`,
                    frames: scene.anims.generateFrameNumbers('power-ups', {
                        frames: getFramesByType(configs.powerUp.types.fire),
                    }),
                    frameRate: 12,
                    repeat: -1,
                });
                scene.anims.create({
                    key: `power-up-${configs.powerUp.types.speed}`,
                    frames: scene.anims.generateFrameNumbers('power-ups', {
                        frames: getFramesByType(configs.powerUp.types.speed),
                    }),
                    frameRate: 12,
                    repeat: -1,
                });
            });

        function getFramesByType(type: number): number[] {
            switch (type) {
                case configs.powerUp.types.shield:
                    // array with frame 0 to 5
                    return Array.from({ length: 6 }, (_, i) => i);
                case configs.powerUp.types.fire:
                    // array with frame 6 to 12
                    return Array.from({ length: 6 }, (_, i) => i + 6);
                case configs.powerUp.types.speed:
                    // array with frame 13 to 18
                    return Array.from({ length: 6 }, (_, i) => i + 12);
                default:
                    return [];
            }
        }
    }

    constructor(scene: Phaser.Scene, name: string, type: number, x: number, y: number) {
        super(scene, x, y, 'power-ups');

        this.name = name;
        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(1);

        this.anims.play(`power-up-${type}`);
    }

    runUpdates(): void {}
}
