/**
 * Input System - Basic unified input handling for touch/mouse/keyboard
 */

export interface InputEvent {
  type: 'pointer' | 'keyboard';
  action: 'down' | 'up' | 'move';
  x?: number;
  y?: number;
  key?: string;
  timestamp: number;
}

export type InputHandler = (event: InputEvent) => void;

export class InputSystem {
  private static instance: InputSystem;
  private handlers: Set<InputHandler> = new Set();
  private isTouch = false;
  private isKeyboard = false;

  private constructor() {
    this.detectInputCapabilities();
    this.setupEventListeners();
  }

  public static getInstance(): InputSystem {
    if (!InputSystem.instance) {
      InputSystem.instance = new InputSystem();
    }
    return InputSystem.instance;
  }

  private detectInputCapabilities(): void {
    // Detect touch support
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Detect keyboard (assume available on desktop)
    this.isKeyboard = !this.isMobileDevice();
  }

  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private setupEventListeners(): void {
    // Pointer events (handles both mouse and touch)
    if (this.isTouch) {
      document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
      document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    } else {
      document.addEventListener('mousedown', this.handleMouseDown.bind(this));
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    // Keyboard events
    if (this.isKeyboard) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    // Prevent context menu on mobile
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Event handlers
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      this.emitEvent({
        type: 'pointer',
        action: 'down',
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      });
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.changedTouches[0];
    if (touch) {
      this.emitEvent({
        type: 'pointer',
        action: 'up',
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      });
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      this.emitEvent({
        type: 'pointer',
        action: 'move',
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      });
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    this.emitEvent({
      type: 'pointer',
      action: 'down',
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    });
  }

  private handleMouseUp(event: MouseEvent): void {
    this.emitEvent({
      type: 'pointer',
      action: 'up',
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    this.emitEvent({
      type: 'pointer',
      action: 'move',
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.emitEvent({
      type: 'keyboard',
      action: 'down',
      key: event.code,
      timestamp: Date.now()
    });
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.emitEvent({
      type: 'keyboard',
      action: 'up',
      key: event.code,
      timestamp: Date.now()
    });
  }

  private emitEvent(event: InputEvent): void {
    this.handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Input handler error:', error);
      }
    });
  }

  // Public API
  public addHandler(handler: InputHandler): void {
    this.handlers.add(handler);
  }

  public removeHandler(handler: InputHandler): void {
    this.handlers.delete(handler);
  }

  public removeAllHandlers(): void {
    this.handlers.clear();
  }

  // Device info
  public isTouchDevice(): boolean {
    return this.isTouch;
  }

  public hasKeyboard(): boolean {
    return this.isKeyboard;
  }

  public getDeviceInfo() {
    return {
      isMobile: this.isMobileDevice(),
      hasTouch: this.isTouch,
      hasKeyboard: this.isKeyboard,
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }
}

// Export singleton instance
export const inputSystem = InputSystem.getInstance();