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
            name: 'turbine',
            frame: 'white',
            lifespan: 500,
            speed: 20,
            frequency: 5,
            scale: { start: 0.3, end: 0 },
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
                name: 'shield',
                frame: 'blue',
                ...powerUpsParticlesOptions,
            },
        );
        this._particles[configs.powerUp.types.fire] = scene.add.particles(
            0,
            0,
            'flares-particles',
            {
                name: 'fire',
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
                name: 'speed',
                frame: 'green',
                ...powerUpsParticlesOptions,
                lifespan: 1000,
            },
        );
        this._particles.explode = scene.add.particles(undefined, undefined, 'flares-particles', {
            frame: ['red', 'yellow', 'white'],
            lifespan: 2000,
            speed: { min: 450, max: 1000 },
            scale: { start: 1, end: 0 },
            blendMode: Phaser.BlendModes.ADD,
            emitting: false,
            name: 'explode',
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
        this._particles.explode?.start().explode(1000, this.spaceship.x, this.spaceship.y);
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
        let x = particle.x;
        let y = particle.y;

        if (particle.emitter.name === 'shield') {
            x = this.spaceship.x + Math.random() * 50 - 25;
            y = this.spaceship.y + Math.random() * 50 - 25;
        } else if (particle.emitter.name === 'fire') {
            x = this.spaceship.x + Math.cos(this.spaceship.rotation) * 30;
            y = this.spaceship.y + Math.sin(this.spaceship.rotation) * 30;
        } else {
            // Set the particles position to the spaceship's position
            x = this.spaceship.x + Math.cos(this.spaceship.rotation) * -40;
            y = this.spaceship.y + Math.sin(this.spaceship.rotation) * -40;
        }

        particle.setPosition(x, y);
    }
}
