# Game Events Schema

**Feature**: 002-user-journey-implementation  
**Date**: October 9, 2025  
**Purpose**: Define event schema for inter-system communication and analytics

## Core Game Events

### Scene Management Events

```typescript
// Scene lifecycle events
interface SceneStartedEvent {
  sceneKey: string;
  timestamp: Date;
  data?: any;
  previousScene?: string;
}

interface SceneStoppedEvent {
  sceneKey: string;
  timestamp: Date;
  duration: number; // milliseconds
}

interface SceneTransitionStartEvent {
  fromScene: string;
  toScene: string;
  transitionType: TransitionType;
  duration: number;
  timestamp: Date;
}

interface SceneTransitionCompleteEvent {
  fromScene: string;
  toScene: string;
  transitionType: TransitionType;
  actualDuration: number;
  timestamp: Date;
}

// Scene event types
const SCENE_EVENTS = {
  SCENE_STARTED: 'scene:started',
  SCENE_STOPPED: 'scene:stopped',
  SCENE_PAUSED: 'scene:paused',
  SCENE_RESUMED: 'scene:resumed',
  TRANSITION_START: 'scene:transition:start',
  TRANSITION_COMPLETE: 'scene:transition:complete',
  TRANSITION_CANCELLED: 'scene:transition:cancelled'
} as const;
```

### Navigation Events

```typescript
interface NavigationEvent {
  from: NavigationSection;
  to: NavigationSection;
  timestamp: Date;
  data?: NavigationData;
  source: NavigationSource;
}

enum NavigationSource {
  USER_INPUT = 'userInput',
  PROGRAMMATIC = 'programmatic',
  BACK_BUTTON = 'backButton',
  DEEP_LINK = 'deepLink'
}

interface NavigationErrorEvent {
  attemptedSection: NavigationSection;
  error: string;
  timestamp: Date;
  canRetry: boolean;
}

// Navigation event types
const NAVIGATION_EVENTS = {
  NAVIGATE_START: 'navigation:start',
  NAVIGATE_COMPLETE: 'navigation:complete',
  NAVIGATE_ERROR: 'navigation:error',
  HISTORY_CHANGED: 'navigation:history:changed',
  STATE_CHANGED: 'navigation:state:changed'
} as const;
```

### Currency Events

```typescript
interface CurrencyChangedEvent {
  type: CurrencyType;
  previousAmount: number;
  newAmount: number;
  delta: number;
  source: CurrencySource;
  timestamp: Date;
  transactionId?: string;
}

enum CurrencySource {
  PURCHASE = 'purchase',
  REWARD = 'reward',
  GAMEPLAY = 'gameplay',
  ADMIN = 'admin',
  ENERGY_REGEN = 'energyRegen',
  REFUND = 'refund'
}

interface CurrencyTransactionEvent {
  transactionId: string;
  costs: CurrencyPrice[];
  purpose: string;
  status: TransactionStatus;
  timestamp: Date;
  playerId: string;
}

interface CurrencyErrorEvent {
  type: CurrencyType;
  attemptedAmount: number;
  currentBalance: number;
  operation: 'add' | 'spend';
  error: string;
  timestamp: Date;
}

// Currency event types
const CURRENCY_EVENTS = {
  BALANCE_CHANGED: 'currency:balance:changed',
  TRANSACTION_START: 'currency:transaction:start',
  TRANSACTION_COMPLETE: 'currency:transaction:complete',
  TRANSACTION_FAILED: 'currency:transaction:failed',
  INSUFFICIENT_FUNDS: 'currency:insufficient:funds',
  ENERGY_UPDATED: 'currency:energy:updated'
} as const;
```

### UI Events

