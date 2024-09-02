import { SpaceGameScene } from 'client/spacegame-scene/spacegame.scene';
import { SpaceshipSprite } from 'client/spacegame-scene/spaceship/spaceship.sprite';
import configs from 'shared-configs';

export class SpaceshipParticles {
    private _particles: Record<
        number | 'turbine' | 'explode',
        Phaser.GameObjects.Particles.ParticleEmitter | undefined
    > = {
        turbine: undefined,
        explode: undefined,
        [configs.powerUp.types.shield]: undefined,
        [configs.powerUp.types.fire]: undefined,
        [configs.powerUp.types.speed]: undefined,
    };

    constructor(
        scene: SpaceGameScene,
        private spaceship: SpaceshipSprite,
    ) {
        const commonParticlesOptions: Partial<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig> =
            {
                blendMode: Phaser.BlendModes.ADD,
                emitCallback: this.onEmitParticle.bind(this),
            };
        this._particles.turbine = scene.add.particles(0, 0, 'flares-particles', {
            frame: 'white',
            lifespan: 100,
            speed: 10,
            frequency: 20,
            scale: { start: 0.2, end: 0 },
            ...commonParticlesOptions,
        });
        const powerUpsParticlesOptions: Partial<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig> =
            {
                ...commonParticlesOptions,
                lifespan: 200,
                speed: 20,
                frequency: 10,
                scale: { start: 0.4, end: 0 },
                emitting: false,
            };
        this._particles[configs.powerUp.types.shield] = scene.add.particles(
            0,
            0,
            'flares-particles',
            {
                frame: 'blue',
                ...powerUpsParticlesOptions,
            },
        );
        this._particles[configs.powerUp.types.fire] = scene.add.particles(
            0,
            0,
            'flares-particles',
            {
                frame: 'red',
                ...powerUpsParticlesOptions,
                lifespan: 0,
            },
        );
        this._particles[configs.powerUp.types.speed] = scene.add.particles(
            0,
            0,
            'flares-particles',
            {
                frame: 'green',
                ...powerUpsParticlesOptions,
            },
        );
        this._particles.explode = scene.add.particles(undefined, undefined, 'flares-particles', {
            frame: ['red', 'yellow', 'white'],
            lifespan: 800,
            speed: { min: 150, max: 250 },
            scale: { start: 0.4, end: 0 },
            blendMode: Phaser.BlendModes.ADD,
            emitting: false,
        });
    }

    public startPowerUpParticles(powerUpType: number) {
        switch (powerUpType) {
            case configs.powerUp.types.shield:
                this._particles[configs.powerUp.types.shield]?.start();
                break;
            case configs.powerUp.types.fire:
                this._particles[configs.powerUp.types.fire]?.start();
                break;
            case configs.powerUp.types.speed:
                this._particles.turbine?.stop();
                this._particles[configs.powerUp.types.speed]?.start();
                break;
        }
    }

    public resetAndExplode() {
        this.reset();
        this._particles.explode?.start().explode(100, this.spaceship.x, this.spaceship.y);
    }

    public resetAndStartTurbine() {
        this.reset();
        this._particles.turbine?.start();
    }

    private reset() {
        Object.values(this._particles).forEach(particle => {
            particle?.stop();
        });
    }

    private onEmitParticle(particle: Phaser.GameObjects.Particles.Particle) {
        let x, y;
        if (
            this.spaceship.currentPowerUp === configs.powerUp.types.shield &&
            particle.frame.name === 'blue'
        ) {
            x = this.spaceship.x + Math.random() * 50 - 25;
            y = this.spaceship.y + Math.random() * 50 - 25;
        } else if (
            this.spaceship.currentPowerUp === configs.powerUp.types.fire &&
            particle.frame.name === 'red'
        ) {
            x = this.spaceship.x + Math.cos(this.spaceship.rotation) * 30;
            y = this.spaceship.y + Math.sin(this.spaceship.rotation) * 30;
        } else {
            // Set the particles position to the spaceship's position
            x = this.spaceship.x + Math.cos(this.spaceship.rotation) * -30;
            y = this.spaceship.y + Math.sin(this.spaceship.rotation) * -30;
        }

        particle.setPosition(x, y);
    }
}
