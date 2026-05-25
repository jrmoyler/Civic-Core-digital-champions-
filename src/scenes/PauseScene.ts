// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Pause Scene
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { AudioSystem } from '../systems/AudioSystem';
import type { ZoneId } from '../game/types';

export class PauseScene extends Phaser.Scene {
  private zoneId!: ZoneId;

  constructor() {
    super({ key: SCENE_KEYS.PAUSE });
  }

  init(data: { zoneId: ZoneId }): void {
    this.zoneId = data.zoneId ?? 'zone1';
  }

  create(): void {
    // Dimmed overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Panel
    const pW = 400, pH = 380;
    const px = (GAME_WIDTH - pW) / 2;
    const py = (GAME_HEIGHT - pH) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(COLORS.UI_SECONDARY, 0.96);
    panel.fillRoundedRect(px, py, pW, pH, 14);
    panel.lineStyle(2, COLORS.UI_ACCENT, 0.8);
    panel.strokeRoundedRect(px, py, pW, pH, 14);

    // Title
    this.add.text(GAME_WIDTH / 2, py + 36, 'PAUSED', {
      fontSize: '32px',
      color: '#F5A623',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      letterSpacing: 6,
    }).setOrigin(0.5);

    // Separator
    const sep = this.add.graphics();
    sep.lineStyle(1, COLORS.UI_BORDER, 0.5);
    sep.strokeRect(px + 40, py + 60, pW - 80, 0);

    // Mission objectives
    this.add.text(GAME_WIDTH / 2, py + 80, 'MISSION OBJECTIVES', {
      fontSize: '12px',
      color: '#4A90D9',
      fontFamily: 'monospace',
      letterSpacing: 2,
    }).setOrigin(0.5);

    const objectives = [
      '✓ Protect the Core',
      '✓ Defeat all enemies',
      '✓ Collect 3 Access Tokens',
    ];
    objectives.forEach((obj, i) => {
      this.add.text(px + 56, py + 100 + i * 20, obj, {
        fontSize: '12px',
        color: '#778899',
        fontFamily: 'monospace',
      });
    });

    // Menu items
    const menuItems = [
      { label: '▶ RESUME', action: () => this.resume() },
      { label: '↺ RESTART LEVEL', action: () => this.restartLevel() },
      { label: '🗺 WORLD MAP', action: () => this.goWorldMap() },
      { label: '⌂ MAIN MENU', action: () => this.goMainMenu() },
    ];

    const menuStartY = py + 178;
    const menuSpacing = 50;

    menuItems.forEach((item, i) => {
      const my = menuStartY + i * menuSpacing;

      const btn = this.add.text(GAME_WIDTH / 2, my, item.label, {
        fontSize: '18px',
        color: '#c8ddf0',
        fontFamily: 'monospace',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => {
        btn.setColor('#ffffff');
        btn.setScale(1.06);
        AudioSystem.playMenuSelect();
      });
      btn.on('pointerout', () => {
        btn.setColor('#c8ddf0');
        btn.setScale(1);
      });
      btn.on('pointerup', () => {
        AudioSystem.playMenuSelect();
        item.action();
      });
    });

    // Keyboard resume
    this.input.keyboard?.once('keydown-ESC', () => this.resume());
    this.input.keyboard?.once('keydown-P', () => this.resume());
    this.input.keyboard?.once('keydown-SPACE', () => this.resume());

    // Controls hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'ESC / P — Resume  |  R — Restart  |  M — Map', {
      fontSize: '12px',
      color: '#334455',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private resume(): void {
    this.scene.stop();
    const levelScene = this.scene.get(SCENE_KEYS.LEVEL);
    if (levelScene) levelScene.scene.resume();
  }

  private restartLevel(): void {
    this.scene.stop();
    const levelScene = this.scene.get(SCENE_KEYS.LEVEL);
    if (levelScene) {
      levelScene.scene.stop(SCENE_KEYS.HUD);
      levelScene.scene.start(SCENE_KEYS.LEVEL, { zoneId: this.zoneId });
    }
  }

  private goWorldMap(): void {
    this.scene.stop();
    const levelScene = this.scene.get(SCENE_KEYS.LEVEL);
    if (levelScene) {
      levelScene.scene.stop(SCENE_KEYS.HUD);
      levelScene.scene.stop();
    }
    this.scene.start(SCENE_KEYS.WORLD_MAP);
  }

  private goMainMenu(): void {
    this.scene.stop();
    const levelScene = this.scene.get(SCENE_KEYS.LEVEL);
    if (levelScene) {
      levelScene.scene.stop(SCENE_KEYS.HUD);
      levelScene.scene.stop();
    }
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }
}
