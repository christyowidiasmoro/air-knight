/**
 * InputHandler - Manages event routing between HTML UI elements and Phaser canvas
 * Provides proper event delegation and touch/mouse input coordination
 */

import { IUIOverlayContainer } from './UIManager';
import { InputEventType, UIEventTarget } from '../types/ui';

/**
 * Interface for the InputHandler system
 */
export interface IInputHandler {
  readonly canvas: HTMLCanvasElement;
  readonly uiContainer: IUIOverlayContainer;
  readonly activeElement: HTMLElement | null;
  readonly eventMappings: ReadonlyMap<string, UIEventTarget>;
  
  // Event Routing
  setEventRouting(
    eventType: InputEventType, 
    target: UIEventTarget, 
    priority: 'ui-first' | 'canvas-first'
  ): void;
  
  removeEventRouting(eventType: InputEventType): void;
  
  // Touch/Mouse Handling
  handlePointerEvent(event: PointerEvent): boolean; // Returns true if handled by UI
  handleKeyboardEvent(event: KeyboardEvent): boolean;
  
  // Focus Management
  setFocus(element: HTMLElement): void;
  clearFocus(): void;
  
  // Accessibility
  enableKeyboardNavigation(): void;
  disableKeyboardNavigation(): void;
  
  // Lifecycle
  initialize(): void;
  destroy(): void;
}

/**
 * Event routing configuration
 */
interface EventRouting {
  target: UIEventTarget;
  priority: 'ui-first' | 'canvas-first';
  handler: (event: Event) => boolean;
}

/**
 * InputHandler implementation
 * Coordinates input events between UI overlay and Phaser canvas
 */
export class InputHandler implements IInputHandler {
  private _canvas: HTMLCanvasElement;
  private _uiContainer: IUIOverlayContainer;
  private _activeElement: HTMLElement | null = null;
  private _eventMappings: Map<string, EventRouting> = new Map();
  private _isInitialized: boolean = false;
  private _keyboardNavigationEnabled: boolean = false;
  private _boundHandlers: Map<string, EventListener> = new Map();

  constructor(canvas: HTMLCanvasElement, uiContainer: IUIOverlayContainer) {
    this._canvas = canvas;
    this._uiContainer = uiContainer;
  }

  // Getters for readonly properties
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get uiContainer(): IUIOverlayContainer {
    return this._uiContainer;
  }

  get activeElement(): HTMLElement | null {
    return this._activeElement;
  }

  get eventMappings(): ReadonlyMap<string, UIEventTarget> {
    const simpleMap = new Map<string, UIEventTarget>();
    for (const [eventType, routing] of this._eventMappings) {
      simpleMap.set(eventType, routing.target);
    }
    return simpleMap;
  }

  /**
   * Initialize the input handler
   */
  initialize(): void {
    if (this._isInitialized) {
      throw new Error('InputHandler already initialized');
    }

    this.setupDefaultEventRouting();
    this.bindEventListeners();
    this._isInitialized = true;
  }

  /**
   * Set event routing configuration
   */
  setEventRouting(
    eventType: InputEventType,
    target: UIEventTarget,
    priority: 'ui-first' | 'canvas-first'
  ): void {
    const handler = this.createEventHandler(eventType, target, priority);
    
    this._eventMappings.set(eventType, {
      target,
      priority,
      handler
    });

    // Rebind event listeners if already initialized
    if (this._isInitialized) {
      this.rebindEventListener(eventType);
    }
  }

  /**
   * Remove event routing for a specific event type
   */
  removeEventRouting(eventType: InputEventType): void {
    if (this._eventMappings.has(eventType)) {
      this.unbindEventListener(eventType);
      this._eventMappings.delete(eventType);
    }
  }

  /**
   * Handle pointer events (mouse, touch)
   */
  handlePointerEvent(event: PointerEvent): boolean {
    const eventType = this.mapPointerEventType(event.type);
    const routing = this._eventMappings.get(eventType);
    
    if (!routing) {
      return false;
    }

    return routing.handler(event);
  }

