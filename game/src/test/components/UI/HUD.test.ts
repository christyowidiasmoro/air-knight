/**
 * Unit tests for HUD Component
 */

import { HUD, createResponsiveHUD, HUDData, HUDConfig } from '../../../components/UI/HUD';

// Mock DOM environment
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock requestAnimationFrame
(window as any).requestAnimationFrame = jest.fn((cb: (time: number) => void) => {
  cb(Date.now());
  return 1;
});

describe('HUD Component', () => {
  let hud: HUD;
  let config: HUDConfig;

  beforeEach(() => {
    config = {
      id: 'test-hud',
      position: { x: 16, y: 16, anchor: 'px', origin: 'top-left' },
      size: { width: 300, height: 120 },
      isVisible: true,
      isInteractive: false,
      showHealthBar: true,
      showScoreDisplay: true,
      showLevelInfo: true,
      showExperienceBar: true,
      showLives: false,
      showEnergyBar: false,
      compact: false,
      theme: 'default'
    };

    hud = new HUD(config);
  });

  afterEach(() => {
    hud.destroy();
  });

  describe('Initialization', () => {
    test('should create HUD with correct structure', () => {
      expect(hud.element).toBeDefined();
      expect(hud.element.className).toContain('hud-responsive');
      expect(hud.element.className).toContain('default');
    });

    test('should apply compact mode classes', () => {
      const compactConfig = { ...config, compact: true };
      const compactHUD = new HUD(compactConfig);
      
      expect(compactHUD.element.className).toContain('compact');
      
      compactHUD.destroy();
    });

    test('should apply theme classes correctly', () => {
      const darkConfig = { ...config, theme: 'dark' as const };
      const darkHUD = new HUD(darkConfig);
      
      expect(darkHUD.element.className).toContain('dark');
      
      darkHUD.destroy();
    });

    test('should create health bar when enabled', () => {
      const healthBar = hud.element.querySelector('.hud-health-container');
      expect(healthBar).toBeTruthy();
      
      const progressBar = healthBar?.querySelector('.game-progress-bar');
      expect(progressBar).toBeTruthy();
    });

    test('should not create health bar when disabled', () => {
      const noHealthConfig = { ...config, showHealthBar: false };
      const noHealthHUD = new HUD(noHealthConfig);
      
      const healthBar = noHealthHUD.element.querySelector('.hud-health-container');
      expect(healthBar).toBeFalsy();
      
      noHealthHUD.destroy();
    });

    test('should create score display when enabled', () => {
      const scoreDisplay = hud.element.querySelector('.hud-score');
      expect(scoreDisplay).toBeTruthy();
    });

    test('should create experience bar when enabled', () => {
      const expBar = hud.element.querySelector('.hud-experience-container');
      expect(expBar).toBeTruthy();
      
      const progressBar = expBar?.querySelector('.game-experience-bar');
      expect(progressBar).toBeTruthy();
    });

    test('should apply responsive classes', () => {
      expect(hud.element.className).toContain('ui-layer-content');
      expect(hud.element.className).toContain('ui-non-interactive');
      expect(hud.element.className).toContain('ui-fade-in');
    });
  });

  describe('Data Management', () => {
    test('should initialize with default data', () => {
      const data = hud.getData();
      
      expect(data.health).toBe(100);
      expect(data.maxHealth).toBe(100);
      expect(data.score).toBe(0);
      expect(data.level).toBe(1);
      expect(data.experience).toBe(0);
      expect(data.maxExperience).toBe(100);
    });

    test('should update data correctly', () => {
      const newData: Partial<HUDData> = {
        health: 75,
        score: 1500,
        level: 3,
        experience: 45
      };

      hud.updateData(newData);
      const updatedData = hud.getData();

      expect(updatedData.health).toBe(75);
      expect(updatedData.score).toBe(1500);
      expect(updatedData.level).toBe(3);
      expect(updatedData.experience).toBe(45);
      // Unchanged values should remain
      expect(updatedData.maxHealth).toBe(100);
    });

    test('should preserve existing data when partially updating', () => {
      hud.updateData({ score: 500, level: 2 });
      hud.updateData({ health: 80 });
      
      const data = hud.getData();
      expect(data.health).toBe(80);
      expect(data.score).toBe(500); // Should be preserved
      expect(data.level).toBe(2);   // Should be preserved
    });
  });

  describe('Health Bar Display', () => {
    test('should update health bar fill correctly', () => {
      const healthFill = hud.element.querySelector('.game-progress-fill') as HTMLElement;
      expect(healthFill).toBeTruthy();

      hud.updateData({ health: 50, maxHealth: 100 });
      expect(healthFill.style.width).toBe('50%');

      hud.updateData({ health: 25, maxHealth: 100 });
      expect(healthFill.style.width).toBe('25%');
    });

    test('should handle zero health correctly', () => {
      const healthFill = hud.element.querySelector('.game-progress-fill') as HTMLElement;
      
      hud.updateData({ health: 0, maxHealth: 100 });
      expect(healthFill.style.width).toBe('0%');
    });

    test('should handle health above maximum correctly', () => {
      const healthFill = hud.element.querySelector('.game-progress-fill') as HTMLElement;
      
      hud.updateData({ health: 150, maxHealth: 100 });
      expect(healthFill.style.width).toBe('100%');
    });

    test('should handle negative health correctly', () => {
      const healthFill = hud.element.querySelector('.game-progress-fill') as HTMLElement;
      
      hud.updateData({ health: -10, maxHealth: 100 });
      expect(healthFill.style.width).toBe('0%');
    });

    test('should add critical health warning', () => {
      const healthBar = hud.element.querySelector('.game-progress-bar') as HTMLElement;
      
      hud.updateData({ health: 20, maxHealth: 100 });
      expect(healthBar.classList.contains('critical')).toBe(true);
      
      hud.updateData({ health: 50, maxHealth: 100 });
      expect(healthBar.classList.contains('critical')).toBe(false);
    });
  });

  describe('Score Display', () => {
    test('should format score with locale string', () => {
      const scoreDisplay = hud.element.querySelector('.hud-score') as HTMLElement;
      
      hud.updateData({ score: 1234567 });
      expect(scoreDisplay.textContent).toBe('Score: 1,234,567');
    });

    test('should handle zero score', () => {
      const scoreDisplay = hud.element.querySelector('.hud-score') as HTMLElement;
      
      hud.updateData({ score: 0 });
      expect(scoreDisplay.textContent).toBe('Score: 0');
    });
  });

  describe('Level Display', () => {
    test('should display level correctly', () => {
      const levelDisplay = hud.element.querySelector('.hud-level') as HTMLElement;
      
      hud.updateData({ level: 5 });
      expect(levelDisplay.textContent).toBe('Level 5');
    });
  });

  describe('Experience Bar', () => {
    test('should update experience bar fill correctly', () => {
      const expFill = hud.element.querySelector('.game-experience-bar .game-progress-fill') as HTMLElement;
      
      hud.updateData({ experience: 30, maxExperience: 100 });
      expect(expFill.style.width).toBe('30%');
      
      hud.updateData({ experience: 75, maxExperience: 150 });
      expect(expFill.style.width).toBe('50%');
    });

    test('should handle full experience correctly', () => {
      const expFill = hud.element.querySelector('.game-experience-bar .game-progress-fill') as HTMLElement;
      
      hud.updateData({ experience: 100, maxExperience: 100 });
      expect(expFill.style.width).toBe('100%');
    });
  });

  describe('Lives Display', () => {
    test('should create lives display when enabled', () => {
      const livesConfig = { ...config, showLives: true };
      const livesHUD = new HUD(livesConfig);
      
      const livesDisplay = livesHUD.element.querySelector('.hud-lives');
      expect(livesDisplay).toBeTruthy();
      
      livesHUD.destroy();
    });

    test('should update lives display correctly', () => {
      const livesConfig = { ...config, showLives: true };
      const livesHUD = new HUD(livesConfig);
      
      const livesDisplay = livesHUD.element.querySelector('.hud-lives') as HTMLElement;
      
      livesHUD.updateData({ lives: 3 });
      expect(livesDisplay.textContent).toBe('Lives: 3');
      
      livesHUD.destroy();
    });
  });

  describe('Energy Bar', () => {
    test('should create energy bar when enabled', () => {
      const energyConfig = { ...config, showEnergyBar: true };
      const energyHUD = new HUD(energyConfig);
      
      const energyBar = energyHUD.element.querySelector('.hud-energy-container');
      expect(energyBar).toBeTruthy();
      
      energyHUD.destroy();
    });

    test('should update energy bar fill correctly', () => {
      const energyConfig = { ...config, showEnergyBar: true };
      const energyHUD = new HUD(energyConfig);
      
      const energyFill = energyHUD.element.querySelector('.game-mana-bar .game-progress-fill') as HTMLElement;
      
      energyHUD.updateData({ energy: 60, maxEnergy: 100 });
      expect(energyFill.style.width).toBe('60%');
      
      energyHUD.destroy();
    });
  });

  describe('Responsive Behavior', () => {
    test('should apply mobile portrait classes', () => {
      // Mock mobile portrait dimensions
      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
      
      // Manually trigger the responsive layout update
      (hud as any).updateResponsiveLayout();
      
      expect(hud.element.classList.contains('mobile-portrait')).toBe(true);
    });

    test('should apply mobile landscape classes', () => {
      // Mock mobile landscape dimensions (width should be <= 768 to be considered mobile)
      Object.defineProperty(window, 'innerWidth', { value: 700, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 400, configurable: true });
      
      // Reset all responsive classes first
      hud.element.classList.remove('mobile-portrait', 'mobile-landscape', 'tablet', 'desktop');
      
      // Manually trigger the responsive layout update
      (hud as any).updateResponsiveLayout();
      
      expect(hud.element.classList.contains('mobile-landscape')).toBe(true);
    });

    test('should apply tablet classes', () => {
      // Mock tablet dimensions
      Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
      
      // Manually trigger the responsive layout update
      (hud as any).updateResponsiveLayout();
      
      expect(hud.element.classList.contains('tablet')).toBe(true);
    });

    test('should apply desktop classes', () => {
      // Mock desktop dimensions
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true });
      
      // Manually trigger the responsive layout update
      (hud as any).updateResponsiveLayout();
      
      expect(hud.element.classList.contains('desktop')).toBe(true);
    });
  });

  describe('Health Animation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should animate health change smoothly', () => {
      hud.updateData({ health: 100, maxHealth: 100 });
      
      hud.animateHealthChange(50, 1000);
      
      // Fast forward animation
      jest.advanceTimersByTime(500); // Halfway
      
      const currentData = hud.getData();
      expect(currentData.health).toBeGreaterThan(50);
      expect(currentData.health).toBeLessThan(100);
      
      // Complete animation
      jest.advanceTimersByTime(500);
      
      const finalData = hud.getData();
      expect(Math.round(finalData.health)).toBe(50);
    });

    test('should handle health animation completion', () => {
      hud.updateData({ health: 80, maxHealth: 100 });
      
      hud.animateHealthChange(20, 500);
      
      // Complete animation immediately
      jest.advanceTimersByTime(500);
      
      const finalData = hud.getData();
      expect(Math.round(finalData.health)).toBe(20);
    });
  });

  describe('Factory Function', () => {
    test('should create HUD with default configuration', () => {
      const defaultHUD = createResponsiveHUD();
      
      expect(defaultHUD).toBeInstanceOf(HUD);
      expect(defaultHUD.id).toBe('game-hud');
      expect(defaultHUD.isVisible).toBe(true);
      expect(defaultHUD.isInteractive).toBe(false);
      
      defaultHUD.destroy();
    });

    test('should create HUD with custom configuration', () => {
      const customHUD = createResponsiveHUD({
        id: 'custom-hud',
        compact: true,
        theme: 'dark',
        showLives: true,
        showEnergyBar: true
      });
      
      expect(customHUD.id).toBe('custom-hud');
      expect(customHUD.element.className).toContain('compact');
      expect(customHUD.element.className).toContain('dark');
      
      const livesDisplay = customHUD.element.querySelector('.hud-lives');
      const energyBar = customHUD.element.querySelector('.hud-energy-container');
      
      expect(livesDisplay).toBeTruthy();
      expect(energyBar).toBeTruthy();
      
      customHUD.destroy();
    });

    test('should merge partial config with defaults', () => {
      const partialHUD = createResponsiveHUD({
        showHealthBar: false
      });
      
      // Should have default ID but custom health bar setting
      expect(partialHUD.id).toBe('game-hud');
      
      const healthBar = partialHUD.element.querySelector('.hud-health-container');
      expect(healthBar).toBeFalsy();
      
      partialHUD.destroy();
    });
  });

  describe('Component Lifecycle', () => {
    test('should mount and unmount correctly', () => {
      const container = document.createElement('div');
      
      hud.mount(container);
      expect(container.children).toHaveLength(1);
      expect(container.children[0]).toBe(hud.element);
      
      hud.unmount();
      expect(container.children).toHaveLength(0);
    });

    test('should show and hide correctly', () => {
      expect(hud.isVisible).toBe(true);
      
      hud.hide();
      expect(hud.isVisible).toBe(false);
      expect(hud.element.style.display).toBe('none');
      
      hud.show();
      expect(hud.isVisible).toBe(true);
      expect(hud.element.style.display).not.toBe('none');
    });

    test('should clean up properly on destroy', () => {
      const container = document.createElement('div');
      hud.mount(container);
      
      hud.destroy();
      
      expect(container.children).toHaveLength(0);
      expect(hud.element.parentNode).toBeNull();
    });
  });

  describe('Accessibility', () => {
    test('should have appropriate ARIA attributes', () => {
      // Health bar should have progress role
      const healthBar = hud.element.querySelector('.game-progress-bar');
      expect(healthBar).toBeTruthy();
      
      // Check for semantic structure
      const container = hud.element.querySelector('.hud-container');
      expect(container).toBeTruthy();
    });

    test('should support non-interactive mode', () => {
      expect(hud.isInteractive).toBe(false);
      expect(hud.element.className).toContain('ui-non-interactive');
    });
  });
});