import { BroadcastEvent } from './../../../src/rooms/Game';
import * as Colyseus from "colyseus.js";
import { GameState } from './../../../src/rooms/schema/GameState';
import Phaser from 'phaser';
import { SpaceshipSprite } from './spaceship.sprite';
import { Background } from './background.tilesprite';
import { PowerUpSprite, PowerUpTypes } from "./power-up.sprite";

export class MainScene extends Phaser.Scene {
  private _gameRoom?: Colyseus.Room<GameState>;
  private _isConnecting = false;
  private _objects: Map<string, GameObjectLifeCycle> = new Map();
  private _mapSize = 2000;
  private _isMobile = window.innerWidth < 800;
  private _zoom = this._isMobile ? 0.75 : 1;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    Background.preload(this);
    SpaceshipSprite.preload(this);
    PowerUpSprite.preload(this);
  }

  async create() {
    // Set the world bounds (larger than the game canvas)
    this.physics.world.setBounds(0, 0, this._mapSize, this._mapSize);

    // Set up scene objects
    this._objects.set('background', new Background(this, this._mapSize));

    this.cameras.main.setZoom(this._zoom, this._zoom);
  }

  update() {
    // const objects = this.children.getChildren();
    // console.log('scene objects', objects.length);
    if (!this._isConnecting && !this._gameRoom) {
      const userId = sessionStorage.getItem('userId');
      let username = location.search.replace('?username=', '') || sessionStorage.getItem(`username-${userId}`);

      if (!username) {
        username = prompt('Enter your username') ?? '';
      }

      // Username must be between 3 and 15 characters
      if (!username || username.length < 3 || username.length > 15) {
        alert('Username must be between 3 and 15 characters');
        return;
      }

      sessionStorage.setItem(`username-${userId}`, username);

      console.log('connecting to server');
      
      this._isConnecting = true;
      const client = new Colyseus.Client(process.env.WEBSOCKET_SERVER_URL);

      console.log('Connected to server');

      client.joinOrCreate<GameState>('game', { username, userId }).then(room => {
        this._gameRoom = room;
        room.onStateChange((state) => {
          state.spaceships.forEach((spaceship, _userId) => {
            const isPlayer = _userId === userId;
            const storedSpaceship = this._objects.get(_userId) as SpaceshipSprite;
            if (storedSpaceship) {
              if (!isPlayer) {
                storedSpaceship.updateState(spaceship);
              }
            } else {
              const x = spaceship.x ?? Math.random() * this._mapSize;
              const y = spaceship.y ?? Math.random() * this._mapSize;
              const rotation = spaceship.rotation ?? spaceship.rotation ?? Math.random() * Math.PI * 2;
              const speedX = spaceship.speedX ?? 0;
              const speedY = spaceship.speedY ?? 0;
              const newSpaceship = new SpaceshipSprite(this, x, y, rotation, speedX, speedY, _userId, spaceship.username, isPlayer, this._mapSize);
              if (!isPlayer) {
                newSpaceship.updateState(spaceship);
              }
              this._objects.set(_userId, newSpaceship);
            }
          });
          state.powerUps.forEach((powerUp, key) => {
            const storedPowerUp = this._objects.get(key) as PowerUpSprite;
            if (!storedPowerUp) {
              const newPowerUp = new PowerUpSprite(this, powerUp.type as PowerUpTypes, powerUp.x, powerUp.y);
              this._objects.set(key, newPowerUp);
            }
          });
          const ranking = Array.from(state.spaceships.values()).sort((a, b) => b.score - a.score).slice(0, 3);
          window.rankingList = ranking.map(s => ({ username: s.username, score: s.score }));
        });

        room.onMessage("*", (...args) => {
          const [type, data] = args as BroadcastEvent;
          if (type === 'power-up-destroyed') {
            const powerUp = this._objects.get(data) as PowerUpSprite;
            if (powerUp) {
              powerUp.destroy();
              this._objects.delete(data);
            }
          } else if (type === 'spaceship-destroyed') {
            const spaceship = this._objects.get(data) as SpaceshipSprite;
            if (spaceship) {
              spaceship.destroySpaceship(true);
              this._objects.delete(data);
            }
          } else if (type === 'spaceship-respawn') {
            const spaceship = this._objects.get(data.userId) as SpaceshipSprite;
            if (spaceship) {
              spaceship.revive(data.x, data.y);
            }
          }
        });

        room.onLeave((code) => {
          console.log("left");
        });

        window.addEventListener('beforeunload', () => {
          room.leave(false);

          return true;
        });
      });
    }
    // Run updates on all objects
    this._objects.forEach(object => object.runUpdates(this._gameRoom));
  }

  // private createPlayerAndBot () {
  //   const player = new SpaceshipSprite(this, this._mapSize / 2, this._mapSize / 2, 'player', true, this._mapSize);
  //   const randomX = Math.random() * this._mapSize;
  //   const randomY = Math.random() * this._mapSize;
  //   const enemySpaceship = new SpaceshipSprite(this.scene.scene, randomX, randomY, 'bot', false, this._mapSize);
  //   const bot = new BotPlayer(enemySpaceship, player);

  //   return [
  //     player,
  //     enemySpaceship,
  //     bot
  //   ]
  // }
}

export interface GameObjectLifeCycle {
  runUpdates(gameRoom?: Colyseus.Room<GameState>): void;
}