# Data Model: 2D Portrait Game User Journey

**Feature**: 002-user-journey-implementation  
**Date**: October 9, 2025  
**Purpose**: Define TypeScript interfaces and data structures for game entities, UI components, and state management

## Core Game Entities

### Player Data

```typescript
interface PlayerProfile {
  readonly id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  currencies: CurrencyBalances;
  statistics: PlayerStatistics;
  achievements: Achievement[];
  settings: PlayerSettings;
  createdAt: Date;
  lastLoginAt: Date;
}

interface CurrencyBalances {
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  energyRegenRate: number; // per minute
  lastEnergyUpdate: Date;
}

interface PlayerStatistics {
  gamesPlayed: number;
  totalPlayTime: number; // milliseconds
  highScore: number;
  winRate: number;
  longestStreak: number;
  favoriteSection: NavigationSection;
}

interface Achievement {
  readonly id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: AchievementCategory;
  rewards: CurrencyReward[];
}

enum AchievementCategory {
  GAMEPLAY = 'gameplay',
  PROGRESSION = 'progression',
  SOCIAL = 'social',
  COLLECTION = 'collection'
}

interface CurrencyReward {
  type: CurrencyType;
  amount: number;
}

enum CurrencyType {
  COINS = 'coins',
  GEMS = 'gems',
  ENERGY = 'energy'
}

interface PlayerSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number; // 0-1
  musicVolume: number; // 0-1
  hapticFeedback: boolean;
  autoSave: boolean;
  language: string;
  theme: UITheme;
}

enum UITheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}
```

### Navigation System

```typescript
interface NavigationState {
  currentSection: NavigationSection;
  previousSection: NavigationSection | null;
  history: NavigationHistoryEntry[];
  isTransitioning: boolean;
  transitionProgress: number; // 0-1
}

enum NavigationSection {
  LOADING = 'loading',
  HOME = 'home',
  PLAY = 'play',
  SHOP = 'shop',
  PROFILE = 'profile'
}

interface NavigationHistoryEntry {
  section: NavigationSection;
  timestamp: Date;
  data?: NavigationData;
}

interface NavigationData {
  [key: string]: any;
  returnTo?: NavigationSection;
  shopCategory?: ShopCategory;
  gameMode?: GameMode;
}

interface NavigationConfig {
  enableHistory: boolean;
  maxHistorySize: number;
  allowBackNavigation: boolean;
  transitionDuration: number; // milliseconds
  transitionType: TransitionType;
}

enum TransitionType {
  FADE = 'fade',
  SLIDE_LEFT = 'slideLeft',
  SLIDE_RIGHT = 'slideRight',
  SCALE = 'scale',
  INSTANT = 'instant'
}
```

### Scene Management

```typescript
interface SceneConfig {
  key: string;
  class: typeof Phaser.Scene;
  autoStart?: boolean;
  data?: any;
  pack?: Phaser.Types.Loader.FileTypes.PackFileSection;
  physics?: Phaser.Types.Physics.Arcade.ArcadeWorldConfig;
}

interface SceneTransition {
  from: string;
  to: string;
  type: TransitionType;
  duration: number;
  onStart?: () => void;
  onComplete?: () => void;
  data?: any;
}

interface LoadingProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentFile: string;
  stage: LoadingStage;
  error?: LoadingError;
}

enum LoadingStage {
  INITIALIZING = 'initializing',
  LOADING_CRITICAL = 'loadingCritical',
  LOADING_ASSETS = 'loadingAssets',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

interface LoadingError {
  type: LoadingErrorType;
  message: string;
  file?: string;
  retryable: boolean;
  retryCount: number;
}

enum LoadingErrorType {
  NETWORK_ERROR = 'networkError',
  FILE_NOT_FOUND = 'fileNotFound',
  CORRUPTION_ERROR = 'corruptionError',
  TIMEOUT_ERROR = 'timeoutError',
  MEMORY_ERROR = 'memoryError'
}
```

### UI Components

```typescript
interface UIComponent {
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

enum UIComponentType {
  CONTAINER = 'container',
  BUTTON = 'button',
  TEXT = 'text',
  IMAGE = 'image',
  PROGRESS_BAR = 'progressBar',
  NAVIGATION_BAR = 'navigationBar',
  PLAYER_HUD = 'playerHUD',
  MODAL = 'modal',
  LIST = 'list',
  GRID = 'grid'
}

interface Position {
  x: number;
  y: number;
  anchor: AnchorPoint;
  relative: boolean;
}

interface Dimensions {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

enum AnchorPoint {
  TOP_LEFT = 'topLeft',
  TOP_CENTER = 'topCenter',
  TOP_RIGHT = 'topRight',
  CENTER_LEFT = 'centerLeft',
  CENTER = 'center',
  CENTER_RIGHT = 'centerRight',
  BOTTOM_LEFT = 'bottomLeft',
  BOTTOM_CENTER = 'bottomCenter',
  BOTTOM_RIGHT = 'bottomRight'
}

interface UIStyle {
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

interface ButtonConfig extends UIComponent {
  text: string;
  icon?: string;
  enabled: boolean;
  pressedStyle?: UIStyle;
  hoverStyle?: UIStyle;
  disabledStyle?: UIStyle;
  onClick: () => void;
  onPress?: () => void;
  onRelease?: () => void;
}

interface ProgressBarConfig extends UIComponent {
  value: number; // 0-1
  showPercentage: boolean;
  showText: boolean;
  text?: string;
  fillColor: string;
  backgroundColor: string;
  borderColor?: string;
  animated: boolean;
  animationDuration: number;
}
```

