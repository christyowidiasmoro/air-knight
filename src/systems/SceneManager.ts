/**
 * Air Knight - Scene management system
 */

import * as Phaser from 'phaser';
import { eventBus } from './EventBus';
import { errorHandler } from './ErrorHandler';
import { EVENTS, SCENE_KEYS } from '../utils/Constants';
import type { SceneTransition } from '../types/GameTypes';

export interface SceneManagerConfig {
  enableTransitions: boolean;
  transitionDuration: number;
  preloadNext: boolean;
  fadeColor: string;
}

export interface SceneData {
  [key: string]: any;
}

export class SceneManager {
  private game: Phaser.Game;
  private currentScene: string | null = null;
  private previousScene: string | null = null;
  private isTransitioning: boolean = false;
  private preloadedScenes: Set<string> = new Set();

  private config: SceneManagerConfig = {
    enableTransitions: true,
    transitionDuration: 500,
    preloadNext: false,
    fadeColor: '#000000',
  };

  constructor(game: Phaser.Game, config?: Partial<SceneManagerConfig>) {
    this.game = game;

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupSceneEvents();
    console.log('📋 SceneManager initialized');
  }

  private setupSceneEvents(): void {
    this.game.events.on('step', this.onGameStep.bind(this));
    this.game.events.on('ready', this.onGameReady.bind(this));

    eventBus.subscribe(EVENTS.SCENE_TRANSITION_START, this.onTransitionStart.bind(this));
    eventBus.subscribe(EVENTS.SCENE_TRANSITION_COMPLETE, this.onTransitionComplete.bind(this));
  }

  private onGameStep(): void {
    const activeScenes = this.game.scene.getScenes(true);
    if (activeScenes.length > 0 && activeScenes[0]) {
      const newCurrentScene = activeScenes[0].scene.key;
      if (newCurrentScene !== this.currentScene) {
        this.previousScene = this.currentScene;
        this.currentScene = newCurrentScene;
      }
    }
  }

  private onGameReady(): void {
    console.log('🎮 Game ready, SceneManager active');
  }

  private onTransitionStart(data: any): void {
    this.isTransitioning = true;
    console.log('🔄 Scene transition started:', data);
  }

  private onTransitionComplete(data: any): void {
    this.isTransitioning = false;
    console.log('✅ Scene transition completed:', data);
  }

  public startScene(sceneKey: string, data?: SceneData): void {
    try {
      if (!this.isValidSceneKey(sceneKey)) {
        console.error(`❌ Invalid scene key: ${sceneKey}`);
        return;
      }

      console.log(`🎬 Starting scene: ${sceneKey}`);

      eventBus.emit(EVENTS.SCENE_TRANSITION_START, {
        from: this.currentScene,
        to: sceneKey,
        timestamp: new Date(),
        data,
      });

      this.game.scene.start(sceneKey, data);

      eventBus.emit(EVENTS.SCENE_STARTED, {
        scene: sceneKey,
        timestamp: new Date(),
        data,
      });

      setTimeout(() => {
        eventBus.emit(EVENTS.SCENE_TRANSITION_COMPLETE, {
          from: this.currentScene,
          to: sceneKey,
          timestamp: new Date(),
        });
      }, this.config.transitionDuration);
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          component: 'SceneManager',
          action: 'start-scene',
          timestamp: new Date(),
          additionalData: { sceneKey, data },
        },
        false
      );
    }
  }

  public stopScene(sceneKey: string): void {
    try {
      if (!this.isValidSceneKey(sceneKey)) {
        console.error(`❌ Invalid scene key: ${sceneKey}`);
        return;
      }

      console.log(`⏹️ Stopping scene: ${sceneKey}`);

      this.game.scene.stop(sceneKey);

      eventBus.emit(EVENTS.SCENE_STOPPED, {
        scene: sceneKey,
        timestamp: new Date(),
      });
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          component: 'SceneManager',
          action: 'stop-scene',
          timestamp: new Date(),
          additionalData: { sceneKey },
        },
        false
      );
    }
  }

  public switchToScene(sceneKey: string, data?: SceneData, transition?: SceneTransition): void {
    try {
      if (this.isTransitioning) {
        console.warn('⚠️ Scene transition already in progress');
        return;
      }

      if (!this.isValidSceneKey(sceneKey)) {
        console.error(`❌ Invalid scene key: ${sceneKey}`);
        return;
      }

      console.log(`🔄 Switching to scene: ${sceneKey}`);

      const fromScene = this.currentScene;

      eventBus.emit(EVENTS.SCENE_TRANSITION_START, {
        from: fromScene,
        to: sceneKey,
        transition: transition || 'fade',
        timestamp: new Date(),
        data,
      });

      if (transition && this.config.enableTransitions) {
        this.performTransition(fromScene, sceneKey, data, transition);
      } else {
        if (fromScene) {
          this.stopScene(fromScene);
        }
        this.startScene(sceneKey, data);
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          component: 'SceneManager',
          action: 'switch-scene',
          timestamp: new Date(),
          additionalData: { sceneKey, transition, data },
        },
        false
      );
    }
  }

  private performTransition(
    fromScene: string | null,
    toScene: string,
    data?: SceneData,
    transition?: SceneTransition
  ): void {
    this.isTransitioning = true;

    setTimeout(() => {
      if (fromScene) {
        this.stopScene(fromScene);
      }
      this.startScene(toScene, data);

      setTimeout(() => {
        this.isTransitioning = false;
        eventBus.emit(EVENTS.SCENE_TRANSITION_COMPLETE, {
          from: fromScene,
          to: toScene,
          transition: transition || 'fade',
          timestamp: new Date(),
        });
      }, this.config.transitionDuration / 2);
    }, this.config.transitionDuration / 2);
  }

  public getCurrentScene(): string | null {
    return this.currentScene;
  }

  public getPreviousScene(): string | null {
    return this.previousScene;
  }

  public isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }

  public isSceneActive(sceneKey: string): boolean {
    return this.game.scene.isActive(sceneKey);
  }

  private isValidSceneKey(sceneKey: string): boolean {
    return Object.values(SCENE_KEYS).includes(sceneKey as any);
  }

  public getStatus(): {
    currentScene: string | null;
    previousScene: string | null;
    isTransitioning: boolean;
    activeScenes: string[];
    config: SceneManagerConfig;
  } {
    return {
      currentScene: this.currentScene,
      previousScene: this.previousScene,
      isTransitioning: this.isTransitioning,
      activeScenes: this.game.scene.getScenes(true).map(scene => scene.scene.key),
      config: { ...this.config },
    };
  }

  public updateConfig(config: Partial<SceneManagerConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ SceneManager configuration updated:', this.config);
  }

  public destroy(): void {
    this.game.events.off('step', this.onGameStep.bind(this));
    this.game.events.off('ready', this.onGameReady.bind(this));

    this.currentScene = null;
    this.previousScene = null;
    this.isTransitioning = false;
    this.preloadedScenes.clear();

    console.log('🧹 SceneManager destroyed');
  }
}

export function createSceneManager(
  game: Phaser.Game,
  config?: Partial<SceneManagerConfig>
): SceneManager {
  return new SceneManager(game, config);
}
