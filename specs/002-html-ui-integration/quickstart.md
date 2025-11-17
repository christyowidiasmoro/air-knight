# Quick Start Guide: HTML UI Integration

**Date**: October 31, 2025  
**Feature**: HTML UI Integration with Phaser Canvas  
**Target Audience**: Developers implementing the UI overlay system

## Prerequisites

- Existing Phaser 3.90.0+ TypeScript project
- Vite build system configured
- Node.js 18+ and npm
- Basic understanding of Phaser game development
- Familiarity with HTML/CSS and responsive design

## Installation & Setup

### 1. Install Dependencies

```bash
cd game/
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind CSS

**`tailwind.config.js`**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        'game-ui': '1000',
      },
      colors: {
        'game-primary': '#2563eb',
        'game-secondary': '#64748b',
      }
    },
  },
  plugins: [],
}
```

**`postcss.config.js`**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 3. Create Global Styles

**`src/styles/globals.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* UI Overlay Base Styles */
.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.ui-interactive {
  pointer-events: auto;
}

/* Component Base Classes */
@layer components {
  .game-button {
    @apply bg-game-primary text-white px-4 py-2 rounded-lg ui-interactive 
           hover:bg-blue-600 transition-colors duration-200;
    min-width: 44px;
    min-height: 44px;
  }
  
  .game-panel {
    @apply bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 ui-interactive;
  }
  
  .game-hud {
    @apply text-white font-bold text-lg drop-shadow-lg;
  }
}
```

### 4. Update HTML Structure

**`index.html`** - Add UI overlay container:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- existing head content -->
  </head>
  <body>
    <div id="game-container">
      <canvas id="game-canvas"></canvas>
      <!-- NEW: UI Overlay Container -->
      <div id="ui-overlay" class="ui-overlay"></div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

## Core Implementation

### 5. Create UI System Classes

**`src/systems/UIManager.ts`**:
```typescript
import './styles/globals.css';

export class UIManager {
  private container: HTMLDivElement;
  private components: Map<string, HTMLElement> = new Map();
  
  constructor(private canvas: HTMLCanvasElement) {
    this.container = document.getElementById('ui-overlay') as HTMLDivElement;
    if (!this.container) {
      throw new Error('UI overlay container not found');
    }
  }
  
  addComponent(id: string, element: HTMLElement): void {
    if (this.components.has(id)) {
      throw new Error(`Component ${id} already exists`);
    }
    
    this.components.set(id, element);
    this.container.appendChild(element);
  }
  
  removeComponent(id: string): void {
    const element = this.components.get(id);
    if (element) {
      this.container.removeChild(element);
      this.components.delete(id);
    }
  }
  
  getComponent(id: string): HTMLElement | undefined {
    return this.components.get(id);
  }
  
  show(): void {
    this.container.style.display = 'block';
  }
  
  hide(): void {
    this.container.style.display = 'none';
  }
}
```

### 6. Create UI Components

**`src/components/UI/Button.ts`**:
```typescript
export class UIButton {
  private element: HTMLButtonElement;
  
  constructor(
    private id: string,
    private text: string,
    private onClick: () => void
  ) {
    this.element = document.createElement('button');
    this.element.className = 'game-button';
    this.element.textContent = text;
    this.element.addEventListener('click', onClick);
  }
  
  getElement(): HTMLButtonElement {
    return this.element;
  }
  
  setText(text: string): void {
    this.element.textContent = text;
  }
  
  setPosition(x: number, y: number): void {
    this.element.style.position = 'absolute';
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }
  
  destroy(): void {
    this.element.removeEventListener('click', this.onClick);
  }
}
```

### 7. Integrate with Phaser Scene

**`src/scenes/MenuScene.ts`** - Example integration:
```typescript
import { Scene } from 'phaser';
import { UIManager } from '../systems/UIManager';
import { UIButton } from '../components/UI/Button';

export class MenuScene extends Scene {
  private uiManager!: UIManager;
  
  constructor() {
    super({ key: 'MenuScene' });
  }
  
  create(): void {
    // Initialize UI Manager
    const canvas = this.game.canvas;
    this.uiManager = new UIManager(canvas);
    
    // Create UI components
    const playButton = new UIButton(
      'play-button',
      'Play Game',
      () => this.scene.start('GameScene')
    );
    
    // Position button (centered horizontally, 60% down screen)
    const centerX = canvas.width / 2 - 50; // Assuming button width ~100px
    const centerY = canvas.height * 0.6;
    playButton.setPosition(centerX, centerY);
    
    // Add to UI overlay
    this.uiManager.addComponent('play-button', playButton.getElement());
    
    // Show UI
    this.uiManager.show();
  }
  
  destroy(): void {
    // Clean up UI when scene ends
    this.uiManager.hide();
    super.destroy();
  }
}
```

### 8. Game State Integration

