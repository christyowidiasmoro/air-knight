/**
 * Base TypeScript interfaces and enums for the game
 * Core type definitions used across all game systems
 */

import type * as Phaser from 'phaser';

// =============================================================================
// CORE GAME TYPES
// =============================================================================

/**
 * Base position interface
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Base dimensions interface
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Rectangle combining position and dimensions
 */
export interface Rectangle extends Position, Dimensions {}

/**
 * Base anchor point for UI positioning
 */
export enum AnchorPoint {
  TOP_LEFT = 'topLeft',
  TOP_CENTER = 'topCenter',
  TOP_RIGHT = 'topRight',
  CENTER_LEFT = 'centerLeft',
  CENTER = 'center',
  CENTER_RIGHT = 'centerRight',
  BOTTOM_LEFT = 'bottomLeft',
  BOTTOM_CENTER = 'bottomCenter',
  BOTTOM_RIGHT = 'bottomRight',
}

// =============================================================================
// SCENE MANAGEMENT
// =============================================================================

/**
 * Scene configuration for registration and management
 */
export interface SceneConfig {
  key: string;
  class: typeof Phaser.Scene;
  autoStart?: boolean;
  data?: unknown;
}

/**
 * Scene transition types
 */
export enum TransitionType {
  FADE = 'fade',
  SLIDE_LEFT = 'slideLeft',
  SLIDE_RIGHT = 'slideRight',
  SCALE = 'scale',
  INSTANT = 'instant',
}

/**
 * Scene transition configuration
 */
export interface SceneTransition {
  from: string;
  to: string;
  type: TransitionType;
  duration: number;
  onStart?: () => void;
  onComplete?: () => void;
  data?: unknown;
}

// =============================================================================
// NAVIGATION SYSTEM
// =============================================================================

/**
 * Navigation sections in the game
 */
export enum NavigationSection {
  LOADING = 'loading',
  HOME = 'home',
  PLAY = 'play',
  SHOP = 'shop',
  PROFILE = 'profile',
}

/**
 * Navigation state interface
 */
export interface NavigationState {
  currentSection: NavigationSection;
  previousSection: NavigationSection | null;
  history: NavigationHistoryEntry[];
  isTransitioning: boolean;
  transitionProgress: number;
}

/**
 * Navigation history entry
 */
export interface NavigationHistoryEntry {
  section: NavigationSection;
  timestamp: Date;
  data?: NavigationData;
}

/**
 * Navigation data for passing between sections
 */
export interface NavigationData {
  [key: string]: unknown;
  returnTo?: NavigationSection;
}

// =============================================================================
// CURRENCY SYSTEM
// =============================================================================

/**
 * Available currency types
 */
export enum CurrencyType {
  COINS = 'coins',
  GEMS = 'gems',
  ENERGY = 'energy',
}

/**
 * Currency balances interface
 */
export interface CurrencyBalances {
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  energyRegenRate: number; // per minute
  lastEnergyUpdate: Date;
}

/**
 * Currency price for shop items
 */
export interface CurrencyPrice {
  type: CurrencyType;
  amount: number;
  originalAmount?: number; // for discounts
}

/**
 * Currency transaction interface
 */
export interface CurrencyTransaction {
  readonly id: string;
  type: CurrencyType;
  amount: number;
  operation: 'add' | 'spend';
  source: string;
  timestamp: Date;
  balanceAfter: number;
}

// =============================================================================
// UI SYSTEM
// =============================================================================

/**
 * Base UI component interface
 */
export interface UIComponent {
  readonly id: string;
  type: UIComponentType;
  position: Position;
  dimensions: Dimensions;
  visible: boolean;
  interactive: boolean;
  style: UIStyle;
  children: UIComponent[];
  parent?: UIComponent;
}

/**
 * UI component types
 */
export enum UIComponentType {
  CONTAINER = 'container',
  BUTTON = 'button',
  TEXT = 'text',
  IMAGE = 'image',
  PROGRESS_BAR = 'progressBar',
  NAVIGATION_BAR = 'navigationBar',
  PLAYER_HUD = 'playerHUD',
  MODAL = 'modal',
  LIST = 'list',
  GRID = 'grid',
}

/**
 * UI styling interface
 */
export interface UIStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  shadowColor?: string;
  shadowOffset?: Position;
  shadowBlur?: number;
}

/**
 * UI themes
 */
export enum UITheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

// =============================================================================
// LOADING SYSTEM
// =============================================================================

