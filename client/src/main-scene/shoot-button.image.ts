import { GameObjectLifeCycle } from "./main.scene";
import { SpaceshipSprite } from "./spaceship.sprite";
import shootButtonImage from '../assets/images/shoot-button.png';

export class ShootButtonImage extends Phaser.GameObjects.Image implements GameObjectLifeCycle {
    private _isShooting = false;

    static preload(scene: Phaser.Scene) {
        scene.load.image('shoot-button', shootButtonImage);
    }

    public get isShooting() {
        return this._isShooting;
    }

    constructor(scene: Phaser.Scene) {
        super(scene, scene.scale.width * 0.1, scene.scale.height - (scene.scale.height * 0.01), 'shoot-button');
        scene.add.existing(this);
        this
            .setInteractive()
            .setScrollFactor(0)
            .setScale(0.90)
            .setZ(1);

        // Ensure the button is scaled appropriately and placed in the correct position
        this.setOrigin(0.5, 0.5);

        // Event listener for the button
        this.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._isShooting = true;
            this.setTint(0x00ff00);
        });

        this.on(Phaser.Input.Events.POINTER_UP, () => {
            this._isShooting = false;
            this.clearTint();
        });

        this.on(Phaser.Input.Events.POINTER_OUT, () => {
            if (this._isShooting) {
                this._isShooting = false;
                this.clearTint();
            }
        });
    }

    runUpdates(): void {
        if (this._isShooting) {
            this.shoot();
        }
    }

    shoot() {
        const player = this.scene.children.getChildren().find((child) => child instanceof SpaceshipSprite && child.isPlayer) as SpaceshipSprite;
            
        if (player) {
            player.fireBullet();
        }
    }
}