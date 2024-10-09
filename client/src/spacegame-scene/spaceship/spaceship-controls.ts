import Phaser from 'phaser';
import VirtualJoyStick from 'phaser3-rex-plugins/plugins/virtualjoystick';
import VirtualJoyStickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin';

import { ShootButtonImage } from 'client/spacegame-scene/shoot-button.image';
import { SpaceshipSprite } from 'client/spacegame-scene/spaceship/spaceship.sprite';

export class SpaceshipControls {
    private _shootButton?: ShootButtonImage;
    private _cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private _wasdKeys?: WasdKeys;
    private _joyStick?: VirtualJoyStick;
    private _isClicking = false;

    static preload(scene: Phaser.Scene) {
        ShootButtonImage.preload(scene);
    }

    constructor(
        scene: Phaser.Scene,
        private spaceship: SpaceshipSprite,
    ) {
        if (scene.input.keyboard && window.innerWidth > 800) {
            this._cursors = scene.input.keyboard.createCursorKeys();
            this._wasdKeys = scene.input.keyboard.addKeys({
                w: Phaser.Input.Keyboard.KeyCodes.W,
                a: Phaser.Input.Keyboard.KeyCodes.A,
                d: Phaser.Input.Keyboard.KeyCodes.D,
            }) as WasdKeys;

            scene.input.on(
                Phaser.Input.Events.POINTER_DOWN,
                (pointer: Phaser.Input.Pointer) => (this._isClicking = pointer.leftButtonDown()),
            );
            scene.input.on(
                Phaser.Input.Events.POINTER_UP,
                (pointer: Phaser.Input.Pointer) => (this._isClicking = pointer.leftButtonDown()),
            );
        } else {
            this._joyStick = (scene.plugins.get('rexVirtualJoystick') as VirtualJoyStickPlugin).add(
                scene,
                {
                    x: window.innerWidth - window.innerWidth * 0.1,
                    y: window.innerHeight - window.innerHeight * 0.01,
                    radius: 50,
                    base: scene.add.circle(0, 0, 50, 0x888888),
                    thumb: scene.add.circle(0, 0, 30, 0xcccccc),
                    dir: 2,
                    forceMin: 16,
                    enable: true,
                    fixed: true,
                },
            );
            this._shootButton = new ShootButtonImage(scene);
        }
    }

    public get isShooting() {
        if (!this.spaceship.active) {
            return false;
        }
        return !!(this._cursors?.space.isDown || this._isClicking || this._shootButton?.isShooting);
    }

    public get isAccelerating() {
        if (!this.spaceship.active) {
            return false;
        }
        return !!(
            (this._cursors?.up.isDown || this._wasdKeys?.w.isDown) ??
            (this._joyStick?.force ?? 0) > 50
        );
    }

    public get isTurningLeft() {
        if (!this.spaceship.active) {
            return false;
        }
        return !!(
            (this._cursors?.left.isDown || this._wasdKeys?.a.isDown) ??
            (this.getRotation() < this.spaceship.rotation && this._joyStick?.force)
        );
    }

    public get isTurningRight() {
        if (!this.spaceship.active) {
            return false;
        }
        return !!(
            (this._cursors?.right.isDown || this._wasdKeys?.d.isDown) ??
            (this.getRotation() > this.spaceship.rotation && this._joyStick?.force)
        );
    }

    private getRotation() {
        return this._joyStick?.rotation ?? 0;
    }
}

interface WasdKeys {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
}
