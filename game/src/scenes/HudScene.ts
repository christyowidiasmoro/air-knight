import { eventBus, GameEvents } from "../systems/EventBus";
import { BaseScene } from "./BaseScene";

// The HUD scene is the scene that shows the points and the remaining time.
export class HudScene extends BaseScene{
    
    private remaining_time = 0;

    private remaining_time_text!: Phaser.GameObjects.BitmapText;

    private points_text!: Phaser.GameObjects.BitmapText;

        
    constructor() {
        super("HudScene");
    }

    protected onInit(data?: any): void {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.remaining_time = data.remaining_time;
    }

    protected onCreate(): void {
        
        this.points_text = this.add.bitmapText(10, 10, "pixelfont", "POINTS:0000", 24);
        
        this.remaining_time_text = this.add.bitmapText(this.scale.width - 10, 10, "pixelfont", `REMAINING:${this.remaining_time}s`, 24)
            .setOrigin(1, 0);

        eventBus.on(GameEvents.PLAYER_SCORE_UPDATE, this.update_points.bind(this));
        eventBus.on(GameEvents.GAME_OVER_TIMEOUT, this.update_timeout.bind(this));
    }
    
    protected onDestroy(): void {
        eventBus.off(GameEvents.PLAYER_SCORE_UPDATE, this.update_points.bind(this));
        eventBus.off(GameEvents.GAME_OVER_TIMEOUT, this.update_timeout.bind(this));
    }

    private update_points(points: number) {
        console.log("Updating HUD points to:", points); // Debug log
        this.points_text.setText(`POINTS:${points.toString().padStart(4, "0")}`);
    }

    private update_timeout(timeout: number) {
        this.remaining_time_text.setText(`REMAINING:${timeout.toString().padStart(2, "0")}s`);
    }
}