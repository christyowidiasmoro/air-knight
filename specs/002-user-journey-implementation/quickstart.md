# Quickstart Guide: 2D Portrait Game User Journey

**Feature**: 002-user-journey-implementation  
**Date**: October 9, 2025  
**Purpose**: Developer setup and implementation guide for the game user journey feature

## Prerequisites

### Required Software
- **Node.js**: 18.0+ (LTS recommended)
- **npm**: 9.0+ or **yarn**: 3.0+
- **TypeScript**: 5.0+ (installed globally or via project)
- **Git**: 2.30+

### Recommended Development Tools
- **VS Code** with extensions:
  - TypeScript Hero
  - Phaser 3 Snippets
  - ESLint
  - Prettier
  - Jest Runner
- **Chrome DevTools** for debugging
- **Android Studio** or **Xcode** for mobile testing (optional)

### Target Devices for Testing
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS 12+ (Safari), Android API 24+ (Chrome)
- **Screen sizes**: 375px - 768px width (portrait orientation)

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd air-knight

# Switch to feature branch
git checkout 002-user-journey-implementation

# Install dependencies
npm install

# Verify TypeScript installation
npx tsc --version
```

### 2. Development Environment Configuration

```bash
# Create environment configuration
cp .env.example .env.local

# Install Phaser types (if not already included)
npm install --save-dev @types/phaser

# Verify Vite configuration
npm run dev --dry-run
```

### 3. Project Structure Overview

```
src/
├── scenes/                    # Game scenes implementation
│   ├── LoadingScene.ts       # Asset loading and progress
│   ├── MainScene.ts          # Main hub with navigation
│   ├── GameScene.ts          # Gameplay placeholder
│   ├── ShopScene.ts          # Shop interface
│   └── ProfileScene.ts       # Player profile display
├── systems/                   # Core game systems
│   ├── SceneManager.ts       # Scene transition management
│   ├── NavigationSystem.ts   # Navigation state handling
│   ├── CurrencySystem.ts     # Currency management
│   ├── UISystem.ts           # UI component system
│   ├── LoadingSystem.ts      # Asset loading system
│   ├── EventBus.ts           # Event communication
│   └── ErrorHandler.ts       # Error handling and logging
├── components/               # Reusable UI components
│   ├── ui/                   # General UI components
│   │   ├── NavigationBar.ts  # Bottom navigation
│   │   ├── PlayerHUD.ts      # Player info display
│   │   ├── ProgressBar.ts    # Loading progress
│   │   ├── Button.ts         # Custom button component
│   │   ├── Modal.ts          # Modal dialog system
│   │   └── Notification.ts   # Toast notifications
│   └── shop/                 # Shop-specific components
│       ├── ShopItem.ts       # Individual shop items
│       ├── ShopGrid.ts       # Item grid layout
│       └── CartComponent.ts  # Shopping cart
├── types/                    # TypeScript type definitions
│   ├── GameTypes.ts          # Core game types
│   ├── NavigationTypes.ts    # Navigation interfaces
│   ├── PlayerTypes.ts        # Player data types
│   ├── CurrencyTypes.ts      # Currency system types
│   ├── UITypes.ts           # UI component types
│   └── ShopTypes.ts         # Shop system types
├── assets/                   # Game assets
│   ├── images/              # Sprites, UI elements
│   ├── audio/               # Sound effects, music
│   └── fonts/               # Custom fonts
├── utils/                    # Utility functions
│   ├── Constants.ts         # Game constants
│   ├── MathUtils.ts         # Math helper functions
│   ├── StorageUtils.ts      # Local storage helpers
│   └── DeviceUtils.ts       # Device detection utilities
└── main.ts                  # Application entry point
```

## Development Workflow

### 1. Start Development Server

```bash
# Start development server with hot reload
npm run dev

# Server will start on http://localhost:5173
# Mobile testing: http://<your-ip>:5173
```

### 2. TypeScript Compilation

```bash
# Type checking only (no output)
npm run type-check

# Watch mode for continuous type checking
npm run type-check:watch

# Build production bundle
npm run build
```

### 3. Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Test specific component
npm test -- NavigationSystem
```

### 4. Code Quality

```bash
# Lint TypeScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check + lint + format (pre-commit)
npm run check-all
```

## Implementation Phases

### Phase 1: Core Scene Structure (Priority: P1)

**Goal**: Implement basic scene management and loading functionality

**Tasks**:
1. Create `LoadingScene.ts` with progress tracking
2. Implement `SceneManager.ts` for scene transitions
3. Set up basic `MainScene.ts` structure
4. Add scene transition animations

**Validation**:
- Loading screen displays progress correctly
- Scene transitions work smoothly
- No memory leaks between scene changes

**Code Example**:
```typescript
// LoadingScene.ts - Basic structure
export class LoadingScene extends Phaser.Scene {
  private progressBar!: ProgressBar;
  private loadingSystem!: LoadingSystem;

  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    this.loadingSystem = new LoadingSystem(this);
    this.progressBar = new ProgressBar(this, config);
    
    this.loadingSystem.loadAssets(CRITICAL_ASSETS, (progress) => {
      this.progressBar.updateProgress(progress.percentage);
    });
  }

  create() {
    // Transition to main scene when complete
    this.scene.start('MainScene');
  }
}
```

