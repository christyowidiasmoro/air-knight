/**
 * DataBoundComponent - Base class for UI components with automatic data binding
 * Provides reactive data binding, change detection, and automatic UI updates
 */

import { UIComponent } from './UIComponent';
import { UIPosition, UISize, UIComponentConfig, UIError, UIValidationError } from '../../types/ui';
import { EventBus } from '../../systems/EventBus';

export interface DataBinding {
  property: string;
  dataPath: string;
  transformer?: (value: any) => any;
  validator?: (value: any) => boolean;
  errorMessage?: string;
  twoWay?: boolean;
}

export interface DataBindingConfig {
  bindings: DataBinding[];
  autoUpdate?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
}

export interface WatchedProperty {
  path: string;
  lastValue: any;
  callback: (newValue: any, oldValue: any) => void;
}

export class DataBoundComponent extends UIComponent {
  private dataBindings = new Map<string, DataBinding>();
  private boundData: any = {};
  private watchedProperties = new Map<string, WatchedProperty>();
  private autoUpdate = true;
  private validateOnChange = true;
  private debounceMs = 0;
  private debounceTimeouts = new Map<string, number>();
  private changeListeners = new Map<string, (event: Event) => void>();
  private eventBus: EventBus;

  constructor(config: UIComponentConfig & { dataBindingConfig?: DataBindingConfig }) {
    super(config);
    
    this.eventBus = EventBus.getInstance();
    
    if (config.dataBindingConfig) {
      this.setupDataBinding(config.dataBindingConfig);
    }
    
    this.setupInternalEventListeners();
  }

  /**
   * Setup data binding configuration
   */
  private setupDataBinding(config: DataBindingConfig): void {
    this.autoUpdate = config.autoUpdate !== false;
    this.validateOnChange = config.validateOnChange !== false;
    this.debounceMs = config.debounceMs || 0;
    
    config.bindings.forEach(binding => this.addDataBinding(binding));
  }

  /**
   * Add a data binding between a component property and data path
   */
  public addDataBinding(binding: DataBinding): void {
    this.validateDataBinding(binding);
    this.dataBindings.set(binding.property, binding);
    
    // Setup two-way binding if specified
    if (binding.twoWay) {
      this.setupTwoWayBinding(binding);
    }
  }

  /**
   * Remove a data binding
   */
  public removeDataBinding(property: string): void {
    const binding = this.dataBindings.get(property);
    if (binding) {
      // Remove two-way binding listeners
      if (binding.twoWay) {
        this.removeTwoWayBinding(binding);
      }
      
      this.dataBindings.delete(property);
    }
  }

  /**
   * Clear all data bindings
   */
  public clearDataBindings(): void {
    // Remove all two-way binding listeners
    this.dataBindings.forEach(binding => {
      if (binding.twoWay) {
        this.removeTwoWayBinding(binding);
      }
    });
    
    this.dataBindings.clear();
    this.clearDebounceTimeouts();
  }

  /**
   * Bind data object to the component
   */
  public bindData(data: any): void {
    this.boundData = data || {};
    this.updateAllBoundProperties();
    this.startWatching();
  }

  /**
   * Get currently bound data
   */
  public getBoundData(): any {
    return this.boundData;
  }

  /**
   * Update a specific bound property
   */
  public updateBoundProperty(dataPath: string, value: any): void {
    this.setNestedValue(this.boundData, dataPath, value);
    this.processDataChange(dataPath, value);
  }

  /**
   * Get value from bound data by path
   */
  public getBoundValue(dataPath: string): any {
    return this.getNestedValue(this.boundData, dataPath);
  }

  /**
   * Force update all bound properties
   */
  public updateAllBoundProperties(): void {
    this.dataBindings.forEach((binding, property) => {
      const value = this.getNestedValue(this.boundData, binding.dataPath);
      this.updateComponentProperty(property, value, binding);
    });
  }

  /**
   * Watch a data path for changes
   */
  public watchProperty(path: string, callback: (newValue: any, oldValue: any) => void): void {
    const currentValue = this.getNestedValue(this.boundData, path);
    this.watchedProperties.set(path, {
      path,
      lastValue: this.deepClone(currentValue),
      callback
    });
  }

  /**
   * Stop watching a data path
   */
  public unwatchProperty(path: string): void {
    this.watchedProperties.delete(path);
  }

