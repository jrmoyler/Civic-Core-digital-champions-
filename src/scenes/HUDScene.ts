// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — HUD Scene
// Overlay scene that runs in parallel with LevelScene.
// Shows health, tokens, ability cooldown, mobile controls.
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTH } from '../game/constants';
import { GameState } from '../game/state/GameState';
import { ASSET_KEYS } from '../assets/assetManifest';

export class HUDScene extends Phaser.Scene {
  private state!: GameState;
  private zoneId!: string;

  // HP bar
  private hpBarBg!: Phaser.GameObjects.Graphics;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private hpMax: number = 100;
  private hpCurrent: number = 100;

  // Token counter
  private tokenText!: Phaser.GameObjects.Text;

  // Ability cooldown ring
  private cooldownRingBg!: Phaser.GameObjects.Graphics;
  private cooldownRingFill!: Phaser.GameObjects.Graphics;
  private cooldownText!: Phaser.GameObjects.Text;

  // Zone indicator
  private zoneText!: Phaser.GameObjects.Text;

  // Pause button
  private pauseBtn!: Phaser.GameObjects.Text;

  // Mobile toggle button
  private touchToggleBtn!: Phaser.GameObjects.Text;

  private readonly BAR_W = 200;
  private readonly BAR_H = 18;
  private readonly BAR_X = 16;
  private readonly BAR_Y = 16;

  constructor() {
    super({ key: SCENE_KEYS.HUD });
  }

  init(data: { zoneId: string }): void {
    this.zoneId = data.zoneId ?? 'zone1';
  }

  create(): void {
    this.state = GameState.getInstance();
    this.buildHPBar();
    this.buildTokenCounter();
    this.buildAbilityCooldown();
    this.buildZoneInfo();
    this.buildPauseButton();
    this.buildMobileToggle();
    this.buildControlsReminder();
  }

