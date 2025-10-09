# Implementation Plan: 2D Portrait Game User Journey

**Branch**: `002-user-journey-implementation` | **Date**: October 9, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-user-journey-implementation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a complete user journey for a 2D portrait game using Phaser framework, including loading screen with progress indicators, main screen with bottom navigation (Home, Play, Shop, Profile), player details display with triple currency system (coins, gems, energy), and seamless navigation between game sections optimized for mobile portrait orientation.

## Technical Context

**Language/Version**: TypeScript 5.0+ with strict type checking (per constitution requirement)  
**Primary Dependencies**: Phaser 3.70+, CapacitorJS 5.0+ for mobile deployment, Vite 4.0+ for build system  
**Storage**: Local storage for player progress, session storage for navigation state, IndexedDB for asset caching  
**Testing**: Jest with TypeScript support for unit tests, manual testing on mobile devices  
**Target Platform**: Web browsers (Chrome 90+, Safari 14+) and mobile devices via CapacitorJS (iOS 12+, Android API 24+)
**Project Type**: Single web/mobile project with cross-platform compatibility  
**Performance Goals**: 60 FPS on target mobile devices, <5 second loading time, <200ms navigation response  
**Constraints**: <200MB memory usage on low-end devices, battery optimization, portrait orientation only  
**Scale/Scope**: Single-player game with 4 main UI sections, triple currency system, asset preloading system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **I. Modular Game Architecture**: Feature will implement modular scene system (LoadingScene, MainScene, GameScene, ShopScene, ProfileScene) with clear interfaces and decoupled communication through event system.

✅ **II. TypeScript-First Development**: All code will be written in TypeScript 5.0+ with strict typing. UI components, game entities, and navigation state will have comprehensive type definitions.

✅ **III. Mobile-Optimized Performance**: Target 60 FPS on mobile devices, <200MB memory usage. Loading optimization with progress tracking, efficient asset management, and battery-conscious rendering.

✅ **IV. Scene-Based Organization**: Perfect alignment - feature is inherently scene-based with clear lifecycle management for each screen (loading, main, game, shop, profile).

✅ **V. Cross-Platform Compatibility**: Using Phaser 3.70+ with CapacitorJS 5.0+ for unified web/mobile deployment. Unified input system for touch and mouse interactions.

**Technology Stack Compliance**:
✅ Phaser 3.70+ with TypeScript 5.0+ - Core Framework requirement met
✅ CapacitorJS 5.0+ - Mobile Integration requirement met  
✅ Vite 4.0+ - Build System requirement met
✅ Performance validation required for all visual features

**Result**: ✅ PASS - All constitution requirements satisfied

## Final Constitution Check (Post-Design)

*Re-evaluation after Phase 1 design completion*

✅ **I. Modular Game Architecture**: Design implements clear separation with SceneManager, NavigationSystem, CurrencySystem, UISystem, and EventBus as independent modules with well-defined interfaces.

✅ **II. TypeScript-First Development**: All data models, API contracts, and system interfaces defined with comprehensive TypeScript types. No `any` types used, strict typing throughout.

✅ **III. Mobile-Optimized Performance**: Performance considerations integrated into design - object pooling, efficient scene management, battery optimization, memory constraints (<200MB), 60 FPS targets.

✅ **IV. Scene-Based Organization**: Perfect alignment maintained - LoadingScene, MainScene, GameScene, ShopScene, ProfileScene with proper lifecycle management and resource cleanup.

✅ **V. Cross-Platform Compatibility**: Design supports unified input system, responsive UI components, and CapacitorJS integration for seamless web/mobile deployment.

**Technology Stack Compliance**:
✅ Phaser 3.70+ with TypeScript 5.0+ - Core framework with comprehensive type definitions
✅ CapacitorJS 5.0+ for mobile deployment - Integrated into build system and design
✅ Vite 4.0+ for build system - Fast development with production optimization
✅ Performance validation built into design - Monitoring, metrics, and optimization strategies

**Design Quality Assessment**:
✅ Modular system architecture with clear separation of concerns
✅ Comprehensive error handling and recovery strategies
✅ Event-driven communication between systems
✅ Persistent state management with proper data validation
✅ Mobile-first responsive design patterns
✅ Performance monitoring and optimization built-in

**Final Result**: ✅ PASS - Design fully compliant with all constitution requirements. Ready for implementation.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── scenes/
│   ├── LoadingScene.ts
│   ├── MainScene.ts
│   ├── GameScene.ts
│   ├── ShopScene.ts
│   └── ProfileScene.ts
├── systems/
│   ├── SceneManager.ts
│   ├── NavigationSystem.ts
│   ├── CurrencySystem.ts
│   └── UISystem.ts
├── components/
│   ├── ui/
│   │   ├── NavigationBar.ts
│   │   ├── PlayerHUD.ts
│   │   ├── ProgressBar.ts
│   │   └── ShopItem.ts
│   └── game/
│       └── GameplayPlaceholder.ts
├── types/
│   ├── NavigationTypes.ts
│   ├── PlayerTypes.ts
│   ├── CurrencyTypes.ts
│   └── SceneTypes.ts
└── assets/
    ├── images/
    ├── audio/
    └── fonts/

tests/
├── scenes/
├── systems/
├── components/
└── integration/
```

**Structure Decision**: Single project structure selected as this is a unified game client with shared codebase for web and mobile platforms via CapacitorJS. All game logic, UI components, and scene management are contained within the src/ directory following Phaser best practices.
