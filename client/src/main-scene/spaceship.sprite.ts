import Phaser from 'phaser';
import * as Colyseus from "colyseus.js";
import { GameState } from './../../../src/rooms/schema/GameState';
import { SpaceshipBullet } from './spaceship-bullet.sprite';
import { GameObjectLifeCycle } from './main.scene';
import spaceshipImage from '../assets/images/spaceship.png';
import explosionSprite from '../assets/images/explosion-sprite.png';
import explosionSound from '../assets/audios/explosion.mp3';
import turbineSound from '../assets/audios/turbine.wav';
import { ISpaceship } from '../../../src/rooms/schema/Spaceship';
import VirtualJoyStick from 'phaser3-rex-plugins/plugins/virtualjoystick';
import VirtualJoyStickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin';
import { ShootButtonImage } from './shoot-button.image';
import { PowerUpTypes } from './power-up.sprite';

export class SpaceshipSprite extends Phaser.Physics.Arcade.Sprite implements GameObjectLifeCycle {
    private _cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private _shootButton?: ShootButtonImage;
    private _joyStick?: VirtualJoyStick;
    private _turbineSound: Phaser.Sound.BaseSound;
    private _isPlayer = false;
    private _lastFired = 0;
    private _fireRate = 1000;
    private _isExploding = false;
    private _usernameText?: Phaser.GameObjects.Text;
    private _isProtected = false;
    private _score = 0;
    private _angularVelocity = 75;

    static preload (scene: Phaser.Scene) {
        SpaceshipBullet.preload(scene);
        ShootButtonImage.preload(scene);
        scene.load
            .image('spaceship', spaceshipImage)
            .spritesheet('spaceship-explosion', explosionSprite, { frameWidth: 64, frameHeight: 64 })
            .audio('turbine', turbineSound)
            .audio('explosion', explosionSound)
            .once(Phaser.Loader.Events.COMPLETE, () => {
                scene.anims.create({
                    key: 'spaceship-explosion',
                    frames: scene.anims.generateFrameNumbers('spaceship-explosion', { frames: Array.from({ length: 8 }, (_, i) => i) }),
                    frameRate: 16,
                });
            });
    }

    constructor (scene: Phaser.Scene, x: number, y: number, rotation: number, speedX: number, speedY: number, id: string, private username: string, isPlayer: boolean = false, private wordSize: number) {
        super(scene, x, y, 'spaceship');

        this.name = id;
        this._isPlayer = isPlayer;
        this._turbineSound = scene.sound.add('turbine', { loop: true, volume: 0.3 });

        // Add spaceship to scene
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);

        // Set player rotation and movement properties
        this.setRotation(rotation);
        this.setVelocity(speedX, speedY);

        // Set player physics properties
        this.setDamping(true);
        this.setDrag(0.99);
        this.setMaxVelocity(200);

        if (isPlayer) {
            this.scene.cameras.main.startFollow(this, true, 0.1, 0.1);

            if (scene.input.keyboard && window.innerWidth > 800) {
                this._cursors = scene.input.keyboard.createCursorKeys();
            } else {
                this._joyStick = (scene.plugins.get('rexVirtualJoystick') as VirtualJoyStickPlugin).add(scene, {
                    x: window.innerWidth - (window.innerWidth * 0.1),
                    y: window.innerHeight - (window.innerHeight * 0.01),
                    radius: 50,
                    base: scene.add.circle(0, 0, 50, 0x888888),
                    thumb: scene.add.circle(0, 0, 30, 0xcccccc),
                    dir: '8dir',
                    forceMin: 16,
                    enable: true
                });
                this._shootButton = new ShootButtonImage(scene);
            }
        } else {
            // tint with red color for enemy spaceship
            this.setTint(0xff0000);
        }

