/**
 * Unit tests for LayoutManager
 */

import { LayoutManager } from '../../systems/LayoutManager';
import { UIComponent } from '../../components/UI/UIComponent';
import { ResponsiveConfig, UISize, UIComponentConfig } from '../../types/ui';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('LayoutManager', () => {
  let layoutManager: LayoutManager;
  let config: ResponsiveConfig;

  beforeEach(() => {
    config = {
      breakpoints: [
        { name: 'mobile', minWidth: 0, maxWidth: 768 },
        { name: 'tablet', minWidth: 769, maxWidth: 1024 },
        { name: 'desktop', minWidth: 1025 }
      ],
      scalingMode: 'proportional',
      minScale: 0.5,
      maxScale: 2.0,
      maintainAspectRatio: true
    };
    
    layoutManager = new LayoutManager(config);
  });

  afterEach(() => {
    layoutManager.destroy();
  });

  describe('Initialization', () => {
    test('should create layout manager with correct properties', () => {
      expect(layoutManager.breakpoints).toEqual(config.breakpoints);
      expect(layoutManager.scaleFactor).toBe(1);
      expect(layoutManager.currentBreakpoint).toBe('default');
    });

    test('should initialize successfully', () => {
      expect(() => layoutManager.initialize()).not.toThrow();
    });

    test('should throw error when initializing twice', () => {
      layoutManager.initialize();
      expect(() => layoutManager.initialize()).toThrow('LayoutManager already initialized');
    });

    test('should setup default breakpoints when none provided', () => {
      const emptyConfig: ResponsiveConfig = {
        breakpoints: [],
        scalingMode: 'fixed'
      };
      
      const manager = new LayoutManager(emptyConfig);
      
      expect(manager.breakpoints).toHaveLength(3);
      expect(manager.breakpoints[0].name).toBe('mobile');
      expect(manager.breakpoints[1].name).toBe('tablet');
      expect(manager.breakpoints[2].name).toBe('desktop');
      
      manager.destroy();
    });
  });

  describe('Breakpoint Management', () => {
    beforeEach(() => {
      layoutManager.initialize();
    });

    test('should add breakpoint correctly', () => {
      const newBreakpoint = { name: 'large', minWidth: 1440 };
      layoutManager.addBreakpoint(newBreakpoint);
      
      expect(layoutManager.breakpoints).toContainEqual(newBreakpoint);
      expect(layoutManager.breakpoints).toHaveLength(4);
    });

    test('should insert breakpoint in correct order', () => {
      const smallBreakpoint = { name: 'small', minWidth: 320, maxWidth: 480 };
      layoutManager.addBreakpoint(smallBreakpoint);
      
      const breakpoints = layoutManager.breakpoints;
      const smallIndex = breakpoints.findIndex(bp => bp.name === 'small');
      const mobileIndex = breakpoints.findIndex(bp => bp.name === 'mobile');
      
      expect(smallIndex).toBeGreaterThan(mobileIndex);
    });

    test('should replace existing breakpoint with same name', () => {
      const newMobile = { name: 'mobile', minWidth: 0, maxWidth: 600 };
      layoutManager.addBreakpoint(newMobile);
      
      const mobileBreakpoints = layoutManager.breakpoints.filter(bp => bp.name === 'mobile');
      expect(mobileBreakpoints).toHaveLength(1);
      expect(mobileBreakpoints[0].maxWidth).toBe(600);
    });

    test('should remove breakpoint correctly', () => {
      layoutManager.removeBreakpoint('tablet');
      
      expect(layoutManager.breakpoints.find(bp => bp.name === 'tablet')).toBeUndefined();
      expect(layoutManager.breakpoints).toHaveLength(2);
    });

    test('should determine current breakpoint based on viewport', async () => {
      const mobileSize: UISize = { width: 500, height: 800 };
      const tabletSize: UISize = { width: 900, height: 600 };
      
      await layoutManager.updateLayout(mobileSize, mobileSize);
      expect(layoutManager.currentBreakpoint).toBe('mobile');
      
      await layoutManager.updateLayout(tabletSize, tabletSize);
      expect(layoutManager.currentBreakpoint).toBe('tablet');
    });
  });

  describe('Scale Factor Calculation', () => {
    beforeEach(() => {
      layoutManager.initialize();
    });

    test('should calculate proportional scale factor', async () => {
      const viewport: UISize = { width: 960, height: 540 }; // Half of 1920x1080
      await layoutManager.updateLayout(viewport, viewport);
      
      expect(layoutManager.scaleFactor).toBe(0.5);
    });

    test('should respect minimum scale constraint', async () => {
      const viewport: UISize = { width: 100, height: 100 };
      await layoutManager.updateLayout(viewport, viewport);
      
      expect(layoutManager.scaleFactor).toBe(config.minScale);
    });

    test('should respect maximum scale constraint', async () => {
      const viewport: UISize = { width: 5000, height: 5000 };
      await layoutManager.updateLayout(viewport, viewport);
      
      expect(layoutManager.scaleFactor).toBe(config.maxScale);
    });

    test('should use fixed scaling mode', () => {
      const fixedConfig: ResponsiveConfig = {
        ...config,
        scalingMode: 'fixed'
      };
      
      const fixedManager = new LayoutManager(fixedConfig);
      fixedManager.initialize();
      
      const viewport: UISize = { width: 500, height: 500 };
      fixedManager.updateLayout(viewport, viewport);
      
      expect(fixedManager.scaleFactor).toBe(1);
      fixedManager.destroy();
    });
  });

  describe('Component Positioning', () => {
    let component: UIComponent;
    let componentConfig: UIComponentConfig;

    beforeEach(() => {
      layoutManager.initialize();
      
      componentConfig = {
        id: 'test-component',
        position: { x: 100, y: 100, anchor: 'px', origin: 'top-left' },
        size: { width: 200, height: 150 }
      };
      
      component = new UIComponent(componentConfig);
    });

    afterEach(() => {
      component.destroy();
    });

    test('should position component with scaling', () => {
      // Set up a scale factor
      const viewport: UISize = { width: 960, height: 540 };
      layoutManager.updateLayout(viewport, viewport);
      
      layoutManager.positionComponent(component);
      
      // Component should be scaled by the scale factor (0.5)
      expect(component.position.x).toBe(50); // 100 * 0.5
      expect(component.position.y).toBe(50); // 100 * 0.5
    });

    test('should maintain percentage-based positions', () => {
      const percentageConfig: UIComponentConfig = {
        ...componentConfig,
        position: { x: 50, y: 25, anchor: '%', origin: 'center' }
      };
      
      const percentageComponent = new UIComponent(percentageConfig);
      layoutManager.positionComponent(percentageComponent);
      
      // Percentage positions should remain unchanged
      expect(percentageComponent.position.x).toBe(50);
      expect(percentageComponent.position.y).toBe(25);
      expect(percentageComponent.position.anchor).toBe('%');
      
      percentageComponent.destroy();
    });

    test('should apply minimum touch target sizes on mobile', async () => {
      // Set mobile viewport
      const mobileViewport: UISize = { width: 400, height: 800 };
      await layoutManager.updateLayout(mobileViewport, mobileViewport);
      
      const smallComponent = new UIComponent({
        ...componentConfig,
        size: { width: 20, height: 20 }
      });
      
      layoutManager.positionComponent(smallComponent);
      
      // Should enforce minimum 44px touch targets
      expect(smallComponent.size.width).toBe(44);
      expect(smallComponent.size.height).toBe(44);
      
      smallComponent.destroy();
    });
  });

  describe('Responsive Size and Position Calculations', () => {
    beforeEach(() => {
      layoutManager.initialize();
    });

    test('should calculate responsive size with scaling', () => {
      const baseSize: UISize = { width: 100, height: 100 };
      const viewport: UISize = { width: 960, height: 540 }; // 0.5 scale
      
      layoutManager.updateLayout(viewport, viewport);
      const responsiveSize = layoutManager.getResponsiveSize(baseSize);
      
      expect(responsiveSize.width).toBe(50);
      expect(responsiveSize.height).toBe(50);
    });

    test('should calculate responsive position with scaling', () => {
      const basePosition = { x: 200, y: 200, anchor: 'px' as const, origin: 'top-left' as const };
      const viewport: UISize = { width: 960, height: 540 }; // 0.5 scale
      
      layoutManager.updateLayout(viewport, viewport);
      const responsivePosition = layoutManager.getResponsivePosition(basePosition);
      
      expect(responsivePosition.x).toBe(100);
      expect(responsivePosition.y).toBe(100);
    });

    test('should apply mobile margin adjustments', async () => {
      const basePosition = { x: 5, y: 5, anchor: 'px' as const, origin: 'top-left' as const };
      const mobileViewport: UISize = { width: 400, height: 800 };
      
      await layoutManager.updateLayout(mobileViewport, mobileViewport);
      const responsivePosition = layoutManager.getResponsivePosition(basePosition);
      
      // Should apply minimum 16px margin on mobile
      expect(responsivePosition.x).toBe(16);
      expect(responsivePosition.y).toBe(16);
    });
  });

  describe('Event Callbacks', () => {
    beforeEach(() => {
      layoutManager.initialize();
    });

    test('should trigger viewport change callback', async () => {
      const viewportCallback = jest.fn();
      layoutManager.onViewportChange(viewportCallback);
      
      const newViewport: UISize = { width: 1200, height: 800 };
      await layoutManager.updateLayout(newViewport, newViewport);
      
      expect(viewportCallback).toHaveBeenCalledWith(newViewport);
    });

    test('should trigger orientation change callback', async () => {
      const orientationCallback = jest.fn();
      layoutManager.onOrientationChange(orientationCallback);
      
      // Change from landscape to portrait
      const portraitViewport: UISize = { width: 400, height: 800 };
      await layoutManager.updateLayout(portraitViewport, portraitViewport);
      
      expect(orientationCallback).toHaveBeenCalledWith('portrait');
    });

    test('should not trigger orientation callback when orientation unchanged', async () => {
      const orientationCallback = jest.fn();
      layoutManager.onOrientationChange(orientationCallback);
      
      // Start with landscape
      const landscape1: UISize = { width: 800, height: 600 };
      await layoutManager.updateLayout(landscape1, landscape1);
      
      orientationCallback.mockClear();
      
      // Change to different landscape size
      const landscape2: UISize = { width: 1200, height: 800 };
      await layoutManager.updateLayout(landscape2, landscape2);
      
      expect(orientationCallback).not.toHaveBeenCalled();
    });
  });

  describe('Layout Updates', () => {
    let component1: UIComponent;
    let component2: UIComponent;

    beforeEach(() => {
      layoutManager.initialize();
      
      component1 = new UIComponent({
        id: 'comp1',
        position: { x: 100, y: 100, anchor: 'px', origin: 'top-left' },
        size: { width: 100, height: 100 }
      });
      
      component2 = new UIComponent({
        id: 'comp2',
        position: { x: 200, y: 200, anchor: 'px', origin: 'top-left' },
        size: { width: 100, height: 100 }
      });
      
      layoutManager.positionComponent(component1);
      layoutManager.positionComponent(component2);
    });

    afterEach(() => {
      component1.destroy();
      component2.destroy();
    });

    test('should return updated component IDs when layout changes', async () => {
      const mobileViewport: UISize = { width: 400, height: 800 };
      const updatedIds = await layoutManager.updateLayout(mobileViewport, mobileViewport);
      
      expect(updatedIds).toContain('comp1');
      expect(updatedIds).toContain('comp2');
    });

    test('should not return component IDs when layout unchanged', async () => {
      // Initial update
      const viewport: UISize = { width: 800, height: 600 };
      await layoutManager.updateLayout(viewport, viewport);
      
      // Same viewport size
      const updatedIds = await layoutManager.updateLayout(viewport, viewport);
      
      expect(updatedIds).toHaveLength(0);
    });

    test('should recalculate all component positions', () => {
      const originalX1 = component1.position.x;
      const originalX2 = component2.position.x;
      
      // Change scale factor by updating layout
      const smallViewport: UISize = { width: 960, height: 540 };
      layoutManager.updateLayout(smallViewport, smallViewport);
      
      layoutManager.recalculatePositions();
      
      // Positions should be updated
      expect(component1.position.x).not.toBe(originalX1);
      expect(component2.position.x).not.toBe(originalX2);
    });
  });

  describe('Cleanup', () => {
    test('should clean up event listeners and callbacks on destroy', () => {
      layoutManager.initialize();
      
      const viewportCallback = jest.fn();
      const orientationCallback = jest.fn();
      
      layoutManager.onViewportChange(viewportCallback);
      layoutManager.onOrientationChange(orientationCallback);
      
      expect(() => layoutManager.destroy()).not.toThrow();
    });

    test('should handle destroy of uninitialized manager', () => {
      expect(() => layoutManager.destroy()).not.toThrow();
    });
  });
});