/**
 * LayoutManager - Handles responsive positioning and sizing of UI elements
 * Provides adaptive layout calculations based on screen size and orientation
 */

import { IUIComponent, UISize, UIPosition, UIBreakpoint, ResponsiveConfig } from '../types/ui';

/**
 * Interface for the LayoutManager system
 */
export interface ILayoutManager {
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

/**
 * Viewport change callback type
 */
type ViewportChangeCallback = (size: UISize) => void;
type OrientationChangeCallback = (orientation: 'portrait' | 'landscape') => void;

/**
 * LayoutManager implementation
 * Manages responsive layout and positioning for UI components
 */
export class LayoutManager implements ILayoutManager {
  private _canvasSize: UISize = { width: 0, height: 0 };
  private _viewportSize: UISize = { width: 0, height: 0 };
  private _scaleFactor: number = 1;
  private _breakpoints: UIBreakpoint[] = [];
  private _currentBreakpoint: string = 'default';
  private _config: ResponsiveConfig;
  private _components: Set<IUIComponent> = new Set();
  private _isInitialized: boolean = false;
  private _devicePixelRatio: number = 1;
  
  // Event callbacks
  private _viewportCallbacks: Set<ViewportChangeCallback> = new Set();
  private _orientationCallbacks: Set<OrientationChangeCallback> = new Set();
  private _boundResizeHandler?: () => void;
  private _resizeObserver?: ResizeObserver;
  private _currentOrientation: 'portrait' | 'landscape' = 'landscape';

  constructor(config: ResponsiveConfig) {
    this._config = { ...config };
    this._breakpoints = [...config.breakpoints];
    this.setupDefaultBreakpoints();
  }

  // Getters for readonly properties
  get canvasSize(): UISize {
    return { ...this._canvasSize };
  }

  get viewportSize(): UISize {
    return { ...this._viewportSize };
  }

  get scaleFactor(): number {
    return this._scaleFactor;
  }

  get breakpoints(): readonly UIBreakpoint[] {
    return [...this._breakpoints];
  }

  get currentBreakpoint(): string {
    return this._currentBreakpoint;
  }

  /**
   * Initialize the layout manager
   */
  initialize(): void {
    if (this._isInitialized) {
      throw new Error('LayoutManager already initialized');
    }

    this.detectInitialSizes();
    this.detectDevicePixelRatio();
    this.setupEventListeners();
    this.calculateScaleFactor();
    this.updateCurrentBreakpoint();
    this._isInitialized = true;
  }

  /**
   * Update layout with new canvas and viewport sizes
   */
  async updateLayout(canvasSize: UISize, viewportSize: UISize): Promise<string[]> {
    const previousBreakpoint = this._currentBreakpoint;
    const previousOrientation = this._currentOrientation;
    
    this._canvasSize = { ...canvasSize };
    this._viewportSize = { ...viewportSize };
    
    this.calculateScaleFactor();
    this.updateCurrentBreakpoint();
    this.updateCurrentOrientation();
    
    const updatedComponentIds: string[] = [];
    
    // Update all registered components if breakpoint or orientation changed
    if (previousBreakpoint !== this._currentBreakpoint || 
        previousOrientation !== this._currentOrientation) {
      
      for (const component of this._components) {
        this.positionComponent(component);
        updatedComponentIds.push(component.id);
      }
    }
    
    // Notify callbacks
    this._viewportCallbacks.forEach(callback => callback(this._viewportSize));
    
    if (previousOrientation !== this._currentOrientation) {
      this._orientationCallbacks.forEach(callback => callback(this._currentOrientation));
    }
    
    return updatedComponentIds;
  }

  /**
   * Recalculate positions for all components
   */
  recalculatePositions(): void {
    for (const component of this._components) {
      this.positionComponent(component);
    }
  }

  /**
   * Add a responsive breakpoint
   */
  addBreakpoint(breakpoint: UIBreakpoint): void {
    // Remove existing breakpoint with same name
    this.removeBreakpoint(breakpoint.name);
    
    // Insert in correct position (sorted by minWidth)
    const insertIndex = this._breakpoints.findIndex(bp => bp.minWidth > breakpoint.minWidth);
    if (insertIndex === -1) {
      this._breakpoints.push(breakpoint);
    } else {
      this._breakpoints.splice(insertIndex, 0, breakpoint);
    }
    
    this.updateCurrentBreakpoint();
  }

  /**
   * Remove a breakpoint by name
   */
  removeBreakpoint(name: string): void {
    const index = this._breakpoints.findIndex(bp => bp.name === name);
    if (index !== -1) {
      this._breakpoints.splice(index, 1);
      this.updateCurrentBreakpoint();
    }
  }

