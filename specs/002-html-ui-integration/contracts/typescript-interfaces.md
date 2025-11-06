# TypeScript Interface Contracts

## Core Interfaces

### IUIOverlayContainer
Primary interface for managing HTML UI overlay system.

```typescript
interface IUIOverlayContainer {
  readonly element: HTMLDivElement;
  readonly isVisible: boolean;
  readonly zIndex: number;
  readonly components: ReadonlyMap<string, IUIComponent>;
  
  // Component Management
  addComponent(component: IUIComponent): Promise<void>;
  removeComponent(componentId: string): Promise<void>;
  updateComponent(componentId: string, updates: Partial<IUIComponent>): Promise<void>;
  getComponent(componentId: string): IUIComponent | undefined;
  
  // Visibility Control
  show(): void;
  hide(): void;
  setZIndex(zIndex: number): void;
  
  // Lifecycle
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  destroy(): Promise<void>;
}
```

### IUIComponent
Interface for individual UI elements within the overlay.

```typescript
interface IUIComponent {
  readonly id: string;
  readonly element: HTMLElement;
  isVisible: boolean;
  isInteractive: boolean;
  position: UIPosition;
  size: UISize;
  className?: string;
  attributes?: Record<string, string>;
  
  // Lifecycle
  mount(container: HTMLElement): void;
  unmount(): void;
  
  // State Management
  show(): void;
  hide(): void;
  setInteractive(interactive: boolean): void;
  updatePosition(position: Partial<UIPosition>): void;
  updateSize(size: Partial<UISize>): void;
  
  // Event Handling
  addEventListener(event: string, handler: EventListener): void;
  removeEventListener(event: string, handler: EventListener): void;
  
  // Cleanup
  destroy(): void;
}
```

### IGameUIBridge
Interface for synchronizing game state with UI components.

```typescript
interface IGameUIBridge {
  readonly gameState: any; // Game-specific state object
  readonly uiContainer: IUIOverlayContainer;
  readonly eventSubscriptions: ReadonlyMap<string, UIEventSubscription[]>;
  readonly updateQueue: readonly UIUpdate[];
  
  // Event Subscriptions
  subscribeToGameEvent(
    eventName: string, 
    componentId: string, 
    updateProperty: string,
    transformer?: (data: any) => any
  ): void;
  
  unsubscribeFromGameEvent(eventName: string, componentId: string): void;
  
  // Update Management
  scheduleUpdate(update: UIUpdate): void;
  flushUpdates(): Promise<void>;
  
  // State Synchronization
  syncComponent(componentId: string): void;
  syncAllComponents(): void;
  
  // Lifecycle
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}
```

### IInputHandler
Interface for managing event routing between UI and canvas.

```typescript
interface IInputHandler {
  readonly canvas: HTMLCanvasElement;
  readonly uiContainer: IUIOverlayContainer;
  readonly activeElement: HTMLElement | null;
  readonly eventMappings: ReadonlyMap<string, EventTarget>;
  
  // Event Routing
  setEventRouting(
    eventType: InputEventType, 
    target: EventTarget, 
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
```

### ILayoutManager
Interface for responsive layout management.

```typescript
interface ILayoutManager {
  readonly canvasSize: UISize;
  readonly viewportSize: UISize;
  readonly scaleFactor: number;
  readonly breakpoints: readonly UIBreakpoint[];
  readonly currentBreakpoint: string;
  
  // Layout Updates
  updateLayout(canvasSize: UISize, viewportSize: UISize): Promise<string[]>; // Returns updated component IDs
  recalculatePositions(): void;
  
  // Responsive Design
  addBreakpoint(breakpoint: UIBreakpoint): void;
  removeBreakpoint(name: string): void;
  getCurrentBreakpoint(): string;
  
  // Component Positioning
  positionComponent(component: IUIComponent): void;
  getResponsiveSize(baseSize: UISize): UISize;
  getResponsivePosition(basePosition: UIPosition): UIPosition;
  
  // Event Handling
  onViewportChange(callback: (size: UISize) => void): void;
  onOrientationChange(callback: (orientation: 'portrait' | 'landscape') => void): void;
  
  // Lifecycle
  initialize(): void;
  destroy(): void;
}
```

