# Data Model: HTML UI Integration

**Date**: October 31, 2025  
**Feature**: HTML UI Integration  
**Purpose**: Define core entities and relationships for UI overlay system

## Core Entities

### UIOverlayContainer
The root container that manages all HTML UI elements positioned above the Phaser canvas.

**Fields**:
- `element: HTMLDivElement` - Root DOM element for UI overlay
- `isVisible: boolean` - Overall visibility state
- `zIndex: number` - Z-index value for canvas layering
- `components: Map<string, UIComponent>` - Registered UI components

**Relationships**:
- Contains multiple `UIComponent` instances
- References single `GameCanvas` for positioning

**Validation Rules**:
- Z-index must be greater than canvas z-index
- Element must have absolute positioning
- Width and height must match canvas dimensions

### UIComponent
Individual UI elements (buttons, menus, HUD items) that can be displayed in the overlay.

**Fields**:
- `id: string` - Unique component identifier
- `element: HTMLElement` - DOM element for this component
- `isVisible: boolean` - Component visibility state
- `isInteractive: boolean` - Whether component accepts input
- `position: UIPosition` - Position relative to canvas
- `size: UISize` - Component dimensions
- `eventHandlers: Map<string, Function>` - Event listener mappings

**Relationships**:
- Belongs to single `UIOverlayContainer`
- May reference `GameState` for data binding

**Validation Rules**:
- ID must be unique within container
- Interactive components must have pointer-events: auto
- Position coordinates must be within canvas bounds

### GameUIBridge
Communication layer that synchronizes game state with UI components.

**Fields**:
- `gameState: GameState` - Reference to current game state
- `uiContainer: UIOverlayContainer` - Reference to UI overlay
- `eventSubscriptions: Map<string, Function[]>` - Event listener mappings
- `updateQueue: UIUpdate[]` - Pending UI updates

**Relationships**:
- Connects `GameState` to `UIOverlayContainer`
- Uses `EventBus` for state change notifications

**Validation Rules**:
- Must have valid references to game state and UI container
- Event subscriptions must be properly cleaned up
- Update queue size should not exceed performance threshold

### InputHandler
Manages event routing between HTML UI elements and Phaser canvas interactions.

**Fields**:
- `canvas: HTMLCanvasElement` - Reference to game canvas
- `uiContainer: UIOverlayContainer` - Reference to UI overlay
- `activeElement: HTMLElement | null` - Currently focused UI element
- `eventMappings: Map<string, EventTarget>` - Event routing rules

**Relationships**:
- References both `GameCanvas` and `UIOverlayContainer`
- Coordinates with Phaser's input system

**Validation Rules**:
- Canvas and UI container references must be valid
- Event mappings must prevent conflicts between UI and game
- Touch events must meet accessibility minimum size requirements

### LayoutManager
Handles responsive positioning and sizing of UI elements relative to the canvas.

**Fields**:
- `canvasSize: UISize` - Current canvas dimensions
- `viewportSize: UISize` - Current viewport dimensions
- `scaleFactor: number` - Scale ratio for responsive design
- `breakpoints: UIBreakpoint[]` - Responsive design breakpoints

**Relationships**:
- Monitors `GameCanvas` size changes
- Updates all `UIComponent` positions

**Validation Rules**:
- Scale factor must be positive
- Breakpoints must be in ascending order
- Canvas size must match actual canvas element dimensions

## Supporting Types

### UIPosition
```typescript
interface UIPosition {
  x: number;        // X coordinate (pixels or percentage)
  y: number;        // Y coordinate (pixels or percentage)
  anchor: 'px' | '%'; // Position unit type
  origin: 'top-left' | 'center' | 'bottom-right'; // Reference point
}
```

### UISize
```typescript
interface UISize {
  width: number;    // Width in pixels
  height: number;   // Height in pixels
}
```

### UIBreakpoint
```typescript
interface UIBreakpoint {
  name: string;     // Breakpoint identifier
  minWidth: number; // Minimum width threshold
  maxWidth?: number; // Maximum width threshold (optional)
}
```

### UIUpdate
```typescript
interface UIUpdate {
  componentId: string;  // Target component ID
  property: string;     // Property to update
  value: any;          // New value
  timestamp: number;   // Update timestamp
}
```

## State Transitions

### Component Lifecycle
1. **Created** → Component instantiated with default properties
2. **Registered** → Added to UIOverlayContainer
3. **Mounted** → DOM element added to overlay
4. **Visible** → Component displayed to user
5. **Interactive** → Accepts user input
6. **Hidden** → Component invisible but still mounted
7. **Unmounted** → DOM element removed from overlay
8. **Destroyed** → Component cleaned up and references removed

### Visibility States
- `hidden` → `visible`: Element style display changes, events may fire
- `visible` → `hidden`: Element style display changes, cleanup events
- `interactive` → `non-interactive`: Pointer events disabled
- `non-interactive` → `interactive`: Pointer events enabled

### Responsive Transitions
- `small` → `medium` → `large`: Layout adjustments based on viewport size
- Position and size recalculations triggered by viewport changes
- Breakpoint transitions maintain component functionality

## Entity Relationships Diagram

```
GameState ←→ GameUIBridge ←→ UIOverlayContainer
                              ↓
                            UIComponent (multiple)
                              ↓
GameCanvas ←→ InputHandler ←→ UIOverlayContainer
    ↓
LayoutManager ←→ UIComponent (positioning)
```

## Data Flow

1. **Game State Change**: Game logic updates state → EventBus notification
2. **Bridge Processing**: GameUIBridge receives event → Queues UI update
3. **UI Update**: Scheduled update modifies UIComponent properties
4. **DOM Rendering**: Browser renders updated UI elements
5. **User Interaction**: User interacts with UI element → Event handler
6. **Action Dispatch**: UI event triggers game action or state change

## Validation & Constraints

### Performance Constraints
- Maximum 50 simultaneous UIComponent instances
- UI updates must complete within 16.67ms (60 FPS target)
- Event queue size limited to 100 pending updates
- DOM manipulation batched within RAF cycles

### Accessibility Constraints
- Touch targets minimum 44px × 44px
- Keyboard navigation support required
- ARIA attributes for screen reader compatibility
- Color contrast ratios meet WCAG guidelines

### Responsive Constraints
- Support screen widths 320px to 2560px
- Maintain aspect ratios across device orientations
- UI elements must remain within canvas boundaries
- Touch-friendly sizing on mobile devices