<p align="center">
  <a href="https://lively-pond-07951410f.5.azurestaticapps.net" target="blank"><img src="https://github.com/diegofer25/spacewar-multiplayer/blob/main/client/src/assets/images/logo.png?raw=true" width="300" alt="Spacewar JS Logo" /></a>
</p>
<p align="center">A multiplayer space war game built using PhaserJS and ColyseusJS. This game allows multiple players to join a space battle, maneuver their ships, and shoot down opponents in real-time.</p>

## Features

-   Real-time multiplayer battles
-   Player-controlled spaceships with movement and shooting mechanics
-   Server-side game logic using Colyseus
-   Client-side rendering with PhaserJS

## Getting Started

### Prerequisites

-   Node.js (v20.x or higher)
-   npm or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/diegofer25/spacewar-multiplayer.git
    cd spacewar-multiplayer
    ```

2. Install dependencies for both the server and client:

    ```bash
    npm install
    ```

3. Start the server:

    ```bash
    npm run dev
    ```

4. Start the client:

    ```bash
    npm run dev
    ```

### Usage

-   Open your browser and go to `http://localhost:2567` to play the game.

## Development

### Server

The server is built with Node.js and Colyseus. It handles real-time communication between players and manages game state.

-   Entry point: `src/index.ts`
-   Room handlers: `src/rooms/`

### Client

The client is built with PhaserJS, rendering the game on the browser and handling user inputs.

-   Entry point: `client/src/main.ts`
-   Game scenes: `client/src/main-scene/main.scene.ts`

### Contributing

Feel free to submit issues, fork the repository, and create pull requests. We appreciate all contributions to improve the project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

-   [PhaserJS](https://phaser.io/)
-   [ColyseusJS](https://colyseus.io/)
