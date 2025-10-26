import Phaser from 'phaser';
import { eventBus, GameEvents } from '../systems/EventBus';
import { InputHandler, inputSystem } from '../systems/InputSystem';

/**
 * Base Scene class with common lifecycle management
 * Provides consistent scene behavior across the game
 */
export abstract class BaseScene extends Phaser.Scene {
  protected isInitialized = false;
  protected isPaused = false;
  protected inputHandler?: InputHandler | undefined;

  constructor(key: string) {
    super({ key });
  }

  init(data?: any): void {
    this.isInitialized = false;
    this.isPaused = false;
    
    // Common initialization logic
    this.setupEventListeners();
    
    // Call child class init
    this.onInit(data);
  }

  preload(): void {
    // Common preload logic can go here
    this.onPreload();
  }

  create(): void {
    this.isInitialized = true;
    
    // Common create logic
    this.setupInput();
    
    // Call child class create
    this.onCreate();
    
    // Emit scene ready event
    eventBus.emit(GameEvents.SCENE_TRANSITION_COMPLETE, { scene: this.scene.key });
  }

  update(time: number, delta: number): void {
    if (!this.isInitialized || this.isPaused) return;
    
    this.onUpdate(time, delta);
  }

  destroy(): void {
    if (this.inputHandler) {
      inputSystem.removeHandler(this.inputHandler);
    }

    this.removeEventListeners();
    this.onDestroy();
    // Phaser Scene doesn't have destroy method - cleanup is handled by scene manager
  }

  // Abstract methods for child classes to implement
  protected onInit(data?: any): void { }
  protected onPreload(): void { }
  protected onCreate(): void { }
  protected onUpdate(time: number, delta: number): void { }
  protected onDestroy(): void { }

  // Abstract method for scenes to define their input handling
  protected setupInputHandling(): InputHandler | undefined {
    return undefined;
  }

  // Common functionality
  protected setupEventListeners(): void {
    eventBus.on(GameEvents.GAME_PAUSE, this.handlePause.bind(this));
    eventBus.on(GameEvents.GAME_RESUME, this.handleResume.bind(this));
  }

  protected removeEventListeners(): void {
    eventBus.off(GameEvents.GAME_PAUSE, this.handlePause.bind(this));
    eventBus.off(GameEvents.GAME_RESUME, this.handleResume.bind(this));
  }

  protected setupInput(): void {
    // Common input setup for mobile optimization
    this.input.addPointer(2); // Support multi-touch
    
    // Prevent right-click context menu
    this.input.mouse?.disableContextMenu();
        
    // InputSystem integration
    this.inputHandler = this.setupInputHandling();
    if (this.inputHandler) {
      inputSystem.addHandler(this.inputHandler);
    }

  }

  protected handlePause(): void {
    this.isPaused = true;
    this.scene.pause();
  }

  protected handleResume(): void {
    this.isPaused = false;
    this.scene.resume();
  }

  // Utility methods
  protected transitionTo(sceneKey: string, data?: any): void {
    eventBus.emit(GameEvents.SCENE_TRANSITION_START, { 
      from: this.scene.key, 
      to: sceneKey 
    });
    
    this.scene.start(sceneKey, data);
  }

  protected fadeIn(duration = 500): Promise<void> {
    return new Promise(resolve => {
      this.cameras.main.fadeIn(duration, 0, 0, 0, () => resolve());
    });
  }

  protected fadeOut(duration = 500): Promise<void> {
    return new Promise(resolve => {
      this.cameras.main.fadeOut(duration, 0, 0, 0, () => resolve());
    });
  }
}