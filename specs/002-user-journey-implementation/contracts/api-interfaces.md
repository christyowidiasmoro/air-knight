# Scene Management API Contracts

**Feature**: 002-user-journey-implementation  
**Date**: October 9, 2025  
**Purpose**: Define internal API contracts for scene management, navigation, and system interactions

## Scene Manager Interface

```typescript
interface ISceneManager {
  /**
   * Initialize the scene manager with game instance
   * @param game - Phaser game instance
   */
  initialize(game: Phaser.Game): void;

  /**
   * Start a scene with optional data
   * @param sceneKey - Scene identifier
   * @param data - Optional data to pass to scene
   * @returns Promise that resolves when scene is started
   */
  startScene(sceneKey: string, data?: any): Promise<void>;

  /**
   * Transition between scenes with animation
   * @param fromScene - Current scene key
   * @param toScene - Target scene key
   * @param transition - Transition configuration
   * @param data - Optional data for target scene
   * @returns Promise that resolves when transition completes
   */
  transitionTo(
    fromScene: string, 
    toScene: string, 
    transition: SceneTransition,
    data?: any
  ): Promise<void>;

  /**
   * Get current active scene
   * @returns Current scene instance or null
   */
  getCurrentScene(): Phaser.Scene | null;

  /**
   * Check if a scene is currently running
   * @param sceneKey - Scene identifier
   * @returns True if scene is active
   */
  isSceneActive(sceneKey: string): boolean;

  /**
   * Pause a scene
   * @param sceneKey - Scene identifier
   */
  pauseScene(sceneKey: string): void;

  /**
   * Resume a paused scene
   * @param sceneKey - Scene identifier
   */
  resumeScene(sceneKey: string): void;

  /**
   * Stop and destroy a scene
   * @param sceneKey - Scene identifier
   */
  stopScene(sceneKey: string): void;

  /**
   * Get scene transition progress (0-1)
   * @returns Current transition progress
   */
  getTransitionProgress(): number;

  /**
   * Check if scene manager is currently transitioning
   * @returns True if transition in progress
   */
  isTransitioning(): boolean;
}
```

## Navigation System Interface

```typescript
interface INavigationSystem {
  /**
   * Initialize navigation system
   * @param config - Navigation configuration
   */
  initialize(config: NavigationConfig): void;

  /**
   * Navigate to a specific section
   * @param section - Target navigation section
   * @param data - Optional navigation data
   * @param addToHistory - Whether to add to navigation history
   * @returns Promise that resolves when navigation completes
   */
  navigateTo(
    section: NavigationSection, 
    data?: NavigationData,
    addToHistory?: boolean
  ): Promise<void>;

  /**
   * Navigate back to previous section
   * @returns Promise that resolves when navigation completes, or rejects if no history
   */
  navigateBack(): Promise<void>;

  /**
   * Get current navigation state
   * @returns Current navigation state
   */
  getCurrentState(): NavigationState;

  /**
   * Get navigation history
   * @returns Array of navigation history entries
   */
  getHistory(): NavigationHistoryEntry[];

  /**
   * Clear navigation history
   */
  clearHistory(): void;

  /**
   * Check if back navigation is available
   * @returns True if can navigate back
   */
  canNavigateBack(): boolean;

  /**
   * Subscribe to navigation state changes
   * @param callback - Function called when navigation state changes
   * @returns Unsubscribe function
   */
  onStateChange(callback: (state: NavigationState) => void): () => void;

  /**
   * Set navigation enabled/disabled state
   * @param enabled - Whether navigation is enabled
   */
  setEnabled(enabled: boolean): void;
}
```

## Currency System Interface

