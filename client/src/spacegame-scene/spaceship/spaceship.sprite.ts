import explosionSound from 'client/assets/audios/explosion.mp3';
import turbineSound from 'client/assets/audios/turbine.wav';
import flaresParticlesImage from 'client/assets/images/flares-particles.png';
import spaceshipImage from 'client/assets/images/spaceship.png';
import flaredParticlesJson from 'client/assets/json/flares-particles.json';
import Phaser from 'phaser';

import { GameObjectLifeCycle, SpaceGameScene } from 'client/spacegame-scene/spacegame.scene';
import { SpaceshipControls } from 'client/spacegame-scene/spaceship/spaceship-controls';
import { SpaceshipLaserGun } from 'client/spacegame-scene/spaceship/spaceship-gun';
import { SpaceshipLaser } from 'client/spacegame-scene/spaceship/spaceship-laser.sprite';
import { SpaceshipParticles } from 'client/spacegame-scene/spaceship/spaceship-particles';
import configs from 'shared-configs';
import { GameRoom } from 'client/colyseus/game-room';
import { useHeaderStore } from 'client/spacegame-scene/header-ui/use-header-store';
import { ISpaceship, SpaceshipStateToUpdate } from 'sharedTypes';

export class SpaceshipSprite extends Phaser.Physics.Arcade.Sprite implements GameObjectLifeCycle {
    private _spaceshipControls?: SpaceshipControls;
    private _spaceshipParticles: SpaceshipParticles;
    private _laserGun: SpaceshipLaserGun;
    private _turbineSound: Phaser.Sound.BaseSound;
    private _isPlayer = false;
    private _isExploding = false;
    private _usernameText?: Phaser.GameObjects.Text;
    private _score = 0;
    private _maxVelocity = 200;
    private _angularVelocity = 75;
    private _currentPowerUp = -1;
    private _isBot = false;

    static preload(scene: Phaser.Scene) {
        SpaceshipControls.preload(scene);
        SpaceshipLaser.preload(scene);
        scene.load
            .image('spaceship', spaceshipImage)
            .atlas('flares-particles', flaresParticlesImage, flaredParticlesJson)
            .audio('turbine', turbineSound)
            .audio('explosion', explosionSound);
    }

    constructor(
        private _scene: SpaceGameScene,
        x: number,
        y: number,
        rotation: number,
        speedX: number,
        speedY: number,
        id: string,
        private username: string,
        isPlayer: boolean = false,
        isBot: boolean = false,
    ) {
        super(_scene, x, y, 'spaceship');

        this.name = id;
        this._isPlayer = isPlayer;
        this._isBot = isBot;
        this._turbineSound = _scene.sound.add('turbine', { loop: true, volume: 0.05 });

        // Add spaceship to scene
        _scene.physics.world.enable(this);
        _scene.add.existing(this);
        this.setCollideWorldBounds(true);

        // Set player rotation and movement properties
        this.setRotation(rotation);
        this.setVelocity(speedX, speedY);

        // Set player physics properties
        this.setDamping(true);
        this.setDrag(0.99);
        this.setMaxVelocity(this._maxVelocity, this._maxVelocity);
        this.setScale(configs.spaceship.scale);

        if (isPlayer) {
            _scene.cameras.main.startFollow(this, true, 0.025, 0.025);
            this._spaceshipControls = new SpaceshipControls(_scene, this);
        } else {
            // tint with red color for enemy spaceship
            this.setTint(0xff0000);
        }

        this._spaceshipParticles = new SpaceshipParticles(_scene, this);
        this._laserGun = new SpaceshipLaserGun(_scene, this);
    }

    public get isProtected() {
        return this._currentPowerUp === configs.powerUp.types.shield;
    }

    public get isExploding() {
        return this._isExploding;
    }

    public get spaceshipBody() {
        if (!this.body) {
            throw new Error('Player body not found');
        }

        return this.body as Phaser.Physics.Arcade.Body;
    }

