import { GameObjects, Math } from "phaser";

export class Bullet extends GameObjects.Image
{
    private speed!: number;
    private flame!: GameObjects.Particles.ParticleEmitter;
    private end_direction = new Math.Vector2(0, 0);

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "bullet");
        this.speed = Phaser.Math.GetSpeed(450, 1);
        this.postFX.addBloom(0xffffff, 1, 1, 2, 1.2);
        // Default bullet (player bullet)
        this.name = "bullet";
    }

    fire (x: number, y: number, targetX: number = 1, targetY: number = 0, bullet_texture: string = "bullet") {
        // Change bullet change texture
        this.setTexture(bullet_texture);

        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);

        // Calculate direction towards target
        if (targetX === 1 && targetY === 0) {
            this.end_direction.setTo(1, 0);
        } else {
            this.end_direction.setTo(targetX - x, targetY - y).normalize();            
        }
    }

    public destroyBullet () {
        // Show particles more often so they're visible
        if (Phaser.Math.RND.frac() < 0.8) { // 80% chance to create particles (increased from 30%)
            const flame = this.scene.add.particles(this.x, this.y, 'flares',
                {
                    lifespan: 200,  // Increased slightly for visibility
                    scale: { start: 1.2, end: 0, ease: 'sine.out' },  // Increased for visibility
                    speed: 120,     // Increased slightly
                    advance: 300,   
                    frequency: 25,  // More particles
                    blendMode: 'ADD',
                    duration: 80,   // Longer duration for visibility
                });
            flame.setDepth(1);
            
            // When particles are complete, destroy them
            flame.once("complete", () => {
                flame.destroy();
            });
        }

        // Return bullet to pool instead of destroying it
        this.setActive(false);
        this.setVisible(false);
    }

    // Update bullet position and destroy if it goes off screen
    update (time: number, delta: number) {
        this.x += this.end_direction.x * this.speed * delta;
        this.y += this.end_direction.y * this.speed * delta;

        // Return to pool if bullet goes off screen (don't destroy the object)
        if (this.x > this.scene.sys.canvas.width || this.x < 0 || this.y > this.scene.sys.canvas.height || this.y < 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}