```typescript
interface ICurrencySystem {
  /**
   * Initialize currency system with player data
   * @param playerData - Initial player profile
   */
  initialize(playerData: PlayerProfile): void;

  /**
   * Get current currency balances
   * @returns Current currency balances
   */
  getBalances(): CurrencyBalances;

  /**
   * Get specific currency balance
   * @param type - Currency type
   * @returns Current balance for specified currency
   */
  getBalance(type: CurrencyType): number;

  /**
   * Add currency amount
   * @param type - Currency type
   * @param amount - Amount to add (must be positive)
   * @param source - Source of the currency (for logging)
   * @returns Promise that resolves with new balance
   */
  addCurrency(type: CurrencyType, amount: number, source: string): Promise<number>;

  /**
   * Spend currency amount
   * @param type - Currency type
   * @param amount - Amount to spend (must be positive)
   * @param purpose - Purpose of spending (for logging)
   * @returns Promise that resolves with new balance or rejects if insufficient funds
   */
  spendCurrency(type: CurrencyType, amount: number, purpose: string): Promise<number>;

  /**
   * Check if player has sufficient currency for a transaction
   * @param costs - Array of currency costs
   * @returns True if player can afford all costs
   */
  canAfford(costs: CurrencyPrice[]): boolean;

  /**
   * Process a multi-currency transaction
   * @param costs - Array of currency costs
   * @param purpose - Purpose of transaction
   * @returns Promise that resolves when transaction completes
   */
  processTransaction(costs: CurrencyPrice[], purpose: string): Promise<void>;

  /**
   * Update energy based on time passage
   * @returns New energy amount
   */
  updateEnergy(): number;

  /**
   * Subscribe to currency balance changes
   * @param callback - Function called when balances change
   * @returns Unsubscribe function
   */
  onBalanceChange(callback: (balances: CurrencyBalances) => void): () => void;

  /**
   * Save currency state to persistence layer
   * @returns Promise that resolves when save completes
   */
  save(): Promise<void>;
}
```

## UI System Interface

```typescript
interface IUISystem {
  /**
   * Initialize UI system
   * @param scene - Phaser scene instance
   * @param config - UI configuration
   */
  initialize(scene: Phaser.Scene, config: UIConfig): void;

  /**
   * Create UI component
   * @param type - Component type
   * @param config - Component configuration
   * @param parent - Optional parent component
   * @returns Created component instance
   */
  createComponent<T extends UIComponent>(
    type: UIComponentType,
    config: Partial<T>,
    parent?: UIComponent
  ): T;

  /**
   * Update component properties
   * @param componentId - Component identifier
   * @param updates - Properties to update
   */
  updateComponent(componentId: string, updates: Partial<UIComponent>): void;

  /**
   * Remove component and cleanup
   * @param componentId - Component identifier
   */
  removeComponent(componentId: string): void;

  /**
   * Get component by ID
   * @param componentId - Component identifier
   * @returns Component instance or null
   */
  getComponent(componentId: string): UIComponent | null;

  /**
   * Update UI layout for screen size changes
   * @param dimensions - New screen dimensions
   */
  updateLayout(dimensions: Dimensions): void;

  /**
   * Show modal dialog
   * @param config - Modal configuration
   * @returns Promise that resolves when modal is closed
   */
  showModal(config: ModalConfig): Promise<any>;

  /**
   * Hide current modal
   */
  hideModal(): void;

  /**
   * Show notification
   * @param notification - Notification configuration
   */
  showNotification(notification: Notification): void;

  /**
   * Set UI theme
   * @param theme - UI theme
   */
  setTheme(theme: UITheme): void;

  /**
   * Get current UI scale factor
   * @returns Current scale factor
   */
  getScale(): number;
}
```

## Loading System Interface

```typescript
interface ILoadingSystem {
  /**
   * Initialize loading system
   * @param scene - Phaser scene instance
   */
  initialize(scene: Phaser.Scene): void;

  /**
   * Start loading assets with progress tracking
   * @param assets - Array of assets to load
   * @param onProgress - Progress callback function
   * @returns Promise that resolves when all assets loaded
   */
  loadAssets(
    assets: AssetDefinition[],
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<void>;

  /**
   * Preload critical assets required for initial UI
   * @returns Promise that resolves when critical assets loaded
   */
  preloadCriticalAssets(): Promise<void>;

  /**
   * Get current loading progress
   * @returns Current loading progress
   */
  getProgress(): LoadingProgress;

  /**
   * Check if all assets are loaded
   * @returns True if loading complete
   */
  isComplete(): boolean;

  /**
   * Retry failed asset loading
   * @param failedAssets - Array of failed asset keys
   * @returns Promise that resolves when retry completes
   */
  retryFailedAssets(failedAssets: string[]): Promise<void>;

  /**
   * Cancel current loading operation
   */
  cancelLoading(): void;

  /**
   * Get loading statistics
   * @returns Loading performance statistics
   */
  getStats(): LoadingStats;
}

interface AssetDefinition {
  key: string;
  type: string;
  url: string;
  config?: any;
  priority: AssetPriority;
  critical: boolean;
}

enum AssetPriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

interface LoadingStats {
  totalAssets: number;
  loadedAssets: number;
  failedAssets: number;
  totalSize: number;
  loadedSize: number;
  averageSpeed: number; // bytes per second
  elapsedTime: number; // milliseconds
}
```

## Shop System Interface

