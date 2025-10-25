#!/usr/bin/env node

/**
 * Placeholder Asset Generator for Air Knight Game
 * 
 * Generates placeholder images, sprites, and UI assets for development
 * Usage: node scripts/generate-placeholder-assets.js [options]
 */

const fs = require('fs');
const path = require('path');

// Canvas API for Node.js - install with: npm install canvas
let Canvas, createCanvas, loadImage;
try {
  const canvas = require('canvas');
  Canvas = canvas.Canvas;
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
} catch (error) {
  console.warn('Canvas module not found. Install with: npm install canvas');
  console.warn('Falling back to SVG generation for some assets');
}

const assets = {
  ui: [
    { name: 'loading-bar-bg', width: 300, height: 30, color: '#CCCCCC', text: '' },
    { name: 'loading-bar-fill', width: 300, height: 30, color: '#4CAF50', text: '' },
    { name: 'loading-spinner', width: 50, height: 50, color: '#2196F3', text: '⟳' },
    { name: 'start-button', width: 200, height: 60, color: '#4CAF50', text: 'START' },
    { name: 'google-signin-button', width: 200, height: 60, color: '#DB4437', text: 'SIGN IN WITH GOOGLE' },
    { name: 'apple-signin-button', width: 200, height: 60, color: '#000000', text: 'SIGN IN WITH APPLE' },
    { name: 'continue-button', width: 200, height: 60, color: '#4CAF50', text: 'CONTINUE' },
    { name: 'skip-button', width: 200, height: 60, color: '#FF9800', text: 'SKIP' },
    { name: 'play-button', width: 200, height: 60, color: '#4CAF50', text: 'PLAY' },
    { name: 'settings-button', width: 150, height: 50, color: '#2196F3', text: 'SETTINGS' },
    { name: 'pause-button', width: 80, height: 80, color: '#FF9800', text: 'PAUSE' },
    { name: 'resume-button', width: 120, height: 50, color: '#4CAF50', text: 'RESUME' },
    { name: 'home-button', width: 100, height: 50, color: '#9C27B0', text: 'HOME' },
    { name: 'retry-button', width: 100, height: 50, color: '#F44336', text: 'RETRY' }
  ],
  sprites: [
    { name: 'air-knight-logo', width: 64, height: 64, color: '#00BCD4', text: 'Air Knight' },
    { name: 'player-ship', width: 64, height: 64, color: '#00BCD4', text: 'SHIP' },
    { name: 'enemy-basic', width: 48, height: 48, color: '#F44336', text: 'ENEMY' },
    { name: 'powerup-speed', width: 32, height: 32, color: '#FFEB3B', text: 'SPEED' },
    { name: 'powerup-weapon', width: 32, height: 32, color: '#FF5722', text: 'WEAPON' },
    { name: 'projectile', width: 16, height: 16, color: '#FFC107', text: '•' },
    { name: 'explosion', width: 96, height: 96, color: '#FF9800', text: 'BOOM' }
  ],
  icons: [
    { name: 'icon-sound-on', size: 32, color: '#4CAF50', text: '♪' },
    { name: 'icon-sound-off', size: 32, color: '#F44336', text: '♪' },
    { name: 'icon-help', size: 32, color: '#2196F3', text: '?' },
    { name: 'icon-settings', size: 32, color: '#9E9E9E', text: '⚙' },
    { name: 'icon-trophy', size: 32, color: '#FFD700', text: '🏆' },
    { name: 'icon-star', size: 24, color: '#FFD700', text: '★' }
  ],
  backgrounds: [
    { name: 'boot-bg', width: 720, height: 1280, color: '#1A1A2E', text: 'BOOT BG' },
    { name: 'menu-bg', width: 720, height: 1280, color: '#1A1A2E', text: 'MENU BG' },
    { name: 'game-bg', width: 720, height: 1280, color: '#16213E', text: 'GAME BG' },
    { name: 'space-bg', width: 720, height: 1280, color: '#0F3460', text: 'SPACE BG' },
    { name: 'onboarding-bg', width: 720, height: 1280, color: '#533483', text: 'TUTORIAL BG' }
  ],
  audio: [
    'menu-music.wav',
    'game-music.wav',
    'button-click.wav',
    'explosion.wav',
    'powerup.wav',
    'shoot.wav'
  ]
}