    public get isPlayer() {
        return this._isPlayer;
    }

    public get currentPowerUp() {
        return this._currentPowerUp;
    }

    public runUpdates() {
        if (this._isExploding) {
            return;
        }

        if (this._isPlayer) {
            this.processPlayerUpdate();
        } else if (this._isBot) {
            const playerId = this.name.replace('Bot-', '');
            const player = this._scene.getSpaceshipById(playerId);

            if (player && player.isPlayer) {
                this.processBotUpdate();
            }
        }

        // print username in the top of the spaceship
        if (!this._usernameText) {
            this._usernameText = this.scene.add.text(0, -40, this.username, {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: {
                    x: 5,
                    y: 5,
                },
                fontFamily: '"Orbitron", sans-serif',
            });
            this._usernameText.setOrigin(0.5, 0.5);
        } else {
            this._usernameText.setPosition(this.x, this.y - 40);
        }
    }

    public updateState(spaceship: ISpaceship) {
        if (spaceship.isExploding) {
            this.destroySpaceship();
            // this.setPosition(spaceship.x, spaceship.y);
            // this.setRotation(spaceship.rotation);
            // this.setAcceleration(0);
            return;
        } else if (this._isExploding && !spaceship.isExploding) {
            this.revive(spaceship.x, spaceship.y);
        }
        if (spaceship.isTurningLeft) {
            this.turnLeft();
        } else if (spaceship.isTurningRight) {
            this.turnRight();
        } else {
            this.stopTurning();
        }
        if (spaceship.isAccelerating) {
            this.accelerate();
        } else {
            this.decelerate();
        }
        if (spaceship.maxVelocity !== this._maxVelocity) {
            this._maxVelocity = spaceship.maxVelocity;
            this.setMaxVelocity(spaceship.maxVelocity, spaceship.maxVelocity);
        }
        if (spaceship.angularVelocity !== this._angularVelocity) {
            this._angularVelocity = spaceship.angularVelocity;
        }
        if (spaceship.powerUp !== this._currentPowerUp) {
            this._currentPowerUp = spaceship.powerUp;
            if (this._currentPowerUp >= 0) {
                this.consumePowerUp(spaceship.powerUp);
            } else {
                this.removePowerUpEffect();
            }
        }
        if (
            Math.abs(this.x - spaceship.x) > configs.spaceship.frameWidth / 2 ||
            Math.abs(this.y - spaceship.y) > configs.spaceship.frameHeight / 2
        ) {
            this.setPosition(spaceship.x, spaceship.y);
            // this.setVelocity(spaceship.speedX, spaceship.speedY);
        }
        if (Math.abs(this.rotation - spaceship.rotation) > Math.PI / 1.5) {
            this.setRotation(spaceship.rotation);
        }
    }

    public turnLeft() {
        this.setAngularVelocity(this._angularVelocity * -1);
    }

    public turnRight() {
        this.setAngularVelocity(this._angularVelocity);
    }

    public stopTurning() {
        this.setAngularVelocity(0);
    }

    public accelerate() {
        this.scene.physics.velocityFromRotation(
            this.rotation,
            this._currentPowerUp === configs.powerUp.types.speed
                ? this._maxVelocity
                : this._maxVelocity,
            this.spaceshipBody.acceleration,
        );

        if (
            !this._turbineSound.isPlaying &&
            this._isPlayer &&
            useHeaderStore().state.value.isSoundEnabled
        ) {
            this._turbineSound.play();
        }
    }

    public decelerate() {
        this.setAcceleration(0);
        this.setVelocity(
            this.spaceshipBody.velocity.x * 0.99,
            this.spaceshipBody.velocity.y * 0.99,
        );
        if (this._turbineSound.isPlaying) {
            this._turbineSound.stop();
        }
    }

