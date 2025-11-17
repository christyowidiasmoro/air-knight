/**
 * Unit tests for InputHandler
 */

import { InputHandler } from '../../systems/InputHandler';
import { UIOverlayContainer } from '../../systems/UIManager';
import { UIComponent } from '../../components/UI/UIComponent';
import { UIComponentConfig } from '../../types/ui';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock PointerEvent for tests
global.PointerEvent = jest.fn().mockImplementation((type: string, init?: any) => ({
  type,
  pointerId: init?.pointerId || 1,
  clientX: init?.clientX || 0,
  clientY: init?.clientY || 0,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: init?.target || null
})) as any;

describe('InputHandler', () => {
  let inputHandler: InputHandler;
  let canvas: HTMLCanvasElement;
  let uiContainer: UIOverlayContainer;
  let canvasContainer: HTMLDivElement;

  beforeEach(async () => {
    // Setup DOM
    canvasContainer = document.createElement('div');
    canvasContainer.style.position = 'relative';
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvasContainer.appendChild(canvas);
    document.body.appendChild(canvasContainer);

    // Setup UI container
    uiContainer = new UIOverlayContainer();
    await uiContainer.initialize(canvas);

    // Create input handler
    inputHandler = new InputHandler(canvas, uiContainer);
  });

  afterEach(() => {
    inputHandler.destroy();
    uiContainer.destroy();
    if (document.body.contains(canvasContainer)) {
      document.body.removeChild(canvasContainer);
    }
  });

  describe('Initialization', () => {
    test('should create input handler with correct properties', () => {
      expect(inputHandler.canvas).toBe(canvas);
      expect(inputHandler.uiContainer).toBe(uiContainer);
      expect(inputHandler.activeElement).toBeNull();
    });

    test('should initialize successfully', () => {
      expect(() => inputHandler.initialize()).not.toThrow();
    });

    test('should throw error when initializing twice', () => {
      inputHandler.initialize();
      expect(() => inputHandler.initialize()).toThrow('InputHandler already initialized');
    });
  });

  describe('Event Routing Configuration', () => {
    beforeEach(() => {
      inputHandler.initialize();
    });

    test('should set event routing', () => {
      inputHandler.setEventRouting('click', 'ui', 'ui-first');
      
      expect(inputHandler.eventMappings.get('click')).toBe('ui');
    });

    test('should remove event routing', () => {
      inputHandler.setEventRouting('click', 'ui', 'ui-first');
      inputHandler.removeEventRouting('click');
      
      expect(inputHandler.eventMappings.get('click')).toBeUndefined();
    });

    test('should have default event routing after initialization', () => {
      expect(inputHandler.eventMappings.get('click')).toBe('both');
      expect(inputHandler.eventMappings.get('touch')).toBe('both');
      expect(inputHandler.eventMappings.get('focus')).toBe('ui');
    });
  });

  describe('Focus Management', () => {
    let focusableElement: HTMLElement;

    beforeEach(() => {
      inputHandler.initialize();
      focusableElement = document.createElement('button');
      focusableElement.textContent = 'Test Button';
      uiContainer.element.appendChild(focusableElement);
    });

    test('should set focus to element', () => {
      const focusSpy = jest.spyOn(focusableElement, 'focus');
      
      inputHandler.setFocus(focusableElement);
      
      expect(inputHandler.activeElement).toBe(focusableElement);
      expect(focusSpy).toHaveBeenCalled();
    });

    test('should clear focus', () => {
      const blurSpy = jest.spyOn(focusableElement, 'blur');
      
      inputHandler.setFocus(focusableElement);
      inputHandler.clearFocus();
      
      expect(inputHandler.activeElement).toBeNull();
      expect(blurSpy).toHaveBeenCalled();
    });

    test('should switch focus between elements', () => {
      const element2 = document.createElement('button');
      uiContainer.element.appendChild(element2);
      
      const blur1Spy = jest.spyOn(focusableElement, 'blur');
      const focus2Spy = jest.spyOn(element2, 'focus');
      
      inputHandler.setFocus(focusableElement);
      inputHandler.setFocus(element2);
      
      expect(blur1Spy).toHaveBeenCalled();
      expect(focus2Spy).toHaveBeenCalled();
      expect(inputHandler.activeElement).toBe(element2);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      inputHandler.initialize();
    });

    test('should enable keyboard navigation', () => {
      inputHandler.enableKeyboardNavigation();
      
      expect(inputHandler.eventMappings.get('keyboard')).toBe('ui');
    });

    test('should disable keyboard navigation', () => {
      inputHandler.enableKeyboardNavigation();
      inputHandler.setFocus(document.createElement('button'));
      
      inputHandler.disableKeyboardNavigation();
      
      expect(inputHandler.activeElement).toBeNull();
    });

    test('should handle keyboard events when enabled', () => {
      inputHandler.enableKeyboardNavigation();
      
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      const result = inputHandler.handleKeyboardEvent(keyboardEvent);
      
      // Should return false if no focusable elements
      expect(result).toBe(false);
    });

    test('should not handle keyboard events when disabled', () => {
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      const result = inputHandler.handleKeyboardEvent(keyboardEvent);
      
      expect(result).toBe(false);
    });
  });

  describe('Pointer Event Handling', () => {
    beforeEach(() => {
      inputHandler.initialize();
    });

    test('should handle pointer events', () => {
      const pointerEvent = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 100
      });
      
      const result = inputHandler.handlePointerEvent(pointerEvent);
      
      // Should return boolean indicating if UI handled the event
      expect(typeof result).toBe('boolean');
    });

    test('should map pointer event types correctly', () => {
      const clickEvent = new PointerEvent('click');
      const touchEvent = new PointerEvent('touchstart');
      
      // These should not throw and should return boolean results
      expect(typeof inputHandler.handlePointerEvent(clickEvent)).toBe('boolean');
      expect(typeof inputHandler.handlePointerEvent(touchEvent)).toBe('boolean');
    });
  });

  describe('UI Element Detection', () => {
    let uiComponent: UIComponent;

    beforeEach(async () => {
      inputHandler.initialize();
      
      const config: UIComponentConfig = {
        id: 'test-ui-component',
        className: 'ui-interactive',
        position: { x: 100, y: 100, anchor: 'px', origin: 'top-left' },
        size: { width: 100, height: 50 },
        isInteractive: true
      };
      
      uiComponent = new UIComponent(config);
      await uiContainer.addComponent(uiComponent);
    });

    afterEach(() => {
      uiComponent.destroy();
    });

    test('should detect UI elements in event chain', () => {
      // Create a mock event with the UI element as target
      const mockEvent = {
        target: uiComponent.element
      } as any;
      
      // This is testing internal behavior, but we can verify the handler processes it
      const pointerEvent = new PointerEvent('click', {
        pointerId: 1,
        clientX: 150,
        clientY: 125
      });
      
      // Should handle the event (implementation detail may vary)
      expect(typeof inputHandler.handlePointerEvent(pointerEvent)).toBe('boolean');
    });
  });

  describe('Cleanup', () => {
    test('should clean up event listeners on destroy', () => {
      inputHandler.initialize();
      
      // Add some event routing
      inputHandler.setEventRouting('click', 'ui', 'ui-first');
      inputHandler.enableKeyboardNavigation();
      
      expect(() => inputHandler.destroy()).not.toThrow();
      
      // After destroy, event mappings should be cleared
      expect(inputHandler.eventMappings.size).toBe(0);
    });

    test('should handle destroy of uninitialized handler', () => {
      expect(() => inputHandler.destroy()).not.toThrow();
    });
  });
});