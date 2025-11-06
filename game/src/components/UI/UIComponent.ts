/**
 * UIComponent - Base class for all HTML UI components
 * Provides common functionality for component lifecycle, positioning, and event handling
 */

import { IUIComponent, UIPosition, UISize, UIComponentConfig, UIValidationError } from '../../types/ui';

/**
 * Base implementation of IUIComponent interface
 * All UI components should extend this class for consistent behavior
 */
export class UIComponent implements IUIComponent {
  protected _element: HTMLElement;
  protected _id: string;
  protected _isVisible: boolean = true;
  protected _isInteractive: boolean = true;
  protected _position: UIPosition;
  protected _size: UISize;
  protected _className?: string | undefined;
  protected _attributes?: Record<string, string> | undefined;
  protected _isMounted: boolean = false;
  protected _eventListeners: Map<string, Set<EventListener>> = new Map();

  constructor(config: UIComponentConfig) {
    this.validateConfig(config);
    
    this._id = config.id;
    this._position = { ...config.position };
    this._size = { ...config.size };
    this._className = config.className ?? undefined;
    this._attributes = config.attributes ? { ...config.attributes } : undefined;
    this._isVisible = config.isVisible ?? true;
    this._isInteractive = config.isInteractive ?? true;

    this._element = this.createElement(config);
    this.applyInitialStyles();
    this.setupEventHandling();
  }

  // Getters for readonly properties
  get id(): string {
    return this._id;
  }

  get element(): HTMLElement {
    return this._element;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  set isVisible(visible: boolean) {
    this._isVisible = visible;
    visible ? this.show() : this.hide();
  }

  get isInteractive(): boolean {
    return this._isInteractive;
  }

  set isInteractive(interactive: boolean) {
    this._isInteractive = interactive;
    this.setInteractive(interactive);
  }

  get position(): UIPosition {
    return { ...this._position };
  }

  get size(): UISize {
    return { ...this._size };
  }

  get className(): string | undefined {
    return this._className;
  }

  get attributes(): Record<string, string> | undefined {
    return this._attributes ? { ...this._attributes } : undefined;
  }

  /**
   * Mount the component to a parent container
   */
  mount(container: HTMLElement): void {
    if (this._isMounted) {
      throw new Error(`Component ${this._id} is already mounted`);
    }

    container.appendChild(this._element);
    this._isMounted = true;
    this.onMount();
  }

  /**
   * Unmount the component from its parent
   */
  unmount(): void {
    if (!this._isMounted) {
      return;
    }

    if (this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    
    this._isMounted = false;
    this.onUnmount();
  }

  /**
   * Show the component
   */
  show(): void {
    this._element.style.display = 'block';
    this._isVisible = true;
    this.onShow();
  }

  /**
   * Hide the component
   */
  hide(): void {
    this._element.style.display = 'none';
    this._isVisible = false;
    this.onHide();
  }

  /**
   * Set component interactivity
   */
  setInteractive(interactive: boolean): void {
    this._isInteractive = interactive;
    this._element.style.pointerEvents = interactive ? 'auto' : 'none';
    
    if (interactive) {
      this._element.classList.add('ui-interactive');
    } else {
      this._element.classList.remove('ui-interactive');
    }
    
    this.onInteractivityChange(interactive);
  }

  /**
   * Update component position
   */
  updatePosition(position: Partial<UIPosition>): void {
    this._position = { ...this._position, ...position };
    this.applyPosition();
    this.onPositionChange(this._position);
  }

  /**
   * Update component size
   */
  updateSize(size: Partial<UISize>): void {
    this._size = { ...this._size, ...size };
    this.applySize();
    this.onSizeChange(this._size);
  }

  /**
   * Add event listener to the component
   */
  addEventListener(event: string, handler: EventListener): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }
    
    this._eventListeners.get(event)!.add(handler);
    this._element.addEventListener(event, handler);
  }

