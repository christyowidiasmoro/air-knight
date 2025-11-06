/**
 * UITestScene - Comprehensive demonstration of HTML UI integration capabilities
 * Shows all UI components, interactions, and features working together
 */

import { BaseScene } from './BaseScene';
import { GlobalUIManager, SceneUIManager } from '../systems/UIManager';
import { UIButton } from '../components/UI/Button';
import { UIPanel } from '../components/UI/Panel';
import { UIMenu, UIMenuItemConfig } from '../components/UI/Menu';

export class UITestScene extends BaseScene {
  private uiManager?: SceneUIManager;
  private testComponents: Map<string, any> = new Map();

  constructor() {
    super('UITestScene');
  }

  protected onInit(): void {
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  protected async onCreate(): Promise<void> {
    // Create background
    this.createBackground();
    
    // Initialize UI system
    await this.initializeUI();
    
    // Create all UI demonstrations
    this.createButtonDemo();
    this.createPanelDemo();
    this.createMenuDemo();
    this.createInteractionDemo();
    this.createNavigationButtons();
  }

  /**
   * Create animated background
   */
  private createBackground(): void {
    // Gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c3e50, 0x34495e, 0x2c3e50, 0x34495e);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Title
    this.add.text(
      this.cameras.main.width / 2,
      30,
      'HTML UI Integration Test Scene',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial Black'
      }
    ).setOrigin(0.5);

    // Instructions
    this.add.text(
      this.cameras.main.width / 2,
      60,
      'Interact with HTML UI elements overlaid on Phaser canvas',
      {
        fontSize: '16px',
        color: '#ecf0f1',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // Moving background elements for testing interaction
    const movingRect = this.add.rectangle(100, 150, 80, 80, 0x3498db);
    movingRect.setInteractive({ useHandCursor: true });
    movingRect.on('pointerdown', () => {
      console.log('Phaser element clicked - this should work alongside HTML UI');
    });

    // Animate the moving element
    this.tweens.add({
      targets: movingRect,
      x: this.cameras.main.width - 100,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Power2.inOut'
    });
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
   * Demonstrate all button variants and sizes
   */
  private createButtonDemo(): void {
    if (!this.uiManager) return;

    // Section title (using HTML for comparison)
    const buttonSection = new UIPanel({
      id: 'button-section',
      position: { x: 20, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 300, height: 200 },
      theme: 'glass',
      panelSize: 'compact',
      title: 'Button Variants'
    });

    // Primary button
    const primaryBtn = new UIButton({
      id: 'primary-btn',
      text: 'Primary Button',
      variant: 'primary',
      buttonSize: 'medium',
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 140, height: 35 },
      onClick: () => this.logButtonClick('Primary')
    });

    // Secondary button
    const secondaryBtn = new UIButton({
      id: 'secondary-btn',
      text: 'Secondary',
      variant: 'secondary',
      buttonSize: 'medium',
      position: { x: 160, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.logButtonClick('Secondary')
    });

    // Accent button
    const accentBtn = new UIButton({
      id: 'accent-btn',
      text: 'Accent Button',
      variant: 'accent',
      buttonSize: 'medium',
      position: { x: 10, y: 55, anchor: 'px', origin: 'top-left' },
      size: { width: 140, height: 35 },
      onClick: () => this.logButtonClick('Accent')
    });

    // Danger button
    const dangerBtn = new UIButton({
      id: 'danger-btn',
      text: 'Danger',
      variant: 'danger',
      buttonSize: 'medium',
      position: { x: 160, y: 55, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.logButtonClick('Danger')
    });

    // Size demonstration
    const smallBtn = new UIButton({
      id: 'small-btn',
      text: 'Small',
      variant: 'primary',
      buttonSize: 'small',
      position: { x: 10, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 80, height: 30 },
      onClick: () => this.logButtonClick('Small')
    });

    const largeBtn = new UIButton({
      id: 'large-btn',
      text: 'Large Button',
      variant: 'accent',
      buttonSize: 'large',
      position: { x: 100, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 180, height: 45 },
      onClick: () => this.logButtonClick('Large')
    });

    // Disabled button
    const disabledBtn = new UIButton({
      id: 'disabled-btn',
      text: 'Disabled',
      variant: 'primary',
      buttonSize: 'medium',
      disabled: true,
      position: { x: 10, y: 155, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 35 },
      onClick: () => this.logButtonClick('Disabled (should not fire)')
    });

    buttonSection.addChild(primaryBtn);
    buttonSection.addChild(secondaryBtn);
    buttonSection.addChild(accentBtn);
    buttonSection.addChild(dangerBtn);
    buttonSection.addChild(smallBtn);
    buttonSection.addChild(largeBtn);
    buttonSection.addChild(disabledBtn);

    this.uiManager.addComponent(buttonSection);
    this.testComponents.set('button-section', buttonSection);
  }

  /**
   * Demonstrate panel variants and themes
   */
  private createPanelDemo(): void {
    if (!this.uiManager) return;

    // Light theme panel
    const lightPanel = new UIPanel({
      id: 'light-panel',
      title: 'Light Theme',
      position: { x: 340, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 120 },
      theme: 'light',
      panelSize: 'compact'
    });

    const lightContent = new UIButton({
      id: 'light-content',
      text: 'Click Me!',
      variant: 'primary',
      buttonSize: 'small',
      position: { x: 50, y: 20, anchor: 'px', origin: 'top-left' },
      size: { width: 100, height: 30 },
      onClick: () => this.logButtonClick('Light Panel Content')
    });

    lightPanel.addChild(lightContent);

    // Dark theme panel
    const darkPanel = new UIPanel({
      id: 'dark-panel',
      title: 'Dark Theme',
      position: { x: 560, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 120 },
      theme: 'dark',
      panelSize: 'compact'
    });

    const darkContent = new UIButton({
      id: 'dark-content',
      text: 'Dark Button',
      variant: 'accent',
      buttonSize: 'small',
      position: { x: 50, y: 20, anchor: 'px', origin: 'top-left' },
      size: { width: 100, height: 30 },
      onClick: () => this.logButtonClick('Dark Panel Content')
    });

    darkPanel.addChild(darkContent);

    // Glass theme panel
    const glassPanel = new UIPanel({
      id: 'glass-panel',
      title: 'Glass Theme',
      position: { x: 780, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 120 },
      theme: 'glass',
      panelSize: 'compact'
    });

    const glassContent = new UIButton({
      id: 'glass-content',
      text: 'Glass Effect',
      variant: 'secondary',
      buttonSize: 'small',
      position: { x: 50, y: 20, anchor: 'px', origin: 'top-left' },
      size: { width: 100, height: 30 },
      onClick: () => this.logButtonClick('Glass Panel Content')
    });

    glassPanel.addChild(glassContent);

    // Draggable panel
    const draggablePanel = new UIPanel({
      id: 'draggable-panel',
      title: 'Draggable Panel (Click & Drag)',
      position: { x: 400, y: 250, anchor: 'px', origin: 'top-left' },
      size: { width: 250, height: 100 },
      theme: 'light',
      panelSize: 'normal',
      draggable: true
    });

    const dragInfo = new UIButton({
      id: 'drag-info',
      text: 'Drag the title bar!',
      variant: 'primary',
      buttonSize: 'small',
      position: { x: 50, y: 20, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 30 },
      onClick: () => this.logButtonClick('Draggable Panel Content')
    });

    draggablePanel.addChild(dragInfo);

    this.uiManager.addComponent(lightPanel);
    this.uiManager.addComponent(darkPanel);
    this.uiManager.addComponent(glassPanel);
    this.uiManager.addComponent(draggablePanel);

    this.testComponents.set('panels', [lightPanel, darkPanel, glassPanel, draggablePanel]);
  }

  /**
   * Demonstrate menu functionality
   */
  private createMenuDemo(): void {
    if (!this.uiManager) return;

    // Vertical menu
    const verticalMenuItems: UIMenuItemConfig[] = [
      {
        id: 'file',
        type: 'submenu',
        text: 'File',
        icon: '📁',
        submenu: [
          {
            id: 'new',
            type: 'button',
            text: 'New',
            shortcut: 'Ctrl+N',
            onClick: () => this.logMenuClick('File > New')
          },
          {
            id: 'open',
            type: 'button',
            text: 'Open',
            shortcut: 'Ctrl+O',
            onClick: () => this.logMenuClick('File > Open')
          },
          {
            id: 'save',
            type: 'button',
            text: 'Save',
            shortcut: 'Ctrl+S',
            onClick: () => this.logMenuClick('File > Save')
          }
        ]
      },
      {
        id: 'edit',
        type: 'button',
        text: 'Edit',
        icon: '✏️',
        onClick: () => this.logMenuClick('Edit')
      },
      {
        id: 'view',
        type: 'submenu',
        text: 'View',
        icon: '👁️',
        submenu: [
          {
            id: 'zoom-in',
            type: 'button',
            text: 'Zoom In',
            shortcut: 'Ctrl++',
            onClick: () => this.logMenuClick('View > Zoom In')
          },
          {
            id: 'zoom-out',
            type: 'button',
            text: 'Zoom Out',
            shortcut: 'Ctrl+-',
            onClick: () => this.logMenuClick('View > Zoom Out')
          }
        ]
      },
      {
        id: 'sep1',
        type: 'separator'
      },
      {
        id: 'help',
        type: 'button',
        text: 'Help',
        icon: '❓',
        onClick: () => this.logMenuClick('Help')
      }
    ];

    const verticalMenu = new UIMenu({
      id: 'vertical-menu',
      position: { x: 20, y: 320, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 250 },
      items: verticalMenuItems,
      autoClose: false
    });

    // Horizontal menu
    const horizontalMenuItems: UIMenuItemConfig[] = [
      {
        id: 'home',
        type: 'button',
        text: 'Home',
        onClick: () => this.logMenuClick('Home')
      },
      {
        id: 'about',
        type: 'button',
        text: 'About',
        onClick: () => this.logMenuClick('About')
      },
      {
        id: 'contact',
        type: 'button',
        text: 'Contact',
        onClick: () => this.logMenuClick('Contact')
      }
    ];

    const horizontalMenu = new UIMenu({
      id: 'horizontal-menu',
      position: { x: 250, y: 320, anchor: 'px', origin: 'top-left' },
      size: { width: 400, height: 50 },
      items: horizontalMenuItems,
      orientation: 'horizontal',
      autoClose: false
    });

    this.uiManager.addComponent(verticalMenu);
    this.uiManager.addComponent(horizontalMenu);

    this.testComponents.set('menus', [verticalMenu, horizontalMenu]);
  }

  /**
   * Demonstrate interaction and event handling
   */
  private createInteractionDemo(): void {
    if (!this.uiManager) return;

    // Interactive demo panel
    const interactionPanel = new UIPanel({
      id: 'interaction-panel',
      title: 'Interaction Demo',
      position: { x: 700, y: 320, anchor: 'px', origin: 'top-left' },
      size: { width: 280, height: 200 },
      theme: 'light',
      panelSize: 'normal'
    });

    // Counter demo
    let counter = 0;
    const counterDisplay = new UIButton({
      id: 'counter-display',
      text: `Count: ${counter}`,
      variant: 'secondary',
      buttonSize: 'medium',
      disabled: true,
      position: { x: 10, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 35 }
    });

    const incrementBtn = new UIButton({
      id: 'increment-btn',
      text: '+',
      variant: 'accent',
      buttonSize: 'small',
      position: { x: 170, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 40, height: 35 },
      onClick: () => {
        counter++;
        counterDisplay.text = `Count: ${counter}`;
        this.logButtonClick(`Increment (${counter})`);
      }
    });

    const decrementBtn = new UIButton({
      id: 'decrement-btn',
      text: '-',
      variant: 'danger',
      buttonSize: 'small',
      position: { x: 220, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 40, height: 35 },
      onClick: () => {
        counter--;
        counterDisplay.text = `Count: ${counter}`;
        this.logButtonClick(`Decrement (${counter})`);
      }
    });

    // Toggle button demo
    let isToggled = false;
    const toggleBtn = new UIButton({
      id: 'toggle-btn',
      text: 'Toggle: OFF',
      variant: 'secondary',
      buttonSize: 'medium',
      position: { x: 10, y: 55, anchor: 'px', origin: 'top-left' },
      size: { width: 150, height: 35 },
      onClick: () => {
        isToggled = !isToggled;
        toggleBtn.text = `Toggle: ${isToggled ? 'ON' : 'OFF'}`;
        toggleBtn.variant = isToggled ? 'accent' : 'secondary';
        this.logButtonClick(`Toggle ${isToggled ? 'ON' : 'OFF'}`);
      }
    });

    // Dynamic content demo
    const dynamicBtn = new UIButton({
      id: 'dynamic-btn',
      text: 'Add Random Button',
      variant: 'primary',
      buttonSize: 'medium',
      position: { x: 10, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 180, height: 35 },
      onClick: () => this.addRandomButton()
    });

    // Clear dynamic buttons
    const clearBtn = new UIButton({
      id: 'clear-btn',
      text: 'Clear',
      variant: 'danger',
      buttonSize: 'small',
      position: { x: 200, y: 100, anchor: 'px', origin: 'top-left' },
      size: { width: 60, height: 35 },
      onClick: () => this.clearDynamicButtons()
    });

    interactionPanel.addChild(counterDisplay);
    interactionPanel.addChild(incrementBtn);
    interactionPanel.addChild(decrementBtn);
    interactionPanel.addChild(toggleBtn);
    interactionPanel.addChild(dynamicBtn);
    interactionPanel.addChild(clearBtn);

    this.uiManager.addComponent(interactionPanel);
    this.testComponents.set('interaction-panel', interactionPanel);
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

    // Reset demo button
    const resetBtn = new UIButton({
      id: 'reset-btn',
      text: 'Reset Demo',
      variant: 'primary',
      buttonSize: 'medium',
      position: { x: 190, y: this.cameras.main.height - 60, anchor: 'px', origin: 'top-left' },
      size: { width: 120, height: 40 },
      onClick: () => this.resetDemo()
    });

    // Console log button
    const logBtn = new UIButton({
      id: 'log-btn',
      text: 'Show Console',
      variant: 'accent',
      buttonSize: 'medium',
      position: { x: 330, y: this.cameras.main.height - 60, anchor: 'px', origin: 'top-left' },
      size: { width: 130, height: 40 },
      onClick: () => this.showConsoleInfo()
    });

    this.uiManager.addComponent(backBtn);
    this.uiManager.addComponent(resetBtn);
    this.uiManager.addComponent(logBtn);
  }

  // Event handlers
  private logButtonClick(buttonName: string): void {
    console.log(`Button clicked: ${buttonName}`);
    this.showNotification(`${buttonName} clicked!`);
  }

  private logMenuClick(menuItem: string): void {
    console.log(`Menu item selected: ${menuItem}`);
    this.showNotification(`Selected: ${menuItem}`);
  }

  private addRandomButton(): void {
    if (!this.uiManager) return;

    const randomId = `random-btn-${Math.floor(Math.random() * 1000)}`;
    const randomX = Math.random() * (this.cameras.main.width - 120) + 60;
    const randomY = Math.random() * (this.cameras.main.height - 200) + 100;
    
    const randomBtn = new UIButton({
      id: randomId,
      text: `Random ${Math.floor(Math.random() * 100)}`,
      variant: ['primary', 'secondary', 'accent', 'danger'][Math.floor(Math.random() * 4)] as any,
      buttonSize: 'small',
      position: { x: randomX, y: randomY, anchor: 'px', origin: 'top-left' },
      size: { width: 100, height: 30 },
      className: 'ui-scale-in',
      onClick: () => {
        this.logButtonClick(`Random button ${randomId}`);
        // Remove self when clicked
        this.uiManager?.removeComponent(randomId);
      }
    });

    this.uiManager.addComponent(randomBtn);
  }

  private clearDynamicButtons(): void {
    if (!this.uiManager) return;

    // Remove all random buttons
    const allComponents = this.uiManager.overlay.components;
    for (const [id, component] of allComponents) {
      if (id.startsWith('random-btn-')) {
        this.uiManager.removeComponent(id);
      }
    }
    
    this.showNotification('Dynamic buttons cleared');
  }

  private showNotification(message: string): void {
    // Create a temporary notification panel
    if (!this.uiManager) return;

    const notification = new UIPanel({
      id: `notification-${Date.now()}`,
      position: {
        x: this.cameras.main.width / 2,
        y: 20,
        anchor: 'px',
        origin: 'center'
      },
      size: { width: 300, height: 50 },
      theme: 'glass',
      panelSize: 'compact',
      className: 'ui-fade-in'
    });

    const notificationText = new UIButton({
      id: 'notification-text',
      text: message,
      variant: 'secondary',
      buttonSize: 'small',
      disabled: true,
      position: { x: 50, y: 10, anchor: 'px', origin: 'top-left' },
      size: { width: 200, height: 30 }
    });

    notification.addChild(notificationText);
    this.uiManager.addComponent(notification);

    // Auto-remove after 2 seconds
    this.time.delayedCall(2000, () => {
      this.uiManager?.removeComponent(notification.id);
    });
  }

  private goBackToMenu(): void {
    this.scene.start('MenuScene');
  }

  private resetDemo(): void {
    this.scene.restart();
  }

  private showConsoleInfo(): void {
    console.log('=== UI Test Scene Info ===');
    console.log('Active UI Components:');
    
    if (this.uiManager) {
      for (const [id, component] of this.uiManager.overlay.components) {
        console.log(`- ${id}: ${component.constructor.name}`);
      }
    }
    
    console.log('Check the browser console for interaction logs.');
    console.log('Try clicking buttons, menus, and dragging panels!');
    
    alert('Check the browser console for detailed UI component information and interaction logs!');
  }

  protected setupInputHandling() {
    // ESC to go back
    this.input.keyboard?.on('keydown-ESC', () => {
      this.goBackToMenu();
    });

    // R to reset
    this.input.keyboard?.on('keydown-R', () => {
      this.resetDemo();
    });

    return undefined;
  }

  protected onDestroy(): void {
    // Cleanup UI when scene is destroyed
    if (this.uiManager) {
      GlobalUIManager.getInstance().destroySceneUI(this.scene.key);
    }
  }
}