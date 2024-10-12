import { MapSchema } from '@colyseus/schema';
import Phaser from 'phaser';
import { StartGameOptions } from 'server/rooms/game/game.room';
import { Spaceship } from 'server/rooms/game/schemas/spaceship.schema';
import { v4 as uuidV4 } from 'uuid';

import { Background } from 'client/spacegame-scene/background.tilesprite';
import { PowerUpSprite } from 'client/spacegame-scene/power-up.sprite';
import { SpaceshipSprite } from 'client/spacegame-scene/spaceship/spaceship.sprite';
import logoImage from 'client/assets/images/logo.png';

import configs from 'shared-configs';
import { GameRoom } from 'client/colyseus/game-room';
import { RankingItem, useHeaderStore } from 'client/spacegame-scene/header-ui/use-header-store';

export class SpaceGameScene extends Phaser.Scene {
    private _objects: Map<string, GameObjectLifeCycle> = new Map();
    private _isMobile = window.innerWidth < 800;
    private _zoom = this._isMobile ? 0.75 : 1;
    private _logo?: Phaser.GameObjects.Image;
    private _startGameText?: Phaser.GameObjects.Text;
    private _particleEmmiter?: Phaser.GameObjects.Particles.ParticleEmitter;

    preload() {
        this.load.image('logo', logoImage);
        Background.preload(this);
        SpaceshipSprite.preload(this);
        PowerUpSprite.preload(this);
    }

    constructor() {
        super({ key: 'MainScene' });
    }

    get spaceships() {
        return Array.from(this._objects.values()).filter(
            object => object instanceof SpaceshipSprite,
        ) as SpaceshipSprite[];
    }

    async create() {
        this.lights.enable();
        this.lights.setAmbientColor(0xa0a0a0);
        // Set the world bounds (larger than the game canvas)
        this.physics.world.setBounds(0, 0, configs.global.mapSize, configs.global.mapSize);
        // Set up scene objects
        this._objects.set('background', new Background(this));
        this.cameras.main.setZoom(this._zoom, this._zoom);
        // move camera to the center of the map
        // this.cameras.main.setScroll(configs.global.mapSize / 2, configs.global.mapSize / 2);

        useHeaderStore().render();
        const options = this.getGameRoomOptions();
        await this.startListenServerMessages(options);

        // check if player spaceship exists
        const playerSpaceship = this._objects.get(options.userId) as SpaceshipSprite;
        if (!playerSpaceship) {
            this.renderMenu(options);
        }
    }

    update() {
        // Run updates on all objects
        this._objects.forEach(object => object.runUpdates());
        if (this._logo) {
            this.children.bringToTop(this._logo);
        }
    }

    private async startListenServerMessages(options: StartGameOptions) {
        let resolved = false;
        await GameRoom.join(options);

        useHeaderStore().setOptions(options);

        return new Promise(resolve => {
            GameRoom.listenStateUpdate(state => {
                this.processSpaceshipStateUpdate(state.spaceships);

                this.renderRank(state.spaceships, GameRoom.latency);

                if (resolved) {
                    return;
                }

                resolved = true;
                resolve(resolved);
            });

            GameRoom.listenAddSpaceship((spaceship, userId) => {
                const isPlayer = userId === options.userId;
                const newSpaceship = new SpaceshipSprite(
                    this,
                    spaceship.x ?? Math.random() * configs.global.mapSize,
                    spaceship.y ?? Math.random() * configs.global.mapSize,
                    spaceship.rotation ?? Math.random() * Math.PI * 2,
                    spaceship.speedX ?? 0,
                    spaceship.speedY ?? 0,
                    userId,
                    spaceship.username,
                    isPlayer,
                );
                newSpaceship.updateState(spaceship);
                this._objects.set(userId, newSpaceship);
            });

            GameRoom.listenRemoveSpaceship((_, userId) => {
                const spaceship = this._objects.get(userId) as SpaceshipSprite;
                if (spaceship) {
                    spaceship.destroySpaceship(true);
                    this._objects.delete(userId);
                }
            });

            GameRoom.listenPowerUpAdd((powerUp, key) => {
                const newPowerUp = new PowerUpSprite(this, key, powerUp.type, powerUp.x, powerUp.y);
                this._objects.set(key, newPowerUp);
            });

            GameRoom.listenPowerUpRemove((_, key) => {
                const powerUp = this._objects.get(key) as PowerUpSprite;
                if (powerUp) {
                    powerUp.destroy();
                    this._objects.delete(key);
                }
            });

            GameRoom.listenSpaceshipLaserAdd((laser, key) => {
                const spaceship = this._objects.get(laser.spaceshipName) as SpaceshipSprite;
                if (spaceship) {
                    spaceship.fireLaser(key, laser.x, laser.y, laser.rotation);
                }
            });

            GameRoom.listenSpaceshipLaserRemove((laser, key) => {
                const spaceship = this._objects.get(laser.spaceshipName) as SpaceshipSprite;
                if (spaceship) {
                    spaceship.removeLaser(key);
                }
            });
        });
    }

