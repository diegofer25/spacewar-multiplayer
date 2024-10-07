import Phaser from 'phaser';

export class RankingDomElement extends Phaser.GameObjects.DOMElement {
    private _lastScoreText: string = '';

    constructor(scene: Phaser.Scene) {
        const el = document.createElement('div');

        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.right = '0';
        el.style.color = 'white';
        el.style.fontSize = '24px';
        el.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        el.style.fontSize = '1rem';
        el.style.fontFamily = 'Arial';

        super(scene, 0, 0, el);
        scene.children.bringToTop(this);
    }

    public updateRanking(ranking: { username: string; score: number }[], latency: number) {
        const rankingText = ranking
            .map(
                ({ username, score }, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${username}</td>
                    <td>${score}</td>
                </tr>
            `,
            )
            .join('');

        // if (rankingText === this._lastScoreText) {
        //     return;
        // }

        this.node.innerHTML = `
            <div>
                <table style="border-collapse: collapse;">
                    <thead>
                        <th>#</th>
                        <th>Username</th>
                        <th>Score</th>
                    </tr>
                    <tbody>
                        ${rankingText}
                    </tbody>
                </table>
                <div style="margin-top: 5px;">Latency: ${latency}ms</div>
            </div>
        `;

        this._lastScoreText = rankingText;
    }
}
