import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { ASSET_KEYS } from '../assets/assetManifest';
import { AudioSystem } from '../systems/AudioSystem';
import { GameState } from '../game/state/GameState';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MAIN_MENU });
  }

  create(): void {
    // Reset camera to prevent bleed-over from LevelScene's startFollow/setBounds.
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.resetFX();
    this.cameras.main.removeBounds(); // clear any bounds set by LevelScene

    AudioSystem.unlock();
    // Pixel art handled by game config

    // Render the exact final title screen image
    if (this.textures.exists(ASSET_KEYS.TITLE_SCREEN)) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.TITLE_SCREEN);

      // Calculate display scale preserving aspect ratio
      const sourceWidth = bg.width || 1672;
      const sourceHeight = bg.height || 941;
      const scaleX = GAME_WIDTH / sourceWidth;
      const scaleY = GAME_HEIGHT / sourceHeight;
      const scale = Math.min(scaleX, scaleY);

      bg.setScale(scale);
      bg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

      // Hover highlight graphics layer — created AFTER bg so it renders on top
      const hoverGraphics = this.add.graphics();

      this.buildInvisibleButtons(bg, sourceWidth, sourceHeight, hoverGraphics);
    } else {
      // Fallback if missing
      this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, 'TITLE SCREEN MISSING', { color: '#f00' }).setOrigin(0.5);
    }

    this.buildVersionInfo();
  }

  private createImageButtonFromSourceRect(
    image: Phaser.GameObjects.Image,
    sourceWidth: number,
    sourceHeight: number,
    rect: { x: number; y: number; width: number; height: number },
    callback: () => void,
    hoverGraphics: Phaser.GameObjects.Graphics | null,
    debug: boolean = false
  ): Phaser.GameObjects.Zone {
    const scale = image.scale;

    // Convert source rect to display coordinates relative to image center
    // Image origin is 0.5, 0.5. Top-left of image in world coords:
    const imgLeft = image.x - (sourceWidth * scale) / 2;
    const imgTop = image.y - (sourceHeight * scale) / 2;

    const zoneX = imgLeft + (rect.x + rect.width / 2) * scale;
    const zoneY = imgTop + (rect.y + rect.height / 2) * scale;
    const zoneW = rect.width * scale;
    const zoneH = rect.height * scale;

    const zone = this.add.zone(zoneX, zoneY, zoneW, zoneH).setInteractive({ useHandCursor: true });

    // Fire callback on pointerdown for reliable touch/mobile response.
    // Use a flag to prevent pointerup from double-firing.
    let firedOnDown = false;

    zone.on('pointerdown', () => {
      firedOnDown = true;
      AudioSystem.playMenuSelect();
      callback();
    });

    zone.on('pointerup', () => {
      if (firedOnDown) {
        firedOnDown = false;
        return;
      }
      AudioSystem.playMenuSelect();
      callback();
    });

    // Hover highlight for main nav buttons (hoverGraphics supplied for those 4 only)
    if (hoverGraphics) {
      const drawHighlight = (): void => {
        hoverGraphics.clear();
        hoverGraphics.fillStyle(0xffd700, 0.35); // semi-transparent gold
        const cornerRadius = 8;
        hoverGraphics.fillRoundedRect(
          zoneX - zoneW / 2,
          zoneY - zoneH / 2,
          zoneW,
          zoneH,
          cornerRadius
        );
      };

      const clearHighlight = (): void => {
        hoverGraphics.clear();
      };

      zone.on('pointerover', drawHighlight);
      zone.on('pointerout', clearHighlight);
    }

    if (debug) {
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xff0000, 0.5);
      graphics.strokeRect(zoneX - zoneW/2, zoneY - zoneH/2, zoneW, zoneH);
    }

    return zone;
  }

  private buildInvisibleButtons(
    bg: Phaser.GameObjects.Image,
    w: number,
    h: number,
    hoverGraphics: Phaser.GameObjects.Graphics
  ): void {
    const DEBUG_ZONES = false;

    // PLAY — hover highlight enabled
    this.createImageButtonFromSourceRect(bg, w, h, { x: 58, y: 697, width: 444-58, height: 810-697 }, () => {
      const state = GameState.getInstance();
      if (!state.selectedHero) {
        this.scene.start(SCENE_KEYS.CHAR_SELECT);
      } else {
        this.scene.start(SCENE_KEYS.WORLD_MAP);
      }
    }, hoverGraphics, DEBUG_ZONES);

    // CHARACTER SELECT — hover highlight enabled
    this.createImageButtonFromSourceRect(bg, w, h, { x: 489, y: 697, width: 817-489, height: 810-697 }, () => {
      this.scene.start(SCENE_KEYS.CHAR_SELECT);
    }, hoverGraphics, DEBUG_ZONES);

    // WORLD MAP — hover highlight enabled
    this.createImageButtonFromSourceRect(bg, w, h, { x: 852, y: 697, width: 1169-852, height: 810-697 }, () => {
      this.scene.start(SCENE_KEYS.WORLD_MAP);
    }, hoverGraphics, DEBUG_ZONES);

    // CODEX — hover highlight enabled
    this.createImageButtonFromSourceRect(bg, w, h, { x: 1202, y: 697, width: 1550-1202, height: 810-697 }, () => {
      this.scene.start(SCENE_KEYS.GALLERY);
    }, hoverGraphics, DEBUG_ZONES);

    // SETTINGS — no hover highlight
    this.createImageButtonFromSourceRect(bg, w, h, { x: 1315, y: 24, width: 1412-1315, height: 111-24 }, () => {
      this.showToast("Settings coming soon");
    }, null, DEBUG_ZONES);

    // ACHIEVEMENTS — no hover highlight
    this.createImageButtonFromSourceRect(bg, w, h, { x: 1430, y: 24, width: 1537-1430, height: 111-24 }, () => {
      this.showToast("Achievements coming soon");
    }, null, DEBUG_ZONES);

    // NEWS — no hover highlight
    this.createImageButtonFromSourceRect(bg, w, h, { x: 1550, y: 24, width: 1645-1550, height: 111-24 }, () => {
      this.showToast("News feed coming soon");
    }, null, DEBUG_ZONES);
  }

  private showToast(message: string): void {
    const toast = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, message, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: GAME_HEIGHT - 80,
      duration: 1500,
      delay: 1000,
      onComplete: () => toast.destroy()
    });
  }

  private buildVersionInfo(): void {
    // Mute button
    const muteBtn = this.add.text(GAME_WIDTH - 16, 36, '🔊', {
      fontSize: '18px',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    muteBtn.on('pointerup', () => {
      AudioSystem.setMuted(!AudioSystem.isMuted());
      muteBtn.setText(AudioSystem.isMuted() ? '🔇' : '🔊');
    });
  }
}