    private getGameRoomOptions(): StartGameOptions {
        let userId = sessionStorage.getItem('userId');

        if (!userId) {
            userId = uuidV4();
            sessionStorage.setItem('userId', userId);
        }

        let username =
            new URLSearchParams(location.search).get('username') ||
            sessionStorage.getItem(`username-${userId}`) ||
            '';

        while (!username || username.length < 3 || username.length > 15) {
            username = prompt('Enter your username') ?? '';

            if (!username || username.length < 3 || username.length > 15) {
                alert('Username must be between 3 and 15 characters');
            }
        }

        sessionStorage.setItem(`username-${userId}`, username);

        return { userId, username };
    }

    private processSpaceshipStateUpdate(spaceships: MapSchema<Spaceship, string>) {
        spaceships.forEach((spaceship, _userId) => {
            const storedSpaceship = this._objects.get(_userId) as SpaceshipSprite;
            if (storedSpaceship) {
                storedSpaceship.updateState(spaceship);
            }
        });
    }

    private renderRank(spaceships: MapSchema<Spaceship, string>, latency: number) {
        const ranking: RankingItem[] = Array.from(spaceships.entries())
            .map(([userId, { username, score }]) => ({ username, score, userId }))
            .sort((a, b) => b.score - a.score);

        useHeaderStore().updateRanking(ranking);
        useHeaderStore().updateLatency(latency);
    }

    private renderMenu(options: StartGameOptions) {
        this._logo = this.add
            .image(this.cameras.main.centerX, this.cameras.main.centerY, 'logo')
            .setInteractive()
            .on('pointerdown', () => {
                GameRoom.sendStartGame(options);
                this._logo?.destroy();
                this._logo = undefined;
                this._startGameText?.destroy();
                this._startGameText = undefined;
                this._particleEmmiter?.stop();
                this._particleEmmiter?.destroy();
                this._particleEmmiter = undefined;
            });
        // add start game text below the logo
        this._startGameText = this.add
            .text(this.cameras.main.centerX, this.cameras.main.centerY + 200, 'START GAME', {
                fontSize: '32px',
                color: '#fff',
                fontFamily: '"Orbitron", sans-serif',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        // animated the logo
        this.tweens.add({
            targets: [this._logo, this._startGameText],
            scale: 1.1,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                const color = Phaser.Display.Color.GetColor(
                    255,
                    Math.floor(Math.random() * 255),
                    Math.floor(Math.random() * 255),
                );
                this._logo?.setTint(color);
                this._startGameText?.setTint(color);
            },
        });

        // ADD SOME COOL PARTICLES AROUND THE LOGO
        this._particleEmmiter = this.add.particles(this._logo.x, this._logo.y, 'flares-particles', {
            frame: ['red', 'yellow', 'white'],
            speed: 500,
            lifespan: 2000,
            blendMode: 'ADD',
            quantity: 10,
            scale: { start: 0.2, end: 0 },
        });
    }
}

export interface GameObjectLifeCycle {
    runUpdates(): void;
}