  /**
   * Check for changes in watched properties
   */
  public checkForChanges(): void {
    this.watchedProperties.forEach((watched, path) => {
      const currentValue = this.getNestedValue(this.boundData, path);
      
      if (!this.deepEqual(currentValue, watched.lastValue)) {
        const oldValue = watched.lastValue;
        watched.lastValue = this.deepClone(currentValue);
        watched.callback(currentValue, oldValue);
      }
    });
  }

  /**
   * Setup automatic change detection
   */
  private startWatching(): void {
    if (this.autoUpdate) {
      // Check for changes periodically
      const checkInterval = setInterval(() => {
        this.checkForChanges();
      }, 100); // Check every 100ms

      // Store interval reference for cleanup
      (this as any)._watchInterval = checkInterval;
    }
  }

  /**
   * Stop automatic change detection
   */
  private stopWatching(): void {
    if ((this as any)._watchInterval) {
      clearInterval((this as any)._watchInterval);
      (this as any)._watchInterval = null;
    }
    // Clear watched properties
    this.watchedProperties.clear();
  }

  /**
   * Process a data change and update bound UI
   */
  private processDataChange(dataPath: string, newValue: any): void {
    // Find bindings affected by this data path change
    this.dataBindings.forEach((binding, property) => {
      if (this.isPathMatch(binding.dataPath, dataPath)) {
        const value = this.getNestedValue(this.boundData, binding.dataPath);
        this.updateComponentProperty(property, value, binding);
      }
    });

    // Emit data change event
    this.eventBus.emit('component:data:changed', {
      componentId: this.id,
      dataPath,
      value: newValue,
      timestamp: Date.now()
    });
  }

  /**
   * Update a component property with bound data
   */
  private updateComponentProperty(property: string, value: any, binding: DataBinding): void {
    try {
      // Validate value if validator is provided
      if (binding.validator && !binding.validator(value)) {
        throw new UIValidationError(
          property,
          binding.errorMessage || 'Data validation failed',
          this.id
        );
      }

      // Transform value if transformer is provided
      const transformedValue = binding.transformer ? binding.transformer(value) : value;

      // Apply debouncing if configured
      if (this.debounceMs > 0) {
        this.debounceUpdate(property, transformedValue);
      } else {
        this.applyPropertyUpdate(property, transformedValue);
      }
    } catch (error) {
      this.handleBindingError(error as Error, binding);
    }
  }

  /**
   * Apply debounced property update
   */
  private debounceUpdate(property: string, value: any): void {
    // Clear existing timeout
    const existingTimeout = this.debounceTimeouts.get(property);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeoutId = window.setTimeout(() => {
      this.applyPropertyUpdate(property, value);
      this.debounceTimeouts.delete(property);
    }, this.debounceMs);

    this.debounceTimeouts.set(property, timeoutId);
  }

