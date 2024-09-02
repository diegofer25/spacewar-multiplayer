import configs from 'shared-configs';
import Phaser from 'phaser';
import background from 'client/assets/images/background.png';
import { GameObjectLifeCycle } from 'client/spacegame-scene/spacegame.scene';

export class Background extends Phaser.GameObjects.TileSprite implements GameObjectLifeCycle {
    static preload(scene: Phaser.Scene) {
        scene.load.image('background', background);
    }

    constructor(scene: Phaser.Scene) {
        super(
            scene,
            0,
            0,
            Math.max(1920, window.innerWidth),
            Math.max(1080, window.innerHeight),
            'background',
        );
        this.setOrigin(0, 0);
        this.setScrollFactor(0);
        this.setPipeline('Light2D');
        scene.add.existing(this);

        // Define the grid size and line color
        const gridSize = configs.global.mapSize / 25; // Size of each grid cell
        const lineColor = 0x00ff00; // Green color for the grid lines

        scene.add.grid(
            configs.global.mapSize / 2,
            configs.global.mapSize / 2,
            configs.global.mapSize,
            configs.global.mapSize,
            gridSize,
            gridSize,
            lineColor,
            0,
            lineColor,
            0.05,
        );

        // Draw the rectangle around the world bounds
        scene.add
            .graphics()
            .lineStyle(1, lineColor, 0.2)
            .strokeRect(0, 0, configs.global.mapSize, configs.global.mapSize);
    }

    runUpdates(): void {
        // No updates needed for background
    }
}