```typescript
interface UIInteractionEvent {
  componentId: string;
  componentType: UIComponentType;
  action: UIAction;
  position: Position;
  timestamp: Date;
  additionalData?: any;
}

enum UIAction {
  CLICK = 'click',
  TOUCH = 'touch',
  HOVER = 'hover',
  FOCUS = 'focus',
  BLUR = 'blur',
  SCROLL = 'scroll',
  DRAG = 'drag',
  PINCH = 'pinch'
}

interface UIComponentCreatedEvent {
  componentId: string;
  componentType: UIComponentType;
  parentId?: string;
  timestamp: Date;
}

interface UIComponentDestroyedEvent {
  componentId: string;
  componentType: UIComponentType;
  lifespan: number; // milliseconds
  timestamp: Date;
}

interface UILayoutChangedEvent {
  newDimensions: Dimensions;
  oldDimensions: Dimensions;
  orientation: ScreenOrientation;
  safeArea: SafeArea;
  timestamp: Date;
}

interface UIModalEvent {
  modalId: string;
  action: 'show' | 'hide';
  result?: any;
  timestamp: Date;
}

interface UINotificationEvent {
  notificationId: string;
  type: NotificationType;
  action: 'show' | 'hide' | 'interact';
  timestamp: Date;
}

// UI event types
const UI_EVENTS = {
  COMPONENT_CREATED: 'ui:component:created',
  COMPONENT_DESTROYED: 'ui:component:destroyed',
  COMPONENT_UPDATED: 'ui:component:updated',
  INTERACTION: 'ui:interaction',
  LAYOUT_CHANGED: 'ui:layout:changed',
  MODAL_SHOWN: 'ui:modal:shown',
  MODAL_HIDDEN: 'ui:modal:hidden',
  NOTIFICATION_SHOWN: 'ui:notification:shown',
  NOTIFICATION_HIDDEN: 'ui:notification:hidden'
} as const;
```

### Loading Events

```typescript
interface LoadingProgressEvent {
  progress: LoadingProgress;
  timestamp: Date;
}

interface LoadingStageChangedEvent {
  previousStage: LoadingStage;
  newStage: LoadingStage;
  timestamp: Date;
}

interface AssetLoadedEvent {
  assetKey: string;
  assetType: string;
  fileSize: number;
  loadTime: number; // milliseconds
  timestamp: Date;
}

interface AssetFailedEvent {
  assetKey: string;
  assetType: string;
  error: LoadingError;
  retryCount: number;
  timestamp: Date;
}

interface LoadingCompleteEvent {
  totalAssets: number;
  loadedAssets: number;
  failedAssets: number;
  totalTime: number; // milliseconds
  timestamp: Date;
}

// Loading event types
const LOADING_EVENTS = {
  PROGRESS_UPDATED: 'loading:progress:updated',
  STAGE_CHANGED: 'loading:stage:changed',
  ASSET_LOADED: 'loading:asset:loaded',
  ASSET_FAILED: 'loading:asset:failed',
  LOADING_COMPLETE: 'loading:complete',
  LOADING_CANCELLED: 'loading:cancelled'
} as const;
```

### Shop Events

```typescript
interface ShopItemPurchasedEvent {
  itemId: string;
  itemName: string;
  quantity: number;
  totalCost: CurrencyPrice[];
  transactionId: string;
  timestamp: Date;
  playerId: string;
}

interface ShopItemViewedEvent {
  itemId: string;
  itemName: string;
  category: ShopCategory;
  viewDuration: number; // milliseconds
  timestamp: Date;
}

interface ShopCategoryChangedEvent {
  previousCategory: ShopCategory;
  newCategory: ShopCategory;
  timestamp: Date;
}

interface ShopCartChangedEvent {
  action: 'add' | 'remove' | 'clear';
  itemId?: string;
  quantity?: number;
  cartTotal: CurrencyPrice[];
  cartItemCount: number;
  timestamp: Date;
}

interface ShopPurchaseFailedEvent {
  itemId: string;
  reason: string;
  attemptedCost: CurrencyPrice[];
  currentBalances: CurrencyBalances;
  timestamp: Date;
}

// Shop event types
const SHOP_EVENTS = {
  ITEM_PURCHASED: 'shop:item:purchased',
  ITEM_VIEWED: 'shop:item:viewed',
  CATEGORY_CHANGED: 'shop:category:changed',
  CART_CHANGED: 'shop:cart:changed',
  PURCHASE_FAILED: 'shop:purchase:failed',
  SHOP_OPENED: 'shop:opened',
  SHOP_CLOSED: 'shop:closed'
} as const;
```

### Performance Events

```typescript
interface PerformanceMetricsEvent {
  metrics: PerformanceMetrics;
  timestamp: Date;
}

interface FrameRateWarningEvent {
  currentFPS: number;
  targetFPS: number;
  duration: number; // milliseconds of poor performance
  timestamp: Date;
}

interface MemoryWarningEvent {
  currentUsage: number; // MB
  maxUsage: number; // MB
  availableMemory: number; // MB
  timestamp: Date;
}

interface BatteryWarningEvent {
  batteryLevel: number; // 0-1
  isCharging: boolean;
  timestamp: Date;
}

// Performance event types
const PERFORMANCE_EVENTS = {
  METRICS_UPDATED: 'performance:metrics:updated',
  FRAME_RATE_WARNING: 'performance:framerate:warning',
  MEMORY_WARNING: 'performance:memory:warning',
  BATTERY_WARNING: 'performance:battery:warning',
  PERFORMANCE_RECOVERED: 'performance:recovered'
} as const;
```

