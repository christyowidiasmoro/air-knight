/**
 * Input System - Unified input handling for touch and keyboard/mouse
 * Following Cross-Platform Compatibility principle
 */

import type { 
  InputState, 
  TouchState, 
  KeyboardState, 
  MouseState, 
  GameSystem,
  Vector2 
} from '@/types';
import { eventBus, GAME_EVENTS } from './EventBus';

export class InputSystem implements GameSystem {
  readonly name = 'InputSystem';

  private state: {
    keyboard: {
      pressed: Set<string>;
      justPressed: Set<string>;
      justReleased: Set<string>;
    };
    touch: {
      active: boolean;
      x: number;
      y: number;
      startX: number;
      startY: number;
      deltaX: number;
      deltaY: number;
    };
    mouse: {
      x: number;
      y: number;
      leftButton: boolean;
      rightButton: boolean;
    };
  } = {
    keyboard: {
      pressed: new Set(),
      justPressed: new Set(),
      justReleased: new Set(),
    },
    touch: {
      active: false,
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
    },
    mouse: {
      x: 0,
      y: 0,
      leftButton: false,
      rightButton: false,
    },
  };

  private previousState: any;
  private touchThreshold = 10; // Minimum movement for touch detection
  private gameCanvas: HTMLCanvasElement | null = null;

  constructor() {
    this.previousState = JSON.parse(JSON.stringify(this.state));
  }

  async initialize(): Promise<void> {
    this.gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    
    if (!this.gameCanvas) {
      console.warn('Game canvas not found, input system may not work correctly');
    }

    this.setupEventListeners();
    console.log('InputSystem initialized');
  }

  async shutdown(): Promise<void> {
    this.removeEventListeners();
    console.log('InputSystem shutdown');
  }

  update(deltaTime: number): void {
    // Update just pressed/released states
    this.updateKeyboardState();
    this.updateTouchDelta();
    
    // Store previous state
    this.previousState = JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Get current input state
   */
  getState(): Readonly<InputState> {
    return this.state;
  }

  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.state.keyboard.pressed.has(key.toLowerCase());
  }

  /**
   * Check if a key was just pressed this frame
   */
  isKeyJustPressed(key: string): boolean {
    return this.state.keyboard.justPressed.has(key.toLowerCase());
  }

  /**
   * Check if a key was just released this frame
   */
  isKeyJustReleased(key: string): boolean {
    return this.state.keyboard.justReleased.has(key.toLowerCase());
  }

  /**
   * Get touch position
   */
  getTouchPosition(): Vector2 {
    return {
      x: this.state.touch.x,
      y: this.state.touch.y,
    };
  }

  /**
   * Get touch delta (movement since last frame)
   */
  getTouchDelta(): Vector2 {
    return {
      x: this.state.touch.deltaX,
      y: this.state.touch.deltaY,
    };
  }

  /**
   * Check if touch is active
   */
  isTouchActive(): boolean {
    return this.state.touch.active;
  }

  /**
   * Get mouse position
   */
  getMousePosition(): Vector2 {
    return {
      x: this.state.mouse.x,
      y: this.state.mouse.y,
    };
  }