  /**
   * Get current active breakpoint
   */
  getCurrentBreakpoint(): string {
    return this._currentBreakpoint;
  }

  /**
   * Position a component according to responsive rules
   */
  positionComponent(component: IUIComponent): void {
    if (!this._isInitialized) {
      return;
    }

    // Register component for future updates
    this._components.add(component);
    
    const responsivePosition = this.getResponsivePosition(component.position);
    const responsiveSize = this.getResponsiveSize(component.size);
    
    // Apply responsive calculations to component
    component.updatePosition(responsivePosition);
    component.updateSize(responsiveSize);
  }

  /**
   * Calculate responsive size based on current layout
   */
  getResponsiveSize(baseSize: UISize): UISize {
    const scaledSize = this.applyScaling(baseSize);
    
    // Apply device pixel ratio for crisp rendering
    const pixelPerfectSize = {
      width: Math.round(scaledSize.width * this._devicePixelRatio) / this._devicePixelRatio,
      height: Math.round(scaledSize.height * this._devicePixelRatio) / this._devicePixelRatio
    };
    
    // Ensure minimum touch target sizes on mobile
    if (this.isMobileBreakpoint()) {
      return {
        width: Math.max(pixelPerfectSize.width, 44), // 44px minimum touch target
        height: Math.max(pixelPerfectSize.height, 44)
      };
    }
    
    return pixelPerfectSize;
  }

  /**
   * Calculate responsive position based on current layout
   */
  getResponsivePosition(basePosition: UIPosition): UIPosition {
    let position = { ...basePosition };
    
    // Apply viewport-relative positioning adjustments
    if (position.anchor === '%') {
      // Percentage positions are already responsive
      return position;
    }
    
    // Apply scaling to pixel positions
    position.x *= this._scaleFactor;
    position.y *= this._scaleFactor;
    
    // Apply device pixel ratio for crisp positioning
    position.x = Math.round(position.x * this._devicePixelRatio) / this._devicePixelRatio;
    position.y = Math.round(position.y * this._devicePixelRatio) / this._devicePixelRatio;
    
    // Apply breakpoint-specific adjustments
    position = this.applyBreakpointAdjustments(position);
    
    return position;
  }

  /**
   * Register viewport change callback
   */
  onViewportChange(callback: ViewportChangeCallback): void {
    this._viewportCallbacks.add(callback);
  }

  /**
   * Register orientation change callback
   */
  onOrientationChange(callback: OrientationChangeCallback): void {
    this._orientationCallbacks.add(callback);
  }

  /**
   * Destroy the layout manager and clean up
   */
  destroy(): void {
    if (this._boundResizeHandler) {
      window.removeEventListener('resize', this._boundResizeHandler);
    }
    
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    
    this._viewportCallbacks.clear();
    this._orientationCallbacks.clear();
    this._components.clear();
    this._isInitialized = false;
  }

  /**
   * Setup default responsive breakpoints
   */
  private setupDefaultBreakpoints(): void {
    if (this._breakpoints.length === 0) {
      this._breakpoints = [
        { name: 'mobile', minWidth: 0, maxWidth: 768 },
        { name: 'tablet', minWidth: 769, maxWidth: 1024 },
        { name: 'desktop', minWidth: 1025 }
      ];
    }
  }

  /**
   * Detect initial canvas and viewport sizes
   */
  private detectInitialSizes(): void {
    // Get viewport size
    this._viewportSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Canvas size will be updated by the UI system
    // For now, use viewport as fallback
    this._canvasSize = { ...this._viewportSize };
  }

  /**
   * Detect device pixel ratio for crisp rendering
   */
  private detectDevicePixelRatio(): void {
    this._devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
    
    // Listen for pixel ratio changes (e.g., moving between displays)
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia(`(resolution: ${this._devicePixelRatio}dppx)`);
      const handler = () => {
        this._devicePixelRatio = window.devicePixelRatio || 1;
        this.recalculatePositions();
      };
      
      mediaQuery.addListener(handler);
    }
  }

