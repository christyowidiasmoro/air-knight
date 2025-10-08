<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- Added principles: Modular Game Architecture, TypeScript-First Development, Mobile-Optimized Performance, Scene-Based Organization, Cross-Platform Compatibility
- Added sections: Technology Stack Requirements, Development Workflow
- Templates requiring updates: ✅ All templates aligned with game development principles
- Follow-up TODOs: None
-->

# Air Knight Constitution

## Core Principles

### I. Modular Game Architecture
Every game system MUST be designed as an independent, reusable module with clear interfaces.
Game systems (rendering, input, audio, physics) MUST be decoupled and communicate through well-defined contracts.
Each module MUST be testable in isolation and follow single responsibility principle.

**Rationale**: Modular architecture enables better maintainability, testing, and code reuse across different game features.

### II. TypeScript-First Development (NON-NEGOTIABLE)
All game code MUST be written in TypeScript with strict type checking enabled.
Type definitions MUST be comprehensive, avoiding `any` types except for validated external APIs.
Interfaces MUST define all game entity contracts, component systems, and event structures.

**Rationale**: TypeScript provides compile-time safety critical for complex game logic and prevents runtime errors in production.

### III. Mobile-Optimized Performance
All game features MUST maintain 60 FPS on target mobile devices (iOS 12+, Android API 24+).
Memory usage MUST NOT exceed 200MB on low-end devices.
Battery optimization MUST be prioritized through efficient rendering and minimal background processing.

**Rationale**: Mobile games require strict performance constraints to provide smooth user experience across diverse hardware.

### IV. Scene-Based Organization
Game functionality MUST be organized into discrete scenes with clear lifecycle management.
Scene transitions MUST be smooth and handle state persistence appropriately.
Each scene MUST manage its own resources and cleanup on destruction.

**Rationale**: Scene-based architecture provides natural organization for game features and enables efficient memory management.

### V. Cross-Platform Compatibility
Game code MUST run identically on web browsers and mobile devices via CapacitorJS.
Platform-specific features MUST be abstracted behind unified interfaces.
Touch and mouse/keyboard input MUST be handled through a unified input system.

**Rationale**: Cross-platform compatibility maximizes reach while maintaining single codebase simplicity.

## Technology Stack Requirements

**Core Framework**: Phaser 3.70+ with TypeScript 5.0+
**Mobile Integration**: CapacitorJS 5.0+ for native mobile deployment
**Build System**: Vite 4.0+ for fast development and optimized production builds
**Testing**: Jest with TypeScript support for unit tests, Playwright for integration tests
**Code Quality**: ESLint + Prettier with TypeScript rules
**Asset Pipeline**: Optimized sprite sheets, compressed audio, efficient texture management

## Development Workflow

**Development Process**: Feature-driven development with component-based architecture
**Code Review**: All game system changes require performance impact assessment
**Testing Gates**: Unit tests for game logic, integration tests for scene transitions
**Performance Validation**: Frame rate profiling required for all visual features
**Mobile Testing**: Mandatory testing on actual devices before feature completion

## Governance

Constitution supersedes all coding practices and architectural decisions.
All game features must demonstrate compliance with mobile performance requirements.
Complexity in game systems must be justified with clear performance and maintainability benefits.
Use project documentation for runtime development guidance and platform-specific considerations.

**Version**: 1.0.0 | **Ratified**: 2025-10-08 | **Last Amended**: 2025-10-08