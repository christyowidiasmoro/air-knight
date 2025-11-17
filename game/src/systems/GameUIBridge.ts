/**
 * GameUIBridge - State synchronization between game logic and HTML UI components
 * Provides real-time data binding and event-driven UI updates
 */

import { EventBus, GameEvents, EventHandler } from './EventBus';
import { UIUpdate, UIEventSubscription, UIError, UIValidationError } from '../types/ui';
import { UIOverlayContainer } from './UIManager';

export interface GameState {
  player: {
    health: number;
    maxHealth: number;
    score: number;
    level: number;
  };
  game: {
    isPaused: boolean;
    isGameOver: boolean;
    timeRemaining?: number;
  };
  ui: {
    activeMenu?: string;
    notifications: Array<{ id: string; message: string; type: 'info' | 'warning' | 'error' }>;
  };
}

export interface UIStateMapping {
  gameProperty: string;
  componentId: string;
  uiProperty: string;
  transformer?: (value: any) => any;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

export class GameUIBridge {
  private eventBus: EventBus;
  private uiContainer: UIOverlayContainer | null = null;
  private gameState: Partial<GameState> = {};
  private eventSubscriptions: Map<string, EventHandler[]> = new Map();
  private updateQueue: UIUpdate[] = [];
  private stateMappings: Map<string, UIStateMapping[]> = new Map();
  private isProcessingUpdates = false;
  private maxQueueSize = 100;
  private updateBatchSize = 10;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || EventBus.getInstance();
    this.initialize();
  }

  /**
   * Initialize the bridge with default event subscriptions
   */
  private initialize(): void {
    // Subscribe to game state events
    this.subscribeToEvent(GameEvents.PLAYER_SCORE_UPDATE, (data) => {
      this.updateGameState('player.score', data.score);
    });

    this.subscribeToEvent(GameEvents.GAME_PAUSE, () => {
      this.updateGameState('game.isPaused', true);
    });

    this.subscribeToEvent(GameEvents.GAME_RESUME, () => {
      this.updateGameState('game.isPaused', false);
    });

    this.subscribeToEvent(GameEvents.GAME_OVER, () => {
      this.updateGameState('game.isGameOver', true);
    });

    this.subscribeToEvent(GameEvents.GAME_START, () => {
      this.updateGameState('game.isGameOver', false);
      this.updateGameState('game.isPaused', false);
    });
  }

  /**
   * Connect the bridge to a UI container
   */
  public connectUIContainer(container: UIOverlayContainer): void {
    if (this.uiContainer) {
      throw new UIError('UI container already connected', 'BRIDGE_ALREADY_CONNECTED');
    }
    this.uiContainer = container;
  }

  /**
   * Disconnect from the current UI container
   */
  public disconnectUIContainer(): void {
    this.uiContainer = null;
    this.clearAllMappings();
  }

  /**
   * Subscribe to a game event for UI updates
   */
  public subscribeToEvent(eventName: string, handler: EventHandler): void {
    if (!this.eventSubscriptions.has(eventName)) {
      this.eventSubscriptions.set(eventName, []);
    }
    
    this.eventSubscriptions.get(eventName)!.push(handler);
    this.eventBus.on(eventName, handler);
  }

