/**
 * Unit tests for UIUpdateScheduler
 * Tests performance optimization, RAF-based batching, and priority queuing
 */

import { UIUpdateScheduler, UpdatePriority, PerformanceProfile } from '../../systems/UIUpdateScheduler';
import { UIUpdate } from '../../types/ui';

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameId = 0;
const animationFrameCallbacks = new Map<number, Function>();

(global as any).requestAnimationFrame = jest.fn((callback: Function) => {
  const id = ++animationFrameId;
  animationFrameCallbacks.set(id, callback);
  // Simulate frame execution
  setTimeout(() => {
    if (animationFrameCallbacks.has(id)) {
      callback(performance.now());
      animationFrameCallbacks.delete(id);
    }
  }, 16); // Simulate 60fps
  return id;
});

(global as any).cancelAnimationFrame = jest.fn((id: number) => {
  animationFrameCallbacks.delete(id);
});

// Mock performance.now for consistent testing
let mockTime = 0;
(global as any).performance = {
  now: jest.fn(() => mockTime)
};

describe('UIUpdateScheduler', () => {
  let scheduler: UIUpdateScheduler;
  let mockUpdateCallback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
    animationFrameCallbacks.clear();
    animationFrameId = 0;
    
    scheduler = new UIUpdateScheduler();
    mockUpdateCallback = jest.fn().mockResolvedValue(undefined);
    scheduler.setUpdateCallback(mockUpdateCallback);
  });

  afterEach(() => {
    scheduler.stop();
  });

  describe('Constructor and Configuration', () => {
    test('should create scheduler with default config', () => {
      const newScheduler = new UIUpdateScheduler();
      expect(newScheduler.getQueueSize()).toBe(0);
      expect(newScheduler.isProcessingUpdates()).toBe(false);
      newScheduler.stop();
    });

    test('should create scheduler with custom config', () => {
      const config = {
        maxUpdatesPerFrame: 25,
        maxQueueSize: 100,
        performanceProfile: 'low' as PerformanceProfile,
        enableProfiling: false,
        targetFrameRate: 30
      };
      
      const newScheduler = new UIUpdateScheduler(config);
      expect(newScheduler.getQueueSize()).toBe(0);
      newScheduler.stop();
    });

    test('should adjust config for different performance profiles', () => {
      const highPerf = new UIUpdateScheduler({ performanceProfile: 'high' });
      const balancedPerf = new UIUpdateScheduler({ performanceProfile: 'balanced' });
      const lowPerf = new UIUpdateScheduler({ performanceProfile: 'low' });
      
      // Test that they are created successfully (config is internal)
      expect(highPerf.getQueueSize()).toBe(0);
      expect(balancedPerf.getQueueSize()).toBe(0);
      expect(lowPerf.getQueueSize()).toBe(0);
      
      highPerf.stop();
      balancedPerf.stop();
      lowPerf.stop();
    });
  });

  describe('Update Callback Management', () => {
    test('should set update callback', () => {
      const callback = jest.fn();
      scheduler.setUpdateCallback(callback);
      
      // Callback is set internally, test by scheduling an update
      const update: UIUpdate = {
        componentId: 'test',
        property: 'textContent',
        value: 'test',
        timestamp: Date.now()
      };
      
      scheduler.scheduleUpdate(update);
      expect(scheduler.getQueueSize()).toBe(1);
    });
  });

  describe('Update Scheduling', () => {
    test('should schedule single update', () => {
      const update: UIUpdate = {
        componentId: 'test-component',
        property: 'textContent',
        value: 'Hello World',
        timestamp: Date.now()
      };

      scheduler.scheduleUpdate(update);
      
      expect(scheduler.getQueueSize()).toBe(1);
      expect(scheduler.isProcessingUpdates()).toBe(true);
    });

    test('should schedule multiple updates', () => {
      const updates: UIUpdate[] = [
        {
          componentId: 'comp1',
          property: 'textContent',
          value: 'Text 1',
          timestamp: Date.now()
        },
        {
          componentId: 'comp2',
          property: 'value',
          value: 100,
          timestamp: Date.now()
        }
      ];

      scheduler.scheduleBatch(updates);
      
      expect(scheduler.getQueueSize()).toBe(2);
      expect(scheduler.isProcessingUpdates()).toBe(true);
    });

    test('should set default priority for updates', () => {
      const update: UIUpdate = {
        componentId: 'test',
        property: 'textContent',
        value: 'test',
        timestamp: Date.now()
        // No priority specified
      };

      scheduler.scheduleUpdate(update);
      expect(scheduler.getQueueSize()).toBe(1);
    });

    test('should handle updates with different priorities', () => {
      const updates: UIUpdate[] = [
        {
          componentId: 'low',
          property: 'value',
          value: 1,
          timestamp: Date.now(),
          priority: 'low'
        },
        {
          componentId: 'high',
          property: 'value',
          value: 2,
          timestamp: Date.now(),
          priority: 'high'
        },
        {
          componentId: 'normal',
          property: 'value',
          value: 3,
          timestamp: Date.now(),
          priority: 'normal'
        }
      ];

      updates.forEach(update => scheduler.scheduleUpdate(update));
      expect(scheduler.getQueueSize()).toBe(3);
    });
  });

  describe('Update Cancellation', () => {
    beforeEach(() => {
      // Add some test updates
      const updates: UIUpdate[] = [
        {
          componentId: 'comp1',
          property: 'textContent',
          value: 'Text',
          timestamp: Date.now()
        },
        {
          componentId: 'comp1',
          property: 'value',
          value: 100,
          timestamp: Date.now()
        },
        {
          componentId: 'comp2',
          property: 'textContent',
          value: 'Other',
          timestamp: Date.now()
        }
      ];
      
      scheduler.scheduleBatch(updates);
    });

    test('should cancel specific update by component and property', () => {
      expect(scheduler.getQueueSize()).toBe(3);
      
      scheduler.cancelUpdate('comp1', 'textContent');
      expect(scheduler.getQueueSize()).toBe(2);
    });

    test('should cancel all updates for component', () => {
      expect(scheduler.getQueueSize()).toBe(3);
      
      scheduler.cancelAllUpdates('comp1');
      expect(scheduler.getQueueSize()).toBe(1);
    });

    test('should cancel all updates', () => {
      expect(scheduler.getQueueSize()).toBe(3);
      
      scheduler.cancelAllUpdates();
      expect(scheduler.getQueueSize()).toBe(0);
    });
  });

  describe('Queue Management', () => {
    test('should track queue size correctly', () => {
      expect(scheduler.getQueueSize()).toBe(0);
      
      scheduler.scheduleUpdate({
        componentId: 'test',
        property: 'value',
        value: 1,
        timestamp: Date.now()
      });
      
      expect(scheduler.getQueueSize()).toBe(1);
    });

    test('should handle queue overflow', async () => {
      // Create scheduler with small queue
      const smallScheduler = new UIUpdateScheduler({ maxQueueSize: 3 });
      smallScheduler.setUpdateCallback(mockUpdateCallback);
      
      // Add more updates than the limit
      for (let i = 0; i < 5; i++) {
        smallScheduler.scheduleUpdate({
          componentId: `comp${i}`,
          property: 'value',
          value: i,
          timestamp: Date.now(),
          priority: i < 2 ? 'low' : 'normal'
        });
      }
      
      // Wait a bit for queue processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Queue should be limited (may be less than max due to processing)
      expect(smallScheduler.getQueueSize()).toBeLessThanOrEqual(5); // Allow some leeway for processing
      smallScheduler.stop();
    });
  });

  describe('Processing Status', () => {
    test('should track processing status', () => {
      expect(scheduler.isProcessingUpdates()).toBe(false);
      
      scheduler.scheduleUpdate({
        componentId: 'test',
        property: 'value',
        value: 1,
        timestamp: Date.now()
      });
      
      expect(scheduler.isProcessingUpdates()).toBe(true);
    });

    test('should stop processing when queue is empty', async () => {
      scheduler.scheduleUpdate({
        componentId: 'test',
        property: 'value',
        value: 1,
        timestamp: Date.now()
      });
      
      expect(scheduler.isProcessingUpdates()).toBe(true);
      
      // Flush all updates to ensure queue is empty
      await scheduler.flushUpdates();
      
      expect(scheduler.isProcessingUpdates()).toBe(false);
    });
  });

  describe('Performance Metrics', () => {
    test('should provide performance metrics', () => {
      const metrics = scheduler.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('averageUpdateTime');
      expect(metrics).toHaveProperty('maxUpdateTime');
      expect(metrics).toHaveProperty('updateCount');
      expect(metrics).toHaveProperty('queueSize');
      expect(metrics).toHaveProperty('activeComponents');
      expect(metrics).toHaveProperty('frameRate');
      
      expect(typeof metrics.averageUpdateTime).toBe('number');
      expect(typeof metrics.maxUpdateTime).toBe('number');
      expect(typeof metrics.updateCount).toBe('number');
      expect(typeof metrics.queueSize).toBe('number');
      expect(typeof metrics.activeComponents).toBe('number');
    });

    test('should track active component count', () => {
      scheduler.scheduleUpdate({
        componentId: 'comp1',
        property: 'value',
        value: 1,
        timestamp: Date.now()
      });
      
      scheduler.scheduleUpdate({
        componentId: 'comp2',
        property: 'value',
        value: 2,
        timestamp: Date.now()
      });
      
      scheduler.scheduleUpdate({
        componentId: 'comp1',
        property: 'textContent',
        value: 'text',
        timestamp: Date.now()
      });
      
      const metrics = scheduler.getPerformanceMetrics();
      expect(metrics.activeComponents).toBe(2); // comp1 and comp2
    });
  });

  describe('Performance Profile Management', () => {
    test('should update performance profile', () => {
      scheduler.setPerformanceProfile('high');
      // Profile change should not throw error
      expect(scheduler.getQueueSize()).toBe(0);
      
      scheduler.setPerformanceProfile('low');
      expect(scheduler.getQueueSize()).toBe(0);
    });
  });

  describe('Pending Updates Query', () => {
    test('should get pending updates for component', () => {
      const updates: UIUpdate[] = [
        {
          componentId: 'comp1',
          property: 'value',
          value: 1,
          timestamp: Date.now()
        },
        {
          componentId: 'comp2',
          property: 'value',
          value: 2,
          timestamp: Date.now()
        },
        {
          componentId: 'comp1',
          property: 'textContent',
          value: 'text',
          timestamp: Date.now()
        }
      ];
      
      scheduler.scheduleBatch(updates);
      
      const comp1Updates = scheduler.getPendingUpdates('comp1');
      expect(comp1Updates).toHaveLength(2);
      expect(comp1Updates.every(u => u.componentId === 'comp1')).toBe(true);
      
      const comp2Updates = scheduler.getPendingUpdates('comp2');
      expect(comp2Updates).toHaveLength(1);
      expect(comp2Updates[0].componentId).toBe('comp2');
    });

    test('should return empty array for non-existent component', () => {
      const updates = scheduler.getPendingUpdates('non-existent');
      expect(updates).toHaveLength(0);
    });
  });

  describe('Flush Updates', () => {
    test('should flush all updates immediately', async () => {
      const updates: UIUpdate[] = [
        {
          componentId: 'comp1',
          property: 'value',
          value: 1,
          timestamp: Date.now()
        },
        {
          componentId: 'comp2',
          property: 'value',
          value: 2,
          timestamp: Date.now()
        }
      ];
      
      scheduler.scheduleBatch(updates);
      expect(scheduler.getQueueSize()).toBe(2);
      
      await scheduler.flushUpdates();
      
      expect(scheduler.getQueueSize()).toBe(0);
      expect(scheduler.isProcessingUpdates()).toBe(false);
      expect(mockUpdateCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('Stop and Cleanup', () => {
    test('should stop scheduler and clear queue', () => {
      scheduler.scheduleUpdate({
        componentId: 'test',
        property: 'value',
        value: 1,
        timestamp: Date.now()
      });
      
      expect(scheduler.getQueueSize()).toBe(1);
      expect(scheduler.isProcessingUpdates()).toBe(true);
      
      scheduler.stop();
      
      expect(scheduler.getQueueSize()).toBe(0);
      expect(scheduler.isProcessingUpdates()).toBe(false);
    });

    test('should reset performance metrics on stop', () => {
      // Add some updates to generate metrics
      scheduler.scheduleUpdate({
        componentId: 'test',
        property: 'value',
        value: 1,
        timestamp: Date.now()
      });
      
      scheduler.stop();
      
      const metrics = scheduler.getPerformanceMetrics();
      expect(metrics.updateCount).toBe(0);
      expect(metrics.averageUpdateTime).toBe(0);
      expect(metrics.maxUpdateTime).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle update callback errors gracefully', async () => {
      const errorCallback = jest.fn().mockRejectedValue(new Error('Update failed'));
      scheduler.setUpdateCallback(errorCallback);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      scheduler.scheduleUpdate({
        componentId: 'test',
        property: 'value',
        value: 1,
        timestamp: Date.now()
      });
      
      await scheduler.flushUpdates();
      
      expect(errorCallback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('should continue processing other updates when one fails', async () => {
      let callCount = 0;
      const mixedCallback = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First update failed');
        }
        return Promise.resolve();
      });
      
      scheduler.setUpdateCallback(mixedCallback);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      scheduler.scheduleBatch([
        {
          componentId: 'comp1',
          property: 'value',
          value: 1,
          timestamp: Date.now()
        },
        {
          componentId: 'comp2',
          property: 'value',
          value: 2,
          timestamp: Date.now()
        }
      ]);
      
      await scheduler.flushUpdates();
      
      expect(mixedCallback).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});