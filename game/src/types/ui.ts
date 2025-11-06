/**
 * Core UI type definitions for HTML UI Integration
 * Provides foundational types for position, size, and component interfaces
 */

export type UIAnchor = 'px' | '%';
export type UIOrigin = 'top-left' | 'center' | 'bottom-right' | 'top-center' | 'bottom-center' | 'center-left' | 'center-right';
export type InputEventType = 'click' | 'touch' | 'keyboard' | 'hover' | 'focus' | 'scroll';
export type UIEventTarget = 'ui' | 'canvas' | 'both';
export type PerformanceMode = 'high' | 'balanced' | 'low';

/**
 * Represents position coordinates with flexible anchor system
 */
export interface UIPosition {
  x: number;
  y: number;
  anchor: UIAnchor;
  origin: UIOrigin;
}

/**
 * Represents component dimensions in pixels
 */
export interface UISize {
  width: number;
  height: number;
}

/**
 * Responsive design breakpoint definition
 */
export interface UIBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

/**
 * Scheduled UI update for performance optimization
 */
export interface UIUpdate {
  componentId: string;
  property: string;
  value: any;
  timestamp: number;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * Event subscription configuration for game state synchronization
 */
export interface UIEventSubscription {
  eventName: string;
  componentId: string;
  updateProperty: string;
  transformer?: (data: any) => any;
  isActive: boolean;
}

/**
 * Base interface for all UI components
 */
export interface IUIComponent {
  readonly id: string;
  readonly element: HTMLElement;
  isVisible: boolean;
  isInteractive: boolean;
  position: UIPosition;
  size: UISize;
  className?: string | undefined;
  attributes?: Record<string, string> | undefined;
  
  // Lifecycle methods
  mount(container: HTMLElement): void;
  unmount(): void;
  
  // State management
  show(): void;
  hide(): void;
  setInteractive(interactive: boolean): void;
  updatePosition(position: Partial<UIPosition>): void;
  updateSize(size: Partial<UISize>): void;
  
  // Event handling
  addEventListener(event: string, handler: EventListener): void;
  removeEventListener(event: string, handler: EventListener): void;
  
  // Cleanup
  destroy(): void;
}

/**
 * Configuration for creating UI components
 */
export interface UIComponentConfig {
  id: string;
  tagName?: string;
  className?: string;
  attributes?: Record<string, string>;
  position: UIPosition;
  size: UISize;
  isVisible?: boolean;
  isInteractive?: boolean;
  children?: UIComponentConfig[];
}

/**
 * Configuration for initializing the UI overlay system
 */
export interface UIOverlayConfig {
  canvas: HTMLCanvasElement;
  zIndex?: number;
  className?: string;
  enableKeyboardNavigation?: boolean;
  enableTouchOptimization?: boolean;
  performanceMode?: PerformanceMode;
  responsive?: ResponsiveConfig;
}

/**
 * Configuration for responsive behavior
 */
export interface ResponsiveConfig {
  breakpoints: UIBreakpoint[];
  scalingMode: 'proportional' | 'fixed' | 'adaptive';
  minScale?: number;
  maxScale?: number;
  maintainAspectRatio?: boolean;
}

/**
 * Performance monitoring data
 */
export interface UIPerformanceMetrics {
  averageUpdateTime: number; // ms
  maxUpdateTime: number; // ms
  updateCount: number;
  queueSize: number;
  activeComponents: number;
  memoryUsage?: number; // bytes
  frameRate?: number; // fps
}

/**
 * UI system error classes
 */
export class UIError extends Error {
  readonly code: string;
  readonly componentId?: string;
  readonly timestamp: number;
  
  constructor(message: string, code: string, componentId?: string) {
    super(message);
    this.name = 'UIError';
    this.code = code;
    if (componentId) {
      this.componentId = componentId;
    }
    this.timestamp = Date.now();
  }
}

export class UIValidationError extends UIError {
  readonly validationField: string;
  readonly validationRule: string;
  
  constructor(field: string, rule: string, componentId?: string) {
    super(`Validation failed for field '${field}': ${rule}`, 'VALIDATION_ERROR', componentId);
    this.name = 'UIValidationError';
    this.validationField = field;
    this.validationRule = rule;
  }
}