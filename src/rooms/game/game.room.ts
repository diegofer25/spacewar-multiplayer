import { Room, Client } from '@colyseus/core';
import { v4 as uuidV4 } from 'uuid';

import configs from '../../../shared-configs.json';

import { GameState } from './schemas/game-state.schema';
import { PowerUp } from './schemas/power-up.schema';
import { SpaceshipLaser } from './schemas/spaceship-laser';
import { ISpaceship, Spaceship } from './schemas/spaceship.schema';

export class Game extends Room<GameState> {
    maxClients = 100;
    private _powerUpCreationDelay = 0;

    onCreate() {
        this.setState(new GameState());

        this.onMessage('ping', (client: Client) => {
            const timeToWaitUntilNextPing = Math.min(this.clients.length * 100, 1000);
            client.send('pong', timeToWaitUntilNextPing);
        });

        this.onMessage('state-update', (client: Client, data: StateUpdateEvent) => {
            this.onSpaceshipStateUpdate(client, data.spaceship);
            this.onLaserStateUpdate(client, data.lasers);
        });

        this.onMessage('start-game', (client: Client, options: StartGameOptions) => {
            const userId = options.userId as string;
            const spaceship = this.state.spaceships.get(userId);

            if (!spaceship) {
                const username = options.username || `Guest-${client.sessionId}`;
                this.state.spaceships.set(
                    options.userId,
                    new Spaceship(client.sessionId, username),
                );
            }
        });

        this.setSimulationInterval(dt => this.runUpdates(dt));
    }

    onJoin(client: Client, options: StartGameOptions) {
        console.log(client.sessionId, 'joined!', options);

        const userId = options.userId as string;
        const spaceship = this.state.spaceships.get(userId);

        if (spaceship) {
            spaceship.sessionId = client.sessionId;
            spaceship.connected = true;
        }
    }

    async onLeave(client: Client, consented: boolean) {
        try {
            const userId = Array.from(this.state.spaceships.keys()).find(
                userId => this.state.spaceships.get(userId).sessionId === client.sessionId,
            );
            this.state.spaceships.get(userId).connected = false;

            if (consented) {
                throw new Error('consented leave');
            }

            // allow disconnected client to reconnect into this room until 20 seconds
            await this.allowReconnection(client, 20);

            // client returned! let's re-activate it.
            this.state.spaceships.get(userId).connected = true;
        } catch {
            // 20 seconds expired. let's remove the client.
            const userId = Array.from(this.state.spaceships.keys()).find(
                userId => this.state.spaceships.get(userId).sessionId === client.sessionId,
            );

            console.log(client.sessionId, 'left!');

            const hasSpaceship = this.state.spaceships.has(userId);

            if (hasSpaceship) {
                this.state.spaceships.delete(userId);
            }
        }
    }

    onDispose() {
        console.log('room', this.roomId, 'disposing...');
        this.state.spaceships.clear();
    }

    private runUpdates(_dt: number) {
        this.handlePowerUps();
        this.checkStateAndUpdate();
    }

    private onSpaceshipStateUpdate(client: Client, data: SpaceshipStateToUpdate) {
        const userId = Array.from(this.state.spaceships.keys()).find(
            userId => this.state.spaceships.get(userId).sessionId === client.sessionId,
        );

        if (!userId) {
            return;
        }

        const spaceship = this.state.spaceships.get(userId);

        spaceship.isShooting = data.isShooting;
        spaceship.isTurningLeft = data.isTurningLeft;
        spaceship.isTurningRight = data.isTurningRight;
        spaceship.isAccelerating = data.isAccelerating;
        spaceship.x = data.x;
        spaceship.y = data.y;
        spaceship.speedY = data.speedY;
        spaceship.speedX = data.speedX;
        spaceship.rotation = data.rotation;
    }