## Event Contracts

### UIEventSubscription
Configuration for game event to UI component synchronization.

```typescript
interface UIEventSubscription {
  eventName: string;
  componentId: string;
  updateProperty: string;
  transformer?: (data: any) => any;
  isActive: boolean;
}
```

### UIUpdate
Represents a pending UI component update.

```typescript
interface UIUpdate {
  componentId: string;
  property: string;
  value: any;
  timestamp: number;
  priority?: 'high' | 'normal' | 'low';
}
```

## Configuration Contracts

### UIOverlayConfig
Configuration for initializing the UI overlay system.

```typescript
interface UIOverlayConfig {
  canvas: HTMLCanvasElement;
  zIndex?: number;
  className?: string;
  enableKeyboardNavigation?: boolean;
  enableTouchOptimization?: boolean;
  performanceMode?: 'high' | 'balanced' | 'low';
}
```

### UIComponentConfig
Configuration for creating UI components.

```typescript
interface UIComponentConfig {
  id: string;
  tagName?: string; // Default: 'div'
  className?: string;
  attributes?: Record<string, string>;
  position: UIPosition;
  size: UISize;
  isVisible?: boolean;
  isInteractive?: boolean;
  children?: UIComponentConfig[];
}
```

### ResponsiveConfig
Configuration for responsive behavior.

```typescript
interface ResponsiveConfig {
  breakpoints: UIBreakpoint[];
  scalingMode: 'proportional' | 'fixed' | 'adaptive';
  minScale?: number;
  maxScale?: number;
  maintainAspectRatio?: boolean;
}
```

## Error Contracts

### UIError
Base error class for UI system errors.

```typescript
class UIError extends Error {
  readonly code: string;
  readonly componentId?: string;
  readonly timestamp: number;
  
  constructor(message: string, code: string, componentId?: string);
}
```

### UIValidationError
Specific error for validation failures.

```typescript
class UIValidationError extends UIError {
  readonly validationField: string;
  readonly validationRule: string;
  
  constructor(field: string, rule: string, componentId?: string);
}
```

## Type Definitions

### Utility Types
```typescript
type InputEventType = 'click' | 'touch' | 'keyboard' | 'hover' | 'focus' | 'scroll';
type UIAnchor = 'px' | '%';
type UIOrigin = 'top-left' | 'center' | 'bottom-right' | 'top-center' | 'bottom-center' | 'center-left' | 'center-right';
type EventTarget = 'ui' | 'canvas' | 'both';
type PerformanceMode = 'high' | 'balanced' | 'low';
type ScalingMode = 'proportional' | 'fixed' | 'adaptive';
```

### Position and Size Types
```typescript
interface UIPosition {
  x: number;
  y: number;
  anchor: UIAnchor;
  origin: UIOrigin;
}

interface UISize {
  width: number;
  height: number;
}

interface UIBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}
```

## Service Contracts

### IUIService
Main service interface for the entire UI system.

```typescript
interface IUIService {
  readonly container: IUIOverlayContainer;
  readonly bridge: IGameUIBridge;
  readonly inputHandler: IInputHandler;
  readonly layoutManager: ILayoutManager;
  readonly isInitialized: boolean;
  
  // System Lifecycle
  initialize(config: UIOverlayConfig): Promise<void>;
  destroy(): Promise<void>;
  
  // Component Shortcuts
  createComponent(config: UIComponentConfig): Promise<IUIComponent>;
  addComponent(component: IUIComponent): Promise<void>;
  removeComponent(componentId: string): Promise<void>;
  
  // State Management
  bindGameState(gameState: any): void;
  updateFromGameState(): void;
  
  // Performance
  enablePerformanceMode(mode: PerformanceMode): void;
  getPerformanceMetrics(): UIPerformanceMetrics;
}
```

### UIPerformanceMetrics
Performance monitoring data structure.

```typescript
interface UIPerformanceMetrics {
  averageUpdateTime: number; // ms
  maxUpdateTime: number; // ms
  updateCount: number;
  queueSize: number;
  activeComponents: number;
  memoryUsage?: number; // bytes
  frameRate?: number; // fps
}
```