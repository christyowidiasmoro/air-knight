/**
 * Unit tests for UIComponent base class
 */

import { UIComponent } from '../../components/UI/UIComponent';
import { UIComponentConfig } from '../../types/ui';

describe('UIComponent', () => {
  let config: UIComponentConfig;
  let component: UIComponent;

  beforeEach(() => {
    config = {
      id: 'test-component',
      tagName: 'div',
      className: 'test-class',
      position: { x: 100, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 150 },
      isVisible: true,
      isInteractive: true,
      attributes: { 'data-test': 'value' }
    };
    component = new UIComponent(config);
  });

  afterEach(() => {
    component.destroy();
  });

  describe('Initialization', () => {
    test('should create component with correct properties', () => {
      expect(component.id).toBe('test-component');
      expect(component.element.tagName.toLowerCase()).toBe('div');
      expect(component.element.className).toContain('test-class');
      expect(component.isVisible).toBe(true);
      expect(component.isInteractive).toBe(true);
      expect(component.position).toEqual(config.position);
      expect(component.size).toEqual(config.size);
      expect(component.attributes).toEqual(config.attributes);
    });

    test('should apply initial styles', () => {
      expect(component.element.style.position).toBe('absolute');
      expect(component.element.style.left).toBe('100px');
      expect(component.element.style.top).toBe('100px');
      expect(component.element.style.width).toBe('200px');
      expect(component.element.style.height).toBe('150px');
    });

    test('should set attributes on element', () => {
      expect(component.element.getAttribute('data-test')).toBe('value');
      expect(component.element.id).toBe('test-component');
    });
  });

  describe('Validation', () => {
    test('should throw validation error for missing id', () => {
      const invalidConfig = { ...config, id: '' };
      expect(() => new UIComponent(invalidConfig)).toThrow('ID must be a non-empty string');
    });

    test('should throw validation error for missing position', () => {
      const invalidConfig = { ...config };
      delete (invalidConfig as any).position;
      expect(() => new UIComponent(invalidConfig)).toThrow('Position is required');
    });

    test('should throw validation error for invalid size', () => {
      const invalidConfig = { ...config, size: { width: -10, height: 150 } };
      expect(() => new UIComponent(invalidConfig)).toThrow('Width and height must be positive numbers');
    });

    test('should throw validation error for negative position', () => {
      const invalidConfig = { ...config, position: { x: -10, y: 100, anchor: 'px' as const, origin: 'top-left' as const } };
      expect(() => new UIComponent(invalidConfig)).toThrow('Position coordinates must be non-negative');
    });
  });

  describe('Mounting and Unmounting', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    test('should mount component to container', () => {
      component.mount(container);
      
      expect(container.contains(component.element)).toBe(true);
      expect(container.children.length).toBe(1);
    });

    test('should throw error when mounting already mounted component', () => {
      component.mount(container);
      expect(() => component.mount(container)).toThrow('Component test-component is already mounted');
    });

    test('should unmount component from container', () => {
      component.mount(container);
      component.unmount();
      
      expect(container.contains(component.element)).toBe(false);
      expect(container.children.length).toBe(0);
    });

    test('should handle unmounting non-mounted component gracefully', () => {
      expect(() => component.unmount()).not.toThrow();
    });
  });

  describe('Visibility Control', () => {
    test('should show component', () => {
      component.hide();
      component.show();
      
      expect(component.isVisible).toBe(true);
      expect(component.element.style.display).toBe('block');
    });

    test('should hide component', () => {
      component.hide();
      
      expect(component.isVisible).toBe(false);
      expect(component.element.style.display).toBe('none');
    });

    test('should set visibility via property', () => {
      component.isVisible = false;
      expect(component.element.style.display).toBe('none');
      
      component.isVisible = true;
      expect(component.element.style.display).toBe('block');
    });
  });

  describe('Interactivity Control', () => {
    test('should set component as interactive', () => {
      component.setInteractive(true);
      
      expect(component.isInteractive).toBe(true);
      expect(component.element.style.pointerEvents).toBe('auto');
      expect(component.element.classList.contains('ui-interactive')).toBe(true);
    });

    test('should set component as non-interactive', () => {
      component.setInteractive(false);
      
      expect(component.isInteractive).toBe(false);
      expect(component.element.style.pointerEvents).toBe('none');
      expect(component.element.classList.contains('ui-interactive')).toBe(false);
    });

    test('should set interactivity via property', () => {
      component.isInteractive = false;
      expect(component.element.style.pointerEvents).toBe('none');
      
      component.isInteractive = true;
      expect(component.element.style.pointerEvents).toBe('auto');
    });
  });

  describe('Position Updates', () => {
    test('should update position completely', () => {
      const newPosition = { x: 50, y: 75, anchor: '%' as const, origin: 'center' as const };
      component.updatePosition(newPosition);
      
      expect(component.position).toEqual(newPosition);
      expect(component.element.style.left).toBe('50%');
      expect(component.element.style.top).toBe('75%');
      expect(component.element.style.transform).toBe('translate(-50%, -50%)');
    });

    test('should update position partially', () => {
      component.updatePosition({ x: 300 });
      
      expect(component.position.x).toBe(300);
      expect(component.position.y).toBe(100);
      expect(component.element.style.left).toBe('300px');
    });

    test('should handle different origins', () => {
      component.updatePosition({ origin: 'bottom-right' });
      expect(component.element.style.transform).toBe('translate(-100%, -100%)');
      
      component.updatePosition({ origin: 'top-center' });
      expect(component.element.style.transform).toBe('translate(-50%, 0)');
    });
  });

  describe('Size Updates', () => {
    test('should update size completely', () => {
      const newSize = { width: 300, height: 250 };
      component.updateSize(newSize);
      
      expect(component.size).toEqual(newSize);
      expect(component.element.style.width).toBe('300px');
      expect(component.element.style.height).toBe('250px');
    });

    test('should update size partially', () => {
      component.updateSize({ width: 400 });
      
      expect(component.size.width).toBe(400);
      expect(component.size.height).toBe(150);
      expect(component.element.style.width).toBe('400px');
    });
  });

  describe('Event Handling', () => {
    test('should add event listener', () => {
      const handler = jest.fn();
      component.addEventListener('click', handler);
      
      component.element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('should remove event listener', () => {
      const handler = jest.fn();
      component.addEventListener('click', handler);
      component.removeEventListener('click', handler);
      
      component.element.click();
      expect(handler).not.toHaveBeenCalled();
    });

    test('should handle multiple event listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      component.addEventListener('click', handler1);
      component.addEventListener('click', handler2);
      
      component.element.click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Destruction', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    });

    test('should clean up event listeners on destroy', () => {
      const handler = jest.fn();
      component.addEventListener('click', handler);
      component.destroy();
      
      component.element.click();
      expect(handler).not.toHaveBeenCalled();
    });

    test('should unmount component on destroy', () => {
      component.mount(container);
      component.destroy();
      
      expect(container.contains(component.element)).toBe(false);
    });

    test('should handle destroy of non-mounted component', () => {
      expect(() => component.destroy()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('should set accessibility attributes for interactive components', () => {
      expect(component.element.getAttribute('tabindex')).toBe('0');
      expect(component.element.getAttribute('role')).toBe('button');
    });

    test('should not set accessibility attributes for non-interactive components', () => {
      const nonInteractiveConfig = { ...config, isInteractive: false };
      const nonInteractiveComponent = new UIComponent(nonInteractiveConfig);
      
      expect(nonInteractiveComponent.element.getAttribute('tabindex')).toBeNull();
      expect(nonInteractiveComponent.element.getAttribute('role')).toBeNull();
      
      nonInteractiveComponent.destroy();
    });
  });
});