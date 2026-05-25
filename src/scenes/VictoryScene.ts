// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Victory Scene
// Final screen after Zone 3 completion.
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { ASSET_KEYS } from '../assets/assetManifest';
import { GameState } from '../game/state/GameState';
import { AudioSystem } from '../systems/AudioSystem';

export class VictoryScene extends Phaser.Scene {
  private tokens: number = 0;
  private scrolls: number = 0;

  constructor() {
    super({ key: SCENE_KEYS.VICTORY });
  }

  init(data: { tokens?: number; scrolls?: number }): void {
    this.tokens = data.tokens ?? 0;
    this.scrolls = data.scrolls ?? 0;
  }

  create(): void {
    const state = GameState.getInstance();
    AudioSystem.playVictory();

    this.buildBackground();
    this.buildBeaconEffect();
    this.buildTitle();
    this.buildMissionMessage();
    this.buildStats();
    this.buildButtons();
    this.buildCredits();
  }

  private buildBackground(): void {
    // Zone 3 as epic background
    if (this.textures.exists(ASSET_KEYS.ZONE3_BLANK)) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.ZONE3_BLANK);
      bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      bg.setAlpha(0.3);
    } else {
      const bg = this.add.graphics();
      bg.fillStyle(0x080410, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    for (let i = 0; i < 80; i++) {
      const g = this.add.graphics();
      g.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.3, 1));
      g.fillCircle(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, 320), Phaser.Math.FloatBetween(0.5, 2));
      this.tweens.add({
        targets: g,
        alpha: { from: Phaser.Math.FloatBetween(0.2, 0.8), to: 0.1 },
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true,
        repeat: -1,
        delay: i * 60,
      });
    }
  }

  private buildBeaconEffect(): void {
    // Beacon light pillar
    const beam = this.add.graphics();
    beam.fillStyle(0xFFFFAA, 0.08);
    beam.fillRect(GAME_WIDTH / 2 - 60, 0, 120, GAME_HEIGHT);
    beam.fillStyle(0xFFFFAA, 0.12);
    beam.fillRect(GAME_WIDTH / 2 - 30, 0, 60, GAME_HEIGHT);

    // Pulsing orb
    const orb = this.add.graphics();
    orb.fillStyle(0xFFFF88, 0.9);
    orb.fillCircle(GAME_WIDTH / 2, 90, 40);
    orb.fillStyle(0xFFFFBB, 0.7);
    orb.fillCircle(GAME_WIDTH / 2, 90, 28);
    orb.fillStyle(0xFFFFFF, 0.9);
    orb.fillCircle(GAME_WIDTH / 2, 90, 14);

    this.tweens.add({
      targets: orb,
      scaleX: { from: 1, to: 1.2, yoyo: true },
      scaleY: { from: 1, to: 1.2, yoyo: true },
      alpha: { from: 1, to: 0.7, yoyo: true },
      duration: 1500,
      repeat: -1,
    });

    // Rings emanating from orb
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 400, () => {
        const ring = this.add.graphics();
        ring.lineStyle(2, 0xFFFFAA, 0.7);
        ring.strokeCircle(GAME_WIDTH / 2, 90, 10);
        this.tweens.add({
          targets: ring,
          scaleX: 8,
          scaleY: 8,
          alpha: 0,
          duration: 1800,
          repeat: -1,
          repeatDelay: 1600,
        });
      });
    }
  }

  private buildTitle(): void {
    const title = this.add.text(GAME_WIDTH / 2, 150, 'CORE BEACON ACTIVATED', {
      fontSize: '38px',
      color: '#FFD700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#443300',
      strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, duration: 1200, ease: 'Power2', delay: 300 });

    const sub = this.add.text(GAME_WIDTH / 2, 198, 'MISSION COMPLETE', {
      fontSize: '18px',
      color: '#00FFCC',
      fontFamily: 'monospace',
      letterSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: sub, alpha: 1, duration: 800, delay: 800 });
  }

  private buildMissionMessage(): void {
    const message = [
      '"The Core is for everyone.',
      'We fight not just for access —',
      'but for a future where every voice can build."',
    ];

    const msgY = 240;
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.6);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 400, msgY - 8, 800, 80, 8);
    panel.lineStyle(1, 0xFFD700, 0.3);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 400, msgY - 8, 800, 80, 8);

    message.forEach((line, i) => {
      const t = this.add.text(GAME_WIDTH / 2, msgY + i * 24, line, {
        fontSize: '14px',
        color: '#ccddee',
        fontFamily: 'monospace',
        fontStyle: 'italic',
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 0.9, duration: 800, delay: 1200 + i * 200 });
    });
  }

  private buildStats(): void {
    const statsY = 350;

    const panel = this.add.graphics();
    panel.fillStyle(0x0a0e1c, 0.85);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 280, statsY - 10, 560, 140, 10);
    panel.lineStyle(1, COLORS.UI_BORDER, 0.5);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 280, statsY - 10, 560, 140, 10);

    this.add.text(GAME_WIDTH / 2, statsY + 10, 'MISSION STATS', {
      fontSize: '13px',
      color: '#446688',
      fontFamily: 'monospace',
      letterSpacing: 3,
    }).setOrigin(0.5);

    const stats = [
      { label: 'Access Tokens Collected', value: `${this.tokens}`, color: '#FFD700' },
      { label: 'AI Literacy Scrolls Found', value: `${this.scrolls}`, color: '#AADDFF' },
      { label: 'Zones Liberated', value: '3 / 3', color: '#00FF88' },
    ];

    stats.forEach((s, i) => {
      const sy = statsY + 36 + i * 30;
      this.add.text(GAME_WIDTH / 2 - 200, sy, s.label, {
        fontSize: '14px',
        color: '#889aaa',
        fontFamily: 'monospace',
      });
      const val = this.add.text(GAME_WIDTH / 2 + 180, sy, s.value, {
        fontSize: '14px',
        color: s.color,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(1, 0).setAlpha(0);
      this.tweens.add({ targets: val, alpha: 1, duration: 400, delay: 1800 + i * 200 });
    });
  }

  private buildButtons(): void {
    const btns = [
      {
        label: '↺ PLAY AGAIN',
        color: '#F5A623',
        action: () => {
          AudioSystem.playMenuSelect();
          const state = GameState.getInstance();
          state.startLevel('zone1');
          this.scene.start(SCENE_KEYS.WORLD_MAP);
        },
      },
      {
        label: '⌂ MAIN MENU',
        color: '#4A90D9',
        action: () => {
          AudioSystem.playMenuSelect();
          this.scene.start(SCENE_KEYS.MAIN_MENU);
        },
      },
    ];

    btns.forEach((btn, i) => {
      const bx = GAME_WIDTH / 2 - 120 + i * 240;
      const by = GAME_HEIGHT - 90;

      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x1A3A5C, 0.8);
      btnBg.fillRoundedRect(bx - 90, by - 20, 180, 40, 8);
      btnBg.lineStyle(2, i === 0 ? 0xF5A623 : 0x4A90D9, 0.7);
      btnBg.strokeRoundedRect(bx - 90, by - 20, 180, 40, 8);
      btnBg.setAlpha(0);
      this.tweens.add({ targets: btnBg, alpha: 1, duration: 500, delay: 2200 + i * 200 });

      const btnText = this.add.text(bx, by, btn.label, {
        fontSize: '16px',
        color: btn.color,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

      this.tweens.add({ targets: btnText, alpha: 1, duration: 500, delay: 2200 + i * 200 });

      btnText.on('pointerover', () => { btnText.setScale(1.06); AudioSystem.playMenuSelect(); });
      btnText.on('pointerout', () => btnText.setScale(1));
      btnText.on('pointerup', btn.action);
    });
  }

  private buildCredits(): void {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'CIVIC CORE: DIGITAL CHAMPIONS  ·  Community · Code · Equity', {
      fontSize: '10px',
      color: '#334455',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }
}
