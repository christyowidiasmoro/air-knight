/**
 * UIPanel - Container panel component with game-optimized styling
 * Extends UIComponent with panel-specific functionality and theming
 */

import { UIComponent } from './UIComponent';
import { UIComponentConfig, IUIComponent } from '../../types/ui';

export type PanelTheme = 'light' | 'dark' | 'glass' | 'solid';
export type PanelSize = 'compact' | 'normal' | 'spacious';

export interface UIPanelConfig extends Omit<UIComponentConfig, 'tagName'> {
  title?: string;
  theme?: PanelTheme;
  panelSize?: PanelSize;
  closable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onDragStart?: (event: MouseEvent) => void;
  onDragEnd?: (event: MouseEvent) => void;
}

/**
 * Flexible panel component for game UI containers
 * Supports multiple themes, sizes, and interaction modes
 */
export class UIPanel extends UIComponent {
  private _title?: string;
  private _theme: PanelTheme;
  private _panelSize: PanelSize;
  private _closable: boolean;
  private _draggable: boolean;
  private _resizable: boolean;
  private _onClose?: () => void;
  private _onDragStart?: (event: MouseEvent) => void;
  private _onDragEnd?: (event: MouseEvent) => void;
  
  private _headerElement?: HTMLElement;
  private _titleElement?: HTMLElement;
  private _closeButton?: HTMLElement;
  private _contentElement!: HTMLElement;
  private _childComponents: Map<string, IUIComponent> = new Map();

  // Drag state
  private _isDragging: boolean = false;
  private _dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  constructor(config: UIPanelConfig) {
    // Convert to UIComponentConfig and ensure div element
    const componentConfig: UIComponentConfig = {
      ...config,
      tagName: 'div',
      className: UIPanel.buildClassName(config.theme, config.panelSize, config.className)
    };

    super(componentConfig);

    // Basic properties
    if (config.title) {
      this._title = config.title;
    }
    this._theme = config.theme || 'light';
    this._panelSize = config.panelSize || 'normal';
    this._closable = config.closable || false;
    this._draggable = config.draggable || false;
    this._resizable = config.resizable || false;
    
    // Event handlers (using conditional assignment to avoid undefined issues)
    if (config.onClose) {
      this._onClose = config.onClose;
    }
    if (config.onDragStart) {
      this._onDragStart = config.onDragStart;
    }
    if (config.onDragEnd) {
      this._onDragEnd = config.onDragEnd;
    }

    this.initializePanel();
  }

  // Getters and setters
  get title(): string | undefined {
    return this._title;
  }

  set title(value: string | undefined) {
    if (value) {
      this._title = value;
    } else {
      delete (this as any)._title;
    }
    this.updateTitle();
  }

  get theme(): PanelTheme {
    return this._theme;
  }

  set theme(value: PanelTheme) {
    this._theme = value;
    this.updatePanelClasses();
  }

  get panelSize(): PanelSize {
    return this._panelSize;
  }

  set panelSize(value: PanelSize) {
    this._panelSize = value;
    this.updatePanelClasses();
  }

  get closable(): boolean {
    return this._closable;
  }

  set closable(value: boolean) {
    this._closable = value;
    this.updateHeader();
  }

  get draggable(): boolean {
    return this._draggable;
  }

  set draggable(value: boolean) {
    this._draggable = value;
    this.updateDraggableState();
  }

  get contentElement(): HTMLElement {
    return this._contentElement;
  }

  get childComponents(): ReadonlyMap<string, IUIComponent> {
    return this._childComponents;
  }

  /**
   * Initialize panel structure and behavior
   */
  private initializePanel(): void {
    // Create content area
    this._contentElement = document.createElement('div');
    this._contentElement.className = 'panel-content';
    this._element.appendChild(this._contentElement);

    // Setup header if title or closable
    if (this._title || this._closable) {
      this.createHeader();
    }

    // Setup dragging if enabled
    if (this._draggable) {
      this.setupDragging();
    }

    // Setup ARIA attributes
    this._element.setAttribute('role', 'region');
    if (this._title) {
      this._element.setAttribute('aria-label', this._title);
    }
  }

