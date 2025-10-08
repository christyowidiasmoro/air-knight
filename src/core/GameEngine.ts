/**
 * Game Engine Core - Main game initialization and lifecycle management
 * Following Modular Game Architecture and Mobile-Optimized Performance principles
 */

import type { GameSystem, PerformanceMetrics } from '@/types';
import { eventBus, GAME_EVENTS } from '@/systems/EventBus';
import { SceneManager } from '@/systems/SceneManager';
import { InputSystem } from '@/systems/InputSystem';

// Import scenes
import { BootScene } from '@/scenes/BootScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { GameScene } from '@/scenes/GameScene';

export class GameEngine {
  private phaserGame: any = null; // Will be Phaser.Game when available
  private systems = new Map<string, GameSystem>();
  private initialized = false;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * Initialize the game engine
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Game engine already initialized');
      return;
    }

    try {
      // Initialize core systems
      await this.initializeSystems();

      // Create game instance (will use Phaser when available)
      await this.createGame();

      // Start performance monitoring
      this.performanceMonitor.start();

      this.initialized = true;
      eventBus.emit(GAME_EVENTS.GAME_START);
      
      console.log('Game engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize game engine:', error);
      eventBus.emit(GAME_EVENTS.ERROR, {
        code: 'INIT_FAILED',
        message: 'Game engine initialization failed',
        error,
      });
      throw error;
    }
  }

  /**
   * Shutdown the game engine
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // Stop performance monitoring
      this.performanceMonitor.stop();

      // Shutdown systems
      for (const system of this.systems.values()) {
        await system.shutdown();
      }
      this.systems.clear();

      // Destroy game
      if (this.phaserGame) {
        // Will call Phaser destroy when available
        this.phaserGame = null;
      }

      this.initialized = false;
      console.log('Game engine shutdown complete');
    } catch (error) {
      console.error('Error during game engine shutdown:', error);
    }
  }

  /**
   * Get a system by name
   */
  getSystem<T extends GameSystem>(name: string): T | null {
    return (this.systems.get(name) as T) ?? null;
  }

  /**
   * Get the game instance
   */
  getGameInstance(): any {
    return this.phaserGame;
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics();
  }

  private async initializeSystems(): Promise<void> {
    // Initialize Scene Manager
    const sceneManager = new SceneManager();
    await sceneManager.initialize();
    this.systems.set(sceneManager.name, sceneManager);

    // Initialize Input System
    const inputSystem = new InputSystem();
    await inputSystem.initialize();
    this.systems.set(inputSystem.name, inputSystem);

    console.log(`Initialized ${this.systems.size} systems`);
  }

  private async createGame(): Promise<void> {
    console.log('Creating game instance...');
    
    // For now, create a simple canvas-based game
    // This will be replaced with Phaser when installed
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas size
        const { width, height } = this.getOptimalCanvasSize();
        canvas.width = width;
        canvas.height = height;
        
        // Simple initial render
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#ecf0f1';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Air Knight', width / 2, height / 2 - 50);
        ctx.fillText('Initializing...', width / 2, height / 2 + 50);
      }
    }

    // Initialize scenes (simplified for now)
    const sceneManager = this.getSystem<SceneManager>('SceneManager');
    if (sceneManager) {
      sceneManager.addScene(new BootScene());
      sceneManager.addScene(new MainMenuScene());
      sceneManager.addScene(new GameScene());
      
      // Start with boot scene
      await sceneManager.startScene('BootScene');
    }
  }

  private getOptimalCanvasSize(): { width: number; height: number } {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // For mobile, use screen dimensions with some optimization
    if (screenWidth < 768) {
      return {
        width: Math.min(screenWidth, 800),
        height: Math.min(screenHeight, 600),
      };
    }

    // For desktop, use fixed dimensions
    return {
      width: 1280,
      height: 720,
    };
  }
}

/**
 * Performance Monitor - Tracks FPS, memory usage, and other metrics
 */
class PerformanceMonitor {
  private metrics: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    updateTime: number;
  } = {
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    updateTime: 0,
  };

  private fpsCounter = 0;
  private lastTime = 0;
  private running = false;
  private intervalId: number | null = null;

  start(): void {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    
    // Update metrics every second
    this.intervalId = window.setInterval(() => {
      this.updateMetrics();
    }, 1000);

    console.log('Performance monitoring started');
  }

  stop(): void {
    if (!this.running) return;

    this.running = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Performance monitoring stopped');
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  private updateMetrics(): void {
    // Update FPS
    this.metrics.fps = this.fpsCounter;
    this.fpsCounter = 0;

    // Update memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }

    // Check for performance warnings
    if (this.metrics.fps < 45) {
      eventBus.emit(GAME_EVENTS.PERFORMANCE_WARNING, {
        type: 'LOW_FPS',
        value: this.metrics.fps,
        threshold: 45,
      });
    }

    if (this.metrics.memoryUsage > 150) {
      eventBus.emit(GAME_EVENTS.PERFORMANCE_WARNING, {
        type: 'HIGH_MEMORY',
        value: this.metrics.memoryUsage,
        threshold: 150,
      });
    }
  }

  // Called by the game loop to count frames
  countFrame(): void {
    this.fpsCounter++;
  }
}

// Global game engine instance
export const gameEngine = new GameEngine();