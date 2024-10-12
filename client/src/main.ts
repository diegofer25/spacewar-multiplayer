import 'client/global-style.scss';
import { SpaceGameScene } from 'client/spacegame-scene/spacegame.scene';
import Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin';
import Stats from 'stats.js';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    plugins: {
        global: [
            {
                key: 'rexVirtualJoystick',
                plugin: VirtualJoystickPlugin,
                start: true,
            },
        ],
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game',
        width: window.innerWidth,
        height: window.innerHeight,
    },
    scene: [SpaceGameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: !!location.search.includes('debug'),
        },
    },
    dom: {
        createContainer: true,
        behindCanvas: false,
    },
    version: '1.0.0',
};

new Phaser.Game(config);

if (location.search.includes('stats')) {
    showStatsMonitor();
}

function showStatsMonitor() {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    function animate() {
        stats.begin();
        stats.end();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}