### Shop System

```typescript
interface ShopItem {
  readonly id: string;
  name: string;
  description: string;
  price: CurrencyPrice;
  category: ShopCategory;
  type: ShopItemType;
  rarity: ItemRarity;
  icon: string;
  available: boolean;
  purchaseLimit?: number;
  purchasedCount: number;
  discount?: Discount;
  featured: boolean;
  newItem: boolean;
  requirements?: PurchaseRequirement[];
}

interface CurrencyPrice {
  type: CurrencyType;
  amount: number;
  originalAmount?: number; // for discounts
}

enum ShopCategory {
  CURRENCY = 'currency',
  POWER_UPS = 'powerUps',
  COSMETICS = 'cosmetics',
  BOOSTERS = 'boosters',
  SPECIAL_OFFERS = 'specialOffers'
}

enum ShopItemType {
  CURRENCY_PACK = 'currencyPack',
  CONSUMABLE = 'consumable',
  PERMANENT = 'permanent',
  SUBSCRIPTION = 'subscription'
}

enum ItemRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

interface Discount {
  percentage: number;
  validUntil?: Date;
  reason: string;
  firstTimeBuyer?: boolean;
}

interface PurchaseRequirement {
  type: RequirementType;
  value: any;
  description: string;
}

enum RequirementType {
  LEVEL = 'level',
  ACHIEVEMENT = 'achievement',
  CURRENCY_BALANCE = 'currencyBalance',
  PREVIOUS_PURCHASE = 'previousPurchase'
}

interface ShopTransaction {
  readonly id: string;
  itemId: string;
  quantity: number;
  price: CurrencyPrice;
  timestamp: Date;
  status: TransactionStatus;
  error?: string;
}

enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

### Game State Management

```typescript
interface GameState {
  readonly id: string;
  player: PlayerProfile;
  navigation: NavigationState;
  loading: LoadingProgress;
  ui: UIState;
  shop: ShopState;
  session: SessionState;
  performance: PerformanceMetrics;
}

interface UIState {
  screenDimensions: Dimensions;
  orientation: ScreenOrientation;
  safeArea: SafeArea;
  theme: UITheme;
  scale: number;
  components: Map<string, UIComponent>;
  modals: UIComponent[];
  notifications: Notification[];
}

enum ScreenOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

interface SafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface ShopState {
  items: ShopItem[];
  categories: ShopCategory[];
  selectedCategory: ShopCategory;
  cart: ShopItem[];
  transactions: ShopTransaction[];
  loading: boolean;
  error?: string;
}

interface SessionState {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
  backgroundTime: number;
  foregroundTime: number;
  networkStatus: NetworkStatus;
}

enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SLOW = 'slow',
  UNKNOWN = 'unknown'
}

interface PerformanceMetrics {
  frameRate: number;
  averageFrameRate: number;
  memoryUsage: number;
  batteryLevel?: number;
  renderTime: number;
  updateTime: number;
  gcCount: number;
  lastGcTime: Date;
}

interface Notification {
  readonly id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  duration: number;
  timestamp: Date;
  dismissed: boolean;
  action?: NotificationAction;
}

enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  ACHIEVEMENT = 'achievement'
}

interface NotificationAction {
  label: string;
  callback: () => void;
}
```

## State Validation Rules

### Currency Validation
- All currency amounts must be non-negative integers
- Energy cannot exceed maxEnergy
- Currency transactions must be atomic (all or nothing)
- Currency balances must be validated before any transaction

### Navigation Validation
- Scene transitions must be valid according to navigation rules
- History stack cannot exceed configured maximum size
- Navigation data must be serializable for persistence

### UI Validation
- Touch targets must be minimum 44px for mobile accessibility
- Components must fit within safe area boundaries
- Text must be readable at minimum supported screen size
- Interactive elements must provide visual feedback

### Performance Validation
- Frame rate must maintain 60 FPS average
- Memory usage must not exceed 200MB on target devices
- Loading times must not exceed 5 seconds for initial load
- Scene transitions must complete within 1 second

## Persistence Strategy

### Local Storage
- Player profile and settings
- Navigation preferences
- Achievement progress
- Currency balances

### Session Storage
- Current navigation state
- UI component states
- Temporary transaction data
- Performance metrics

### IndexedDB
- Asset cache
- Game replay data
- Detailed analytics
- Offline game data

## Data Migration

### Version Compatibility
- Support backward compatibility for 2 major versions
- Automatic data migration on version updates
- Fallback to default values for missing properties
- Validation and cleanup of corrupted data

### Migration Strategies
- Incremental migration for large datasets
- Atomic migration for critical player data
- Rollback capability for failed migrations
- Progress tracking for long-running migrations