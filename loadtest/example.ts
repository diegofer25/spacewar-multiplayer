import { cli, Options } from '@colyseus/loadtest';
import { Client } from 'colyseus.js';

import { GameState } from '../src/rooms/game/schemas/game-state.schema';

import { SpaceshipStateToUpdate } from './../types/index';

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
        userId,
    });

    function eventLoop() {
        room.send('spaceship-state-update', {
            isShooting: Math.random() > 0.5,
            isTurningLeft: Math.random() > 0.5,
            isTurningRight: Math.random() > 0.5,
            isAccelerating: Math.random() > 0.5,
            userId: userId,
            isBot: false,
            rotation: Math.random() * Math.PI * 2,
            speedX: Math.random() * 10 - 5,
            speedY: Math.random() * 10 - 5,
            x: Math.random() * 800,
            y: Math.random() * 600,
        } as SpaceshipStateToUpdate);

        requestAnimationFrame(eventLoop);
    }

    room.onLeave(code => {
        console.log('left', code);
    });

    eventLoop();
}

cli(main);
