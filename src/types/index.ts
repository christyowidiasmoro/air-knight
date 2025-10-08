/**
 * Core type definitions for Air Knight game
 * Following TypeScript-First Development principle
 */

// Game Configuration Types
export interface GameConfig {
  readonly width: number;
  readonly height: number;
  readonly backgroundColor: string;
  readonly physics: PhysicsConfig;
  readonly input: InputConfig;
  readonly audio: AudioConfig;
}

export interface PhysicsConfig {
  readonly gravity: { x: number; y: number };
  readonly debug: boolean;
}

export interface InputConfig {
  readonly enableTouch: boolean;
  readonly enableKeyboard: boolean;
  readonly touchSensitivity: number;
}

export interface AudioConfig {
  readonly masterVolume: number;
  readonly enableSound: boolean;
  readonly enableMusic: boolean;
}

// Scene Management Types
export interface SceneData {
  readonly [key: string]: unknown;
}

export interface SceneTransition {
  readonly from: string;
  readonly to: string;
  readonly data?: SceneData;
  readonly duration?: number;
}

// Entity Component System Types
export interface Entity {
  readonly id: string;
  readonly components: Map<string, Component>;
  readonly active: boolean;
}

export interface Component {
  readonly type: string;
  readonly data: Record<string, unknown>;
}

// Input System Types
export interface InputState {
  readonly keyboard: KeyboardState;
  readonly touch: TouchState;
  readonly mouse: MouseState;
}

export interface KeyboardState {
  readonly pressed: Set<string>;
  readonly justPressed: Set<string>;
  readonly justReleased: Set<string>;
}

export interface TouchState {
  readonly active: boolean;
  readonly x: number;
  readonly y: number;
  readonly startX: number;
  readonly startY: number;
  readonly deltaX: number;
  readonly deltaY: number;
}

export interface MouseState {
  readonly x: number;
  readonly y: number;
  readonly leftButton: boolean;
  readonly rightButton: boolean;
}

// Game Events
export interface GameEvent {
  readonly type: string;
  readonly timestamp: number;
  readonly data?: Record<string, unknown>;
}

export interface SceneEvent extends GameEvent {
  readonly sceneKey: string;
}

export interface EntityEvent extends GameEvent {
  readonly entityId: string;
}

// Performance Monitoring
export interface PerformanceMetrics {
  readonly fps: number;
  readonly memoryUsage: number;
  readonly renderTime: number;
  readonly updateTime: number;
}

// Mobile Platform Types
export interface PlatformCapabilities {
  readonly isMobile: boolean;
  readonly hasTouch: boolean;
  readonly hasVibration: boolean;
  readonly screenOrientation: 'portrait' | 'landscape';
  readonly pixelRatio: number;
}

// Asset Management Types
export interface AssetDescriptor {
  readonly key: string;
  readonly path: string;
  readonly type: 'image' | 'audio' | 'json' | 'atlas';
  readonly size?: number;
}

export interface LoadingProgress {
  readonly loaded: number;
  readonly total: number;
  readonly percentage: number;
  readonly currentAsset?: string;
}

// Game State Types
export interface GameState {
  readonly currentScene: string;
  readonly entities: Entity[];
  readonly performance: PerformanceMetrics;
  readonly platform: PlatformCapabilities;
}

// Error Handling
export interface GameError {
  readonly code: string;
  readonly message: string;
  readonly stack?: string;
  readonly timestamp: number;
  readonly scene?: string;
}

// System Interfaces
export interface GameSystem {
  readonly name: string;
  initialize(): Promise<void>;
  update(deltaTime: number): void;
  shutdown(): Promise<void>;
}

export interface Renderable {
  render(graphics: any): void; // Will use Phaser.GameObjects.Graphics when available
  setVisible(visible: boolean): void;
}

export interface Updateable {
  update(deltaTime: number): void;
}

export interface Destroyable {
  destroy(): void;
}

// Utility Types
export type Vector2 = {
  readonly x: number;
  readonly y: number;
};

export type Rectangle = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type Color = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a?: number;
};

// Event System Types
export type EventHandler<T = unknown> = (data: T) => void;

export interface EventBus {
  subscribe<T>(event: string, handler: EventHandler<T>): void;
  unsubscribe<T>(event: string, handler: EventHandler<T>): void;
  emit<T>(event: string, data?: T): void;
  clear(): void;
}

// Configuration Constants
export const GAME_CONSTANTS = {
  TARGET_FPS: 60,
  MAX_MEMORY_MB: 200,
  TOUCH_THRESHOLD: 10,
  SCENE_TRANSITION_DURATION: 300,
  ASSET_TIMEOUT_MS: 10000,
} as const;

export type GameConstantKey = keyof typeof GAME_CONSTANTS;