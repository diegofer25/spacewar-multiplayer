import { Room, Client } from "@colyseus/core";
import { GameState } from "./schema/GameState";
import { ISpaceship, Spaceship } from "./schema/Spaceship";
import { PowerUp } from "./schema/PowerUp";

export class Game extends Room<GameState> {
  maxClients = 1000;
  private _powerUpCreationDelay = 60 * 30; // 30 seconds

  onCreate (options: any) {
    console.log("Game room created!", options);

    this.setState(new GameState());

    this.onMessage("state-update", (client, data: ISpaceship) => {
      const userId = Array.from(this.state.spaceships.keys()).find(userId => this.state.spaceships.get(userId).sessionId === client.sessionId);
      
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
      spaceship.isExploding = data.isExploding;
      spaceship.isDestroyed = data.isDestroyed;
      spaceship.score = data.score;
    });
    
    this.setSimulationInterval((dt) => this.update(dt));
  }

  update (time: number) {
    // add new power up every 30s
    if (this._powerUpCreationDelay <= 0) {
      const powerUp = new PowerUp();
      powerUp.x = Math.random() * this.state.mapSize;
      powerUp.y = Math.random() * this.state.mapSize;
      powerUp.type = Math.floor(Math.random() * 3);
      powerUp.lifeTime = Date.now() + 15000; // 15 seconds
      this.state.powerUps.set(crypto.randomUUID(), powerUp);
      this._powerUpCreationDelay = 60 * 30; 
    } else {
      this._powerUpCreationDelay--;
    }

    // check if power ups are still alive
    this.state.powerUps.forEach((powerUp, key) => {
      if (powerUp.lifeTime < Date.now()) {
        this.state.powerUps.delete(key);
        const event: PowerUpDestroyEvent = ["power-up-destroyed", key];
        this.broadcast(...event);
      }
    });

    // revive all spaceships
    this.state.spaceships.forEach((spaceship, userId) => {
      if (spaceship.isDestroyed) {
        spaceship.isExploding = false;
        spaceship.isDestroyed = false;
        spaceship.x = Math.random() * 2000;
        spaceship.y = Math.random() * 2000;
        spaceship.speedX = 0;
        spaceship.speedY = 0;
        spaceship.rotation = 0;

        const event: SpaceshipRespawnEvent = ["spaceship-respawn", {
          userId,
          x: spaceship.x,
          y: spaceship.y,
        }];
        this.broadcast(...event);
      }
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!", options);

    const userId = options.userId as string;
    const spaceship = this.state.spaceships.get(userId);

    if (!spaceship) {
      const username = options.username || `Guest-${client.sessionId}`;
      this.state.spaceships.set(options.userId, new Spaceship(client.sessionId, username));
    } else {
      spaceship.sessionId = client.sessionId;
      spaceship.connected = true;
    }
  }

  async onLeave (client: Client, consented: boolean) {      
      try {
        const userId = Array.from(this.state.spaceships.keys()).find(userId => this.state.spaceships.get(userId).sessionId === client.sessionId);
        this.state.spaceships.get(userId).connected = false;

        if (consented) {
            throw new Error("consented leave");
        }

        // allow disconnected client to reconnect into this room until 20 seconds
        await this.allowReconnection(client, 20);

        // client returned! let's re-activate it.
        this.state.spaceships.get(userId).connected = true;

      } catch (e) {
        // 20 seconds expired. let's remove the client.
        const userId = Array.from(this.state.spaceships.keys()).find(userId => this.state.spaceships.get(userId).sessionId === client.sessionId);
        
        console.log(client.sessionId, "left!");

        const hasSpaceship = this.state.spaceships.has(userId);

        if (hasSpaceship) {
          this.state.spaceships.delete(userId);
          const event: SpaceshipDestroyedEvent = ["spaceship-destroyed", userId];
          this.broadcast(...event);
        }
      }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.state.spaceships.clear();
  }
}

export type BroadcastEvent = SpaceshipRespawnEvent | PowerUpDestroyEvent | SpaceshipDestroyedEvent;

export type PowerUpDestroyEvent = [
  "power-up-destroyed",
  string
]

export type SpaceshipRespawnEvent = [
  "spaceship-respawn",
  {
    userId: string,
    x: number,
    y: number,
  }
]

export type SpaceshipDestroyedEvent = [
  "spaceship-destroyed",
  string
]