  /**
   * Create and configure the panel header
   */
  private createHeader(): void {
    this._headerElement = document.createElement('div');
    this._headerElement.className = 'panel-header';
    
    if (this._title) {
      this._titleElement = document.createElement('h3');
      this._titleElement.className = 'panel-title';
      this._titleElement.textContent = this._title;
      this._headerElement.appendChild(this._titleElement);
    }

    if (this._closable) {
      this._closeButton = document.createElement('button');
      this._closeButton.className = 'panel-close-btn';
      this._closeButton.innerHTML = '×';
      this._closeButton.setAttribute('type', 'button');
      this._closeButton.setAttribute('aria-label', 'Close panel');
      
      this._closeButton.addEventListener('click', this.handleClose.bind(this) as EventListener);
      this._headerElement.appendChild(this._closeButton);
    }

    // Insert header at the beginning
    this._element.insertBefore(this._headerElement, this._contentElement);
  }

  /**
   * Update header based on current settings
   */
  private updateHeader(): void {
    if ((this._title || this._closable) && !this._headerElement) {
      this.createHeader();
    } else if (!this._title && !this._closable && this._headerElement) {
      this._element.removeChild(this._headerElement);
      delete (this as any)._headerElement;
      delete (this as any)._titleElement;
      delete (this as any)._closeButton;
    }
  }

  /**
   * Update title display
   */
  private updateTitle(): void {
    if (this._title && !this._titleElement) {
      this.updateHeader();
    } else if (this._titleElement) {
      this._titleElement.textContent = this._title || '';
    }

    // Update ARIA label
    if (this._title) {
      this._element.setAttribute('aria-label', this._title);
    } else {
      this._element.removeAttribute('aria-label');
    }
  }

  /**
   * Update panel CSS classes based on theme and size
   */
  private updatePanelClasses(): void {
    this._element.className = UIPanel.buildClassName(this._theme, this._panelSize, this._className);
  }

  /**
   * Setup dragging functionality
   */
  private setupDragging(): void {
    if (!this._headerElement && this._title) {
      this.createHeader();
    }

    const dragHandle = this._headerElement || this._element;
    dragHandle.style.cursor = 'move';
    
    dragHandle.addEventListener('mousedown', this.handleDragStart.bind(this) as EventListener);
    document.addEventListener('mousemove', this.handleDragMove.bind(this) as EventListener);
    document.addEventListener('mouseup', this.handleDragEnd.bind(this) as EventListener);
  }

  /**
   * Update draggable state
   */
  private updateDraggableState(): void {
    if (this._draggable) {
      this.setupDragging();
    } else {
      const dragHandle = this._headerElement || this._element;
      dragHandle.style.cursor = '';
    }
  }

  /**
   * Handle close button click
   */
  private handleClose(): void {
    if (this._onClose) {
      this._onClose();
    } else {
      this.hide();
    }
  }

  /**
   * Handle drag start
   */
  private handleDragStart(event: MouseEvent): void {
    if (!this._draggable) return;

    this._isDragging = true;
    const rect = this._element.getBoundingClientRect();
    this._dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this._element.classList.add('dragging');
    
    if (this._onDragStart) {
      this._onDragStart(event);
    }

    event.preventDefault();
  }

  /**
   * Handle drag move
   */
  private handleDragMove(event: MouseEvent): void {
    if (!this._isDragging || !this._draggable) return;

    const newX = event.clientX - this._dragOffset.x;
    const newY = event.clientY - this._dragOffset.y;

    this.updatePosition({ x: newX, y: newY });
    event.preventDefault();
  }

  /**
   * Handle drag end
   */
  private handleDragEnd(event: MouseEvent): void {
    if (!this._isDragging) return;

    this._isDragging = false;
    this._element.classList.remove('dragging');

    if (this._onDragEnd) {
      this._onDragEnd(event);
    }
  }

  /**
   * Add a child component to the panel content
   */
  addChild(component: IUIComponent): void {
    if (this._childComponents.has(component.id)) {
      throw new Error(`Child component ${component.id} already exists in panel`);
    }

    this._childComponents.set(component.id, component);
    component.mount(this._contentElement);
  }

  /**
   * Remove a child component from the panel
   */
  removeChild(componentId: string): void {
    const component = this._childComponents.get(componentId);
    if (component) {
      component.unmount();
      this._childComponents.delete(componentId);
    }
  }

