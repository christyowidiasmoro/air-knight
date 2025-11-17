/**
 * Example implementation showing how to integrate UITestScene with existing Phaser scenes
 * This file demonstrates how to add UI testing to any Phaser scene
 */

import { Scene } from 'phaser';

export class ExampleMenuScene extends Scene {
  constructor() {
    super({ key: 'ExampleMenuScene' });
  }

  create(): void {
    // Add a simple background
    this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x2c3e50
    );

    // Add title
    this.add.text(
      this.cameras.main.width / 2,
      100,
      'Air Knight - Menu Scene',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // Add navigation text
    this.add.text(
      this.cameras.main.width / 2,
      200,
      'Press SPACE to launch UI Test Scene\nPress ENTER to start main game',
      {
        fontSize: '18px',
        color: '#ecf0f1',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5);

    // Add input handlers
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('UITestScene');
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.start('MainScene');
    });

    // Add visual feedback
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 100,
      'UI Test Scene demonstrates:\n• HTML overlay components\n• Responsive design\n• Input handling\n• Event system integration',
      {
        fontSize: '14px',
        color: '#95a5a6',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5);
  }
}