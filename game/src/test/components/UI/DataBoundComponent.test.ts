/**
 * Unit tests for DataBoundComponent
 * Tests data binding, change detection, and reactive updates
 */

import { DataBoundComponent } from '../../../components/UI/DataBoundComponent';
import { UIComponentConfig } from '../../../types/ui';

// Mock the EventBus
jest.mock('../../../systems/EventBus', () => ({
  EventBus: {
    getInstance: jest.fn(() => ({
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      once: jest.fn(),
      removeAllListeners: jest.fn()
    }))
  }
}));

// Mock UIUpdateScheduler  
jest.mock('../../../systems/UIUpdateScheduler', () => ({
  UIUpdateScheduler: {
    getInstance: jest.fn(() => ({
      scheduleUpdate: jest.fn()
    }))
  }
}));

describe('DataBoundComponent', () => {
  
  const mockConfig: UIComponentConfig = {
    id: 'test-component',
    position: { x: 0, y: 0, anchor: 'px', origin: 'top-left' },
    size: { width: 100, height: 50 }
  };

  let component: DataBoundComponent;
  let mockData: any;
  
  beforeEach(() => {
    mockData = {
      user: {
        name: 'Test User',
        email: 'test@example.com'
      },
      game: {
        score: 1000,
        level: 5
      }
    };
    
    component = new DataBoundComponent(mockConfig);
    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    test('should create component with basic config', () => {
      expect(component.id).toBe('test-component');
      expect(component.getDataBindings().size).toBe(0);
    });

    test('should create component with data binding config', () => {
      const configWithBinding: UIComponentConfig & { dataBindingConfig?: any } = {
        ...mockConfig,
        id: 'bound-component',
        dataBindingConfig: {
          bindings: [{
            property: 'textContent',
            dataPath: 'user.name'
          }]
        }
      };

      const boundComponent = new DataBoundComponent(configWithBinding);
      
      expect(boundComponent.id).toBe('bound-component');
      expect(boundComponent.getDataBindings().size).toBe(1);
      expect(boundComponent.getDataBindings().has('textContent')).toBe(true);
    });
  });

  describe('Data Binding Management', () => {
    test('should add data binding', () => {
      const binding = {
        property: 'textContent',
        dataPath: 'user.name'
      };

      component.addDataBinding(binding);
      
      expect(component.getDataBindings().size).toBe(1);
      expect(component.getDataBindings().has('textContent')).toBe(true);
    });

    test('should remove data binding', () => {
      const binding = {
        property: 'textContent',
        dataPath: 'user.name'
      };

      component.addDataBinding(binding);
      component.removeDataBinding('textContent');
      
      expect(component.getDataBindings().size).toBe(0);
      expect(component.getDataBindings().has('textContent')).toBe(false);
    });

    test('should clear all data bindings', () => {
      component.addDataBinding({
        property: 'textContent',
        dataPath: 'user.name'
      });
      
      component.addDataBinding({
        property: 'className',
        dataPath: 'user.email'
      });
      
      expect(component.getDataBindings().size).toBe(2);
      
      component.clearDataBindings();
      
      expect(component.getDataBindings().size).toBe(0);
    });
  });

  describe('Data Binding and Updates', () => {
    test('should bind and update component properties', () => {
      component.addDataBinding({
        property: 'textContent',
        dataPath: 'user.name'
      });
      
      component.bindData(mockData);
      
      expect(component.element.textContent).toBe('Test User');
    });

    test('should get bound value by path', () => {
      component.bindData(mockData);
      
      const value = component.getBoundValue('user.name');
      expect(value).toBe('Test User');
    });

    test('should update all bound properties', () => {
      component.addDataBinding({
        property: 'textContent',
        dataPath: 'user.name'
      });
      
      component.addDataBinding({
        property: 'title',
        dataPath: 'user.email'
      });
      
      component.bindData(mockData);
      
      expect(component.element.textContent).toBe('Test User');
      expect(component.element.title).toBe('test@example.com');
    });
  });

  describe('Value Transformers', () => {
    test('should apply value transformer', () => {
      component.addDataBinding({
        property: 'textContent',
        dataPath: 'user.name',
        transformer: (value: string) => `Hello, ${value}!`
      });
      
      component.bindData(mockData);
      
      expect(component.element.textContent).toBe('Hello, Test User!');
    });

    test('should handle validation', () => {
      component.addDataBinding({
        property: 'textContent',
        dataPath: 'game.score',
        validator: (value: number) => value >= 0
      });
      
      component.bindData(mockData);
      
      expect(component.element.textContent).toBe('1000');
    });
  });

  describe('Property Watching', () => {
    test('should watch property for changes', () => {
      component.watchProperty('user.name', mockData);
      
      const watchedProperties = component.getWatchedProperties();
      expect(watchedProperties).toContain('user.name');
    });

    test('should stop watching property', () => {
      component.watchProperty('user.name', mockData);
      component.unwatchProperty('user.name');
      
      const watchedProperties = component.getWatchedProperties();
      expect(watchedProperties).not.toContain('user.name');
    });

    test('should get watched properties list', () => {
      component.watchProperty('user.name', mockData);
      component.watchProperty('game.score', mockData);
      
      const watchedProperties = component.getWatchedProperties();
      expect(watchedProperties).toEqual(expect.arrayContaining(['user.name', 'game.score']));
    });
  });

  describe('Cleanup and Destruction', () => {
    test('should cleanup all resources on destroy', () => {
      // Add bindings and watchers
      component.addDataBinding({
        property: 'textContent',
        dataPath: 'user.name'
      });
      
      component.watchProperty('user.email', mockData);
      
      // Destroy component
      component.destroy();
      
      expect(component.getDataBindings().size).toBe(0);
      expect(component.getWatchedProperties()).toHaveLength(0);
    });
  });

  describe('Deep Object Utilities', () => {
    test('should handle nested object paths correctly', () => {
      const deepData = {
        level1: {
          level2: {
            level3: {
              value: 'deep value'
            }
          }
        }
      };

      component.addDataBinding({
        property: 'textContent',
        dataPath: 'level1.level2.level3.value'
      });
      
      component.bindData(deepData);
      
      expect(component.element.textContent).toBe('deep value');
    });

    test('should handle array paths', () => {
      const arrayData = {
        users: [
          { name: 'User 1' },
          { name: 'User 2' },
          { name: 'User 3' }
        ]
      };

      component.addDataBinding({
        property: 'textContent',
        dataPath: 'users.1.name'
      });
      
      component.bindData(arrayData);
      
      expect(component.element.textContent).toBe('User 2');
    });
  });
});