/**
 * Loading stages
 */
export enum LoadingStage {
  INITIALIZING = 'initializing',
  LOADING_CRITICAL = 'loadingCritical',
  LOADING_ASSETS = 'loadingAssets',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  ERROR = 'error',
}

/**
 * Loading progress interface
 */
export interface LoadingProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentFile: string;
  stage: LoadingStage;
  error?: LoadingError;
}

/**
 * Loading error types
 */
export enum LoadingErrorType {
  NETWORK_ERROR = 'networkError',
  FILE_NOT_FOUND = 'fileNotFound',
  CORRUPTION_ERROR = 'corruptionError',
  TIMEOUT_ERROR = 'timeoutError',
  MEMORY_ERROR = 'memoryError',
}

/**
 * Loading error interface
 */
export interface LoadingError {
  type: LoadingErrorType;
  message: string;
  file?: string;
  retryable: boolean;
  retryCount: number;
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  frameRate: number;
  averageFrameRate: number;
  memoryUsage: number;
  batteryLevel?: number;
  renderTime: number;
  updateTime: number;
  gcCount: number;
  lastGcTime: Date;
}

/**
 * Performance warning types
 */
export enum PerformanceWarningType {
  LOW_FPS = 'lowFps',
  HIGH_MEMORY = 'highMemory',
  SLOW_LOADING = 'slowLoading',
  LOW_BATTERY = 'lowBattery',
}

/**
 * Performance warning interface
 */
export interface PerformanceWarning {
  type: PerformanceWarningType;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error context for debugging
 */
export interface ErrorContext {
  scene?: string;
  component?: string;
  action?: string;
  timestamp: Date;
  stackTrace?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Game error interface
 */
export interface GameError {
  message: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  recoverable: boolean;
}

// =============================================================================
// EVENT SYSTEM
// =============================================================================

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (data?: T) => void;

/**
 * Event priority levels
 */
export enum EventPriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
  BACKGROUND = 4,
}

/**
 * Base game event interface
 */
export interface GameEvent {
  type: string;
  timestamp: Date;
  priority: EventPriority;
  data?: unknown;
}

// =============================================================================
// DEVICE MANAGEMENT
// =============================================================================

/**
 * Device types
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown',
}

/**
 * Screen orientation
 */
export enum ScreenOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

/**
 * Device information interface
 */
export interface DeviceInfo {
  type: DeviceType;
  orientation: ScreenOrientation;
  screenSize: Dimensions;
  pixelRatio: number;
  touchSupported: boolean;
  userAgent: string;
  memoryInfo?: {
    total: number;
    available: number;
  };
}

/**
 * Storage types
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB';

/**
 * Cache strategies
 */
export enum CacheStrategy {
  MEMORY_ONLY = 'memory-only',
  DISK_ONLY = 'disk-only',
  MEMORY_FIRST = 'memory-first',
  DISK_FIRST = 'disk-first',
  LAZY_LOAD = 'lazy-load',
}

/**
 * Platform types
 */
export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  UNKNOWN = 'unknown',
}

/**
 * Device capabilities interface
 */
export interface DeviceCapabilities {
  hasTouch: boolean;
  hasAudioContext: boolean;
  hasWebAudio: boolean;
  hasWebGL: boolean;
  hasWebGL2: boolean;
  hasLocalStorage: boolean;
  hasIndexedDB: boolean;
  hasSessionStorage: boolean;
  hasOnlineStatus: boolean;
  isOnline: boolean;
  connectionType: string;
  hasPerformanceAPI: boolean;
  hasMemoryAPI: boolean;
  hasGamepadAPI: boolean;
  hasVibration: boolean;
  hasFullscreen: boolean;
  hasPointerLock: boolean;
  hasBatteryAPI: boolean;
}

/**
 * Extended device information interface
 */
export interface ExtendedDeviceInfo extends DeviceInfo {
  platform: Platform;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  isPortrait: boolean;
  isLandscape: boolean;
  browser: {
    isChrome: boolean;
    isSafari: boolean;
    isFirefox: boolean;
    isEdge: boolean;
  };
  osVersion: string;
}

/**
 * Network status
 */
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SLOW = 'slow',
  UNKNOWN = 'unknown',
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Utility type for making all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type for readonly objects
 */
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};

/**
 * Utility type for extracting keys of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Utility type for creating a branded type
 */
export type Brand<T, B> = T & { __brand: B };