### Phase 2: Navigation System (Priority: P1)

**Goal**: Implement navigation bar and scene switching

**Tasks**:
1. Create `NavigationSystem.ts` with state management
2. Implement `NavigationBar.ts` component
3. Set up navigation between Home, Play, Shop, Profile
4. Add navigation history tracking

**Validation**:
- All 4 navigation sections accessible
- Navigation state persists during app lifecycle
- Back navigation works correctly

**Code Example**:
```typescript
// NavigationSystem.ts - Basic structure
export class NavigationSystem implements INavigationSystem {
  private currentState: NavigationState;
  private eventBus: EventBus;

  async navigateTo(section: NavigationSection, data?: NavigationData) {
    const transition: SceneTransition = {
      from: this.currentState.currentSection,
      to: section,
      type: TransitionType.FADE,
      duration: 300
    };

    await this.sceneManager.transitionTo(
      this.currentState.currentSection,
      section,
      transition,
      data
    );

    this.updateState(section, data);
  }
}
```

### Phase 3: Player Data & Currency (Priority: P2)

**Goal**: Implement player profile display and currency system

**Tasks**:
1. Create `CurrencySystem.ts` with triple currency
2. Implement `PlayerHUD.ts` for top corner display
3. Add currency persistence and validation
4. Set up player profile data structure

**Validation**:
- Currency balances display correctly
- Currency operations are atomic
- Player data persists between sessions

### Phase 4: Shop Implementation (Priority: P3)

**Goal**: Complete shop functionality with item purchasing

**Tasks**:
1. Create `ShopScene.ts` with item grid
2. Implement purchase flow and validation
3. Add cart functionality
4. Connect shop to currency system

**Validation**:
- Shop items display with correct prices
- Purchase validation works properly
- Currency updates after purchases

## Mobile Development

### 1. Capacitor Setup (Optional)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync
```

### 2. Mobile Testing

```bash
# Test on device via browser
# 1. Get your local IP: ifconfig (macOS/Linux) or ipconfig (Windows)
# 2. Access: http://<your-ip>:5173

# Live reload for mobile
npm run dev -- --host 0.0.0.0

# Android testing
npx cap run android

# iOS testing (macOS only)
npx cap run ios
```

### 3. Mobile-Specific Considerations

- **Touch targets**: Minimum 44px for buttons
- **Safe area**: Handle notches and home indicators
- **Orientation lock**: Force portrait mode
- **Performance**: Monitor FPS on actual devices
- **Battery**: Optimize for battery life

## Debugging and Troubleshooting

### 1. Common Issues

**Scene not loading**:
```typescript
// Check scene registration
console.log(this.scene.manager.scenes);

// Verify scene key matches
this.scene.start('CorrectSceneKey');
```

**Memory leaks**:
```typescript
// Always cleanup in scene destroy
destroy() {
  this.eventBus.clear();
  this.uiComponents.forEach(c => c.destroy());
  super.destroy();
}
```

**Touch not working on mobile**:
```typescript
// Enable touch input
this.input.addPointer(2); // Support multi-touch

// Check touch events
this.input.on('pointerdown', (pointer) => {
  console.log('Touch detected:', pointer.x, pointer.y);
});
```

### 2. Performance Monitoring

```typescript
// Add FPS monitoring
this.add.text(10, 10, '', { fontSize: '16px' })
  .setScrollFactor(0)
  .setDepth(1000);

this.events.on('postupdate', () => {
  this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
});
```

### 3. Debug Console Commands

```javascript
// Access game instance in browser console
window.game = game;

// Scene debugging
game.scene.scenes.forEach(s => console.log(s.scene.key, s.scene.isActive()));

// Currency debugging
game.registry.get('currencySystem').getBalances();

// Navigation debugging
game.registry.get('navigationSystem').getCurrentState();
```

## Performance Guidelines

### 1. Asset Optimization
- **Images**: Use WebP format when possible, optimize for mobile
- **Audio**: Compress audio files, use appropriate bitrates
- **Fonts**: Subset fonts to required characters only

### 2. Code Optimization
- **Object pooling**: Reuse objects instead of creating new ones
- **Event cleanup**: Always remove event listeners
- **Texture management**: Destroy unused textures

### 3. Mobile Performance
- **Target 60 FPS** on mid-range devices
- **Memory usage < 200MB** on low-end devices
- **Loading time < 5 seconds** on 3G networks

## Deployment

### 1. Web Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to static hosting (Vercel, Netlify, etc.)
# Upload dist/ folder contents
```

### 2. Mobile App Deployment

```bash
# Build and sync mobile apps
npm run build
npx cap sync

# Generate signed builds
npx cap build android
npx cap build ios
```

## Next Steps

1. **Complete Phase 1**: Focus on core scene structure
2. **Test on mobile**: Validate touch interactions early
3. **Implement navigation**: Build out all 4 main sections
4. **Add polish**: Animations, sound effects, visual feedback
5. **Performance testing**: Validate on target devices
6. **User testing**: Gather feedback on user journey flow

## Support and Resources

- **Phaser Documentation**: https://photonstorm.github.io/phaser3-docs/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Project Issues**: Use GitHub issues for bug reports
- **Team Chat**: [Insert team communication channel]