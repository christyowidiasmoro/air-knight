import { BaseScene } from "./BaseScene";
import { Player } from "../components/GameObjects/Player";
import { BlueEnemy } from "../components/GameObjects/BlueEnemy";
import { Bullet } from "../components/GameObjects/Bullet";
import { eventBus, GameEvents } from "../systems/EventBus";
import { InputEvent } from "../systems/InputSystem";

export class MainScene extends BaseScene {
    private player! : Player;
    private enemy_blue!: BlueEnemy;
    private keys = {
        up: false,
        down: false,
        space: false
    };

    private points = 0;
    private game_over_timeout = 20;
    private lastFireTime = 0;
    private fireDelay = 200; // Minimum delay between shots in milliseconds

    constructor() {
        super("MainScene");
    }

    protected onInit(data?: any): void {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.scene.launch("MenuScene");

        // Reset points
        this.points = 0;
        this.game_over_timeout = 20;
    }

    protected onCreate(): void {
        this.add.image(0, 0, "background")
            .setOrigin(0, 0);
        this.add.image(0, this.scale.height, "floor").setOrigin(0, 1);

        // Player
        this.player = new Player(this.scene.scene);

        // Enemy
        this.enemy_blue = new BlueEnemy(this);

        // Overlap enemy with bullets
        this.physics.add.overlap(this.player.bullets, this.enemy_blue, (obj1, obj2) => {
            const bullet = obj2 as Bullet;
            
            // Check if bullet is still active to prevent multiple hits
            if (bullet.active) {
                bullet.destroyBullet();
                this.enemy_blue.damage(this.player.x, this.player.y);
                this.points += 10;
                console.log("Score updated:", this.points); // Debug log
                eventBus.emit(GameEvents.PLAYER_SCORE_UPDATE, this.points);
            }
        });

        // Overlap player with enemy bullets
        this.physics.add.overlap(this.enemy_blue.bullets, this.player, (player, bullet) => {
            const enemyBullet = bullet as Bullet;
            
            // Check if bullet is still active to prevent multiple hits
            if (enemyBullet.active) {
                enemyBullet.destroyBullet();
                this.cameras.main.shake(100, 0.01);
                // Flash the color white for 300ms
                this.cameras.main.flash(300, 255, 10, 10, false,);
                this.points -= 10;
                console.log("Player hit! Score:", this.points); // Debug log
                eventBus.emit(GameEvents.PLAYER_SCORE_UPDATE, this.points);
            }
        });

        // This event comes from MenuScene
        eventBus.on(GameEvents.GAME_START, () => {
            this.scene.stop("MenuScene");
            this.scene.launch("HudScene", { remaining_time: this.game_over_timeout });
            this.player.start();
            this.enemy_blue.start();

            // Game Over timeout
            this.time.addEvent({
                delay: 1000,
                loop: true,
                callback: () => {
                    if (this.game_over_timeout === 0) {
                        // You need remove the event listener to avoid duplicate events.
                        eventBus.off(GameEvents.GAME_START, () => { });
                        // It is necessary to stop the scenes launched in parallel.
                        this.scene.stop("HudScene");
                        this.scene.start("GameOverScene", { points: this.points });
                    } else {
                        this.game_over_timeout--;
                        eventBus.emit(GameEvents.GAME_OVER_TIMEOUT, this.game_over_timeout);
                    }
                }
            });
        });
    }

    protected onUpdate(time: number, delta: number): void {
        this.player.update();
        this.enemy_blue.update();

        // Player movement entries
        if (this.keys.up) {
            this.player.move("up");
        }
        if (this.keys.down) {
            this.player.move("down");
        }

        // Handle continuous firing when space is held down
        if (this.keys.space) {
            const currentTime = this.time.now;
            if (currentTime - this.lastFireTime >= this.fireDelay) {
                this.player.fire(this.player.x + 20, this.player.y + 5);
                this.lastFireTime = currentTime;
            }
        }
    }

    protected setupInputHandling(): (event: InputEvent) => void {
        return (event: InputEvent) => {
            if (event.type === 'pointer' && event.action === 'down' && event.x !== undefined && event.y !== undefined) {
                this.player.fire(event.x, event.y);

            } else if (event.type === 'keyboard') {
                if (event.key === 'Space') {
                    this.keys.space = event.action === 'down';
                } else if (event.key === 'ArrowUp') {
                    this.keys.up = event.action === 'down';
                } else if (event.key === 'ArrowDown') {
                    this.keys.down = event.action === 'down';
                }
            }
        }
    }
}