/**
 * Unit tests for UIMenu component
 */

import { UIMenu, UIMenuConfig } from '../../../components/UI/Menu';

describe('UIMenu', () => {
  let basicConfig: UIMenuConfig;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    basicConfig = {
      id: 'test-menu',
      position: { x: 100, y: 50, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 150 },
      items: [
        { type: 'button', text: 'Item 1', onClick: jest.fn() },
        { type: 'separator' },
        { type: 'button', text: 'Item 2', onClick: jest.fn() },
      ],
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a menu with basic configuration', () => {
      const menu = new UIMenu(basicConfig);

      expect(menu.element.tagName).toBe('DIV');
      expect(menu.id).toBe('test-menu');
      expect(menu.orientation).toBe('vertical');
      expect(menu.autoClose).toBe(true);
    });

    it('should set proper CSS classes', () => {
      const config: UIMenuConfig = {
        ...basicConfig,
        orientation: 'horizontal',
        className: 'custom-menu',
      };

      const menu = new UIMenu(config);
      expect(menu.element.className).toContain('game-menu');
      expect(menu.element.className).toContain('custom-menu');
    });
  });

  describe('Orientation Management', () => {
    it('should update orientation correctly', () => {
      const menu = new UIMenu(basicConfig);
      menu.orientation = 'horizontal';

      expect(menu.orientation).toBe('horizontal');
      expect(menu.element.className).toContain('game-menu-horizontal');
    });
  });

  describe('Menu Items', () => {
    it('should create menu items from configuration', () => {
      const menu = new UIMenu(basicConfig);
      menu.mount(container);

      const menuItems = menu.element.querySelectorAll('[role="menuitem"]');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('Lifecycle Methods', () => {
    it('should mount and unmount correctly', () => {
      const menu = new UIMenu(basicConfig);
      menu.mount(container);

      expect(container.contains(menu.element)).toBe(true);

      menu.unmount();
      expect(container.contains(menu.element)).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle keyboard events', () => {
      const menu = new UIMenu(basicConfig);
      menu.mount(container);

      expect(() => {
        menu.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        menu.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      }).not.toThrow();
    });
  });
});
