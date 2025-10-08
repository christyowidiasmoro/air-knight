# Air Knight - Quick Start Guide

## 🚀 Getting Started

### Option 1: Automatic Setup
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm install

# Install Phaser
npm install phaser@^3.70.0

# Build the game
npm run build

# Start development
npm run dev
```

## 🎮 Development

```bash
npm run dev          # Start with hot reload
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run tests
npm run lint         # Check code quality
```

## 📱 Mobile Development

```bash
# First-time mobile setup
npm run mobile:setup     # Adds platforms (Android & iOS)

# Build and sync
npm run mobile:build

# Open native IDEs
npm run mobile:ios      # Requires Xcode
npm run mobile:android  # Requires Android Studio

# Live reload on device
npm run mobile:serve
```

## 📁 Project Structure

```
src/
├── main.ts           # Entry point
├── core/            # Game engine
├── scenes/          # Game scenes
├── systems/         # Core systems
├── utils/           # Utilities
└── types/           # TypeScript types
```

## 🎯 Key Features

- **TypeScript-First**: Strict typing throughout
- **Mobile-Optimized**: 60 FPS performance target
- **Cross-Platform**: Web + iOS/Android via Capacitor
- **Modular Architecture**: Clean separation of concerns
- **Touch Support**: Unified input for all platforms

## 🔧 Configuration

Edit these files to customize:
- `src/types/index.ts` - Game types and constants
- `capacitor.config.json` - Mobile app settings
- `vite.config.ts` - Build configuration

## 📖 Next Steps

1. Read the full [README.md](README.md)
2. Check the [Constitution](.specify/memory/constitution.md)
3. Explore the example scenes in `src/scenes/`
4. Run tests with `npm test`

Happy coding! 🎮