  /**
   * Check if mouse button is pressed
   */
  isMouseButtonPressed(button: 'left' | 'right'): boolean {
    return button === 'left' ? this.state.mouse.leftButton : this.state.mouse.rightButton;
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    if (this.gameCanvas) {
      this.gameCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
      this.gameCanvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
      this.gameCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.gameCanvas.addEventListener('contextmenu', this.preventDefault.bind(this));
    }

    // Touch events
    if (this.gameCanvas) {
      this.gameCanvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      this.gameCanvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
      this.gameCanvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      this.gameCanvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
    }

    // Prevent scrolling and zoom on mobile
    document.addEventListener('touchstart', this.preventDefaultTouch.bind(this), { passive: false });
    document.addEventListener('touchmove', this.preventDefaultTouch.bind(this), { passive: false });
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));

    if (this.gameCanvas) {
      this.gameCanvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
      this.gameCanvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
      this.gameCanvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.gameCanvas.removeEventListener('contextmenu', this.preventDefault.bind(this));
      
      this.gameCanvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      this.gameCanvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
      this.gameCanvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      this.gameCanvas.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
    }

    document.removeEventListener('touchstart', this.preventDefaultTouch.bind(this));
    document.removeEventListener('touchmove', this.preventDefaultTouch.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    
    if (!this.state.keyboard.pressed.has(key)) {
      this.state.keyboard.justPressed.add(key);
      eventBus.emit(GAME_EVENTS.INPUT_KEY_DOWN, { key, code: event.code });
    }
    
    this.state.keyboard.pressed.add(key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.state.keyboard.pressed.delete(key);
    this.state.keyboard.justReleased.add(key);
    
    eventBus.emit(GAME_EVENTS.INPUT_KEY_UP, { key, code: event.code });
  }

  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    
    if (event.button === 0) {
      this.state.mouse.leftButton = true;
    } else if (event.button === 2) {
      this.state.mouse.rightButton = true;
    }
    
    this.updateMousePosition(event);
  }

  private handleMouseUp(event: MouseEvent): void {
    event.preventDefault();
    
    if (event.button === 0) {
      this.state.mouse.leftButton = false;
    } else if (event.button === 2) {
      this.state.mouse.rightButton = false;
    }
    
    this.updateMousePosition(event);
  }

  private handleMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = this.getCanvasRect();
      
      if (rect && touch) {
        this.state.touch.active = true;
        this.state.touch.x = touch.clientX - rect.left;
        this.state.touch.y = touch.clientY - rect.top;
        this.state.touch.startX = this.state.touch.x;
        this.state.touch.startY = this.state.touch.y;
        this.state.touch.deltaX = 0;
        this.state.touch.deltaY = 0;
        
        eventBus.emit(GAME_EVENTS.INPUT_TOUCH_START, {
          x: this.state.touch.x,
          y: this.state.touch.y,
        });
      }
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    if (event.touches.length > 0 && this.state.touch.active) {
      const touch = event.touches[0];
      const rect = this.getCanvasRect();
      
      if (rect && touch) {
        const newX = touch.clientX - rect.left;
        const newY = touch.clientY - rect.top;
        
        this.state.touch.deltaX = newX - this.state.touch.x;
        this.state.touch.deltaY = newY - this.state.touch.y;
        this.state.touch.x = newX;
        this.state.touch.y = newY;
        
        eventBus.emit(GAME_EVENTS.INPUT_TOUCH_MOVE, {
          x: this.state.touch.x,
          y: this.state.touch.y,
          deltaX: this.state.touch.deltaX,
          deltaY: this.state.touch.deltaY,
        });
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    this.state.touch.active = false;
    this.state.touch.deltaX = 0;
    this.state.touch.deltaY = 0;
    
    eventBus.emit(GAME_EVENTS.INPUT_TOUCH_END, {
      x: this.state.touch.x,
      y: this.state.touch.y,
    });
  }

  private updateMousePosition(event: MouseEvent): void {
    const rect = this.getCanvasRect();
    if (rect) {
      this.state.mouse.x = event.clientX - rect.left;
      this.state.mouse.y = event.clientY - rect.top;
    }
  }

  private updateKeyboardState(): void {
    this.state.keyboard.justPressed.clear();
    this.state.keyboard.justReleased.clear();
  }

  private updateTouchDelta(): void {
    if (!this.state.touch.active) {
      this.state.touch.deltaX = 0;
      this.state.touch.deltaY = 0;
    }
  }

  private getCanvasRect(): DOMRect | null {
    return this.gameCanvas?.getBoundingClientRect() ?? null;
  }

  private preventDefault(event: Event): void {
    event.preventDefault();
  }

  private preventDefaultTouch(event: TouchEvent): void {
    // Prevent scrolling and zooming on mobile
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }
}

// Input helper functions
export const inputHelpers = {
  /**
   * Convert screen coordinates to game coordinates
   */
  screenToGame(screenX: number, screenY: number, gameWidth: number, gameHeight: number): Vector2 {
    // This would depend on the game's viewport and scaling
    // For now, return as-is
    return { x: screenX, y: screenY };
  },

  /**
   * Check if touch/mouse is within a rectangular area
   */
  isPointInRect(
    point: Vector2,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  },

  /**
   * Get distance between two points
   */
  getDistance(point1: Vector2, point2: Vector2): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
};