  /**
   * Apply property update to component
   */
  private applyPropertyUpdate(property: string, value: any): void {
    if (property === 'textContent') {
      this.element.textContent = String(value);
    } else if (property === 'innerHTML') {
      this.element.innerHTML = String(value);
    } else if (property === 'value' && 'value' in this.element) {
      (this.element as HTMLInputElement).value = String(value);
    } else if (property.startsWith('attr.')) {
      const attrName = property.substring(5);
      this.element.setAttribute(attrName, String(value));
    } else if (property.startsWith('style.')) {
      const styleProp = property.substring(6);
      (this.element.style as any)[styleProp] = value;
    } else if (property.startsWith('class.')) {
      const className = property.substring(6);
      this.element.classList.toggle(className, Boolean(value));
    } else if (property in this.element) {
      (this.element as any)[property] = value;
    } else {
      console.warn(`Unknown property '${property}' for component '${this.id}'`);
    }

    // Emit property update event
    this.eventBus.emit('component:property:updated', {
      componentId: this.id,
      property,
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Setup two-way data binding for input elements
   */
  private setupTwoWayBinding(binding: DataBinding): void {
    if (!this.canHaveTwoWayBinding()) {
      console.warn(`Two-way binding not supported for element type '${this.element.tagName}'`);
      return;
    }

    const eventType = this.getTwoWayBindingEvent();
    const listener = (event: Event) => {
      const target = event.target as HTMLInputElement;
      let value: any = target.value;

      // Convert value based on input type
      if (target.type === 'number') {
        value = parseFloat(value) || 0;
      } else if (target.type === 'checkbox') {
        value = target.checked;
      }

      // Validate if validator is provided
      if (binding.validator && !binding.validator(value)) {
        // Revert to previous value
        const currentValue = this.getNestedValue(this.boundData, binding.dataPath);
        this.updateComponentProperty(binding.property, currentValue, binding);
        return;
      }

      // Update bound data
      this.setNestedValue(this.boundData, binding.dataPath, value);
      
      // Emit two-way binding update
      this.eventBus.emit('component:twoway:updated', {
        componentId: this.id,
        property: binding.property,
        dataPath: binding.dataPath,
        value,
        timestamp: Date.now()
      });
    };

    this.element.addEventListener(eventType, listener);
    this.changeListeners.set(binding.property, listener);
  }

  /**
   * Remove two-way binding listeners
   */
  private removeTwoWayBinding(binding: DataBinding): void {
    const listener = this.changeListeners.get(binding.property);
    if (listener) {
      const eventType = this.getTwoWayBindingEvent();
      this.element.removeEventListener(eventType, listener);
      this.changeListeners.delete(binding.property);
    }
  }

  /**
   * Setup internal event listeners
   */
  private setupInternalEventListeners(): void {
    // Listen for external data updates
    this.eventBus.on('data:updated', (data: { path: string; value: any }) => {
      if (this.boundData && this.autoUpdate) {
        this.updateBoundProperty(data.path, data.value);
      }
    });
  }

  /**
   * Check if element can have two-way binding
   */
  private canHaveTwoWayBinding(): boolean {
    const tagName = this.element.tagName.toLowerCase();
    return ['input', 'textarea', 'select'].includes(tagName);
  }

  /**
   * Get appropriate event type for two-way binding
   */
  private getTwoWayBindingEvent(): string {
    const tagName = this.element.tagName.toLowerCase();
    const inputType = (this.element as HTMLInputElement).type;

    if (tagName === 'input' && ['checkbox', 'radio'].includes(inputType)) {
      return 'change';
    }
    
    return 'input';
  }

  /**
   * Validate data binding configuration
   */
  private validateDataBinding(binding: DataBinding): void {
    if (!binding.property) {
      throw new UIValidationError('property', 'Property name is required');
    }
    
    if (!binding.dataPath) {
      throw new UIValidationError('dataPath', 'Data path is required');
    }
  }

  /**
   * Check if data paths match (supports wildcard patterns)
   */
  private isPathMatch(bindingPath: string, changePath: string): boolean {
    // Exact match
    if (bindingPath === changePath) return true;
    
    // Check if change path starts with binding path (parent changed)
    if (changePath.startsWith(bindingPath + '.')) return true;
    
    // Check if binding path starts with change path (child of changed parent)
    if (bindingPath.startsWith(changePath + '.')) return true;
    
    return false;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    if (!obj || !path) return;
    
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    const target = keys.reduce((current, key) => {
      if (current[key] === undefined) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    if (lastKey) {
      target[lastKey] = value;
    }
  }

  /**
   * Deep clone an object
   */
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Deep equality check
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => this.deepEqual(a[key], b[key]));
    }
    
    return false;
  }

  /**
   * Clear all debounce timeouts
   */
  private clearDebounceTimeouts(): void {
    this.debounceTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.debounceTimeouts.clear();
  }

  /**
   * Handle binding errors
   */
  private handleBindingError(error: Error, binding: DataBinding): void {
    console.error(`Data binding error for ${this.id}.${binding.property}:`, error);
    
    this.eventBus.emit('component:binding:error', {
      componentId: this.id,
      binding,
      error,
      timestamp: Date.now()
    });
  }

  /**
   * Cleanup when component is destroyed
   */
  public destroy(): void {
    this.stopWatching();
    this.clearDataBindings();
    this.clearDebounceTimeouts();
    
    // Remove all event listeners
    this.changeListeners.forEach((listener, property) => {
      const binding = this.dataBindings.get(property);
      if (binding) {
        this.removeTwoWayBinding(binding);
      }
    });
    
    super.destroy();
  }

  /**
   * Get current data binding configuration
   */
  public getDataBindings(): Map<string, DataBinding> {
    return new Map(this.dataBindings);
  }

  /**
   * Get watched properties
   */
  public getWatchedProperties(): string[] {
    return Array.from(this.watchedProperties.keys());
  }
}