```typescript
interface IShopSystem {
  /**
   * Initialize shop system
   * @param playerData - Current player profile
   */
  initialize(playerData: PlayerProfile): void;

  /**
   * Get available shop items
   * @param category - Optional category filter
   * @returns Array of available shop items
   */
  getItems(category?: ShopCategory): ShopItem[];

  /**
   * Get shop categories
   * @returns Array of available categories
   */
  getCategories(): ShopCategory[];

  /**
   * Purchase shop item
   * @param itemId - Item identifier
   * @param quantity - Quantity to purchase
   * @returns Promise that resolves with transaction result
   */
  purchaseItem(itemId: string, quantity: number): Promise<ShopTransaction>;

  /**
   * Check if item can be purchased
   * @param itemId - Item identifier
   * @param quantity - Quantity to check
   * @returns True if item can be purchased
   */
  canPurchase(itemId: string, quantity: number): boolean;

  /**
   * Get purchase requirements for item
   * @param itemId - Item identifier
   * @returns Array of purchase requirements
   */
  getRequirements(itemId: string): PurchaseRequirement[];

  /**
   * Add item to cart
   * @param itemId - Item identifier
   * @param quantity - Quantity to add
   */
  addToCart(itemId: string, quantity: number): void;

  /**
   * Remove item from cart
   * @param itemId - Item identifier
   */
  removeFromCart(itemId: string): void;

  /**
   * Get current cart contents
   * @returns Array of items in cart
   */
  getCart(): ShopItem[];

  /**
   * Calculate cart total cost
   * @returns Total cost breakdown by currency
   */
  getCartTotal(): CurrencyPrice[];

  /**
   * Purchase all items in cart
   * @returns Promise that resolves when purchase completes
   */
  purchaseCart(): Promise<ShopTransaction[]>;

  /**
   * Clear cart contents
   */
  clearCart(): void;

  /**
   * Subscribe to shop state changes
   * @param callback - Function called when shop state changes
   * @returns Unsubscribe function
   */
  onStateChange(callback: (state: ShopState) => void): () => void;
}
```

## Event System Interface

```typescript
interface IEventSystem {
  /**
   * Subscribe to event
   * @param eventType - Event type identifier
   * @param callback - Event handler function
   * @param context - Optional context for callback
   * @returns Unsubscribe function
   */
  on<T = any>(
    eventType: string,
    callback: (data: T) => void,
    context?: any
  ): () => void;

  /**
   * Subscribe to event once (auto-unsubscribe after first call)
   * @param eventType - Event type identifier
   * @param callback - Event handler function
   * @param context - Optional context for callback
   * @returns Unsubscribe function
   */
  once<T = any>(
    eventType: string,
    callback: (data: T) => void,
    context?: any
  ): () => void;

  /**
   * Emit event to all subscribers
   * @param eventType - Event type identifier
   * @param data - Event data
   */
  emit<T = any>(eventType: string, data?: T): void;

  /**
   * Remove all listeners for event type
   * @param eventType - Event type identifier
   */
  off(eventType: string): void;

  /**
   * Remove all listeners
   */
  clear(): void;

  /**
   * Get number of listeners for event type
   * @param eventType - Event type identifier
   * @returns Number of active listeners
   */
  listenerCount(eventType: string): number;
}
```

## Error Handling Interface

```typescript
interface IErrorHandler {
  /**
   * Handle error with context
   * @param error - Error instance or message
   * @param context - Error context information
   * @param recoverable - Whether error is recoverable
   */
  handleError(error: Error | string, context: ErrorContext, recoverable: boolean): void;

  /**
   * Log warning message
   * @param message - Warning message
   * @param context - Optional context data
   */
  warn(message: string, context?: any): void;

  /**
   * Log info message
   * @param message - Info message
   * @param context - Optional context data
   */
  info(message: string, context?: any): void;

  /**
   * Set error recovery strategy
   * @param strategy - Error recovery function
   */
  setRecoveryStrategy(strategy: (error: Error, context: ErrorContext) => void): void;

  /**
   * Get error statistics
   * @returns Error occurrence statistics
   */
  getStats(): ErrorStats;
}

interface ErrorContext {
  scene?: string;
  component?: string;
  action?: string;
  timestamp: Date;
  playerData?: Partial<PlayerProfile>;
  gameState?: Partial<GameState>;
}

interface ErrorStats {
  totalErrors: number;
  recoverableErrors: number;
  criticalErrors: number;
  lastError?: Date;
  commonErrors: Record<string, number>;
}
```