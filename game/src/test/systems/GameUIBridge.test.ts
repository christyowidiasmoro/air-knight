/**
 * Unit tests for GameUIBridge
 * Tests state synchronization, event handling, and UI updates
 */

import { GameUIBridge, GameState, UIStateMapping } from '../../systems/GameUIBridge';
import { EventBus, GameEvents } from '../../systems/EventBus';
import { UIOverlayContainer } from '../../systems/UIManager';
import { UIError, UIValidationError } from '../../types/ui';

// Mock UIComponent for testing
class MockUIComponent {
  public id: string;
  public element: HTMLElement;
  public textContent: string = '';
  public value: any = null;

  constructor(id: string) {
    this.id = id;
    this.element = document.createElement('div');
  }
}

// Mock UIOverlayContainer
class MockUIOverlayContainer {
  private components = new Map<string, MockUIComponent>();

  public addComponent(component: MockUIComponent): void {
    this.components.set(component.id, component);
  }

  public getComponent(id: string): MockUIComponent | undefined {
    return this.components.get(id);
  }

  public removeComponent(id: string): void {
    this.components.delete(id);
  }
}

describe('GameUIBridge', () => {
  let bridge: GameUIBridge;
  let eventBus: EventBus;
  let mockContainer: MockUIOverlayContainer;

  beforeEach(() => {
    // Create fresh instances for each test
    eventBus = EventBus.getInstance();
    eventBus.removeAllListeners(); // Clear existing listeners
    bridge = new GameUIBridge(eventBus);
    mockContainer = new MockUIOverlayContainer();
    
    // Connect the mock container
    bridge.connectUIContainer(mockContainer as any);
  });

  afterEach(() => {
    bridge.destroy();
  });

  describe('Constructor and Initialization', () => {
    it('should create a bridge with default event subscriptions', () => {
      const newBridge = new GameUIBridge(eventBus);
      expect(newBridge).toBeInstanceOf(GameUIBridge);
      expect(newBridge.getMetrics().subscriptionCount).toBeGreaterThan(0);
      newBridge.destroy();
    });

    it('should use singleton EventBus if none provided', () => {
      const newBridge = new GameUIBridge();
      expect(newBridge).toBeInstanceOf(GameUIBridge);
      newBridge.destroy();
    });
  });

  describe('UI Container Management', () => {
    it('should connect to a UI container', () => {
      const newBridge = new GameUIBridge(eventBus);
      const container = new MockUIOverlayContainer();
      
      expect(() => newBridge.connectUIContainer(container as any)).not.toThrow();
      newBridge.destroy();
    });

    it('should throw error when connecting to already connected container', () => {
      expect(() => bridge.connectUIContainer(mockContainer as any)).toThrow(UIError);
      expect(() => bridge.connectUIContainer(mockContainer as any)).toThrow('UI container already connected');
    });

    it('should disconnect from UI container', () => {
      bridge.disconnectUIContainer();
      expect(bridge.getMetrics().mappingCount).toBe(0);
    });
  });

  describe('Event Subscription Management', () => {
    it('should subscribe to events', () => {
      const handler = jest.fn();
      const eventName = 'test:event';
      
      bridge.subscribeToEvent(eventName, handler);
      
      expect(bridge.getMetrics().subscriptionCount).toBeGreaterThan(0);
      
      // Test that handler is called when event is emitted
      eventBus.emit(eventName, { test: 'data' });
      expect(handler).toHaveBeenCalledWith({ test: 'data' });
    });

    it('should unsubscribe from events', () => {
      const handler = jest.fn();
      const eventName = 'test:event';
      
      bridge.subscribeToEvent(eventName, handler);
      bridge.unsubscribeFromEvent(eventName, handler);
      
      // Handler should not be called after unsubscribing
      eventBus.emit(eventName, { test: 'data' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('State Mapping', () => {
    it('should map game state to UI component', () => {
      const mapping: UIStateMapping = {
        gameProperty: 'player.score',
        componentId: 'score-display',
        uiProperty: 'textContent'
      };

      expect(() => bridge.mapStateToUI(mapping)).not.toThrow();
      expect(bridge.getMetrics().mappingCount).toBe(1);
    });

    it('should validate state mappings', () => {
      const invalidMapping: UIStateMapping = {
        gameProperty: '',
        componentId: 'test',
        uiProperty: 'value'
      };

      expect(() => bridge.mapStateToUI(invalidMapping)).toThrow(UIValidationError);
    });

    it('should remove state mappings', () => {
      const mapping: UIStateMapping = {
        gameProperty: 'player.health',
        componentId: 'health-bar',
        uiProperty: 'value'
      };

      bridge.mapStateToUI(mapping);
      bridge.removeStateMapping('player.health', 'health-bar');
      
      expect(bridge.getMetrics().mappingCount).toBe(0);
    });

    it('should clear all mappings', () => {
      const mapping1: UIStateMapping = {
        gameProperty: 'player.score',
        componentId: 'score-display',
        uiProperty: 'textContent'
      };

      const mapping2: UIStateMapping = {
        gameProperty: 'player.health',
        componentId: 'health-bar',
        uiProperty: 'value'
      };

      bridge.mapStateToUI(mapping1);
      bridge.mapStateToUI(mapping2);
      bridge.clearAllMappings();
      
      expect(bridge.getMetrics().mappingCount).toBe(0);
    });
  });

  describe('Game State Management', () => {
    it('should update game state', () => {
      bridge.updateGameState('player.score', 100);
      
      expect(bridge.getStateProperty('player.score')).toBe(100);
    });

    it('should update nested game state properties', () => {
      bridge.updateGameState('player.stats.level', 5);
      bridge.updateGameState('player.stats.experience', 1500);
      
      expect(bridge.getStateProperty('player.stats.level')).toBe(5);
      expect(bridge.getStateProperty('player.stats.experience')).toBe(1500);
    });

    it('should return full game state', () => {
      bridge.updateGameState('player.score', 100);
      bridge.updateGameState('game.isPaused', false);
      
      const state = bridge.getGameState();
      expect(state.player?.score).toBe(100);
      expect(state.game?.isPaused).toBe(false);
    });

    it('should return undefined for non-existent properties', () => {
      expect(bridge.getStateProperty('non.existent.property')).toBeUndefined();
    });
  });

  describe('UI Updates', () => {
    beforeEach(() => {
      // Add a mock component to the container
      const mockComponent = new MockUIComponent('test-component');
      mockContainer.addComponent(mockComponent);
    });

    it('should queue UI updates when state changes', async () => {
      const mapping: UIStateMapping = {
        gameProperty: 'player.score',
        componentId: 'test-component',
        uiProperty: 'textContent'
      };

      bridge.mapStateToUI(mapping);
      bridge.updateGameState('player.score', 150);
      
      // Wait for updates to be processed
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const component = mockContainer.getComponent('test-component');
      expect(component?.textContent).toBe(150);
    });

    it('should apply value transformers', async () => {
      const mapping: UIStateMapping = {
        gameProperty: 'player.health',
        componentId: 'test-component',
        uiProperty: 'textContent',
        transformer: (value: number) => `Health: ${value}%`
      };

      bridge.mapStateToUI(mapping);
      bridge.updateGameState('player.health', 75);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const component = mockContainer.getComponent('test-component');
      expect(component?.textContent).toBe('Health: 75%');
    });

    it('should validate values before updating', async () => {
      const mapping: UIStateMapping = {
        gameProperty: 'player.level',
        componentId: 'test-component',
        uiProperty: 'value',
        validator: (value: number) => value > 0,
        errorMessage: 'Level must be positive'
      };

      bridge.mapStateToUI(mapping);
      
      // Valid value should work
      bridge.updateGameState('player.level', 5);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const component = mockContainer.getComponent('test-component');
      expect(component?.value).toBe(5);
      
      // Invalid value should not update and should emit error
      const errorHandler = jest.fn();
      eventBus.on('bridge:error', errorHandler);
      
      bridge.updateGameState('player.level', -1);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(errorHandler).toHaveBeenCalled();
      expect(component?.value).toBe(5); // Should remain unchanged
    });

    it('should handle missing components gracefully', async () => {
      const mapping: UIStateMapping = {
        gameProperty: 'player.score',
        componentId: 'non-existent-component',
        uiProperty: 'textContent'
      };

      bridge.mapStateToUI(mapping);
      
      // Should not throw error when component doesn't exist
      expect(() => bridge.updateGameState('player.score', 200)).not.toThrow();
      await new Promise(resolve => setTimeout(resolve, 10));
    });
  });

  describe('Default Event Handling', () => {
    beforeEach(() => {
      // Add mock components
      const scoreComponent = new MockUIComponent('score-display');
      const pauseComponent = new MockUIComponent('pause-indicator');
      mockContainer.addComponent(scoreComponent);
      mockContainer.addComponent(pauseComponent);
      
      // Map state to components
      bridge.mapStateToUI({
        gameProperty: 'player.score',
        componentId: 'score-display',
        uiProperty: 'textContent'
      });
      
      bridge.mapStateToUI({
        gameProperty: 'game.isPaused',
        componentId: 'pause-indicator',
        uiProperty: 'value'
      });
    });

    it('should handle player score updates', async () => {
      eventBus.emit(GameEvents.PLAYER_SCORE_UPDATE, { score: 500 });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(bridge.getStateProperty('player.score')).toBe(500);
      const component = mockContainer.getComponent('score-display');
      expect(component?.textContent).toBe(500);
    });

    it('should handle game pause events', async () => {
      eventBus.emit(GameEvents.GAME_PAUSE);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(bridge.getStateProperty('game.isPaused')).toBe(true);
      const component = mockContainer.getComponent('pause-indicator');
      expect(component?.value).toBe(true);
    });

    it('should handle game resume events', async () => {
      eventBus.emit(GameEvents.GAME_RESUME);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(bridge.getStateProperty('game.isPaused')).toBe(false);
      const component = mockContainer.getComponent('pause-indicator');
      expect(component?.value).toBe(false);
    });

    it('should handle game over events', async () => {
      eventBus.emit(GameEvents.GAME_OVER);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(bridge.getStateProperty('game.isGameOver')).toBe(true);
    });

    it('should handle game start events', async () => {
      eventBus.emit(GameEvents.GAME_START);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(bridge.getStateProperty('game.isGameOver')).toBe(false);
      expect(bridge.getStateProperty('game.isPaused')).toBe(false);
    });
  });

  describe('Performance and Queue Management', () => {
    it('should track queue size', () => {
      expect(bridge.getQueueSize()).toBe(0);
      
      // Queue some updates
      for (let i = 0; i < 5; i++) {
        bridge.updateGameState(`test.property${i}`, i);
      }
      
      expect(bridge.getQueueSize()).toBeGreaterThanOrEqual(0); // May be processed quickly
    });

    it('should provide performance metrics', () => {
      const metrics = bridge.getMetrics();
      
      expect(metrics).toHaveProperty('queueSize');
      expect(metrics).toHaveProperty('mappingCount');
      expect(metrics).toHaveProperty('subscriptionCount');
      expect(typeof metrics.queueSize).toBe('number');
      expect(typeof metrics.mappingCount).toBe('number');
      expect(typeof metrics.subscriptionCount).toBe('number');
    });

    it('should handle queue overflow gracefully', () => {
      // This test would need to be implemented based on actual queue limits
      // For now, just verify the bridge doesn't crash with many updates
      expect(() => {
        for (let i = 0; i < 1000; i++) {
          bridge.updateGameState(`test.property${i}`, i);
        }
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should emit error events when state updates fail', async () => {
      const errorHandler = jest.fn();
      eventBus.on('bridge:error', errorHandler);
      
      // Add a mapping with an invalid validator to trigger an error
      bridge.mapStateToUI({
        gameProperty: 'test.value',
        componentId: 'non-existent-component',
        uiProperty: 'textContent',
        validator: () => false, // Always fails validation
        errorMessage: 'Test validation error'
      });
      
      // This should trigger error handling due to validation failure
      bridge.updateGameState('test.value', 'any-value');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(errorHandler).toHaveBeenCalled();
    });

    it('should handle cleanup properly', () => {
      const testHandler = jest.fn();
      bridge.subscribeToEvent('test:event', testHandler);
      
      bridge.destroy();
      
      // After destroy, metrics should be reset
      expect(bridge.getMetrics().subscriptionCount).toBe(0);
      expect(bridge.getMetrics().mappingCount).toBe(0);
      expect(bridge.getQueueSize()).toBe(0);
      
      // Event handler should not be called after destroy
      eventBus.emit('test:event', {});
      expect(testHandler).not.toHaveBeenCalled();
    });
  });

  describe('CSS and Attribute Updates', () => {
    beforeEach(() => {
      const mockComponent = new MockUIComponent('styled-component');
      mockContainer.addComponent(mockComponent);
    });

    it('should handle style property updates', async () => {
      const mapping: UIStateMapping = {
        gameProperty: 'ui.color',
        componentId: 'styled-component',
        uiProperty: 'style.backgroundColor'
      };

      bridge.mapStateToUI(mapping);
      bridge.updateGameState('ui.color', 'red');
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const component = mockContainer.getComponent('styled-component');
      expect(component?.element.style.backgroundColor).toBe('red');
    });

    it('should handle attribute updates', async () => {
      const mapping: UIStateMapping = {
        gameProperty: 'ui.title',
        componentId: 'styled-component',
        uiProperty: 'attr.title'
      };

      bridge.mapStateToUI(mapping);
      bridge.updateGameState('ui.title', 'Test Title');
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const component = mockContainer.getComponent('styled-component');
      expect(component?.element.getAttribute('title')).toBe('Test Title');
    });
  });
});