import { NNAction, BotNeuralNetwork, NNState } from "../bot.neural-network";
import { GameObjectLifeCycle } from "./main.scene";
import { SpaceshipSprite } from "./spaceship.sprite";

export class BotPlayer implements GameObjectLifeCycle {
    private _nn: BotNeuralNetwork;
    private _lastPrediction: boolean[] = [false, false, false, false];

    constructor (
        private spaceship: SpaceshipSprite,
        private readonly playerSpaceship: SpaceshipSprite
    ) {
        this._nn = new BotNeuralNetwork();
    }

    runUpdates(): void {
        if (!this.spaceship.active) {
            // if (!this._nn.isTraining) {
            //     this._nn.trainModel().then(() => {
            //         this.spaceship.restart();
            //     });
            // }
            return;
        }

        const state = this.getState();
        // const predict = this._nn.predict(state);

        this.processPrediction(
            this.getActions(state)
        );

        // if (this.spaceship.isExploding || this.playerSpaceship.isExploding || !this.playerSpaceship.active) {
        //     return;
        // }

        // this._nn.collectTrainingData(
        //     state,
        //     this.getActions(state)
        // );
    }
    
    private processPrediction ([ shoot, turnLeft, move, turnRight ]: number[]) {
        const prediction = [
            shoot >= 0.5,
            turnLeft >= 0.5,
            move >= 0.5,
            turnRight >= 0.5
        ];

        this.logPrediction(prediction);

        if (prediction[0]) {
            this.spaceship.fireBullet();
        }

        if (prediction[1]) {
            this.spaceship.turnLeft();
        }

        if (prediction[2]) {
            this.spaceship.accelerate();
        } else {
            this.spaceship.decelerate();
        }

        if (prediction[3]) {
            this.spaceship.turnRight();
        }
    }

    private logPrediction (prediction: boolean[]) {
        // check if prediction is same as last prediction
        if (prediction.every((value, index) => value === this._lastPrediction[index])) {
            return;
        }
        console.log(
            `Shoot: ${prediction[0]}, TurnLeft: ${prediction[1]}, Move: ${prediction[2]}, TurnRight: ${prediction[3]}`
        );
        this._lastPrediction = prediction;
    }

    private getState (): NNState {
        const playerX = this.playerSpaceship.x;
        const playerY = this.playerSpaceship.y;
        const spaceshipX = this.spaceship.x;
        const spaceshipY = this.spaceship.y;

        // Angle between spaceship and player
        const angleToPlayer = Math.atan2(playerY - spaceshipY, playerX - spaceshipX);
        const angleDifference = angleToPlayer - this.spaceship.rotation;

        // Angle between player and spaceship
        const playerAngle = Math.atan2(this.playerSpaceship.y - this.spaceship.y, this.playerSpaceship.x - this.spaceship.x);
        const angleDifferenceToPlayer = Math.abs(playerAngle - this.spaceship.rotation);

        // Distance between player and spaceship
        const distance = Phaser.Math.Distance.Between(spaceshipX, spaceshipY, playerX, playerY);

        return [distance, angleDifferenceToPlayer, angleDifference];
    }

    private getActions (state: NNState) {
        const actions: NNAction = [0, 0, 0, 0];
        

        if (state[2] > 0.1) {
            actions[3] = 1;  // Turn right
        } else if (state[2] < -0.1) {
            actions[1] = 1;  // Turn left
        }

        
        if (state[1] < 0.1) {
            actions[0] = 1;  // Shoot
        }

        
        if (state[0] > 100) {
            actions[2] = 1;  // Move
        }

        return actions;
    }
}
