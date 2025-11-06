/**
 * HUD Component - Responsive heads-up display that adapts to different screen sizes
 * Provides health, score, and other game information with responsive positioning
 */

import { UIComponent } from './UIComponent';
import { UIPosition, UISize, UIComponentConfig } from '../../types/ui';

/**
 * HUD data interface for displaying game information
 */
export interface HUDData {
  health: number;
  maxHealth: number;
  score: number;
  level: number;
  experience: number;
  maxExperience: number;
  lives?: number;
  energy?: number;
  maxEnergy?: number;
}

/**
 * HUD configuration options
 */
export interface HUDConfig extends UIComponentConfig {
  showHealthBar?: boolean;
  showScoreDisplay?: boolean;
  showLevelInfo?: boolean;
  showExperienceBar?: boolean;
  showLives?: boolean;
  showEnergyBar?: boolean;
  compact?: boolean;
  theme?: 'default' | 'dark' | 'minimal';
}

/**
 * Responsive HUD Component
 * Automatically adapts layout based on screen size and orientation
 */
export class HUD extends UIComponent {
  private _data: HUDData;
  private _config: HUDConfig;
  private _healthBar?: HTMLElement;
  private _healthFill?: HTMLElement;
  private _scoreDisplay?: HTMLElement;
  private _levelDisplay?: HTMLElement;
  private _experienceBar?: HTMLElement;
  private _experienceFill?: HTMLElement;
  private _livesDisplay?: HTMLElement;
  private _energyBar?: HTMLElement;
  private _energyFill?: HTMLElement;

  constructor(config: HUDConfig) {
    super(config);
    this._config = { ...config };
    this._data = {
      health: 100,
      maxHealth: 100,
      score: 0,
      level: 1,
      experience: 0,
      maxExperience: 100
    };
    
    this.setupHUDStructure();
    this.applyResponsiveClasses();
  }

  /**
   * Update HUD data and refresh display
   */
  updateData(data: Partial<HUDData>): void {
    this._data = { ...this._data, ...data };
    this.refreshDisplay();
  }

  /**
   * Set up the HUD HTML structure
   */
  private setupHUDStructure(): void {
    this.element.className = `hud-responsive ${this._config.theme || 'default'} ${this._config.compact ? 'compact' : ''}`;
    
    // Create main container
    const container = document.createElement('div');
    container.className = 'hud-container ui-responsive-flex ui-responsive-gap';
    
    // Top section (health, level, lives)
    if (this._config.showHealthBar !== false || this._config.showLevelInfo !== false || this._config.showLives !== false) {
      const topSection = this.createTopSection();
      container.appendChild(topSection);
    }
    
    // Middle section (score)
    if (this._config.showScoreDisplay !== false) {
      const middleSection = this.createMiddleSection();
      container.appendChild(middleSection);
    }
    
    // Bottom section (experience, energy)
    if (this._config.showExperienceBar !== false || this._config.showEnergyBar !== false) {
      const bottomSection = this.createBottomSection();
      container.appendChild(bottomSection);
    }
    
    this.element.appendChild(container);
  }

  /**
   * Create top section with health bar, level, and lives
   */
  private createTopSection(): HTMLElement {
    const topSection = document.createElement('div');
    topSection.className = 'hud-top-section ui-responsive-flex ui-responsive-gap';
    
    // Health bar
    if (this._config.showHealthBar !== false) {
      const healthContainer = document.createElement('div');
      healthContainer.className = 'hud-health-container ui-container-responsive';
      
      const healthLabel = document.createElement('div');
      healthLabel.className = 'hud-label ui-responsive-text';
      healthLabel.textContent = 'Health';
      
      this._healthBar = document.createElement('div');
      this._healthBar.className = 'game-progress-bar game-health-bar touch-target';
      
      this._healthFill = document.createElement('div');
      this._healthFill.className = 'game-progress-fill';
      this._healthBar.appendChild(this._healthFill);
      
      healthContainer.appendChild(healthLabel);
      healthContainer.appendChild(this._healthBar);
      topSection.appendChild(healthContainer);
    }
    
    // Level display
    if (this._config.showLevelInfo !== false) {
      this._levelDisplay = document.createElement('div');
      this._levelDisplay.className = 'hud-level game-hud ui-responsive-text hide-mobile show-tablet';
      topSection.appendChild(this._levelDisplay);
    }
    
    // Lives display
    if (this._config.showLives !== false) {
      this._livesDisplay = document.createElement('div');
      this._livesDisplay.className = 'hud-lives game-hud-small ui-responsive-text show-mobile';
      topSection.appendChild(this._livesDisplay);
    }
    
    return topSection;
  }