    private onLaserStateUpdate(_: Client, lasers: LaserUpdate[]) {
        lasers.forEach(laser => {
            const storedLaser = this.state.lasers.get(laser.key);

            if (!storedLaser) {
                return;
            }

            storedLaser.x = laser.x;
            storedLaser.y = laser.y;
        });
    }

    private handlePowerUps() {
        // add new power up every 30s
        if (this._powerUpCreationDelay <= Date.now()) {
            this._powerUpCreationDelay = Date.now() + configs.powerUp.creationDelay;
            const powerUp = new PowerUp();
            powerUp.x = Math.random() * configs.global.mapSize;
            powerUp.y = Math.random() * configs.global.mapSize;
            powerUp.type = Math.floor(Math.random() * 3);
            powerUp.lifeTime = Date.now() + 15000; // 15 seconds
            this.state.powerUps.set(crypto.randomUUID(), powerUp);
        }
    }

    private checkStateAndUpdate() {
        this.state.spaceships.forEach((spaceship, userId) => {
            if (spaceship.isExploding) {
                if (spaceship.reviveTimestamp && spaceship.reviveTimestamp <= Date.now()) {
                    resetSpaceship();
                } else {
                    return;
                }
            }

            const shouldRemovePowerUp =
                Date.now() > spaceship.powerUpExpiryTimestamp && spaceship.powerUp >= 0;
            if (shouldRemovePowerUp) {
                removePowerUp();
            }

            const shouldShoot = spaceship.isShooting && spaceship.nextFireTimestamp <= Date.now();
            if (shouldShoot) {
                this.state.lasers.set(uuidV4(), createLaser());
            }

            // check iterations with other spaceships
            this.state.spaceships.forEach((enemySpaceship, enemyUserId) => {
                if (enemyUserId === userId) {
                    return;
                }

                if (this.isSpaceshipsIntersecting(spaceship, enemySpaceship)) {
                    if (
                        spaceship.powerUp === configs.powerUp.types.shield &&
                        enemySpaceship.powerUp === configs.powerUp.types.shield
                    ) {
                        return;
                    }

                    if (spaceship.powerUp === configs.powerUp.types.shield) {
                        this.processDestroySpaceship(enemySpaceship, spaceship);
                    }
                }
            });

            // check iterations with power ups
            this.state.powerUps.forEach((powerUp, key) => {
                if (powerUp.lifeTime < Date.now()) {
                    this.state.powerUps.delete(key);
                } else if (
                    this.spaceshipCollectedPowerUp(spaceship, powerUp) &&
                    spaceship.powerUp < 0
                ) {
                    spaceship.powerUp = powerUp.type;
                    spaceship.powerUpExpiryTimestamp = Date.now() + 15000;
                    this.state.powerUps.delete(key);

                    if (spaceship.powerUp === configs.powerUp.types.fire) {
                        spaceship.nextFireTimestamp = Date.now();
                        spaceship.fireRate = configs.spaceship.fireRateWithPowerUp;
                    } else if (spaceship.powerUp === configs.powerUp.types.speed) {
                        spaceship.maxVelocity = configs.spaceship.maxVelocityWithPowerUp;
                        spaceship.angularVelocity = configs.spaceship.angularVelocityWithPowerUp;
                    }
                }
            });

            // check iterations with lasers
            this.state.lasers.forEach((laser, key) => {
                if (laser.lifeTime <= Date.now()) {
                    this.state.lasers.delete(key);
                    return;
                }

                if (
                    spaceship.powerUp === configs.powerUp.types.shield ||
                    userId === laser.spaceshipName ||
                    !this.spaceshipHitByLaser(spaceship, laser)
                ) {
                    return;
                }

                const enemySpaceship = this.state.spaceships.get(laser.spaceshipName);

                this.processDestroySpaceship(spaceship, enemySpaceship);
                this.state.lasers.delete(key);
            });

            function createLaser() {
                spaceship.nextFireTimestamp = Date.now() + spaceship.fireRate;
                const laser = new SpaceshipLaser(
                    spaceship.x,
                    spaceship.y,
                    spaceship.rotation,
                    userId,
                );
                laser.x = spaceship.x;
                laser.y = spaceship.y;
                laser.lifeTime = Date.now() + configs.laser.lifeTime;

                return laser;
            }

            function resetSpaceship() {
                spaceship.isExploding = false;
                spaceship.x = Math.random() * configs.global.mapSize;
                spaceship.y = Math.random() * configs.global.mapSize;
                spaceship.speedX = 0;
                spaceship.speedY = 0;
                spaceship.rotation = 0;
                spaceship.powerUp = -1;
            }

            function removePowerUp() {
                spaceship.powerUp = -1;
                spaceship.fireRate = configs.spaceship.initialFireRate;
                spaceship.maxVelocity = configs.spaceship.initialMaxVelocity;
                spaceship.angularVelocity = configs.spaceship.initialAngularVelocity;
            }
        });
    }

