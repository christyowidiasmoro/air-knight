import Phaser from 'phaser';
import { GameEngine } from './core/GameEngine';
import { PlatformManager } from './systems/PlatformManager';
// Import global styles for UI overlay system
import './styles/globals.css';

/**
 * Main entry point for Air Knight game
 * Initializes the game engine and handles platform-specific setup
 */
class Main {
  private game: Phaser.Game | null = null;
  private gameEngine: GameEngine | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Initialize platform manager for cross-platform compatibility
      await PlatformManager.initialize();

      // Create game engine instance
      this.gameEngine = new GameEngine();
      
      // Start the game
      this.game = this.gameEngine.start();

      // Handle visibility changes for mobile optimization
      this.setupVisibilityHandlers();

      // Handle resize events for responsive design
      this.setupResizeHandlers();

      // Development tools - expose to window for debugging
      // this.setupDevelopmentTools();

      console.log('🎮 Air Knight initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Air Knight:', error);
      this.showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
  }

  private setupVisibilityHandlers(): void {
    document.addEventListener('visibilitychange', () => {
      if (this.gameEngine) {
        if (document.hidden) {
          // Game goes to background - pause for battery optimization
          this.gameEngine.pauseAll();
        } else {
          // Game comes to foreground - resume
          this.gameEngine.resumeAll();
        }
      }
    });
  }

  private setupResizeHandlers(): void {
    window.addEventListener('resize', () => {
      if (this.game && this.gameEngine) {
        this.gameEngine.handleResize();
      }
    });

    // Handle orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      if (this.game && this.gameEngine) {
        // Delay to allow orientation change to complete
        setTimeout(() => {
          this.gameEngine?.handleResize();
        }, 100);
      }
    });
  }

  private showErrorMessage(message: string): void {
    const container = document.getElementById('game-container');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: Arial, sans-serif;
          color: #333;
          text-align: center;
          padding: 20px;
        ">
          <h2>Oops! Something went wrong</h2>
          <p>${message}</p>
          <button onclick="location.reload()" style="
            padding: 10px 20px;
            font-size: 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
          ">
            Retry
          </button>
        </div>
      `;
    }
  }

  /**
   * Cleanup method for proper resource management
   */
  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    if (this.gameEngine) {
      this.gameEngine.destroy();
      this.gameEngine = null;
    }
  }
}

// Initialize the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Main());
} else {
  new Main();
}

// Handle page unload for cleanup
window.addEventListener('beforeunload', () => {
  // Cleanup will be handled by Phaser automatically
});

// Export for potential external access
export default Main;