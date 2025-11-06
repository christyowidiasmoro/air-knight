/**
 * Unit tests for UIPanel component
 */

import { UIPanel, UIPanelConfig } from '../../../components/UI/Panel';
import { UIButton } from '../../../components/UI/Button';

describe('UIPanel', () => {
  let basicConfig: UIPanelConfig;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    basicConfig = {
      id: 'test-panel',
      position: { x: 100, y: 50, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 150 },
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a panel with basic configuration', () => {
      const panel = new UIPanel(basicConfig);

      expect(panel.element.tagName).toBe('DIV');
      expect(panel.id).toBe('test-panel');
      expect(panel.theme).toBe('light');
      expect(panel.draggable).toBe(false);
    });

    it('should set proper CSS classes', () => {
      const config: UIPanelConfig = {
        ...basicConfig,
        theme: 'dark',
        className: 'custom-panel',
      };

      const panel = new UIPanel(config);
      expect(panel.element.className).toContain('game-panel');
      expect(panel.element.className).toContain('custom-panel');
    });
  });

  describe('Theme Management', () => {
    it('should update theme correctly', () => {
      const panel = new UIPanel(basicConfig);
      panel.theme = 'dark';

      expect(panel.theme).toBe('dark');
      expect(panel.element.className).toContain('game-panel-dark');
    });
  });

  describe('Lifecycle Methods', () => {
    it('should mount and unmount correctly', () => {
      const panel = new UIPanel(basicConfig);
      panel.mount(container);

      expect(container.contains(panel.element)).toBe(true);

      panel.unmount();
      expect(container.contains(panel.element)).toBe(false);
    });
  });

  describe('Child Management', () => {
    it('should add and remove child components', () => {
      const panel = new UIPanel(basicConfig);
      const childButton = new UIButton({
        id: 'test-child',
        text: 'Child Button',
        position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
        size: { width: 80, height: 30 },
      });

      panel.addChild(childButton);
      expect(panel.element.contains(childButton.element)).toBe(true);

      panel.removeChild('test-child');
      expect(panel.element.contains(childButton.element)).toBe(false);
    });

    it('should get child components by ID', () => {
      const panel = new UIPanel(basicConfig);
      const childButton = new UIButton({
        id: 'test-child',
        text: 'Child Button',
        position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
        size: { width: 80, height: 30 },
      });

      panel.addChild(childButton);
      const retrievedChild = panel.getChild('test-child');
      
      expect(retrievedChild).toBe(childButton);
    });
  });
});