  private buildHPBar(): void {
    // Background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.55);
    panel.fillRoundedRect(this.BAR_X - 4, this.BAR_Y - 4, this.BAR_W + 8, this.BAR_H + 8, 6);
    panel.setScrollFactor(0).setDepth(DEPTH.HUD);

    // Portrait
    const heroId = this.state.selectedHero;
    const heroKey = `${heroId}_idle`;
    if (this.textures.exists(heroKey)) {
      const portrait = this.add.image(this.BAR_X + this.BAR_W + 16, this.BAR_Y + this.BAR_H / 2, heroKey);
      portrait.setDisplaySize(28, 38);
      portrait.setScrollFactor(0).setDepth(DEPTH.HUD);
    }

    // HP label
    this.add.text(this.BAR_X, this.BAR_Y - 14, 'HP', {
      fontSize: '10px',
      color: '#aabbcc',
      fontFamily: 'monospace',
    }).setScrollFactor(0).setDepth(DEPTH.HUD);

    // Bar background
    this.hpBarBg = this.add.graphics();
    this.hpBarBg.fillStyle(0x1A3A5C, 0.8);
    this.hpBarBg.fillRoundedRect(this.BAR_X, this.BAR_Y, this.BAR_W, this.BAR_H, 4);
    this.hpBarBg.setScrollFactor(0).setDepth(DEPTH.HUD);

    // Bar fill
    this.hpBarFill = this.add.graphics();
    this.hpBarFill.setScrollFactor(0).setDepth(DEPTH.HUD + 0.5);
    this.drawHPBar(1);

    // HP text
    this.hpText = this.add.text(this.BAR_X + this.BAR_W / 2, this.BAR_Y + this.BAR_H / 2, '', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.hpText.setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(DEPTH.HUD + 1);
  }

  private drawHPBar(ratio: number): void {
    const color = ratio > 0.5 ? COLORS.UI_HEALTH : ratio > 0.25 ? COLORS.UI_HEALTH_MED : COLORS.UI_HEALTH_LOW;
    this.hpBarFill.clear();
    if (ratio > 0) {
      this.hpBarFill.fillStyle(color, 0.9);
      this.hpBarFill.fillRoundedRect(this.BAR_X, this.BAR_Y, this.BAR_W * ratio, this.BAR_H, 4);
    }
  }

  private buildTokenCounter(): void {
    // Token icon
    const tokenIcon = this.add.graphics();
    tokenIcon.fillStyle(COLORS.TOKEN_COLOR, 1);
    tokenIcon.fillCircle(this.BAR_X + this.BAR_W + 60, this.BAR_Y + this.BAR_H + 22, 10);
    tokenIcon.fillStyle(0xFFEE00, 0.6);
    tokenIcon.fillCircle(this.BAR_X + this.BAR_W + 60, this.BAR_Y + this.BAR_H + 22, 7);
    tokenIcon.setScrollFactor(0).setDepth(DEPTH.HUD);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRoundedRect(this.BAR_X - 4, this.BAR_Y + this.BAR_H + 8, 160, 24, 4);
    panel.setScrollFactor(0).setDepth(DEPTH.HUD);

    // Count
    this.tokenText = this.add.text(this.BAR_X + 12, this.BAR_Y + this.BAR_H + 20, '⬡ 0 TOKENS', {
      fontSize: '13px',
      color: '#FFD700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.tokenText.setOrigin(0, 0.5).setScrollFactor(0).setDepth(DEPTH.HUD + 1);
  }

  private buildAbilityCooldown(): void {
    const cx = 98;
    const cy = GAME_HEIGHT - 60;
    const r = 24;

    // Outer ring background
    this.cooldownRingBg = this.add.graphics();
    this.cooldownRingBg.lineStyle(4, 0x1A3A5C, 0.8);
    this.cooldownRingBg.strokeCircle(cx, cy, r);
    this.cooldownRingBg.setScrollFactor(0).setDepth(DEPTH.HUD);

    // Fill ring
    this.cooldownRingFill = this.add.graphics();
    this.cooldownRingFill.setScrollFactor(0).setDepth(DEPTH.HUD + 0.5);
    this.drawCooldownRing(1);

    // Label
    this.add.text(cx, cy + r + 10, 'ABILITY', {
      fontSize: '9px',
      color: '#778899',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH.HUD);

    this.cooldownText = this.add.text(cx, cy, 'CC', {
      fontSize: '10px',
      color: '#aabbcc',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(DEPTH.HUD + 1);

    // Show hero ability indicator
    const heroColors: Record<string, number> = {
      creator: COLORS.CREATOR_PRIMARY,
      coder: COLORS.CODER_PRIMARY,
      advocate: COLORS.ADVOCATE_PRIMARY,
    };
    const heroColor = heroColors[this.state.selectedHero] ?? COLORS.UI_ACCENT;

    const abilityLabel = this.add.text(cx, cy - r - 8, {
      creator: 'IDEA', coder: 'PATCH', advocate: 'BEACON'
    }[this.state.selectedHero] ?? 'ABILITY', {
      fontSize: '8px',
      color: '#' + heroColor.toString(16).padStart(6, '0'),
      fontFamily: 'monospace',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(DEPTH.HUD);
  }

  private drawCooldownRing(fraction: number): void {
    const cx = 98;
    const cy = GAME_HEIGHT - 60;
    const r = 24;

    this.cooldownRingFill.clear();

    if (fraction <= 0) return;

    const color = fraction >= 1 ? 0x00FF88 : COLORS.UI_ACCENT;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * fraction;

    this.cooldownRingFill.lineStyle(4, color, 0.9);
    this.cooldownRingFill.beginPath();
    this.cooldownRingFill.arc(cx, cy, r, startAngle, endAngle, false);
    this.cooldownRingFill.strokePath();
  }

  private buildZoneInfo(): void {
    const zoneNames: Record<string, string> = {
      zone1: 'ZONE 1 — COMMUNITY COMMONS',
      zone2: 'ZONE 2 — PUBLIC ACCESS',
      zone3: 'ZONE 3 — EMPOWERMENT HEIGHTS',
    };

    this.zoneText = this.add.text(GAME_WIDTH / 2, 14, zoneNames[this.zoneId] ?? this.zoneId.toUpperCase(), {
      fontSize: '12px',
      color: '#4A90D9',
      fontFamily: 'monospace',
      letterSpacing: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH.HUD);
  }

  private buildPauseButton(): void {
    this.pauseBtn = this.add.text(GAME_WIDTH - 16, 14, '⏸ PAUSE (P)', {
      fontSize: '13px',
      color: '#445566',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH.HUD).setInteractive({ useHandCursor: true });

    this.pauseBtn.on('pointerover', () => this.pauseBtn.setColor('#88aacc'));
    this.pauseBtn.on('pointerout', () => this.pauseBtn.setColor('#445566'));
    this.pauseBtn.on('pointerup', () => {
      // Signal level scene to pause
      const levelScene = this.scene.get(SCENE_KEYS.LEVEL);
      if (levelScene) {
        levelScene.scene.pause();
        levelScene.scene.launch(SCENE_KEYS.PAUSE, { zoneId: this.zoneId });
      }
    });
  }

  private buildMobileToggle(): void {
    this.touchToggleBtn = this.add.text(GAME_WIDTH - 16, 36, '🎮 TOUCH', {
      fontSize: '12px',
      color: '#334455',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH.HUD).setInteractive({ useHandCursor: true });

    this.touchToggleBtn.on('pointerup', () => {
      // Signal level scene to toggle touch controls
      const levelScene = this.scene.get(SCENE_KEYS.LEVEL);
      if (levelScene) {
        const ls = levelScene as unknown as { touchControls?: { isVisible: () => boolean; setVisible: (v: boolean) => void } };
        if (ls.touchControls) {
          const v = ls.touchControls.isVisible();
          ls.touchControls.setVisible(!v);
          this.touchToggleBtn.setColor(!v ? '#4A90D9' : '#334455');
        }
      }
    });
  }

  private buildControlsReminder(): void {
    // Bottom controls hint (desktop only, fades after 4s)
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, 'ARROWS/WASD: Move  |  J: Attack  |  K: Ability  |  SPACE: Jump  |  G: Debug', {
      fontSize: '10px',
      color: '#2a3a4a',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(DEPTH.HUD);

    this.time.delayedCall(4000, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 1000 });
    });
  }

  // ── Public API called by LevelScene ───────────────────────

  updatePlayerHP(hp: number, max: number): void {
    this.hpMax = max;
    this.hpCurrent = hp;
    const ratio = hp / max;
    this.drawHPBar(ratio);
    this.hpText.setText(`${hp}/${max}`);

    // Pulse on damage
    this.tweens.add({
      targets: this.hpBarFill,
      alpha: { from: 0.5, to: 1 },
      duration: 200,
    });
  }

  updateTokens(count: number): void {
    this.tokenText.setText(`⬡ ${count} TOKENS`);
    // Brief scale pop
    this.tweens.add({
      targets: this.tokenText,
      scaleX: { from: 1.2, to: 1 },
      scaleY: { from: 1.2, to: 1 },
      duration: 200,
    });
  }

  updateAbilityCooldown(fraction: number): void {
    this.drawCooldownRing(fraction);
    this.cooldownText.setText(fraction >= 1 ? '✓' : `${Math.floor(fraction * 100)}%`);
    this.cooldownText.setColor(fraction >= 1 ? '#00FF88' : '#aabbcc');
  }
}
