// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Game Over Scene
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { GameState } from '../game/state/GameState';
import { AudioSystem } from '../systems/AudioSystem';
import type { ZoneId } from '../game/types';

export class GameOverScene extends Phaser.Scene {
  private zoneId!: ZoneId;

  constructor() {
    super({ key: SCENE_KEYS.GAME_OVER });
  }

  init(data: { zoneId: ZoneId }): void {
    this.zoneId = data.zoneId ?? 'zone1';
  }

  create(): void {
    const state = GameState.getInstance();

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0000, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Particles
    for (let i = 0; i < 40; i++) {
      const g = this.add.graphics();
      g.fillStyle(0x440000, 0.4);
      const size = Phaser.Math.Between(2, 6);
      g.fillRect(0, 0, size, size);
      g.setPosition(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT));
      this.tweens.add({
        targets: g,
        y: `-=${Phaser.Math.Between(100, 300)}`,
        alpha: 0,
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
        delay: i * 120,
      });
    }

    // GAME OVER text
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 140, 'SIGNAL LOST', {
      fontSize: '64px',
      color: '#FF4444',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#440000',
      strokeThickness: 6,
    }).setOrigin(0.5);
    title.setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 800, ease: 'Power2' });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'The Core needs you.', {
      fontSize: '18px',
      color: '#886644',
      fontFamily: 'monospace',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Stats
    const statsY = GAME_HEIGHT / 2 - 30;
    this.add.text(GAME_WIDTH / 2, statsY, `Tokens Collected: ${state.tokensCollected}`, {
      fontSize: '16px',
      color: '#F5A623',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const hasCheckpoint = state.lastCheckpoint?.zoneId === this.zoneId;
    const checkpointText = hasCheckpoint ? '✓ Checkpoint available' : '✗ No checkpoint — restart from beginning';
    this.add.text(GAME_WIDTH / 2, statsY + 28, checkpointText, {
      fontSize: '13px',
      color: hasCheckpoint ? '#00CC66' : '#886644',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Buttons
    const buttons = [
      {
        label: hasCheckpoint ? '↺ RETRY FROM CHECKPOINT' : '↺ RETRY LEVEL',
        color: '#00CC66',
        action: () => {
          AudioSystem.playMenuSelect();
          this.scene.start(SCENE_KEYS.LEVEL, { zoneId: this.zoneId });
        },
      },
      {
        label: '⟳ RESTART FROM BEGINNING',
        color: '#F5A623',
        action: () => {
          AudioSystem.playMenuSelect();
          state.lastCheckpoint = null;
          this.scene.start(SCENE_KEYS.LEVEL, { zoneId: this.zoneId });
        },
      },
      {
        label: '🗺 WORLD MAP',
        color: '#4A90D9',
        action: () => {
          AudioSystem.playMenuSelect();
          this.scene.start(SCENE_KEYS.WORLD_MAP);
        },
      },
      {
        label: '⌂ MAIN MENU',
        color: '#778899',
        action: () => {
          AudioSystem.playMenuSelect();
          this.scene.start(SCENE_KEYS.MAIN_MENU);
        },
      },
    ];

    const btnStartY = GAME_HEIGHT / 2 + 30;
    const btnSpacing = 56;

    buttons.forEach((btn, i) => {
      const by = btnStartY + i * btnSpacing;
      const text = this.add.text(GAME_WIDTH / 2, by, btn.label, {
        fontSize: '18px',
        color: btn.color,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

      this.tweens.add({
        targets: text,
        alpha: 1,
        duration: 500,
        delay: 800 + i * 120,
      });

      text.on('pointerover', () => { text.setScale(1.08); AudioSystem.playMenuSelect(); });
      text.on('pointerout', () => text.setScale(1));
      text.on('pointerup', btn.action);
    });

    // Auto-focus first button after animation
    this.input.keyboard?.once('keydown-SPACE', () => {
      AudioSystem.playMenuSelect();
      state.lastCheckpoint = null;
      this.scene.start(SCENE_KEYS.LEVEL, { zoneId: this.zoneId });
    });
    this.input.keyboard?.once('keydown-ESC', () => {
      AudioSystem.playMenuSelect();
      this.scene.start(SCENE_KEYS.MAIN_MENU);
    });
  }
}
