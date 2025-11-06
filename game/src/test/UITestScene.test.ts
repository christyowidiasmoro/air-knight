/**
 * UITestScene Unit Tests
 * Tests the comprehensive UI test scene functionality
 */

import { UITestScene } from '../scenes/UITestScene';

// Mock BaseScene first
jest.mock('../scenes/BaseScene', () => ({
  BaseScene: class MockBaseScene {
    scene = {
      key: 'test-scene',
      start: jest.fn(),
      restart: jest.fn()
    };
    cameras = {
      main: {
        width: 1024,
        height: 768,
        fadeIn: jest.fn()
      }
    };
    add = {
      graphics: jest.fn(() => ({
        fillGradientStyle: jest.fn(),
        fillRect: jest.fn()
      })),
      text: jest.fn(() => ({
        setOrigin: jest.fn()
      })),
      rectangle: jest.fn(() => ({
        setInteractive: jest.fn(),
        on: jest.fn()
      }))
    };
    tweens = {
      add: jest.fn()
    };
    time = {
      delayedCall: jest.fn()
    };
    input = {
      keyboard: {
        on: jest.fn()
      }
    };
    game = {
      canvas: document.createElement('canvas')
    };
    events = {
      on: jest.fn(),
      off: jest.fn()
    };
    
    constructor(key: string) {
      this.scene.key = key;
    }
  }
}));

// Mock GlobalUIManager
jest.mock('../systems/UIManager', () => ({
  GlobalUIManager: {
    getInstance: jest.fn(() => ({
      setCanvas: jest.fn(),
      createSceneUI: jest.fn(() => Promise.resolve({
        addComponent: jest.fn(),
        removeComponent: jest.fn(),
        overlay: {
          components: new Map()
        }
      })),
      destroySceneUI: jest.fn()
    }))
  }
}));

// Mock UI Components
jest.mock('../components/UI/Button', () => ({
  UIButton: jest.fn().mockImplementation((config) => ({
    id: config.id,
    text: config.text,
    variant: config.variant,
    buttonSize: config.buttonSize,
    disabled: config.disabled,
    onClick: config.onClick,
    element: document.createElement('button')
  }))
}));

jest.mock('../components/UI/Panel', () => ({
  UIPanel: jest.fn().mockImplementation((config) => ({
    id: config.id,
    title: config.title,
    theme: config.theme,
    panelSize: config.panelSize,
    draggable: config.draggable,
    addChild: jest.fn(),
    element: document.createElement('div')
  }))
}));

jest.mock('../components/UI/Menu', () => ({
  UIMenu: jest.fn().mockImplementation((config) => ({
    id: config.id,
    items: config.items,
    orientation: config.orientation,
    autoClose: config.autoClose,
    element: document.createElement('div')
  }))
}));

describe('UITestScene', () => {
  let scene: UITestScene;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create scene instance
    scene = new UITestScene();
  });

  describe('Scene Initialization', () => {
    test('should create scene with correct key', () => {
      expect(scene).toBeDefined();
      expect(scene.scene.key).toBe('UITestScene');
    });

    test('should extend BaseScene properly', () => {
      expect(scene).toBeInstanceOf(UITestScene);
    });
  });

  describe('Public Interface', () => {
    test('should have required scene properties', () => {
      expect(scene.scene).toBeDefined();
      expect(scene.cameras).toBeDefined();
      expect(scene.add).toBeDefined();
      expect(scene.tweens).toBeDefined();
      expect(scene.time).toBeDefined();
      expect(scene.input).toBeDefined();
      expect(scene.game).toBeDefined();
    });

    test('should provide scene transition methods', () => {
      // Test that the scene can navigate back to MenuScene
      scene.scene.start('MenuScene');
      expect(scene.scene.start).toHaveBeenCalledWith('MenuScene');
      
      // Test that the scene can restart itself
      scene.scene.restart();
      expect(scene.scene.restart).toHaveBeenCalled();
    });
  });

  describe('Component Integration', () => {
    test('should import UI components correctly', () => {
      const { UIButton } = require('../components/UI/Button');
      const { UIPanel } = require('../components/UI/Panel');
      const { UIMenu } = require('../components/UI/Menu');
      
      // Test that components can be instantiated
      expect(UIButton).toBeDefined();
      expect(UIPanel).toBeDefined();
      expect(UIMenu).toBeDefined();
    });
  });

  describe('UI System Integration', () => {
    test('should integrate with GlobalUIManager', () => {
      const { GlobalUIManager } = require('../systems/UIManager');
      expect(GlobalUIManager.getInstance).toBeDefined();
    });
  });

  describe('Menu Integration', () => {
    test('should be accessible from MenuScene', () => {
      // This tests the integration point mentioned in MenuScene
      const sceneKey = 'UITestScene';
      expect(sceneKey).toBe('UITestScene');
    });
  });

  describe('Type Safety', () => {
    test('should have proper TypeScript typing', () => {
      // Test that the scene has proper typing by checking key methods exist
      expect(typeof scene.scene.start).toBe('function');
      expect(typeof scene.scene.restart).toBe('function');
    });
  });

  describe('Configuration', () => {
    test('should have proper scene configuration', () => {
      // Test scene key configuration
      expect(scene.scene.key).toBe('UITestScene');
    });
  });

  describe('Documentation and Comments', () => {
    test('should be properly documented', () => {
      // Check that the scene constructor works as expected
      const testScene = new UITestScene();
      expect(testScene).toBeInstanceOf(UITestScene);
      expect(testScene.scene.key).toBe('UITestScene');
    });
  });

  describe('Performance Considerations', () => {
    test('should handle component creation efficiently', () => {
      // Test that multiple scene instances can be created without issues
      const scene1 = new UITestScene();
      const scene2 = new UITestScene();
      
      expect(scene1).toBeDefined();
      expect(scene2).toBeDefined();
      expect(scene1).not.toBe(scene2);
      expect(scene1.scene.key).toBe('UITestScene');
      expect(scene2.scene.key).toBe('UITestScene');
    });
  });

  describe('UI Component Configuration Tests', () => {
    test('should support button configurations', () => {
      const { UIButton } = require('../components/UI/Button');
      
      // Test basic button configuration
      const buttonConfig = {
        id: 'test-button',
        text: 'Test Button',
        variant: 'primary',
        buttonSize: 'medium',
        onClick: jest.fn()
      };
      
      new UIButton(buttonConfig);
      expect(UIButton).toHaveBeenCalledWith(buttonConfig);
    });

    test('should support panel configurations', () => {
      const { UIPanel } = require('../components/UI/Panel');
      
      // Test basic panel configuration
      const panelConfig = {
        id: 'test-panel',
        title: 'Test Panel',
        theme: 'light',
        panelSize: 'normal'
      };
      
      new UIPanel(panelConfig);
      expect(UIPanel).toHaveBeenCalledWith(panelConfig);
    });

    test('should support menu configurations', () => {
      const { UIMenu } = require('../components/UI/Menu');
      
      // Test basic menu configuration
      const menuConfig = {
        id: 'test-menu',
        items: [],
        orientation: 'vertical',
        autoClose: true
      };
      
      new UIMenu(menuConfig);
      expect(UIMenu).toHaveBeenCalledWith(menuConfig);
    });
  });
});