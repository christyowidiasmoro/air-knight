/**
 * EventBus system for scene and component communication
 */

export type EventHandler<T = any> = (data: T) => void;

export class EventBus {
  private static instance: EventBus;
  private events: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   */
  public on<T = any>(event: string, handler: EventHandler<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from an event
   */
  public off<T = any>(event: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emit an event
   */
  public emit<T = any>(event: string, data?: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get number of listeners for an event
   */
  public listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

// Common event types
export const GameEvents = {
  // Scene events
  SCENE_TRANSITION_START: 'scene:transition:start',
  SCENE_TRANSITION_COMPLETE: 'scene:transition:complete',
  
  // Game state events
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  GAME_OVER_TIMEOUT: 'game:over:timeout',
  
  // Player events
  PLAYER_SCORE_UPDATE: 'player:score:update',
  PLAYER_LEVEL_UP: 'player:level:up',
  
  // UI events
  UI_MODAL_OPEN: 'ui:modal:open',
  UI_MODAL_CLOSE: 'ui:modal:close',
  
  // Network events
  NETWORK_CONNECTED: 'network:connected',
  NETWORK_DISCONNECTED: 'network:disconnected',
  
  // Orientation events
  ORIENTATION_CHANGED: 'orientation:changed'
} as const;