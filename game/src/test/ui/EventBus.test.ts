/**
 * Unit tests for EventBus UI event extensions
 */

import { 
  EventBus, 
  eventBus, 
  GameEvents,
  UIComponentEventData,
  UIVisibilityChangeData,
  UIInteractionChangeData,
  UIFocusChangeData,
  UILayoutUpdateData,
  UIBreakpointChangeData,
  UIOrientationChangeData
} from '../../systems/EventBus';

describe('EventBus UI Extensions', () => {
  let testEventBus: EventBus;

  beforeEach(() => {
    testEventBus = EventBus.getInstance();
    // Clear any existing listeners
    testEventBus.removeAllListeners();
  });

  afterEach(() => {
    testEventBus.removeAllListeners();
  });

  describe('UI Event Constants', () => {
    test('should have all UI event constants defined', () => {
      expect(GameEvents.UI_COMPONENT_MOUNTED).toBe('ui:component:mounted');
      expect(GameEvents.UI_COMPONENT_UNMOUNTED).toBe('ui:component:unmounted');
      expect(GameEvents.UI_COMPONENT_VISIBILITY_CHANGED).toBe('ui:component:visibility:changed');
      expect(GameEvents.UI_COMPONENT_INTERACTION_CHANGED).toBe('ui:component:interaction:changed');
      expect(GameEvents.UI_OVERLAY_SHOWN).toBe('ui:overlay:shown');
      expect(GameEvents.UI_OVERLAY_HIDDEN).toBe('ui:overlay:hidden');
      expect(GameEvents.UI_FOCUS_CHANGED).toBe('ui:focus:changed');
      expect(GameEvents.UI_LAYOUT_UPDATED).toBe('ui:layout:updated');
      expect(GameEvents.UI_BREAKPOINT_CHANGED).toBe('ui:breakpoint:changed');
      expect(GameEvents.UI_ORIENTATION_CHANGED).toBe('ui:orientation:changed');
    });
  });

  describe('UI Component Events', () => {
    test('should emit and receive component mounted event', () => {
      const handler = jest.fn();
      const eventData: UIComponentEventData = {
        componentId: 'test-component',
        element: document.createElement('div')
      };

      testEventBus.on(GameEvents.UI_COMPONENT_MOUNTED, handler);
      testEventBus.emit(GameEvents.UI_COMPONENT_MOUNTED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });

    test('should emit and receive component unmounted event', () => {
      const handler = jest.fn();
      const eventData: UIComponentEventData = {
        componentId: 'test-component'
      };

      testEventBus.on(GameEvents.UI_COMPONENT_UNMOUNTED, handler);
      testEventBus.emit(GameEvents.UI_COMPONENT_UNMOUNTED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });

    test('should emit and receive visibility change event', () => {
      const handler = jest.fn();
      const eventData: UIVisibilityChangeData = {
        componentId: 'test-component',
        isVisible: false
      };

      testEventBus.on(GameEvents.UI_COMPONENT_VISIBILITY_CHANGED, handler);
      testEventBus.emit(GameEvents.UI_COMPONENT_VISIBILITY_CHANGED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });

    test('should emit and receive interaction change event', () => {
      const handler = jest.fn();
      const eventData: UIInteractionChangeData = {
        componentId: 'test-component',
        isInteractive: true
      };

      testEventBus.on(GameEvents.UI_COMPONENT_INTERACTION_CHANGED, handler);
      testEventBus.emit(GameEvents.UI_COMPONENT_INTERACTION_CHANGED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });
  });

  describe('UI Focus Events', () => {
    test('should emit and receive focus change event', () => {
      const handler = jest.fn();
      const eventData: UIFocusChangeData = {
        previousElement: document.createElement('button'),
        currentElement: document.createElement('input'),
        componentId: 'input-component'
      };

      testEventBus.on(GameEvents.UI_FOCUS_CHANGED, handler);
      testEventBus.emit(GameEvents.UI_FOCUS_CHANGED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });

    test('should handle focus change event with no previous element', () => {
      const handler = jest.fn();
      const eventData: UIFocusChangeData = {
        currentElement: document.createElement('button'),
        componentId: 'button-component'
      };

      testEventBus.on(GameEvents.UI_FOCUS_CHANGED, handler);
      testEventBus.emit(GameEvents.UI_FOCUS_CHANGED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
      expect(eventData.previousElement).toBeUndefined();
    });
  });

  describe('UI Layout Events', () => {
    test('should emit and receive layout update event', () => {
      const handler = jest.fn();
      const eventData: UILayoutUpdateData = {
        canvasSize: { width: 800, height: 600 },
        viewportSize: { width: 1200, height: 800 },
        scaleFactor: 0.75,
        updatedComponentIds: ['comp1', 'comp2', 'comp3']
      };

      testEventBus.on(GameEvents.UI_LAYOUT_UPDATED, handler);
      testEventBus.emit(GameEvents.UI_LAYOUT_UPDATED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });

    test('should emit and receive breakpoint change event', () => {
      const handler = jest.fn();
      const eventData: UIBreakpointChangeData = {
        previousBreakpoint: 'desktop',
        currentBreakpoint: 'mobile',
        viewportSize: { width: 400, height: 800 }
      };

      testEventBus.on(GameEvents.UI_BREAKPOINT_CHANGED, handler);
      testEventBus.emit(GameEvents.UI_BREAKPOINT_CHANGED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });

    test('should emit and receive orientation change event', () => {
      const handler = jest.fn();
      const eventData: UIOrientationChangeData = {
        orientation: 'portrait',
        viewportSize: { width: 400, height: 800 }
      };

      testEventBus.on(GameEvents.UI_ORIENTATION_CHANGED, handler);
      testEventBus.emit(GameEvents.UI_ORIENTATION_CHANGED, eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });
  });

  describe('UI Overlay Events', () => {
    test('should emit and receive overlay shown event', () => {
      const handler = jest.fn();

      testEventBus.on(GameEvents.UI_OVERLAY_SHOWN, handler);
      testEventBus.emit(GameEvents.UI_OVERLAY_SHOWN);

      expect(handler).toHaveBeenCalledWith(undefined);
    });

    test('should emit and receive overlay hidden event', () => {
      const handler = jest.fn();

      testEventBus.on(GameEvents.UI_OVERLAY_HIDDEN, handler);
      testEventBus.emit(GameEvents.UI_OVERLAY_HIDDEN);

      expect(handler).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Event Handler Management', () => {
    test('should support multiple handlers for same UI event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const eventData: UIComponentEventData = {
        componentId: 'test-component'
      };

      testEventBus.on(GameEvents.UI_COMPONENT_MOUNTED, handler1);
      testEventBus.on(GameEvents.UI_COMPONENT_MOUNTED, handler2);
      testEventBus.emit(GameEvents.UI_COMPONENT_MOUNTED, eventData);

      expect(handler1).toHaveBeenCalledWith(eventData);
      expect(handler2).toHaveBeenCalledWith(eventData);
    });

    test('should remove UI event handlers correctly', () => {
      const handler = jest.fn();
      const eventData: UIComponentEventData = {
        componentId: 'test-component'
      };

      testEventBus.on(GameEvents.UI_COMPONENT_MOUNTED, handler);
      testEventBus.off(GameEvents.UI_COMPONENT_MOUNTED, handler);
      testEventBus.emit(GameEvents.UI_COMPONENT_MOUNTED, eventData);

      expect(handler).not.toHaveBeenCalled();
    });

    test('should count UI event listeners correctly', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      expect(testEventBus.listenerCount(GameEvents.UI_LAYOUT_UPDATED)).toBe(0);

      testEventBus.on(GameEvents.UI_LAYOUT_UPDATED, handler1);
      expect(testEventBus.listenerCount(GameEvents.UI_LAYOUT_UPDATED)).toBe(1);

      testEventBus.on(GameEvents.UI_LAYOUT_UPDATED, handler2);
      expect(testEventBus.listenerCount(GameEvents.UI_LAYOUT_UPDATED)).toBe(2);

      testEventBus.off(GameEvents.UI_LAYOUT_UPDATED, handler1);
      expect(testEventBus.listenerCount(GameEvents.UI_LAYOUT_UPDATED)).toBe(1);
    });
  });

  describe('Error Handling in UI Events', () => {
    test('should handle errors in UI event handlers gracefully', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalHandler = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      testEventBus.on(GameEvents.UI_COMPONENT_MOUNTED, errorHandler);
      testEventBus.on(GameEvents.UI_COMPONENT_MOUNTED, normalHandler);
      
      const eventData: UIComponentEventData = {
        componentId: 'test-component'
      };

      testEventBus.emit(GameEvents.UI_COMPONENT_MOUNTED, eventData);

      expect(errorHandler).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event handler'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Singleton Instance', () => {
    test('should use same instance across imports', () => {
      const instance1 = EventBus.getInstance();
      const instance2 = EventBus.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(eventBus);
    });
  });
});