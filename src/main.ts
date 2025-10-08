/**
 * Air Knight Game - Main entry point
 * Following all constitution principles for clean modular mobile game development
 */

import { gameEngine } from '@/core/GameEngine';
import { eventBus, GAME_EVENTS } from '@/systems/EventBus';

// Platform detection
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const hasTouch = 'ontouchstart' in window;

console.log('Air Knight Game Starting...');
console.log(`Platform: ${isMobile ? 'Mobile' : 'Desktop'}`);
console.log(`Touch Support: ${hasTouch}`);

// Setup error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  eventBus.emit(GAME_EVENTS.ERROR, {
    code: 'GLOBAL_ERROR',
    message: event.message,
    stack: event.error?.stack,
    timestamp: Date.now(),
  });
});

// Setup unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  eventBus.emit(GAME_EVENTS.ERROR, {
    code: 'UNHANDLED_PROMISE',
    message: 'Unhandled promise rejection',
    error: event.reason,
    timestamp: Date.now(),
  });
});

// Game event handlers
eventBus.subscribe(GAME_EVENTS.GAME_START, () => {
  console.log('🎮 Game started successfully!');
});

eventBus.subscribe(GAME_EVENTS.PERFORMANCE_WARNING, (data: any) => {
  console.warn('⚠️ Performance warning:', data);
});

eventBus.subscribe(GAME_EVENTS.ERROR, (error: any) => {
  console.error('❌ Game error:', error);
});

// Initialize and start the game
async function startGame(): Promise<void> {
  try {
    await gameEngine.initialize();
    console.log('✅ Air Knight initialized successfully');
  } catch (error) {
    console.error('💥 Failed to start Air Knight:', error);
    
    // Show error message to user
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.innerHTML = `
        <div style="
          color: white; 
          text-align: center; 
          padding: 20px;
          font-family: Arial, sans-serif;
        ">
          <h2>❌ Game Failed to Start</h2>
          <p>Sorry, Air Knight couldn't initialize properly.</p>
          <p style="font-size: 12px; opacity: 0.7;">
            ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button onclick="location.reload()" style="
            padding: 10px 20px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
          ">
            Reload Game
          </button>
        </div>
      `;
    }
  }
}

// Handle page visibility changes (mobile optimization)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    eventBus.emit(GAME_EVENTS.GAME_PAUSE);
    console.log('🔽 Game paused (page hidden)');
  } else {
    eventBus.emit(GAME_EVENTS.GAME_RESUME);
    console.log('🔼 Game resumed (page visible)');
  }
});

// Handle window resize (responsive design)
window.addEventListener('resize', () => {
  console.log('📱 Window resized:', window.innerWidth, 'x', window.innerHeight);
  // Game engine will handle resize through Phaser's scale manager
});

// Prevent context menu on mobile
document.addEventListener('contextmenu', (e) => {
  if (isMobile) {
    e.preventDefault();
  }
});

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGame);
} else {
  startGame();
}

// Export for debugging
(window as any).gameEngine = gameEngine;
(window as any).eventBus = eventBus;