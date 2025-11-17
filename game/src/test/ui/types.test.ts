/**
 * Unit tests for UI types and interfaces
 */

import { UIError, UIValidationError } from '../../types/ui';

describe('UI Types', () => {
  describe('UIError', () => {
    test('should create error with required properties', () => {
      const error = new UIError('Test message', 'TEST_CODE');
      
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('UIError');
      expect(error.timestamp).toBeGreaterThan(0);
      expect(error.componentId).toBeUndefined();
    });

    test('should create error with component ID', () => {
      const error = new UIError('Test message', 'TEST_CODE', 'test-component');
      
      expect(error.componentId).toBe('test-component');
    });

    test('should be instance of Error', () => {
      const error = new UIError('Test message', 'TEST_CODE');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(UIError);
    });
  });

  describe('UIValidationError', () => {
    test('should create validation error with field and rule', () => {
      const error = new UIValidationError('username', 'must be at least 3 characters');
      
      expect(error.message).toBe("Validation failed for field 'username': must be at least 3 characters");
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('UIValidationError');
      expect(error.validationField).toBe('username');
      expect(error.validationRule).toBe('must be at least 3 characters');
    });

    test('should create validation error with component ID', () => {
      const error = new UIValidationError('email', 'must be valid email', 'email-input');
      
      expect(error.componentId).toBe('email-input');
    });

    test('should be instance of UIError', () => {
      const error = new UIValidationError('field', 'rule');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(UIError);
      expect(error).toBeInstanceOf(UIValidationError);
    });
  });
});