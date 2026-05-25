// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Preload Scene
// Loads all assets and generates programmatic textures.
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { ASSETS, ASSET_KEYS } from '../assets/assetManifest';
import { TextureFactory } from '../systems/TextureFactory';
import { SpriteLoader } from '../systems/SpriteLoader';

export class PreloadScene extends Phaser.Scene {
  private loadBar!: Phaser.GameObjects.Graphics;
  private loadBarBg!: Phaser.GameObjects.Graphics;
  private loadText!: Phaser.GameObjects.Text;
  private missingAssets: string[] = [];

  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  preload(): void {
    this.setupLoadingUI();
    this.registerProgressEvents();
    this.loadAllAssets();
  }

  private setupLoadingUI(): void {
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, 'CIVIC CORE', {
      fontSize: '48px',
      color: '#4A90D9',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, 'DIGITAL CHAMPIONS', {
      fontSize: '22px',
      color: '#F5A623',
      fontFamily: 'monospace',
      letterSpacing: 6,
    }).setOrigin(0.5);

    // Loading bar background
    this.loadBarBg = this.add.graphics();
    this.loadBarBg.fillStyle(0x1A3A5C, 0.8);
    this.loadBarBg.fillRoundedRect(GAME_WIDTH / 2 - 260, GAME_HEIGHT / 2 + 20, 520, 24, 6);

    // Loading bar fill
    this.loadBar = this.add.graphics();

    // Loading text
    this.loadText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 'Loading assets...', {
      fontSize: '14px',
      color: '#88aacc',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Progress percentage
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, '', {
      fontSize: '12px',
      color: '#556677',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private registerProgressEvents(): void {
    this.load.on('progress', (value: number) => {
      this.loadBar.clear();
      this.loadBar.fillStyle(COLORS.UI_ACCENT, 0.9);
      this.loadBar.fillRoundedRect(
        GAME_WIDTH / 2 - 258,
        GAME_HEIGHT / 2 + 22,
        514 * value,
        20,
        5
      );
      this.loadText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });

    this.load.on('loaderror', (file: { key: string; url: string }) => {
      console.warn(`[PreloadScene] Failed to load: ${file.key} from ${file.url}`);
      this.missingAssets.push(file.key);
    });
  }

  private loadAllAssets(): void {
    // Load all 11 source images with error safety
    const assetList: Array<{ key: string; path: string }> = [
      { key: ASSET_KEYS.HEROES_SHEET, path: ASSETS.sheets.heroes },
      { key: ASSET_KEYS.ENEMIES_SHEET, path: ASSETS.sheets.enemiesHazards },
      { key: ASSET_KEYS.BOSSES_SHEET, path: ASSETS.sheets.bossesNpcsObjects },
      { key: ASSET_KEYS.ZONE1_TILESET, path: ASSETS.sheets.zone1Tileset },
      { key: ASSET_KEYS.ZONE2_TILESET, path: ASSETS.sheets.zone2Tileset },
      { key: ASSET_KEYS.ZONE3_TILESET, path: ASSETS.sheets.zone3Tileset },
      { key: ASSET_KEYS.UI_HUD, path: ASSETS.sheets.uiHud },
      { key: ASSET_KEYS.COLLECTIBLES_SHEET, path: ASSETS.sheets.collectibles },
      { key: ASSET_KEYS.ZONE1_BLANK, path: ASSETS.screens.zone1Blank },
      { key: ASSET_KEYS.ZONE2_BLANK, path: ASSETS.screens.zone2Blank },
      { key: ASSET_KEYS.ZONE3_BLANK, path: ASSETS.screens.zone3Blank },
    ];

    for (const asset of assetList) {
      try {
        this.load.image(asset.key, asset.path);
      } catch {
        console.warn(`[PreloadScene] Could not queue asset: ${asset.key}`);
        this.missingAssets.push(asset.key);
      }
    }

    // Load all hero, enemy, and boss spritesheets
    SpriteLoader.preload(this);
  }

  create(): void {
    // Generate all programmatic textures
    TextureFactory.generateAll(this);

    // Create all sprite animations from loaded spritesheets
    SpriteLoader.createAnimations(this);

    // Show missing asset warnings if any
    if (this.missingAssets.length > 0) {
      console.warn('[PreloadScene] Missing assets:', this.missingAssets);
      this.loadText.setText(`⚠ ${this.missingAssets.length} assets missing. Game continues.`);
      this.loadText.setColor('#FF8800');
    }

    // Generate fallback placeholder textures for any that failed
    this.generateFallbackTextures();

    // Short delay then move to main menu
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_KEYS.MAIN_MENU);
    });
  }

  private generateFallbackTextures(): void {
    // Create fallback for missing images
    const fallbackKeys = [
      ASSET_KEYS.HEROES_SHEET,
      ASSET_KEYS.ENEMIES_SHEET,
      ASSET_KEYS.BOSSES_SHEET,
      ASSET_KEYS.ZONE1_TILESET,
      ASSET_KEYS.ZONE2_TILESET,
      ASSET_KEYS.ZONE3_TILESET,
      ASSET_KEYS.UI_HUD,
      ASSET_KEYS.COLLECTIBLES_SHEET,
      ASSET_KEYS.ZONE1_BLANK,
      ASSET_KEYS.ZONE2_BLANK,
      ASSET_KEYS.ZONE3_BLANK,
    ];

    const colors: Record<string, number> = {
      [ASSET_KEYS.ZONE1_BLANK]: 0x1a3a6c,
      [ASSET_KEYS.ZONE2_BLANK]: 0x0a2a1a,
      [ASSET_KEYS.ZONE3_BLANK]: 0x2a0a4c,
    };

    for (const key of fallbackKeys) {
      if (!this.textures.exists(key)) {
        const color = colors[key] ?? 0x1A3A5C;
        const g = this.add.graphics();
        g.fillStyle(color, 1);
        g.fillRect(0, 0, 400, 300);
        g.lineStyle(2, 0x4A90D9, 0.5);
        g.strokeRect(1, 1, 398, 298);

        const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
        g.generateTexture(key, 400, 300);
        g.destroy();

        console.warn(`[PreloadScene] Created fallback texture for: ${key}`);
      }
    }
  }
}
