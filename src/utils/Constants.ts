/**
 * Core game configuration and constants
 * Centralized configuration for all game systems
 */

// Game Configuration
export const GAME_CONFIG = {
  // Display settings
  WIDTH: 390, // iPhone 14 Pro width in portrait
  HEIGHT: 844, // iPhone 14 Pro height in portrait
  ASPECT_RATIO: 390 / 844,

  // Performance settings
  TARGET_FPS: 60,
  MAX_MEMORY_MB: 200,
  UI_MEMORY_LIMIT_MB: 50,

  // Timing constraints
  MAX_LOADING_TIME_MS: 5000,
  MAX_NAVIGATION_TIME_MS: 1000,
  TOUCH_RESPONSE_TIME_MS: 200,
  SHOP_TRANSACTION_TIME_MS: 2000,

  // Screen size support range
  MIN_SCREEN_SIZE: 4.7, // inches
  MAX_SCREEN_SIZE: 6.7, // inches

  // Audio settings
  DEFAULT_SOUND_VOLUME: 0.7,
  DEFAULT_MUSIC_VOLUME: 0.5,
} as const;

// Scene Keys
export const SCENE_KEYS = {
  LOADING: 'LoadingScene',
  MAIN: 'MainScene',
  GAME: 'GameScene',
  SHOP: 'ShopScene',
  PROFILE: 'ProfileScene',
} as const;

// Navigation Sections
export const NAVIGATION_SECTIONS = {
  HOME: 'home',
  PLAY: 'play',
  SHOP: 'shop',
  PROFILE: 'profile',
} as const;

// Currency Types
export const CURRENCY_TYPES = {
  COINS: 'coins',
  GEMS: 'gems',
  ENERGY: 'energy',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Touch targets (minimum 44px for accessibility)
  MIN_TOUCH_TARGET_SIZE: 44,

  // Navigation bar
  NAVIGATION_BAR_HEIGHT: 80,

  // Player HUD
  PLAYER_HUD_HEIGHT: 60,
  PLAYER_HUD_PADDING: 16,

  // Loading screen
  PROGRESS_BAR_WIDTH: 300,
  PROGRESS_BAR_HEIGHT: 8,

  // Transition durations
  SCENE_TRANSITION_DURATION: 300,
  UI_ANIMATION_DURATION: 250,

  // Z-indexes
  Z_INDEX: {
    BACKGROUND: 0,
    GAME_OBJECTS: 10,
    UI_BACKGROUND: 100,
    UI_COMPONENTS: 110,
    NAVIGATION: 120,
    MODALS: 200,
    NOTIFICATIONS: 300,
    DEBUG: 1000,
  },
} as const;

// Colors (using CSS color values for consistency)
export const COLORS = {
  // Primary palette
  PRIMARY: '#4A90E2',
  PRIMARY_DARK: '#357ABD',
  PRIMARY_LIGHT: '#7BB3F0',

  // Secondary palette
  SECONDARY: '#F5A623',
  SECONDARY_DARK: '#E8931C',
  SECONDARY_LIGHT: '#F7B955',

  // Currency colors
  COINS: '#FFD700',
  GEMS: '#9B59B6',
  ENERGY: '#E74C3C',

  // UI colors
  BACKGROUND: '#1A1A1A',
  SURFACE: '#2D2D2D',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#CCCCCC',
  TEXT_DISABLED: '#666666',

  // Status colors
  SUCCESS: '#27AE60',
  WARNING: '#F39C12',
  ERROR: '#E74C3C',
  INFO: '#3498DB',

  // Transparent overlays
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',
  OVERLAY_LIGHT: 'rgba(255, 255, 255, 0.1)',
} as const;

// Asset Paths
export const ASSET_PATHS = {
  IMAGES: 'assets/images/',
  AUDIO: 'assets/audio/',
  FONTS: 'assets/fonts/',
} as const;

// Event Names
export const EVENTS = {
  // Scene events
  SCENE_STARTED: 'scene:started',
  SCENE_STOPPED: 'scene:stopped',
  SCENE_TRANSITION_START: 'scene:transition:start',
  SCENE_TRANSITION_COMPLETE: 'scene:transition:complete',

  // Navigation events
  NAVIGATE_TO: 'navigation:to',
  NAVIGATE_BACK: 'navigation:back',
  NAVIGATION_STATE_CHANGED: 'navigation:state:changed',

  // Currency events
  CURRENCY_CHANGED: 'currency:changed',
  CURRENCY_TRANSACTION: 'currency:transaction',
  CURRENCY_INSUFFICIENT: 'currency:insufficient',

  // UI events
  UI_INTERACTION: 'ui:interaction',
  UI_STATE_CHANGED: 'ui:state:changed',

  // Loading events
  LOADING_PROGRESS: 'loading:progress',
  LOADING_COMPLETE: 'loading:complete',
  LOADING_ERROR: 'loading:error',

  // Shop events
  SHOP_ITEM_PURCHASED: 'shop:item:purchased',
  SHOP_TRANSACTION_COMPLETE: 'shop:transaction:complete',

  // System events
  PERFORMANCE_WARNING: 'system:performance:warning',
  PERFORMANCE_UPDATE: 'system:performance:update',
  ERROR_OCCURRED: 'system:error:occurred',
} as const;

// Performance Metrics
export const PERFORMANCE_THRESHOLDS = {
  FPS_WARNING: 50,
  FPS_CRITICAL: 30,
  MEMORY_WARNING_MB: 150,
  MEMORY_CRITICAL_MB: 180,
  LOAD_TIME_WARNING_MS: 3000,
  LOAD_TIME_CRITICAL_MS: 4500,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  PLAYER_PROFILE: 'air_knight_player_profile',
  NAVIGATION_STATE: 'air_knight_navigation_state',
  GAME_SETTINGS: 'air_knight_game_settings',
  CURRENCY_BALANCES: 'air_knight_currency_balances',
  ACHIEVEMENTS: 'air_knight_achievements',
} as const;

// Development flags
export const DEV_FLAGS = {
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_REPORTING: true,
  SKIP_LOADING_SCREEN: false,
} as const;
