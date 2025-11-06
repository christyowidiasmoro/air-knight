/**
 * Unit tests for UIOverlayContainer and UIManager
 */

import { UIOverlayContainer, UIManager } from '../../systems/UIManager';
import { UIComponent } from '../../components/UI/UIComponent';
import { UIComponentConfig } from '../../types/ui';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('UIOverlayContainer', () => {
  let container: UIOverlayContainer;
  let canvas: HTMLCanvasElement;
  let canvasContainer: HTMLDivElement;

  beforeEach(() => {
    // Setup DOM
    canvasContainer = document.createElement('div');
    canvasContainer.style.position = 'relative';
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvasContainer.appendChild(canvas);
    document.body.appendChild(canvasContainer);

    container = new UIOverlayContainer();
  });

  afterEach(() => {
    container.destroy();
    if (document.body.contains(canvasContainer)) {
      document.body.removeChild(canvasContainer);
    }
  });

  describe('Initialization', () => {
    test('should create overlay element with correct properties', () => {
      expect(container.element).toBeInstanceOf(HTMLDivElement);
      expect(container.element.id).toBe('ui-overlay');
      expect(container.element.className).toBe('ui-overlay');
      expect(container.isVisible).toBe(false);
      expect(container.zIndex).toBe(1000);
    });

    test('should initialize with canvas successfully', async () => {
      await container.initialize(canvas);
      
      expect(canvasContainer.contains(container.element)).toBe(true);
      expect(container.element.style.position).toBe('absolute');
    });

    test('should throw error when initializing twice', async () => {
      await container.initialize(canvas);
      await expect(container.initialize(canvas)).rejects.toThrow('UIOverlayContainer already initialized');
    });

    test('should throw error when canvas has no parent', async () => {
      const orphanCanvas = document.createElement('canvas');
      await expect(container.initialize(orphanCanvas)).rejects.toThrow('Canvas must have a parent element');
    });
  });

  describe('Component Management', () => {
    let component: UIComponent;
    let componentConfig: UIComponentConfig;

    beforeEach(async () => {
      await container.initialize(canvas);
      
      componentConfig = {
        id: 'test-component',
        position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
        size: { width: 100, height: 50 }
      };
      component = new UIComponent(componentConfig);
    });

    afterEach(() => {
      component.destroy();
    });

    test('should add component successfully', async () => {
      await container.addComponent(component);
      
      expect(container.components.has('test-component')).toBe(true);
      expect(container.getComponent('test-component')).toBe(component);
      expect(container.element.contains(component.element)).toBe(true);
    });

    test('should throw error when adding duplicate component', async () => {
      await container.addComponent(component);
      await expect(container.addComponent(component)).rejects.toThrow('Component test-component already exists');
    });

    test('should throw error when adding component before initialization', async () => {
      const uninitializedContainer = new UIOverlayContainer();
      await expect(uninitializedContainer.addComponent(component)).rejects.toThrow('UIOverlayContainer not initialized');
      uninitializedContainer.destroy();
    });

    test('should remove component successfully', async () => {
      await container.addComponent(component);
      await container.removeComponent('test-component');
      
      expect(container.components.has('test-component')).toBe(false);
      expect(container.getComponent('test-component')).toBeUndefined();
    });

    test('should throw error when removing non-existent component', async () => {
      await expect(container.removeComponent('non-existent')).rejects.toThrow('Component non-existent not found');
    });

    test('should update component properties', async () => {
      await container.addComponent(component);
      
      await container.updateComponent('test-component', {
        isVisible: false,
        isInteractive: false
      });
      
      expect(component.isVisible).toBe(false);
      expect(component.isInteractive).toBe(false);
    });

    test('should throw error when updating non-existent component', async () => {
      await expect(container.updateComponent('non-existent', {})).rejects.toThrow('Component non-existent not found');
    });
  });

  describe('Visibility Control', () => {
    beforeEach(async () => {
      await container.initialize(canvas);
    });

    test('should show overlay', () => {
      container.show();
      
      expect(container.isVisible).toBe(true);
      expect(container.element.style.display).toBe('block');
    });

    test('should hide overlay', () => {
      container.show();
      container.hide();
      
      expect(container.isVisible).toBe(false);
      expect(container.element.style.display).toBe('none');
    });

    test('should set z-index', () => {
      container.setZIndex(2000);
      
      expect(container.zIndex).toBe(2000);
      expect(container.element.style.zIndex).toBe('2000');
    });
  });

  describe('Destruction', () => {
    test('should clean up all components on destroy', async () => {
      await container.initialize(canvas);
      
      const component1 = new UIComponent({
        id: 'comp1',
        position: { x: 0, y: 0, anchor: 'px', origin: 'top-left' },
        size: { width: 100, height: 100 }
      });
      
      const component2 = new UIComponent({
        id: 'comp2',
        position: { x: 0, y: 0, anchor: 'px', origin: 'top-left' },
        size: { width: 100, height: 100 }
      });

      await container.addComponent(component1);
      await container.addComponent(component2);
      
      await container.destroy();
      
      expect(container.components.size).toBe(0);
      expect(canvasContainer.contains(container.element)).toBe(false);
      
      component1.destroy();
      component2.destroy();
    });
  });
});

describe('UIManager (Legacy)', () => {
  let canvas: HTMLCanvasElement;
  let canvasContainer: HTMLDivElement;

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    canvasContainer.style.position = 'relative';
    canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);
    document.body.appendChild(canvasContainer);
  });

  afterEach(() => {
    if (document.body.contains(canvasContainer)) {
      document.body.removeChild(canvasContainer);
    }
  });

  test('should create UIManager with UIOverlayContainer', () => {
    const manager = new UIManager(canvas);
    
    expect(manager.getContainer()).toBeInstanceOf(UIOverlayContainer);
  });

  test('should throw error for deprecated addComponent method', () => {
    const manager = new UIManager(canvas);
    const element = document.createElement('div');
    
    expect(() => manager.addComponent('test', element)).toThrow(/deprecated/);
  });

  test('should delegate to container methods', () => {
    const manager = new UIManager(canvas);
    
    manager.show();
    expect(manager.getContainer().isVisible).toBe(true);
    
    manager.hide();
    expect(manager.getContainer().isVisible).toBe(false);
  });
});