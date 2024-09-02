import { MapSchema } from '@colyseus/schema';
import Phaser from 'phaser';
import { GameRoomOptions } from 'server/rooms/game/game.room';
import { Spaceship } from 'server/rooms/game/schemas/spaceship.schema';
import { v4 as uuidV4 } from 'uuid';

import { GameRoom } from 'client/services/colyseus/game-room';
import { Background } from 'client/spacegame-scene/background.tilesprite';
import { PowerUpSprite } from 'client/spacegame-scene/power-up.sprite';
import { RankingDomElement } from 'client/spacegame-scene/ranking.dom';
import { SpaceshipSprite } from 'client/spacegame-scene/spaceship/spaceship.sprite';

import configs from 'shared-configs';

export class SpaceGameScene extends Phaser.Scene {
    private _objects: Map<string, GameObjectLifeCycle> = new Map();
    private _ranking?: RankingDomElement;
    private _isMobile = window.innerWidth < 800;
    private _zoom = this._isMobile ? 0.75 : 1;
    private _serverTime = 0;

    preload() {
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

    get serverTime() {
        return this._serverTime;
    }

    async create() {
        this.lights.enable();
        this.lights.setAmbientColor(0xa0a0a0);
        // Set the world bounds (larger than the game canvas)
        this.physics.world.setBounds(0, 0, configs.global.mapSize, configs.global.mapSize);
        // Set up scene objects
        this._objects.set('background', new Background(this));
        this.cameras.main.setZoom(this._zoom, this._zoom);
        this._ranking = new RankingDomElement(this);
        this.startGameRoom();
    }

    update() {
        // Run updates on all objects
        this._objects.forEach(object => object.runUpdates());
    }

    private async startGameRoom() {
        const options = this.getGameRoomOptions();

        await GameRoom.join(options);

        GameRoom.listenStateUpdate(state => {
            this._serverTime = state.serverTimestamp;
            this.processSpaceshipStateUpdate(state.spaceships, options.userId);
            this.renderRank(state.spaceships, Date.now() - state.serverTimestamp);
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
    }

    private getGameRoomOptions(): GameRoomOptions {
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

    private processSpaceshipStateUpdate(spaceships: MapSchema<Spaceship, string>, userId: string) {
        spaceships.forEach((spaceship, _userId) => {
            const storedSpaceship = this._objects.get(_userId) as SpaceshipSprite;
            if (storedSpaceship) {
                storedSpaceship.updateState(spaceship);
            }
        });
    }

    private renderRank(spaceships: MapSchema<Spaceship, string>, latency: number) {
        if (!this._ranking) {
            throw new Error('Ranking DOM element not found');
        }

        const ranking = Array.from(spaceships.values())
            .map(({ username, score }) => ({ username, score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        this._ranking.updateRanking(ranking, latency);
    }
}

export interface GameObjectLifeCycle {
    runUpdates(): void;
}