  /**
   * Handle keyboard events
   */
  handleKeyboardEvent(event: KeyboardEvent): boolean {
    if (!this._keyboardNavigationEnabled) {
      return false;
    }

    const routing = this._eventMappings.get('keyboard');
    if (!routing) {
      return false;
    }

    // Handle navigation keys
    if (this.isNavigationKey(event.key)) {
      return this.handleNavigationKey(event);
    }

    return routing.handler(event);
  }

  /**
   * Set focus to a specific UI element
   */
  setFocus(element: HTMLElement): void {
    if (this._activeElement) {
      this._activeElement.blur();
    }

    this._activeElement = element;
    element.focus();
  }

  /**
   * Clear current focus
   */
  clearFocus(): void {
    if (this._activeElement) {
      this._activeElement.blur();
      this._activeElement = null;
    }
  }

  /**
   * Enable keyboard navigation
   */
  enableKeyboardNavigation(): void {
    this._keyboardNavigationEnabled = true;
    
    // Add keyboard event routing if not present
    if (!this._eventMappings.has('keyboard')) {
      this.setEventRouting('keyboard', 'ui', 'ui-first');
    }
  }

  /**
   * Disable keyboard navigation
   */
  disableKeyboardNavigation(): void {
    this._keyboardNavigationEnabled = false;
    this.clearFocus();
  }

  /**
   * Destroy the input handler and clean up
   */
  destroy(): void {
    this.unbindAllEventListeners();
    this._eventMappings.clear();
    this._boundHandlers.clear();
    this._activeElement = null;
    this._isInitialized = false;
  }

  /**
   * Setup default event routing configuration
   */
  private setupDefaultEventRouting(): void {
    // Default routing: UI elements get priority for interactive events
    this.setEventRouting('click', 'both', 'ui-first');
    this.setEventRouting('touch', 'both', 'ui-first');
    this.setEventRouting('hover', 'both', 'ui-first');
    this.setEventRouting('focus', 'ui', 'ui-first');
    this.setEventRouting('scroll', 'both', 'canvas-first');
  }

  /**
   * Bind event listeners to appropriate targets
   */
  private bindEventListeners(): void {
    for (const [eventType] of this._eventMappings) {
      this.bindEventListener(eventType);
    }
  }

  /**
   * Bind a specific event listener
   */
  private bindEventListener(eventType: string): void {
    const routing = this._eventMappings.get(eventType);
    if (!routing) return;

    const domEventType = this.mapToDOMEventType(eventType);
    const boundHandler = (event: Event) => routing.handler(event);
    
    this._boundHandlers.set(eventType, boundHandler);

    // Attach to appropriate target based on routing configuration
    if (routing.target === 'ui' || routing.target === 'both') {
      this._uiContainer.element.addEventListener(domEventType, boundHandler, true);
    }
    
    if (routing.target === 'canvas' || routing.target === 'both') {
      this._canvas.addEventListener(domEventType, boundHandler, true);
    }

    // Also attach to document for keyboard events
    if (eventType === 'keyboard') {
      document.addEventListener('keydown', boundHandler, true);
      document.addEventListener('keyup', boundHandler, true);
    }
  }

  /**
   * Rebind a specific event listener
   */
  private rebindEventListener(eventType: string): void {
    this.unbindEventListener(eventType);
    this.bindEventListener(eventType);
  }

  /**
   * Unbind a specific event listener
   */
  private unbindEventListener(eventType: string): void {
    const boundHandler = this._boundHandlers.get(eventType);
    if (!boundHandler) return;

    const domEventType = this.mapToDOMEventType(eventType);
    
    this._uiContainer.element.removeEventListener(domEventType, boundHandler, true);
    this._canvas.removeEventListener(domEventType, boundHandler, true);
    
    if (eventType === 'keyboard') {
      document.removeEventListener('keydown', boundHandler, true);
      document.removeEventListener('keyup', boundHandler, true);
    }

    this._boundHandlers.delete(eventType);
  }

  /**
   * Unbind all event listeners
   */
  private unbindAllEventListeners(): void {
    for (const eventType of this._eventMappings.keys()) {
      this.unbindEventListener(eventType);
    }
  }

