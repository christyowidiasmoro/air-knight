/**
 * Event Bus System - Centralized event management
 * Following Modular Game Architecture principle
 */

import type { EventHandler } from '../types/GameTypes';

export interface IEventBus {
  subscribe<T>(event: string, handler: EventHandler<T>): void;
  once<T>(event: string, handler: EventHandler<T>): void;
  unsubscribe<T>(event: string, handler: EventHandler<T>): void;
  emit<T>(event: string, data?: T): void;
  clear(): void;
  getListenerCount(event: string): number;
  getEvents(): string[];
}

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
