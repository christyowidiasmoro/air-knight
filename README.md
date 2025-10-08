# Air Knight

A modular TypeScript Phaser mobile game built with CapacitorJS, following clean architecture principles and mobile-first design.

## 🎮 Features

- **Cross-Platform**: Runs on web browsers and mobile devices (iOS/Android)
- **TypeScript-First**: Strict typing for reliable game development
- **Modular Architecture**: Clean separation of concerns with independent systems
- **Mobile-Optimized**: 60 FPS performance with memory management
- **Touch Controls**: Unified input system for touch and keyboard/mouse
- **Scene Management**: Organized game flow with lifecycle management

## 🏗️ Architecture

The game follows the principles defined in our [Constitution](.specify/memory/constitution.md):

### Core Systems

- **Event Bus**: Centralized event management for decoupled communication
- **Scene Manager**: Handles scene lifecycle and smooth transitions
- **Input System**: Unified input handling for cross-platform compatibility
- **Platform Manager**: Mobile detection and optimization
- **Performance Monitor**: Real-time FPS and memory tracking

### Project Structure

```
src/
├── core/           # Game engine and main systems
├── scenes/         # Game scenes (Boot, Menu, Game)
├── systems/        # Core game systems
├── utils/          # Utility classes and helpers
├── types/          # TypeScript type definitions
└── test/           # Test setup and utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Android Studio for Android builds
- (Optional) Xcode for iOS builds

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd air-knight

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
```

### Mobile Development

```bash
# First-time setup (adds platforms)
npm run mobile:setup    # Adds Android and iOS platforms

# Build and sync with Capacitor
npm run mobile:build

# Open in native IDEs
npm run mobile:ios      # Open iOS project in Xcode
npm run mobile:android  # Open Android project in Android Studio

# Development with live reload
npm run mobile:serve    # Run with live reload on device
```

## 🎯 Game Development

### Adding New Scenes

1. Create a new scene class extending the base scene interface
2. Register the scene with the Scene Manager
3. Implement required lifecycle methods (create, update, destroy)

```typescript
import { eventBus, GAME_EVENTS } from '@/systems/EventBus';

export class MyScene {
  readonly key = 'MyScene';

  create(): void {
    // Scene initialization
    eventBus.emit(GAME_EVENTS.SCENE_READY, { sceneKey: 'MyScene' });
  }

  update(time: number, delta: number): void {
    // Game loop logic
  }
}
```

### Input Handling

The unified input system provides both touch and keyboard/mouse support:

```typescript
import { InputSystem } from '@/systems/InputSystem';

// In your scene or game object
const inputSystem = gameEngine.getSystem<InputSystem>('InputSystem');

// Check input state
if (inputSystem?.isKeyPressed('space')) {
  // Handle space key
}

if (inputSystem?.isTouchActive()) {
  const touchPos = inputSystem.getTouchPosition();
  // Handle touch input
}
```

### Performance Guidelines

- Target 60 FPS on mobile devices
- Keep memory usage under 200MB
- Use object pooling for frequently created objects
- Optimize textures and audio for mobile
- Monitor performance metrics in development

## 📱 Mobile Optimization

### Automatic Optimizations

- **Low Performance Mode**: Automatically reduces quality when FPS drops
- **Memory Management**: Monitors heap usage and emits warnings
- **Touch Gestures**: Built-in swipe and tap detection
- **Orientation Handling**: Responds to device rotation
- **Battery Optimization**: Efficient rendering and reduced background processing

### Platform Detection

```typescript
import { platformManager } from '@/utils/PlatformManager';

if (platformManager.isMobile()) {
  // Mobile-specific logic
}

const settings = platformManager.getOptimalSettings();
// Apply platform-optimized settings
```

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Jest with TypeScript support
- **Mocked Canvas**: Canvas API mocking for headless testing
- **Coverage Reports**: Configured coverage thresholds
- **Mobile Mocks**: Touch events and platform APIs

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm test -- --coverage # Generate coverage report
```

## 🔧 Configuration

### Game Settings

Game behavior can be configured through:

- **Constitution**: Core development principles and constraints
- **TypeScript Config**: Strict typing and path aliases
- **Vite Config**: Build optimization and mobile-specific settings
- **Capacitor Config**: Mobile app configuration

### Environment Variables

Create a `.env` file for environment-specific settings:

```env
VITE_GAME_DEBUG=true
VITE_PERFORMANCE_MONITORING=true
VITE_ENABLE_SOUND=true
```

## 📊 Performance Monitoring

The game includes built-in performance monitoring:

- Real-time FPS tracking
- Memory usage monitoring
- Performance warnings when thresholds exceeded
- Automatic quality adjustments for mobile devices

## 🤝 Contributing

1. Follow the [Constitution](.specify/memory/constitution.md) principles
2. Ensure all code is TypeScript with strict typing
3. Write tests for new functionality
4. Maintain 60 FPS performance on mobile
5. Use the modular architecture patterns

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [CapacitorJS Documentation](https://capacitorjs.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mobile Game Performance Best Practices](https://developers.google.com/web/fundamentals/performance/rail)

---

**Air Knight** - Built with ❤️ using TypeScript, Phaser, and CapacitorJS