  /**
   * Remove event listener from the component
   */
  removeEventListener(event: string, handler: EventListener): void {
    const handlers = this._eventListeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this._eventListeners.delete(event);
      }
    }
    
    this._element.removeEventListener(event, handler);
  }

  /**
   * Destroy the component and clean up resources
   */
  destroy(): void {
    // Remove all event listeners
    for (const [event, handlers] of this._eventListeners) {
      for (const handler of handlers) {
        this._element.removeEventListener(event, handler);
      }
    }
    this._eventListeners.clear();

    // Unmount if still mounted
    if (this._isMounted) {
      this.unmount();
    }

    this.onDestroy();
  }

  /**
   * Validate component configuration
   */
  protected validateConfig(config: UIComponentConfig): void {
    if (!config.id || typeof config.id !== 'string') {
      throw new UIValidationError('id', 'ID must be a non-empty string');
    }

    if (!config.position) {
      throw new UIValidationError('position', 'Position is required');
    }

    if (!config.size) {
      throw new UIValidationError('size', 'Size is required');
    }

    if (config.size.width <= 0 || config.size.height <= 0) {
      throw new UIValidationError('size', 'Width and height must be positive numbers');
    }

    if (config.position.x < 0 || config.position.y < 0) {
      throw new UIValidationError('position', 'Position coordinates must be non-negative');
    }
  }

  /**
   * Create the DOM element for this component
   */
  protected createElement(config: UIComponentConfig): HTMLElement {
    const element = document.createElement(config.tagName || 'div');
    element.id = this._id;
    
    if (this._className) {
      element.className = this._className;
    }
    
    if (this._attributes) {
      for (const [key, value] of Object.entries(this._attributes)) {
        element.setAttribute(key, value);
      }
    }
    
    return element;
  }

  /**
   * Apply initial styles to the element
   */
  protected applyInitialStyles(): void {
    this._element.style.position = 'absolute';
    this._element.style.boxSizing = 'border-box';
    
    this.applyPosition();
    this.applySize();
    this.setInteractive(this._isInteractive);
    
    if (!this._isVisible) {
      this.hide();
    }
  }

  /**
   * Apply position styles to the element
   */
  protected applyPosition(): void {
    const { x, y, anchor, origin } = this._position;
    
    if (anchor === 'px') {
      this._element.style.left = `${x}px`;
      this._element.style.top = `${y}px`;
    } else {
      this._element.style.left = `${x}%`;
      this._element.style.top = `${y}%`;
    }
    
    // Apply transform origin for different anchor points
    switch (origin) {
      case 'center':
        this._element.style.transform = 'translate(-50%, -50%)';
        break;
      case 'top-center':
        this._element.style.transform = 'translate(-50%, 0)';
        break;
      case 'bottom-center':
        this._element.style.transform = 'translate(-50%, -100%)';
        break;
      case 'center-left':
        this._element.style.transform = 'translate(0, -50%)';
        break;
      case 'center-right':
        this._element.style.transform = 'translate(-100%, -50%)';
        break;
      case 'bottom-right':
        this._element.style.transform = 'translate(-100%, -100%)';
        break;
      case 'top-left':
      default:
        this._element.style.transform = 'none';
        break;
    }
  }

  /**
   * Apply size styles to the element
   */
  protected applySize(): void {
    this._element.style.width = `${this._size.width}px`;
    this._element.style.height = `${this._size.height}px`;
  }

  /**
   * Setup basic event handling
   */
  protected setupEventHandling(): void {
    // Add accessibility support
    if (this._isInteractive) {
      this._element.setAttribute('tabindex', '0');
      this._element.setAttribute('role', 'button');
    }
  }

  // Lifecycle hooks - override in subclasses
  protected onMount(): void {
    // Override in subclasses
  }

  protected onUnmount(): void {
    // Override in subclasses
  }

  protected onShow(): void {
    // Override in subclasses
  }

  protected onHide(): void {
    // Override in subclasses
  }

  protected onInteractivityChange(interactive: boolean): void {
    // Override in subclasses
  }

  protected onPositionChange(position: UIPosition): void {
    // Override in subclasses
  }

  protected onSizeChange(size: UISize): void {
    // Override in subclasses
  }

  protected onDestroy(): void {
    // Override in subclasses
  }
}