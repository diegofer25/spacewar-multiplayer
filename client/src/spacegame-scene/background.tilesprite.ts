import configs from 'shared-configs';
import Phaser from 'phaser';
import background from 'client/assets/images/background.png';
import bgMusic from 'client/assets/audios/bg-music.mp3';
import { GameObjectLifeCycle } from 'client/spacegame-scene/spacegame.scene';

export class Background extends Phaser.GameObjects.TileSprite implements GameObjectLifeCycle {
    private lights: Phaser.GameObjects.Light[] = [];

    static preload(scene: Phaser.Scene) {
        scene.load.image('background', background);
        scene.load.audio('bg-music', bgMusic);
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
            0.2,
        );

        // Draw the rectangle around the world bounds
        scene.add
            .graphics()
            .lineStyle(1, lineColor, 0.4)
            .strokeRect(0, 0, configs.global.mapSize, configs.global.mapSize);

        // Add the background music in infinite loop
        scene.sound.add('bg-music', { loop: true }).play();

        // create lights that will randomly change color and walk around the map
        this.lights = Array.from({ length: 200 }, () =>
            scene.lights
                .addLight(
                    Phaser.Math.Between(
                        -configs.global.mapSize * 0.2,
                        configs.global.mapSize * 1.2,
                    ),
                    Phaser.Math.Between(
                        -configs.global.mapSize * 0.2,
                        configs.global.mapSize * 1.2,
                    ),
                    800,
                )
                .setIntensity(15),
        );
    }

    runUpdates(): void {
        this.lights.forEach(light => {
            const maxEdge = configs.global.mapSize * 1.2;
            const minEdge = -configs.global.mapSize * 0.2;
            const randomX = light.x + Phaser.Math.Between(-10, 10);
            const randomY = light.y + Phaser.Math.Between(-10, 10);
            light.setPosition(
                Phaser.Math.Clamp(randomX, minEdge, maxEdge),
                Phaser.Math.Clamp(randomY, minEdge, maxEdge),
            );
            light.setColor(Phaser.Display.Color.RandomRGB().color);
            light.setRadius(Math.random() * 800);
        });
    }
}
