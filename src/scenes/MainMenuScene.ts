/**
 * Main Menu Scene - Game menu and navigation
 * Following Scene-Based Organization principle
 */

import { eventBus, GAME_EVENTS } from '@/systems/EventBus';

export class MainMenuScene {
  readonly key = 'MainMenuScene';

  create(): void {
    console.log('Main Menu scene created');
    
    // Create menu UI
    this.createMenu();
    
    // Emit scene ready event
    eventBus.emit(GAME_EVENTS.SCENE_READY, { sceneKey: 'MainMenuScene' });
  }

  private createMenu(): void {
    console.log('Creating main menu...');
    
    // This would create actual menu buttons and UI
    // For now, just auto-start the game after a delay
    setTimeout(() => {
      console.log('Starting game...');
      // Transition to game scene
    }, 2000);
  }
}