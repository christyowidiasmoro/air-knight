/**
 * UIManager - Core UI overlay system that manages HTML UI components above Phaser canvas
 * Provides centralized management of UI components with proper layering and event handling
 * Integrates with Phaser Scene lifecycle for seamless game UI management
 */

import { IUIComponent, UIOverlayConfig, UIError, ResponsiveConfig } from '../types/ui';
import { LayoutManager } from './LayoutManager';

/**
 * Main interface for the UI overlay container
 */
export interface IUIOverlayContainer {
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
  
  // Scene Integration
  attachToScene(scene: Phaser.Scene): void;
  detachFromScene(): void;
  pauseForScene(): void;
  resumeForScene(): void;
}

/**
 * UIOverlayContainer implementation
 * Manages the root UI overlay system that sits above the Phaser canvas
 */
export class UIOverlayContainer implements IUIOverlayContainer {
  private _element: HTMLDivElement;
  private _isVisible: boolean = false;
  private _zIndex: number = 1000;
  private _components: Map<string, IUIComponent> = new Map();
  private _canvas?: HTMLCanvasElement;
  private _isInitialized: boolean = false;
  private _currentScene?: Phaser.Scene;
  private _sceneEventHandlers: Map<string, Function> = new Map();
  private _isPaused: boolean = false;
  private _layoutManager?: LayoutManager;

  constructor(config?: Partial<UIOverlayConfig>) {
    this._element = this.createOverlayElement();
    
    if (config?.zIndex) {
      this._zIndex = config.zIndex;
      this._element.style.zIndex = config.zIndex.toString();
    }
    
    if (config?.className) {
      this._element.className += ` ${config.className}`;
    }

    // Initialize layout manager for responsive behavior
    this.initializeLayoutManager(config?.responsive);
  }

