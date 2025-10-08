/**
 * Event Bus System - Centralized event management
 * Following Modular Game Architecture principle
 */

import type { EventHandler, EventBus as IEventBus } from '@/types';

export class EventBus implements IEventBus {
  private listeners = new Map<string, Set<EventHandler>>();
  private onceListeners = new Map<string, Set<EventHandler>>();

  /**
   * Subscribe to an event
   */
  subscribe<T>(event: string, handler: EventHandler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler);
  }

  /**
   * Subscribe to an event that fires only once
   */
  once<T>(event: string, handler: EventHandler<T>): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(handler as EventHandler);
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe<T>(event: string, handler: EventHandler<T>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(handler as EventHandler);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.delete(handler as EventHandler);
      if (onceListeners.size === 0) {
        this.onceListeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T>(event: string, data?: T): void {
    // Handle regular listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    // Handle once listeners
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in once event handler for ${event}:`, error);
        }
      });
      this.onceListeners.delete(event);
    }
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }

  /**
   * Get number of listeners for an event
   */
  getListenerCount(event: string): number {
    const regular = this.listeners.get(event)?.size ?? 0;
    const once = this.onceListeners.get(event)?.size ?? 0;
    return regular + once;
  }

  /**
   * Get all registered events
   */
  getEvents(): string[] {
    const events = new Set<string>();
    this.listeners.forEach((_, event) => events.add(event));
    this.onceListeners.forEach((_, event) => events.add(event));
    return Array.from(events);
  }
}

// Global event bus instance
export const eventBus = new EventBus();

// Common game events
export const GAME_EVENTS = {
  SCENE_CHANGE: 'scene:change',
  SCENE_READY: 'scene:ready',
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  ENTITY_CREATED: 'entity:created',
  ENTITY_DESTROYED: 'entity:destroyed',
  INPUT_TOUCH_START: 'input:touch:start',
  INPUT_TOUCH_END: 'input:touch:end',
  INPUT_TOUCH_MOVE: 'input:touch:move',
  INPUT_KEY_DOWN: 'input:key:down',
  INPUT_KEY_UP: 'input:key:up',
  ASSET_LOAD_START: 'asset:load:start',
  ASSET_LOAD_COMPLETE: 'asset:load:complete',
  ASSET_LOAD_ERROR: 'asset:load:error',
  PERFORMANCE_WARNING: 'performance:warning',
  ERROR: 'error',
} as const;

export type GameEventType = keyof typeof GAME_EVENTS;