import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import express from "express";
import basicAuth from "express-basic-auth";

/**
 * Import your Room files
 */
import { Game } from "./rooms/Game";
import path from "path";

const distPath = path.join(__dirname, "./../client/dist");

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('game', Game);
    },

    initializeExpress: (app) => {
        // add static files
        app.use("/", express.static(distPath));

        const basicAuthMiddleware = basicAuth({
            // list of users and passwords
            users: {
                "admin": "admin",
            },
            // sends WWW-Authenticate header, which will prompt the user to fill
            // credentials in
            challenge: true
        });
        app.use("/colyseus", basicAuthMiddleware, monitor());

        // redirect every other route to index.html
        app.get("*", (req, res) => {
            res.sendFile(path.resolve(distPath, "index.html"));
        });
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
