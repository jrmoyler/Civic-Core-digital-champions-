// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Main Menu Scene
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { ASSET_KEYS } from '../assets/assetManifest';
import { AudioSystem } from '../systems/AudioSystem';

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
    this.buildBackground();
    this.buildTitle();
    this.buildMenu();
    this.buildCreditsBar();
    this.buildVersionInfo();
  }

  private buildBackground(): void {
    // Use Zone 1 blank map as atmospheric background
    if (this.textures.exists(ASSET_KEYS.ZONE1_BLANK)) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.ZONE1_BLANK);
      bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      bg.setAlpha(0.35);
    }

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Hero sheet showcase (right side)
    if (this.textures.exists(ASSET_KEYS.HEROES_SHEET)) {
      const heroes = this.add.image(GAME_WIDTH - 240, GAME_HEIGHT / 2 - 30, ASSET_KEYS.HEROES_SHEET);
      heroes.setDisplaySize(380, 260);
      heroes.setAlpha(0.6);

      // Animate heroes in
      heroes.setX(GAME_WIDTH + 200);
      this.tweens.add({
        targets: heroes,
        x: GAME_WIDTH - 240,
        duration: 1200,
        ease: 'Power2',
        delay: 300,
      });
    }

    // Grid overlay decoration
    const grid = this.add.graphics();
    grid.lineStyle(1, COLORS.UI_ACCENT, 0.06);
    for (let x = 0; x < GAME_WIDTH; x += 80) {
      grid.strokeRect(x, 0, 0, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 80) {
      grid.strokeRect(0, y, GAME_WIDTH, 0);
    }
  }

  private buildTitle(): void {
    // Tagline
    const tagLine = this.add.text(80, 52, 'COMMUNITY · CODE · EQUITY', {
      fontSize: '12px',
      color: '#4A90D9',
      fontFamily: 'monospace',
      letterSpacing: 3,
    });
    tagLine.setAlpha(0);
    this.tweens.add({ targets: tagLine, alpha: 0.9, duration: 800, delay: 600 });

    // Main title
    const title1 = this.add.text(80, 80, 'CIVIC CORE', {
      fontSize: '72px',
      color: '#4A90D9',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#001133',
      strokeThickness: 6,
    });
    title1.setAlpha(0);
    this.tweens.add({ targets: title1, alpha: 1, duration: 800, delay: 200 });

    // Subtitle
    const title2 = this.add.text(80, 160, 'DIGITAL CHAMPIONS', {
      fontSize: '30px',
      color: '#F5A623',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      letterSpacing: 4,
    });
    title2.setAlpha(0);
    this.tweens.add({ targets: title2, alpha: 1, duration: 800, delay: 400 });

    // Separator line
    const sep = this.add.graphics();
    sep.lineStyle(2, COLORS.UI_ACCENT, 0.5);
    sep.strokeRect(80, 198, 500, 0);
    sep.setAlpha(0);
    this.tweens.add({ targets: sep, alpha: 1, duration: 600, delay: 700 });

    // Lore tagline
    const lore = this.add.text(80, 210, 'The Core is for everyone.', {
      fontSize: '14px',
      color: '#7799aa',
      fontFamily: 'monospace',
      fontStyle: 'italic',
    });
    lore.setAlpha(0);
    this.tweens.add({ targets: lore, alpha: 0.8, duration: 800, delay: 800 });
  }

  private buildMenu(): void {
    const menuItems = [
      { label: '▶  PLAY', key: 'play' },
      { label: '⚔  SELECT HERO', key: 'character' },
      { label: '🗺  WORLD MAP', key: 'map' },
      { label: '📚  ASSET GALLERY / CODEX', key: 'gallery' },
      { label: '⚙  CONTROLS', key: 'controls' },
    ];

    const startY = 290;
    const spacing = 52;

    menuItems.forEach((item, i) => {
      const y = startY + i * spacing;

      const bg = this.add.graphics();
      bg.fillStyle(COLORS.UI_PRIMARY, 0.7);
      bg.fillRoundedRect(72, y - 18, 300, 38, 6);
      bg.setAlpha(0);

      const text = this.add.text(90, y, item.label, {
        fontSize: '18px',
        color: '#c8ddf0',
        fontFamily: 'monospace',
      });
      text.setOrigin(0, 0.5);
      text.setAlpha(0);

      this.tweens.add({
        targets: [bg, text],
        alpha: 1,
        x: `+=0`,
        duration: 500,
        delay: 600 + i * 100,
      });

      // Hover zone
      const zone = this.add.zone(220, y, 300, 38).setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(COLORS.UI_ACCENT, 0.5);
        bg.fillRoundedRect(72, y - 18, 300, 38, 6);
        text.setColor('#ffffff');
        text.setX(94);
        AudioSystem.playMenuSelect();
      });

      zone.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(COLORS.UI_PRIMARY, 0.7);
        bg.fillRoundedRect(72, y - 18, 300, 38, 6);
        text.setColor('#c8ddf0');
        text.setX(90);
      });

      zone.on('pointerup', () => {
        this.handleMenuClick(item.key);
      });
    });

    // Touch-to-start hint
    const hint = this.add.text(80, 590, 'Press SPACE or tap to start', {
      fontSize: '13px',
      color: '#446688',
      fontFamily: 'monospace',
    });
    this.tweens.add({
      targets: hint,
      alpha: { from: 0.3, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    // Keyboard shortcut — space starts game
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.handleMenuClick('play');
    });
  }

  private handleMenuClick(key: string): void {
    AudioSystem.playMenuSelect();

    switch (key) {
      case 'play':
        this.scene.start(SCENE_KEYS.CHAR_SELECT);
        break;
      case 'character':
        this.scene.start(SCENE_KEYS.CHAR_SELECT);
        break;
      case 'map':
        this.scene.start(SCENE_KEYS.WORLD_MAP);
        break;
      case 'gallery':
        this.scene.start(SCENE_KEYS.GALLERY);
        break;
      case 'controls':
        this.showControls();
        break;
    }
  }

  private showControls(): void {
    const panel = this.add.graphics();
    panel.fillStyle(0x000011, 0.92);
    panel.fillRoundedRect(200, 80, 880, 560, 12);
    panel.lineStyle(2, COLORS.UI_ACCENT, 0.8);
    panel.strokeRoundedRect(200, 80, 880, 560, 12);

    const controlLines = [
      'KEYBOARD CONTROLS',
      '',
      'A / ← Arrow       Move Left',
      'D / → Arrow       Move Right',
      'W / Space / ↑     Jump',
      'J / Left Click    Attack',
      'K / Shift         Civic Ability',
      'P / Esc           Pause',
      'M                 World Map',
      'G                 Debug Collision Overlay',
      'R                 Restart Level',
      '',
      'MOBILE CONTROLS',
      '',
      'Left side         Virtual Joystick',
      'Bottom right      JUMP / ATTACK / ABILITY buttons',
      'Top right         Pause',
      '',
      'Click anywhere to close',
    ];

    const texts: Phaser.GameObjects.Text[] = [];
    controlLines.forEach((line, i) => {
      const isHeader = line.toUpperCase() === line && line.length > 0 && !line.includes('/');
      const t = this.add.text(240, 110 + i * 26, line, {
        fontSize: isHeader ? '16px' : '14px',
        color: isHeader ? '#F5A623' : '#c8ddf0',
        fontFamily: 'monospace',
        fontStyle: isHeader ? 'bold' : 'normal',
      });
      texts.push(t);
    });

    const dismiss = (): void => {
      panel.destroy();
      texts.forEach(t => t.destroy());
    };

    this.input.once('pointerdown', dismiss);
    this.input.keyboard?.once('keydown', dismiss);
  }

  private buildCreditsBar(): void {
    const bar = this.add.graphics();
    bar.fillStyle(0x000000, 0.6);
    bar.fillRect(0, GAME_HEIGHT - 36, GAME_WIDTH, 36);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, 'CIVIC CORE: DIGITAL CHAMPIONS  |  Build the Future · Protect the Core', {
      fontSize: '11px',
      color: '#334455',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);
  }

  private buildVersionInfo(): void {
    this.add.text(GAME_WIDTH - 16, 16, 'v1.0', {
      fontSize: '11px',
      color: '#334455',
      fontFamily: 'monospace',
    }).setOrigin(1, 0);

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