  /**
   * Setup event listeners for size changes
   */
  private setupEventListeners(): void {
    // Window resize listener with debouncing
    let resizeTimeout: number;
    this._boundResizeHandler = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        const newViewportSize = {
          width: window.innerWidth,
          height: window.innerHeight
        };
        
        this.updateLayout(this._canvasSize, newViewportSize);
      }, 16); // ~60fps debouncing
    };
    
    window.addEventListener('resize', this._boundResizeHandler);
    
    // Orientation change listener
    const orientationHandler = () => {
      // Delay to allow browser to update dimensions
      setTimeout(() => {
        if (this._boundResizeHandler) {
          this._boundResizeHandler();
        }
      }, 100);
    };
    
    window.addEventListener('orientationchange', orientationHandler);
    
    // Visual viewport API for better mobile support
    if (typeof window !== 'undefined' && 'visualViewport' in window && window.visualViewport) {
      const visualViewportHandler = () => {
        const vvp = window.visualViewport!;
        const newViewportSize = {
          width: vvp.width,
          height: vvp.height
        };
        this.updateLayout(this._canvasSize, newViewportSize);
      };
      
      window.visualViewport.addEventListener('resize', visualViewportHandler);
      window.visualViewport.addEventListener('scroll', visualViewportHandler);
    }
    
    // ResizeObserver for more precise detection
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === document.body && this._boundResizeHandler) {
            this._boundResizeHandler();
          }
        }
      });
      
      this._resizeObserver.observe(document.body);
    }
    
    // Media query listeners for breakpoint changes
    this.setupMediaQueryListeners();
  }

  /**
   * Calculate scale factor based on viewport and canvas
   */
  private calculateScaleFactor(): void {
    if (this._config.scalingMode === 'fixed') {
      this._scaleFactor = 1;
      return;
    }
    
    const widthRatio = this._viewportSize.width / 1920; // Base width
    const heightRatio = this._viewportSize.height / 1080; // Base height
    
    switch (this._config.scalingMode) {
      case 'proportional':
        this._scaleFactor = Math.min(widthRatio, heightRatio);
        break;
      case 'adaptive':
        this._scaleFactor = this.isMobileBreakpoint() ? 
          Math.min(widthRatio, heightRatio) : 
          Math.max(widthRatio, heightRatio);
        break;
      default:
        this._scaleFactor = 1;
    }
    
    // Apply min/max constraints
    if (this._config.minScale !== undefined) {
      this._scaleFactor = Math.max(this._scaleFactor, this._config.minScale);
    }
    
    if (this._config.maxScale !== undefined) {
      this._scaleFactor = Math.min(this._scaleFactor, this._config.maxScale);
    }
  }

  /**
   * Update current breakpoint based on viewport width
   */
  private updateCurrentBreakpoint(): void {
    const width = this._viewportSize.width;
    
    for (const breakpoint of this._breakpoints) {
      if (width >= breakpoint.minWidth && 
          (breakpoint.maxWidth === undefined || width <= breakpoint.maxWidth)) {
        this._currentBreakpoint = breakpoint.name;
        return;
      }
    }
    
    this._currentBreakpoint = 'default';
  }

  /**
   * Update current orientation
   */
  private updateCurrentOrientation(): void {
    const newOrientation = this._viewportSize.width > this._viewportSize.height ? 
      'landscape' : 'portrait';
    this._currentOrientation = newOrientation;
  }

  /**
   * Apply scaling to size
   */
  private applyScaling(size: UISize): UISize {
    return {
      width: size.width * this._scaleFactor,
      height: size.height * this._scaleFactor
    };
  }

  /**
   * Apply breakpoint-specific position adjustments
   */
  private applyBreakpointAdjustments(position: UIPosition): UIPosition {
    // Breakpoint-specific adjustments can be implemented here
    // For example, mobile might need different margins or offsets
    
    if (this.isMobileBreakpoint()) {
      // Add safe area adjustments for mobile
      return {
        ...position,
        x: Math.max(position.x, 16), // 16px minimum margin
        y: Math.max(position.y, 16)
      };
    }
    
    return position;
  }

  /**
   * Check if current breakpoint is mobile
   */
  private isMobileBreakpoint(): boolean {
    return this._currentBreakpoint === 'mobile' || this._viewportSize.width <= 768;
  }

  /**
   * Setup media query listeners for real-time breakpoint detection
   */
  private setupMediaQueryListeners(): void {
    // Skip if matchMedia is not available (e.g., in test environment)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // Create media queries for each breakpoint
    for (const breakpoint of this._breakpoints) {
      let mediaQuery: string;
      
      if (breakpoint.maxWidth !== undefined) {
        mediaQuery = `(min-width: ${breakpoint.minWidth}px) and (max-width: ${breakpoint.maxWidth}px)`;
      } else {
        mediaQuery = `(min-width: ${breakpoint.minWidth}px)`;
      }
      
      const mql = window.matchMedia(mediaQuery);
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          const previousBreakpoint = this._currentBreakpoint;
          this._currentBreakpoint = breakpoint.name;
          
          if (previousBreakpoint !== this._currentBreakpoint) {
            this.recalculatePositions();
          }
        }
      };
      
      mql.addListener(handler);
    }
  }
}