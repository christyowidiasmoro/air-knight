import { BaseScene } from "./BaseScene";

// Class to preload all the assets
// Remember you can load this assets in another scene if you need it
export class Preloader extends BaseScene {

    constructor() {
        super("Preloader");
    }

    protected onPreload(): void {
        // Load all the assets
        this.load.setPath("assets");
        this.load.image("logo", "logo.png");
        this.load.image("floor", "floor.png");
        this.load.image("background", "background.png");

        this.load.image("player", "player/player.png");
        this.load.atlas("propulsion-fire", "player/propulsion/propulsion-fire.png", "player/propulsion/propulsion-fire_atlas.json");
        this.load.animation("propulsion-fire-anim", "player/propulsion/propulsion-fire_anim.json");

        // Bullets
        this.load.image("bullet", "player/bullet.png");
        this.load.image("flares", "flares.png")

        // Enemies
        this.load.atlas("enemy-blue", "enemies/enemy-blue/enemy-blue.png", "enemies/enemy-blue/enemy-blue_atlas.json");
        this.load.animation("enemy-blue-anim", "enemies/enemy-blue/enemy-blue_anim.json");
        this.load.image("enemy-bullet", "enemies/enemy-bullet.png");

        // Fonts
        this.load.bitmapFont("pixelfont", "fonts/pixelfont.png", "fonts/pixelfont.xml");
        this.load.image("knighthawks", "fonts/knight3.png");

        // Event to update the loading bar
        this.load.on("progress", (progress: number) => {
            console.log("Loading: " + Math.round(progress * 100) + "%");
        });
    }

    protected onCreate(): void {
        // Create bitmap font and load it in cache
        const config: Phaser.Types.GameObjects.BitmapText.RetroFontConfig = {
            image: 'knighthawks',
            width: 31,
            height: 25,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET6,
            charsPerRow: 10,
            lineSpacing: 0,
            "offset.x": 0,
            "offset.y": 0,
            "spacing.x": 10,
            "spacing.y": 10
        };
        this.cache.bitmapFont.add('knighthawks', Phaser.GameObjects.RetroFont.Parse(this, config));

        // When all the assets are loaded go to the next scene
        this.transitionTo("SplashScene");
    }
}