  // Getters for readonly properties
  get element(): HTMLDivElement {
    return this._element;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  get zIndex(): number {
    return this._zIndex;
  }

  get components(): ReadonlyMap<string, IUIComponent> {
    return this._components;
  }

  /**
   * Initialize the UI overlay system
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    if (this._isInitialized) {
      throw new UIError('UIOverlayContainer already initialized', 'ALREADY_INITIALIZED');
    }

    this._canvas = canvas;
    this.setupOverlayElement(canvas);
    
    // Initialize layout manager with canvas dimensions
    if (this._layoutManager) {
      this._layoutManager.initialize();
      
      // Setup automatic layout updates
      this._layoutManager.onViewportChange((size) => {
        this.updateResponsiveLayout();
      });
      
      this._layoutManager.onOrientationChange((orientation) => {
        this.updateResponsiveLayout();
      });
    }
    
    this._isInitialized = true;
  }

  /**
   * Initialize layout manager for responsive behavior
   */
  private initializeLayoutManager(responsiveConfig?: ResponsiveConfig): void {
    const defaultConfig: ResponsiveConfig = {
      breakpoints: [
        { name: 'mobile', minWidth: 0, maxWidth: 768 },
        { name: 'tablet', minWidth: 769, maxWidth: 1024 },
        { name: 'desktop', minWidth: 1025 }
      ],
      scalingMode: 'adaptive',
      minScale: 0.5,
      maxScale: 2.0,
      maintainAspectRatio: true
    };

    const config = responsiveConfig ? { ...defaultConfig, ...responsiveConfig } : defaultConfig;
    this._layoutManager = new LayoutManager(config);
  }

  /**
   * Update responsive layout for all components
   */
  private async updateResponsiveLayout(): Promise<void> {
    if (!this._layoutManager || !this._canvas) return;

    const canvasSize = {
      width: this._canvas.offsetWidth,
      height: this._canvas.offsetHeight
    };

    const viewportSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const updatedComponentIds = await this._layoutManager.updateLayout(canvasSize, viewportSize);
    
    // Log responsive layout updates for debugging
    if (updatedComponentIds.length > 0) {
      console.log(`[UIOverlayContainer] Updated responsive layout for ${updatedComponentIds.length} components`);
    }
  }

  /**
   * Add a UI component to the overlay with automatic z-index management
   */
  async addComponent(component: IUIComponent): Promise<void> {
    if (!this._isInitialized) {
      throw new UIError('UIOverlayContainer not initialized', 'NOT_INITIALIZED');
    }

    if (this._components.has(component.id)) {
      throw new UIError(`Component ${component.id} already exists`, 'COMPONENT_EXISTS', component.id);
    }

    this._components.set(component.id, component);
    component.mount(this._element);
    
    // Apply responsive positioning if layout manager is available
    if (this._layoutManager) {
      this._layoutManager.positionComponent(component);
    }
    
    // Apply automatic z-index layering
    this.updateComponentLayering();
  }

  /**
   * Remove a UI component from the overlay
   */
  async removeComponent(componentId: string): Promise<void> {
    const component = this._components.get(componentId);
    if (!component) {
      throw new UIError(`Component ${componentId} not found`, 'COMPONENT_NOT_FOUND', componentId);
    }

    component.unmount();
    this._components.delete(componentId);
  }

  /**
   * Update a UI component's properties
   */
  async updateComponent(componentId: string, updates: Partial<IUIComponent>): Promise<void> {
    const component = this._components.get(componentId);
    if (!component) {
      throw new UIError(`Component ${componentId} not found`, 'COMPONENT_NOT_FOUND', componentId);
    }

    // Apply updates to the component
    if (updates.isVisible !== undefined) {
      updates.isVisible ? component.show() : component.hide();
    }
    
    if (updates.isInteractive !== undefined) {
      component.setInteractive(updates.isInteractive);
    }
    
    if (updates.position) {
      component.updatePosition(updates.position);
    }
    
    if (updates.size) {
      component.updateSize(updates.size);
    }
  }

  /**
   * Get a UI component by ID
   */
  getComponent(componentId: string): IUIComponent | undefined {
    return this._components.get(componentId);
  }

  /**
   * Show the UI overlay
   */
  show(): void {
    this._element.style.display = 'block';
    this._isVisible = true;
  }

  /**
   * Hide the UI overlay
   */
  hide(): void {
    this._element.style.display = 'none';
    this._isVisible = false;
  }

  /**
   * Set the z-index of the overlay
   */
  /**
   * Z-index layer constants for proper UI layering
   */
  private static readonly Z_INDEX_LAYERS = {
    BACKGROUND: 1000,    // Background UI elements
    CONTENT: 2000,       // Main content panels
    MENUS: 3000,         // Dropdown menus, context menus
    OVERLAYS: 4000,      // Modal dialogs, overlays
    TOOLTIPS: 5000,      // Tooltips, help bubbles
    NOTIFICATIONS: 6000, // Notifications, alerts
    DEBUG: 9000          // Debug overlays (highest priority)
  } as const;

  /**
   * Set z-index with automatic layer management
   */
  setZIndex(zIndex: number): void {
    this._zIndex = zIndex;
    this._element.style.zIndex = zIndex.toString();
    
    // Update component z-indices based on their layer types
    this.updateComponentLayering();
  }

  /**
   * Set z-index using predefined layers for better management
   */
  setLayer(layer: keyof typeof UIOverlayContainer.Z_INDEX_LAYERS): void {
    const zIndex = UIOverlayContainer.Z_INDEX_LAYERS[layer];
    this.setZIndex(zIndex);
  }

  /**
   * Update component z-indices based on their types and priorities
   */
  private updateComponentLayering(): void {
    this._components.forEach((component, id) => {
      if (component.element) {
        let layerOffset = 0;
        
        // Determine layer offset based on component type/class
        if (component.element.classList.contains('ui-notification')) {
          layerOffset = UIOverlayContainer.Z_INDEX_LAYERS.NOTIFICATIONS;
        } else if (component.element.classList.contains('ui-tooltip')) {
          layerOffset = UIOverlayContainer.Z_INDEX_LAYERS.TOOLTIPS;
        } else if (component.element.classList.contains('ui-modal') || 
                   component.element.classList.contains('ui-overlay')) {
          layerOffset = UIOverlayContainer.Z_INDEX_LAYERS.OVERLAYS;
        } else if (component.element.classList.contains('ui-menu') ||
                   component.element.classList.contains('ui-dropdown')) {
          layerOffset = UIOverlayContainer.Z_INDEX_LAYERS.MENUS;
        } else if (component.element.classList.contains('ui-panel')) {
          layerOffset = UIOverlayContainer.Z_INDEX_LAYERS.CONTENT;
        } else {
          layerOffset = UIOverlayContainer.Z_INDEX_LAYERS.BACKGROUND;
        }
        
        // Apply the calculated z-index
        component.element.style.zIndex = (this._zIndex + layerOffset).toString();
      }
    });
  }

  /**
   * Attach UI overlay to a Phaser Scene
   */
  attachToScene(scene: Phaser.Scene): void {
    if (this._currentScene) {
      this.detachFromScene();
    }

    this._currentScene = scene;
    
    // Listen for scene lifecycle events
    const pauseHandler = () => this.pauseForScene();
    const resumeHandler = () => this.resumeForScene();
    const shutdownHandler = () => this.detachFromScene();
    
    scene.events.on('pause', pauseHandler);
    scene.events.on('resume', resumeHandler);
    scene.events.on('shutdown', shutdownHandler);
    scene.events.on('destroy', shutdownHandler);
    
    // Store handlers for cleanup
    this._sceneEventHandlers.set('pause', pauseHandler);
    this._sceneEventHandlers.set('resume', resumeHandler);
    this._sceneEventHandlers.set('shutdown', shutdownHandler);
    this._sceneEventHandlers.set('destroy', shutdownHandler);
  }

  /**
   * Detach UI overlay from current Phaser Scene
   */
  detachFromScene(): void {
    if (!this._currentScene) return;

    // Remove all scene event listeners
    for (const [event, handler] of this._sceneEventHandlers) {
      this._currentScene.events.off(event, handler as any);
    }
    this._sceneEventHandlers.clear();

    delete (this as any)._currentScene;
  }

  /**
   * Pause UI overlay for scene transitions
   */
  pauseForScene(): void {
    this._isPaused = true;
    
    // Pause all components that support pausing
    for (const component of this._components.values()) {
      if ('pause' in component && typeof component.pause === 'function') {
        (component as any).pause();
      }
      // Disable interaction during pause
      component.setInteractive(false);
    }
  }

  /**
   * Resume UI overlay after scene transitions
   */
  resumeForScene(): void {
    this._isPaused = false;
    
    // Resume all components that support resuming
    for (const component of this._components.values()) {
      if ('resume' in component && typeof component.resume === 'function') {
        (component as any).resume();
      }
      // Re-enable interaction after resume
      component.setInteractive(component.isInteractive);
    }
  }

  /**
   * Destroy the UI overlay and clean up all components
   */
  /**
   * Destroy the UI overlay with comprehensive cleanup
   */
  async destroy(): Promise<void> {
    console.log(`[UIOverlayContainer] Destroying overlay with ${this._components.size} components`);
    
    // Detach from current scene first
    this.detachFromScene();
    
    // Clean up all components with proper error handling
    const componentIds = Array.from(this._components.keys());
    const cleanupPromises = componentIds.map(async (componentId) => {
      try {
        await this.removeComponent(componentId);
      } catch (error) {
        console.warn(`[UIOverlayContainer] Failed to remove component ${componentId}:`, error);
      }
    });
    
    // Wait for all component cleanup to complete
    await Promise.allSettled(cleanupPromises);
    
    // Clear component map
    this._components.clear();
    
    // Clear event handlers
    this._sceneEventHandlers.clear();
    
    // Remove from DOM if parent exists
    if (this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    
    // Reset state
    this._isInitialized = false;
    this._isVisible = false;
    delete (this as any)._canvas;
    delete (this as any)._currentScene;
    
    console.log('[UIOverlayContainer] Overlay destroyed successfully');
  }

  /**
   * Handle scene transitions with automatic cleanup
   */
  onSceneTransition(newScene?: Phaser.Scene): void {
    if (this._currentScene && this._currentScene !== newScene) {
      console.log(`[UIOverlayContainer] Scene transition detected: ${this._currentScene.scene.key} -> ${newScene?.scene.key || 'none'}`);
      
      // Cleanup components that should not persist across scenes
      this.cleanupNonPersistentComponents();
      
      // Detach from old scene
      this.detachFromScene();
      
      // Attach to new scene if provided
      if (newScene) {
        this.attachToScene(newScene);
      }
    }
  }

  /**
   * Clean up components that should not persist across scene transitions
   */
  private cleanupNonPersistentComponents(): void {
    const componentsToRemove: string[] = [];
    
    this._components.forEach((component, id) => {
      // Remove temporary components (tooltips, notifications, modals)
      if (component.element) {
        const classList = component.element.classList;
        if (classList.contains('ui-temporary') ||
            classList.contains('ui-notification') ||
            classList.contains('ui-tooltip') ||
            classList.contains('ui-modal-overlay')) {
          componentsToRemove.push(id);
        }
      }
    });
    
    // Remove the identified components
    componentsToRemove.forEach(async (componentId) => {
      try {
        await this.removeComponent(componentId);
        console.log(`[UIOverlayContainer] Cleaned up non-persistent component: ${componentId}`);
      } catch (error) {
        console.warn(`[UIOverlayContainer] Failed to cleanup component ${componentId}:`, error);
      }
    });
  }

  /**
   * Create the root overlay DOM element
   */
  private createOverlayElement(): HTMLDivElement {
    const element = document.createElement('div');
    element.id = 'ui-overlay';
    element.className = 'ui-overlay';
    
    // Base styles for overlay positioning
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.pointerEvents = 'none';
    element.style.zIndex = this._zIndex.toString();
    element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
    
    return element;
  }

  /**
   * Setup overlay element positioning relative to canvas
   */
  private setupOverlayElement(canvas: HTMLCanvasElement): void {
    const canvasContainer = canvas.parentElement;
    if (!canvasContainer) {
      throw new UIError('Canvas must have a parent element', 'CANVAS_NO_PARENT');
    }

    // Ensure canvas container has relative positioning
    const containerStyle = window.getComputedStyle(canvasContainer);
    if (containerStyle.position === 'static') {
      canvasContainer.style.position = 'relative';
    }

    // Add overlay to canvas container
    canvasContainer.appendChild(this._element);

    // Match canvas dimensions
    this.updateOverlayDimensions();

    // Listen for canvas resize
    this.setupResizeObserver();
  }

  /**
   * Update overlay dimensions to match canvas
   */
  private updateOverlayDimensions(): void {
    if (!this._canvas) return;

    const canvasRect = this._canvas.getBoundingClientRect();
    const containerRect = this._canvas.parentElement!.getBoundingClientRect();

    // Calculate offset from container
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;

    this._element.style.left = `${offsetX}px`;
    this._element.style.top = `${offsetY}px`;
    this._element.style.width = `${this._canvas.offsetWidth}px`;
    this._element.style.height = `${this._canvas.offsetHeight}px`;
  }

  /**
   * Setup ResizeObserver to track canvas size changes
   */
  private setupResizeObserver(): void {
    if (!this._canvas || typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(() => {
      this.updateOverlayDimensions();
    });

    resizeObserver.observe(this._canvas);
    
    // Store observer for cleanup
    (this._element as any)._resizeObserver = resizeObserver;
  }
}

/**
 * Scene UI Manager - Manages UI overlay for individual Phaser scenes
 * Provides scene-specific UI management with automatic lifecycle integration
 */
export class SceneUIManager {
  private _scene: Phaser.Scene;
  private _overlay: UIOverlayContainer;
  private _isActive: boolean = false;
  private _zIndexBase: number;

  constructor(scene: Phaser.Scene, zIndexBase: number = 1000) {
    this._scene = scene;
    this._zIndexBase = zIndexBase;
    this._overlay = new UIOverlayContainer({
      zIndex: this._zIndexBase
    });
  }

  /**
   * Initialize UI for the scene
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    await this._overlay.initialize(canvas);
    this._overlay.attachToScene(this._scene);
    this._isActive = true;
  }

  /**
   * Get the UI overlay container
   */
  get overlay(): UIOverlayContainer {
    return this._overlay;
  }

  /**
   * Check if UI is active
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Get the scene this UI manager is attached to
   */
  get scene(): Phaser.Scene {
    return this._scene;
  }

  /**
   * Add a component to the scene UI
   */
  async addComponent(component: IUIComponent): Promise<void> {
    if (!this._isActive) {
      throw new UIError('SceneUIManager not initialized', 'NOT_INITIALIZED');
    }
    return this._overlay.addComponent(component);
  }

  /**
   * Remove a component from the scene UI
   */
  async removeComponent(componentId: string): Promise<void> {
    return this._overlay.removeComponent(componentId);
  }

  /**
   * Get a component by ID
   */
  getComponent(componentId: string): IUIComponent | undefined {
    return this._overlay.getComponent(componentId);
  }

  /**
   * Show the UI overlay
   */
  show(): void {
    this._overlay.show();
  }

  /**
   * Hide the UI overlay
   */
  hide(): void {
    this._overlay.hide();
  }

  /**
   * Set z-index for the UI overlay
   */
  setZIndex(zIndex: number): void {
    this._zIndexBase = zIndex;
    this._overlay.setZIndex(zIndex);
  }

  /**
   * Destroy the scene UI manager with comprehensive cleanup
   */
  async destroy(): Promise<void> {
    console.log(`[SceneUIManager] Destroying UI for scene: ${this._scene.scene.key}`);
    
    this._isActive = false;
    
    // Trigger scene transition cleanup
    this._overlay.onSceneTransition();
    
    // Destroy the overlay
    await this._overlay.destroy();
    
    console.log(`[SceneUIManager] UI destroyed for scene: ${this._scene.scene.key}`);
  }
}

/**
 * Global UI Manager - Manages UI overlays across multiple Phaser scenes
 * Provides centralized UI management with scene-specific isolation
 */
export class GlobalUIManager {
  private static _instance?: GlobalUIManager;
  private _sceneManagers: Map<string, SceneUIManager> = new Map();
  private _canvas?: HTMLCanvasElement;
  private _nextZIndex: number = 1000;

  private constructor() {
    // Singleton pattern
  }

  /**
   * Get the global UI manager instance
   */
  static getInstance(): GlobalUIManager {
    if (!GlobalUIManager._instance) {
      GlobalUIManager._instance = new GlobalUIManager();
    }
    return GlobalUIManager._instance;
  }

  /**
   * Initialize the global UI manager with canvas
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this._canvas = canvas;
  }

  /**
   * Create a UI manager for a specific scene
   */
  async createSceneUI(scene: Phaser.Scene): Promise<SceneUIManager> {
    if (!this._canvas) {
      throw new UIError('Canvas not set. Call setCanvas() first.', 'CANVAS_NOT_SET');
    }

    const sceneKey = scene.scene.key;
    
    // Remove existing scene UI if present
    if (this._sceneManagers.has(sceneKey)) {
      await this.destroySceneUI(sceneKey);
    }

    // Create new scene UI manager
    const sceneUIManager = new SceneUIManager(scene, this._nextZIndex);
    await sceneUIManager.initialize(this._canvas);
    
    this._sceneManagers.set(sceneKey, sceneUIManager);
    this._nextZIndex += 100; // Reserve z-index range for each scene

    return sceneUIManager;
  }

  /**
   * Get UI manager for a specific scene
   */
  getSceneUI(sceneKey: string): SceneUIManager | undefined {
    return this._sceneManagers.get(sceneKey);
  }

  /**
   * Destroy UI manager for a specific scene with enhanced cleanup
   */
  async destroySceneUI(sceneKey: string): Promise<void> {
    console.log(`[GlobalUIManager] Destroying UI for scene: ${sceneKey}`);
    
    const sceneUIManager = this._sceneManagers.get(sceneKey);
    if (sceneUIManager) {
      await sceneUIManager.destroy();
      this._sceneManagers.delete(sceneKey);
      console.log(`[GlobalUIManager] UI destroyed for scene: ${sceneKey}`);
    } else {
      console.warn(`[GlobalUIManager] No UI manager found for scene: ${sceneKey}`);
    }
  }

  /**
   * Handle scene transitions across the entire application
   */
  onGlobalSceneTransition(fromSceneKey?: string, toSceneKey?: string): void {
    console.log(`[GlobalUIManager] Global scene transition: ${fromSceneKey || 'none'} -> ${toSceneKey || 'none'}`);
    
    // Clean up old scene UI if it exists
    if (fromSceneKey && this._sceneManagers.has(fromSceneKey)) {
      // Don't destroy immediately, let it handle its own cleanup
      const sceneUIManager = this._sceneManagers.get(fromSceneKey);
      if (sceneUIManager) {
        // Trigger cleanup for non-persistent components
        sceneUIManager.overlay.onSceneTransition();
      }
    }
  }

  /**
   * Get all active scene UI managers
   */
  getAllSceneUIs(): ReadonlyMap<string, SceneUIManager> {
    return this._sceneManagers;
  }

  /**
   * Destroy all scene UI managers
   */
  async destroyAll(): Promise<void> {
    const destroyPromises = Array.from(this._sceneManagers.keys()).map(
      sceneKey => this.destroySceneUI(sceneKey)
    );
    await Promise.all(destroyPromises);
  }
}

/**
 * Legacy UIManager class for backward compatibility
 * Wraps UIOverlayContainer with simpler interface
 */
export class UIManager {
  private container: UIOverlayContainer;
  
  constructor(canvas: HTMLCanvasElement, config?: Partial<UIOverlayConfig>) {
    this.container = new UIOverlayContainer(config);
    this.container.initialize(canvas);
  }

  /**
   * Add a component using HTMLElement (simplified interface)
   */
  addComponent(id: string, element: HTMLElement): void {
    // This would need a wrapper to convert HTMLElement to IUIComponent
    // For now, throw an error to indicate the new interface should be used
    throw new UIError(
      'UIManager.addComponent is deprecated. Use UIOverlayContainer.addComponent with IUIComponent instead.',
      'DEPRECATED_METHOD'
    );
  }

  /**
   * Remove a component by ID
   */
  removeComponent(id: string): void {
    this.container.removeComponent(id);
  }

  /**
   * Get component element by ID
   */
  getComponent(id: string): HTMLElement | undefined {
    const component = this.container.getComponent(id);
    return component?.element;
  }

  /**
   * Show the UI overlay
   */
  show(): void {
    this.container.show();
  }

  /**
   * Hide the UI overlay
   */
  hide(): void {
    this.container.hide();
  }

  /**
   * Get the container instance for advanced usage
   */
  getContainer(): UIOverlayContainer {
    return this.container;
  }
}