    public fireLaser(id: string, x: number, y: number, rotation: number) {
        return this._laserGun?.fire(id, x, y, rotation);
    }

    public removeLaser(id: string) {
        this._laserGun?.removeLaser(id);
    }

    public revive(x: number, y: number) {
        if (!this._isExploding) {
            return;
        }
        this._isExploding = false;
        this.setVisible(true);
        this.setPosition(x, y);
        this.setAcceleration(0);
        this.setVelocity(0);
        this.setAngularVelocity(0);
        this.setTexture('spaceship', 0);
        this._spaceshipParticles.resetAndStartTurbine();

        if (!this._isPlayer) {
            this.setTint(0xff0000);
        }
    }

    public consumePowerUp(powerUp: number) {
        this._spaceshipParticles.startPowerUpParticles(powerUp);

        if (powerUp === configs.powerUp.types.speed) {
            this.scene.cameras.main.setLerp(0.1, 0.1);
        }
    }

    public removePowerUpEffect() {
        this._spaceshipParticles.resetAndStartTurbine();
        this.scene.cameras.main.setLerp(0.025, 0.025);
    }

    public destroySpaceship(definitive = false) {
        if (this._isExploding) {
            return;
        }

        this._isExploding = true;
        this._score--;
        this._currentPowerUp = -1;
        if (this.isPlayer) {
            this.scene.cameras.main.shake(configs.spaceship.reviveSpawnTime, 0.1);
        }
        this._turbineSound.stop();
        this._spaceshipParticles.resetAndExplode();
        if (useHeaderStore().state.value.isSoundEnabled) {
            this.scene.sound.play('explosion', { volume: 0.1 });
        }
        this.setVisible(false);
        if (this.isPlayer) {
            this.scene.cameras.main.fadeOut(500, 0, 0, 0);
        }

        this.scene.time.delayedCall(configs.spaceship.reviveSpawnTime, () => {
            if (definitive) {
                this.destroy();
                this._usernameText?.destroy();
            } else {
                if (this.isPlayer) {
                    this.scene.cameras.main.fadeIn(500, 0, 0, 0);
                }
            }
        });
    }

    private processPlayerUpdate() {
        const stateToUpdate: SpaceshipStateToUpdate = {
            isShooting: !!this._spaceshipControls?.isShooting,
            isTurningLeft: !!this._spaceshipControls?.isTurningLeft,
            isTurningRight: !!this._spaceshipControls?.isTurningRight,
            isAccelerating: !!this._spaceshipControls?.isAccelerating,
            x: this.x,
            y: this.y,
            speedY: this.spaceshipBody.velocity.y,
            speedX: this.spaceshipBody.velocity.x,
            rotation: this.rotation,
            isBot: this._isBot,
            userId: this.name,
        };

        const lasersUpdate = Array.from(this._laserGun.lasers.entries()).map(([key, laser]) => ({
            key,
            x: laser.x,
            y: laser.y,
        }));

        GameRoom.sendStateUpdate({
            spaceship: stateToUpdate,
            lasers: lasersUpdate,
        });
    }

    private processBotUpdate() {
        const isTurningLeft = Math.random() > 0.5;
        const stateToUpdate: SpaceshipStateToUpdate = {
            isShooting: true,
            isTurningLeft,
            isTurningRight: !isTurningLeft,
            isAccelerating: Math.random() > 0.5,
            x: this.x,
            y: this.y,
            speedY: this.spaceshipBody.velocity.y,
            speedX: this.spaceshipBody.velocity.x,
            rotation: this.rotation,
            isBot: this._isBot,
            userId: this.name,
        };

        const lasersUpdate = Array.from(this._laserGun.lasers.entries()).map(([key, laser]) => ({
            key,
            x: laser.x,
            y: laser.y,
        }));

        GameRoom.sendBotStateUpdate({
            spaceship: stateToUpdate,
            lasers: lasersUpdate,
        });
    }
}