  /**
   * Create middle section with score display
   */
  private createMiddleSection(): HTMLElement {
    const middleSection = document.createElement('div');
    middleSection.className = 'hud-middle-section ui-center show-desktop hide-mobile hide-tablet';
    
    this._scoreDisplay = document.createElement('div');
    this._scoreDisplay.className = 'hud-score game-hud ui-responsive-text';
    middleSection.appendChild(this._scoreDisplay);
    
    return middleSection;
  }

  /**
   * Create bottom section with experience and energy bars
   */
  private createBottomSection(): HTMLElement {
    const bottomSection = document.createElement('div');
    bottomSection.className = 'hud-bottom-section ui-responsive-flex ui-responsive-gap';
    
    // Experience bar
    if (this._config.showExperienceBar !== false) {
      const expContainer = document.createElement('div');
      expContainer.className = 'hud-experience-container ui-container-responsive';
      
      const expLabel = document.createElement('div');
      expLabel.className = 'hud-label ui-responsive-text hide-mobile';
      expLabel.textContent = 'XP';
      
      this._experienceBar = document.createElement('div');
      this._experienceBar.className = 'game-progress-bar game-experience-bar';
      
      this._experienceFill = document.createElement('div');
      this._experienceFill.className = 'game-progress-fill';
      this._experienceBar.appendChild(this._experienceFill);
      
      expContainer.appendChild(expLabel);
      expContainer.appendChild(this._experienceBar);
      bottomSection.appendChild(expContainer);
    }
    
    // Energy bar
    if (this._config.showEnergyBar !== false) {
      const energyContainer = document.createElement('div');
      energyContainer.className = 'hud-energy-container ui-container-responsive';
      
      const energyLabel = document.createElement('div');
      energyLabel.className = 'hud-label ui-responsive-text hide-mobile';
      energyLabel.textContent = 'Energy';
      
      this._energyBar = document.createElement('div');
      this._energyBar.className = 'game-progress-bar game-mana-bar';
      
      this._energyFill = document.createElement('div');
      this._energyFill.className = 'game-progress-fill';
      this._energyBar.appendChild(this._energyFill);
      
      energyContainer.appendChild(energyLabel);
      energyContainer.appendChild(this._energyBar);
      bottomSection.appendChild(energyContainer);
    }
    
    return bottomSection;
  }

  /**
   * Apply responsive CSS classes based on configuration
   */
  private applyResponsiveClasses(): void {
    const baseClasses = [
      'ui-layer-content',
      'ui-non-interactive',
      'ui-fade-in'
    ];
    
    // Add theme-specific classes
    if (this._config.theme === 'dark') {
      baseClasses.push('game-panel-dark');
    } else if (this._config.theme === 'minimal') {
      baseClasses.push('bg-transparent');
    }
    
    // Add responsive positioning classes
    baseClasses.push('ui-corner-tl', 'ui-responsive-padding');
    
    // Add compact mode classes
    if (this._config.compact) {
      baseClasses.push('text-xs', 'p-1');
    }
    
    this.element.className += ' ' + baseClasses.join(' ');
  }

