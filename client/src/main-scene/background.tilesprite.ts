import Phaser from 'phaser';
import background from '../assets/images/background.png';
import { GameObjectLifeCycle } from './main.scene';

export class Background extends Phaser.GameObjects.TileSprite implements GameObjectLifeCycle {
    
    static preload(scene: Phaser.Scene) {
        scene.load.image('background', background);
    }
    
    constructor(scene: Phaser.Scene, worldSize: number) {
        super(scene, 0, 0, Math.max(1920, window.innerWidth), Math.max(1080, window.innerHeight), 'background');
        this.setOrigin(0, 0);
        this.setScrollFactor(0);
        scene.add.existing(this);

        // Create a graphics object to draw the border
        let graphics = scene.add.graphics();

        // Define the grid size and line color
        let gridSize = worldSize / 25; // Size of each grid cell
        let lineColor = 0x00ff00; // Green color for the grid lines

        // Draw horizontal grid lines
        for (let y = 0; y < worldSize; y += gridSize) {
            graphics.lineStyle(1, lineColor, 0.5); // Line width, color, and alpha
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(worldSize, y);
            graphics.strokePath();
        }

        // Draw vertical grid lines
        for (let x = 0; x < worldSize; x += gridSize) {
            graphics.lineStyle(1, lineColor, 0.5);
            graphics.beginPath();
            graphics.moveTo(x, 0);
            graphics.lineTo(x, worldSize);
            graphics.strokePath();
        }

         // Define the border line color and thickness
         let borderThickness = 1; // Thickness of the border
 
         // Draw the border rectangle
         graphics.lineStyle(borderThickness, lineColor, 1); // Line thickness, color, and alpha
         graphics.strokeRect(0, 0, worldSize, worldSize); // Draw the rectangle around the world bounds
    }

    runUpdates(): void {
        // No updates needed for background
    }
}