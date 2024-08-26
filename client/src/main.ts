import Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import { MainScene } from './main-scene/main.scene';

if (!sessionStorage.getItem('userId')) {
  sessionStorage.setItem('userId', crypto.randomUUID());
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  plugins: {
    global: [{
      key: 'rexVirtualJoystick',
      plugin: VirtualJoystickPlugin,
      start: true
    }]
  },
  scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'game',
      width: window.innerWidth,
      height: window.innerHeight,
  },
  scene: [MainScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: location.search.includes('debug'),
    }
  }
};

export const game = new Phaser.Game(config);

function renderRanking(rankDiv: HTMLDivElement) {
  function render () {
    rankDiv.childNodes.forEach((child) => child.remove());
    const data = window.rankingList ?? [];
    const rankingElement = document.createElement('ol');
    data
      .sort((a: any, b: any) => b.score - a.score)
      .forEach((spaceship: any, index: number) => {
        const li = document.createElement('li');
        li.textContent = `${spaceship.username}: ${spaceship.score ?? 0}`;
        rankingElement.appendChild(li);
      });
    rankDiv.appendChild(rankingElement);

    requestAnimationFrame(render);
  }

  render();
}

renderRanking(document.getElementById('ranking') as HTMLDivElement);
