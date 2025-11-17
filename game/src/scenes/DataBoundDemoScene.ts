/**
 * DataBoundDemoScene - Comprehensive demonstration of DataBoundComponent functionality
 * Shows all features: data binding, property watching, two-way binding, transformers, validators
 */

import { BaseScene } from './BaseScene';
import { GlobalUIManager, SceneUIManager } from '../systems/UIManager';
import { DataBoundComponent } from '../components/UI/DataBoundComponent';
import { UIPanel } from '../components/UI/Panel';
import { UIButton } from '../components/UI/Button';
import { UIMenu, UIMenuItemConfig } from '../components/UI/Menu';
import { eventBus, GameEvents } from '../systems/EventBus';

interface DemoGameState {
  player: {
    name: string;
    health: number;
    maxHealth: number;
    score: number;
    level: number;
    experience: number;
    maxExperience: number;
    stats: {
      strength: number;
      agility: number;
      intelligence: number;
    };
    inventory: Array<{
      id: string;
      name: string;
      quantity: number;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }>;
  };
  game: {
    isPaused: boolean;
    difficulty: 'easy' | 'medium' | 'hard' | 'nightmare';
    timeRemaining: number;
    currentWave: number;
    enemiesKilled: number;
    powerUpsCollected: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'glass';
    showMinimap: boolean;
    showDamageNumbers: boolean;
    musicVolume: number;
    sfxVolume: number;
    notifications: Array<{
      id: string;
      message: string;
      type: 'info' | 'warning' | 'error' | 'success';
      timestamp: number;
    }>;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
  }>;
}

export class DataBoundDemoScene extends BaseScene {
  private uiManager?: SceneUIManager;
  private demoComponents: Map<string, DataBoundComponent> = new Map();
  private mockGameState: DemoGameState;
  private autoUpdateInterval?: number | undefined;
  private changeCounter = 0;

  constructor() {
    super('DataBoundDemoScene');
    
    // Initialize comprehensive mock game state
    this.mockGameState = this.createMockGameState();
  }

