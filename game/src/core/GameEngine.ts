import Phaser from 'phaser';

import { GameOverScene } from '../scenes/GameOverScene';
import { Preloader } from '../scenes/Preloader';
import { SplashScene } from '../scenes/SplashScene';
import { MainScene } from '../scenes/MainScene';
import { MenuScene } from '../scenes/MenuScene';
import { HudScene } from '../scenes/HudScene';

/**
 * Core Game Engine class that configures and manages the Phaser game instance
 * Follows Phaser 3.70+ best practices and mobile optimization guidelines
 */
export class GameEngine {
  private config: Phaser.Types.Core.GameConfig;
  private game: Phaser.Game | null = null;

  constructor() {
    this.config = this.createGameConfig();
  }

  /**
   * Determines the best render type for the current environment
   */
  private getBestRenderType(): number {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && gl instanceof WebGLRenderingContext) {
        return Phaser.WEBGL;
      }
    } catch (e) {
      console.warn('WebGL not supported, falling back to Canvas');
    }
    
    // Fallback to Canvas
    return Phaser.CANVAS;
  }

  /**
   * Creates the Phaser game configuration optimized for mobile performance
   */
  private createGameConfig(): Phaser.Types.Core.GameConfig {
    // Determine the best renderer type
    const renderType = this.getBestRenderType();
    
    return {
      type: renderType,
      width: 960,
      height: 540,
      parent: 'game-container',
      canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
      backgroundColor: '#2c3e50',
      autoMobilePipeline: true,
      max: {
          width: 800,
          height: 600,
      },
      scale: {
          mode: Phaser.Scale.FIT
      },
      
      // Mobile optimizations
      // scale: {
      //   mode: Phaser.Scale.FIT,
      //   autoCenter: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        
        // width: window.innerWidth * window.devicePixelRatio,
        // height: window.innerHeight * window.devicePixelRatio,
        // min: {
        //   width: 320,
        //   height: 568
        // },
        // max: {
        //   width: 414,
        //   height: 896
        // }
      // },

      // Render configuration
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
        transparent: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "default",
        batchSize: 4096,
        maxLights: 10
      },

      // Performance optimizations for mobile (60fps target)
      fps: {
        target: 60,
        forceSetTimeOut: true,
        deltaHistory: 10,
        panicMax: 0,
        smoothStep: true
      },

      // Physics configuration (if needed)
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },

      // Audio configuration
      audio: {
        disableWebAudio: false,
        noAudio: false
      },

      // Input configuration for mobile
      input: {
        activePointers: 1,
        touch: true,
        mouse: true,
        keyboard: true
      },

      // Scene configuration (will be populated by scene manager)
      scene: [
        Preloader,
        SplashScene,
        MainScene,
        MenuScene,
        HudScene,
        GameOverScene
      ]
    };
  }

  /**
   * Starts the Phaser game instance
   */
  public start(): Phaser.Game {
    if (this.game) {
      console.warn('Game already started');
      return this.game;
    }

    this.game = new Phaser.Game(this.config);
    
    // Add error handling
    this.game.events.on('ready', () => {
      console.log('🎮 Phaser game ready');
    });

    this.game.events.on('destroy', () => {
      console.log('🎮 Phaser game destroyed');
    });

    return this.game;
  }

  /**
   * Handles window resize events for responsive design
   */
  public handleResize(): void {
    if (this.game) {
      // Phaser handles this automatically with our scale configuration
      this.game.scale.refresh();
    }
  }

  /**
   * Gets the current game instance
   */
  public getGame(): Phaser.Game | null {
    return this.game;
  }

  /**
   * Destroys the game instance and cleans up resources
   */
  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  /**
   * Pauses all active scenes
   */
  public pauseAll(): void {
    if (this.game) {
      this.game.scene.getScenes(true).forEach(scene => {
        this.game?.scene.pause(scene.scene.key);
      });
    }
  }

  /**
   * Resumes all paused scenes
   */
  public resumeAll(): void {
    if (this.game) {
      this.game.scene.getScenes(false).forEach(scene => {
        this.game?.scene.resume(scene.scene.key);
      });
    }
  }
}