        // check if spaceship collides with other spaceship
        this.scene.physics.add.overlap(this, this.scene.children.getChildren(), (_, object) => {
            if (object instanceof SpaceshipSprite) {
                if (this.name === object.name || this.isExploding || object.isExploding) {
                    return;
                }

                if (this.isProtected) {
                    object.destroySpaceship();
                }
            }
        }, undefined, this);
    }

    public get isProtected () {
        return this._isProtected;
    }

    public get isExploding () {
        return this._isExploding;
    }

    public get spaceshipBody () {
        if (!this.body) {
            throw new Error('Player body not found');
        }

        return this.body as Phaser.Physics.Arcade.Body;
    }

    public get isShooting () {
        if (!this.active) {
            return false;
        }
        return !!(this._cursors?.space.isDown ?? this._shootButton?.isShooting);
    }

    public get isAccelerating () {
        if (!this.active) {
            return false;
        }
        return !!(this._cursors?.up.isDown ?? (this._joyStick?.force ?? 0) > 16);
    }

    public get isTurningLeft () {
        if (!this.active) {
            return false;
        }
        return !!(this._cursors?.left.isDown ?? this._joyStick?.left);
    }

    public get isTurningRight () {
        if (!this.active) {
            return false;
        }
        return !!(this._cursors?.right.isDown ?? this._joyStick?.right);
    }

    public get isPlayer () {
        return this._isPlayer;
    }

    public runUpdates (gameRoom?: Colyseus.Room<GameState>) {
        if (this._isPlayer && gameRoom) {
            const stateToUpdate: Partial<ISpaceship> = {
                username: this.username,
                isShooting: this.isShooting,
                isTurningLeft: this.isTurningLeft,
                isTurningRight: this.isTurningRight,
                isAccelerating: this.isAccelerating,
                x: this.x,
                y: this.y,
                speedY: this.spaceshipBody.velocity.y,
                speedX: this.spaceshipBody.velocity.x,
                rotation: this.rotation,
                isExploding: this._isExploding,
                isDestroyed: !this.active,
                score: this._score
            };

            gameRoom.send('state-update', stateToUpdate);
        }

        if (this._isExploding) {
            return;
        }

        if (this._isPlayer) {
            // Rotate the player left or right
            if (this.isTurningLeft) {
                this.turnLeft();
            } else if (this.isTurningRight) {
                this.turnRight();
            } else {
                this.stopTurning();
            }
        
            // Move the player forward
            if (this.isAccelerating) {
                this.accelerate();
            } else {
                this.decelerate();
            }

            // Fire bullets
            if (this.isShooting) {
                this.fireBullet();
            }
        }

        this._shootButton?.runUpdates();

        // print username in the top of the spaceship
        if (!this._usernameText) {
            this._usernameText = this.scene.add.text(0, -40, this.username, {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: {
                    x: 5,
                    y: 5
                }
            });
            this._usernameText.setOrigin(0.5, 0.5);
        } else {
            this._usernameText.setPosition(this.x, this.y - 40);
        }
    }

    public updateState (spaceship: ISpaceship) {
        if (spaceship.isExploding) {
            this.destroySpaceship();
            return;
        }
        if (spaceship.isShooting) {
            this.fireBullet();
        }
        this.setPosition(spaceship.x, spaceship.y);
        this.setRotation(spaceship.rotation);
    }

    public turnLeft () {
        this.setAngularVelocity(this._angularVelocity * -1);
    }

    public turnRight () {
        this.setAngularVelocity(this._angularVelocity);
    }

    public stopTurning () {
        this.setAngularVelocity(0);
    }

    public accelerate () {
        this.scene.physics.velocityFromRotation(this.rotation, 200, this.spaceshipBody.acceleration);
        if (!this._turbineSound.isPlaying && this._isPlayer) {
            this._turbineSound.play();
        }
    }

    public decelerate () {
        this.setAcceleration(0);
        this.setVelocity(this.spaceshipBody.velocity.x * 0.99, this.spaceshipBody.velocity.y * 0.99);
        if (this._turbineSound.isPlaying) {
            this._turbineSound.stop();
        }
    }

    public fireBullet () {
        if (this.scene.time.now < this._lastFired || this._isExploding) {
            return;
        }
        new SpaceshipBullet(this.scene, this.x, this.y, this.rotation, this.name);
        this._lastFired = this.scene.time.now + this._fireRate;
    }

    public revive (x: number, y: number) {
        if (!this._isPlayer) {
            this.setTint(0xff0000);
        }
        this.setPosition(x, y);
        this.setAcceleration(0);
        this.setVelocity(0);
        this.setAngularVelocity(0);
        this.setTexture('spaceship');
        this.setCollideWorldBounds(true);
        this.setActive(true);
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);
    }

    public consumePowerUp (type: PowerUpTypes) {
        switch (type) {
            case PowerUpTypes.Shield:
                this._isProtected = true;
                // tint blue
                this.setTint(0x0000ff);
                break;
            case PowerUpTypes.Fire:
                this._fireRate = 250;
                // tint orange
                this.setTint(0xffa500);
                break;
            case PowerUpTypes.Speed:
                this?.setMaxVelocity(400);
                this._angularVelocity = 150;
                // tint light green
                this.setTint(0x90ee90);
                break;
        }

        // clear tint after 15 seconds
        this.scene.time.delayedCall(15000, () => {
            if (this.isPlayer) {
                this.clearTint();
            } else {
                this.setTint(0xff0000);
            }
            this._isProtected = false;
            this._fireRate = 1000;
            this.setMaxVelocity(200);
            this._angularVelocity = 75;
        });
    }

    public addScore () {
        this._score++;
    }

    public destroySpaceship (definitive = false) {
        if (this._isExploding) {
            return;
        }

        this._score--;
        this._isExploding = true;
        this._turbineSound.stop(); 

        this.clearTint();
        this.anims.play('spaceship-explosion', true);

        this.scene.time.delayedCall(1000, () => {
            this._usernameText?.destroy();
            this._usernameText = undefined;
            this.anims.stop();
            this.setCollideWorldBounds(false);
            this._isExploding = false;
            if (definitive) {
                this.destroy();
            } else {
                this.setActive(false);
            }
        });
    }
}