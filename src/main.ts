/**
 * Air Knight Game - Main entry point
 */

import * as Phaser from 'phaser';
import { eventBus } from './systems/EventBus';
import { errorHandler } from './systems/ErrorHandler';
import { GAME_CONFIG, SCENE_KEYS, COLORS, EVENTS } from './utils/Constants';

// Platform detection
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

console.log('Air Knight Game Starting...');
console.log(`Platform: ${isMobile ? 'Mobile' : 'Desktop'}`);

function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: COLORS.BACKGROUND,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT,
    },
    fps: {
      target: GAME_CONFIG.TARGET_FPS,
      forceSetTimeOut: true,
    },
    input: {
      touch: { capture: true },
      mouse: {
        preventDefaultDown: true,
        preventDefaultUp: true,
        preventDefaultMove: true,
        preventDefaultWheel: false,
      },
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: process.env.NODE_ENV === 'development',
      },
    },
    scene: [],
    render: {
      antialias: false,
      pixelArt: false,
      powerPreference: 'high-performance',
    },
    audio: { disableWebAudio: false },
    banner: {
      hidePhaser: process.env.NODE_ENV === 'production',
      text: process.env.NODE_ENV === 'development' ? '#ffffff' : '',
      background:
        process.env.NODE_ENV === 'development'
          ? ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#000000']
          : [],
    },
  };
}

let game: Phaser.Game | null = null;

async function startGame(): Promise<void> {
  try {
    console.log('🎮 Initializing Air Knight...');
    const config = createGameConfig();
    game = new Phaser.Game(config);
    setupGameEventHandlers(game);
    eventBus.emit(EVENTS.SCENE_STARTED, { scene: 'main', timestamp: new Date() });
    console.log('✅ Air Knight initialized successfully');
  } catch (error) {
    errorHandler.handleError(
      error as Error,
      {
        scene: 'main',
        component: 'game-initialization',
        action: 'start-game',
      },
      false
    );
    showErrorScreen(error as Error);
  }
}

function setupGameEventHandlers(_gameInstance: Phaser.Game): void {
  eventBus.subscribe(EVENTS.SCENE_TRANSITION_START, (data: any) => {
    console.log('�� Scene transition started:', data);
  });
  eventBus.subscribe(EVENTS.SCENE_TRANSITION_COMPLETE, (data: any) => {
    console.log('✅ Scene transition completed:', data);
  });
  eventBus.subscribe(EVENTS.PERFORMANCE_WARNING, (data: any) => {
    console.warn('⚠️ Performance warning:', data);
  });
  eventBus.subscribe(EVENTS.ERROR_OCCURRED, (error: any) => {
    console.error('❌ Game error:', error);
  });
}

function showErrorScreen(error: Error): void {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.innerHTML = `
      <div style="
        color: white; 
        text-align: center; 
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: ${COLORS.BACKGROUND};
      ">
        <h2 style="color: ${COLORS.ERROR}; margin-bottom: 20px;">❌ Game Failed to Start</h2>
        <p style="margin-bottom: 10px;">Sorry, Air Knight couldn't initialize properly.</p>
        <p style="font-size: 12px; opacity: 0.7; margin-bottom: 20px; max-width: 300px;">
          ${error.message}
        </p>
        <button onclick="location.reload()" style="
          padding: 12px 24px;
          background: ${COLORS.PRIMARY};
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-family: inherit;
        ">
          Reload Game
        </button>
      </div>
    `;
  }
}

// Mobile optimizations
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause all active scenes
    if (game) {
      Object.values(SCENE_KEYS).forEach(sceneKey => {
        if (game!.scene.isActive(sceneKey)) {
          game!.scene.pause(sceneKey);
        }
      });
    }
    console.log('🔽 Game paused (page hidden)');
  } else {
    // Resume all paused scenes
    if (game) {
      Object.values(SCENE_KEYS).forEach(sceneKey => {
        if (game!.scene.isPaused(sceneKey)) {
          game!.scene.resume(sceneKey);
        }
      });
    }
    console.log('🔼 Game resumed (page visible)');
  }
});

window.addEventListener('resize', () => {
  console.log('📱 Window resized:', window.innerWidth, 'x', window.innerHeight);
  if (game) {
    game.scale.refresh();
  }
});

document.addEventListener('contextmenu', e => {
  if (isMobile) {
    e.preventDefault();
  }
});

let lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  event => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGame);
} else {
  startGame();
}

if (process.env.NODE_ENV === 'development') {
  (window as any).game = game;
  (window as any).eventBus = eventBus;
  (window as any).errorHandler = errorHandler;
}