    private processDestroySpaceship(spaceship: ISpaceship, enemySpaceship: ISpaceship) {
        spaceship.isExploding = true;
        spaceship.reviveTimestamp = Date.now() + configs.spaceship.reviveSpawnTime;
        spaceship.score -= 1;
        spaceship.powerUp = -1;
        spaceship.fireRate = configs.spaceship.initialFireRate;
        spaceship.maxVelocity = configs.spaceship.initialMaxVelocity;
        spaceship.angularVelocity = configs.spaceship.initialAngularVelocity;
        enemySpaceship.score += 1;
    }

    private spaceshipCollectedPowerUp(spaceship: ISpaceship, powerUp: PowerUp) {
        return this.isIntersecting(
            {
                x: spaceship.x,
                y: spaceship.y,
                width: configs.spaceship.frameWidth * configs.spaceship.scale,
                height: configs.spaceship.frameHeight * configs.spaceship.scale,
            },
            {
                x: powerUp.x,
                y: powerUp.y,
                width: configs.powerUp.frameWidth,
                height: configs.powerUp.frameHeight,
            },
        );
    }

    private spaceshipHitByLaser(spaceship: ISpaceship, laser: SpaceshipLaser) {
        return this.isIntersecting(
            {
                x: spaceship.x,
                y: spaceship.y,
                width: configs.spaceship.frameWidth * configs.spaceship.scale,
                height: configs.spaceship.frameHeight * configs.spaceship.scale,
            },
            {
                x: laser.x,
                y: laser.y,
                width: configs.laser.frameWidth,
                height: configs.laser.frameHeight,
            },
        );
    }

    private isSpaceshipsIntersecting(spaceship1: ISpaceship, spaceship2: ISpaceship) {
        return this.isIntersecting(
            {
                x: spaceship1.x,
                y: spaceship1.y,
                width: configs.spaceship.frameWidth * configs.spaceship.scale,
                height: configs.spaceship.frameHeight * configs.spaceship.scale,
            },
            {
                x: spaceship2.x,
                y: spaceship2.y,
                width: configs.spaceship.frameWidth * configs.spaceship.scale,
                height: configs.spaceship.frameHeight * configs.spaceship.scale,
            },
        );
    }

    private isIntersecting(rect1: Rectangle, rect2: Rectangle) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
}

interface Vector {
    x: number;
    y: number;
}

interface Rectangle extends Vector {
    width: number;
    height: number;
}

export interface StartGameOptions {
    userId: string;
    username: string;
}

export type SpaceshipStateToUpdate = Pick<
    ISpaceship,
    | 'isShooting'
    | 'isTurningLeft'
    | 'isTurningRight'
    | 'isAccelerating'
    | 'x'
    | 'y'
    | 'speedY'
    | 'speedX'
    | 'rotation'
>;

export interface LaserUpdate {
    x: number;
    y: number;
    key: string;
}

export interface StateUpdateEvent {
    spaceship: SpaceshipStateToUpdate;
    lasers: LaserUpdate[];
}