  /**
   * Create event handler for specific routing configuration
   */
  private createEventHandler(
    eventType: InputEventType,
    target: UIEventTarget,
    priority: 'ui-first' | 'canvas-first'
  ): (event: Event) => boolean {
    return (event: Event): boolean => {
      const uiElement = this.findUIElement(event.target as Element);
      const isUIEvent = !!uiElement;

      if (priority === 'ui-first') {
        if (isUIEvent) {
          // UI element should handle this event
          return true;
        } else if (target === 'both' || target === 'canvas') {
          // Allow canvas to handle the event
          return false;
        }
      } else { // canvas-first
        if (target === 'canvas' || target === 'both') {
          // Check if this should be handled by canvas first
          if (!isUIEvent || !this.isInteractiveUIElement(uiElement)) {
            return false; // Let canvas handle it
          }
        }
        
        if (isUIEvent && target !== 'canvas') {
          return true; // UI handles it
        }
      }

      return false;
    };
  }

  /**
   * Find UI element in the event target chain
   */
  private findUIElement(target: Element | null): HTMLElement | null {
    let current = target;
    
    while (current && current !== this._uiContainer.element) {
      if (current.parentElement === this._uiContainer.element) {
        return current as HTMLElement;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  /**
   * Check if element is interactive
   */
  private isInteractiveUIElement(element: HTMLElement | null): boolean {
    if (!element) return false;
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.pointerEvents !== 'none' && 
           element.classList.contains('ui-interactive');
  }

  /**
   * Map pointer event type to our event type
   */
  private mapPointerEventType(pointerEventType: string): InputEventType {
    switch (pointerEventType) {
      case 'pointerdown':
      case 'pointerup':
      case 'click':
        return 'click';
      case 'touchstart':
      case 'touchend':
        return 'touch';
      case 'pointerenter':
      case 'pointerleave':
      case 'mouseover':
      case 'mouseout':
        return 'hover';
      default:
        return 'click';
    }
  }

  /**
   * Map our event types to DOM event types
   */
  private mapToDOMEventType(eventType: string): string {
    switch (eventType) {
      case 'click':
        return 'click';
      case 'touch':
        return 'touchstart';
      case 'hover':
        return 'mouseover';
      case 'focus':
        return 'focus';
      case 'scroll':
        return 'scroll';
      case 'keyboard':
        return 'keydown';
      default:
        return eventType;
    }
  }

  /**
   * Check if key is a navigation key
   */
  private isNavigationKey(key: string): boolean {
    return ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space'].includes(key);
  }

  /**
   * Handle navigation key events
   */
  private handleNavigationKey(event: KeyboardEvent): boolean {
    if (!this._keyboardNavigationEnabled) {
      return false;
    }

    switch (event.key) {
      case 'Tab':
        return this.handleTabNavigation(event);
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        return this.handleArrowNavigation(event);
      case 'Enter':
      case ' ':
        return this.handleActivation(event);
      default:
        return false;
    }
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(event: KeyboardEvent): boolean {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return false;

    const currentIndex = this._activeElement ? 
      focusableElements.indexOf(this._activeElement) : -1;
    
    let nextIndex: number;
    if (event.shiftKey) {
      nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
    }

    this.setFocus(focusableElements[nextIndex]!);
    event.preventDefault();
    return true;
  }

  /**
   * Handle arrow key navigation
   */
  private handleArrowNavigation(event: KeyboardEvent): boolean {
    // Basic implementation - can be enhanced for spatial navigation
    return this.handleTabNavigation(event);
  }

  /**
   * Handle activation keys (Enter, Space)
   */
  private handleActivation(event: KeyboardEvent): boolean {
    if (this._activeElement) {
      // Trigger click event on the active element
      this._activeElement.click();
      event.preventDefault();
      return true;
    }
    return false;
  }

  /**
   * Get all focusable elements in the UI
   */
  private getFocusableElements(): HTMLElement[] {
    const selector = '[tabindex]:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';
    const elements = this._uiContainer.element.querySelectorAll(selector);
    
    return Array.from(elements)
      .filter(el => {
        const style = window.getComputedStyle(el as HTMLElement);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }) as HTMLElement[];
  }
}