  /**
   * Refresh display with current data
   */
  private refreshDisplay(): void {
    // Update health bar
    if (this._healthFill && this._data.health !== undefined) {
      const healthPercent = Math.max(0, Math.min(100, (this._data.health / this._data.maxHealth) * 100));
      this._healthFill.style.width = `${healthPercent}%`;
      
      // Add critical health warning
      if (healthPercent <= 25) {
        this._healthBar?.classList.add('critical');
      } else {
        this._healthBar?.classList.remove('critical');
      }
    }
    
    // Update score display
    if (this._scoreDisplay) {
      this._scoreDisplay.textContent = `Score: ${this._data.score.toLocaleString()}`;
    }
    
    // Update level display
    if (this._levelDisplay) {
      this._levelDisplay.textContent = `Level ${this._data.level}`;
    }
    
    // Update experience bar
    if (this._experienceFill && this._data.experience !== undefined) {
      const expPercent = Math.max(0, Math.min(100, (this._data.experience / this._data.maxExperience) * 100));
      this._experienceFill.style.width = `${expPercent}%`;
    }
    
    // Update lives display
    if (this._livesDisplay && this._data.lives !== undefined) {
      this._livesDisplay.textContent = `Lives: ${this._data.lives}`;
    }
    
    // Update energy bar
    if (this._energyFill && this._data.energy !== undefined && this._data.maxEnergy) {
      const energyPercent = Math.max(0, Math.min(100, (this._data.energy / this._data.maxEnergy) * 100));
      this._energyFill.style.width = `${energyPercent}%`;
    }
  }

  /**
   * Override show method to ensure proper responsive layout
   */
  show(): void {
    super.show();
    this.refreshDisplay();
    
    // Trigger responsive layout update
    setTimeout(() => {
      this.updateResponsiveLayout();
    }, 100);
  }

  /**
   * Update responsive layout based on current screen size
   */
  private updateResponsiveLayout(): void {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    const isPortrait = window.innerHeight > window.innerWidth;
    
    // Adjust layout for mobile portrait mode
    if (isMobile && isPortrait) {
      this.element.classList.add('mobile-portrait');
      this.element.classList.remove('mobile-landscape', 'tablet', 'desktop');
    }
    // Adjust layout for mobile landscape mode
    else if (isMobile && !isPortrait) {
      this.element.classList.add('mobile-landscape');
      this.element.classList.remove('mobile-portrait', 'tablet', 'desktop');
    }
    // Adjust layout for tablet
    else if (isTablet) {
      this.element.classList.add('tablet');
      this.element.classList.remove('mobile-portrait', 'mobile-landscape', 'desktop');
    }
    // Adjust layout for desktop
    else {
      this.element.classList.add('desktop');
      this.element.classList.remove('mobile-portrait', 'mobile-landscape', 'tablet');
    }
  }

  /**
   * Get current HUD data
   */
  getData(): HUDData {
    return { ...this._data };
  }

  /**
   * Animate health change
   */
  animateHealthChange(newHealth: number, duration: number = 500): void {
    if (!this._healthFill) return;
    
    const startHealth = this._data.health;
    const healthDiff = newHealth - startHealth;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentHealth = startHealth + (healthDiff * easeProgress);
      
      this.updateData({ health: currentHealth });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Override destroy method for cleanup
   */
  destroy(): void {
    // Clean up references
    delete (this as any)._healthBar;
    delete (this as any)._healthFill;
    delete (this as any)._scoreDisplay;
    delete (this as any)._levelDisplay;
    delete (this as any)._experienceBar;
    delete (this as any)._experienceFill;
    delete (this as any)._livesDisplay;
    delete (this as any)._energyBar;
    delete (this as any)._energyFill;
    
    super.destroy();
  }
}

/**
 * Factory function to create a responsive HUD component
 */
export function createResponsiveHUD(config: Partial<HUDConfig> = {}): HUD {
  const defaultConfig: HUDConfig = {
    id: config.id || 'game-hud',
    position: { x: 16, y: 16, anchor: 'px', origin: 'top-left' },
    size: { width: 300, height: 120 },
    isVisible: true,
    isInteractive: false,
    className: 'responsive-hud',
    showHealthBar: true,
    showScoreDisplay: true,
    showLevelInfo: true,
    showExperienceBar: true,
    showLives: false,
    showEnergyBar: false,
    compact: false,
    theme: 'default'
  };

  const hudConfig = { ...defaultConfig, ...config };
  return new HUD(hudConfig);
}