**`src/systems/GameUIBridge.ts`**:
```typescript
import { EventBus } from './EventBus';
import { UIManager } from './UIManager';

export class GameUIBridge {
  constructor(
    private uiManager: UIManager,
    private eventBus: typeof EventBus
  ) {
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Example: Update health bar when player health changes
    this.eventBus.on('player:health:changed', (data: { health: number }) => {
      this.updateHealthBar(data.health);
    });
    
    // Example: Update score display
    this.eventBus.on('game:score:changed', (data: { score: number }) => {
      this.updateScore(data.score);
    });
  }
  
  private updateHealthBar(health: number): void {
    const healthBar = this.uiManager.getComponent('health-bar');
    if (healthBar) {
      const percentage = Math.max(0, Math.min(100, health));
      healthBar.style.width = `${percentage}%`;
    }
  }
  
  private updateScore(score: number): void {
    const scoreElement = this.uiManager.getComponent('score-display');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${score.toLocaleString()}`;
    }
  }
}
```

## Usage Examples

### Creating a HUD Component

```typescript
export class GameHUD {
  private healthBar: HTMLDivElement;
  private scoreDisplay: HTMLDivElement;
  
  constructor(private uiManager: UIManager) {
    this.createHealthBar();
    this.createScoreDisplay();
  }
  
  private createHealthBar(): void {
    // Container
    const container = document.createElement('div');
    container.className = 'absolute top-4 left-4 w-48 h-6 bg-gray-800 rounded-full p-1';
    
    // Health bar fill
    this.healthBar = document.createElement('div');
    this.healthBar.className = 'w-full h-full bg-red-500 rounded-full transition-all duration-300';
    
    container.appendChild(this.healthBar);
    this.uiManager.addComponent('health-container', container);
  }
  
  private createScoreDisplay(): void {
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.className = 'game-hud absolute top-4 right-4';
    this.scoreDisplay.textContent = 'Score: 0';
    
    this.uiManager.addComponent('score-display', this.scoreDisplay);
  }
}
```

### Creating a Modal Dialog

```typescript
export class ModalDialog {
  private modal: HTMLDivElement;
  private backdrop: HTMLDivElement;
  
  constructor(private uiManager: UIManager) {
    this.createModal();
  }
  
  private createModal(): void {
    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'fixed inset-0 bg-black/50 ui-interactive z-50';
    this.backdrop.addEventListener('click', () => this.hide());
    
    // Modal content
    this.modal = document.createElement('div');
    this.modal.className = `
      game-panel fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
      w-80 max-w-[90vw] z-50
    `;
    
    this.backdrop.appendChild(this.modal);
  }
  
  show(title: string, content: string): void {
    this.modal.innerHTML = `
      <h2 class="text-xl font-bold mb-4">${title}</h2>
      <p class="mb-6">${content}</p>
      <button class="game-button w-full" onclick="this.hide()">Close</button>
    `;
    
    this.uiManager.addComponent('modal-dialog', this.backdrop);
  }
  
  hide(): void {
    this.uiManager.removeComponent('modal-dialog');
  }
}
```

## Testing

### Unit Test Example

**`src/test/UIManager.test.ts`**:
```typescript
import { UIManager } from '../systems/UIManager';

// Mock canvas element
const mockCanvas = document.createElement('canvas');
document.body.innerHTML = '<div id="ui-overlay"></div>';

describe('UIManager', () => {
  let uiManager: UIManager;
  
  beforeEach(() => {
    uiManager = new UIManager(mockCanvas);
  });
  
  test('should add component successfully', () => {
    const element = document.createElement('div');
    element.id = 'test-component';
    
    uiManager.addComponent('test', element);
    
    expect(uiManager.getComponent('test')).toBe(element);
  });
  
  test('should remove component successfully', () => {
    const element = document.createElement('div');
    uiManager.addComponent('test', element);
    
    uiManager.removeComponent('test');
    
    expect(uiManager.getComponent('test')).toBeUndefined();
  });
});
```

## Performance Optimization

### 1. Batch UI Updates
```typescript
class UIUpdateScheduler {
  private pendingUpdates = new Set<() => void>();
  
  scheduleUpdate(updateFn: () => void): void {
    this.pendingUpdates.add(updateFn);
    if (this.pendingUpdates.size === 1) {
      requestAnimationFrame(() => this.flushUpdates());
    }
  }
  
  private flushUpdates(): void {
    this.pendingUpdates.forEach(fn => fn());
    this.pendingUpdates.clear();
  }
}
```

### 2. Optimize CSS Classes
- Use Tailwind's JIT mode for optimal bundle size
- Leverage CSS transforms for animations
- Use `will-change` property for animated elements
- Implement virtual scrolling for long lists

## Troubleshooting

### Common Issues

1. **UI not visible**: Check z-index values and ensure UI overlay container exists
2. **Touch events not working**: Verify `pointer-events: auto` on interactive elements
3. **Performance issues**: Implement RAF-based updates and limit DOM manipulations
4. **Responsive layout broken**: Ensure proper viewport meta tag and CSS units

### Debug Tools

```typescript
// Add to UIManager for debugging
debug(): void {
  console.log('Active components:', Array.from(this.components.keys()));
  console.log('Container visible:', this.container.style.display !== 'none');
  console.log('Container z-index:', window.getComputedStyle(this.container).zIndex);
}
```

## Next Steps

1. Implement responsive layout manager
2. Add accessibility features (ARIA labels, keyboard navigation)
3. Create animation system for smooth transitions
4. Integrate with existing game scenes
5. Add comprehensive test coverage
6. Optimize for mobile performance

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Phaser 3 API Reference](https://photonstorm.github.io/phaser3-docs/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Grid Layout Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)