  /**
   * Get a child component by ID
   */
  getChild(componentId: string): IUIComponent | undefined {
    return this._childComponents.get(componentId);
  }

  /**
   * Clear all child components
   */
  clearChildren(): void {
    for (const [componentId] of this._childComponents) {
      this.removeChild(componentId);
    }
  }

  /**
   * Set close handler
   */
  setOnClose(handler: () => void): void {
    this._onClose = handler;
  }

  /**
   * Set drag handlers
   */
  setOnDrag(onStart?: (event: MouseEvent) => void, onEnd?: (event: MouseEvent) => void): void {
    if (onStart) {
      this._onDragStart = onStart;
    } else {
      delete (this as any)._onDragStart;
    }
    if (onEnd) {
      this._onDragEnd = onEnd;
    } else {
      delete (this as any)._onDragEnd;
    }
  }

  /**
   * Build CSS class string based on configuration
   */
  private static buildClassName(
    theme: PanelTheme = 'light',
    panelSize: PanelSize = 'normal',
    customClassName?: string
  ): string {
    const classes = ['game-panel'];

    // Add theme class
    switch (theme) {
      case 'dark':
        classes.push('game-panel-dark');
        break;
      case 'glass':
        classes.push('bg-white/20', 'backdrop-blur-md', 'border-white/10');
        break;
      case 'solid':
        classes.push('bg-white', 'border-gray-300');
        break;
      case 'light':
      default:
        // Light styling is already in base game-panel class
        break;
    }

    // Add size class
    switch (panelSize) {
      case 'compact':
        classes.push('p-2', 'text-sm');
        break;
      case 'spacious':
        classes.push('p-6', 'text-base');
        break;
      case 'normal':
      default:
        // Normal styling is already in base game-panel class
        break;
    }

    // Add custom classes if provided
    if (customClassName) {
      classes.push(customClassName);
    }

    return classes.join(' ');
  }

  /**
   * Create a panel with preset configurations
   */
  static createPreset(
    preset: 'modal' | 'sidebar' | 'tooltip' | 'dialog' | 'hud',
    config: Omit<UIPanelConfig, 'theme' | 'panelSize'>
  ): UIPanel {
    const presets: Record<typeof preset, Pick<UIPanelConfig, 'theme' | 'panelSize' | 'closable' | 'draggable'>> = {
      modal: {
        theme: 'light',
        panelSize: 'normal',
        closable: true,
        draggable: false
      },
      sidebar: {
        theme: 'dark',
        panelSize: 'normal',
        closable: false,
        draggable: false
      },
      tooltip: {
        theme: 'glass',
        panelSize: 'compact',
        closable: false,
        draggable: false
      },
      dialog: {
        theme: 'light',
        panelSize: 'normal',
        closable: true,
        draggable: true
      },
      hud: {
        theme: 'glass',
        panelSize: 'compact',
        closable: false,
        draggable: false
      }
    };

    return new UIPanel({
      ...config,
      ...presets[preset]
    });
  }

  /**
   * Override destroy to clean up panel-specific resources
   */
  destroy(): void {
    // Clear all child components
    this.clearChildren();

    // Clean up drag listeners
    if (this._draggable) {
      document.removeEventListener('mousemove', this.handleDragMove.bind(this) as EventListener);
      document.removeEventListener('mouseup', this.handleDragEnd.bind(this) as EventListener);
    }

    // Clean up close button
    if (this._closeButton) {
      this._closeButton.removeEventListener('click', this.handleClose.bind(this) as EventListener);
    }

    super.destroy();
  }

  /**
   * Override onMount to setup panel-specific behavior
   */
  protected onMount(): void {
    // Apply theme-specific styles that require DOM to be mounted
    this.applyThemeStyles();
  }

  /**
   * Apply theme-specific styles
   */
  private applyThemeStyles(): void {
    switch (this._theme) {
      case 'glass':
        // Ensure backdrop-filter is properly applied
        this._element.style.backdropFilter = 'blur(12px)';
        break;
      case 'dark':
        // Ensure dark theme contrast
        this._element.style.color = 'white';
        break;
    }
  }
}