class PlaceholderAssetGenerator {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'src', 'assets');
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      this.outputDir,
      path.join(this.outputDir, 'images'),
      path.join(this.outputDir, 'ui'),
      path.join(this.outputDir, 'sprites'),
      path.join(this.outputDir, 'icons'),
      path.join(this.outputDir, 'backgrounds')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  }

  // Generate colored rectangle placeholder
  generateRectanglePlaceholder(width, height, color, text, outputPath) {
    if (createCanvas) {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Fill background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);

      // Add border
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // Add text
      ctx.fillStyle = '#000000';
      ctx.font = `${Math.min(width, height) / 8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, height / 2);

      // Add dimensions text
      ctx.font = `${Math.min(width, height) / 12}px Arial`;
      ctx.fillText(`${width}x${height}`, width / 2, height / 2 + Math.min(width, height) / 6);

      // Save as PNG
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      console.log(`Generated: ${outputPath}`);
    } else {
      this.generateSVGPlaceholder(width, height, color, text, outputPath);
    }
  }

  // Generate SVG placeholder (fallback)
  generateSVGPlaceholder(width, height, color, text, outputPath) {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}" stroke="#333" stroke-width="2"/>
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial" font-size="${Math.min(width, height) / 8}" fill="#000">
          ${text}
        </text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial" font-size="${Math.min(width, height) / 12}" fill="#000">
          ${width}x${height}
        </text>
      </svg>
    `;

    const svgPath = outputPath.replace('.png', '.svg');
    fs.writeFileSync(svgPath, svg);
    console.log(`Generated SVG: ${svgPath}`);
  }

  // Generate UI placeholders
  generateUI() {
    const uis = assets.ui;
    uis.forEach(ui => {
      const outputPath = path.join(this.outputDir, 'ui', `${ui.name}.png`);
      this.generateRectanglePlaceholder(ui.width, ui.height, ui.color, ui.text, outputPath);
    });
  }

  // Generate game sprites
  generateGameSprites() {
    const sprites = assets.sprites;
    sprites.forEach(sprite => {
      const outputPath = path.join(this.outputDir, 'sprites', `${sprite.name}.png`);
      this.generateRectanglePlaceholder(sprite.width, sprite.height, sprite.color, sprite.text, outputPath);
    });
  }

  // Generate icons
  generateIcons() {
    const icons = assets.icons;
    icons.forEach(icon => {
      const outputPath = path.join(this.outputDir, 'icons', `${icon.name}.png`);
      this.generateRectanglePlaceholder(icon.size, icon.size, icon.color, icon.text, outputPath);
    });
  }

  // Generate background images
  generateBackgrounds() {
    const backgrounds = assets.backgrounds;
    backgrounds.forEach(bg => {
      const outputPath = path.join(this.outputDir, 'backgrounds', `${bg.name}.png`);
      this.generateRectanglePlaceholder(bg.width, bg.height, bg.color, bg.text, outputPath);
    });
  }

  // Generate sprite atlas placeholder
  generateSpriteAtlas() {
    if (!createCanvas) {
      console.log('Canvas not available, skipping sprite atlas generation');
      return;
    }

    const atlasWidth = 512;
    const atlasHeight = 512;
    const canvas = createCanvas(atlasWidth, atlasHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2E2E2E';
    ctx.fillRect(0, 0, atlasWidth, atlasHeight);

    // Grid
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    for (let x = 0; x < atlasWidth; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, atlasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < atlasHeight; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(atlasWidth, y);
      ctx.stroke();
    }

    // Sample sprites
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    let colorIndex = 0;
    
    for (let y = 0; y < atlasHeight; y += 64) {
      for (let x = 0; x < atlasWidth; x += 64) {
        if (Math.random() > 0.3) { // 70% chance to place a sprite
          ctx.fillStyle = colors[colorIndex % colors.length];
          ctx.fillRect(x + 2, y + 2, 60, 60);
          
          ctx.fillStyle = '#000000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${x/64},${y/64}`, x + 32, y + 35);
          
          colorIndex++;
        }
      }
    }

    // Save atlas
    const buffer = canvas.toBuffer('image/png');
    const atlasPath = path.join(this.outputDir, 'sprites', 'sprite-atlas.png');
    fs.writeFileSync(atlasPath, buffer);
    console.log(`Generated sprite atlas: ${atlasPath}`);

    // Generate atlas JSON metadata
    const atlasData = {
      meta: {
        image: 'sprite-atlas.png',
        size: { w: atlasWidth, h: atlasHeight },
        scale: '1'
      },
      frames: {}
    };

    // Add sample frame data
    let frameIndex = 0;
    for (let y = 0; y < atlasHeight; y += 64) {
      for (let x = 0; x < atlasWidth; x += 64) {
        if (frameIndex < 10) { // Add first 10 frames
          atlasData.frames[`sprite_${frameIndex}`] = {
            frame: { x, y, w: 64, h: 64 },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: 64, h: 64 },
            sourceSize: { w: 64, h: 64 }
          };
          frameIndex++;
        }
      }
    }

    const atlasJsonPath = path.join(this.outputDir, 'sprites', 'sprite-atlas.json');
    fs.writeFileSync(atlasJsonPath, JSON.stringify(atlasData, null, 2));
    console.log(`Generated atlas metadata: ${atlasJsonPath}`);
  }

  // Generate audio placeholder files (empty WAV files)
  generateAudioPlaceholders() {
    const audioDir = path.join(this.outputDir, 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    const audioFiles = assets.audio;
    // Create minimal WAV file header (44 bytes for empty WAV)
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // File size (36 bytes)
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6D, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Subchunk1Size (16)
      0x01, 0x00,             // AudioFormat (PCM)
      0x01, 0x00,             // NumChannels (mono)
      0x44, 0xAC, 0x00, 0x00, // SampleRate (44100)
      0x44, 0xAC, 0x00, 0x00, // ByteRate
      0x01, 0x00,             // BlockAlign
      0x08, 0x00,             // BitsPerSample (8)
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // Subchunk2Size (0)
    ]);

    audioFiles.forEach(filename => {
      const audioPath = path.join(audioDir, filename);
      fs.writeFileSync(audioPath, wavHeader);
      console.log(`Generated audio placeholder: ${audioPath}`);
    });
  }

  // Generate all placeholder assets
  generateAll() {
    console.log('🎨 Generating placeholder assets for Air Knight...\n');
    
    this.generateUI();
    this.generateGameSprites();
    this.generateIcons();
    this.generateBackgrounds();
    this.generateSpriteAtlas();
    this.generateAudioPlaceholders();

    console.log('\n✅ Placeholder asset generation complete!');
    console.log(`📁 Assets generated in: ${this.outputDir}`);
    console.log('\n📋 Asset inventory:');
    console.log('  • UI Components: 6 button placeholders');
    console.log('  • Game Sprites: 6 sprite placeholders + sprite atlas');
    console.log('  • Icons: 6 icon placeholders');
    console.log('  • Backgrounds: 4 background placeholders');
    console.log('  • Audio: 6 audio placeholders');
  }

  // Custom asset generation
  generateCustom(type, name, width, height, color, text) {
    const typeDir = path.join(this.outputDir, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    const outputPath = path.join(typeDir, `${name}.png`);
    this.generateRectanglePlaceholder(width, height, color, text, outputPath);
    return outputPath;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const generator = new PlaceholderAssetGenerator();

  if (args.length === 0) {
    generator.generateAll();
    return;
  }

  const command = args[0];

  switch (command) {
    case 'all':
      generator.generateAll();
      break;

    case 'ui':
      generator.generateUI();
      break;

    case 'sprites':
      generator.generateGameSprites();
      break;

    case 'icons':
      generator.generateIcons();
      break;

    case 'backgrounds':
      generator.generateBackgrounds();
      break;

    case 'atlas':
      generator.generateSpriteAtlas();
      break;

    case 'audio':
      generator.generateAudioPlaceholders();
      break;

    case 'custom': {
      if (args.length < 7) {
        console.error('Usage: node generate-placeholder-assets.js custom <type> <name> <width> <height> <color> <text>');
        console.error('Example: node generate-placeholder-assets.js custom ui my-button 150 50 "#4CAF50" "CLICK ME"');
        process.exit(1);
      }
      const [, type, name, width, height, color, text] = args;
      const outputPath = generator.generateCustom(type, name, parseInt(width), parseInt(height), color, text);
      console.log(`Generated custom asset: ${outputPath}`);
      break;
    }

    case 'help':
    case '--help':
    case '-h':
      console.log(`
🎨 Air Knight Placeholder Asset Generator

Usage:
  node generate-placeholder-assets.js [command]

Commands:
  all         Generate all placeholder assets (default)
  ui          Generate UI button placeholders
  sprites     Generate game sprite placeholders
  icons       Generate icon placeholders  
  backgrounds Generate background placeholders
  atlas       Generate sprite atlas placeholder
  audio       Generate audio placeholders
  custom      Generate custom asset
  help        Show this help message

Custom Asset Usage:
  node generate-placeholder-assets.js custom <type> <name> <width> <height> <color> <text>

Examples:
  node generate-placeholder-assets.js
  node generate-placeholder-assets.js ui
  node generate-placeholder-assets.js custom ui big-button 300 100 "#FF5722" "BIG BUTTON"

Note: For PNG generation, install canvas: npm install canvas
      Otherwise, SVG fallbacks will be generated.
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run with --help for usage information');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PlaceholderAssetGenerator;