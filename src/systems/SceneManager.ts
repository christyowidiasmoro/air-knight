/**
 * Scene Manager System - Handles scene lifecycle and transitions
 * Following Scene-Based Organization principle
 */

import type { SceneData, SceneTransition, GameSystem } from '@/types';
import { eventBus, GAME_EVENTS } from './EventBus';

export interface GameScene {
  readonly key: string;
  init?(data: SceneData): void;
  preload?(): void;
  create?(): void;
  update?(time: number, delta: number): void;
  shutdown?(): void;
  destroy?(): void;
}

export class SceneManager implements GameSystem {
  readonly name = 'SceneManager';
  
  private scenes = new Map<string, GameScene>();
  private currentScene: GameScene | null = null;
  private phaserSceneManager: any = null; // Phaser.Scenes.SceneManager
  private transitionInProgress = false;

  constructor(phaserSceneManager?: any) {
    this.phaserSceneManager = phaserSceneManager ?? null;
  }

  async initialize(): Promise<void> {
    eventBus.subscribe(GAME_EVENTS.SCENE_CHANGE, this.handleSceneChange.bind(this));
    console.log('SceneManager initialized');
  }

  async shutdown(): Promise<void> {
    if (this.currentScene) {
      await this.stopScene(this.currentScene.key);
    }
    this.scenes.clear();
    this.currentScene = null;
    eventBus.unsubscribe(GAME_EVENTS.SCENE_CHANGE, this.handleSceneChange.bind(this));
    console.log('SceneManager shutdown');
  }

  update(deltaTime: number): void {
    // Scene-specific updates are handled by Phaser
    // This method can be used for scene manager specific logic
  }

  /**
   * Register a scene
   */
  addScene(scene: GameScene): void {
    if (this.scenes.has(scene.key)) {
      throw new Error(`Scene with key '${scene.key}' already exists`);
    }
    
    this.scenes.set(scene.key, scene);
    
    // If using Phaser, register with Phaser's scene manager
    if (this.phaserSceneManager) {
      this.phaserSceneManager.add(scene.key, scene);
    }
    
    console.log(`Scene '${scene.key}' registered`);
  }

  /**
   * Remove a scene
   */
  removeScene(key: string): void {
    if (!this.scenes.has(key)) {
      console.warn(`Scene '${key}' not found`);
      return;
    }

    if (this.currentScene?.key === key) {
      throw new Error(`Cannot remove active scene '${key}'`);
    }

    const scene = this.scenes.get(key)!;
    this.scenes.delete(key);
    
    // Clean up with Phaser if available
    if (this.phaserSceneManager) {
      this.phaserSceneManager.remove(key);
    }
    
    // Call destroy if available
    if (scene.destroy) {
      scene.destroy();
    }
    
    console.log(`Scene '${key}' removed`);
  }

  /**
   * Start a scene
   */
  async startScene(key: string, data?: SceneData): Promise<void> {
    if (this.transitionInProgress) {
      console.warn('Scene transition already in progress');
      return;
    }

    const scene = this.scenes.get(key);
    if (!scene) {
      throw new Error(`Scene '${key}' not found`);
    }

    this.transitionInProgress = true;

    try {
      // Stop current scene if exists
      if (this.currentScene) {
        await this.stopScene(this.currentScene.key);
      }

      // Start new scene
      this.currentScene = scene;
      
      if (this.phaserSceneManager) {
        this.phaserSceneManager.start(key, data);
      } else {
        // Manual scene initialization
        if (scene.init) {
          scene.init(data ?? {});
        }
        if (scene.preload) {
          scene.preload();
        }
        if (scene.create) {
          scene.create();
        }
      }

      eventBus.emit(GAME_EVENTS.SCENE_READY, { sceneKey: key, data });
      console.log(`Scene '${key}' started`);
      
    } finally {
      this.transitionInProgress = false;
    }
  }

  /**
   * Stop a scene
   */
  async stopScene(key: string): Promise<void> {
    const scene = this.scenes.get(key);
    if (!scene) {
      console.warn(`Scene '${key}' not found`);
      return;
    }

    if (this.phaserSceneManager) {
      this.phaserSceneManager.stop(key);
    } else {
      // Manual scene shutdown
      if (scene.shutdown) {
        scene.shutdown();
      }
    }

    if (this.currentScene?.key === key) {
      this.currentScene = null;
    }

    console.log(`Scene '${key}' stopped`);
  }

  /**
   * Pause a scene
   */
  pauseScene(key: string): void {
    if (!this.scenes.has(key)) {
      console.warn(`Scene '${key}' not found`);
      return;
    }

    if (this.phaserSceneManager) {
      this.phaserSceneManager.pause(key);
    }

    console.log(`Scene '${key}' paused`);
  }

  /**
   * Resume a scene
   */
  resumeScene(key: string): void {
    if (!this.scenes.has(key)) {
      console.warn(`Scene '${key}' not found`);
      return;
    }

    if (this.phaserSceneManager) {
      this.phaserSceneManager.resume(key);
    }

    console.log(`Scene '${key}' resumed`);
  }

  /**
   * Get current scene
   */
  getCurrentScene(): GameScene | null {
    return this.currentScene;
  }

  /**
   * Get all registered scenes
   */
  getScenes(): string[] {
    return Array.from(this.scenes.keys());
  }

  /**
   * Check if scene exists
   */
  hasScene(key: string): boolean {
    return this.scenes.has(key);
  }

  /**
   * Handle scene change events
   */
  private handleSceneChange(transition: SceneTransition): void {
    this.startScene(transition.to, transition.data).catch(error => {
      console.error('Scene transition failed:', error);
      eventBus.emit(GAME_EVENTS.ERROR, {
        code: 'SCENE_TRANSITION_FAILED',
        message: `Failed to transition from ${transition.from} to ${transition.to}`,
        error,
      });
    });
  }
}

// Scene transition helper functions
export const sceneTransitions = {
  /**
   * Transition to a new scene
   */
  goToScene(to: string, data?: SceneData): void {
    eventBus.emit(GAME_EVENTS.SCENE_CHANGE, {
      from: 'current',
      to,
      data,
    } as SceneTransition);
  },

  /**
   * Restart current scene
   */
  restartScene(data?: SceneData): void {
    // This would need to be implemented based on current scene tracking
    console.log('Restart scene requested', data);
  },
};