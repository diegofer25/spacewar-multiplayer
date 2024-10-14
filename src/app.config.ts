import { monitor } from '@colyseus/monitor';
import config from '@colyseus/tools';
import basicAuth from 'express-basic-auth';

/**
 * Import your Room files
 */
import { Game } from './rooms/game/game.room';

export default config({
    initializeGameServer: gameServer => {
        /**
         * Define your room handlers:
         */
        gameServer.define('game', Game);

        if (process.env.NODE_ENV === 'development') {
            gameServer.simulateLatency(50);
        }
    },

    initializeExpress: app => {
        app.get('/', (_req, res) => res.send('SpaceWar Game Server is running!'));

        const user = process.env.NODE_ENV === 'development' ? 'admin' : process.env.ADMIN_USER;
        const password =
            process.env.NODE_ENV === 'development' ? 'admin' : process.env.ADMIN_PASSWORD;

        const basicAuthMiddleware = basicAuth({
            // list of users and passwords
            users: {
                [user]: password,
            },
            // sends WWW-Authenticate header, which will prompt the user to fill
            // credentials in
            challenge: true,
        });
        app.use('/monitor', basicAuthMiddleware, monitor());
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    },
});
