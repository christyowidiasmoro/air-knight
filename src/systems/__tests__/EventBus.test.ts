/**
 * EventBus System Tests
 * Testing the core event management system
 */

import { EventBus } from '@/systems/EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(() => {
    eventBus.clear();
  });

  describe('Basic Event Operations', () => {
    test('should subscribe and emit events', () => {
      const mockHandler = jest.fn();
      const testData = { message: 'test' };

      eventBus.subscribe('test-event', mockHandler);
      eventBus.emit('test-event', testData);

      expect(mockHandler).toHaveBeenCalledWith(testData);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    test('should unsubscribe from events', () => {
      const mockHandler = jest.fn();

      eventBus.subscribe('test-event', mockHandler);
      eventBus.unsubscribe('test-event', mockHandler);
      eventBus.emit('test-event', { data: 'test' });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    test('should handle multiple subscribers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const testData = { value: 42 };

      eventBus.subscribe('multi-event', handler1);
      eventBus.subscribe('multi-event', handler2);
      eventBus.emit('multi-event', testData);

      expect(handler1).toHaveBeenCalledWith(testData);
      expect(handler2).toHaveBeenCalledWith(testData);
    });
  });

  describe('Once Events', () => {
    test('should fire once events only once', () => {
      const mockHandler = jest.fn();

      eventBus.once('once-event', mockHandler);
      eventBus.emit('once-event', { data: 'first' });
      eventBus.emit('once-event', { data: 'second' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith({ data: 'first' });
    });
  });

  describe('Error Handling', () => {
    test('should handle errors in event handlers gracefully', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const goodHandler = jest.fn();

      // Mock console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      eventBus.subscribe('error-event', errorHandler);
      eventBus.subscribe('error-event', goodHandler);
      eventBus.emit('error-event', { test: true });

      expect(errorHandler).toHaveBeenCalled();
      expect(goodHandler).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event handler'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Utility Methods', () => {
    test('should return correct listener count', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      expect(eventBus.getListenerCount('count-event')).toBe(0);

      eventBus.subscribe('count-event', handler1);
      expect(eventBus.getListenerCount('count-event')).toBe(1);

      eventBus.subscribe('count-event', handler2);
      expect(eventBus.getListenerCount('count-event')).toBe(2);

      eventBus.once('count-event', jest.fn());
      expect(eventBus.getListenerCount('count-event')).toBe(3);
    });

    test('should return all registered events', () => {
      eventBus.subscribe('event1', jest.fn());
      eventBus.subscribe('event2', jest.fn());
      eventBus.once('event3', jest.fn());

      const events = eventBus.getEvents();
      expect(events).toContain('event1');
      expect(events).toContain('event2');
      expect(events).toContain('event3');
      expect(events).toHaveLength(3);
    });

    test('should clear all events', () => {
      eventBus.subscribe('clear1', jest.fn());
      eventBus.subscribe('clear2', jest.fn());
      eventBus.once('clear3', jest.fn());

      expect(eventBus.getEvents()).toHaveLength(3);

      eventBus.clear();

      expect(eventBus.getEvents()).toHaveLength(0);
      expect(eventBus.getListenerCount('clear1')).toBe(0);
    });
  });
});