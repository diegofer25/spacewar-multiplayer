import { GameState } from './../src/rooms/schema/GameState';
import { Client } from "colyseus.js";
import { cli, Options } from "@colyseus/loadtest";
import { ISpaceship } from '../src/rooms/schema/Spaceship';

function requestAnimationFrame(callback) {
    const fps = 60; // Frames per second
    const delay = 1000 / fps; // Delay between frames in milliseconds
  
    return setTimeout(() => {
      callback(Date.now());
    }, delay);
  }
  

export async function main(options: Options) {
    const client = new Client(options.endpoint);
    const userId = crypto.randomUUID();
    const room = await client.joinOrCreate<GameState>(options.roomName, {
        userId
    });
    const _state: ISpaceship = {
        isShooting: Math.random() > 0.5,
        isTurningLeft: Math.random() > 0.5,
        isTurningRight: Math.random() > 0.5,
        isAccelerating: Math.random() > 0.5,
        connected: true,
        sessionId: room.sessionId,
        rotation: 0,
        speedX: 0,
        speedY: 0,
        x: 0,
        y: 0,
        isExploding: false,
        isDestroyed: false,
        score: 0,
        username: ""
    }

    function eventLoop () {
        room.send("state-update", {
            isShooting: Math.random() > 0.5,
            isTurningLeft: Math.random() > 0.5,
            isTurningRight: Math.random() > 0.5,
            isAccelerating: Math.random() > 0.5,
            isExploding: _state.isExploding,
            isDestroyed: _state.isDestroyed,
            score: _state.score,
            connected: _state.connected,
            rotation: _state.rotation,
            sessionId: _state.sessionId,
            speedX: _state.speedX,
            speedY: _state.speedY,
            username: _state.username,
            x: _state.x,
            y: _state.y
        } as ISpaceship);

        requestAnimationFrame(eventLoop);
    }

    console.log("joined successfully!");

    room.onStateChange((state) => {
        const myState = state.spaceships.get(userId);
        if (myState) {
            _state.isAccelerating = myState.isAccelerating;
            _state.isExploding = myState.isExploding;
            _state.isDestroyed = myState.isDestroyed;
            _state.isShooting = myState.isShooting;
            _state.isTurningLeft = myState.isTurningLeft;
            _state.isTurningRight = myState.isTurningRight;
            _state.score = myState.score;
            _state.speedX = myState.speedX;
            _state.speedY = myState.speedY;
            _state.rotation = myState.rotation;
            _state.x = myState.x;
            _state.y = myState.y;
            _state.username = myState.username;
        }
    });

    room.onLeave((code) => {
        console.log("left");
    });

    eventLoop();
}

cli(main);
