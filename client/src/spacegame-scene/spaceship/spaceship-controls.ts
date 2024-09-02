import Phaser from 'phaser';
import VirtualJoyStick from 'phaser3-rex-plugins/plugins/virtualjoystick';
import VirtualJoyStickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin';

import { ShootButtonImage } from 'client/spacegame-scene/shoot-button.image';
import { GameObjectLifeCycle } from 'client/spacegame-scene/spacegame.scene';
import { SpaceshipSprite } from 'client/spacegame-scene/spaceship/spaceship.sprite';

export class SpaceshipControls implements GameObjectLifeCycle {
    private _shootButton?: ShootButtonImage;
    private _cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private _joyStick?: VirtualJoyStick;

    constructor(
        scene: Phaser.Scene,
        private spaceship: SpaceshipSprite,
    ) {
        if (scene.input.keyboard && window.innerWidth > 800) {
            this._cursors = scene.input.keyboard.createCursorKeys();
        } else {
            this._joyStick = (scene.plugins.get('rexVirtualJoystick') as VirtualJoyStickPlugin).add(
                scene,
                {
                    x: window.innerWidth - window.innerWidth * 0.1,
                    y: window.innerHeight - window.innerHeight * 0.01,
                    radius: 50,
                    base: scene.add.circle(0, 0, 50, 0x888888),
                    thumb: scene.add.circle(0, 0, 30, 0xcccccc),
                    dir: '8dir',
                    forceMin: 16,
                    enable: true,
                },
            );
            this._shootButton = new ShootButtonImage(scene);
        }
    }

    public get isShooting() {
        if (!this.spaceship.active) {
            return false;
        }
        return !!(this._cursors?.space.isDown ?? this._shootButton?.isShooting);
    }

    public get isAccelerating() {
        if (!this.spaceship.active) {
            return false;
        }
        return !!(this._cursors?.up.isDown ?? (this._joyStick?.force ?? 0) > 50);
    }

    public get isTurningLeft() {
        if (!this.spaceship.active) {
            return false;
        }
        return !!(this._cursors?.left.isDown ?? this._joyStick?.left);
    }

    public get isTurningRight() {
        if (!this.spaceship.active) {
            return false;
        }
        return !!(this._cursors?.right.isDown ?? this._joyStick?.right);
    }

    runUpdates(): void {
        this._shootButton?.runUpdates();
    }
}