  /**
   * Unsubscribe from a game event
   */
  public unsubscribeFromEvent(eventName: string, handler: EventHandler): void {
    const handlers = this.eventSubscriptions.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
        this.eventBus.off(eventName, handler);
      }
    }
  }

  /**
   * Map a game state property to a UI component property
   */
  public mapStateToUI(mapping: UIStateMapping): void {
    if (!this.stateMappings.has(mapping.gameProperty)) {
      this.stateMappings.set(mapping.gameProperty, []);
    }
    
    // Validate mapping
    this.validateStateMapping(mapping);
    
    this.stateMappings.get(mapping.gameProperty)!.push(mapping);
  }

  /**
   * Remove a state mapping
   */
  public removeStateMapping(gameProperty: string, componentId?: string): void {
    if (componentId) {
      const mappings = this.stateMappings.get(gameProperty);
      if (mappings) {
        const filtered = mappings.filter(m => m.componentId !== componentId);
        if (filtered.length === 0) {
          this.stateMappings.delete(gameProperty);
        } else {
          this.stateMappings.set(gameProperty, filtered);
        }
      }
    } else {
      this.stateMappings.delete(gameProperty);
    }
  }

  /**
   * Clear all state mappings
   */
  public clearAllMappings(): void {
    this.stateMappings.clear();
  }

  /**
   * Update game state and trigger UI updates
   */
  public updateGameState(property: string, value: any): void {
    try {
      // Update internal state
      this.setNestedProperty(this.gameState, property, value);
      
      // Queue UI updates for mapped components
      const mappings = this.stateMappings.get(property);
      if (mappings) {
        for (const mapping of mappings) {
          this.queueUIUpdate(mapping, value);
        }
      }
      
      // Emit state change event
      this.eventBus.emit('bridge:state:updated', {
        property,
        value,
        timestamp: Date.now()
      });
    } catch (error) {
      this.handleError(new UIError(
        `Failed to update game state property '${property}'`,
        'STATE_UPDATE_ERROR'
      ));
    }
  }

  /**
   * Get current game state
   */
  public getGameState(): Partial<GameState> {
    return { ...this.gameState };
  }

  /**
   * Get specific state property value
   */
  public getStateProperty(property: string): any {
    return this.getNestedProperty(this.gameState, property);
  }

  /**
   * Queue a UI update for batch processing
   */
  private queueUIUpdate(mapping: UIStateMapping, value: any): void {
    try {
      // Validate the value if validator is provided
      if (mapping.validator && !mapping.validator(value)) {
        throw new UIValidationError(
          mapping.uiProperty,
          mapping.errorMessage || 'Value validation failed',
          mapping.componentId
        );
      }

      // Transform value if transformer is provided
      const transformedValue = mapping.transformer ? mapping.transformer(value) : value;

      const update: UIUpdate = {
        componentId: mapping.componentId,
        property: mapping.uiProperty,
        value: transformedValue,
        timestamp: Date.now(),
        priority: 'normal'
      };

      // Check queue size limit
      if (this.updateQueue.length >= this.maxQueueSize) {
        // Remove oldest low-priority updates to make room
        this.updateQueue = this.updateQueue.filter(u => u.priority !== 'low');
        
        if (this.updateQueue.length >= this.maxQueueSize) {
          console.warn('UI update queue is full, dropping oldest update');
          this.updateQueue.shift();
        }
      }

      this.updateQueue.push(update);
      
      // Process updates if not already processing
      if (!this.isProcessingUpdates) {
        this.processUpdateQueue();
      }
    } catch (error) {
      this.handleError(error instanceof UIError ? error : new UIError(
        `Failed to queue UI update for component '${mapping.componentId}'`,
        'UPDATE_QUEUE_ERROR',
        mapping.componentId
      ));
    }
  }

  /**
   * Process queued UI updates in batches
   */
  private async processUpdateQueue(): Promise<void> {
    if (this.isProcessingUpdates || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessingUpdates = true;

    try {
      while (this.updateQueue.length > 0) {
        // Process updates in batches
        const batch = this.updateQueue.splice(0, this.updateBatchSize);
        
        for (const update of batch) {
          await this.applyUIUpdate(update);
        }

        // Yield control to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } catch (error) {
      this.handleError(new UIError(
        'Error processing UI update queue',
        'QUEUE_PROCESSING_ERROR'
      ));
    } finally {
      this.isProcessingUpdates = false;
    }
  }

  /**
   * Apply a single UI update to the target component
   */
  private async applyUIUpdate(update: UIUpdate): Promise<void> {
    if (!this.uiContainer) {
      console.warn('No UI container connected, skipping update');
      return;
    }

    try {
      const component = this.uiContainer.getComponent(update.componentId);
      if (!component) {
        console.warn(`Component '${update.componentId}' not found, skipping update`);
        return;
      }

      // Apply the update to the component
      if (update.property in component) {
        (component as any)[update.property] = update.value;
      } else {
        // Try to set as attribute or style
        if (update.property.startsWith('style.')) {
          const styleProp = update.property.substring(6);
          (component.element.style as any)[styleProp] = update.value;
        } else if (update.property.startsWith('attr.')) {
          const attrName = update.property.substring(5);
          component.element.setAttribute(attrName, String(update.value));
        } else {
          console.warn(`Unknown property '${update.property}' for component '${update.componentId}'`);
        }
      }

      // Emit update applied event
      this.eventBus.emit('bridge:ui:updated', {
        componentId: update.componentId,
        property: update.property,
        value: update.value,
        timestamp: update.timestamp
      });
    } catch (error) {
      this.handleError(new UIError(
        `Failed to apply update to component '${update.componentId}'`,
        'UPDATE_APPLICATION_ERROR',
        update.componentId
      ));
    }
  }

  /**
   * Validate a state mapping configuration
   */
  private validateStateMapping(mapping: UIStateMapping): void {
    if (!mapping.gameProperty) {
      throw new UIValidationError('gameProperty', 'Game property is required');
    }
    
    if (!mapping.componentId) {
      throw new UIValidationError('componentId', 'Component ID is required');
    }
    
    if (!mapping.uiProperty) {
      throw new UIValidationError('uiProperty', 'UI property is required');
    }
  }

  /**
   * Set nested property using dot notation
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (key && !(key in current)) {
        current[key] = {};
      }
      if (key) {
        current = current[key];
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
  }

  /**
   * Get nested property using dot notation
   */
  private getNestedProperty(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Handle and log errors
   */
  private handleError(error: Error): void {
    console.error('GameUIBridge Error:', error);
    
    this.eventBus.emit('bridge:error', {
      error,
      timestamp: Date.now()
    });
  }

  /**
   * Cleanup all subscriptions and state
   */
  public destroy(): void {
    // Unsubscribe from all events
    for (const [eventName, handlers] of this.eventSubscriptions.entries()) {
      for (const handler of handlers) {
        this.eventBus.off(eventName, handler);
      }
    }
    
    this.eventSubscriptions.clear();
    this.stateMappings.clear();
    this.updateQueue.length = 0;
    this.uiContainer = null;
    this.gameState = {};
  }

  /**
   * Get current queue size for monitoring
   */
  public getQueueSize(): number {
    return this.updateQueue.length;
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): { queueSize: number; mappingCount: number; subscriptionCount: number } {
    return {
      queueSize: this.updateQueue.length,
      mappingCount: Array.from(this.stateMappings.values()).reduce((total, mappings) => total + mappings.length, 0),
      subscriptionCount: Array.from(this.eventSubscriptions.values()).reduce((total, handlers) => total + handlers.length, 0)
    };
  }
}