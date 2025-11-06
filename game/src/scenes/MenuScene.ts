/**
 * MenuScene - Demonstrates HTML UI integration with Phaser
 * Shows interactive overlay UI elements working seamlessly with Phaser canvas
 */

import { BaseScene } from './BaseScene';
import { GlobalUIManager, SceneUIManager } from '../systems/UIManager';
import { UIButton } from '../components/UI/Button';
import { UIPanel } from '../components/UI/Panel';
import { UIMenu, UIMenuItemConfig } from '../components/UI/Menu';
import { eventBus, GameEvents } from '../systems/EventBus';

export class MenuScene extends BaseScene {
  private uiManager?: SceneUIManager;
  private mainMenu?: UIMenu;
  private settingsPanel?: UIPanel;
  private isUIInitialized: boolean = false;

  constructor() {
    super('MenuScene');
  }

  protected onInit(): void {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  protected onPreload(): void {
    // Load any assets needed for menu
  }

  protected async onCreate(): Promise<void> {
    // Create Phaser background elements (keeping some original design)
    this.createBackground();
    this.createPhaserUI();
    
    // Initialize HTML UI overlay
    await this.initializeUI();
    
    // Create HTML UI components
    this.createMainMenu();
    this.createFloatingButtons();
    
    this.isUIInitialized = true;
  }

  /**
   * Create Phaser background and canvas elements
   */
  private createBackground(): void {
    // Background rectangles (keeping original style)
    this.add.rectangle(
      0,
      this.scale.height / 2,
      this.scale.width,
      120,
      0xffffff
    ).setAlpha(.8).setOrigin(0, 0.5);
    
    this.add.rectangle(
      0,
      this.scale.height / 2 + 85,
      this.scale.width,
      50,
      0x000000
    ).setAlpha(.8).setOrigin(0, 0.5);

    // Logo (keeping original)
    const logo_game = this.add.bitmapText(
      this.scale.width / 2,
      this.scale.height / 2,
      "knighthawks",
      "AIR KNIGHT",
      52,
      1
    );
    logo_game.setOrigin(0.5, 0.5);
    logo_game.postFX?.addShine();

    // Modified start message to mention UI integration
    const start_msg = this.add.bitmapText(
      this.scale.width / 2,
      this.scale.height / 2 + 85,
      "pixelfont",
      "HTML UI INTEGRATION DEMO",
      18
    ).setOrigin(0.5, 0.5);

    // Tween to blink the text
    this.tweens.add({
      targets: start_msg,
      alpha: 0,
      duration: 800,
      ease: (value: number) => Math.abs(Math.round(value)),
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Create Phaser-based UI elements (for comparison)
   */
  private createPhaserUI(): void {
    // Keep original click functionality but also add UI demo
    this.input.on("pointerdown", () => {
      if (!this.isUIInitialized) {
        eventBus.emit(GameEvents.GAME_START);
      }
    });
  }

  /**
   * Initialize the HTML UI overlay system
   */
  private async initializeUI(): Promise<void> {
    try {
      const globalUIManager = GlobalUIManager.getInstance();
      
      // Get the canvas element
      const canvas = this.game.canvas;
      globalUIManager.setCanvas(canvas);
      
      // Create scene-specific UI manager
      this.uiManager = await globalUIManager.createSceneUI(this);
      
    } catch (error) {
      console.error('Failed to initialize UI:', error);
    }
  }

  /**
   * Create the main navigation menu
   */
  private createMainMenu(): void {
    if (!this.uiManager) return;

    // Define menu items
    const menuItems: UIMenuItemConfig[] = [
      {
        id: 'play',
        type: 'button',
        text: 'Start Game',
        icon: '▶️',
        onClick: () => this.startGame()
      },
      {
        id: 'separator1',
        type: 'separator'
      },
      {
        id: 'settings',
        type: 'button',
        text: 'Settings',
        icon: '⚙️',
        shortcut: 'S',
        onClick: () => this.openSettings()
      },
      {
        id: 'graphics',
        type: 'submenu',
        text: 'Graphics',
        icon: '🎨',
        submenu: [
          {
            id: 'quality-low',
            type: 'button',
            text: 'Low Quality',
            onClick: () => this.setGraphicsQuality('low')
          },
          {
            id: 'quality-medium',
            type: 'button',
            text: 'Medium Quality',
            onClick: () => this.setGraphicsQuality('medium')
          },
          {
            id: 'quality-high',
            type: 'button',
            text: 'High Quality',
            onClick: () => this.setGraphicsQuality('high')
          }
        ]
      },
      {
        id: 'separator2',
        type: 'separator'
      },
      {
        id: 'demo',
        type: 'button',
        text: 'UI Demo',
        icon: '🔧',
        onClick: () => this.openUITestScene()
      },
      {
        id: 'databound-demo',
        type: 'button',
        text: 'DataBound Demo',
        icon: '🔗',
        onClick: () => this.openDataBoundDemo()
      }
    ];

    // Create main menu
    this.mainMenu = UIMenu.createMenuPreset('sidebar', {
      id: 'main-menu',
      position: {
        x: 20,
        y: 20,
        anchor: 'px',
        origin: 'top-left'
      },
      size: {
        width: 200,
        height: 300
      },
      items: menuItems,
      className: 'main-game-menu ui-fade-in'
    });

    this.uiManager.addComponent(this.mainMenu);
  }

  /**
   * Create floating action buttons
   */
  private createFloatingButtons(): void {
    if (!this.uiManager) return;

    // Create help button
    const helpButton = new UIButton({
      id: 'help-btn',
      text: '?',
      variant: 'secondary',
      buttonSize: 'small',
      position: {
        x: this.cameras.main.width - 60,
        y: 20,
        anchor: 'px',
        origin: 'top-left'
      },
      size: { width: 36, height: 36 },
      className: 'ui-slide-in-top',
      onClick: () => this.showHelp()
    });

    // Create demo panel toggle button
    const demoPanelButton = new UIButton({
      id: 'demo-panel-btn',
      text: 'Settings',
      variant: 'primary',
      buttonSize: 'medium',
      position: {
        x: this.cameras.main.width - 120,
        y: 70,
        anchor: 'px',
        origin: 'top-left'
      },
      size: { width: 100, height: 40 },
      className: 'ui-slide-in-top',
      onClick: () => this.toggleDemoPanel()
    });

    this.uiManager.addComponent(helpButton);
    this.uiManager.addComponent(demoPanelButton);
  }

  /**
   * Create settings panel
   */
  private createSettingsPanel(): void {
    if (!this.uiManager || this.settingsPanel) return;

    this.settingsPanel = UIPanel.createPreset('modal', {
      id: 'settings-panel',
      title: 'Settings Demo',
      position: {
        x: this.cameras.main.width / 2,
        y: this.cameras.main.height / 2,
        anchor: 'px',
        origin: 'center'
      },
      size: { width: 350, height: 250 },
      className: 'ui-scale-in',
      onClose: () => this.closeSettings()
    });

    // Add settings content
    this.createSettingsContent();

    this.uiManager.addComponent(this.settingsPanel);
  }

  /**
   * Create settings panel content
   */
  private createSettingsContent(): void {
    if (!this.settingsPanel) return;

    // Volume control buttons
    const volumeDownBtn = new UIButton({
      id: 'volume-down',
      text: '🔉 Volume Down',
      variant: 'secondary',
      buttonSize: 'small',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 35 },
      onClick: () => this.adjustVolume(-0.1)
    });

    const volumeUpBtn = new UIButton({
      id: 'volume-up',
      text: '🔊 Volume Up',
      variant: 'secondary',
      buttonSize: 'small',
      position: { x: 170, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 35 },
      onClick: () => this.adjustVolume(0.1)
    });

    // Graphics quality buttons
    const lowQualityBtn = new UIButton({
      id: 'low-quality',
      text: 'Low Quality',
      variant: 'secondary',
      buttonSize: 'small',
      position: { x: 10, y: 60, anchor: 'px', origin: 'top-left' },
      size: { width: 100, height: 35 },
      onClick: () => this.setGraphicsQuality('low')
    });

    const medQualityBtn = new UIButton({
      id: 'med-quality',
      text: 'Medium',
      variant: 'primary',
      buttonSize: 'small',
      position: { x: 120, y: 60, anchor: 'px', origin: 'top-left' },
      size: { width: 100, height: 35 },
      onClick: () => this.setGraphicsQuality('medium')
    });

    const highQualityBtn = new UIButton({
      id: 'high-quality',
      text: 'High Quality',
      variant: 'accent',
      buttonSize: 'small',
      position: { x: 230, y: 60, anchor: 'px', origin: 'top-left' },
      size: { width: 100, height: 35 },
      onClick: () => this.setGraphicsQuality('high')
    });

    // Close button
    const closeBtn = new UIButton({
      id: 'close-settings',
      text: 'Close',
      variant: 'danger',
      buttonSize: 'medium',
      position: { x: 140, y: 160, anchor: 'px', origin: 'top-left' },
      size: { width: 80, height: 40 },
      onClick: () => this.closeSettings()
    });

    this.settingsPanel.addChild(volumeDownBtn);
    this.settingsPanel.addChild(volumeUpBtn);
    this.settingsPanel.addChild(lowQualityBtn);
    this.settingsPanel.addChild(medQualityBtn);
    this.settingsPanel.addChild(highQualityBtn);
    this.settingsPanel.addChild(closeBtn);
  }

  // Event handlers for menu actions
  private startGame(): void {
    console.log('Starting game...');
    eventBus.emit(GameEvents.GAME_START);
  }

  private openSettings(): void {
    console.log('Opening settings...');
    this.createSettingsPanel();
  }

  private closeSettings(): void {
    if (this.settingsPanel && this.uiManager) {
      this.uiManager.removeComponent('settings-panel');
      delete (this as any).settingsPanel;
    }
  }

  private setGraphicsQuality(quality: string): void {
    console.log(`Graphics quality set to: ${quality}`);
    // In a real game, this would update graphics settings
  }

  private adjustVolume(delta: number): void {
    console.log(`Adjusting volume by: ${delta}`);
    // In a real game, this would adjust the audio volume
  }

  private openUITestScene(): void {
    console.log('Opening UI test scene...');
    this.scene.start('UITestScene');
  }

  private openDataBoundDemo(): void {
    console.log('Opening DataBound demo scene...');
    this.scene.start('DataBoundDemoScene');
  }

  private showHelp(): void {
    console.log('Showing help...');
    alert('This is a demo of HTML UI integration with Phaser!\n\nTry:\n- Click menu items\n- Use keyboard shortcuts (S for settings)\n- Interact with both HTML UI and Phaser elements');
  }

  private toggleDemoPanel(): void {
    console.log('Toggling demo panel...');
    if (this.settingsPanel) {
      this.closeSettings();
    } else {
      this.openSettings();
    }
  }

  /**
   * Handle keyboard input for menu navigation
   */
  protected setupInputHandling() {
    // Setup keyboard shortcuts
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.settingsPanel) {
        this.closeSettings();
      }
    });

    this.input.keyboard?.on('keydown-S', () => {
      if (!this.settingsPanel) {
        this.openSettings();
      }
    });

    return undefined; // No InputHandler needed for this simple case
  }

  protected onUpdate(time: number, delta: number): void {
    // Update any animated elements if needed
    if (this.isUIInitialized) {
      // Could update UI state based on game state
    }
  }

  protected onDestroy(): void {
    // Cleanup UI when scene is destroyed
    if (this.uiManager) {
      GlobalUIManager.getInstance().destroySceneUI(this.scene.key);
    }
  }
}