  protected onInit(): void {
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  protected async onCreate(): Promise<void> {
    // Create background
    this.createBackground();
    
    // Initialize UI system
    await this.initializeUI();
    
    // Create all demonstrations
    this.createBasicDataBindingDemo();
    this.createTwoWayBindingDemo();
    this.createPropertyWatchingDemo();
    this.createTransformersDemo();
    this.createValidatorsDemo();
    this.createNestedDataDemo();
    this.createArrayDataDemo();
    this.createInteractiveControls();
    this.createNavigationButtons();
    
    // Start auto-update simulation
    this.startAutoUpdates();
  }

  /**
   * Create animated background with data visualization
   */
  private createBackground(): void {
    // Gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Title
    this.add.text(
      this.cameras.main.width / 2,
      20,
      'DataBoundComponent Complete Functionality Demo',
      {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);

    // Subtitle
    this.add.text(
      this.cameras.main.width / 2,
      50,
      'Real-time Data Binding • Property Watching • Two-way Binding • Transformers • Validators',
      {
        fontSize: '16px',
        color: '#ecf0f1',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // Animated data flow visualization
    this.createDataFlowVisualization();
  }

  /**
   * Create visual representation of data flow
   */
  private createDataFlowVisualization(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = 120;
    
    // Create flowing particles representing data
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Math.random() * this.cameras.main.width,
        centerY + Math.random() * 40 - 20,
        2,
        0x74b9ff,
        0.6
      );

      this.tweens.add({
        targets: particle,
        x: centerX + Math.sin(this.time.now * 0.001 + i) * 200,
        y: centerY + Math.cos(this.time.now * 0.001 + i) * 20,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Initialize UI system
   */
  private async initializeUI(): Promise<void> {
    try {
      const globalUIManager = GlobalUIManager.getInstance();
      const canvas = this.game.canvas;
      globalUIManager.setCanvas(canvas);
      this.uiManager = await globalUIManager.createSceneUI(this);
    } catch (error) {
      console.error('Failed to initialize UI:', error);
    }
  }

  /**
   * Demonstrate basic data binding
   */
  private createBasicDataBindingDemo(): void {
    if (!this.uiManager) return;

    const panel = new UIPanel({
      id: 'basic-binding-panel',
      title: 'Basic Data Binding',
      position: { x: 20, y: 180, anchor: 'px', origin: 'top-left' },
      size: { width: 300, height: 200 },
      theme: 'light',
      panelSize: 'compact'
    });

    // Player name display
    const nameDisplay = new DataBoundComponent({
      id: 'name-display',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'div',
      className: 'demo-text-display'
    });

    nameDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'player.name',
      transformer: (value: string) => `Player: ${value}`
    });

    // Health display with style binding
    const healthDisplay = new DataBoundComponent({
      id: 'health-display',
      position: { x: 10, y: 45, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'div',
      className: 'demo-health-display'
    });

    healthDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'player.health',
      transformer: (health: number) => {
        const maxHealth = this.mockGameState.player.maxHealth;
        const percentage = (health / maxHealth) * 100;
        return `Health: ${health}/${maxHealth} (${percentage.toFixed(1)}%)`;
      }
    });

    healthDisplay.addDataBinding({
      property: 'style.color',
      dataPath: 'player.health',
      transformer: (health: number) => {
        const percentage = (health / this.mockGameState.player.maxHealth) * 100;
        if (percentage > 66) return '#27ae60';
        if (percentage > 33) return '#f39c12';
        return '#e74c3c';
      }
    });

    // Score display with formatting
    const scoreDisplay = new DataBoundComponent({
      id: 'score-display',
      position: { x: 10, y: 80, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'div',
      className: 'demo-score-display'
    });

    scoreDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'player.score',
      transformer: (score: number) => `Score: ${score.toLocaleString()}`
    });

    // Level and experience
    const levelDisplay = new DataBoundComponent({
      id: 'level-display',
      position: { x: 10, y: 115, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'div',
      className: 'demo-level-display'
    });

    levelDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'player.level',
      transformer: (level: number) => `Level: ${level}`
    });

    // Experience bar
    const expBar = new DataBoundComponent({
      id: 'exp-bar',
      position: { x: 10, y: 150, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 15 },
      tagName: 'div',
      className: 'demo-progress-bar'
    });

    expBar.addDataBinding({
      property: 'style.width',
      dataPath: 'player.experience',
      transformer: (exp: number) => {
        const percentage = (exp / this.mockGameState.player.maxExperience) * 100;
        return `${percentage}%`;
      }
    });

    expBar.addDataBinding({
      property: 'title',
      dataPath: 'player.experience',
      transformer: (exp: number) => {
        const max = this.mockGameState.player.maxExperience;
        return `Experience: ${exp}/${max}`;
      }
    });

    // Bind data to all components
    [nameDisplay, healthDisplay, scoreDisplay, levelDisplay, expBar].forEach(component => {
      component.bindData(this.mockGameState);
      panel.addChild(component);
      this.demoComponents.set(component.id, component);
    });

    this.uiManager.addComponent(panel);
  }

  /**
   * Demonstrate two-way data binding
   */
  private createTwoWayBindingDemo(): void {
    if (!this.uiManager) return;

    const panel = new UIPanel({
      id: 'twoway-binding-panel',
      title: 'Two-Way Data Binding',
      position: { x: 340, y: 180, anchor: 'px', origin: 'top-left' },
      size: { width: 300, height: 200 },
      theme: 'dark',
      panelSize: 'compact'
    });

    // Player name input
    const nameInput = new DataBoundComponent({
      id: 'name-input',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'input',
      attributes: { type: 'text', placeholder: 'Enter player name' }
    });

    nameInput.addDataBinding({
      property: 'value',
      dataPath: 'player.name',
      twoWay: true
    });

    // Theme selector
    const themeSelect = new DataBoundComponent({
      id: 'theme-select',
      position: { x: 10, y: 50, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 30 },
      tagName: 'select'
    });

    // Add theme options
    const themes = ['light', 'dark', 'glass'];
    themes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      themeSelect.element.appendChild(option);
    });

    themeSelect.addDataBinding({
      property: 'value',
      dataPath: 'ui.theme',
      twoWay: true
    });

    // Music volume slider
    const volumeSlider = new DataBoundComponent({
      id: 'volume-slider',
      position: { x: 10, y: 90, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 30 },
      tagName: 'input',
      attributes: { type: 'range', min: '0', max: '100', step: '1' }
    });

    volumeSlider.addDataBinding({
      property: 'value',
      dataPath: 'ui.musicVolume',
      twoWay: true,
      transformer: (value: number) => value.toString()
    });

    // Volume display
    const volumeDisplay = new DataBoundComponent({
      id: 'volume-display',
      position: { x: 170, y: 95, anchor: 'px', origin: 'top-left' },
      size: { width: 50, height: 20 },
      tagName: 'span'
    });

    volumeDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'ui.musicVolume',
      transformer: (value: number) => `${value}%`
    });

    // Difficulty selector
    const difficultySelect = new DataBoundComponent({
      id: 'difficulty-select',
      position: { x: 10, y: 130, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 30 },
      tagName: 'select'
    });

    const difficulties = ['easy', 'medium', 'hard', 'nightmare'];
    difficulties.forEach(diff => {
      const option = document.createElement('option');
      option.value = diff;
      option.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
      difficultySelect.element.appendChild(option);
    });

    difficultySelect.addDataBinding({
      property: 'value',
      dataPath: 'game.difficulty',
      twoWay: true
    });

    // Bind data to all components
    [nameInput, themeSelect, volumeSlider, volumeDisplay, difficultySelect].forEach(component => {
      component.bindData(this.mockGameState);
      panel.addChild(component);
      this.demoComponents.set(component.id, component);
    });

    this.uiManager.addComponent(panel);
  }

  /**
   * Demonstrate property watching
   */
  private createPropertyWatchingDemo(): void {
    if (!this.uiManager) return;

    const panel = new UIPanel({
      id: 'watching-panel',
      title: 'Property Watching',
      position: { x: 660, y: 180, anchor: 'px', origin: 'top-left' },
      size: { width: 300, height: 200 },
      theme: 'glass',
      panelSize: 'compact'
    });

    // Change log display
    const changeLog = new DataBoundComponent({
      id: 'change-log',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 270, height: 120 },
      tagName: 'div',
      className: 'demo-change-log'
    });

    // Set initial content
    changeLog.element.innerHTML = '<div>Watching for changes...</div>';

    // Watch multiple properties
    const watchedPaths = [
      'player.health',
      'player.score',
      'player.level',
      'game.difficulty',
      'ui.theme',
      'ui.musicVolume'
    ];

    watchedPaths.forEach(path => {
      changeLog.watchProperty(path, (newValue, oldValue) => {
        this.logPropertyChange(changeLog, path, newValue, oldValue);
      });
    });

    // Change counter
    const counterDisplay = new DataBoundComponent({
      id: 'change-counter',
      position: { x: 10, y: 140, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'div',
      className: 'demo-counter'
    });

    counterDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'changeCounter',
      transformer: (count: number) => `Total Changes: ${count}`
    });

    // Clear log button
    const clearBtn = new UIButton({
      id: 'clear-log-btn',
      text: 'Clear Log',
      variant: 'secondary',
      buttonSize: 'small',
      position: { x: 220, y: 140, anchor: 'px', origin: 'top-left' },
      size: { width: 60, height: 30 },
      onClick: () => this.clearChangeLog(changeLog)
    });

    changeLog.bindData({ ...this.mockGameState, changeCounter: this.changeCounter });
    counterDisplay.bindData({ changeCounter: this.changeCounter });

    panel.addChild(changeLog);
    panel.addChild(counterDisplay);
    panel.addChild(clearBtn);

    this.demoComponents.set(changeLog.id, changeLog);
    this.demoComponents.set(counterDisplay.id, counterDisplay);
    this.uiManager.addComponent(panel);
  }

  /**
   * Demonstrate value transformers
   */
  private createTransformersDemo(): void {
    if (!this.uiManager) return;

    const panel = new UIPanel({
      id: 'transformers-panel',
      title: 'Value Transformers',
      position: { x: 20, y: 400, anchor: 'px', origin: 'top-left' },
      size: { width: 300, height: 180 },
      theme: 'light',
      panelSize: 'compact'
    });

    // Date/time transformer
    const timeDisplay = new DataBoundComponent({
      id: 'time-display',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 25 },
      tagName: 'div',
      className: 'demo-time-display'
    });

    timeDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'game.timeRemaining',
      transformer: (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `Time: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
    });

    // Currency transformer
    const scoreFormatted = new DataBoundComponent({
      id: 'score-formatted',
      position: { x: 10, y: 40, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 25 },
      tagName: 'div',
      className: 'demo-currency-display'
    });

    scoreFormatted.addDataBinding({
      property: 'textContent',
      dataPath: 'player.score',
      transformer: (score: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(score);
      }
    });

    // Percentage transformer
    const healthPercent = new DataBoundComponent({
      id: 'health-percent',
      position: { x: 10, y: 70, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 25 },
      tagName: 'div',
      className: 'demo-percent-display'
    });

    healthPercent.addDataBinding({
      property: 'textContent',
      dataPath: 'player.health',
      transformer: (health: number) => {
        const percentage = (health / this.mockGameState.player.maxHealth) * 100;
        return `Health: ${percentage.toFixed(1)}%`;
      }
    });

    // Capitalize transformer
    const difficultyFormatted = new DataBoundComponent({
      id: 'difficulty-formatted',
      position: { x: 10, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 25 },
      tagName: 'div',
      className: 'demo-text-transform'
    });

    difficultyFormatted.addDataBinding({
      property: 'textContent',
      dataPath: 'game.difficulty',
      transformer: (difficulty: string) => {
        return `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
      }
    });

    // Color transformer based on value
    const waveDisplay = new DataBoundComponent({
      id: 'wave-display',
      position: { x: 10, y: 130, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 25 },
      tagName: 'div',
      className: 'demo-wave-display'
    });

    waveDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'game.currentWave',
      transformer: (wave: number) => `Current Wave: ${wave}`
    });

    waveDisplay.addDataBinding({
      property: 'style.backgroundColor',
      dataPath: 'game.currentWave',
      transformer: (wave: number) => {
        const hue = (wave * 30) % 360;
        return `hsl(${hue}, 70%, 45%)`;
      }
    });

    [timeDisplay, scoreFormatted, healthPercent, difficultyFormatted, waveDisplay].forEach(component => {
      component.bindData(this.mockGameState);
      panel.addChild(component);
      this.demoComponents.set(component.id, component);
    });

    this.uiManager.addComponent(panel);
  }

  /**
   * Demonstrate validators
   */
  private createValidatorsDemo(): void {
    if (!this.uiManager) return;

    const panel = new UIPanel({
      id: 'validators-panel',
      title: 'Input Validators',
      position: { x: 340, y: 400, anchor: 'px', origin: 'top-left' },
      size: { width: 300, height: 180 },
      theme: 'dark',
      panelSize: 'compact'
    });

    // Health input with validation
    const healthInput = new DataBoundComponent({
      id: 'health-input',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'input',
      attributes: { type: 'number', min: '0', max: '100', placeholder: 'Health (0-100)' }
    });

    healthInput.addDataBinding({
      property: 'value',
      dataPath: 'player.health',
      twoWay: true,
      validator: (value: number) => value >= 0 && value <= 100,
      errorMessage: 'Health must be between 0 and 100'
    });

    // Score input with validation
    const scoreInput = new DataBoundComponent({
      id: 'score-input',
      position: { x: 10, y: 50, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'input',
      attributes: { type: 'number', min: '0', placeholder: 'Score (positive numbers only)' }
    });

    scoreInput.addDataBinding({
      property: 'value',
      dataPath: 'player.score',
      twoWay: true,
      validator: (value: number) => value >= 0,
      errorMessage: 'Score must be positive'
    });

    // Player name with length validation
    const nameValidatedInput = new DataBoundComponent({
      id: 'name-validated-input',
      position: { x: 10, y: 90, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 },
      tagName: 'input',
      attributes: { type: 'text', placeholder: 'Name (3-20 chars)' }
    });

    nameValidatedInput.addDataBinding({
      property: 'value',
      dataPath: 'player.name',
      twoWay: true,
      validator: (value: string) => value.length >= 3 && value.length <= 20,
      errorMessage: 'Name must be 3-20 characters long'
    });

    // Validation status display
    const validationStatus = new DataBoundComponent({
      id: 'validation-status',
      position: { x: 10, y: 130, anchor: 'px', origin: 'top-left' },
      size: { width: 270, height: 40 },
      tagName: 'div',
      className: 'demo-validation-status'
    });

    // Set initial content
    validationStatus.element.innerHTML = 'Try entering invalid values above to see validation in action.';

    [healthInput, scoreInput, nameValidatedInput].forEach(component => {
      component.bindData(this.mockGameState);
      panel.addChild(component);
      this.demoComponents.set(component.id, component);
      
      // Listen for validation errors
      component.element.addEventListener('input', () => {
        this.updateValidationStatus(validationStatus);
      });
    });

    panel.addChild(validationStatus);
    this.uiManager.addComponent(panel);
  }

  /**
   * Demonstrate nested data binding
   */
  private createNestedDataDemo(): void {
    if (!this.uiManager) return;

    const panel = new UIPanel({
      id: 'nested-data-panel',
      title: 'Nested Data Binding',
      position: { x: 660, y: 400, anchor: 'px', origin: 'top-left' },
      size: { width: 300, height: 180 },
      theme: 'glass',
      panelSize: 'compact'
    });

    // Player stats
    const strengthDisplay = new DataBoundComponent({
      id: 'strength-display',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 80, height: 25 },
      tagName: 'div'
    });

    strengthDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'player.stats.strength',
      transformer: (value: number) => `STR: ${value}`
    });

    const agilityDisplay = new DataBoundComponent({
      id: 'agility-display',
      position: { x: 100, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 80, height: 25 },
      tagName: 'div'
    });

    agilityDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'player.stats.agility',
      transformer: (value: number) => `AGI: ${value}`
    });

    const intelligenceDisplay = new DataBoundComponent({
      id: 'intelligence-display',
      position: { x: 190, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 80, height: 25 },
      tagName: 'div'
    });

    intelligenceDisplay.addDataBinding({
      property: 'textContent',
      dataPath: 'player.stats.intelligence',
      transformer: (value: number) => `INT: ${value}`
    });

    // Game progress
    const waveInfo = new DataBoundComponent({
      id: 'wave-info',
      position: { x: 10, y: 45, anchor: 'px', origin: 'top-left' },
      size: { width: 130, height: 25 },
      tagName: 'div'
    });

    waveInfo.addDataBinding({
      property: 'textContent',
      dataPath: 'game.currentWave',
      transformer: (wave: number) => `Wave: ${wave}`
    });

    const enemiesKilled = new DataBoundComponent({
      id: 'enemies-killed',
      position: { x: 150, y: 45, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 25 },
      tagName: 'div'
    });

    enemiesKilled.addDataBinding({
      property: 'textContent',
      dataPath: 'game.enemiesKilled',
      transformer: (count: number) => `Kills: ${count}`
    });

    // Achievement progress (first achievement)
    const achievementProgress = new DataBoundComponent({
      id: 'achievement-progress',
      position: { x: 10, y: 80, anchor: 'px', origin: 'top-left' },
      size: { width: 260, height: 40 },
      tagName: 'div',
      className: 'demo-achievement'
    });

    achievementProgress.addDataBinding({
      property: 'innerHTML',
      dataPath: 'achievements.0',
      transformer: (achievement: any) => {
        if (!achievement) return 'No achievements';
        const progress = (achievement.progress / achievement.maxProgress) * 100;
        return `
          <div>${achievement.name}</div>
          <div style="font-size: 12px; color: #888;">${achievement.description}</div>
          <div style="font-size: 12px;">Progress: ${achievement.progress}/${achievement.maxProgress} (${progress.toFixed(1)}%)</div>
        `;
      }
    });

    // First inventory item
    const inventoryItem = new DataBoundComponent({
      id: 'inventory-item',
      position: { x: 10, y: 130, anchor: 'px', origin: 'top-left' },
      size: { width: 260, height: 30 },
      tagName: 'div'
    });

    inventoryItem.addDataBinding({
      property: 'innerHTML',
      dataPath: 'player.inventory.0',
      transformer: (item: any) => {
        if (!item) return 'No items';
        const rarityColors = {
          common: '#95a5a6',
          rare: '#3498db',
          epic: '#9b59b6',
          legendary: '#f39c12'
        };
        return `
          <span style="color: ${rarityColors[item.rarity as keyof typeof rarityColors]};">${item.name}</span> 
          x${item.quantity}
        `;
      }
    });

    [strengthDisplay, agilityDisplay, intelligenceDisplay, waveInfo, enemiesKilled, achievementProgress, inventoryItem].forEach(component => {
      component.bindData(this.mockGameState);
      panel.addChild(component);
      this.demoComponents.set(component.id, component);
    });

    this.uiManager.addComponent(panel);
  }

  /**
   * Demonstrate array data binding
   */
  private createArrayDataDemo(): void {
    if (!this.uiManager) return;

    const panel = new UIPanel({
      id: 'array-data-panel',
      title: 'Array Data & Notifications',
      position: { x: 980, y: 180, anchor: 'px', origin: 'top-left' },
      size: { width: 280, height: 400 },
      theme: 'dark',
      panelSize: 'compact'
    });

    // Notifications list
    const notificationsList = new DataBoundComponent({
      id: 'notifications-list',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 200 },
      tagName: 'div',
      className: 'demo-notifications-list'
    });

    notificationsList.addDataBinding({
      property: 'innerHTML',
      dataPath: 'ui.notifications',
      transformer: (notifications: any[]) => {
        if (!notifications || notifications.length === 0) {
          return '<div style="color: #888; text-align: center; padding: 20px;">No notifications</div>';
        }
        
        return notifications.slice(-5).map(notification => {
          const typeColors = {
            info: '#3498db',
            warning: '#f39c12',
            error: '#e74c3c',
            success: '#27ae60'
          };
          
          const timeAgo = Math.floor((Date.now() - notification.timestamp) / 1000);
          return `
            <div style="
              border-left: 3px solid ${typeColors[notification.type as keyof typeof typeColors]};
              padding: 8px;
              margin: 4px 0;
              background: rgba(255,255,255,0.1);
              border-radius: 4px;
            ">
              <div style="font-size: 12px; color: ${typeColors[notification.type as keyof typeof typeColors]}; font-weight: bold;">
                ${notification.type.toUpperCase()}
              </div>
              <div style="font-size: 14px; margin: 2px 0;">${notification.message}</div>
              <div style="font-size: 10px; color: #888;">${timeAgo}s ago</div>
            </div>
          `;
        }).join('');
      }
    });

    // Inventory list
    const inventoryList = new DataBoundComponent({
      id: 'inventory-list',
      position: { x: 10, y: 220, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 120 },
      tagName: 'div',
      className: 'demo-inventory-list'
    });

    inventoryList.addDataBinding({
      property: 'innerHTML',
      dataPath: 'player.inventory',
      transformer: (inventory: any[]) => {
        if (!inventory || inventory.length === 0) {
          return '<div style="color: #888;">Empty inventory</div>';
        }
        
        const rarityColors = {
          common: '#95a5a6',
          rare: '#3498db',
          epic: '#9b59b6',
          legendary: '#f39c12'
        };
        
        return inventory.map(item => `
          <div style="
            padding: 4px 8px;
            margin: 2px 0;
            background: rgba(${item.rarity === 'legendary' ? '243,156,18' : '255,255,255'},0.1);
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span style="color: ${rarityColors[item.rarity as keyof typeof rarityColors]}; font-weight: bold;">${item.name}</span>
            <span style="color: #ecf0f1;">x${item.quantity}</span>
          </div>
        `).join('');
      }
    });

    // Array statistics
    const arrayStats = new DataBoundComponent({
      id: 'array-stats',
      position: { x: 10, y: 350, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 40 },
      tagName: 'div',
      className: 'demo-array-stats'
    });

    arrayStats.addDataBinding({
      property: 'innerHTML',
      dataPath: 'ui.notifications',
      transformer: (notifications: any[]) => {
        const total = notifications?.length || 0;
        const recent = notifications?.filter(n => Date.now() - n.timestamp < 30000).length || 0;
        return `
          <div style="font-size: 12px;">
            Total Notifications: ${total}<br>
            Recent (30s): ${recent}
          </div>
        `;
      }
    });

    [notificationsList, inventoryList, arrayStats].forEach(component => {
      component.bindData(this.mockGameState);
      panel.addChild(component);
      this.demoComponents.set(component.id, component);
    });

    this.uiManager.addComponent(panel);
  }

  /**
   * Create interactive controls for testing
   */
  private createInteractiveControls(): void {
    if (!this.uiManager) return;

    const panel = new UIPanel({
      id: 'controls-panel',
      title: 'Interactive Test Controls',
      position: { x: 20, y: 600, anchor: 'px', origin: 'top-left' },
      size: { width: 600, height: 120 },
      theme: 'glass',
      panelSize: 'normal'
    });

    // Random data update button
    const randomUpdateBtn = new UIButton({
      id: 'random-update-btn',
      text: 'Random Update',
      variant: 'primary',
      buttonSize: 'medium',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.performRandomUpdate()
    });

    // Damage player button
    const damageBtn = new UIButton({
      id: 'damage-btn',
      text: 'Damage Player',
      variant: 'danger',
      buttonSize: 'medium',
      position: { x: 140, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.damagePlayer()
    });

    // Heal player button
    const healBtn = new UIButton({
      id: 'heal-btn',
      text: 'Heal Player',
      variant: 'accent',
      buttonSize: 'medium',
      position: { x: 270, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.healPlayer()
    });

    // Add score button
    const scoreBtn = new UIButton({
      id: 'score-btn',
      text: 'Add Score',
      variant: 'secondary',
      buttonSize: 'medium',
      position: { x: 400, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.addScore()
    });

    // Level up button
    const levelUpBtn = new UIButton({
      id: 'level-up-btn',
      text: 'Level Up',
      variant: 'accent',
      buttonSize: 'medium',
      position: { x: 10, y: 55, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.levelUp()
    });

    // Add notification button
    const notifyBtn = new UIButton({
      id: 'notify-btn',
      text: 'Add Notification',
      variant: 'primary',
      buttonSize: 'medium',
      position: { x: 140, y: 55, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.addNotification()
    });

    // Next wave button
    const waveBtn = new UIButton({
      id: 'wave-btn',
      text: 'Next Wave',
      variant: 'secondary',
      buttonSize: 'medium',
      position: { x: 270, y: 55, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.nextWave()
    });

    // Reset data button
    const resetBtn = new UIButton({
      id: 'reset-btn',
      text: 'Reset Data',
      variant: 'danger',
      buttonSize: 'medium',
      position: { x: 400, y: 55, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.resetGameState()
    });

    panel.addChild(randomUpdateBtn);
    panel.addChild(damageBtn);
    panel.addChild(healBtn);
    panel.addChild(scoreBtn);
    panel.addChild(levelUpBtn);
    panel.addChild(notifyBtn);
    panel.addChild(waveBtn);
    panel.addChild(resetBtn);

    this.uiManager.addComponent(panel);
  }

  /**
   * Create navigation buttons
   */
  private createNavigationButtons(): void {
    if (!this.uiManager) return;

    // Back to menu button
    const backBtn = new UIButton({
      id: 'back-btn',
      text: '← Back to Menu',
      variant: 'secondary',
      buttonSize: 'medium',
      position: { x: 20, y: this.cameras.main.height - 60, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 40 },
      onClick: () => this.goBackToMenu()
    });

    // Toggle auto-updates button
    const autoUpdateBtn = new UIButton({
      id: 'auto-update-btn',
      text: 'Pause Auto Updates',
      variant: 'primary',
      buttonSize: 'medium',
      position: { x: 190, y: this.cameras.main.height - 60, anchor: 'px', origin: 'top-left' },
      size: { width: 160, height: 40 },
      onClick: () => this.toggleAutoUpdates()
    });

    // Console log button
    const logBtn = new UIButton({
      id: 'log-btn',
      text: 'Show Console Info',
      variant: 'accent',
      buttonSize: 'medium',
      position: { x: 370, y: this.cameras.main.height - 60, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 40 },
      onClick: () => this.showConsoleInfo()
    });

    this.uiManager.addComponent(backBtn);
    this.uiManager.addComponent(autoUpdateBtn);
    this.uiManager.addComponent(logBtn);
  }

  // Utility methods
  private createMockGameState(): DemoGameState {
    return {
      player: {
        name: 'TestPlayer',
        health: 85,
        maxHealth: 100,
        score: 12350,
        level: 3,
        experience: 65,
        maxExperience: 100,
        stats: {
          strength: 15,
          agility: 12,
          intelligence: 8
        },
        inventory: [
          { id: '1', name: 'Health Potion', quantity: 5, rarity: 'common' },
          { id: '2', name: 'Magic Sword', quantity: 1, rarity: 'epic' },
          { id: '3', name: 'Shield of Protection', quantity: 1, rarity: 'rare' },
          { id: '4', name: 'Legendary Ring', quantity: 1, rarity: 'legendary' }
        ]
      },
      game: {
        isPaused: false,
        difficulty: 'medium',
        timeRemaining: 245,
        currentWave: 7,
        enemiesKilled: 42,
        powerUpsCollected: 8
      },
      ui: {
        theme: 'dark',
        showMinimap: true,
        showDamageNumbers: true,
        musicVolume: 75,
        sfxVolume: 85,
        notifications: [
          {
            id: '1',
            message: 'Welcome to the DataBound demo!',
            type: 'info',
            timestamp: Date.now() - 5000
          },
          {
            id: '2',
            message: 'Health is getting low!',
            type: 'warning',
            timestamp: Date.now() - 2000
          }
        ]
      },
      achievements: [
        {
          id: '1',
          name: 'Wave Warrior',
          description: 'Complete 10 waves',
          unlocked: false,
          progress: 7,
          maxProgress: 10
        },
        {
          id: '2',
          name: 'Score Master',
          description: 'Reach 50,000 points',
          unlocked: false,
          progress: 12350,
          maxProgress: 50000
        }
      ]
    };
  }

  private logPropertyChange(changeLog: DataBoundComponent, path: string, newValue: any, oldValue: any): void {
    this.changeCounter++;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${path}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`;
    
    const currentContent = changeLog.element.innerHTML;
    const newContent = `<div style="margin: 2px 0; padding: 2px 4px; background: rgba(116, 185, 255, 0.1); border-radius: 2px; font-size: 11px; font-family: monospace;">${logEntry}</div>` + currentContent;
    
    // Keep only last 10 entries
    const entries = newContent.split('</div>').slice(0, 10);
    changeLog.element.innerHTML = entries.join('</div>');
    
    // Update counter display
    const counterComponent = this.demoComponents.get('change-counter');
    if (counterComponent) {
      counterComponent.updateBoundProperty('changeCounter', this.changeCounter);
    }
  }

  private clearChangeLog(changeLog: DataBoundComponent): void {
    changeLog.element.innerHTML = '<div style="color: #888; font-style: italic;">Log cleared. Watching for changes...</div>';
    this.changeCounter = 0;
    
    const counterComponent = this.demoComponents.get('change-counter');
    if (counterComponent) {
      counterComponent.updateBoundProperty('changeCounter', this.changeCounter);
    }
  }

  private updateValidationStatus(statusComponent: DataBoundComponent): void {
    // This would be implemented to show real validation status
    const now = new Date().toLocaleTimeString();
    statusComponent.element.innerHTML = `Last validation check: ${now}<br>Check browser console for validation errors.`;
  }

  private startAutoUpdates(): void {
    this.autoUpdateInterval = window.setInterval(() => {
      // Simulate time passage
      if (this.mockGameState.game.timeRemaining > 0) {
        this.mockGameState.game.timeRemaining--;
        this.updateAllComponents();
      }
      
      // Random small updates
      if (Math.random() < 0.3) {
        this.performRandomUpdate();
      }
    }, 2000);
  }

  private stopAutoUpdates(): void {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
      this.autoUpdateInterval = undefined;
    }
  }

  private toggleAutoUpdates(): void {
    const btn = this.uiManager?.overlay.components.get('auto-update-btn') as UIButton;
    if (this.autoUpdateInterval) {
      this.stopAutoUpdates();
      if (btn) btn.text = 'Resume Auto Updates';
    } else {
      this.startAutoUpdates();
      if (btn) btn.text = 'Pause Auto Updates';
    }
  }

  private performRandomUpdate(): void {
    const updates = [
      () => {
        this.mockGameState.player.experience += Math.floor(Math.random() * 10) + 1;
        if (this.mockGameState.player.experience >= this.mockGameState.player.maxExperience) {
          this.levelUp();
        }
      },
      () => {
        this.mockGameState.game.enemiesKilled += Math.floor(Math.random() * 3) + 1;
      },
      () => {
        this.mockGameState.game.powerUpsCollected += 1;
      },
      () => {
        const statToUpdate = ['strength', 'agility', 'intelligence'][Math.floor(Math.random() * 3)] as keyof typeof this.mockGameState.player.stats;
        this.mockGameState.player.stats[statToUpdate] += 1;
      }
    ];
    
    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    if (randomUpdate) {
      randomUpdate();
    }
    this.updateAllComponents();
  }

  private damagePlayer(): void {
    this.mockGameState.player.health = Math.max(0, this.mockGameState.player.health - 15);
    this.addNotification('error', 'Player took damage!');
    this.updateAllComponents();
  }

  private healPlayer(): void {
    this.mockGameState.player.health = Math.min(this.mockGameState.player.maxHealth, this.mockGameState.player.health + 20);
    this.addNotification('success', 'Player healed!');
    this.updateAllComponents();
  }

  private addScore(): void {
    this.mockGameState.player.score += Math.floor(Math.random() * 1000) + 100;
    this.addNotification('info', `Score increased!`);
    this.updateAllComponents();
  }

  private levelUp(): void {
    this.mockGameState.player.level++;
    this.mockGameState.player.experience = 0;
    this.mockGameState.player.maxExperience += 25;
    this.mockGameState.player.maxHealth += 10;
    this.mockGameState.player.health = this.mockGameState.player.maxHealth;
    
    // Increase stats
    this.mockGameState.player.stats.strength += 2;
    this.mockGameState.player.stats.agility += 2;
    this.mockGameState.player.stats.intelligence += 2;
    
    this.addNotification('success', `Level up! Now level ${this.mockGameState.player.level}`);
    this.updateAllComponents();
  }

  private nextWave(): void {
    this.mockGameState.game.currentWave++;
    this.mockGameState.game.timeRemaining += 60; // Bonus time
    this.addNotification('info', `Wave ${this.mockGameState.game.currentWave} started!`);
    this.updateAllComponents();
  }

  private addNotification(type: 'info' | 'warning' | 'error' | 'success' = 'info', message?: string): void {
    const messages = {
      info: ['New item discovered!', 'Achievement progress updated', 'Game saved', 'Settings updated'],
      warning: ['Low health warning', 'Resource running low', 'Enemy approaching', 'Time running out'],
      error: ['Connection lost', 'Save failed', 'Invalid action', 'Error occurred'],
      success: ['Mission completed!', 'Achievement unlocked!', 'New high score!', 'Level cleared!']
    };
    
    const randomMessage = message || messages[type][Math.floor(Math.random() * messages[type].length)];
    
    this.mockGameState.ui.notifications.push({
      id: `notification-${Date.now()}`,
      message: randomMessage!,
      type,
      timestamp: Date.now()
    });
    
    // Keep only last 20 notifications
    if (this.mockGameState.ui.notifications.length > 20) {
      this.mockGameState.ui.notifications = this.mockGameState.ui.notifications.slice(-20);
    }
    
    this.updateAllComponents();
  }

  private resetGameState(): void {
    this.mockGameState = this.createMockGameState();
    this.changeCounter = 0;
    this.updateAllComponents();
    this.addNotification('info', 'Game state reset to defaults');
  }

  private updateAllComponents(): void {
    this.demoComponents.forEach(component => {
      component.bindData({ ...this.mockGameState, changeCounter: this.changeCounter });
    });
  }

  private goBackToMenu(): void {
    this.scene.start('MenuScene');
  }

  private showConsoleInfo(): void {
    console.log('=== DataBoundComponent Demo Info ===');
    console.log('Current Game State:', this.mockGameState);
    console.log('Demo Components:', this.demoComponents);
    console.log('Total property changes detected:', this.changeCounter);
    
    console.log('\n=== Component Data Bindings ===');
    this.demoComponents.forEach((component, id) => {
      const bindings = component.getDataBindings();
      console.log(`${id}:`, Array.from(bindings.entries()));
    });
    
    console.log('\n=== Watched Properties ===');
    this.demoComponents.forEach((component, id) => {
      const watched = component.getWatchedProperties();
      if (watched.length > 0) {
        console.log(`${id}:`, watched);
      }
    });
    
    alert('Check the browser console for detailed DataBoundComponent information!');
  }

  protected setupInputHandling() {
    // ESC to go back
    this.input.keyboard?.on('keydown-ESC', () => {
      this.goBackToMenu();
    });

    // R to reset
    this.input.keyboard?.on('keydown-R', () => {
      this.resetGameState();
    });

    // SPACE for random update
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.performRandomUpdate();
    });

    return undefined;
  }

  protected onDestroy(): void {
    // Stop auto-updates
    this.stopAutoUpdates();
    
    // Cleanup UI when scene is destroyed
    if (this.uiManager) {
      GlobalUIManager.getInstance().destroySceneUI(this.scene.key);
    }
    
    // Clear demo components
    this.demoComponents.clear();
  }
}