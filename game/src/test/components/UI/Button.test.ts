/**
 * Unit tests for UIButton component
 */

import { UIButton, UIButtonConfig } from '../../../components/UI/Button';

describe('UIButton', () => {
  let basicConfig: UIButtonConfig;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    basicConfig = {
      id: 'test-button',
      text: 'Test Button',
      position: { x: 100, y: 50, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 40 },
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a button with basic configuration', () => {
      const button = new UIButton(basicConfig);

      expect(button.element.tagName).toBe('BUTTON');
      expect(button.id).toBe('test-button');
      expect(button.text).toBe('Test Button');
      expect(button.variant).toBe('primary');
      expect(button.buttonSize).toBe('medium');
      expect(button.disabled).toBe(false);
    });

    it('should set proper CSS classes', () => {
      const config: UIButtonConfig = {
        ...basicConfig,
        variant: 'secondary',
        buttonSize: 'small',
        className: 'custom-class',
      };

      const button = new UIButton(config);
      expect(button.element.className).toContain('game-button');
      expect(button.element.className).toContain('custom-class');
    });
  });

  describe('Event Handling', () => {
    it('should handle click events', () => {
      const clickHandler = jest.fn();
      const config: UIButtonConfig = {
        ...basicConfig,
        onClick: clickHandler,
      };

      const button = new UIButton(config);
      button.element.click();
      expect(clickHandler).toHaveBeenCalled();
    });
  });

  describe('Lifecycle Methods', () => {
    it('should mount and unmount correctly', () => {
      const button = new UIButton(basicConfig);
      button.mount(container);

      expect(container.contains(button.element)).toBe(true);

      button.unmount();
      expect(container.contains(button.element)).toBe(false);
    });
  });
});