### Player Events

```typescript
interface PlayerLevelUpEvent {
  previousLevel: number;
  newLevel: number;
  experienceGained: number;
  rewards: CurrencyReward[];
  timestamp: Date;
  playerId: string;
}

interface AchievementUnlockedEvent {
  achievementId: string;
  achievementName: string;
  description: string;
  category: AchievementCategory;
  rewards: CurrencyReward[];
  timestamp: Date;
  playerId: string;
}

interface PlayerSettingsChangedEvent {
  setting: keyof PlayerSettings;
  previousValue: any;
  newValue: any;
  timestamp: Date;
  playerId: string;
}

// Player event types
const PLAYER_EVENTS = {
  LEVEL_UP: 'player:levelup',
  ACHIEVEMENT_UNLOCKED: 'player:achievement:unlocked',
  SETTINGS_CHANGED: 'player:settings:changed',
  PROFILE_UPDATED: 'player:profile:updated'
} as const;
```

### System Events

```typescript
interface GameSessionStartedEvent {
  sessionId: string;
  playerId: string;
  platform: string;
  deviceInfo: DeviceInfo;
  timestamp: Date;
}

interface GameSessionEndedEvent {
  sessionId: string;
  playerId: string;
  duration: number; // milliseconds
  reason: SessionEndReason;
  timestamp: Date;
}

enum SessionEndReason {
  USER_QUIT = 'userQuit',
  APP_BACKGROUND = 'appBackground',
  CRASH = 'crash',
  NETWORK_ERROR = 'networkError',
  LOW_BATTERY = 'lowBattery'
}

interface DeviceInfo {
  platform: string;
  browser?: string;
  screenSize: Dimensions;
  pixelRatio: number;
  touchSupported: boolean;
  memoryInfo?: {
    total: number;
    available: number;
  };
}

interface ErrorOccurredEvent {
  error: Error | string;
  context: ErrorContext;
  severity: ErrorSeverity;
  recoverable: boolean;
  timestamp: Date;
}

enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// System event types
const SYSTEM_EVENTS = {
  SESSION_STARTED: 'system:session:started',
  SESSION_ENDED: 'system:session:ended',
  ERROR_OCCURRED: 'system:error:occurred',
  WARNING_OCCURRED: 'system:warning:occurred',
  NETWORK_STATUS_CHANGED: 'system:network:changed',
  APP_VISIBILITY_CHANGED: 'system:visibility:changed'
} as const;
```

## Event Aggregation

```typescript
// All event types consolidated
export const GAME_EVENTS = {
  ...SCENE_EVENTS,
  ...NAVIGATION_EVENTS,
  ...CURRENCY_EVENTS,
  ...UI_EVENTS,
  ...LOADING_EVENTS,
  ...SHOP_EVENTS,
  ...PERFORMANCE_EVENTS,
  ...PLAYER_EVENTS,
  ...SYSTEM_EVENTS
} as const;

// Event type union for type safety
export type GameEventType = typeof GAME_EVENTS[keyof typeof GAME_EVENTS];

// Event data union for type safety
export type GameEventData = 
  | SceneStartedEvent
  | SceneStoppedEvent
  | NavigationEvent
  | CurrencyChangedEvent
  | UIInteractionEvent
  | LoadingProgressEvent
  | ShopItemPurchasedEvent
  | PerformanceMetricsEvent
  | PlayerLevelUpEvent
  | GameSessionStartedEvent
  | ErrorOccurredEvent;
```

## Event Priority Levels

```typescript
enum EventPriority {
  CRITICAL = 0,    // System errors, crashes
  HIGH = 1,        // Performance warnings, navigation
  MEDIUM = 2,      // UI interactions, currency changes
  LOW = 3,         // Analytics, general info
  BACKGROUND = 4   // Non-essential tracking
}

interface EventMetadata {
  priority: EventPriority;
  persistent: boolean;    // Should be saved to storage
  analytic: boolean;      // Should be sent to analytics
  debug: boolean;         // Only in debug builds
}
```